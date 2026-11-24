package server

import (
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/proxy"
	"net/http/httptest"
	"os"
	"path/filepath"
	"regexp"
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
	if w.Code != 200 || !strings.Contains(w.Body.String(), "LLM Gateway") {
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

func TestViewRoutesServeShell(t *testing.T) {
	cfgDir := t.TempDir()
	h := New(&config.ProxyConfig{}, proxy.Dependencies{}, config.ConfigContext{ConfigDir: cfgDir}, Options{})
	for _, p := range []string{"/admin/models", "/admin/stats", "/user/main", "/user/stats", "/admin/login"} {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", p, nil))
		if w.Code != 200 || !strings.Contains(w.Body.String(), "<gw-app>") || !strings.Contains(w.Body.String(), "/assets/") {
			t.Fatal(p, w.Code, w.Body.String())
		}
	}
}

func TestLegacyFormAlias(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"models":[]}`), 0644)
	h := New(&config.ProxyConfig{}, proxy.Dependencies{}, config.ConfigContext{ConfigDir: dir}, Options{})
	w := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/admin/models/delete/nope", nil)
	h.ServeHTTP(w, req)
	if w.Code == 404 {
		t.Fatal("legacy alias unexpectedly 404")
	}
}

func TestAssetsServed(t *testing.T) {
	mux := New(&config.ProxyConfig{}, proxy.Dependencies{}, config.ConfigContext{}, Options{})
	shell := httptest.NewRecorder()
	mux.ServeHTTP(shell, httptest.NewRequest("GET", "/", nil))
	asset := regexp.MustCompile(`/assets/[^"']+\.js`).FindString(shell.Body.String())
	if asset == "" {
		t.Fatalf("no JS asset found in shell: %s", shell.Body.String())
	}
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("GET", asset, nil))
	if w.Code != 200 { t.Fatal(w.Code, w.Body.String()) }
}
