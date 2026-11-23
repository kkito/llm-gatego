package util

// RepairToolParameters ensures every tool function has a non-nil parameters object.
func RepairToolParameters(body map[string]any) {
	tools, ok := body["tools"].([]any)
	if !ok { return }
	for _, item := range tools {
		tool, ok := item.(map[string]any)
		if !ok { continue }
		fn, ok := tool["function"].(map[string]any)
		if !ok { continue }
		if fn["parameters"] == nil {
			fn["parameters"] = map[string]any{"type": "object", "properties": map[string]any{}}
		}
	}
}
