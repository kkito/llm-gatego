package stats

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/store"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAggregate(t *testing.T) {
	i := func(v int) *int { return &v }
	f := func(v float64) *float64 { return &v }
	rows := []store.RequestLogEntry{
		{RequestID: "1", Timestamp: time.Date(2026, 1, 1, 1, 0, 0, 0, time.UTC).Format(time.RFC3339), CustomModel: "gpt-4", RealModel: "gpt-4o", UserName: "Alice", StatusCode: 200, DurationMs: 100, PromptTokens: i(100), CompletionTokens: i(50), TotalTokens: i(150), CachedTokens: i(10), TTFTMs: i(100), TPS: f(50)},
		{RequestID: "2", Timestamp: time.Date(2026, 1, 2, 1, 0, 0, 0, time.UTC).Format(time.RFC3339), CustomModel: "gpt-4", UserName: "Bob", StatusCode: 500, ErrorMessage: "boom", DurationMs: 300, PromptTokens: i(20), CompletionTokens: i(10), TotalTokens: i(30)},
	}
	s := Aggregate(rows, map[string][2]float64{"gpt-4o": {1, 2}})
	if s.Summary.TotalRequests != 2 || s.Summary.TotalTokens != 180 || s.Summary.Errors != 1 {
		t.Fatalf("%+v", s.Summary)
	}
	if s.Summary.AvgTTFT != 100 || s.Summary.AvgTPS != 50 || s.Summary.AvgDuration != 200 {
		t.Fatalf("%+v", s.Summary)
	}
	if s.Summary.Cost != 0.0002 {
		t.Fatal(s.Summary.Cost)
	}
	if len(s.ByModel) != 1 || s.ByModel[0].Requests != 2 || s.ByModel[0].Errors != 1 {
		t.Fatal(s.ByModel)
	}
	if len(s.ByUser) != 2 || s.ByUser[0].User != "Alice" || len(s.ByDate) != 2 || s.ByDate[0].Date != "2026-01-01" {
		t.Fatal(s.ByUser, s.ByDate)
	}
	if len(Aggregate(nil, nil).ByModel) != 0 {
		t.Fatal("empty")
	}
}
func TestStatsAPI(t *testing.T) {
	dir := t.TempDir()
	store.ResetForTest()
	dm := store.GetDatabaseManager(dir)
	if err := dm.Initialize(); err != nil {
		t.Fatal(err)
	}
	mux := http.NewServeMux()
	RegisterRoutes(mux, dir)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("GET", "/api/stats", nil))
	if w.Code != http.StatusOK {
		t.Fatal(w.Code)
	}
	var out map[string]any
	if json.Unmarshal(w.Body.Bytes(), &out) != nil {
		t.Fatal(w.Body.String())
	}
	if out["ok"] != true {
		t.Fatal(out)
	}
}
