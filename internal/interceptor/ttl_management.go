package interceptor

const AgentSDKPrefix = "You are a Claude agent, built on Anthropic's Claude Agent SDK."

func DetectRequestType(system []any) string {
	for _, raw := range system {
		b, ok := raw.(map[string]any)
		if ok && b["type"] == "text" {
			if s, ok := b["text"].(string); ok && len(s) >= len(AgentSDKPrefix) && s[:len(AgentSDKPrefix)] == AgentSDKPrefix {
				return "subagent"
			}
		}
	}
	return "main"
}
func InjectTTL(block any, ttl string) any {
	b, ok := block.(map[string]any)
	if !ok {
		return block
	}
	cc, ok := b["cache_control"].(map[string]any)
	if !ok || cc["type"] != "ephemeral" {
		return block
	}
	if _, has := cc["ttl"]; has {
		return block
	}
	cp := map[string]any{}
	for k, v := range b {
		cp[k] = v
	}
	ccCopy := map[string]any{}
	for k, v := range cc {
		ccCopy[k] = v
	}
	ccCopy["ttl"] = ttl
	cp["cache_control"] = ccCopy
	return cp
}
func TTLManagement(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if !IsAnthropicEndpoint(ctx.RequestPath) {
		return req, nil
	}
	system, hasSys := req.Body["system"].([]any)
	messages, hasMsgs := req.Body["messages"].([]any)
	if !hasSys && !hasMsgs {
		return req, nil
	}
	ttl := "1h"
	if hasSys && DetectRequestType(system) == "subagent" {
		ttl = "1h"
	}
	newBody := map[string]any{}
	for k, v := range req.Body {
		newBody[k] = v
	}
	if hasSys {
		ns := make([]any, len(system))
		for i, b := range system {
			ns[i] = InjectTTL(b, ttl)
		}
		newBody["system"] = ns
	}
	if hasMsgs {
		nm := make([]any, 0, len(messages))
		for _, raw := range messages {
			b, ok := raw.(map[string]any)
			if !ok {
				nm = append(nm, raw)
				continue
			}
			cp := map[string]any{}
			for k, v := range b {
				cp[k] = v
			}
			if content, ok := b["content"].([]any); ok {
				nc := make([]any, len(content))
				for i, blk := range content {
					nc[i] = InjectTTL(blk, ttl)
				}
				cp["content"] = nc
			}
			nm = append(nm, cp)
		}
		newBody["messages"] = nm
	}
	return &UpstreamRequest{URL: req.URL, Headers: req.Headers, Body: newBody}, nil
}
