package e2e

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/logger"
	"github.com/kkito/llm-gatego/internal/proxy"
	"github.com/kkito/llm-gatego/internal/server"
	"github.com/kkito/llm-gatego/internal/store"
	"github.com/kkito/llm-gatego/internal/util"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func newServer(t *testing.T, cfg *config.ProxyConfig) *http.ServeMux {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	b, _ := json.Marshal(cfg)
	os.WriteFile(path, b, 0644)
	ctx := config.CreateConfigContext(dir)
	deps := proxy.Dependencies{ConfigGetter: func() *config.ProxyConfig { return cfg }, Logger: logger.NewLogger(ctx.DetailLogDir), DetailLogger: logger.NewDetailLogger(ctx.DetailLogDir, false), Timeout: 5 * time.Second, LogDir: ctx.LogDir}
	mux := http.NewServeMux()
	server.RegisterAdminAPIs(mux, server.APIDeps{ConfigDir: dir, Get: func() *config.ProxyConfig { return cfg }, Update: func(c *config.ProxyConfig) { *cfg = *c }})
	server.RegisterUserAPIs(mux, server.APIDeps{ConfigDir: dir, Get: func() *config.ProxyConfig { return cfg }, Update: func(c *config.ProxyConfig) { *cfg = *c }})
	proxy.RegisterRoutes(mux, deps)
	return mux
}
func call(t *testing.T, mux http.Handler, method, path, body string, h map[string]string) *httptest.ResponseRecorder {
	r := httptest.NewRequest(method, path, strings.NewReader(body))
	for k, v := range h {
		r.Header.Set(k, v)
	}
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, r)
	return w
}
func TestE2EProxyAliases(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		b, _ := io.ReadAll(r.Body)
		var m map[string]any
		json.Unmarshal(b, &m)
		if m["model"] != "real" {
			t.Fatal(m)
		}
		w.Write([]byte(`{"id":"x","choices":[]}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "custom", RealModel: "real", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}}}
	mux := newServer(t, cfg)
	for _, p := range []string{"/chat/completions", "/v1/chat/completions", "/v1/v1/chat/completions", "/messages", "/v1/messages", "/v1/v1/messages", "/responses", "/v1/responses"} {
		w := call(t, mux, "POST", p, `{"model":"custom","messages":[]}`, nil)
		if w.Code != 200 {
			t.Fatal(p, w.Code, w.Body.String())
		}
	}
}
func TestE2EModelGroupFallback(t *testing.T) {
	calls := 0
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		b, _ := io.ReadAll(r.Body)
		var m map[string]any
		json.Unmarshal(b, &m)
		if m["model"] == "r1" {
			w.WriteHeader(429)
			return
		}
		w.Write([]byte(`{"id":"ok","choices":[]}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{
		Models:      []config.ProviderConfig{{CustomModel: "a", RealModel: "r1", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}, {CustomModel: "b", RealModel: "r2", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}},
		ModelGroups: []config.ModelGroup{{Name: "group", Models: []string{"a", "b"}}},
	}
	mux := newServer(t, cfg)
	w := call(t, mux, "POST", "/v1/chat/completions", `{"model":"group"}`, nil)
	if w.Code != 200 || calls != 2 {
		t.Fatal(w.Code, calls, w.Body.String())
	}
}
func TestE2EAdminCRUD(t *testing.T) {
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "r", BaseURL: "http://u", Provider: config.ProviderOpenAI, APIKey: "k"}}}
	mux := newServer(t, cfg)
	w := call(t, mux, "GET", "/api/admin/models", "", nil)
	if !strings.Contains(w.Body.String(), "m1") {
		t.Fatal(w.Body.String())
	}
	w = call(t, mux, "POST", "/api/admin/models/toggle-hidden/m1", "", nil)
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
	w = call(t, mux, "POST", "/api/admin/models/copy/m1", `{"newName":"m2"}`, nil)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if len(cfg.Models) != 2 || !cfg.Models[0].Hidden {
		t.Fatalf("%+v", cfg.Models)
	}
	w = call(t, mux, "POST", "/api/admin/models/delete/m1", "", nil)
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
	if len(cfg.Models) != 1 || cfg.Models[0].CustomModel != "m2" {
		t.Fatal(cfg.Models)
	}
}
func TestE2EDBAndClientIP(t *testing.T) {
	dir := t.TempDir()
	store.ResetForTest()
	dm := store.GetDatabaseManager(dir)
	if err := dm.Initialize(); err != nil {
		t.Fatal(err)
	}
	rl := store.GetRequestLogger(dm)
	rl.Log(store.RequestLogEntry{RequestID: "e2e-1", Timestamp: time.Now().UTC().Format(time.RFC3339), CustomModel: "m", StatusCode: 200, ClientIP: "1.2.3.4", PromptTokens: func() *int { v := 10; return &v }(), TotalTokens: func() *int { v := 10; return &v }()})
	rl.Stop()
	rows, err := dm.QueryRows("", "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].ClientIP != "1.2.3.4" {
		t.Fatal(rows)
	}
	if ip := util.ExtractClientIP(&http.Request{RemoteAddr: "1.1.1.1:1234", Header: http.Header{"X-Forwarded-For": []string{"9.9.9.9, 8.8.8.8"}}}); ip != "9.9.9.9" {
		t.Fatal(ip)
	}
}
func TestE2EStreamingMetrics(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Write([]byte("data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"a\"}}]}\n\ndata: [DONE]\n\n"))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m", RealModel: "r", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}}}
	mux := newServer(t, cfg)
	w := call(t, mux, "POST", "/v1/chat/completions", `{"model":"m","stream":true}`, nil)
	if w.Code != 200 || !strings.Contains(w.Body.String(), "[DONE]") {
		t.Fatal(w.Code, w.Body.String())
	}
}

func TestE2ELegacyFormAliasAndStatsAPI(t *testing.T) {
	dir := t.TempDir()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "r1", BaseURL: "http://x", Provider: config.ProviderOpenAI, APIKey: "k"}}}
	b, _ := json.Marshal(cfg)
	os.WriteFile(filepath.Join(dir, "config.json"), b, 0644)
	mux := server.New(cfg, proxy.Dependencies{}, config.ConfigContext{ConfigDir: dir, ConfigPath: filepath.Join(dir, "config.json")}, server.Options{})
	// Original form POST route must not 404.
	w := call(t, mux, "POST", "/admin/models/toggle-hidden/m1", "", nil)
	if w.Code == http.StatusNotFound { t.Fatal(w.Code, w.Body.String()) }
	// Stats API envelope.
	w = call(t, mux, "GET", "/api/admin/stats", "", nil)
	if w.Code != 200 || !strings.Contains(w.Body.String(), `"ok":true`) { t.Fatal(w.Code, w.Body.String()) }
}
