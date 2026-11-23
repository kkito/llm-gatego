package anthropic

import "testing"

func oaiChunk(model string, delta map[string]any, finish any) map[string]any {
	return map[string]any{"id": "chatcmpl-1", "object": "chat.completion.chunk", "model": model,
		"choices": []any{map[string]any{"index": float64(0), "delta": delta, "finish_reason": finish}}}
}

func eventTypes(events []any) []string {
	out := make([]string, 0, len(events))
	for _, e := range events { out = append(out, asString(asMap(e)["type"])) }
	return out
}

func hasEvent(events []any, typ string) bool {
	for _, t := range eventTypes(events) { if t == typ { return true } }
	return false
}

func deltaOf(events []any, deltaType string) map[string]any {
	for _, raw := range events {
		e := asMap(raw)
		d := asMap(e["delta"])
		if asString(d["type"]) == deltaType { return d }
	}
	return nil
}

// Mirrors openai-to-anthropic-stream-text.test.ts (3 cases).
func TestOAIToAnthropicTextStreaming(t *testing.T) {
	t.Run("complete event sequence", func(t *testing.T) {
		s := NewOAIStreamState()
		all := OAIChunkToAnthropicEvents(oaiChunk("gpt-4", map[string]any{"role":"assistant","content":"Hello"}, nil), s)
		for _, word := range []string{"world", "!"} {
			all = append(all, OAIChunkToAnthropicEvents(oaiChunk("gpt-4", map[string]any{"content":word}, nil), s)...)
		}
		all = append(all, OAIChunkToAnthropicEvents(oaiChunk("gpt-4", map[string]any{}, "stop"), s)...)
		for _, want := range []string{"message_start","content_block_start","content_block_stop","message_delta","message_stop"} {
			if !hasEvent(all, want) { t.Errorf("missing %s in %v", want, eventTypes(all)) }
		}
		d := deltaOf(all, "text_delta")
		if d == nil || d["text"] != "Hello" { t.Fatalf("%+v", d) }
	})
	t.Run("thinking followed by text", func(t *testing.T) {
		s := NewOAIStreamState(); s.SentMessageStart = true
		r := OAIChunkToAnthropicEvents(oaiChunk("gpt-4", map[string]any{"reasoning_content":"Let me think..."}, nil), s)
		if d := deltaOf(r, "thinking_delta"); d == nil { t.Fatalf("%+v", r) }
		r = OAIChunkToAnthropicEvents(oaiChunk("gpt-4", map[string]any{"content":"Here is the answer."}, nil), s)
		if d := deltaOf(r, "text_delta"); d == nil || d["text"] != "Here is the answer." { t.Fatalf("%+v", r) }
	})
	t.Run("empty content skipped", func(t *testing.T) {
		s := NewOAIStreamState(); s.SentMessageStart = true
		r := OAIChunkToAnthropicEvents(oaiChunk("gpt-4", map[string]any{"content":""}, nil), s)
		for _, e := range r { if asString(asMap(e)["type"])=="content_block_delta" { t.Fatalf("%+v", r) } }
	})
}

// Mirrors openai-to-anthropic-stream-thinking.test.ts (10 cases).
func TestOAIToAnthropicThinkingStreaming(t *testing.T) {
	t.Run("o1 reasoning_details", func(t *testing.T) {
		s := NewOAIStreamState()
		events := OAIChunkToAnthropicEvents(oaiChunk("o1-preview", map[string]any{
			"reasoning_details":[]any{map[string]any{"text":"Let me think about this..."}}}, nil), s)
		found := false
		for _, raw := range events {
			e := asMap(raw)
			if asString(e["type"])=="content_block_start" && asString(asMap(e["content_block"])["type"])=="thinking" {
				found = true; if asMap(e["content_block"])["thinking"] != "" || asMap(e["content_block"])["text"] != nil { t.Fatalf("%+v", e) }
			}
		}
		if !found { t.Fatalf("no thinking start: %+v", events) }
		if d := deltaOf(events, "thinking_delta"); d == nil || d["thinking"] != "Let me think about this..." { t.Fatalf("%+v", events) }
	})
	t.Run("OpenRouter reasoning", func(t *testing.T) {
		events := OAIChunkToAnthropicEvents(oaiChunk("openrouter", map[string]any{"reasoning":"This is a complex problem..."}, nil), NewOAIStreamState())
		if d := deltaOf(events, "thinking_delta"); d == nil || d["thinking"] != "This is a complex problem..." { t.Fatalf("%+v", events) }
	})
	t.Run("Qwen reasoning_content", func(t *testing.T) {
		events := OAIChunkToAnthropicEvents(oaiChunk("qwen-max", map[string]any{"reasoning_content":"让我思考一下..."}, nil), NewOAIStreamState())
		if d := deltaOf(events, "thinking_delta"); d == nil || d["thinking"] != "让我思考一下..." { t.Fatalf("%+v", events) }
	})
	t.Run("incremental thinking", func(t *testing.T) {
		s := NewOAIStreamState()
		e1 := OAIChunkToAnthropicEvents(oaiChunk("o1", map[string]any{"reasoning_details":[]any{map[string]any{"text":"First "}}}, nil), s)
		e2 := OAIChunkToAnthropicEvents(oaiChunk("o1", map[string]any{"reasoning_details":[]any{map[string]any{"text":"step"}}}, nil), s)
		if d := deltaOf(e1, "thinking_delta"); d == nil || d["thinking"] != "First " { t.Fatalf("%+v", e1) }
		if d := deltaOf(e2, "thinking_delta"); d == nil || d["thinking"] != "step" { t.Fatalf("%+v", e2) }
	})
	t.Run("thinking then text", func(t *testing.T) {
		s := NewOAIStreamState()
		t1 := OAIChunkToAnthropicEvents(oaiChunk("o1", map[string]any{"reasoning_details":[]any{map[string]any{"text":"Thinking..."}}}, nil), s)
		t2 := OAIChunkToAnthropicEvents(oaiChunk("o1", map[string]any{"content":"The answer is..."}, nil), s)
		if !hasEvent(t1, "content_block_start") { t.Fatalf("%+v", t1) }
		if !hasEvent(t2, "content_block_stop") || deltaOf(t2, "text_delta") == nil { t.Fatalf("%+v", t2) }
	})
	t.Run("thinking with finish_reason", func(t *testing.T) {
		events := OAIChunkToAnthropicEvents(oaiChunk("o1", map[string]any{
			"reasoning_details":[]any{map[string]any{"text":"Final thought"}}}, "stop"), NewOAIStreamState())
		if !hasEvent(events,"message_delta") || !hasEvent(events,"message_stop") { t.Fatalf("%+v", events) }
		for _, raw := range events {
			e := asMap(raw)
			if asString(e["type"])=="message_delta" && asString(asMap(e["delta"])["stop_reason"]) != "end_turn" { t.Fatalf("%+v", e) }
		}
	})
	t.Run("MiniMax reasoning + reasoning_content", func(t *testing.T) {
		events := OAIChunkToAnthropicEvents(oaiChunk("minimax", map[string]any{
			"reasoning":"The user","reasoning_content":"The user"}, nil), NewOAIStreamState())
		if d := deltaOf(events, "thinking_delta"); d == nil || d["thinking"] != "The user" { t.Fatalf("%+v", events) }
	})
	t.Run("MiniMax mixed thinking + content", func(t *testing.T) {
		s := NewOAIStreamState()
		t1 := OAIChunkToAnthropicEvents(oaiChunk("minimax", map[string]any{
			"reasoning":"Let me think","reasoning_content":"Let me think"}, nil), s)
		t2 := OAIChunkToAnthropicEvents(oaiChunk("minimax", map[string]any{
			"content":"The answer is","reasoning":"checking...","reasoning_content":"checking..."}, nil), s)
		if deltaOf(t1, "thinking_delta") == nil { t.Fatalf("%+v", t1) }
		if !hasEvent(t2, "content_block_stop") { t.Fatalf("%+v", t2) }
		if d := deltaOf(t2, "text_delta"); d == nil || d["text"] != "The answer is" { t.Fatalf("%+v", t2) }
	})
	t.Run("empty choices usage only", func(t *testing.T) {
		s := NewOAIStreamState(); s.SentMessageStart = true
		chunk := map[string]any{"choices":[]any{}, "usage":map[string]any{"prompt_tokens":float64(100),"completion_tokens":float64(50)}}
		if events := OAIChunkToAnthropicEvents(chunk, s); len(events) != 0 { t.Fatalf("%+v", events) }
	})
	t.Run("null reasoning_content with content", func(t *testing.T) {
		s := NewOAIStreamState(); s.SentMessageStart = true
		events := OAIChunkToAnthropicEvents(oaiChunk("minimax", map[string]any{"content":"运行测试","reasoning_content":nil}, nil), s)
		if d := deltaOf(events, "text_delta"); d == nil || d["text"] != "运行测试" { t.Fatalf("%+v", events) }
	})
}
