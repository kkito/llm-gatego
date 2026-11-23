package store

import (
	"testing"
	"time"
)

func TestDatabaseManagerInitAndSchema(t *testing.T) {
	ResetForTest()
	dm := GetDatabaseManager(t.TempDir())
	if err := dm.Initialize(); err != nil { t.Fatal(err) }
	rows, err := dm.GetDB().Query(`PRAGMA table_info(requests)`)
	if err != nil { t.Fatal(err) }
	defer rows.Close()
	count := 0
	for rows.Next() { count++ }
	if count != 24 { t.Fatalf("expected 24 columns, got %d", count) }
	rows.Close()
	rows2, err := dm.GetDB().Query(`SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' AND tbl_name='requests'`)
	if err != nil { t.Fatal(err) }
	defer rows2.Close()
	idxCount := 0
	for rows2.Next() { idxCount++ }
	if idxCount != 5 { t.Fatalf("expected 5 indexes, got %d", idxCount) }
}

func TestRequestLoggerBatchInsertAndDedup(t *testing.T) {
	ResetForTest()
	dm := GetDatabaseManager(t.TempDir())
	if err := dm.Initialize(); err != nil { t.Fatal(err) }
	rl := GetRequestLogger(dm)
	rl.Log(RequestLogEntry{RequestID: "r1", Endpoint: "/v1/messages", StatusCode: 200})
	rl.Log(RequestLogEntry{RequestID: "r1", Endpoint: "/v1/messages", StatusCode: 200, TTFTMs: i(120)})
	rl.Log(RequestLogEntry{RequestID: "r2", Endpoint: "/v1/chat/completions", StatusCode: 500})
	rl.Stop()
	var count int
	if err := dm.GetDB().QueryRow(`SELECT COUNT(*) FROM requests`).Scan(&count); err != nil { t.Fatal(err) }
	if count != 2 { t.Fatalf("expected 2 rows after dedup, got %d", count) }
	var ttft int
	if err := dm.GetDB().QueryRow(`SELECT ttft_ms FROM requests WHERE request_id='r1'`).Scan(&ttft); err != nil { t.Fatal(err) }
	if ttft != 120 { t.Fatalf("last write should win, got %d", ttft) }
}

func i(v int) *int { return &v }

func TestCleanupOldRequests(t *testing.T) {
	ResetForTest()
	dm := GetDatabaseManager(t.TempDir())
	if err := dm.Initialize(); err != nil { t.Fatal(err) }
	old := time.Now().AddDate(0, 0, -100).UnixMilli()
	db := dm.GetDB()
	if _, err := db.Exec(`INSERT INTO requests (request_id, timestamp, created_at) VALUES ('old','x',?)`, old); err != nil { t.Fatal(err) }
	if _, err := db.Exec(`INSERT INTO requests (request_id, timestamp, created_at) VALUES ('new','x',?)`, time.Now().UnixMilli()); err != nil { t.Fatal(err) }
	if err := dm.CleanupOldRequests(90); err != nil { t.Fatal(err) }
	var id string
	if err := db.QueryRow(`SELECT request_id FROM requests`).Scan(&id); err != nil { t.Fatal(err) }
	if id != "new" { t.Fatalf("got %q", id) }
}

func TestSingletonResetOnDirChange(t *testing.T) {
	ResetForTest()
	dir1, dir2 := t.TempDir(), t.TempDir()
	dm1 := GetDatabaseManager(dir1)
	dm2 := GetDatabaseManager(dir2)
	if dm1 == dm2 { t.Fatal("expected new manager for new dir") }
}
