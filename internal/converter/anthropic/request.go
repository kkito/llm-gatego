package anthropic

import (
	"encoding/json"
	"strings"
)

func asMap(v any) map[string]any {
	if m, ok := v.(map[string]any); ok { return m }
	return nil
}
func asSlice(v any) []any {
	if a, ok := v.([]any); ok { return a }
	return nil
}
func asString(v any) string {
	if s, ok := v.(string); ok { return s }
	return ""
}

// AnthropicToChatRequest mirrors convertAnthropicRequestToOpenAI (src/.../anthropic-to-openai.ts).
func AnthropicToChatRequest(req map[string]any) map[string]any {
	messages := make([]any, 0)
	if sys := ConvertSystem(req["system"]); sys != "" {
		messages = append(messages, map[string]any{"role": "system", "content": sys})
	}
	for _, raw := range asSlice(req["messages"]) {
		msg := asMap(raw)
		switch asString(msg["role"]) {
		case "assistant":
			out := map[string]any{"role": "assistant", "content": ""}
			switch c := msg["content"].(type) {
			case string:
				out["content"] = c
			case []any:
				text := ""
				for _, b := range c {
					bm := asMap(b)
					if asString(bm["type"]) == "text" { text += asString(bm["text"]) }
				}
				out["content"] = text
				calls := ConvertToolUseToToolCalls(c)
				if len(calls) > 0 {
					out["tool_calls"] = calls
					if text == "" { out["content"] = nil }
				}
				thinking := ""
				for _, b := range c {
					bm := asMap(b)
					if asString(bm["type"]) == "thinking" { thinking += asString(bm["thinking"]) }
				}
				if thinking != "" { out["reasoning_content"] = thinking }
			}
			messages = append(messages, out)
		case "user":
			switch c := msg["content"].(type) {
			case string:
				messages = append(messages, map[string]any{"role": "user", "content": c})
			case []any:
				var results []any
				// Group tool_result blocks by tool_use_id (preserves first-seen order).
				groupOrder := make([]string, 0)
				grouped := make(map[string][]string)
				for _, b := range c {
					bm := asMap(b)
					if asString(bm["type"]) == "tool_result" {
						id := asString(bm["tool_use_id"])
						content := bm["content"]
						s, ok := content.(string)
						if !ok { raw, _ := json.Marshal(content); s = string(raw) }
						if s == "" { s = "No output" }
						if _, seen := grouped[id]; !seen { groupOrder = append(groupOrder, id) }
						grouped[id] = append(grouped[id], s)
					}
				}
				for _, id := range groupOrder {
					results = append(results, map[string]any{"role": "tool", "content": strings.Join(grouped[id], "\n"), "tool_call_id": id})
				}
				if len(results) > 0 {
					messages = append(messages, results...)
					text := ""
					for _, b := range c {
						bm := asMap(b)
						if asString(bm["type"]) == "text" { text += asString(bm["text"]) }
					}
					if text != "" { messages = append(messages, map[string]any{"role": "user", "content": text}) }
				} else {
					allText := true
					for _, b := range c { if asString(asMap(b)["type"]) != "text" { allText = false } }
					if allText {
						text := ""
						for _, b := range c { text += asString(asMap(b)["text"]) }
						messages = append(messages, map[string]any{"role": "user", "content": text})
					} else {
						parts := make([]any, 0, len(c))
						for _, b := range c {
							bm := asMap(b)
							switch asString(bm["type"]) {
							case "text":
								parts = append(parts, map[string]any{"type": "text", "text": asString(bm["text"])})
							case "image":
								parts = append(parts, ConvertImageBlock(bm))
							case "document":
								parts = append(parts, ConvertDocumentBlock(bm))
							}
						}
						messages = append(messages, map[string]any{"role": "user", "content": parts})
					}
				}
			}
		}
	}
	out := map[string]any{"model": req["model"], "messages": messages}
	if tools := ConvertAnthropicToolsToOpenAI(asSlice(req["tools"])); tools != nil { out["tools"] = tools }
	for _, k := range []string{"max_tokens", "stream", "temperature", "top_p", "top_k"} {
		if req[k] != nil { out[k] = req[k] }
	}
	if asMap(req["thinking"])["type"] == "enabled" {
		out["stream_options"] = map[string]any{"include_reasoning": true}
	}
	return out
}

func ConvertSystem(system any) string {
	switch s := system.(type) {
	case string:
		return s
	case []any:
		parts := make([]string, 0, len(s))
		for _, b := range s {
			bm := asMap(b)
			if asString(bm["type"]) == "text" { parts = append(parts, asString(bm["text"])) }
		}
		return strings.Join(parts, " ")
	}
	return ""
}

func ConvertToolUseToToolCalls(blocks []any) []any {
	var calls []any
	for _, b := range blocks {
		bm := asMap(b)
		if asString(bm["type"]) != "tool_use" { continue }
		args, _ := json.Marshal(bm["input"])
		argStr := string(args)
		if bm["input"] == nil { argStr = "{}" }
		calls = append(calls, map[string]any{
			"id": asString(bm["id"]), "type": "function",
			"function": map[string]any{"name": asString(bm["name"]), "arguments": argStr},
		})
	}
	return calls
}

func ConvertImageBlock(block map[string]any) map[string]any {
	src := asMap(block["source"])
	mediaType := asString(src["media_type"])
	data := asString(src["data"])
	url := "data:" + mediaType + ";base64," + data
	if asString(src["type"]) == "url" { url = data }
	return map[string]any{"type": "image_url", "image_url": map[string]any{"url": url}}
}

func ConvertDocumentBlock(block map[string]any) map[string]any {
	src := asMap(block["source"])
	data := asString(src["data"])
	mediaType := asString(src["media_type"])
	if strings.HasPrefix(data, "data:") { return map[string]any{"type": "file", "file": map[string]any{"file_data": data}} }
	return map[string]any{"type": "file", "file": map[string]any{"filename": asString(src["media_type"]), "file_data": "data:" + mediaType + ";base64," + data}}
}


// ChatToAnthropicRequest mirrors convertOpenAIRequestToAnthropic (src/.../openai-to-anthropic.ts).
func ChatToAnthropicRequest(req map[string]any) map[string]any {
	messages := make([]any, 0)
	var systemContent string
	maxTokens := 4096
	if v, ok := req["max_tokens"].(float64); ok && v != 0 { maxTokens = int(v) }
	if v, ok := req["max_tokens"].(int); ok && v != 0 { maxTokens = v }
	if maxTokens < 1 { maxTokens = 1 }
	if maxTokens > 8192 { maxTokens = 8192 }

	for _, raw := range asSlice(req["messages"]) {
		msg := asMap(raw)
		switch asString(msg["role"]) {
		case "system":
			systemContent = contentToString(msg["content"])
		case "tool":
			s := contentToString(msg["content"])
			if s == "" { rawJSON, _ := json.Marshal(msg["content"]); s = string(rawJSON) }
			if s == "" { s = "No output" }
			messages = append(messages, map[string]any{"role": "user", "content": []any{
				map[string]any{"type": "tool_result", "tool_use_id": asString(msg["tool_call_id"]), "content": s},
			}})
		case "assistant":
			blocks := make([]any, 0)
			switch c := msg["content"].(type) {
			case string:
				if c != "" { blocks = append(blocks, map[string]any{"type": "text", "text": c}) }
			case []any:
				blocks = append(blocks, ConvertOpenAIContent(c)...)
			}
			for _, rawCall := range asSlice(msg["tool_calls"]) {
				call := asMap(rawCall)
				fn := asMap(call["function"])
				var input any = map[string]any{}
				if argStr := asString(fn["arguments"]); argStr != "" {
					_ = json.Unmarshal([]byte(argStr), &input)
				}
				blocks = append(blocks, map[string]any{"type": "tool_use", "id": asString(call["id"]), "name": asString(fn["name"]), "input": input})
			}
			allText := len(blocks) > 0
			for _, b := range blocks { if asString(asMap(b)["type"]) != "text" { allText = false } }
			if len(blocks) == 0 || allText {
				// longcat: pure-text assistant messages omit content
				messages = append(messages, map[string]any{"role": "assistant"})
			} else {
				messages = append(messages, map[string]any{"role": "assistant", "content": blocks})
			}
		case "user":
			content := ConvertOpenAIContent(asSlice(msg["content"]))
			if asString(msg["content"]) != "" {
				content = []any{map[string]any{"type": "text", "text": asString(msg["content"])}}
			} else if msg["content"] == nil {
				// convertOpenAIContent(null) → [{type:text, text:''}]
				content = []any{map[string]any{"type": "text", "text": ""}}
			}
			if systemContent != "" && len(messages) == 0 {
				content = append([]any{map[string]any{"type": "text", "text": systemContent + "\n\n"}}, content...)
				systemContent = ""
			}
			messages = append(messages, map[string]any{"role": "user", "content": content})
		}
	}
	out := map[string]any{"model": req["model"], "messages": messages, "max_tokens": maxTokens}
	if tools := ConvertOpenAIToolsToAnthropic(asSlice(req["tools"])); tools != nil { out["tools"] = tools }
	if req["stream"] != nil { out["stream"] = req["stream"] }
	if req["temperature"] != nil { out["temperature"] = req["temperature"] }
	return out
}

func contentToString(v any) string {
	switch c := v.(type) {
	case string: return c
	case []any:
		parts := make([]string, 0, len(c))
		for _, b := range c { if asString(asMap(b)["type"]) == "text" { parts = append(parts, asString(asMap(b)["text"])) } }
		return strings.Join(parts, " ")
	}
	return ""
}

func ConvertOpenAIContent(content []any) []any {
	blocks := make([]any, 0, len(content))
	for _, raw := range content {
		part := asMap(raw)
		switch asString(part["type"]) {
		case "text":
			blocks = append(blocks, map[string]any{"type": "text", "text": asString(part["text"])})
		case "image_url":
			url := asString(asMap(part["image_url"])["url"])
			blocks = append(blocks, map[string]any{"type": "image", "source": SplitDataURL(url, "image/jpeg")})
		case "input_audio":
			audio := asMap(part["input_audio"])
			format := asString(audio["format"]); if format == "" { format = "mp3" }
			blocks = append(blocks, map[string]any{"type": "document", "source": map[string]any{
				"type": "base64", "media_type": "audio/" + format, "data": asString(audio["data"]),
			}})
		case "file":
			file := asMap(part["file"])
			if data := asString(file["file_data"]); data != "" {
				source := SplitDataURL(data, "application/octet-stream")
				blocks = append(blocks, map[string]any{"type": "document", "source": source})
			} else if id := asString(file["file_id"]); id != "" {
				blocks = append(blocks, map[string]any{"type": "document", "source": map[string]any{"type": "url", "media_type": "", "data": id}})
			}
		}
	}
	return blocks
}

func SplitDataURL(url, defaultMediaType string) map[string]any {
	if strings.HasPrefix(url, "data:") && strings.Contains(url, ";base64,") {
		parts := strings.SplitN(strings.TrimPrefix(url, "data:"), ";base64,", 2)
		return map[string]any{"type": "base64", "media_type": parts[0], "data": parts[1]}
	}
	return map[string]any{"type": "url", "media_type": "", "data": url}
}

var defaultToolParameters = map[string]any{"type": "object", "properties": map[string]any{}}

func ConvertOpenAIToolsToAnthropic(tools []any) []any {
	if tools == nil { return nil }
	out := make([]any, 0, len(tools))
	for _, raw := range tools {
		tool := asMap(raw)
		fn := asMap(tool["function"])
		params := fn["parameters"]
		if params == nil { params = defaultToolParameters }
		out = append(out, map[string]any{
			"name": fn["name"], "description": fn["description"], "input_schema": params,
		})
	}
	return out
}

func ConvertAnthropicToolsToOpenAI(tools []any) []any {
	if tools == nil { return nil }
	out := make([]any, 0, len(tools))
	for _, raw := range tools {
		tool := asMap(raw)
		params := tool["input_schema"]
		if params == nil { params = defaultToolParameters }
		out = append(out, map[string]any{"type": "function", "function": map[string]any{
			"name": tool["name"], "description": tool["description"], "parameters": params,
		}})
	}
	return out
}
