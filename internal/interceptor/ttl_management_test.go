package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
	"testing"
)

// Mirrors ttl-management.test.ts (12 cases).
func TestTTLManagement(t *testing.T) {
	ctx := func(path string) *Context { return &Context{Provider: &config.ProviderConfig{}, RequestPath: path} }
	req := func(b map[string]any) *UpstreamRequest {
		return &UpstreamRequest{URL: "https://api.anthropic.com/v1/messages", Headers: map[string]string{}, Body: b}
	}
	ephemeral := map[string]any{"type": "ephemeral"}
	t.Run("detect main", func(t *testing.T) {
		if DetectRequestType([]any{map[string]any{"type": "text", "text": "hello"}}) != "main" {
			t.Fatal("wrong")
		}
	})
	t.Run("detect subagent", func(t *testing.T) {
		if DetectRequestType([]any{map[string]any{"type": "text", "text": AgentSDKPrefix + " more"}}) != "subagent" {
			t.Fatal("wrong")
		}
	})
	t.Run("detect non-array", func(t *testing.T) {
		if DetectRequestType(nil) != "main" {
			t.Fatal("wrong")
		}
	})
	t.Run("inject ttl", func(t *testing.T) {
		out := asMap(InjectTTL(map[string]any{"type": "text", "cache_control": ephemeral}, "1h"))
		if asMap(out["cache_control"])["ttl"] != "1h" {
			t.Fatal(out)
		}
	})
	t.Run("no cache control", func(t *testing.T) {
		b := map[string]any{"type": "text"}
		if _, ok := asMap(InjectTTL(b, "1h"))["cache_control"]; ok {
			t.Fatal("changed")
		}
	})
	t.Run("non-ephemeral", func(t *testing.T) {
		b := map[string]any{"cache_control": map[string]any{"type": "a"}}
		if _, ok := asMap(asMap(InjectTTL(b, "1h"))["cache_control"])["ttl"]; ok {
			t.Fatal("ttl added")
		}
	})
	t.Run("already has ttl", func(t *testing.T) {
		b := map[string]any{"cache_control": map[string]any{"type": "ephemeral", "ttl": "5m"}}
		if v := asMap(asMap(InjectTTL(b, "1h"))["cache_control"])["ttl"]; v != "5m" {
			t.Fatalf("ttl changed: %v", v)
		}
	})
	t.Run("inject system and messages", func(t *testing.T) {
		b := map[string]any{"system": []any{map[string]any{"type": "text", "cache_control": ephemeral}}, "messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "cache_control": ephemeral}}}}}
		got, _ := TTLManagement(req(b), ctx("/v1/messages"))
		if asMap(asMap(asSlice(got.Body["system"])[0])["cache_control"])["ttl"] != "1h" {
			t.Fatal(got.Body)
		}
	})
	t.Run("skip path", func(t *testing.T) {
		r := req(map[string]any{"messages": []any{}})
		got, _ := TTLManagement(r, ctx("/v1/chat/completions"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("skip no body fields", func(t *testing.T) {
		r := req(map[string]any{})
		got, _ := TTLManagement(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("string system", func(t *testing.T) {
		r := req(map[string]any{"system": "some text", "messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "cache_control": ephemeral}}}}})
		got, _ := TTLManagement(r, ctx("/v1/messages"))
		cc := asMap(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])[0])["cache_control"]
		if asMap(cc)["ttl"] != "1h" {
			t.Fatal(got.Body)
		}
	})
	t.Run("no double inject", func(t *testing.T) {
		cc := map[string]any{"type": "ephemeral", "ttl": "5m"}
		b := map[string]any{"system": []any{map[string]any{"type": "text", "cache_control": cc}}}
		got, _ := TTLManagement(req(b), ctx("/v1/messages"))
		if asMap(asMap(asSlice(got.Body["system"])[0])["cache_control"])["ttl"] != "5m" {
			t.Fatal("overwritten")
		}
	})
}
