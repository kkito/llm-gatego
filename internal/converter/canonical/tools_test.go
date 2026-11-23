package canonical

import "testing"

// Mirrors tests/converters/canonical/tools.test.ts (7 cases).
func TestEnsureToolParameters(t *testing.T) {
	tools := func(v ...any) any { return append([]any{}, v...) }
	t.Run("OpenAI chat missing parameters", func(t *testing.T) {
		out := EnsureToolParameters(tools(map[string]any{"type":"function","function":map[string]any{"name":"cron_list","description":"d"}})).([]any)
		p := out[0].(map[string]any)["function"].(map[string]any)["parameters"].(map[string]any)
		if p["type"] != "object" { t.Fatalf("%+v", p) }
	})
	t.Run("existing parameters preserved", func(t *testing.T) {
		params := map[string]any{"type":"object","properties":map[string]any{"a":map[string]any{"type":"string"}}}
		tool := map[string]any{"type":"function","function":map[string]any{"name":"x","parameters":params}}
		out := EnsureToolParameters(tools(tool)).([]any)
		if out[0].(map[string]any)["function"].(map[string]any)["parameters"].(map[string]any)["properties"] == nil { t.Fatalf("%+v", out) }
	})
	t.Run("Responses flat missing parameters", func(t *testing.T) {
		out := EnsureToolParameters(tools(map[string]any{"type":"function","name":"cron_list"})).([]any)
		if out[0].(map[string]any)["parameters"] == nil { t.Fatalf("%+v", out) }
	})
	t.Run("Anthropic bare missing input_schema", func(t *testing.T) {
		out := EnsureToolParameters(tools(map[string]any{"name":"cron_list"})).([]any)
		if out[0].(map[string]any)["input_schema"] == nil { t.Fatalf("%+v", out) }
	})
	t.Run("non-function built-in preserved", func(t *testing.T) {
		builtin := map[string]any{"type":"web_search","external_web_access":false}
		out := EnsureToolParameters(tools(builtin)).([]any)
		if out[0].(map[string]any)["type"] != "web_search" { t.Fatalf("%+v", out) }
	})
	t.Run("non-array input", func(t *testing.T) {
		if EnsureToolParameters(nil) != nil { t.Fatal("expected nil") }
	})
	t.Run("fresh default objects", func(t *testing.T) {
		out := EnsureToolParameters(tools(map[string]any{"type":"function","function":map[string]any{"name":"a"}}, map[string]any{"type":"function","function":map[string]any{"name":"b"}})).([]any)
		p1 := out[0].(map[string]any)["function"].(map[string]any)["parameters"]
		p2 := out[1].(map[string]any)["function"].(map[string]any)["parameters"]
		p1.(map[string]any)["type"] = "mutated"
		if p2.(map[string]any)["type"] == "mutated" { t.Fatal("shared default object") }
	})
}
