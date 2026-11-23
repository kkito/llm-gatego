package server

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kkito/llm-gatego/internal/config"
)

func TestModelTestCallsUpstream(t *testing.T) {
	var gotBody string
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		b, _ := io.ReadAll(r.Body)
		gotBody = string(b)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"model":"r","choices":[{"message":{"content":"Hi","reasoning_content":"think"}}],"usage":{"prompt_tokens":3,"completion_tokens":5}}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{}
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"models":[]}`), 0644)
	d := APIDeps{ConfigDir: dir, Get: func() *config.ProxyConfig { return cfg }}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/admin/models/test", func(w http.ResponseWriter, r *http.Request) { handleModelTest(w, r, d) })
	body := map[string]any{"provider": "openai", "baseUrl": up.URL, "apiKey": "sk-test", "realModel": "r", "message": "Q", "defaultParams": map[string]any{"temperature": 0.7}}
	b, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/api/admin/models/test", strings.NewReader(string(b)))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var env map[string]any
	json.Unmarshal(w.Body.Bytes(), &env)
	out, _ := env["data"].(map[string]any)
	if out["success"] != true || out["content"] != "Hi" || out["reasoningContent"] != "think" {
		t.Fatal(out)
	}
	if !strings.Contains(gotBody, `"temperature":0.7`) || !strings.Contains(gotBody, `"content":"Q"`) {
		t.Fatal(gotBody)
	}
}
