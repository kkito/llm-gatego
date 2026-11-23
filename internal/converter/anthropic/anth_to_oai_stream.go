package anthropic

import (
	"fmt"
	"time"

	"github.com/kkito/llm-gatego/internal/converter/anthropic/shared"
)

type AnthStreamState struct {
	ToolInputBuffers      map[int]string
	ToolIDMap             map[int]string
	ToolNameMap           map[int]string
	HasSentToolCallStart  map[int]bool
}

func NewAnthStreamState() *AnthStreamState {
	return &AnthStreamState{
		ToolInputBuffers: make(map[int]string), ToolIDMap: make(map[int]string),
		ToolNameMap: make(map[int]string), HasSentToolCallStart: make(map[int]bool),
	}
}

func chunk(requestID, model string, delta map[string]any, finish any, usage any) map[string]any {
	c := map[string]any{
		"id": requestID, "object": "chat.completion.chunk", "created": time.Now().Unix(), "model": model,
		"choices": []any{map[string]any{"index": 0, "delta": delta, "finish_reason": finish}},
	}
	if usage != nil { c["usage"] = usage }
	return c
}

// AnthEventToOAIChunk mirrors convertAnthropicStreamEventToOpenAI. Returns nil for events to skip.
func AnthEventToOAIChunk(event map[string]any, requestID, model string, s *AnthStreamState) map[string]any {
	if s == nil { s = NewAnthStreamState() }
	eventType := asString(event["type"])
	switch eventType {
	case "message_start":
		message := asMap(event["message"])
		var usage any
		if u := asMap(message["usage"]); u != nil {
			input, output := toInt(u["input_tokens"]), toInt(u["output_tokens"])
			usage = map[string]any{"prompt_tokens": input, "completion_tokens": output,
				"total_tokens": input + output, "prompt_tokens_details": map[string]any{"cached_tokens": 0}}
		}
		id := asString(message["id"]); if id == "" { id = requestID }
		return chunk(id, model, map[string]any{"role": "assistant"}, nil, usage)
	case "content_block_start":
		block := asMap(event["content_block"])
		index := 0
		if v, ok := event["index"].(float64); ok { index = int(v) }
		switch asString(block["type"]) {
		case "tool_use":
			toolID := asString(block["id"])
			if toolID == "" { toolID = fmt.Sprintf("toolu_%d_%d", time.Now().UnixMilli(), index) }
			s.ToolIDMap[index] = toolID
			s.ToolNameMap[index] = asString(block["name"])
			s.ToolInputBuffers[index] = ""
			s.HasSentToolCallStart[index] = false
			return chunk(requestID, model, map[string]any{"tool_calls": []any{map[string]any{
				"index": index, "id": toolID, "type": "function",
				"function": map[string]any{"name": asString(block["name"]), "arguments": ""}}}}, nil, nil)
		case "text":
			return chunk(requestID, model, map[string]any{"content": ""}, nil, nil)
		case "thinking":
			return chunk(requestID, model, map[string]any{"reasoning_content": ""}, nil, nil)
		default:
			return chunk(requestID, model, map[string]any{}, nil, nil)
		}
	case "content_block_delta":
		d := asMap(event["delta"])
		index := 0
		if v, ok := event["index"].(float64); ok { index = int(v) }
		switch asString(d["type"]) {
		case "text_delta":
			return chunk(requestID, model, map[string]any{"content": asString(d["text"])}, nil, nil)
		case "input_json_delta":
			partial := asString(d["partial_json"])
			s.ToolInputBuffers[index] += partial
			s.HasSentToolCallStart[index] = true
			return chunk(requestID, model, map[string]any{"tool_calls": []any{map[string]any{
				"index": index, "id": s.ToolIDMap[index], "type": "function",
				"function": map[string]any{"name": s.ToolNameMap[index], "arguments": partial}}}}, nil, nil)
		case "thinking_delta":
			return chunk(requestID, model, map[string]any{"reasoning_content": asString(d["thinking"])}, nil, nil)
		case "signature_delta":
			return chunk(requestID, model, map[string]any{}, nil, nil)
		default:
			return chunk(requestID, model, map[string]any{}, nil, nil)
		}
	case "content_block_stop":
		return chunk(requestID, model, map[string]any{}, nil, nil)
	case "message_delta":
		finish := shared.MapAnthropicToOpenAIFinishReason(asString(asMap(event["delta"])["stop_reason"]))
		var usage any
		if u := asMap(event["usage"]); u != nil {
			input, output := toInt(u["input_tokens"]), toInt(u["output_tokens"])
			cache := toInt(u["cache_creation_input_tokens"]) + toInt(u["cache_read_input_tokens"]) + toInt(asMap(u["input_tokens_details"])["cached_tokens"])
			usage = map[string]any{"prompt_tokens": input, "completion_tokens": output, "total_tokens": input + output}
			if cache > 0 { usage.(map[string]any)["prompt_tokens_details"] = map[string]any{"cached_tokens": cache} }
		}
		return chunk(requestID, model, map[string]any{}, finish, usage)
	case "error":
		return chunk(requestID, model, map[string]any{}, "error", nil)
	case "message_stop", "ping":
		return nil
	default:
		return nil
	}
}
