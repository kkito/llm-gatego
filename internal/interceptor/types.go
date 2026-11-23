package interceptor

import (
	"github.com/kkito/llm-gatego/internal/config"
)

type UpstreamRequest struct {
	URL     string
	Headers map[string]string
	Body    map[string]any
}

type CurrentUser struct {
	Name          string   `json:"name"`
	APIKey        string   `json:"apikey,omitempty"`
	AllowedModels []string `json:"allowedModels,omitempty"`
}

type Context struct {
	Provider       *config.ProviderConfig
	RequestHeaders map[string]string
	RequestPath    string
	CurrentUser    *CurrentUser
	ClientIP       string
	RequestID      string
	CustomModel    string
	ModelGroup     string
	Stream         bool
}

type Fn func(*UpstreamRequest, *Context) (*UpstreamRequest, error)
