package anthropic

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/kkito/llm-gatego/internal/converter/anthropic/shared"
)

type OAIStreamState struct {
	SentMessageStart      bool
	SentMessageStop       bool
	SentContentBlockStart bool
	SentContentBlockFinish bool
	CurrentContentBlockType string
	CurrentContentBlockIndex int
	CurrentToolID   string
	CurrentToolName string
	MessageID       string
}

func NewOAIStreamState() *OAIStreamState {
	return &OAIStreamState{CurrentContentBlockType: "text", MessageID: fmt.Sprintf("msg_%d", time.Now().UnixMilli())}
}

func getChoice(chunk map[string]any) map[string]any {
	choices := asSlice(chunk["choices"])
	if len(choices) == 0 { return nil }
	return asMap(choices[0])
}

func shouldStartNewBlock(chunk map[string]any, s *OAIStreamState) bool {
	choice := getChoice(chunk)
	delta := asMap(choice["delta"])
	if asString(choice["finish_reason"]) != "" { return false }
	calls := asSlice(delta["tool_calls"])
	if len(calls) > 0 {
		call := asMap(calls[0])
		if asString(call["id"]) != "" || asString(asMap(call["function"])["name"]) != "" {
			if s.CurrentContentBlockType != "tool_use" { return true }
			if s.CurrentToolID != "" && asString(call["id"]) != "" && s.CurrentToolID != asString(call["id"]) { return true }
		}
	}
	if v, ok := delta["content"]; ok && v != nil && v != "" {
		if s.CurrentContentBlockType != "text" { return true }
	}
	for _, key := range []string{"reasoning_content", "reasoning"} {
		if v := asString(delta[key]); v != "" && s.CurrentContentBlockType != "thinking" { return true }
	}
	for _, raw := range asSlice(delta["reasoning_details"]) {
		if asString(asMap(raw)["text"]) != "" && s.CurrentContentBlockType != "thinking" { return true }
	}
	return false
}

func stopBlock(events *[]any, s *OAIStreamState) {
	*events = append(*events, map[string]any{"type": "content_block_stop", "index": s.CurrentContentBlockIndex})
	s.SentContentBlockFinish = true
	s.CurrentContentBlockIndex++
}

func handleThinkingDelta(events *[]any, s *OAIStreamState, text string) {
	if s.CurrentContentBlockType != "thinking" || !s.SentContentBlockStart {
		if (s.CurrentContentBlockType == "text" || s.CurrentContentBlockType == "tool_use") && s.SentContentBlockStart && !s.SentContentBlockFinish {
			stopBlock(events, s)
		}
		s.CurrentContentBlockType = "thinking"
		s.SentContentBlockStart = false
		s.SentContentBlockFinish = false
	}
	if !s.SentContentBlockStart {
		s.SentContentBlockStart = true
		*events = append(*events, map[string]any{"type": "content_block_start", "index": s.CurrentContentBlockIndex,
			"content_block": map[string]any{"type": "thinking", "thinking": ""}})
	}
	if text != "" {
		*events = append(*events, map[string]any{"type": "content_block_delta", "index": s.CurrentContentBlockIndex,
			"delta": map[string]any{"type": "thinking_delta", "thinking": text}})
	}
}

// OAIChunkToAnthropicEvents mirrors convertOpenAIStreamChunkToAnthropic.
func OAIChunkToAnthropicEvents(chunk map[string]any, s *OAIStreamState) []any {
	events := make([]any, 0)
	choice := getChoice(chunk)
	delta := asMap(choice["delta"])
	finishReason := asString(choice["finish_reason"])
	if finishReason == "" { finishReason = asString(chunk["finish_reason"]) }

	if !s.SentMessageStart {
		s.SentMessageStart = true
		events = append(events, map[string]any{"type": "message_start", "message": map[string]any{
			"id": s.MessageID, "type": "message", "role": "assistant", "content": []any{},
			"model": chunk["model"], "stop_reason": nil, "stop_sequence": nil,
			"usage": map[string]any{"input_tokens": 0, "output_tokens": 0},
		}})
	}

	if shouldStartNewBlock(chunk, s) && s.SentContentBlockStart && !s.SentContentBlockFinish {
		stopBlock(&events, s)
		s.SentContentBlockStart = false
	}

	// tool_calls
	for _, rawCall := range asSlice(delta["tool_calls"]) {
		call := asMap(rawCall)
		toolIndex := 0
		if v, ok := call["index"].(float64); ok { toolIndex = int(v) }
		id := asString(call["id"])
		name := asString(asMap(call["function"])["name"])
		isNew := id != "" && s.CurrentToolID != "" && id != s.CurrentToolID
		needsNew := s.CurrentContentBlockType != "tool_use" || !s.SentContentBlockStart || isNew
		if needsNew {
			if s.SentContentBlockStart && !s.SentContentBlockFinish { stopBlock(&events, s) }
			s.CurrentContentBlockType = "tool_use"
			s.SentContentBlockStart = false
			s.SentContentBlockFinish = false
			if id != "" { s.CurrentToolID = id }
			if name != "" { s.CurrentToolName = name }
		}
		if !s.SentContentBlockStart {
			s.SentContentBlockStart = true
			toolID := s.CurrentToolID
			if toolID == "" { toolID = fmt.Sprintf("toolu_%d_%d", time.Now().UnixMilli(), toolIndex) }
			events = append(events, map[string]any{"type": "content_block_start", "index": s.CurrentContentBlockIndex,
				"content_block": map[string]any{"type": "tool_use", "id": toolID, "name": s.CurrentToolName, "input": map[string]any{}}})
		}
		if args := asString(asMap(call["function"])["arguments"]); args != "" {
			events = append(events, map[string]any{"type": "content_block_delta", "index": s.CurrentContentBlockIndex,
				"delta": map[string]any{"type": "input_json_delta", "partial_json": args}})
		}
	}

	// text content
	if content, ok := delta["content"]; ok && content != nil {
		if s.CurrentContentBlockType != "text" || !s.SentContentBlockStart {
			if (s.CurrentContentBlockType == "thinking" || s.CurrentContentBlockType == "tool_use") && s.SentContentBlockStart && !s.SentContentBlockFinish {
				stopBlock(&events, s)
			}
			s.CurrentContentBlockType = "text"
			s.SentContentBlockStart = false
			s.SentContentBlockFinish = false
		}
		if !s.SentContentBlockStart {
			s.SentContentBlockStart = true
			events = append(events, map[string]any{"type": "content_block_start", "index": s.CurrentContentBlockIndex,
				"content_block": map[string]any{"type": "text", "text": ""}})
		}
		if text := asString(content); text != "" {
			events = append(events, map[string]any{"type": "content_block_delta", "index": s.CurrentContentBlockIndex,
				"delta": map[string]any{"type": "text_delta", "text": text}})
		}
	}

	// thinking (Qwen / OpenRouter / o1)
	if v := asString(delta["reasoning_content"]); v != "" {
		handleThinkingDelta(&events, s, v)
	} else if v := asString(delta["reasoning"]); v != "" {
		handleThinkingDelta(&events, s, v)
	} else if details := asSlice(delta["reasoning_details"]); len(details) > 0 {
		for _, raw := range details {
			if v := asString(asMap(raw)["text"]); v != "" { handleThinkingDelta(&events, s, v) }
		}
	}

	// refusal
	if refusal := asString(delta["refusal"]); refusal != "" {
		if s.CurrentContentBlockType != "text" || !s.SentContentBlockStart {
			if s.SentContentBlockStart && !s.SentContentBlockFinish { stopBlock(&events, s) }
			s.CurrentContentBlockType = "text"
			s.SentContentBlockStart = false
			s.SentContentBlockFinish = false
		}
		if !s.SentContentBlockStart {
			s.SentContentBlockStart = true
			events = append(events, map[string]any{"type": "content_block_start", "index": s.CurrentContentBlockIndex,
				"content_block": map[string]any{"type": "text", "text": ""}})
		}
		events = append(events, map[string]any{"type": "content_block_delta", "index": s.CurrentContentBlockIndex,
			"delta": map[string]any{"type": "text_delta", "text": refusal}})
	}

	// finish
	if finishReason != "" {
		if s.SentMessageStop { return events }
		s.SentMessageStop = true
		if s.SentContentBlockStart && !s.SentContentBlockFinish {
			events = append(events, map[string]any{"type": "content_block_stop", "index": s.CurrentContentBlockIndex})
			s.SentContentBlockFinish = true
		}
		md := map[string]any{"type": "message_delta", "delta": map[string]any{
			"stop_reason": shared.MapOpenAIToAnthropicFinishReason(finishReason), "stop_sequence": nil}}
		input, output, cached := 0, 0, 0
		if u := asMap(chunk["usage"]); u != nil {
			input = toInt(u["prompt_tokens"]); if input == 0 { input = toInt(u["input_tokens"]) }
			output = toInt(u["completion_tokens"]); if output == 0 { output = toInt(u["output_tokens"]) }
			cached = toInt(asMap(u["prompt_tokens_details"])["cached_tokens"])
			if cached == 0 { cached = toInt(asMap(u["input_tokens_details"])["cached_tokens"]) }
		}
		usage := map[string]any{"input_tokens": input, "output_tokens": output}
		if cached > 0 { usage["cache_creation_input_tokens"] = cached }
		md["usage"] = usage
		events = append(events, md, map[string]any{"type": "message_stop"})
	}
	return events
}

func FormatAnthropicEventToSSE(event map[string]any) string {
	b, _ := json.Marshal(event)
	return fmt.Sprintf("event: %s\ndata: %s\n\n", asString(event["type"]), string(b))
}
