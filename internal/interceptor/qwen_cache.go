package interceptor

import "strings"

func AddCacheControlToTools(tools []any) []any {
	if len(tools) == 0 {
		return tools
	}
	last := map[string]any{}
	for k, v := range asMap(tools[len(tools)-1]) {
		last[k] = v
	}
	last["cache_control"] = map[string]any{"type": "ephemeral"}
	out := append([]any{}, tools[:len(tools)-1]...)
	return append(out, last)
}
func AddCacheControlToLastMessage(messages []any) []any {
	if len(messages) == 0 {
		return messages
	}
	last := asMap(messages[len(messages)-1])
	content := last["content"]
	if content == nil || content == "" {
		return messages
	}
	var newContent []any
	switch c := content.(type) {
	case []any:
		newContent = append([]any{}, c...)
		if len(newContent) > 0 {
			blk := map[string]any{}
			for k, v := range asMap(newContent[0]) {
				blk[k] = v
			}
			blk["cache_control"] = map[string]any{"type": "ephemeral"}
			newContent[0] = blk
		}
	case string:
		newContent = []any{map[string]any{"type": "text", "text": c, "cache_control": map[string]any{"type": "ephemeral"}}}
	default:
		return messages
	}
	newLast := map[string]any{}
	for k, v := range last {
		newLast[k] = v
	}
	newLast["content"] = newContent
	out := append([]any{}, messages[:len(messages)-1]...)
	return append(out, newLast)
}
func EnsureContentArray(content any) []any {
	if a, ok := content.([]any); ok {
		return a
	}
	if s, ok := content.(string); ok {
		return []any{map[string]any{"type": "text", "text": s}}
	}
	return nil
}
func AddCacheControlToLastTextBlock(blocks []any) []any {
	for i := len(blocks) - 1; i >= 0; i-- {
		if asMap(blocks[i])["type"] == "text" {
			out := append([]any{}, blocks...)
			blk := map[string]any{}
			for k, v := range asMap(out[i]) {
				blk[k] = v
			}
			blk["cache_control"] = map[string]any{"type": "ephemeral"}
			out[i] = blk
			return out
		}
	}
	return blocks
}
func AddCacheControlToSystemMessages(messages []any, quota int) []any {
	if quota <= 0 {
		return messages
	}
	remaining := quota
	out := append([]any{}, messages...)
	for i, raw := range out {
		msg := asMap(raw)
		if msg["role"] != "system" || remaining <= 0 {
			continue
		}
		blocks := EnsureContentArray(msg["content"])
		if len(blocks) == 0 {
			continue
		}
		textIdx := -1
		for j := len(blocks) - 1; j >= 0; j-- {
			if asMap(blocks[j])["type"] == "text" {
				textIdx = j
				break
			}
		}
		if textIdx < 0 {
			continue
		}
		remaining--
		newBlocks := append([]any{}, blocks...)
		blk := map[string]any{}
		for k, v := range asMap(newBlocks[textIdx]) {
			blk[k] = v
		}
		blk["cache_control"] = map[string]any{"type": "ephemeral"}
		newBlocks[textIdx] = blk
		nm := map[string]any{}
		for k, v := range msg {
			nm[k] = v
		}
		nm["content"] = newBlocks
		out[i] = nm
	}
	return out
}
func QwenCache(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if ctx.Provider == nil || !strings.Contains(strings.ToLower(ctx.Provider.RealModel), "qwen") {
		return req, nil
	}
	messages, ok := req.Body["messages"].([]any)
	if !ok || len(messages) == 0 {
		return req, nil
	}
	count := 0
	var newTools []any
	if tools, ok := req.Body["tools"].([]any); ok {
		newTools = AddCacheControlToTools(tools)
		if len(tools) > 0 {
			count++
		}
	}
	newMessages := AddCacheControlToLastMessage(messages)
	if len(newMessages) > 0 {
		count++
	}
	if quota := 4 - count; quota > 0 {
		newMessages = AddCacheControlToSystemMessages(newMessages, quota)
	}
	newBody := map[string]any{}
	for k, v := range req.Body {
		newBody[k] = v
	}
	newBody["messages"] = newMessages
	if newTools != nil {
		newBody["tools"] = newTools
	}
	return &UpstreamRequest{URL: req.URL, Headers: req.Headers, Body: newBody}, nil
}
