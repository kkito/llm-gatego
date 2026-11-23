package interceptor

func stripCacheControlMarkers(msg map[string]any) int {
	if msg["role"] != "user" {
		return 0
	}
	content, ok := msg["content"].([]any)
	if !ok {
		return 0
	}
	count := 0
	for i, raw := range content {
		b, ok := raw.(map[string]any)
		if !ok {
			continue
		}
		if _, ok := b["cache_control"]; ok {
			copy := map[string]any{}
			for k, v := range b {
				if k != "cache_control" {
					copy[k] = v
				}
			}
			content[i] = copy
			count++
		}
	}
	msg["content"] = content
	return count
}
func CountUserCacheControlMarkers(body map[string]any) int {
	messages, ok := body["messages"].([]any)
	if !ok {
		return 0
	}
	count := 0
	for _, raw := range messages {
		msg, ok := raw.(map[string]any)
		if !ok || msg["role"] != "user" {
			continue
		}
		content, ok := msg["content"].([]any)
		if !ok {
			continue
		}
		for _, rb := range content {
			b, ok := rb.(map[string]any)
			if ok {
				if _, has := b["cache_control"]; has {
					count++
				}
			}
		}
	}
	return count
}
func CacheControlNormalize(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if !IsAnthropicEndpoint(ctx.RequestPath) {
		return req, nil
	}
	messages, ok := req.Body["messages"].([]any)
	if !ok || len(messages) == 0 {
		return req, nil
	}
	if CountUserCacheControlMarkers(req.Body) == 0 {
		return req, nil
	}
	newMessages := make([]any, 0, len(messages))
	for _, raw := range messages {
		b, ok := raw.(map[string]any)
		if !ok {
			newMessages = append(newMessages, raw)
			continue
		}
		cp := map[string]any{}
		for k, v := range b {
			cp[k] = v
		}
		stripCacheControlMarkers(cp)
		newMessages = append(newMessages, cp)
	}
	for i := len(newMessages) - 1; i >= 0; i-- {
		msg := asMap(newMessages[i])
		if msg["role"] != "user" {
			continue
		}
		content, ok := msg["content"].([]any)
		if !ok || len(content) == 0 {
			continue
		}
		last, ok := content[len(content)-1].(map[string]any)
		if !ok {
			break
		}
		cp := map[string]any{}
		for k, v := range last {
			cp[k] = v
		}
		cp["cache_control"] = map[string]any{"type": "ephemeral"}
		content[len(content)-1] = cp
		msg["content"] = content
		break
	}
	newBody := map[string]any{}
	for k, v := range req.Body {
		newBody[k] = v
	}
	newBody["messages"] = newMessages
	return &UpstreamRequest{URL: req.URL, Headers: req.Headers, Body: newBody}, nil
}
