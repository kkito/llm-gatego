package proxy

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/interceptor"
	"github.com/kkito/llm-gatego/internal/logger"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func deps(t *testing.T, cfg *config.ProxyConfig) Dependencies {
	return Dependencies{ConfigGetter: func() *config.ProxyConfig { return cfg }, Logger: logger.NewLogger(t.TempDir()), DetailLogger: logger.NewDetailLogger(t.TempDir(), false), Timeout: 5 * time.Second, LogDir: t.TempDir()}
}
func TestMissingModelReturns400(t *testing.T) {
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{}}
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps(t, cfg))
	for _, p := range []string{"/v1/messages", "/v1/chat/completions", "/v1/responses"} {
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, httptest.NewRequest("POST", p, strings.NewReader(`{}`)))
		if w.Code != 400 {
			t.Fatal(p, w.Code, w.Body.String())
		}
	}
}
func TestHealthAndModels(t *testing.T) {
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "gpt-4o", BaseURL: "http://up", Provider: config.ProviderOpenAI, APIKey: "sk-x"}}}
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps(t, cfg))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("GET", "/health", nil))
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
	w = httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("GET", "/v1/models", nil))
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
	var out map[string]any
	json.Unmarshal(w.Body.Bytes(), &out)
	if len(out["data"].([]any)) != 1 {
		t.Fatal(out)
	}
}
func TestRouteAliases(t *testing.T) {
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "gpt-4o", BaseURL: "http://up", Provider: config.ProviderOpenAI, APIKey: "sk-x"}}}
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps(t, cfg))
	for _, p := range []string{"/chat/completions", "/v1/chat/completions", "/v1/v1/chat/completions", "/messages", "/v1/messages", "/v1/v1/messages", "/responses", "/v1/responses"} {
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, httptest.NewRequest("POST", p, strings.NewReader(`{"model":"m1"}`)))
		if w.Code == 404 {
			t.Fatal(p, "not registered")
		}
	}
}
func TestProxyPassthroughChat(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer sk-real" {
			t.Fatal("bad key", r.Header)
		}
		b, _ := io.ReadAll(r.Body)
		var body map[string]any
		json.Unmarshal(b, &body)
		if body["model"] != "gpt-4o" {
			t.Fatal(body)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"id":"c1","object":"chat.completion","model":"gpt-4o","choices":[{"index":0,"message":{"role":"assistant","content":"hi"},"finish_reason":"stop"}],"usage":{"prompt_tokens":2,"completion_tokens":1,"total_tokens":3}}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "gpt-4o", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "$$KEY$$"}}, ApiKeys: []config.ApiKey{{ID: "1", Name: "KEY", Key: "sk-real"}}}
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps(t, cfg))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("POST", "/v1/chat/completions", strings.NewReader(`{"model":"m1","messages":[{"role":"user","content":"hello"}]}`)))
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var out map[string]any
	json.Unmarshal(w.Body.Bytes(), &out)
	if out["id"] != "c1" {
		t.Fatal(out)
	}
}
func TestProxyAnthropicConversion(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/messages" {
			t.Fatal(r.URL.Path)
		}
		if r.Header.Get("x-api-key") != "sk-ant" {
			t.Fatal(r.Header)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"id":"msg_1","type":"message","role":"assistant","model":"claude","content":[{"type":"text","text":"ok"}],"stop_reason":"end_turn","usage":{"input_tokens":5,"output_tokens":2}}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "claude", RealModel: "claude-3", BaseURL: up.URL, Provider: config.ProviderAnthropic, APIKey: "sk-ant"}}}
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps(t, cfg))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("POST", "/v1/chat/completions", strings.NewReader(`{"model":"claude","messages":[{"role":"user","content":"hello"}]}`)))
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var out map[string]any
	json.Unmarshal(w.Body.Bytes(), &out)
	choices := out["choices"].([]any)
	if len(choices) == 0 {
		t.Fatal(out)
	}
}
func TestProxyFallback429(t *testing.T) {
	calls := 0
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.WriteHeader(429)
		w.Write([]byte(`{"error":"rate"}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{
		{CustomModel: "m1", RealModel: "r1", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k1"},
		{CustomModel: "m1", RealModel: "r2", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k2"},
	}}
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps(t, cfg))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("POST", "/v1/chat/completions", strings.NewReader(`{"model":"m1"}`)))
	if calls != 2 {
		t.Fatal("calls", calls)
	}
	if w.Code != 429 {
		t.Fatal(w.Code, w.Body.String())
	}
}
func TestProxyStreaming(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Write([]byte("data: {\"id\":\"c\",\"object\":\"chat.completion.chunk\",\"model\":\"g\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"hi\"},\"finish_reason\":null}]}\n\n"))
		w.Write([]byte("data: {\"id\":\"c\",\"object\":\"chat.completion.chunk\",\"model\":\"g\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}]}\n\ndata: [DONE]\n\n"))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m", RealModel: "g", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}}}
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps(t, cfg))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("POST", "/v1/chat/completions", strings.NewReader(`{"model":"m","stream":true}`)))
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), "data:") || !strings.Contains(w.Body.String(), "[DONE]") {
		t.Fatal(w.Body.String())
	}
}
func TestInterceptorApplied(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("x-test") != "yes" {
			t.Fatal("interceptor missing")
		}
		w.Write([]byte(`{"id":"ok"}`))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m", RealModel: "g", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}}}
	d := deps(t, cfg)
	d.Interceptors = interceptor.NewManager()
	d.Interceptors.Use(func(req *interceptor.UpstreamRequest, ictx *interceptor.Context) (*interceptor.UpstreamRequest, error) {
		req.Headers["x-test"] = "yes"
		return req, nil
	})
	mux := http.NewServeMux()
	RegisterRoutes(mux, d)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("POST", "/v1/chat/completions", strings.NewReader(`{"model":"m"}`)))
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
}
func TestUpstreamTimeout(t *testing.T) {
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(100 * time.Millisecond)
		w.Write([]byte("{}"))
	}))
	defer up.Close()
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m", RealModel: "g", BaseURL: up.URL, Provider: config.ProviderOpenAI, APIKey: "k"}}}
	d := deps(t, cfg)
	d.Timeout = 10 * time.Millisecond
	mux := http.NewServeMux()
	RegisterRoutes(mux, d)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("POST", "/v1/chat/completions", strings.NewReader(`{"model":"m"}`)))
	if w.Code != 502 && w.Code != 504 {
		t.Fatal(w.Code, w.Body.String())
	}
}
