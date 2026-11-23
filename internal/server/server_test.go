package server

import (
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/proxy"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestServerAssembly(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"models":[]}`), 0644)
	h := New(&config.ProxyConfig{}, proxy.Dependencies{}, config.ConfigContext{ConfigDir: dir}, Options{})
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("GET", "/health", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), "ok") {
		t.Fatal(w.Code, w.Body.String())
	}
	w = httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("GET", "/", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), "LLM GateGo") {
		t.Fatal(w.Code, w.Body.String())
	}
	w = httptest.NewRecorder()
	req := httptest.NewRequest("OPTIONS", "/api/admin/models", nil)
	h.ServeHTTP(w, req)
	if w.Code != 204 {
		t.Fatal(w.Code)
	}
	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Fatal("no CORS")
	}
	w = httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("GET", "/v1/models", nil))
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("GET", "/api/unknown", nil))
	if w.Code != 404 {
		t.Fatal(w.Code)
	}
}
