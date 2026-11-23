package anthropic

import (
	"encoding/json"
	"strings"
	"time"
)

// AnthropicResponseToChatResponse mirrors convertAnthropicResponseToOpenAI.
func AnthropicResponseToChatResponse(resp map[string]any, model string) map[string]any {
	blocks := asSlice(resp["content"])
	text := strings.Builder{}
	toolCalls := make([]any, 0)
	for _, raw := range blocks {
		b := asMap(raw)
		switch asString(b["type"]) {
		case "text":
			text.WriteString(asString(b["text"]))
		case "tool_use":
			args, _ := json.Marshal(b["input"])
			if b["input"] == nil { args = []byte("{}") }
			toolCalls = append(toolCalls, map[string]any{
				"id": asString(b["id"]), "type": "function",
				"function": map[string]any{"name": asString(b["name"]), "arguments": string(args)},
			})
		}
	}
	finish := sharedFinish(asString(resp["stop_reason"]))
	message := map[string]any{"role": "assistant", "content": nil}
	if text.Len() > 0 { message["content"] = text.String() }
	if len(toolCalls) > 0 { message["tool_calls"] = toolCalls }
	usage := asMap(resp["usage"])
	prompt := toInt(usage["input_tokens"])
	completion := toInt(usage["output_tokens"])
	outModel := asString(resp["model"])
	if model != "" { outModel = model }
	return map[string]any{
		"id": resp["id"], "object": "chat.completion", "created": time.Now().Unix(), "model": outModel,
		"choices": []any{map[string]any{"index": 0, "message": message, "finish_reason": finish}},
		"usage": map[string]any{"prompt_tokens": prompt, "completion_tokens": completion, "total_tokens": prompt + completion},
	}
}

func sharedFinish(reason string) any {
	if reason == "" { return nil }
	switch reason {
	case "end_turn", "stop_sequence": return "stop"
	case "tool_use": return "tool_calls"
	case "max_tokens": return "length"
	default: return nil
	}
}

func toInt(v any) int {
	switch n := v.(type) {
	case float64: return int(n)
	case int: return n
	}
	return 0
}
