package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
	"regexp"
	"strings"
	"testing"
	"time"
)

// Mirrors opencode-session.test.ts (27 cases).
func TestOpencodeSession(t *testing.T) {
	ResetSessionCache()
	req := func() *UpstreamRequest {
		return &UpstreamRequest{URL: "https://api.opencode.ai/v1/chat/completions", Headers: map[string]string{"Authorization": "Bearer x"}, Body: map[string]any{"model": "kimi", "messages": []any{}}}
	}
	ctx := func(base, ip, model, provider, user, group string, headers map[string]string) *Context {
		h := map[string]string{}
		for k, v := range headers {
			h[k] = v
		}
		c := &Context{Provider: &config.ProviderConfig{BaseURL: base, RealModel: model, Provider: config.ProviderType(provider)}, ClientIP: ip, ModelGroup: group, RequestHeaders: h}
		if user != "" {
			c.CurrentUser = &CurrentUser{Name: user}
		}
		return c
	}
	t.Run("kimi", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://api.opencode.ai", "1.2.3.4", "kimi", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("glm", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "1.2.3.5", "glm", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("case insensitive", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://OPENCODE.AI", "1.2.3.6", "KIMI", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("skip other base", func(t *testing.T) {
		r := req()
		got, _ := OpencodeSession(r, ctx("https://api.openai.com", "1.2.3.7", "gpt-4", "openai", "", "", nil))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("any model", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "1.2.3.8", "random", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("empty model", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "1.2.3.9", "", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("empty base", func(t *testing.T) {
		r := req()
		got, _ := OpencodeSession(r, ctx("", "1.2.3.10", "kimi", "openai", "", "", nil))
		if got != r {
			t.Fatal("changed")
		}
	})
	t.Run("id format", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "1.2.3.11", "kimi", "openai", "", "", nil))
		id := got.Headers["x-opencode-session"]
		if !regexp.MustCompile(`^ses_[0-9a-f]{12}[A-Za-z0-9]{14}$`).MatchString(id) {
			t.Fatal(id)
		}
	})
	t.Run("reuse same IP", func(t *testing.T) {
		c := ctx("https://opencode.ai", "1.2.3.12", "kimi", "openai", "", "", nil)
		a, _ := OpencodeSession(req(), c)
		b, _ := OpencodeSession(req(), c)
		if a.Headers["x-opencode-session"] != b.Headers["x-opencode-session"] {
			t.Fatal("different")
		}
	})
	t.Run("different IPs", func(t *testing.T) {
		a, _ := OpencodeSession(req(), ctx("https://opencode.ai", "1.1.1.1", "kimi", "openai", "", "", nil))
		b, _ := OpencodeSession(req(), ctx("https://opencode.ai", "2.2.2.2", "kimi", "openai", "", "", nil))
		if a.Headers["x-opencode-session"] == b.Headers["x-opencode-session"] {
			t.Fatal("same")
		}
	})
	t.Run("TTL expiry", func(t *testing.T) {
		c := ctx("https://opencode.ai", "3.3.3.3", "kimi", "openai", "", "", nil)
		a, _ := OpencodeSession(req(), c)
		key := computeFingerprint(c)
		SetSessionExpiry(key, -time.Second)
		b, _ := OpencodeSession(req(), c)
		if a.Headers["x-opencode-session"] == b.Headers["x-opencode-session"] {
			t.Fatal("not expired")
		}
	})
	t.Run("sliding window", func(t *testing.T) {
		c := ctx("https://opencode.ai", "3.3.3.4", "kimi", "openai", "", "", nil)
		a, _ := OpencodeSession(req(), c)
		key := computeFingerprint(c)
		SetSessionExpiry(key, time.Minute)
		b, _ := OpencodeSession(req(), c)
		if a.Headers["x-opencode-session"] != b.Headers["x-opencode-session"] {
			t.Fatal("not renewed")
		}
		sessionMu.Lock()
		e := sessionMap[key]
		sessionMu.Unlock()
		if e.expiresAt.Before(time.Now().Add(19 * time.Minute)) {
			t.Fatal("not extended")
		}
	})
	t.Run("null IP", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "", "kimi", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("header added", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "4.4.4.4", "kimi", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("prompt cache key", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "4.4.4.5", "kimi", "openai", "", "", nil))
		if got.Body["prompt_cache_key"] == "" {
			t.Fatal(got)
		}
	})
	t.Run("header/body same", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "4.4.4.6", "kimi", "openai", "", "", nil))
		if got.Headers["x-opencode-session"] != got.Body["prompt_cache_key"] {
			t.Fatal(got)
		}
	})
	t.Run("preserve headers", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "4.4.4.7", "kimi", "openai", "", "", nil))
		if got.Headers["Authorization"] != "Bearer x" {
			t.Fatal(got)
		}
	})
	t.Run("preserve body", func(t *testing.T) {
		r := req()
		r.Body["extra"] = "v"
		got, _ := OpencodeSession(r, ctx("https://opencode.ai", "4.4.4.8", "kimi", "openai", "", "", nil))
		if got.Body["extra"] != "v" {
			t.Fatal(got)
		}
	})
	t.Run("no mutation", func(t *testing.T) {
		r := req()
		_, err := OpencodeSession(r, ctx("https://opencode.ai", "4.4.4.9", "kimi", "openai", "", "", nil))
		if err != nil {
			t.Fatal(err)
		}
		if _, ok := r.Headers["x-opencode-session"]; ok {
			t.Fatal("mutated")
		}
		if _, ok := r.Body["prompt_cache_key"]; ok {
			t.Fatal("mutated body")
		}
	})
	t.Run("anthropic no cache key", func(t *testing.T) {
		got, _ := OpencodeSession(req(), ctx("https://opencode.ai", "5.5.5.1", "claude", "anthropic", "", "", nil))
		if got.Headers["x-opencode-session"] == "" {
			t.Fatal(got)
		}
		if _, ok := got.Body["prompt_cache_key"]; ok {
			t.Fatal("has cache key")
		}
	})
	t.Run("same fingerprint reuse", func(t *testing.T) {
		c := ctx("https://opencode.ai", "5.5.5.2", "kimi", "openai", "Alice", "", nil)
		a, _ := OpencodeSession(req(), c)
		b, _ := OpencodeSession(req(), c)
		if a.Headers["x-opencode-session"] != b.Headers["x-opencode-session"] {
			t.Fatal("different")
		}
	})
	t.Run("different realModel", func(t *testing.T) {
		a, _ := OpencodeSession(req(), ctx("https://opencode.ai", "5.5.5.3", "kimi", "openai", "", "", nil))
		b, _ := OpencodeSession(req(), ctx("https://opencode.ai", "5.5.5.3", "glm", "openai", "", "", nil))
		if a.Headers["x-opencode-session"] == b.Headers["x-opencode-session"] {
			t.Fatal("same")
		}
	})
	t.Run("session-id header priority", func(t *testing.T) {
		a, _ := OpencodeSession(req(), ctx("https://opencode.ai", "6.6.6.1", "kimi", "openai", "Alice", "", map[string]string{"x-session-id": "S1"}))
		b, _ := OpencodeSession(req(), ctx("https://opencode.ai", "6.6.6.1", "kimi", "openai", "Alice", "", map[string]string{"x-session-id": "S2"}))
		if a.Headers["x-opencode-session"] == b.Headers["x-opencode-session"] {
			t.Fatal("same")
		}
		c, _ := OpencodeSession(req(), ctx("https://opencode.ai", "6.6.6.1", "kimi", "openai", "Alice", "", map[string]string{"x-session-id": "S1"}))
		if a.Headers["x-opencode-session"] != c.Headers["x-opencode-session"] {
			t.Fatal("not reused")
		}
	})
	t.Run("blacklisted session header", func(t *testing.T) {
		a, _ := OpencodeSession(req(), ctx("https://opencode.ai", "6.6.6.2", "kimi", "openai", "", "", map[string]string{"authorization-session-id": "S1"}))
		b, _ := OpencodeSession(req(), ctx("https://opencode.ai", "6.6.6.2", "kimi", "openai", "", "", map[string]string{"authorization-session-id": "S2"}))
		if a.Headers["x-opencode-session"] != b.Headers["x-opencode-session"] {
			t.Fatal("blacklist ignored")
		}
	})
	t.Run("stainless isolation", func(t *testing.T) {
		a, _ := OpencodeSession(req(), ctx("https://opencode.ai", "7.7.7.1", "kimi", "openai", "", "", map[string]string{"x-stainless-lang": "js", "x-stainless-runtime": "node"}))
		b, _ := OpencodeSession(req(), ctx("https://opencode.ai", "7.7.7.1", "kimi", "openai", "", "", nil))
		if a.Headers["x-opencode-session"] == b.Headers["x-opencode-session"] {
			t.Fatal("same")
		}
		c, _ := OpencodeSession(req(), ctx("https://opencode.ai", "7.7.7.1", "kimi", "openai", "", "", map[string]string{"x-stainless-lang": "js", "x-stainless-runtime": "node"}))
		if a.Headers["x-opencode-session"] != c.Headers["x-opencode-session"] {
			t.Fatal("not reused")
		}
	})
	t.Run("different users", func(t *testing.T) {
		a, _ := OpencodeSession(req(), ctx("https://opencode.ai", "7.7.7.2", "kimi", "openai", "Alice", "", map[string]string{"user-agent": "UA"}))
		b, _ := OpencodeSession(req(), ctx("https://opencode.ai", "7.7.7.2", "kimi", "openai", "Bob", "", map[string]string{"user-agent": "UA"}))
		if a.Headers["x-opencode-session"] == b.Headers["x-opencode-session"] {
			t.Fatal("same")
		}
	})
	t.Run("different group", func(t *testing.T) {
		a, _ := OpencodeSession(req(), ctx("https://opencode.ai", "7.7.7.3", "kimi", "openai", "", "G1", nil))
		b, _ := OpencodeSession(req(), ctx("https://opencode.ai", "7.7.7.3", "kimi", "openai", "", "G2", nil))
		if a.Headers["x-opencode-session"] == b.Headers["x-opencode-session"] {
			t.Fatal("same")
		}
	})
	t.Run("same group reuse", func(t *testing.T) {
		c := ctx("https://opencode.ai", "7.7.7.4", "kimi", "openai", "", "G", nil)
		a, _ := OpencodeSession(req(), c)
		b, _ := OpencodeSession(req(), c)
		if a.Headers["x-opencode-session"] != b.Headers["x-opencode-session"] {
			t.Fatal("different")
		}
	})
	_ = strings.TrimSpace
}
