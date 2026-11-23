package interceptor

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/config"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"
)

// Mirrors claude-code-normalize.test.ts (42 cases).
func TestClaudeCodeNormalize(t *testing.T) {
	ctx := func(path string) *Context { return &Context{Provider: &config.ProviderConfig{}, RequestPath: path} }
	t.Run("skip path", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/chat/completions"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("process path", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "SessionStart:resume hook success:"}}}}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if got == r {
			t.Fatal("unchanged")
		}
	})
	t.Run("skip empty body", func(t *testing.T) {
		r := &UpstreamRequest{}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	// session start (5)
	t.Run("resume", func(t *testing.T) {
		s, n := NormalizeSessionStartText("SessionStart:resume hook success: x")
		if n == 0 || strings.Contains(s, "resume") {
			t.Fatal(s)
		}
	})
	t.Run("session id", func(t *testing.T) {
		s, n := NormalizeSessionStartText("SessionStart:x\n<session-id>abc</session-id>")
		if n == 0 || strings.Contains(s, "session-id") {
			t.Fatal(s)
		}
	})
	t.Run("last active", func(t *testing.T) {
		s, n := NormalizeSessionStartText("SessionStart:x\nLast active: today")
		if n == 0 || strings.Contains(s, "Last active") {
			t.Fatal(s)
		}
	})
	t.Run("all three", func(t *testing.T) {
		s, n := NormalizeSessionStartText("SessionStart:resume hook success:\n<session-id>x</session-id>\nLast active: y")
		if n != 3 || strings.Contains(s, "resume") || strings.Contains(s, "session-id") || strings.Contains(s, "Last active") {
			t.Fatalf("%q %d", s, n)
		}
	})
	t.Run("no session", func(t *testing.T) {
		if s, n := NormalizeSessionStartText("normal text"); n != 0 || s != "normal text" {
			t.Fatal(s)
		}
	})
	// tool use input (5)
	toolBody := func() map[string]any {
		return map[string]any{"messages": []any{map[string]any{"role": "assistant", "content": []any{map[string]any{"type": "tool_use", "name": "format", "input": map[string]any{"z_value": "z", "a_value": "a", "m_value": "m", "extra": "x"}}}}}, "tools": []any{map[string]any{"name": "format", "input_schema": map[string]any{"properties": map[string]any{"a_value": 1, "m_value": 1, "z_value": 1}}}}}
	}
	t.Run("strip extras", func(t *testing.T) {
		b := toolBody()
		if n := NormalizeToolUseInputsInBody(b); n != 1 {
			t.Fatal(n)
		}
		input := asMap(asSlice(asMap(asSlice(b["messages"])[0])["content"])[0])["input"]
		if _, ok := asMap(input)["extra"]; ok {
			t.Fatal(input)
		}
	})
	t.Run("canonical order", func(t *testing.T) {
		b := toolBody()
		NormalizeToolUseInputsInBody(b)
		input := asMap(asSlice(asMap(asSlice(b["messages"])[0])["content"])[0])["input"]
		keys := []string{}
		for k := range asMap(input) {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		if !reflect.DeepEqual(keys, []string{"a_value", "m_value", "z_value"}) {
			t.Fatal(keys)
		}
	})
	t.Run("unknown tool", func(t *testing.T) {
		b := toolBody()
		asMap(asSlice(asMap(asSlice(b["messages"])[0])["content"])[0])["name"] = "unknown"
		if n := NormalizeToolUseInputsInBody(b); n != 0 {
			t.Fatal(n)
		}
	})
	t.Run("no tools", func(t *testing.T) {
		b := toolBody()
		delete(b, "tools")
		if n := NormalizeToolUseInputsInBody(b); n != 0 {
			t.Fatal(n)
		}
	})
	t.Run("non-assistant", func(t *testing.T) {
		b := toolBody()
		asMap(asSlice(b["messages"])[0])["role"] = "user"
		if n := NormalizeToolUseInputsInBody(b); n != 0 {
			t.Fatal(n)
		}
	})
	// deferred tools (7)
	t.Run("find block", func(t *testing.T) {
		b := map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "x " + DeferredAvailable}}}}}
		mi, bi, text, ok := FindDeferredToolsBlock(b)
		if !ok || mi != 0 || bi != 0 || !strings.Contains(text, DeferredAvailable) {
			t.Fatal(mi, bi, text, ok)
		}
	})
	t.Run("no block", func(t *testing.T) {
		b := map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "normal"}}}}}
		if _, _, _, ok := FindDeferredToolsBlock(b); ok {
			t.Fatal("found")
		}
	})
	t.Run("no messages", func(t *testing.T) {
		if _, _, _, ok := FindDeferredToolsBlock(map[string]any{}); ok {
			t.Fatal("found")
		}
	})
	t.Run("skip non-user", func(t *testing.T) {
		b := map[string]any{"messages": []any{map[string]any{"role": "assistant", "content": []any{map[string]any{"type": "text", "text": DeferredAvailable}}}}}
		if _, _, _, ok := FindDeferredToolsBlock(b); ok {
			t.Fatal("found")
		}
	})
	t.Run("snapshot path deterministic", func(t *testing.T) {
		if DeferredToolsSnapshotPath("k") != DeferredToolsSnapshotPath("k") {
			t.Fatal("different")
		}
		if DeferredToolsSnapshotPath("a") == DeferredToolsSnapshotPath("b") {
			t.Fatal("same")
		}
		if !strings.Contains(DeferredToolsSnapshotPath("k"), "cache-fix-state") {
			t.Fatal("dir")
		}
	})
	// sticky hash (5)
	t.Run("tool_use hash", func(t *testing.T) {
		h := ComputeStickyMessageHash(map[string]any{"role": "assistant", "content": []any{map[string]any{"type": "tool_use", "id": "x"}}})
		if len(h) != 16 {
			t.Fatal(h)
		}
	})
	t.Run("tool_result hash", func(t *testing.T) {
		h := ComputeStickyMessageHash(map[string]any{"role": "user", "content": []any{map[string]any{"type": "tool_result", "tool_use_id": "x"}}})
		if len(h) != 16 {
			t.Fatal(h)
		}
	})
	t.Run("text hash", func(t *testing.T) {
		h := ComputeStickyMessageHash(map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "x"}}})
		if len(h) != 16 {
			t.Fatal(h)
		}
	})
	t.Run("empty content", func(t *testing.T) {
		if ComputeStickyMessageHash(map[string]any{"content": []any{}}) != "" {
			t.Fatal("hash")
		}
	})
	t.Run("invalid input", func(t *testing.T) {
		if ComputeStickyMessageHash(nil) != "" {
			t.Fatal("hash")
		}
	})
	// sticky state (8)
	t.Run("track markers", func(t *testing.T) {
		b := map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "x", "cache_control": map[string]any{"type": "ephemeral"}}}}}}
		s, m := UpdateStickyState(b, StickyState{Version: 1, Positions: []StickyPosition{}})
		if len(s.Positions) != 1 || len(m) != 0 {
			t.Fatalf("%+v %+v", s, m)
		}
	})
	t.Run("cap positions", func(t *testing.T) {
		msgs := []any{}
		for i := 0; i < 4; i++ {
			msgs = append(msgs, map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": string(rune('a' + i)), "cache_control": map[string]any{"type": "ephemeral"}}}})
		}
		s, _ := UpdateStickyState(map[string]any{"messages": msgs}, StickyState{Version: 1, Positions: []StickyPosition{}})
		if len(s.Positions) > StickyMaxPositions {
			t.Fatal(len(s.Positions))
		}
	})
	t.Run("no positions", func(t *testing.T) {
		b := map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "x"}}}}}
		_, m := UpdateStickyState(b, StickyState{Version: 1, Positions: []StickyPosition{}})
		if len(m) != 0 {
			t.Fatal(m)
		}
	})
	t.Run("invalid body", func(t *testing.T) {
		s, m := UpdateStickyState(map[string]any{}, StickyState{Version: 1})
		if len(s.Positions) != 0 || len(m) != 0 {
			t.Fatal("changed")
		}
	})
	tmp := t.TempDir()
	oldDir := StickyDir
	StickyDir = tmp
	t.Cleanup(func() { StickyDir = oldDir })
	t.Run("roundtrip state", func(t *testing.T) {
		key := "roundtrip"
		WriteStickyState(key, StickyState{Version: 1, Positions: []StickyPosition{{MsgHash: "abc", PositionHint: "last_block", Marker: map[string]any{"type": "ephemeral"}}}})
		s := ReadStickyState(key)
		if len(s.Positions) != 1 || s.Positions[0].MsgHash != "abc" {
			t.Fatalf("%+v", s)
		}
	})
	t.Run("missing file", func(t *testing.T) {
		s := ReadStickyState("nonexistent-key")
		if len(s.Positions) != 0 {
			t.Fatal(s)
		}
	})
	t.Run("interceptor no mutate no changes", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "hi"}}}}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("interceptor no mutate with changes", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "SessionStart:resume hook success:"}}}}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if got == r {
			t.Fatal("no copy")
		}
		if strings.Contains(asStr(asMap(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])[0])["text"]), "resume") {
			t.Fatal(got.Body)
		}
		if !strings.Contains(asStr(asMap(asSlice(asMap(asSlice(r.Body["messages"])[0])["content"])[0])["text"]), "resume") {
			t.Fatal("mutated original")
		}
	})
	t.Run("normalize user text", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "SessionStart:resume hook success: x"}}}}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if !strings.Contains(asStr(asMap(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])[0])["text"]), "startup") {
			t.Fatal(got.Body)
		}
	})
	t.Run("normalize tool result", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "tool_result", "content": "SessionStart:resume hook success: x"}}}}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if !strings.Contains(asStr(asMap(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])[0])["content"]), "startup") {
			t.Fatal(got.Body)
		}
	})
	t.Run("strip tool input", func(t *testing.T) {
		r := &UpstreamRequest{Body: toolBody()}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if got == r {
			t.Fatal("no change")
		}
	})
	// deferred snapshot/restore
	oldSnap := DeferredSnapshotDir
	DeferredSnapshotDir = tmp
	t.Cleanup(func() { DeferredSnapshotDir = oldSnap })
	full := DeferredAvailable + "\n- tool_a\n- tool_b\n- tool_c: full description with lots of detail for restore test"
	unavail := DeferredAvailable + "\n- tool_a\n" + DeferredUnavailable + "\n- tool_b"
	t.Run("persist snapshot", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": full}}}}}}
		ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if _, err := os.Stat(DeferredToolsSnapshotPath(wd())); err != nil {
			t.Fatal(err)
		}
	})
	t.Run("restore snapshot", func(t *testing.T) {
		_ = os.WriteFile(DeferredToolsSnapshotPath(wd()), []byte(full), 0644)
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": unavail}}}}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		text := asStr(asMap(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])[0])["text"])
		if text != full {
			t.Fatal(text)
		}
	})
	t.Run("no snapshot", func(t *testing.T) {
		_ = os.Remove(DeferredToolsSnapshotPath(wd()))
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": unavail}}}}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("same body no changes", func(t *testing.T) {
		r := &UpstreamRequest{Body: map[string]any{"messages": []any{}}}
		got, _ := ClaudeCodeNormalize(r, ctx("/v1/messages"))
		b1, _ := json.Marshal(got.Body)
		b2, _ := json.Marshal(r.Body)
		if string(b1) != string(b2) {
			t.Fatal("changed")
		}
	})
	_ = filepath.Join
}
