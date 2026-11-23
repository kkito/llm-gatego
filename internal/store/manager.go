package store

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

//go:generate echo migrations are embedded via os.ReadFile at runtime

type DatabaseManager struct {
	dir      string
	db       *sql.DB
	initOnce sync.Once
	initErr  error
}

var (
	dmMu       sync.Mutex
	dmInstance *DatabaseManager
	embedFS    func(string) ([]byte, error)
)

// SetMigrationFS injects a migration reader (used by embed in production, os.ReadFile in dev).
func SetMigrationFS(fn func(string) ([]byte, error)) { embedFS = fn }

func GetDatabaseManager(dir string) *DatabaseManager {
	dmMu.Lock()
	defer dmMu.Unlock()
	if dmInstance != nil && dmInstance.dir == dir {
		return dmInstance
	}
	if dmInstance != nil && dmInstance.db != nil {
		dmInstance.db.Close()
	}
	dmInstance = &DatabaseManager{dir: dir}
	return dmInstance
}

func (dm *DatabaseManager) Initialize() error {
	dm.initOnce.Do(func() {
		if err := os.MkdirAll(dm.dir, 0755); err != nil {
			dm.initErr = err
			return
		}
		path := filepath.Join(dm.dir, "gateway.db")
		dsn := "file:" + path + "?_pragma=journal_mode(WAL)&_pragma=synchronous(NORMAL)&_pragma=busy_timeout(5000)"
		db, err := sql.Open("sqlite", dsn)
		if err != nil {
			dm.initErr = err
			return
		}
		db.SetMaxOpenConns(1)
		dm.db = db
		if err := dm.runMigrations(); err != nil {
			dm.initErr = err
		}
	})
	return dm.initErr
}

func (dm *DatabaseManager) runMigrations() error {
	if _, err := dm.db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)`); err != nil {
		return err
	}
	var applied int
	if err := dm.db.QueryRow(`SELECT COUNT(*) FROM schema_migrations WHERE version=1`).Scan(&applied); err != nil {
		return err
	}
	if applied > 0 {
		return nil
	}
	data, err := readMigration("0001_create_requests.sql")
	if err != nil {
		return fmt.Errorf("read migration: %w", err)
	}
	tx, err := dm.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(string(data)); err != nil {
		return fmt.Errorf("apply migration: %w", err)
	}
	if _, err := tx.Exec(`INSERT INTO schema_migrations(version, applied_at) VALUES (1, ?)`, timeNowMilli()); err != nil {
		return err
	}
	return tx.Commit()
}

func readMigration(name string) ([]byte, error) {
	if embedFS != nil {
		return embedFS(name)
	}
	return os.ReadFile(filepath.Join("..", "..", "migrations", name))
}

func (dm *DatabaseManager) GetDB() *sql.DB { return dm.db }

func (dm *DatabaseManager) Close() {
	if dm.db != nil {
		dm.db.Close()
		dm.db = nil
	}
}

func (dm *DatabaseManager) CleanupOldRequests(days int) error {
	cutoff := timeNowMilli() - int64(days)*24*60*60*1000
	_, err := dm.db.Exec(`DELETE FROM requests WHERE created_at < ?`, cutoff)
	return err
}

func ResetForTest() {
	dmMu.Lock()
	defer dmMu.Unlock()
	if dmInstance != nil && dmInstance.db != nil {
		dmInstance.db.Close()
	}
	dmInstance = nil
	ResetRequestLoggerForTest()
}

func timeNowMilli() int64 { return time.Now().UnixMilli() }

// QueryRows returns request log rows in the given time range (RFC3339 or empty for all).
func (dm *DatabaseManager) QueryRows(from, to string, limit int) ([]RequestLogEntry, error) {
	if err := dm.Initialize(); err != nil {
		return nil, err
	}
	q := `SELECT request_id,timestamp,created_at,user_name,client_ip,custom_model,real_model,provider,model_group,actual_model,endpoint,status_code,duration_ms,is_streaming,ttft_ms,tps,prompt_tokens,completion_tokens,total_tokens,cached_tokens,error_message,error_type,response_metadata FROM requests WHERE 1=1`
	args := []any{}
	if from != "" {
		q += ` AND timestamp >= ?`
		args = append(args, from)
	}
	if to != "" {
		q += ` AND timestamp <= ?`
		args = append(args, to)
	}
	q += ` ORDER BY timestamp DESC`
	if limit > 0 {
		q += ` LIMIT ?`
		args = append(args, limit)
	}
	rows, err := dm.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []RequestLogEntry{}
	for rows.Next() {
		var e RequestLogEntry
		var userName, clientIP, customModel, realModel, prov, mg, actual, endpoint, errMsg, errType, metadata sql.NullString
		var stream int
		var ttft, prompt, completion, total, cached sql.NullInt64
		var tps sql.NullFloat64
		if err := rows.Scan(&e.RequestID, &e.Timestamp, &e.CreatedAt, &userName, &clientIP, &customModel, &realModel, &prov, &mg, &actual, &endpoint, &e.StatusCode, &e.DurationMs, &stream, &ttft, &tps, &prompt, &completion, &total, &cached, &errMsg, &errType, &metadata); err != nil {
			return nil, err
		}
		e.UserName = userName.String
		e.ClientIP = clientIP.String
		e.CustomModel = customModel.String
		e.RealModel = realModel.String
		e.Provider = prov.String
		e.ModelGroup = mg.String
		e.ActualModel = actual.String
		e.Endpoint = endpoint.String
		e.ErrorMessage = errMsg.String
		e.ErrorType = errType.String
		e.ResponseMetadata = metadata.String
		e.IsStreaming = stream != 0
		if ttft.Valid {
			v := int(ttft.Int64)
			e.TTFTMs = &v
		}
		if prompt.Valid {
			v := int(prompt.Int64)
			e.PromptTokens = &v
		}
		if completion.Valid {
			v := int(completion.Int64)
			e.CompletionTokens = &v
		}
		if total.Valid {
			v := int(total.Int64)
			e.TotalTokens = &v
		}
		if cached.Valid {
			v := int(cached.Int64)
			e.CachedTokens = &v
		}
		if tps.Valid {
			v := tps.Float64
			e.TPS = &v
		}
		out = append(out, e)
	}
	return out, rows.Err()
}
