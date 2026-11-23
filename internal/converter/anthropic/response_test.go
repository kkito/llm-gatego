package anthropic

import (
	"encoding/json"
	"testing"

	"github.com/kkito/llm-gatego/internal/converter/anthropic/shared"
)

// Mirrors openai-to-anthropic-response.test.ts (4 cases).
func TestAnthropicResponseToChatResponse(t *testing.T) {
	base := func() map[string]any {
		return map[string]any{"id": "msg_123", "type": "message", "role": "assistant",
			"model": "claude-3-5-sonnet-20241022", "stop_sequence": nil,
			"usage": map[string]any{"input_tokens": float64(10), "output_tokens": float64(5)}}
	}
	t.Run("simple text response", func(t *testing.T) {
		r := base(); r["content"] = []any{map[string]any{"type": "text", "text": "Hello, world!"}}; r["stop_reason"] = "end_turn"
		got := AnthropicResponseToChatResponse(r, "")
		if got["id"] != "msg_123" || got["model"] != "claude-3-5-sonnet-20241022" { t.Fatalf("%+v", got) }
		ch := got["choices"].([]any)[0].(map[string]any)
		if ch["message"].(map[string]any)["content"] != "Hello, world!" || ch["finish_reason"] != "stop" { t.Fatalf("%+v", ch) }
		usage, _ := json.Marshal(got["usage"])
		if string(usage) != `{"completion_tokens":5,"prompt_tokens":10,"total_tokens":15}` { t.Fatalf("%s", usage) }
	})
	t.Run("tool_use response", func(t *testing.T) {
		r := base(); r["content"] = []any{map[string]any{"type": "tool_use", "id": "toolu_123", "name": "get_weather", "input": map[string]any{"city": "Beijing"}}}; r["stop_reason"] = "tool_use"
		got := AnthropicResponseToChatResponse(r, "")
		ch := got["choices"].([]any)[0].(map[string]any)
		msg := ch["message"].(map[string]any)
		if msg["content"] != nil || ch["finish_reason"] != "tool_calls" { t.Fatalf("%+v", ch) }
		call := msg["tool_calls"].([]any)[0].(map[string]any)
		fn := call["function"].(map[string]any)
		if call["id"] != "toolu_123" || fn["name"] != "get_weather" || fn["arguments"] != `{"city":"Beijing"}` { t.Fatalf("%+v", call) }
	})
	t.Run("text and tool_use", func(t *testing.T) {
		r := base(); r["content"] = []any{
			map[string]any{"type": "text", "text": "Let me check the weather."},
			map[string]any{"type": "tool_use", "id": "toolu_123", "name": "get_weather", "input": map[string]any{"city": "Beijing"}},
		}; r["stop_reason"] = "tool_use"
		ch := AnthropicResponseToChatResponse(r, "")["choices"].([]any)[0].(map[string]any)
		msg := ch["message"].(map[string]any)
		if msg["content"] != "Let me check the weather." || len(msg["tool_calls"].([]any)) != 1 { t.Fatalf("%+v", msg) }
	})
	t.Run("stop reason mapping", func(t *testing.T) {
		cases := map[string]string{"end_turn":"stop","max_tokens":"length","tool_use":"tool_calls","stop_sequence":"stop"}
		for in, want := range cases {
			r := base(); r["content"] = []any{map[string]any{"type":"text","text":"test"}}; r["stop_reason"] = in
			ch := AnthropicResponseToChatResponse(r, "")["choices"].([]any)[0].(map[string]any)
			if ch["finish_reason"] != want { t.Errorf("%s -> %v want %s", in, ch["finish_reason"], want) }
		}
	})
}

// Mirrors openai-to-anthropic-sse-parsing.test.ts (6 cases) and anthropic-to-openai-sse-parsing.test.ts (10 cases).
func TestSSEParsingMigrated(t *testing.T) {
	t.Run("parses data line", func(t *testing.T) {
		r := shared.ParseSSEData(`data: {"id":"chatcmpl-123"}`)
		if r == nil || asMap(r.Data)["id"] != "chatcmpl-123" { t.Fatalf("%+v", r) }
	})
	t.Run("DONE/empty/non-SSE/invalid", func(t *testing.T) {
		for _, s := range []string{"data: [DONE]", "data: ", "hello", "data: {bad}", "data: {invalid json}"} {
			if shared.ParseSSEData(s) != nil { t.Errorf("%q should be nil", s) }
		}
	})
	t.Run("event prefix", func(t *testing.T) {
		r := shared.ParseSSEData("event: some-event")
		if r == nil || r.Event != "some-event" { t.Fatalf("%+v", r) }
	})
	t.Run("extra whitespace", func(t *testing.T) {
		r := shared.ParseSSEData(`data:   {"type":"content_block_delta","delta":{"text":"Hello"}}   `)
		if r == nil || asMap(asMap(r.Data)["delta"])["text"] != "Hello" { t.Fatalf("%+v", r) }
	})
	t.Run("full Anthropic SSE stream", func(t *testing.T) {
		lines := []string{
			`data: {"type":"message_start","message":{"id":"msg_123"}}`,
			`data: {"type":"content_block_start","index":0,"content_block":{"type":"text"}}`,
			`data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}`,
			`data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" World"}}`,
			`data: {"type":"content_block_stop","index":0}`,
			`data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":10}}`,
			`data: {"type":"message_stop"}`,
		}
		want := []string{"message_start","content_block_start","content_block_delta","content_block_delta","content_block_stop","message_delta","message_stop"}
		for i, line := range lines {
			r := shared.ParseSSEData(line)
			if r == nil || asMap(r.Data)["type"] != want[i] { t.Fatalf("line %d: %+v", i, r) }
		}
	})
	t.Run("comment lines/event prefix/empty data", func(t *testing.T) {
		if got := shared.ParseSSEBlock(": OPENROUTER PROCESSING\n\ndata: {\"type\":\"text\"}\n\n"); len(got) != 1 { t.Fatalf("%+v", got) }
		if got := shared.ParseSSEBlock("event: message_start\ndata: {\"type\":\"message_start\"}\n\n"); len(got) != 1 || got[0].Event != "message_start" { t.Fatalf("%+v", got) }
		if got := shared.ParseSSEBlock("data: \n\n"); len(got) != 0 { t.Fatalf("%+v", got) }
	})
}
