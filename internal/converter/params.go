package converter

func MergeModelParams(defaults, override map[string]any) map[string]any {
	if defaults == nil {
		return cloneMap(override)
	}
	if override == nil {
		return cloneMap(defaults)
	}
	return deepMerge(defaults, override).(map[string]any)
}

func deepMerge(base, override any) any {
	o, isObj := override.(map[string]any)
	if !isObj {
		return cloneAny(override)
	}
	b, isObj := base.(map[string]any)
	if !isObj {
		return cloneAny(override)
	}
	result := cloneMap(b)
	for k, v := range o {
		if existing, ok := result[k]; ok {
			result[k] = deepMerge(existing, v)
		} else {
			result[k] = cloneAny(v)
		}
	}
	return result
}

func cloneMap(m map[string]any) map[string]any {
	out := make(map[string]any, len(m))
	for k, v := range m { out[k] = cloneAny(v) }
	return out
}

func cloneAny(v any) any {
	switch t := v.(type) {
	case map[string]any:
		return cloneMap(t)
	case []any:
		out := make([]any, len(t))
		copy(out, t)
		return out
	default:
		return v
	}
}
