package proxy

import (
	"reflect"
	"testing"
)

func TestMergeDefaultParams(t *testing.T) {
	defaults := map[string]any{"temperature": 0.5, "max_tokens": 2048, "extra_body": map[string]any{"thinking": map[string]any{"type": "enabled"}, "top_k": 50}}
	body := map[string]any{"temperature": 0.8, "extra_body": map[string]any{"thinking": map[string]any{"type": "disabled"}}}
	got := mergeDefaultParams(body, defaults)
	if got["temperature"] != 0.8 || got["max_tokens"] != 2048 { t.Fatal(got) }
	eb := got["extra_body"].(map[string]any)
	th := eb["thinking"].(map[string]any)
	if th["type"] != "disabled" || eb["top_k"] != 50 { t.Fatal(eb) }
	// defaults must not be mutated
	if !reflect.DeepEqual(defaults["extra_body"], map[string]any{"thinking": map[string]any{"type": "enabled"}, "top_k": 50}) { t.Fatal(defaults) }
}
