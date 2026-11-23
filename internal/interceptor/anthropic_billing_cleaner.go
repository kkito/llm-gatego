package interceptor

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
)

var billingHeaderRE = regexp.MustCompile(`(?i)^x-anthropic-billing-header:\s*cc_version=[a-zA-Z0-9._-]+;\s*cc_entrypoint=[a-zA-Z0-9._-]+;?(?:\s*cch=[a-zA-Z0-9 ._-]+;?)?\s*`)

func CleanBillingHeader(text string) (string, bool, error) {
	prefix := text
	if len(prefix) > 120 {
		prefix = prefix[:120]
	}
	if !strings.Contains(strings.ToLower(prefix), "x-anthropic-billing-header") {
		return "", false, nil
	}
	loc := billingHeaderRE.FindStringIndex(text)
	if loc == nil {
		return "", false, fmt.Errorf("Unrecognized anthropic billing header format: %q", prefix)
	}
	return text[loc[1]:], true, nil
}

func ComputeFingerprint(messageText, version string) string {
	input := "59cf53e54c78"
	for _, i := range []int{4, 7, 20} {
		if i < len(messageText) {
			input += string(messageText[i])
		} else {
			input += "0"
		}
	}
	input += version
	h := sha256.Sum256([]byte(input))
	return hex.EncodeToString(h[:])[:3]
}

func extractRealUserMessageText(messages []any) string {
	for _, raw := range messages {
		msg, ok := raw.(map[string]any)
		if !ok || msg["role"] != "user" {
			continue
		}
		switch c := msg["content"].(type) {
		case string:
			if !strings.HasPrefix(c, "<system-reminder>") {
				return c
			}
		case []any:
			for _, b := range c {
				blk, ok := b.(map[string]any)
				if ok && blk["type"] == "text" {
					s, _ := blk["text"].(string)
					if s != "" && !strings.HasPrefix(s, "<system-reminder>") {
						return s
					}
				}
			}
		}
	}
	return ""
}
func extractFirstMessageText(messages []any) string {
	if len(messages) == 0 {
		return ""
	}
	first, ok := messages[0].(map[string]any)
	if !ok || first["role"] != "user" {
		return ""
	}
	switch c := first["content"].(type) {
	case string:
		return c
	case []any:
		for _, b := range c {
			blk, ok := b.(map[string]any)
			if ok && blk["type"] == "text" {
				s, _ := blk["text"].(string)
				return s
			}
		}
	}
	return ""
}

func StabilizeFingerprint(system, messages []any) (int, string, string, string, bool) {
	attrIdx := -1
	for i, raw := range system {
		b, ok := raw.(map[string]any)
		if !ok || b["type"] != "text" {
			continue
		}
		s, _ := b["text"].(string)
		if strings.Contains(s, "cc_version=") {
			attrIdx = i
			break
		}
	}
	if attrIdx < 0 {
		return 0, "", "", "", false
	}
	b := system[attrIdx].(map[string]any)
	text := b["text"].(string)
	re := regexp.MustCompile(`cc_version=([^;]+)`)
	m := re.FindStringSubmatch(text)
	if m == nil {
		return 0, "", "", "", false
	}
	full := m[1]
	parts := strings.Split(full, ".")
	if len(parts) < 4 {
		return 0, "", "", "", false
	}
	base := strings.Join(parts[:3], ".")
	old := parts[3]
	real := extractRealUserMessageText(messages)
	legacy := extractFirstMessageText(messages)
	passed := ComputeFingerprint(real, base) == old || ComputeFingerprint(legacy, base) == old
	if !passed {
		return 0, "", "", "", false
	}
	stable := ComputeFingerprint(real, base)
	if stable == old {
		return 0, "", "", "", false
	}
	newText := strings.Replace(text, "cc_version="+full, "cc_version="+base+"."+stable, 1)
	return attrIdx, newText, old, stable, true
}

func AnthropicBillingCleaner(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if !IsAnthropicEndpoint(ctx.RequestPath) {
		return req, nil
	}
	messages, ok := req.Body["messages"].([]any)
	if !ok || len(messages) == 0 {
		return req, nil
	}
	hasChanges := false
	var newSystem []any
	if sys, ok := req.Body["system"].([]any); ok {
		cleaned := make([]any, 0, len(sys))
		changed := false
		for _, raw := range sys {
			b, ok := raw.(map[string]any)
			if ok && b["type"] == "text" {
				if s, ok := b["text"].(string); ok {
					if c, yes, err := CleanBillingHeader(s); err != nil {
						return nil, err
					} else if yes {
						cp := map[string]any{}
						for k, v := range b {
							cp[k] = v
						}
						cp["text"] = c
						cleaned = append(cleaned, cp)
						changed = true
						continue
					}
				}
			}
			cleaned = append(cleaned, raw)
		}
		if changed {
			newSystem = cleaned
			hasChanges = true
		}
		toStabilize := sys
		if newSystem != nil {
			toStabilize = newSystem
		}
		if idx, newText, _, _, ok := StabilizeFingerprint(toStabilize, messages); ok {
			cp := append([]any{}, toStabilize...)
			b := map[string]any{}
			for k, v := range cp[idx].(map[string]any) {
				b[k] = v
			}
			b["text"] = newText
			cp[idx] = b
			newSystem = cp
			hasChanges = true
		}
	}
	newMessages := make([]any, 0, len(messages))
	for _, raw := range messages {
		msg, ok := raw.(map[string]any)
		if !ok || msg["role"] != "system" {
			newMessages = append(newMessages, raw)
			continue
		}
		var newContent any
		set := false
		switch c := msg["content"].(type) {
		case string:
			if cleaned, yes, err := CleanBillingHeader(c); err != nil {
				return nil, err
			} else if yes {
				newContent = cleaned
				set = true
				hasChanges = true
			}
		case []any:
			cp := make([]any, 0, len(c))
			changed := false
			for _, rb := range c {
				b, ok := rb.(map[string]any)
				if ok && b["type"] == "text" {
					if s, ok := b["text"].(string); ok {
						if t, yes, err := CleanBillingHeader(s); err != nil {
							return nil, err
						} else if yes {
							nb := map[string]any{}
							for k, v := range b {
								nb[k] = v
							}
							nb["text"] = t
							cp = append(cp, nb)
							changed = true
							continue
						}
					}
				}
				cp = append(cp, rb)
			}
			if changed {
				newContent = cp
				set = true
				hasChanges = true
			}
		}
		if set {
			nm := map[string]any{}
			for k, v := range msg {
				nm[k] = v
			}
			nm["content"] = newContent
			newMessages = append(newMessages, nm)
		} else {
			newMessages = append(newMessages, raw)
		}
	}
	newHeaders := map[string]string{}
	for k, v := range req.Headers {
		newHeaders[k] = v
	}
	if _, ok := newHeaders["x-anthropic-billing-header"]; ok {
		delete(newHeaders, "x-anthropic-billing-header")
		hasChanges = true
	}
	if !hasChanges {
		return req, nil
	}
	newBody := map[string]any{}
	for k, v := range req.Body {
		newBody[k] = v
	}
	newBody["messages"] = newMessages
	if newSystem != nil {
		newBody["system"] = newSystem
	}
	return &UpstreamRequest{URL: req.URL, Headers: newHeaders, Body: newBody}, nil
}
