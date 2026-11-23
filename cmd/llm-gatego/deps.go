package main

import (
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/logger"
	"github.com/kkito/llm-gatego/internal/proxy"
	"time"
)

func proxyDeps(cfg *config.ProxyConfig, ctx config.ConfigContext, timeoutMS int) proxy.Dependencies {
	return proxy.Dependencies{ConfigGetter: func() *config.ProxyConfig { return cfg }, Logger: logger.NewLogger(ctx.DetailLogDir), DetailLogger: logger.NewDetailLogger(ctx.DetailLogDir, false), Timeout: time.Duration(timeoutMS) * time.Millisecond, LogDir: ctx.LogDir}
}
