package privacy

import (
	"github.com/kkito/llm-gatego/internal/config"
	"strings"
	"testing"
)

// Mirrors 4 privacy test files (26 cases).
func TestPrivacy(t *testing.T) {
	t.Run("whitelist keeps safe fields", func(t *testing.T) {
		b := map[string]any{"messages": 1, "stream": true, "model": "gpt-4", "user": "x"}
		out := FilterWhitelistedFields(b, "req")
		if len(out) != 2 || out["messages"] != 1 || out["stream"] != true {
			t.Fatal(out)
		}
	})
	t.Run("whitelist empty", func(t *testing.T) {
		if len(FilterWhitelistedFields(map[string]any{"a": 1}, "r")) != 0 {
			t.Fatal("filtered")
		}
	})
	t.Run("whitelist all safe fields", func(t *testing.T) {
		safe := []string{"messages", "stream", "temperature", "max_tokens", "top_p", "presence_penalty", "frequency_penalty", "stop", "response_format", "tools", "tool_choice", "seed", "stream_options", "reasoning_effort", "extra_body"}
		b := map[string]any{}
		for _, k := range safe {
			b[k] = 1
		}
		if len(FilterWhitelistedFields(b, "r")) != len(safe) {
			t.Fatal("lost fields")
		}
	})
	t.Run("strip user", func(t *testing.T) {
		b := map[string]any{"user": "u", "messages": 1}
		StripUserField(b, "r")
		if _, ok := b["user"]; ok {
			t.Fatal("not stripped")
		}
	})
	t.Run("strip user absent", func(t *testing.T) {
		b := map[string]any{"messages": 1}
		StripUserField(b, "r")
		if len(b) != 1 {
			t.Fatal("changed")
		}
	})
	t.Run("disabled no-op", func(t *testing.T) {
		b := map[string]any{"user": "u", "model": "g"}
		got := ApplyProtection(b, config.PrivacySettings{Enabled: false}, "r")
		if len(got) != 2 {
			t.Fatal("changed")
		}
	})
	t.Run("enabled full order", func(t *testing.T) {
		b := map[string]any{"user": "u", "model": "g", "messages": []any{map[string]any{"role": "user", "content": "read /home/alice/file.txt"}}}
		s := config.PrivacySettings{Enabled: true, WhitelistFilter: true, StripUserField: true, SanitizeFilePaths: true, PathPlaceholder: "USER"}
		got := ApplyProtection(b, s, "req-1")
		if _, ok := got["user"]; ok {
			t.Fatal("user")
		}
		if _, ok := got["model"]; ok {
			t.Fatal("model")
		}
		content := asStr(asMap(asSlice(got["messages"])[0])["content"])
		if strings.Contains(content, "alice") {
			t.Fatal(content)
		}
	})
	t.Run("sanitize linux", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": "file /home/alice/foo.txt"}
		SanitizePaths(b, "USER", "l1")
		if strings.Contains(asStr(b["text"]), "alice") {
			t.Fatal(b)
		}
		RestorePaths(b, "l1")
		if !strings.Contains(asStr(b["text"]), "/home/alice/foo.txt") {
			t.Fatal(b)
		}
	})
	t.Run("sanitize mac", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": "file /Users/bob/foo.txt"}
		SanitizePaths(b, "USER", "m1")
		if strings.Contains(asStr(b["text"]), "bob") {
			t.Fatal(b)
		}
		RestorePaths(b, "m1")
		if !strings.Contains(asStr(b["text"]), "/Users/bob/foo.txt") {
			t.Fatal(b)
		}
	})
	t.Run("sanitize windows", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": `file C:\Users\carol\foo.txt`}
		SanitizePaths(b, "USER", "w1")
		if strings.Contains(asStr(b["text"]), "carol") {
			t.Fatal(b)
		}
		RestorePaths(b, "w1")
		if !strings.Contains(asStr(b["text"]), "carol") {
			t.Fatal(b)
		}
	})
	t.Run("sanitize nested", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"messages": []any{map[string]any{"content": []any{map[string]any{"text": "see /home/dave/x"}}}}}
		SanitizePaths(b, "USER", "n1")
		if strings.Contains(asStr(asMap(asSlice(asMap(asSlice(b["messages"])[0])["content"])[0])["text"]), "dave") {
			t.Fatal(b)
		}
	})
	t.Run("no paths no mapping", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": "no paths"}
		SanitizePaths(b, "USER", "none")
		RestorePaths(b, "none")
		if asStr(b["text"]) != "no paths" {
			t.Fatal(b)
		}
	})
	t.Run("mapping cleared after restore", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": "/home/eve/x"}
		SanitizePaths(b, "USER", "c1")
		RestorePaths(b, "c1")
		SanitizeSSEChunk("/home/USER/x", "c1")
		if strings.Contains(asStr(b["text"]), "USER") {
			t.Fatal(b)
		}
	})
	t.Run("restore unknown request", func(t *testing.T) {
		b := map[string]any{"text": "unchanged"}
		RestorePaths(b, "unknown")
		if asStr(b["text"]) != "unchanged" {
			t.Fatal(b)
		}
	})
	t.Run("SSE chunk restore", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": "/home/frank/x"}
		SanitizePaths(b, "USER", "sse")
		chunk := SanitizeSSEChunk("data: /home/USER/x", "sse")
		if !strings.Contains(chunk, "/home/frank/x") {
			t.Fatal(chunk)
		}
		if SanitizeSSEChunk("data: /home/USER/x", "sse") != chunk {
			t.Fatal("mapping lost")
		}
	})
	t.Run("SSE chunk no mapping", func(t *testing.T) {
		if SanitizeSSEChunk("data: x", "no-map") != "data: x" {
			t.Fatal("changed")
		}
	})
	t.Run("clear mappings", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": "/home/grace/x"}
		SanitizePaths(b, "USER", "cm")
		ClearPathMappings()
		out := SanitizeSSEChunk("/home/USER/x", "cm")
		if strings.Contains(out, "grace") {
			t.Fatal(out)
		}
	})
	t.Run("multiple users", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"a": "/home/u1/x", "b": "/Users/u2/y"}
		SanitizePaths(b, "USER", "mu")
		if strings.Contains(asStr(b["a"]), "u1") || strings.Contains(asStr(b["b"]), "u2") {
			t.Fatal(b)
		}
		RestorePaths(b, "mu")
		if !strings.Contains(asStr(b["a"]), "/home/u1/x") || !strings.Contains(asStr(b["b"]), "/Users/u2/y") {
			t.Fatal(b)
		}
	})
	t.Run("placeholder repeated", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"a": "/home/u1/x /home/u1/y"}
		SanitizePaths(b, "USER", "rep")
		RestorePaths(b, "rep")
		if asStr(b["a"]) != "/home/u1/x /home/u1/y" {
			t.Fatal(b)
		}
	})
	t.Run("array sanitize", func(t *testing.T) {
		ClearPathMappings()
		b := []any{"see /home/henry/x"}
		SanitizePaths(b, "USER", "arr")
		if strings.Contains(asStr(b[0]), "henry") {
			t.Fatal(b)
		}
		RestorePaths(b, "arr")
		if !strings.Contains(asStr(b[0]), "henry") {
			t.Fatal(b)
		}
	})
	t.Run("whitelist before strip", func(t *testing.T) {
		b := map[string]any{"user": "x", "messages": 1, "other": 2}
		got := ApplyProtection(b, config.PrivacySettings{Enabled: true, WhitelistFilter: true, StripUserField: true}, "w")
		if len(got) != 1 {
			t.Fatal(got)
		}
	})
	t.Run("sanitize only", func(t *testing.T) {
		b := map[string]any{"user": "x", "text": "/home/ivan/f"}
		got := ApplyProtection(b, config.PrivacySettings{Enabled: true, SanitizeFilePaths: true, PathPlaceholder: "U"}, "so")
		if _, ok := got["user"]; !ok {
			t.Fatal("user removed")
		}
		if strings.Contains(asStr(got["text"]), "ivan") {
			t.Fatal(got)
		}
	})
	t.Run("whitelist only", func(t *testing.T) {
		b := map[string]any{"messages": 1, "model": "g"}
		got := ApplyProtection(b, config.PrivacySettings{Enabled: true, WhitelistFilter: true}, "wo")
		if len(got) != 1 {
			t.Fatal(got)
		}
	})
	t.Run("empty body", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{}
		got := ApplyProtection(b, config.PrivacySettings{Enabled: true, WhitelistFilter: true, SanitizeFilePaths: true, PathPlaceholder: "U"}, "e")
		if len(got) != 0 {
			t.Fatal(got)
		}
	})
	t.Run("custom placeholder", func(t *testing.T) {
		ClearPathMappings()
		b := map[string]any{"text": "/home/judy/x"}
		SanitizePaths(b, "REDACTED", "cp")
		if !strings.Contains(asStr(b["text"]), "/home/REDACTED/") {
			t.Fatal(b)
		}
	})
}
func asStr(v any) string         { s, _ := v.(string); return s }
func asMap(v any) map[string]any { m, _ := v.(map[string]any); return m }
func asSlice(v any) []any        { a, _ := v.([]any); return a }
