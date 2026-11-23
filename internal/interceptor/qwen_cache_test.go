package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
	"testing"
)

// Mirrors qwen-cache.test.ts (22 cases).
func TestQwenCache(t *testing.T) {
	tools := func(items ...any) []any { return items }
	msgs := func(items ...any) []any { return items }
	t.Run("tools last", func(t *testing.T) {
		out := AddCacheControlToTools(tools(map[string]any{"name": "a"}, map[string]any{"name": "b"}))
		if asMap(asMap(out[1])["cache_control"])["type"] != "ephemeral" {
			t.Fatal(out)
		}
	})
	t.Run("tools nil", func(t *testing.T) {
		if AddCacheControlToTools(nil) != nil {
			t.Fatal("changed")
		}
	})
	t.Run("tools empty", func(t *testing.T) {
		if len(AddCacheControlToTools(tools())) != 0 {
			t.Fatal("changed")
		}
	})
	t.Run("single tool", func(t *testing.T) {
		if len(AddCacheControlToTools(tools(map[string]any{"name": "a"}))) != 1 {
			t.Fatal("changed")
		}
	})
	t.Run("last message array content", func(t *testing.T) {
		out := AddCacheControlToLastMessage(msgs(map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "hi"}}}))
		blk := asMap(asSlice(asMap(out[0])["content"])[0])
		if asMap(blk["cache_control"])["type"] != "ephemeral" {
			t.Fatal(out)
		}
	})
	t.Run("last message string content", func(t *testing.T) {
		out := AddCacheControlToLastMessage(msgs(map[string]any{"role": "user", "content": "hi"}))
		blk := asMap(asSlice(asMap(out[0])["content"])[0])
		if blk["text"] != "hi" {
			t.Fatal(out)
		}
	})
	t.Run("no content", func(t *testing.T) {
		in := msgs(map[string]any{"role": "user"})
		if len(AddCacheControlToLastMessage(in)) != 1 {
			t.Fatal("changed")
		}
	})
	t.Run("messages nil", func(t *testing.T) {
		if AddCacheControlToLastMessage(nil) != nil {
			t.Fatal("changed")
		}
	})
	t.Run("no mutation", func(t *testing.T) {
		in := msgs(map[string]any{"role": "user", "content": "hi"})
		AddCacheControlToLastMessage(in)
		if _, ok := in[0].(map[string]any)["content"].(string); !ok {
			t.Fatal("mutated")
		}
	})
	t.Run("system string content", func(t *testing.T) {
		out := AddCacheControlToSystemMessages(msgs(map[string]any{"role": "system", "content": "prompt"}), 1)
		blk := asMap(asSlice(asMap(out[0])["content"])[0])
		if asMap(blk["cache_control"])["type"] != "ephemeral" {
			t.Fatal(out)
		}
	})
	t.Run("system array last text", func(t *testing.T) {
		out := AddCacheControlToSystemMessages(msgs(map[string]any{"role": "system", "content": []any{map[string]any{"type": "text", "text": "a"}, map[string]any{"type": "text", "text": "b"}}}), 1)
		blk := asMap(asSlice(asMap(out[0])["content"])[1])
		if asMap(blk["cache_control"])["type"] != "ephemeral" {
			t.Fatal(out)
		}
	})
	t.Run("quota 2", func(t *testing.T) {
		out := AddCacheControlToSystemMessages(msgs(map[string]any{"role": "system", "content": "a"}, map[string]any{"role": "system", "content": "b"}, map[string]any{"role": "system", "content": "c"}), 2)
		if _, ok := asMap(out[2])["content"].(string); !ok {
			t.Fatal("third modified")
		}
	})
	t.Run("skip no text blocks", func(t *testing.T) {
		in := msgs(map[string]any{"role": "system", "content": []any{map[string]any{"type": "image"}}})
		out := AddCacheControlToSystemMessages(in, 1)
		if _, ok := asMap(asSlice(asMap(out[0])["content"])[0])["cache_control"]; ok {
			t.Fatal("modified")
		}
	})
	t.Run("skip empty content", func(t *testing.T) {
		in := msgs(map[string]any{"role": "system", "content": []any{}})
		out := AddCacheControlToSystemMessages(in, 1)
		if len(out[0].(map[string]any)["content"].([]any)) != 0 {
			t.Fatal("modified")
		}
	})
	t.Run("system no mutation", func(t *testing.T) {
		in := msgs(map[string]any{"role": "system", "content": "a"})
		AddCacheControlToSystemMessages(in, 1)
		if _, ok := in[0].(map[string]any)["content"].(string); !ok {
			t.Fatal("mutated")
		}
	})
	t.Run("quota 0", func(t *testing.T) {
		in := msgs(map[string]any{"role": "system", "content": "a"})
		out := AddCacheControlToSystemMessages(in, 0)
		if _, ok := asMap(out[0])["content"].(string); !ok {
			t.Fatal("modified")
		}
	})
	t.Run("ensure content array", func(t *testing.T) {
		if len(EnsureContentArray("hi")) != 1 || len(EnsureContentArray([]any{1})) != 1 || EnsureContentArray(42) != nil {
			t.Fatal("bad")
		}
	})
	t.Run("last text block", func(t *testing.T) {
		out := AddCacheControlToLastTextBlock([]any{map[string]any{"type": "text", "text": "a"}, map[string]any{"type": "image"}, map[string]any{"type": "text", "text": "b"}})
		if asMap(asMap(out[2])["cache_control"])["type"] != "ephemeral" {
			t.Fatal(out)
		}
	})
	ctx := func(model string) *Context { return &Context{Provider: &config.ProviderConfig{RealModel: model}} }
	req := func(b map[string]any) *UpstreamRequest {
		return &UpstreamRequest{URL: "u", Headers: map[string]string{}, Body: b}
	}
	t.Run("skip non-qwen", func(t *testing.T) {
		r := req(map[string]any{"messages": msgs(map[string]any{"role": "user", "content": "hi"})})
		got, _ := QwenCache(r, ctx("gpt-4"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("skip no messages", func(t *testing.T) {
		r := req(map[string]any{})
		got, _ := QwenCache(r, ctx("qwen-max"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("skip empty messages", func(t *testing.T) {
		r := req(map[string]any{"messages": msgs()})
		got, _ := QwenCache(r, ctx("Qwen-Max"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("full interceptor", func(t *testing.T) {
		b := map[string]any{"tools": tools(map[string]any{"name": "t"}), "messages": msgs(map[string]any{"role": "system", "content": "prompt"}, map[string]any{"role": "user", "content": "hi"})}
		got, _ := QwenCache(req(b), ctx("qwen-max"))
		if _, ok := asMap(asSlice(got.Body["tools"])[0])["cache_control"]; !ok {
			t.Fatal("no tool cc")
		}
		if _, ok := asMap(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])[0])["cache_control"]; !ok {
			t.Fatal("no system cc")
		}
	})
	t.Run("max 4 marks", func(t *testing.T) {
		b := map[string]any{"tools": tools(map[string]any{"name": "t"}), "messages": msgs(map[string]any{"role": "system", "content": "a"}, map[string]any{"role": "system", "content": "b"}, map[string]any{"role": "system", "content": "c"}, map[string]any{"role": "user", "content": "hi"})}
		got, _ := QwenCache(req(b), ctx("qwen"))
		count := 0
		for _, raw := range asSlice(got.Body["messages"]) {
			for _, blk := range asSlice(asMap(raw)["content"]) {
				if _, ok := asMap(blk)["cache_control"]; ok {
					count++
				}
			}
		}
		for _, raw := range asSlice(got.Body["tools"]) {
			if _, ok := asMap(raw)["cache_control"]; ok {
				count++
			}
		}
		if count != 4 {
			t.Fatalf("count %d", count)
		}
	})
	t.Run("no mutate body", func(t *testing.T) {
		r := req(map[string]any{"messages": msgs(map[string]any{"role": "user", "content": "hi"})})
		QwenCache(r, ctx("qwen"))
		if _, ok := asMap(r.Body["messages"].([]any)[0])["content"].(string); !ok {
			t.Fatal("mutated")
		}
	})
}
