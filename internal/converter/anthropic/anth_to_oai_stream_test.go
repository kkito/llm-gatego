package anthropic

import "testing"

// Mirrors anthropic-to-openai-stream-event.test.ts (19 cases).
func TestAnthToOAIStreamEvents(t *testing.T) {
	c := func(event map[string]any, s *AnthStreamState) map[string]any {
		return AnthEventToOAIChunk(event, "req-1", "claude", s)
	}
	delta := func(chunk map[string]any) map[string]any {
		if chunk == nil { return nil }
		choices := chunk["choices"].([]any)
		return asMap(asMap(choices[0])["delta"])
	}

	t.Run("message_start", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_start","message":map[string]any{"id":"msg_1","usage":map[string]any{"input_tokens":float64(10),"output_tokens":float64(2)}}}, nil)
		if ch["id"] != "msg_1" || delta(ch)["role"] != "assistant" { t.Fatalf("%+v", ch) }
	})
	t.Run("content_block_start text", func(t *testing.T) {
		ch := c(map[string]any{"type":"content_block_start","index":float64(0),"content_block":map[string]any{"type":"text"}}, nil)
		if delta(ch)["content"] != "" { t.Fatalf("%+v", ch) }
	})
	t.Run("text delta", func(t *testing.T) {
		ch := c(map[string]any{"type":"content_block_delta","delta":map[string]any{"type":"text_delta","text":"Hi"}}, nil)
		if delta(ch)["content"] != "Hi" { t.Fatalf("%+v", ch) }
	})
	t.Run("empty text delta", func(t *testing.T) {
		ch := c(map[string]any{"type":"content_block_delta","delta":map[string]any{"type":"text_delta","text":""}}, nil)
		if delta(ch)["content"] != "" { t.Fatalf("%+v", ch) }
	})
	t.Run("content_block_stop", func(t *testing.T) {
		ch := c(map[string]any{"type":"content_block_stop","index":float64(0)}, nil)
		if len(delta(ch)) != 0 { t.Fatalf("%+v", ch) }
	})
	t.Run("message_delta end_turn", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_delta","delta":map[string]any{"stop_reason":"end_turn"}}, nil)
		if asMap(ch["choices"].([]any)[0])["finish_reason"] != "stop" { t.Fatalf("%+v", ch) }
	})
	t.Run("message_delta max_tokens", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_delta","delta":map[string]any{"stop_reason":"max_tokens"}}, nil)
		if asMap(ch["choices"].([]any)[0])["finish_reason"] != "length" { t.Fatalf("%+v", ch) }
	})
	t.Run("message_delta tool_use", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_delta","delta":map[string]any{"stop_reason":"tool_use"}}, nil)
		if asMap(ch["choices"].([]any)[0])["finish_reason"] != "tool_calls" { t.Fatalf("%+v", ch) }
	})
	t.Run("message_stop returns nil", func(t *testing.T) {
		if c(map[string]any{"type":"message_stop"}, nil) != nil { t.Fatal("expected nil") }
	})
	t.Run("unknown event returns nil", func(t *testing.T) {
		if c(map[string]any{"type":"something_else"}, nil) != nil { t.Fatal("expected nil") }
	})
	t.Run("full stream", func(t *testing.T) {
		s := NewAnthStreamState()
		events := []map[string]any{
			{"type":"message_start","message":map[string]any{"id":"m1"}},
			{"type":"content_block_start","index":float64(0),"content_block":map[string]any{"type":"text"}},
			{"type":"content_block_delta","index":float64(0),"delta":map[string]any{"type":"text_delta","text":"Hello"}},
			{"type":"content_block_stop","index":float64(0)},
			{"type":"message_delta","delta":map[string]any{"stop_reason":"end_turn"},"usage":map[string]any{"input_tokens":float64(5),"output_tokens":float64(3)}},
			{"type":"message_stop"},
		}
		var chunks []map[string]any
		for _, e := range events { if ch := c(e, s); ch != nil { chunks = append(chunks, ch) } }
		if len(chunks) != 5 { t.Fatalf("got %d chunks", len(chunks)) }
		if delta(chunks[0])["role"] != "assistant" || delta(chunks[2])["content"] != "Hello" { t.Fatalf("%+v", chunks) }
	})
	t.Run("message_start with usage", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_start","message":map[string]any{"usage":map[string]any{"input_tokens":float64(10),"output_tokens":float64(20)}}}, nil)
		u := asMap(ch["usage"])
		if u["prompt_tokens"]!=10 || u["completion_tokens"]!=20 || u["total_tokens"]!=30 { t.Fatalf("%+v", u) }
	})
	t.Run("message_start without usage", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_start","message":map[string]any{"id":"m"}}, nil)
		if _, ok := ch["usage"]; ok { t.Fatalf("%+v", ch) }
	})
	t.Run("ignores ping", func(t *testing.T) {
		if c(map[string]any{"type":"ping"}, nil) != nil { t.Fatal("expected nil") }
	})
	t.Run("error event", func(t *testing.T) {
		ch := c(map[string]any{"type":"error"}, nil)
		if asMap(ch["choices"].([]any)[0])["finish_reason"] != "error" { t.Fatalf("%+v", ch) }
	})
	t.Run("content_block_start tool_use", func(t *testing.T) {
		ch := c(map[string]any{"type":"content_block_start","index":float64(0),"content_block":map[string]any{
			"type":"tool_use","id":"tu_1","name":"get_weather"}}, nil)
		call := asMap(delta(ch)["tool_calls"].([]any)[0])
		if call["id"] != "tu_1" || asMap(call["function"])["name"] != "get_weather" { t.Fatalf("%+v", call) }
	})
	t.Run("input_json_delta", func(t *testing.T) {
		s := NewAnthStreamState()
		c(map[string]any{"type":"content_block_start","index":float64(0),"content_block":map[string]any{"type":"tool_use","id":"tu_1","name":"f"}}, s)
		ch := c(map[string]any{"type":"content_block_delta","index":float64(0),"delta":map[string]any{"type":"input_json_delta","partial_json":`{"a":`}}, s)
		call := asMap(delta(ch)["tool_calls"].([]any)[0])
		if asMap(call["function"])["arguments"] != `{"a":` || call["id"] != "tu_1" { t.Fatalf("%+v", call) }
		if s.ToolInputBuffers[0] != `{"a":` { t.Fatalf("%+v", s.ToolInputBuffers) }
	})
	t.Run("cache_creation_input_tokens", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_delta","delta":map[string]any{"stop_reason":"end_turn"},
			"usage":map[string]any{"input_tokens":float64(100),"output_tokens":float64(20),"cache_creation_input_tokens":float64(50)}}, nil)
		u := asMap(ch["usage"])
		if asMap(u["prompt_tokens_details"])["cached_tokens"] != 50 { t.Fatalf("%+v", u) }
	})
	t.Run("input_tokens_details.cached_tokens", func(t *testing.T) {
		ch := c(map[string]any{"type":"message_delta","delta":map[string]any{"stop_reason":"end_turn"},
			"usage":map[string]any{"input_tokens":float64(100),"output_tokens":float64(20),"input_tokens_details":map[string]any{"cached_tokens":float64(50)}}}, nil)
		u := asMap(ch["usage"])
		if asMap(u["prompt_tokens_details"])["cached_tokens"] != 50 { t.Fatalf("%+v", u) }
	})
}
