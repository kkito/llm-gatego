package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
	"strings"
	"testing"
)

// Mirrors helpers.test.ts (13 cases).
func TestHelpers(t *testing.T) {
	for _, tc := range []struct {
		url  string
		want bool
	}{{"https://api.anthropic.com/v1/messages", true}, {"https://api.anthropic.com/v1/messages/", true}, {"https://api.anthropic.com/v1/messages?model=claude", true}, {"https://api.openai.com/v1/chat/completions", false}, {"https://api.example.com/v1/other", false}, {"", false}} {
		if got := IsAnthropicV1Messages(tc.url); got != tc.want {
			t.Fatalf("%s: got %v", tc.url, got)
		}
	}
	for _, tc := range []struct {
		path string
		want bool
	}{{"/v1/messages", true}, {"/messages", true}, {"/v1/v1/messages", true}, {"/v1/chat/completions", false}, {"/chat/completions", false}, {"", false}} {
		if got := IsAnthropicEndpoint(tc.path); got != tc.want {
			t.Fatalf("%s: got %v", tc.path, got)
		}
	}
}

// Mirrors user-model-access.test.ts (9 cases).
func TestUserModelAccess(t *testing.T) {
	req := &UpstreamRequest{URL: "https://api.openai.com/v1/chat/completions", Headers: map[string]string{"Authorization": "Bearer test-key"}, Body: map[string]any{"model": "test-model"}}
	ctx := func(user *CurrentUser, model string) *Context {
		return &Context{Provider: &config.ProviderConfig{CustomModel: "test-model"}, CurrentUser: user, CustomModel: model}
	}
	tests := []struct {
		name    string
		user    *CurrentUser
		model   string
		wantErr bool
	}{
		{"nil user", nil, "test-model", false},
		{"no allowed models", &CurrentUser{Name: "Alice"}, "test-model", false},
		{"empty allowed models", &CurrentUser{Name: "Alice", AllowedModels: []string{}}, "test-model", false},
		{"allowed", &CurrentUser{Name: "Alice", AllowedModels: []string{"test-model", "gpt-4"}}, "test-model", false},
		{"not allowed", &CurrentUser{Name: "Alice", AllowedModels: []string{"gpt-4"}}, "gemini-pro", true},
		{"model group allowed", &CurrentUser{Name: "Alice", AllowedModels: []string{"claude-3"}}, "claude-3", false},
		{"model group denied", &CurrentUser{Name: "Alice", AllowedModels: []string{"gpt-4"}}, "claude-3", true},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := UserModelAccess(req, ctx(tc.user, tc.model))
			if tc.wantErr {
				if err == nil || !strings.Contains(err.Error(), "don't have access") {
					t.Fatalf("err %v", err)
				}
			} else if err != nil || got != req {
				t.Fatalf("got %+v err %v", got, err)
			}
		})
	}
	t.Run("PermissionError", func(t *testing.T) {
		e := &PermissionError{"gpt-4"}
		if e.Error() != "You don't have access to model: gpt-4" {
			t.Fatal(e)
		}
	})
}

// Mirrors index.test.ts (9 cases).
func TestManager(t *testing.T) {
	t.Run("no interceptors", func(t *testing.T) {
		m := NewManager()
		req := &UpstreamRequest{}
		got, err := m.Execute(req, &Context{})
		if err != nil || got != req {
			t.Fatalf("%+v %v", got, err)
		}
	})
	t.Run("single modifies headers", func(t *testing.T) {
		m := NewManager()
		m.Use(func(r *UpstreamRequest, c *Context) (*UpstreamRequest, error) {
			r.Headers = map[string]string{"x-cache": "1"}
			return r, nil
		})
		req := &UpstreamRequest{Headers: map[string]string{}}
		got, _ := m.Execute(req, &Context{})
		if got.Headers["x-cache"] != "1" {
			t.Fatal(got)
		}
	})
	t.Run("registration order", func(t *testing.T) {
		m := NewManager()
		step := ""
		m.Use(func(r *UpstreamRequest, c *Context) (*UpstreamRequest, error) { step = "1"; return r, nil })
		m.Use(func(r *UpstreamRequest, c *Context) (*UpstreamRequest, error) { step = "2"; return r, nil })
		m.Execute(&UpstreamRequest{}, &Context{})
		if step != "2" {
			t.Fatal(step)
		}
	})
	t.Run("chained body", func(t *testing.T) {
		m := NewManager()
		m.Use(func(r *UpstreamRequest, c *Context) (*UpstreamRequest, error) { r.Body["a"] = "1"; return r, nil })
		m.Use(func(r *UpstreamRequest, c *Context) (*UpstreamRequest, error) {
			if r.Body["a"] != "1" {
				t.Fatal("chain broken")
			}
			r.Body["b"] = "2"
			return r, nil
		})
		req := &UpstreamRequest{Body: map[string]any{}}
		got, _ := m.Execute(req, &Context{})
		if got.Body["b"] != "2" {
			t.Fatal(got)
		}
	})
	t.Run("clear", func(t *testing.T) {
		m := NewManager()
		m.Use(func(r *UpstreamRequest, c *Context) (*UpstreamRequest, error) {
			r.Headers = map[string]string{"x": "1"}
			return r, nil
		})
		m.Clear()
		req := &UpstreamRequest{Headers: map[string]string{}}
		got, _ := m.Execute(req, &Context{})
		if _, ok := got.Headers["x"]; ok {
			t.Fatal(got)
		}
	})
	t.Run("fixed order", func(t *testing.T) {
		m := NewManager()
		order := []string{}
		for _, name := range []string{"billing-cleaner", "claude-code-cache", "cache-control-normalize", "ttl-management", "claude-code-normalize", "opencode-session", "qwen-cache", "user-model-access"} {
			n := name
			m.Use(func(r *UpstreamRequest, c *Context) (*UpstreamRequest, error) {
				order = append(order, n)
				return r, nil
			})
		}
		m.Execute(&UpstreamRequest{}, &Context{})
		if len(order) != 8 || order[0] != "billing-cleaner" {
			t.Fatalf("%+v", order)
		}
	})
}
