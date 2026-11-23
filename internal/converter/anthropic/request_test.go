package anthropic

import "testing"

func TestAnthropicToChatRequest(t *testing.T) {
	req := map[string]any{"model": "claude", "system": "be nice",
		"messages": []any{map[string]any{"role": "user", "content": "hi"}}, "max_tokens": float64(100)}
	chat := AnthropicToChatRequest(req)
	msgs := chat["messages"].([]any)
	if len(msgs) != 2 { t.Fatalf("%+v", msgs) }
	first := msgs[0].(map[string]any)
	if first["role"] != "system" || first["content"] != "be nice" { t.Fatalf("%+v", first) }
	if msgs[1].(map[string]any)["role"] != "user" { t.Fatalf("%+v", msgs[1]) }
}

func TestChatToAnthropicRequest(t *testing.T) {
	chat := map[string]any{"model": "claude", "messages": []any{map[string]any{
		"role": "assistant", "content": nil,
		"tool_calls": []any{map[string]any{"id": "t1", "type": "function",
			"function": map[string]any{"name": "f", "arguments": "{}"}}}}}}
	a := ChatToAnthropicRequest(chat)
	blk := a["messages"].([]any)[0].(map[string]any)["content"].([]any)[0].(map[string]any)
	if blk["type"] != "tool_use" || blk["name"] != "f" { t.Fatalf("%+v", blk) }
}

func TestChatToAnthropicAdditional(t *testing.T) {
	t.Run("max_tokens clamped", func(t *testing.T) {
		for _, tc := range []struct{ in, want int }{{0, 4096}, {-5, 1}, {99999, 8192}, {100, 100}} {
			got := ChatToAnthropicRequest(map[string]any{"model":"m","messages":[]any{},"max_tokens":float64(tc.in)})["max_tokens"]
			if got != tc.want { t.Errorf("in=%d got=%v want=%d", tc.in, got, tc.want) }
		}
	})
	t.Run("tool role becomes tool_result", func(t *testing.T) {
		a := ChatToAnthropicRequest(map[string]any{"model":"m","messages":[]any{
			map[string]any{"role":"tool","content":"result","tool_call_id":"call_1"}}})
		blk := a["messages"].([]any)[0].(map[string]any)["content"].([]any)[0].(map[string]any)
		if blk["type"] != "tool_result" || blk["tool_use_id"] != "call_1" || blk["content"] != "result" { t.Fatalf("%+v", blk) }
	})
	t.Run("system merged into first user", func(t *testing.T) {
		a := ChatToAnthropicRequest(map[string]any{"model":"m","messages":[]any{
			map[string]any{"role":"system","content":"sys"},
			map[string]any{"role":"user","content":"hi"}}})
		blk := a["messages"].([]any)[0].(map[string]any)["content"].([]any)[0].(map[string]any)
		if blk["text"] != "sys\n\n" { t.Fatalf("%+v", blk) }
	})
	t.Run("tools default parameters", func(t *testing.T) {
		a := ChatToAnthropicRequest(map[string]any{"model":"m","messages":[]any{},"tools":[]any{
			map[string]any{"type":"function","function":map[string]any{"name":"f"}}}})
		tool := a["tools"].([]any)[0].(map[string]any)
		if tool["name"] != "f" || asMap(tool["input_schema"])["type"] != "object" { t.Fatalf("%+v", tool) }
	})
	t.Run("image data url", func(t *testing.T) {
		a := ChatToAnthropicRequest(map[string]any{"model":"m","messages":[]any{
			map[string]any{"role":"user","content":[]any{map[string]any{"type":"image_url","image_url":map[string]any{"url":"data:image/png;base64,AAA"}}}}}})
		blk := a["messages"].([]any)[0].(map[string]any)["content"].([]any)[0].(map[string]any)
		src := blk["source"].(map[string]any)
		if src["type"] != "base64" || src["media_type"] != "image/png" || src["data"] != "AAA" { t.Fatalf("%+v", src) }
	})
}
