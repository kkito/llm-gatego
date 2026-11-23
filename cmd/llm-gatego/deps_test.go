package main

import (
	"testing"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/interceptor"
)

func TestInterceptorManagerOrder(t *testing.T) {
	m := newInterceptorManager()
	if len(m.Fns()) != 8 {
		t.Fatalf("expected 8 interceptors, got %d", len(m.Fns()))
	}
}

func TestOpencodeSessionInjectionThroughManager(t *testing.T) {
	interceptor.ResetSessionCache()
	m := newInterceptorManager()
	req := &interceptor.UpstreamRequest{
		URL:     "https://api.openai.com/v1/chat/completions",
		Body:    map[string]any{"model": "x", "messages": []any{map[string]any{"role": "user", "content": "hi"}}},
		Headers: map[string]string{},
	}
	ctx := &interceptor.Context{
		Provider:       &config.ProviderConfig{Provider: config.ProviderOpenAI, BaseURL: "https://opencode.ai/v1"},
		RequestHeaders: map[string]string{"x-session-id": "ses-fixed-test-value"},
		ClientIP:       "1.2.3.4",
		CustomModel:    "m",
		RequestID:      "r1",
	}
	out, err := m.Execute(req, ctx)
	if err != nil {
		t.Fatal(err)
	}
	if out.Headers["x-opencode-session"] == "" {
		t.Fatalf("no session header: %#v", out.Headers)
	}
	if out.Body["prompt_cache_key"] == "" {
		t.Fatalf("no prompt_cache_key for openai: %#v", out.Body)
	}
}
