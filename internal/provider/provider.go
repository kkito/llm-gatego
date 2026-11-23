package provider

import (
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/util"
	"strings"
)

type Provider interface {
	BuildHeaders(apiKey string) map[string]string
	GetEndpoint(path string) string
	GetType() config.ProviderType
	BuildURL(cfg *config.ProviderConfig, path string) string
}

type baseProvider struct {
	kind config.ProviderType
}

func (b *baseProvider) GetType() config.ProviderType { return b.kind }

func (b *baseProvider) GetEndpoint(path string) string {
	switch path {
	case "chat":
		return "/v1/chat/completions"
	case "messages":
		return "/v1/messages"
	case "responses":
		return "/v1/responses"
	case "models":
		return "/v1/models"
	}
	if strings.HasPrefix(path, "/") {
		return path
	}
	return "/v1/" + path
}

func (b *baseProvider) BuildURL(cfg *config.ProviderConfig, path string) string {
	base := strings.TrimRight(cfg.BaseURL, "/")
	if strings.HasSuffix(base, "/v1") {
		base = strings.TrimSuffix(base, "/v1")
	}
	short := strings.TrimPrefix(b.GetEndpoint(path), "/v1/")
	return base + "/v1/" + short
}

type openAIProvider struct{ baseProvider }

func (p *openAIProvider) BuildHeaders(apiKey string) map[string]string {
	return map[string]string{"Authorization": "Bearer " + apiKey, "Content-Type": "application/json", "User-Agent": "kkito-llm-agent/" + util.Version}
}

type anthropicProvider struct{ baseProvider }

func (p *anthropicProvider) BuildHeaders(apiKey string) map[string]string {
	return map[string]string{"x-api-key": apiKey, "Authorization": "Bearer " + apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json", "User-Agent": "kkito-llm-agent/" + util.Version}
}

type responseAPIProvider struct{ baseProvider }

func (p *responseAPIProvider) BuildHeaders(apiKey string) map[string]string {
	return map[string]string{"Authorization": "Bearer " + apiKey, "Content-Type": "application/json", "User-Agent": "kkito-llm-agent/" + util.Version}
}

func GetProvider(cfg *config.ProviderConfig) Provider {
	base := baseProvider{kind: cfg.Provider}
	switch cfg.Provider {
	case config.ProviderAnthropic:
		return &anthropicProvider{base}
	case config.ProviderResponseAPI:
		return &responseAPIProvider{base}
	default:
		return &openAIProvider{base}
	}
}

func BuildURL(cfg *config.ProviderConfig, path string) string {
	return GetProvider(cfg).BuildURL(cfg, path)
}

func BuildHeaders(cfg *config.ProviderConfig, apiKey string) map[string]string {
	return GetProvider(cfg).BuildHeaders(apiKey)
}
