package shared

import (
	"testing"
)

// Mirrors tests/converters/anthropic/shared/finish-reason.test.ts (13 cases).
func TestMapAnthropicToOpenAIFinishReason(t *testing.T) {
	cases := []struct{ in, want string }{
		{"end_turn", "stop"}, {"tool_use", "tool_calls"}, {"max_tokens", "length"},
		{"stop_sequence", "stop"}, {"", ""}, {"unknown", "stop"},
	}
	for _, c := range cases {
		t.Run("anth2oai_"+c.in, func(t *testing.T) {
			if got := MapAnthropicToOpenAIFinishReason(c.in); got != c.want {
				t.Errorf("got %q want %q", got, c.want)
			}
		})
	}
	// original tests include null and undefined; Go empty string covers both.
	if MapAnthropicToOpenAIFinishReason("") != "" { t.Fatal("empty should map to empty") }
}
func TestMapOpenAIToAnthropicFinishReason(t *testing.T) {
	cases := []struct{ in, want string }{
		{"stop", "end_turn"}, {"length", "max_tokens"}, {"tool_calls", "tool_use"},
		{"content_filter", "stop_sequence"}, {"", ""}, {"unknown", "end_turn"},
	}
	for _, c := range cases {
		t.Run("oai2anth_"+c.in, func(t *testing.T) {
			if got := MapOpenAIToAnthropicFinishReason(c.in); got != c.want {
				t.Errorf("got %q want %q", got, c.want)
			}
		})
	}
}

// Mirrors tests/converters/anthropic/shared/sse-parser.test.ts (15 cases).
func TestParseSSEData(t *testing.T) {
	cases := []struct {
		name  string
		line  string
		want  *ParseResult
	}{
		{"data line", `data: {"type":"text"}`, &ParseResult{Data: map[string]any{"type": "text"}}},
		{"event line", "event: message_start", &ParseResult{Event: "message_start"}},
		{"non SSE", "hello", nil},
		{"empty data", "data: ", nil},
		{"DONE", "data: [DONE]", nil},
		{"comment", ": OPENROUTER PROCESSING", nil},
		{"invalid JSON", "data: {invalid}", nil},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := ParseSSEData(c.line)
			if (got == nil) != (c.want == nil) { t.Fatalf("got %+v want %+v", got, c.want) }
			if got != nil && c.want != nil {
				if got.Event != c.want.Event { t.Errorf("event %q want %q", got.Event, c.want.Event) }
				if c.want.Data != nil {
					wantObj := c.want.Data.(map[string]any)
					gotObj, ok := got.Data.(map[string]any)
					if !ok || gotObj["type"] != wantObj["type"] { t.Errorf("data %+v want %+v", got.Data, c.want.Data) }
				}
			}
		})
	}
}

func TestParseSSEBlock(t *testing.T) {
	t.Run("single event", func(t *testing.T) {
		got := ParseSSEBlock("event: message_start\ndata: {\"type\":\"message_start\"}\n\n")
		if len(got) != 1 || got[0].Event != "message_start" { t.Fatalf("%+v", got) }
	})
	t.Run("data only", func(t *testing.T) {
		got := ParseSSEBlock("data: {\"type\":\"text\"}\n\n")
		if len(got) != 1 || got[0].Event != "" { t.Fatalf("%+v", got) }
	})
	t.Run("multiple events", func(t *testing.T) {
		got := ParseSSEBlock("data: {\"type\":\"a\"}\n\ndata: {\"type\":\"b\"}\n\n")
		if len(got) != 2 { t.Fatalf("%+v", got) }
	})
	t.Run("skip DONE", func(t *testing.T) {
		got := ParseSSEBlock("data: {\"type\":\"text\"}\n\ndata: [DONE]\n\n")
		if len(got) != 1 { t.Fatalf("%+v", got) }
	})
	t.Run("skip comments", func(t *testing.T) {
		got := ParseSSEBlock(": comment\ndata: {\"type\":\"text\"}\n\n")
		if len(got) != 1 { t.Fatalf("%+v", got) }
	})
	t.Run("empty blocks", func(t *testing.T) {
		if len(ParseSSEBlock("")) != 0 || len(ParseSSEBlock("\n\n")) != 0 { t.Fatal("expected empty") }
	})
	t.Run("invalid JSON", func(t *testing.T) {
		if len(ParseSSEBlock("data: {invalid json}\n\n")) != 0 { t.Fatal("expected empty") }
	})
	t.Run("full Anthropic stream", func(t *testing.T) {
		block := "event: message_start\ndata: {\"type\":\"message_start\",\"message\":{\"id\":\"msg_1\"}}\n\n" +
			"event: content_block_delta\ndata: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"Hello\"}}\n\n" +
			"event: message_stop\ndata: {\"type\":\"message_stop\"}\n\n"
		got := ParseSSEBlock(block)
		if len(got) != 3 { t.Fatalf("%+v", got) }
		if got[0].Event != "message_start" || got[1].Event != "content_block_delta" || got[2].Event != "message_stop" { t.Fatalf("%+v", got) }
		delta := got[1].Data.(map[string]any)["delta"].(map[string]any)
		if delta["text"] != "Hello" { t.Fatalf("%+v", delta) }
	})
}
