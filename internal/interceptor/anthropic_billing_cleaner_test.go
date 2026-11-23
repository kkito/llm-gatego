package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
	"regexp"
	"strings"
	"testing"
)

func billingCtx(path string) *Context {
	return &Context{Provider: &config.ProviderConfig{}, RequestPath: path, ClientIP: "192.168.1.1", CustomModel: "my-claude"}
}
func billingUpstream(body map[string]any) *UpstreamRequest {
	return &UpstreamRequest{URL: "https://api.anthropic.com/v1/messages", Headers: map[string]string{"authorization": "Bearer sk-test", "content-type": "application/json"}, Body: body}
}
func sysMsg(content any) map[string]any { return map[string]any{"role": "system", "content": content} }
func billingBlock(version, after string) string {
	return "x-anthropic-billing-header: cc_version=" + version + "; cc_entrypoint=claude-vscode; cch=a8c1e;cc_version=" + version + ";cc_entrypoint=claude-vscode;cch=a8c1e;" + after
}

// Mirrors anthropic-billing-cleaner.test.ts (45 cases).
func TestAnthropicBillingCleaner(t *testing.T) {
	t.Run("skip no messages", func(t *testing.T) {
		r := billingUpstream(map[string]any{"model": "m"})
		got, err := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if err != nil || got != r {
			t.Fatalf("%+v", got)
		}
	})
	t.Run("skip empty messages", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("skip no system role", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{map[string]any{"role": "user", "content": "hello"}}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("regardless of provider type", func(t *testing.T) {
		ctx := billingCtx("/v1/messages")
		ctx.Provider.Provider = config.ProviderType("custom")
		r := billingUpstream(map[string]any{"messages": []any{sysMsg("x-anthropic-billing-header: cc_version=2.1.0; cc_entrypoint=claude-vscode; cch=abc;正常内容。")}})
		got, _ := AnthropicBillingCleaner(r, ctx)
		if asMap(asSlice(got.Body["messages"])[0])["content"] != "正常内容。" {
			t.Fatalf("%+v", got.Body)
		}
	})
	// string content cases
	stringCases := []struct{ name, header, want string }{
		{"basic", "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=claude-vscode; cch=abc;正常内容。", "正常内容。"},
		{"different values", "x-anthropic-billing-header: cc_version=2.0.5; cc_entrypoint=claude-desktop; cch=xyz;Hello!", "Hello!"},
		{"case insensitive", "X-ANTHROPIC-BILLING-HEADER: CC_VERSION=2.1.87; CC_ENTRYPOINT=CLAUDE-VSCODE; CCH=ABC;Hi", "Hi"},
		{"cch spaces", "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=claude-vscode; cch=e0    bf8;Hi", "Hi"},
		{"no trailing semicolon", "x-anthropic-billing-header: cc_version=2.1.0; cc_entrypoint=claude-vscode; cch=a8c1e你好。", "你好。"},
		{"dots and underscores", "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=claude_vscode.2; cch=a_b.c;Hi", "Hi"},
	}
	for _, tc := range stringCases {
		t.Run("string "+tc.name, func(t *testing.T) {
			r := billingUpstream(map[string]any{"messages": []any{sysMsg(tc.header)}})
			got, err := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
			if err != nil {
				t.Fatal(err)
			}
			if asMap(asSlice(got.Body["messages"])[0])["content"] != tc.want {
				t.Fatalf("%+v", got.Body)
			}
		})
	}
	t.Run("string no billing header", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg("Just a system prompt")}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("multiple system messages first has header", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg("x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=claude-vscode; cch=abc;First"), sysMsg("Second")}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		msgs := asSlice(got.Body["messages"])
		if asMap(msgs[0])["content"] != "First" || asMap(msgs[1])["content"] != "Second" {
			t.Fatalf("%+v", msgs)
		}
	})
	t.Run("system at end", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{map[string]any{"role": "user", "content": "hi"}, sysMsg("x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=claude-vscode; cch=abc;System")}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		msgs := asSlice(got.Body["messages"])
		if asMap(msgs[1])["content"] != "System" {
			t.Fatalf("%+v", msgs)
		}
	})
	t.Run("unrecognized header throws", func(t *testing.T) {
		txt := "x-anthropic-billing-header: garbage!!"
		if _, _, err := CleanBillingHeader(txt); err == nil {
			t.Fatal("expected error")
		}
	})
	t.Run("interceptor propagates error", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg("x-anthropic-billing-header: garbage!!")}})
		if _, err := AnthropicBillingCleaner(r, billingCtx("/v1/messages")); err == nil {
			t.Fatal("expected error")
		}
	})
	// array content
	t.Run("array first block", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg([]any{map[string]any{"type": "text", "text": "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=claude-vscode; cch=abc;Hello"}, map[string]any{"type": "text", "text": "World"}})}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		blk := asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])[0].(map[string]any)
		if blk["text"] != "Hello" {
			t.Fatalf("%+v", blk)
		}
	})
	t.Run("array multiple blocks only first header", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg([]any{map[string]any{"type": "text", "text": "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;A"}, map[string]any{"type": "text", "text": "B"}})}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		c := asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])
		if asMap(c[0])["text"] != "A" || asMap(c[1])["text"] != "B" {
			t.Fatalf("%+v", c)
		}
	})
	t.Run("array no billing header", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg([]any{map[string]any{"type": "text", "text": "Normal"}})}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("header not first block", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg([]any{map[string]any{"type": "text", "text": "Normal"}, map[string]any{"type": "text", "text": "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;Cleaned"}})}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		c := asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])
		if asMap(c[1])["text"] != "Cleaned" {
			t.Fatalf("%+v", c)
		}
	})
	t.Run("skip non-text blocks", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg([]any{map[string]any{"type": "image", "source": "x"}, map[string]any{"type": "text", "text": "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;OK"}})}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		c := asSlice(asMap(asSlice(got.Body["messages"])[0])["content"])
		if asMap(c[0])["type"] != "image" || asMap(c[1])["text"] != "OK" {
			t.Fatalf("%+v", c)
		}
	})
	t.Run("multiple system array messages", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg([]any{map[string]any{"type": "text", "text": "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;A"}}), sysMsg([]any{map[string]any{"type": "text", "text": "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;B"}})}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		msgs := asSlice(got.Body["messages"])
		if asMap(asSlice(asMap(msgs[0])["content"])[0])["text"] != "A" || asMap(asSlice(asMap(msgs[1])["content"])[0])["text"] != "B" {
			t.Fatalf("%+v", msgs)
		}
	})
	t.Run("immutability", func(t *testing.T) {
		original := "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;Hello"
		r := billingUpstream(map[string]any{"messages": []any{sysMsg(original)}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if asMap(asSlice(r.Body["messages"])[0])["content"] != original {
			t.Fatal("mutated original")
		}
		if got == r {
			t.Fatal("expected copy")
		}
	})
	// entry path guard
	for _, p := range []string{"/v1/chat/completions", "/chat/completions"} {
		t.Run("skip path "+p, func(t *testing.T) {
			r := billingUpstream(map[string]any{"messages": []any{sysMsg("x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;Hi")}})
			got, _ := AnthropicBillingCleaner(r, billingCtx(p))
			if got != r {
				t.Fatal("changed")
			}
		})
	}
	for _, p := range []string{"/v1/messages", "/messages", "/v1/v1/messages", "/v1/message"} {
		t.Run("process path "+p, func(t *testing.T) {
			r := billingUpstream(map[string]any{"messages": []any{sysMsg("x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;Hi")}})
			got, _ := AnthropicBillingCleaner(r, billingCtx(p))
			if asMap(asSlice(got.Body["messages"])[0])["content"] != "Hi" {
				t.Fatalf("%+v", got.Body)
			}
		})
	}
	t.Run("no messages with anthropic path", func(t *testing.T) {
		r := billingUpstream(map[string]any{})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("non-standard upstream URL", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg("x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;Hi")}})
		r.URL = "https://custom.example.com/other"
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if asMap(asSlice(got.Body["messages"])[0])["content"] != "Hi" {
			t.Fatal("did not process")
		}
	})
	// fingerprint helpers
	t.Run("computeFingerprint", func(t *testing.T) {
		fp := ComputeFingerprint("Hello, Claude!", "2.1.87")
		if !regexp.MustCompile(`^[0-9a-f]{3}$`).MatchString(fp) {
			t.Fatal(fp)
		}
		if ComputeFingerprint("Same text every time", "2.1.87") != ComputeFingerprint("Same text every time", "2.1.87") {
			t.Fatal("unstable")
		}
		if ComputeFingerprint("ABCDE fghij klmno pqrst uvwxy z", "2.1.87") == ComputeFingerprint("ZZZZZ fghij klmno pqrst uvwxy z", "2.1.87") {
			t.Fatal("collision")
		}
	})
	t.Run("extractRealUserMessageText", func(t *testing.T) {
		if got := extractRealUserMessageText([]any{map[string]any{"role": "user", "content": "<system-reminder>skip</system-reminder>"}, map[string]any{"role": "user", "content": "real question here"}}); got != "real question here" {
			t.Fatal(got)
		}
		if got := extractRealUserMessageText([]any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "<system-reminder>skip"}}}, map[string]any{"role": "user", "content": []any{map[string]any{"type": "text", "text": "real content"}}}}); got != "real content" {
			t.Fatal(got)
		}
		if got := extractRealUserMessageText([]any{map[string]any{"role": "user", "content": "plain string"}}); got != "plain string" {
			t.Fatal(got)
		}
	})
	t.Run("extractFirstMessageText", func(t *testing.T) {
		if got := extractFirstMessageText([]any{map[string]any{"role": "user", "content": "first message"}, map[string]any{"role": "assistant", "content": "r"}}); got != "first message" {
			t.Fatal(got)
		}
		if got := extractFirstMessageText([]any{map[string]any{"role": "system", "content": "sys"}}); got != "" {
			t.Fatal(got)
		}
	})
	// fingerprint stabilization
	t.Run("stabilize meta-block drift", func(t *testing.T) {
		base := "2.1.87"
		wrong := ComputeFingerprint("<system-reminder>session context metadata</system-reminder>", base)
		correct := ComputeFingerprint("What is the capital of France?", base)
		r := billingUpstream(map[string]any{"system": []any{map[string]any{"type": "text", "text": billingBlock(base+"."+wrong, "You are Claude.")}}, "messages": []any{map[string]any{"role": "user", "content": "<system-reminder>session context metadata</system-reminder>"}, map[string]any{"role": "user", "content": "What is the capital of France?"}}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		text := asStr(asSlice(got.Body["system"])[0].(map[string]any)["text"])
		if !strings.Contains(text, "cc_version="+base+"."+correct) || strings.Contains(text, "x-anthropic-billing-header:") {
			t.Fatal(text)
		}
	})
	t.Run("skip no billing block", func(t *testing.T) {
		r := billingUpstream(map[string]any{"system": []any{map[string]any{"type": "text", "text": "cc_version=2.1.87.abc; other"}}, "messages": []any{map[string]any{"role": "user", "content": "hi"}}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("skip no fingerprint in cc_version", func(t *testing.T) {
		r := billingUpstream(map[string]any{"system": []any{map[string]any{"type": "text", "text": billingBlock("2.1.87", "You are Claude.")}}, "messages": []any{map[string]any{"role": "user", "content": "hi"}}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		text := asStr(asSlice(got.Body["system"])[0].(map[string]any)["text"])
		if text != "cc_version=2.1.87;cc_entrypoint=claude-vscode;cch=a8c1e;You are Claude." {
			t.Fatal(text)
		}
	})
	t.Run("no cch field", func(t *testing.T) {
		txt := "x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=claude-desktop;Hi"
		r := billingUpstream(map[string]any{"messages": []any{sysMsg(txt)}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if asMap(asSlice(got.Body["messages"])[0])["content"] != "Hi" {
			t.Fatal(got.Body)
		}
	})
	t.Run("already stable fingerprint", func(t *testing.T) {
		text := "What is the capital of France?"
		fp := ComputeFingerprint(text, "2.1.87")
		r := billingUpstream(map[string]any{"system": []any{map[string]any{"type": "text", "text": billingBlock("2.1.87."+fp, "You")}}, "messages": []any{map[string]any{"role": "user", "content": text}}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		out := asStr(asSlice(got.Body["system"])[0].(map[string]any)["text"])
		if !strings.Contains(out, "cc_version=2.1.87."+fp) {
			t.Fatal(out)
		}
	})
	t.Run("verification failure safe", func(t *testing.T) {
		r := billingUpstream(map[string]any{"system": []any{map[string]any{"type": "text", "text": billingBlock("2.1.87.zzz", "You")}}, "messages": []any{map[string]any{"role": "user", "content": "something else"}}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		out := asStr(asSlice(got.Body["system"])[0].(map[string]any)["text"])
		if strings.Contains(out, "2.1.87.zzz") == false {
			t.Fatal("should preserve unverified fingerprint")
		}
	})
	t.Run("real user path v2", func(t *testing.T) {
		text := "Hello, can you help me?"
		reminder := "<system-reminder>protocol context</system-reminder>"
		fp := ComputeFingerprint(text, "2.1.108")
		wrong := ComputeFingerprint(reminder, "2.1.108")
		r := billingUpstream(map[string]any{"system": []any{map[string]any{"type": "text", "text": billingBlock("2.1.108."+wrong, "You are Claude.")}}, "messages": []any{map[string]any{"role": "user", "content": reminder}, map[string]any{"role": "user", "content": text}}})
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		out := asStr(asSlice(got.Body["system"])[0].(map[string]any)["text"])
		if !strings.Contains(out, "2.1.108."+fp) {
			t.Fatal(out)
		}
	})
	t.Run("remove billing header from upstream headers", func(t *testing.T) {
		r := billingUpstream(map[string]any{"messages": []any{sysMsg("x-anthropic-billing-header: cc_version=2.1.87; cc_entrypoint=x; cch=y;Hi")}})
		r.Headers["x-anthropic-billing-header"] = "cc_version=2.1.87"
		got, _ := AnthropicBillingCleaner(r, billingCtx("/v1/messages"))
		if _, ok := got.Headers["x-anthropic-billing-header"]; ok {
			t.Fatal(got.Headers)
		}
	})
}
