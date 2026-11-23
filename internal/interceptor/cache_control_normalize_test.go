package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
	"testing"
)

// Mirrors cache-control-normalize.test.ts (14 cases).
func TestCacheControlNormalize(t *testing.T) {
	body := func(msgs []any) map[string]any { return map[string]any{"messages": msgs} }
	user := func(blocks ...any) map[string]any { return map[string]any{"role": "user", "content": blocks} }
	ctx := func(path string) *Context { return &Context{Provider: &config.ProviderConfig{}, RequestPath: path} }
	req := func(b map[string]any) *UpstreamRequest {
		return &UpstreamRequest{URL: "https://api.anthropic.com/v1/messages", Headers: map[string]string{}, Body: b}
	}
	t.Run("strip single block", func(t *testing.T) {
		m := user(map[string]any{"type": "text", "text": "a", "cache_control": map[string]any{"type": "ephemeral"}})
		if c := stripCacheControlMarkers(m); c != 1 {
			t.Fatal(c)
		}
		if _, ok := asMap(asSlice(m["content"])[0])["cache_control"]; ok {
			t.Fatal(m)
		}
	})
	t.Run("strip multiple blocks", func(t *testing.T) {
		m := user(map[string]any{"type": "text", "text": "a", "cache_control": 1}, map[string]any{"type": "text", "text": "b"})
		if c := stripCacheControlMarkers(m); c != 1 {
			t.Fatal(c)
		}
	})
	t.Run("skip non-user", func(t *testing.T) {
		m := map[string]any{"role": "assistant", "content": []any{map[string]any{"type": "text", "cache_control": 1}}}
		if c := stripCacheControlMarkers(m); c != 0 {
			t.Fatal(c)
		}
	})
	t.Run("skip no content array", func(t *testing.T) {
		m := map[string]any{"role": "user", "content": "text"}
		if c := stripCacheControlMarkers(m); c != 0 {
			t.Fatal(c)
		}
	})
	t.Run("count markers", func(t *testing.T) {
		b := body([]any{user(map[string]any{"cache_control": 1}, map[string]any{"cache_control": 2}), map[string]any{"role": "assistant", "content": []any{map[string]any{"cache_control": 3}}}})
		if c := CountUserCacheControlMarkers(b); c != 2 {
			t.Fatal(c)
		}
	})
	t.Run("count zero", func(t *testing.T) {
		if c := CountUserCacheControlMarkers(body([]any{user(map[string]any{"type": "text"})})); c != 0 {
			t.Fatal(c)
		}
		if c := CountUserCacheControlMarkers(map[string]any{}); c != 0 {
			t.Fatal(c)
		}
	})
	t.Run("full normalization", func(t *testing.T) {
		b := body([]any{user(map[string]any{"type": "text", "text": "a", "cache_control": map[string]any{"type": "ephemeral"}}), user(map[string]any{"type": "text", "text": "b", "cache_control": map[string]any{"type": "ephemeral"}})})
		got, err := CacheControlNormalize(req(b), ctx("/v1/messages"))
		if err != nil {
			t.Fatal(err)
		}
		msgs := asSlice(got.Body["messages"])
		if _, ok := asMap(asSlice(asMap(msgs[0])["content"])[0])["cache_control"]; ok {
			t.Fatal("first not stripped")
		}
		cc := asMap(asSlice(asMap(msgs[1])["content"])[0])["cache_control"]
		if asMap(cc)["type"] != "ephemeral" {
			t.Fatal(cc)
		}
	})
	t.Run("skip no markers", func(t *testing.T) {
		r := req(body([]any{user(map[string]any{"type": "text"})}))
		got, _ := CacheControlNormalize(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("skip non-anthropic path", func(t *testing.T) {
		r := req(body([]any{user(map[string]any{"cache_control": 1})}))
		got, _ := CacheControlNormalize(r, ctx("/v1/chat/completions"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("empty messages", func(t *testing.T) {
		r := req(body([]any{}))
		got, _ := CacheControlNormalize(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("no messages", func(t *testing.T) {
		r := req(map[string]any{})
		got, _ := CacheControlNormalize(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
}
