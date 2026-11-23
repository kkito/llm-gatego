package canonical

var DefaultToolParameters = map[string]any{"type": "object", "properties": map[string]any{}}

// EnsureToolParameters repairs function tools missing parameters/input_schema.
// Non-function built-in tools are preserved as-is. Each default is a fresh object.
func EnsureToolParameters(tools any) any {
	input, ok := tools.([]any)
	if !ok { return tools }
	out := make([]any, len(input))
	for i, raw := range input {
		t, ok := raw.(map[string]any)
		if !ok { out[i] = raw; continue }
		switch {
		case t["type"] == "function" && t["function"] != nil:
			fn, ok := t["function"].(map[string]any)
			if !ok { out[i] = raw; continue }
			if fn["parameters"] == nil {
				clone := cloneTool(t)
				cloneFn := cloneTool(fn)
				cloneFn["parameters"] = freshDefault()
				clone["function"] = cloneFn
				out[i] = clone
			} else {
				out[i] = raw
			}
		case t["type"] == "function" && t["name"] != nil:
			if t["parameters"] == nil {
				clone := cloneTool(t); clone["parameters"] = freshDefault(); out[i] = clone
			} else { out[i] = raw }
		case t["type"] == nil && t["name"] != nil:
			if t["input_schema"] == nil {
				clone := cloneTool(t); clone["input_schema"] = freshDefault(); out[i] = clone
			} else { out[i] = raw }
		default:
			out[i] = raw
		}
	}
	return out
}

func cloneTool(m map[string]any) map[string]any {
	out := make(map[string]any, len(m))
	for k, v := range m { out[k] = v }
	return out
}

func freshDefault() map[string]any {
	return map[string]any{"type": "object", "properties": map[string]any{}}
}
