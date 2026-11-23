package converter

import "testing"

func TestResolveConverterChainPassthrough(t *testing.T) {
	p, err := ResolveConverterChain("openai", "chat")
	if err != nil { t.Fatal(err) }
	if !p.Passthrough { t.Fatal("expected passthrough for openai→chat") }
	p2, err := ResolveConverterChain("response-api", "responses")
	if err != nil { t.Fatal(err) }
	if !p2.Passthrough { t.Fatal("expected passthrough for response-api→responses") }
	p3, err := ResolveConverterChain("chat", "anthropic")
	if err != nil { t.Fatal(err) }
	if p3.Passthrough { t.Fatal("expected conversion for chat→anthropic") }
	if _, err := ResolveConverterChain("bogus", "chat"); err == nil { t.Fatal("expected error") }
}

func TestMergeModelParamsDeep(t *testing.T) {
	defaults := map[string]any{"temperature": 0.7, "nested": map[string]any{"a": 1, "b": 2}, "arr": []any{1, 2}}
	body := map[string]any{"temperature": 0.2, "nested": map[string]any{"b": 9}, "arr": []any{3}}
	got := MergeModelParams(defaults, body)
	if got["temperature"] != 0.2 { t.Fatalf("%v", got) }
	n := got["nested"].(map[string]any)
	if n["a"] != 1 || n["b"] != 9 { t.Fatalf("%v", n) }
	if len(got["arr"].([]any)) != 1 { t.Fatalf("%v", got["arr"]) }
	if defaults["temperature"] != 0.7 { t.Fatal("input mutated") }
}
