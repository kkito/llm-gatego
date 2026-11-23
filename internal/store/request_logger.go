package store

import (
	"database/sql"
	"sync"
	"time"
)

type RequestLogEntry struct {
	RequestID        string
	Timestamp        string
	CreatedAt        int64
	UserName         string
	ClientIP         string
	CustomModel      string
	RealModel        string
	Provider         string
	ModelGroup       string
	ActualModel      string
	Endpoint         string
	StatusCode       int
	DurationMs       int64
	IsStreaming      bool
	TTFTMs           *int
	TPS              *float64
	PromptTokens     *int
	CompletionTokens *int
	TotalTokens      *int
	CachedTokens     *int
	ErrorMessage     string
	ErrorType        string
	ResponseMetadata string
}

type RequestLogger struct {
	mu       sync.Mutex
	queue    []RequestLogEntry
	dm       *DatabaseManager
	ticker   *time.Ticker
	stopCh   chan struct{}
	stopOnce sync.Once
	done     chan struct{}
}

var (
	rlMu       sync.Mutex
	rlInstance *RequestLogger
)

func GetRequestLogger(dm *DatabaseManager) *RequestLogger {
	rlMu.Lock()
	defer rlMu.Unlock()
	if rlInstance != nil && rlInstance.dm == dm {
		return rlInstance
	}
	if rlInstance != nil {
		rlInstance.Stop()
	}
	rl := &RequestLogger{dm: dm, queue: make([]RequestLogEntry, 0, 500), stopCh: make(chan struct{}), done: make(chan struct{})}
	rl.ticker = time.NewTicker(100 * time.Millisecond)
	go rl.loop()
	rlInstance = rl
	return rl
}

func (rl *RequestLogger) loop() {
	for {
		select {
		case <-rl.ticker.C:
			rl.flush()
		case <-rl.stopCh:
			rl.flush()
			close(rl.done)
			return
		}
	}
}

func (rl *RequestLogger) Log(entry RequestLogEntry) {
	if entry.Timestamp == "" {
		entry.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}
	if entry.CreatedAt == 0 {
		entry.CreatedAt = time.Now().UnixMilli()
	}
	rl.mu.Lock()
	defer rl.mu.Unlock()
	if len(rl.queue) >= 500 {
		rl.queue = rl.queue[1:]
	}
	rl.queue = append(rl.queue, entry)
}

func (rl *RequestLogger) flush() {
	rl.mu.Lock()
	if len(rl.queue) == 0 {
		rl.mu.Unlock()
		return
	}
	batch := rl.queue
	rl.queue = make([]RequestLogEntry, 0, 500)
	rl.mu.Unlock()

	// Keep last write per requestId (aligns with TS map dedup).
	dedup := make(map[string]RequestLogEntry, len(batch))
	for _, e := range batch {
		dedup[e.RequestID] = e
	}
	tx, err := rl.dm.GetDB().Begin()
	if err != nil {
		return
	}
	defer tx.Rollback()
	stmt, err := tx.Prepare(`INSERT INTO requests
		(request_id, timestamp, created_at, user_name, client_ip, custom_model, real_model, provider,
		 model_group, actual_model, endpoint, status_code, duration_ms, is_streaming, ttft_ms, tps,
		 prompt_tokens, completion_tokens, total_tokens, cached_tokens, error_message, error_type, response_metadata)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
		ON CONFLICT(request_id) DO UPDATE SET
		 timestamp=excluded.timestamp, created_at=excluded.created_at, user_name=excluded.user_name,
		 client_ip=excluded.client_ip, custom_model=excluded.custom_model, real_model=excluded.real_model,
		 provider=excluded.provider, model_group=excluded.model_group, actual_model=excluded.actual_model,
		 endpoint=excluded.endpoint, status_code=excluded.status_code, duration_ms=excluded.duration_ms,
		 is_streaming=excluded.is_streaming, ttft_ms=excluded.ttft_ms, tps=excluded.tps,
		 prompt_tokens=excluded.prompt_tokens, completion_tokens=excluded.completion_tokens,
		 total_tokens=excluded.total_tokens, cached_tokens=excluded.cached_tokens,
		 error_message=excluded.error_message, error_type=excluded.error_type, response_metadata=excluded.response_metadata`)
	if err != nil {
		return
	}
	defer stmt.Close()
	for _, e := range dedup {
		_, _ = stmt.Exec(e.RequestID, e.Timestamp, e.CreatedAt, nullStr(e.UserName), nullStr(e.ClientIP),
			nullStr(e.CustomModel), nullStr(e.RealModel), nullStr(e.Provider), nullStr(e.ModelGroup),
			nullStr(e.ActualModel), nullStr(e.Endpoint), e.StatusCode, e.DurationMs, boolToInt(e.IsStreaming),
			e.TTFTMs, e.TPS, e.PromptTokens, e.CompletionTokens, e.TotalTokens, e.CachedTokens,
			nullStr(e.ErrorMessage), nullStr(e.ErrorType), nullStr(e.ResponseMetadata))
	}
	_ = tx.Commit()
}

func (rl *RequestLogger) Stop() {
	rl.stopOnce.Do(func() {
		close(rl.stopCh)
		rl.ticker.Stop()
		<-rl.done
	})
}

func ResetRequestLoggerForTest() {
	rlMu.Lock()
	defer rlMu.Unlock()
	if rlInstance != nil {
		rlInstance.Stop()
	}
	rlInstance = nil
}

func nullStr(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

var _ = sql.ErrNoRows
