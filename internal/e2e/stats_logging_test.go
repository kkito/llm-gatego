package e2e

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/proxy"
	"github.com/kkito/llm-gatego/internal/server"
	"github.com/kkito/llm-gatego/internal/store"
)

func TestE2EProxyRequestWritesStats(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"id":"x","choices":[{"message":{"content":"OK"}}],"usage":{"prompt_tokens":1,"completion_tokens":2,"total_tokens":3}}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "r1", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}}}
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	b, _ := json.Marshal(cfg)
	if err := os.WriteFile(path, b, 0600); err != nil {
		t.Fatal(err)
	}
	dm := store.GetDatabaseManager(dir)
	if err := dm.Initialize(); err != nil {
		t.Fatal(err)
	}
	deps := proxy.Dependencies{ConfigGetter: func() *config.ProxyConfig { return cfg }, Timeout: time.Second, RequestLogger: store.GetRequestLogger(dm)}
	mux := server.New(cfg, deps, config.ConfigContext{ConfigDir: dir, ConfigPath: path}, server.Options{})
	req := httptest.NewRequest("POST", "/v1/chat/completions", strings.NewReader(`{"model":"m1","messages":[{"role":"user","content":"hi"}]}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	time.Sleep(300 * time.Millisecond)
	var stats map[string]any
	req = httptest.NewRequest("GET", "/api/admin/stats?startDate="+time.Now().UTC().Format("2006-01-02")+"&endDate="+time.Now().UTC().Format("2006-01-02"), nil)
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if err := json.Unmarshal(w.Body.Bytes(), &stats); err != nil {
		t.Fatal(err)
	}
	data, _ := stats["data"].(map[string]any)
	if data == nil || data["totalRequests"] == nil || data["totalRequests"] == float64(0) {
		t.Fatalf("stats missing requests: %s", w.Body.String())
	}
}
