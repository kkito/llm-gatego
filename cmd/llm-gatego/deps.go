package main

import (
	"net/http"
	"time"

	"github.com/kkito/llm-gatego/internal/auth"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/interceptor"
	"github.com/kkito/llm-gatego/internal/logger"
	"github.com/kkito/llm-gatego/internal/proxy"
)

// newInterceptorManager mirrors src/server.ts registration order exactly.
// anthropic-billing-cleaner MUST be first; user-model-access is last.
func newInterceptorManager() *interceptor.Manager {
	m := interceptor.NewManager()
	m.Use(interceptor.AnthropicBillingCleaner)
	m.Use(interceptor.ClaudeCodeCache)
	m.Use(interceptor.CacheControlNormalize)
	m.Use(interceptor.TTLManagement)
	m.Use(interceptor.ClaudeCodeNormalize)
	m.Use(interceptor.OpencodeSession)
	m.Use(interceptor.QwenCache)
	m.Use(interceptor.UserModelAccess)
	return m
}

func proxyDeps(cfg *config.ProxyConfig, ctx config.ConfigContext, timeoutMS int) proxy.Dependencies {
	return proxy.Dependencies{
		ConfigGetter: func() *config.ProxyConfig { return cfg },
		Logger:       logger.NewLogger(ctx.DetailLogDir),
		DetailLogger: logger.NewDetailLogger(ctx.DetailLogDir, false),
		Timeout:      time.Duration(timeoutMS) * time.Millisecond,
		LogDir:       ctx.LogDir,
		Interceptors: newInterceptorManager(),
		RequestUser: func(r *http.Request) *interceptor.CurrentUser {
			u := auth.GetCurrentUser(r, cfg)
			if u == nil {
				return nil
			}
			return &interceptor.CurrentUser{Name: u.Name, APIKey: u.APIKey, AllowedModels: u.AllowedModels}
		},
	}
}
