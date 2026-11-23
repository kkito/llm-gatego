package shared

import (
	"encoding/json"
	"strings"
)

type ParseResult struct {
	Event string
	Data  any
}

// ParseSSEData parses a single SSE line. Returns nil for comments, [DONE], invalid JSON, non-data lines.
func ParseSSEData(line string) *ParseResult {
	t := strings.TrimSpace(line)
	if strings.HasPrefix(t, ":") {
		return nil
	}
	if strings.HasPrefix(t, "event:") {
		return &ParseResult{Event: strings.TrimSpace(strings.TrimPrefix(t, "event:"))}
	}
	if !strings.HasPrefix(t, "data:") {
		return nil
	}
	data := strings.TrimSpace(strings.TrimPrefix(t, "data:"))
	if data == "" || data == "[DONE]" {
		return nil
	}
	var v any
	if err := json.Unmarshal([]byte(data), &v); err != nil {
		return nil
	}
	return &ParseResult{Data: v}
}

// ParseSSEBlock parses an SSE block with event/data pairing across multiple lines.
func ParseSSEBlock(block string) []ParseResult {
	var results []ParseResult
	var event string
	var data string
	flush := func() {
		if data == "" {
			return
		}
		r := ParseSSEData("data: " + data)
		if r != nil {
			r.Event = event
			results = append(results, *r)
		}
		event, data = "", ""
	}
	for _, raw := range strings.Split(block, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			flush()
			continue
		}
		if strings.HasPrefix(line, ":") {
			continue
		}
		if strings.HasPrefix(line, "event:") {
			event = strings.TrimSpace(strings.TrimPrefix(line, "event:"))
		} else if strings.HasPrefix(line, "data:") {
			v := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
			if v == "[DONE]" {
				continue
			}
			data = v
		}
	}
	flush()
	if results == nil {
		return []ParseResult{}
	}
	return results
}

func GetMap(m map[string]any, keys ...string) any {
	var cur any = m
	for _, k := range keys {
		obj, ok := cur.(map[string]any)
		if !ok {
			return nil
		}
		cur = obj[k]
	}
	return cur
}
