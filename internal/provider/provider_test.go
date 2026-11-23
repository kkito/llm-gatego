package provider

import (
	"testing"
	"github.com/kkito/llm-gatego/internal/config"
)

func TestBuildURLDeduplicatesV1(t *testing.T) {
	cases := []struct{ base, want string }{
		{"https://api.openai.com", "https://api.openai.com/v1/chat/completions"},
		{"https://api.openai.com/", "https://api.openai.com/v1/chat/completions"},
		{"https://api.openai.com/v1", "https://api.openai.com/v1/chat/completions"},
		{"https://api.openai.com/v1/", "https://api.openai.com/v1/chat/completions"},
	}
	for _, tc := range cases {
		cfg := &config.ProviderConfig{BaseURL: tc.base, Provider: config.ProviderOpenAI}
		got := BuildURL(cfg, "chat")
		if got != tc.want { t.Errorf("base=%q got %q want %q", tc.base, got, tc.want) }
	}
}

func TestBuildHeaders(t *testing.T) {
	oai := GetProvider(&config.ProviderConfig{Provider: config.ProviderOpenAI})
	h := oai.BuildHeaders("sk-1")
	if h["Authorization"] != "Bearer sk-1" { t.Fatalf("%+v", h) }
	ant := GetProvider(&config.ProviderConfig{Provider: config.ProviderAnthropic})
	h2 := ant.BuildHeaders("sk-2")
	if h2["x-api-key"] != "sk-2" || h2["anthropic-version"] != "2023-06-01" { t.Fatalf("%+v", h2) }
	resp := GetProvider(&config.ProviderConfig{Provider: config.ProviderResponseAPI})
	if resp.GetType() != config.ProviderResponseAPI { t.Fatal(resp.GetType()) }
	if resp.BuildURL(&config.ProviderConfig{BaseURL:"https://x.com", Provider: config.ProviderResponseAPI}, "responses") != "https://x.com/v1/responses" { t.Fatal("response url") }
}
