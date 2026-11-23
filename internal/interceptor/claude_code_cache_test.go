package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
	"strings"
	"testing"
)

// Mirrors claude-code-cache.test.ts (76 cases).
func TestClaudeCodeCache(t *testing.T) {
	// trailing reminder peel (4)
	t.Run("peel trailing", func(t *testing.T) {
		s, rem, ok := peelTrailingReminder("text\n\n<system-reminder>\nremember\n</system-reminder>")
		if !ok || !strings.Contains(rem, "remember") || s != "text" {
			t.Fatalf("%q %q %v", s, rem, ok)
		}
	})
	t.Run("peel trailing whitespace", func(t *testing.T) {
		if _, _, ok := peelTrailingReminder("text\n\n<system-reminder>\nx\n</system-reminder>  \n"); !ok {
			t.Fatal("no match")
		}
	})
	t.Run("no match text after", func(t *testing.T) {
		if _, _, ok := peelTrailingReminder("<system-reminder>\nx\n</system-reminder> trailing"); ok {
			t.Fatal("matched")
		}
	})
	t.Run("no match partial", func(t *testing.T) {
		if _, _, ok := peelTrailingReminder("text\n\n<system-reminder>\nx"); ok {
			t.Fatal("matched")
		}
	})
	// split smooshed (8)
	t.Run("peel from tool_result", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "tool_result", "content": "result\n\n<system-reminder>\nnote\n</system-reminder>"}}}}
		out, n := splitSmooshedReminders(msgs)
		if n != 1 || len(asSlice(asMap(out[0])["content"])) != 2 {
			t.Fatalf("%+v %d", out, n)
		}
	})
	t.Run("peel multiple", func(t *testing.T) {
		s := "result\n\n<system-reminder>\na\n</system-reminder>\n\n<system-reminder>\nb\n</system-reminder>"
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "tool_result", "content": s}}}}
		out, n := splitSmooshedReminders(msgs)
		if n != 2 || len(asSlice(asMap(out[0])["content"])) != 3 {
			t.Fatalf("%+v %d", out, n)
		}
	})
	t.Run("no reminder", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "tool_result", "content": "result"}}}}
		out, _ := splitSmooshedReminders(msgs)
		if len(out) != 1 {
			t.Fatal(out)
		}
	})
	t.Run("non-user", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "assistant", "content": []any{map[string]any{"type": "tool_result", "content": "x\n\n<system-reminder>\ny\n</system-reminder>"}}}}
		_, n := splitSmooshedReminders(msgs)
		if n != 0 {
			t.Fatal(n)
		}
	})
	t.Run("non-array content", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": "x"}}
		_, n := splitSmooshedReminders(msgs)
		if n != 0 {
			t.Fatal(n)
		}
	})
	t.Run("empty messages", func(t *testing.T) {
		if _, n := splitSmooshedReminders([]any{}); n != 0 {
			t.Fatal(n)
		}
	})
	t.Run("non-array input", func(t *testing.T) {
		if _, n := splitSmooshedReminders(nil); n != 0 {
			t.Fatal(n)
		}
	})
	t.Run("skip no mutation", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "tool_result", "content": "x"}}}}
		out, _ := splitSmooshedReminders(msgs)
		if len(out) != 1 {
			t.Fatal(out)
		}
	})
	// skills/deferred detection (5)
	t.Run("detect skills", func(t *testing.T) {
		if !IsSkillsBlock("User-invocable skills: x") {
			t.Fatal("no")
		}
		if IsSkillsBlock("normal") {
			t.Fatal("yes")
		}
		if IsSkillsBlock(42) {
			t.Fatal("yes")
		}
	})
	t.Run("detect deferred", func(t *testing.T) {
		if !IsDeferredToolsBlock("deferred tools are now available") {
			t.Fatal("no")
		}
		if IsDeferredToolsBlock("normal") {
			t.Fatal("yes")
		}
		if IsDeferredToolsBlock(nil) {
			t.Fatal("yes")
		}
	})
	// sorting (6)
	t.Run("sort skills", func(t *testing.T) {
		in := "User-invocable skills header\n\n- z\n- a\n</system-reminder>\n"
		out := sortSkillsBlock(in)
		if !strings.HasPrefix(out, "User-invocable skills header\n\n- a\n- z") {
			t.Fatal(out)
		}
	})
	t.Run("no skills pattern", func(t *testing.T) {
		in := "just text"
		if sortSkillsBlock(in) != in {
			t.Fatal("changed")
		}
	})
	t.Run("already sorted", func(t *testing.T) {
		in := "User-invocable skills header\n\n- a\n- z\n</system-reminder>\n"
		if sortSkillsBlock(in) != in {
			t.Fatal("changed")
		}
	})
	t.Run("sort deferred", func(t *testing.T) {
		in := "<system-reminder>\nThe following deferred tools are now available\nzeta\nalpha\n</system-reminder>\n"
		out := sortDeferredToolsBlock(in)
		if !strings.Contains(out, "alpha\nzeta") {
			t.Fatal(out)
		}
	})
	t.Run("no deferred pattern", func(t *testing.T) {
		in := "text"
		if sortDeferredToolsBlock(in) != in {
			t.Fatal("changed")
		}
	})
	t.Run("sort system blocks", func(t *testing.T) {
		sys := []any{map[string]any{"type": "text", "text": "User-invocable skills header\n\n- z\n- a\n</system-reminder>\n"}}
		out, changed := sortSystemBlocks(sys)
		if !changed || !strings.Contains(asStr(asMap(out[0])["text"]), "- a\n- z") {
			t.Fatal(out)
		}
	})
	t.Run("sort deferred system", func(t *testing.T) {
		sys := []any{map[string]any{"type": "text", "text": "<system-reminder>\nThe following deferred tools are now available\nz\na\n</system-reminder>\n"}}
		out, changed := sortSystemBlocks(sys)
		if !changed {
			t.Fatal(out)
		}
	})
	t.Run("skip non-text system", func(t *testing.T) {
		sys := []any{map[string]any{"type": "image"}}
		_, changed := sortSystemBlocks(sys)
		if changed {
			t.Fatal("changed")
		}
	})
	t.Run("sort tools", func(t *testing.T) {
		tools := []any{map[string]any{"name": "z"}, map[string]any{"name": "a"}}
		out, changed := sortTools(tools)
		if !changed || asMap(out[0])["name"] != "a" {
			t.Fatal(out)
		}
	})
	t.Run("empty tools", func(t *testing.T) {
		if _, changed := sortTools([]any{}); changed {
			t.Fatal("changed")
		}
	})
	t.Run("nil tools", func(t *testing.T) {
		if _, changed := sortTools(nil); changed {
			t.Fatal("changed")
		}
	})
	// clear artifacts (5)
	t.Run("caveat", func(t *testing.T) {
		if _, ok := stripClearArtifacts([]any{map[string]any{"text": "<local-command-caveat>x"}}); !ok {
			t.Fatal("no")
		}
	})
	t.Run("command name", func(t *testing.T) {
		if _, ok := stripClearArtifacts([]any{map[string]any{"text": "<command-name>x"}}); !ok {
			t.Fatal("no")
		}
	})
	t.Run("stdout", func(t *testing.T) {
		if _, ok := stripClearArtifacts([]any{map[string]any{"text": "<local-command-stdout>x"}}); !ok {
			t.Fatal("no")
		}
	})
	t.Run("no artifacts", func(t *testing.T) {
		if _, ok := stripClearArtifacts([]any{map[string]any{"text": "normal"}}); ok {
			t.Fatal("yes")
		}
	})
	t.Run("empty content", func(t *testing.T) {
		if _, ok := stripClearArtifacts([]any{}); ok {
			t.Fatal("yes")
		}
	})
	// relocatable detection (11)
	t.Run("hooks", func(t *testing.T) {
		if !isRelocatableBlock("<system-reminder>\nhook success") {
			t.Fatal("no")
		}
	})
	t.Run("skills FS", func(t *testing.T) {
		if !isRelocatableBlock(sr + "The following skills are available") {
			t.Fatal("no")
		}
	})
	t.Run("deferred FS", func(t *testing.T) {
		if !isRelocatableBlock(sr + "The following deferred tools are now available") {
			t.Fatal("no")
		}
	})
	t.Run("mcp", func(t *testing.T) {
		if !isRelocatableBlock(sr + "# MCP Server Instructions") {
			t.Fatal("no")
		}
	})
	t.Run("normal", func(t *testing.T) {
		if isRelocatableBlock("normal") {
			t.Fatal("yes")
		}
	})
	t.Run("non-string", func(t *testing.T) {
		if isRelocatableBlock(42) {
			t.Fatal("yes")
		}
	})
	t.Run("block types", func(t *testing.T) {
		if getBlockType("<system-reminder>\nhook success") != "hooks" {
			t.Fatal("hooks")
		}
		if getBlockType(sr+"The following skills are available") != "skills" {
			t.Fatal("skills")
		}
		if getBlockType(sr+"The following deferred tools are now available") != "deferred" {
			t.Fatal("deferred")
		}
		if getBlockType(sr+"# MCP Server Instructions") != "mcp" {
			t.Fatal("mcp")
		}
		if getBlockType("x") != "" {
			t.Fatal("empty")
		}
	})
	// fix block text (3)
	t.Run("fix skills", func(t *testing.T) {
		t1 := "User-invocable skills header\n\n- z\n- a\n</system-reminder>"
		got := fixBlockText("skills", t1)
		if !strings.Contains(got, "- a\n- z") {
			t.Fatal(got)
		}
	})
	t.Run("fix deferred", func(t *testing.T) {
		t1 := sr + "The following deferred tools are now available\nz\na\n</system-reminder>"
		got := fixBlockText("deferred", t1)
		if !strings.Contains(got, "a\nz") {
			t.Fatal(got)
		}
	})
	t.Run("strip session knowledge", func(t *testing.T) {
		got := fixBlockText("hooks", "<system-reminder>\nhook success\n<session_knowledge>x</session_knowledge>\n</system-reminder>")
		if strings.Contains(got, "session_knowledge") {
			t.Fatal(got)
		}
	})
	// freshSessionSort (4)
	t.Run("strip artifacts first msg", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"text": "<command-name>x"}, map[string]any{"text": "hello"}}}}
		freshSessionSort(msgs)
		if len(asSlice(asMap(msgs[0])["content"])) != 1 {
			t.Fatal(msgs)
		}
	})
	t.Run("sort in place", func(t *testing.T) {
		skillText := "<system-reminder>\nThe following skills are available\n\n- zebra\n- apple\n</system-reminder>"
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "hello"}, map[string]any{"type": "text", "text": skillText}}}}
		freshSessionSort(msgs)
		text := asStr(asMap(asSlice(asMap(msgs[0])["content"])[1])["text"])
		if !strings.Contains(text, "- apple\n- zebra") {
			t.Fatal(text)
		}
	})
	t.Run("relocate scattered", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"text": "hello"}}}, map[string]any{"role": "user", "content": []any{map[string]any{"text": sr + "The following skills are available\nX"}}}}
		freshSessionSort(msgs)
		first := asSlice(asMap(msgs[0])["content"])
		if len(first) != 2 || !isRelocatableBlock(asMap(first[0])["text"]) {
			t.Fatalf("%+v", first)
		}
	})
	t.Run("no first user", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "assistant", "content": []any{}}}
		freshSessionSort(msgs)
		if len(msgs) != 1 {
			t.Fatal("changed")
		}
	})
	// content strip (13)
	t.Run("continue trailer", func(t *testing.T) {
		if !isContinueTrailerBlock(map[string]any{"type": "text", "text": continueTrailer}) {
			t.Fatal("no")
		}
		if isContinueTrailerBlock(map[string]any{"type": "text", "text": "x"}) {
			t.Fatal("yes")
		}
		if isContinueTrailerBlock(nil) {
			t.Fatal("yes")
		}
		if isContinueTrailerBlock(map[string]any{"type": "image", "text": continueTrailer}) {
			t.Fatal("yes")
		}
	})
	for _, tc := range []struct{ name, inner string }{{"token", "Token usage: 10/20; 10 remaining"}, {"output", "Output tokens — turn: 1 · session: 2"}, {"usd", "USD budget: $1.5/$2; $0.5 remaining"}, {"task tools", "The task tools haven't been used recently."}, {"todowrite", "The TodoWrite tool hasn't been used recently."}, {"turns", "Remaining conversation turns: 5"}, {"compact", "Message until auto-compact: soon"}} {
		t.Run("bookkeeping "+tc.name, func(t *testing.T) {
			if !isBookkeepingReminder("<system-reminder>\n" + tc.inner + "\n</system-reminder>") {
				t.Fatal("no")
			}
		})
	}
	t.Run("not reminder", func(t *testing.T) {
		if isBookkeepingReminder("normal") {
			t.Fatal("yes")
		}
		if isBookkeepingReminder(42) {
			t.Fatal("yes")
		}
	})
	t.Run("remove trailer", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "hi"}, map[string]any{"type": "text", "text": continueTrailer}}}}
		out, t1, _ := stripContentBlocks(msgs)
		if t1 != 1 || len(asSlice(asMap(out[0])["content"])) != 1 {
			t.Fatal(out)
		}
	})
	t.Run("remove reminder", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "<system-reminder>\nToken usage: 100/200; 50 remaining\n</system-reminder>"}, map[string]any{"type": "text", "text": "real content"}}}}
		out, _, r := stripContentBlocks(msgs)
		if r != 1 || len(asSlice(asMap(out[0])["content"])) != 1 {
			t.Fatal(out)
		}
	})
	t.Run("remove both", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": continueTrailer}, map[string]any{"type": "text", "text": "<system-reminder>\nToken usage: 1/2; 1 remaining\n</system-reminder>"}, map[string]any{"type": "text", "text": "real content"}}}}
		out, tr, r := stripContentBlocks(msgs)
		if tr != 1 || r != 1 || len(asSlice(asMap(out[0])["content"])) != 1 {
			t.Fatal(out)
		}
	})
	t.Run("skip non-user", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "assistant", "content": []any{map[string]any{"type": "text", "text": continueTrailer}}}}
		_, tr, r := stripContentBlocks(msgs)
		if tr+r != 0 {
			t.Fatal("removed")
		}
	})
	t.Run("no matching", func(t *testing.T) {
		msgs := []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "hi"}}}}
		_, tr, r := stripContentBlocks(msgs)
		if tr+r != 0 {
			t.Fatal("removed")
		}
	})
	t.Run("empty messages", func(t *testing.T) {
		_, tr, r := stripContentBlocks([]any{})
		if tr+r != 0 {
			t.Fatal("removed")
		}
	})
	t.Run("non-array", func(t *testing.T) {
		_, tr, r := stripContentBlocks(nil)
		if tr+r != 0 {
			t.Fatal("removed")
		}
	})
	// full interceptor (6)
	ctx := func(path string) *Context { return &Context{Provider: &config.ProviderConfig{}, RequestPath: path} }
	req := func(b map[string]any) *UpstreamRequest {
		return &UpstreamRequest{URL: "https://api.anthropic.com/v1/messages", Headers: map[string]string{}, Body: b}
	}
	t.Run("skip path", func(t *testing.T) {
		r := req(map[string]any{"messages": []any{}})
		got, _ := ClaudeCodeCache(r, ctx("/v1/chat/completions"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("skip empty body", func(t *testing.T) {
		r := req(map[string]any{})
		got, _ := ClaudeCodeCache(r, ctx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("simple message", func(t *testing.T) {
		r := req(map[string]any{"messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "hi"}}}}})
		got, _ := ClaudeCodeCache(r, ctx("/v1/messages"))
		if len(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])) != 1 {
			t.Fatal(got)
		}
	})
	t.Run("all steps", func(t *testing.T) {
		body := map[string]any{"tools": []any{map[string]any{"name": "z"}, map[string]any{"name": "a"}}, "messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "tool_result", "content": "x\n\n<system-reminder>\ny\n</system-reminder>"}, map[string]any{"type": "text", "text": continueTrailer}}}}}
		got, _ := ClaudeCodeCache(req(body), ctx("/v1/messages"))
		if asMap(asSlice(got.Body["tools"])[0])["name"] != "a" {
			t.Fatal("tools unsorted")
		}
		if len(asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])) != 2 {
			t.Fatal(got.Body)
		}
	})
	t.Run("no mutation", func(t *testing.T) {
		r := req(map[string]any{"tools": []any{map[string]any{"name": "z"}, map[string]any{"name": "a"}}, "messages": []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "hi"}}}}})
		ClaudeCodeCache(r, ctx("/v1/messages"))
		if asMap(asSlice(r.Body["tools"])[0])["name"] != "z" {
			t.Fatal("mutated")
		}
	})
}
