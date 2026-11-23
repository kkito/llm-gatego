package server

import (
	"embed"
	"github.com/kkito/llm-gatego/internal/auth"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/proxy"
	"github.com/kkito/llm-gatego/internal/util"
	"io/fs"
	"net/http"
	"strings"
	"sync"
)

//go:embed dist/*
var distFS embed.FS

type Options struct {
	Debug   bool
	TestEnv bool
}
type Server struct {
	handler http.Handler
	mu      sync.RWMutex
	current *config.ProxyConfig
}

func New(cfg *config.ProxyConfig, deps proxy.Dependencies, ctx config.ConfigContext, opts Options) http.Handler {
	s := &Server{current: cfg}
	if deps.ConfigGetter == nil {
		deps.ConfigGetter = func() *config.ProxyConfig { s.mu.RLock(); defer s.mu.RUnlock(); return s.current }
	}
	apiDeps := APIDeps{ConfigDir: ctx.ConfigDir, Get: deps.ConfigGetter, Update: func(c *config.ProxyConfig) { s.mu.Lock(); s.current = c; s.mu.Unlock() }}
	mux := http.NewServeMux()
	RegisterAdminAPIs(mux, apiDeps)
	RegisterExtraAdminAPIs(mux, apiDeps)
	RegisterUserAPIs(mux, apiDeps)
	RegisterLegacyFormAliases(mux)
	adminMux := http.NewServeMux()
	RegisterAdminAPIs(adminMux, apiDeps)
	mux.Handle("/api/admin/", AdminAuth(adminMux, apiDeps))
	proxy.RegisterRoutes(mux, deps)
	assets, err := fs.Sub(distFS, "dist")
	if err == nil {
		mux.Handle("GET /assets/", http.StripPrefix("/assets/", http.FileServer(http.FS(assets))))
	}
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		// Original v1.15.0 page-level auth: redirect to login instead of JSON 401.
		pageCfg := deps.ConfigGetter()
		if strings.HasPrefix(r.URL.Path, "/admin/") && r.URL.Path != "/admin/login" {
			if pageCfg != nil && auth.IsPasswordConfigured(pageCfg) {
				id := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
				if id == "" { id = r.URL.Query().Get("session") }
				if id == "" { if c, err := r.Cookie("session"); err == nil { id = c.Value } }
				if id == "" || !auth.HasSession(id) {
					http.Redirect(w, r, "/admin/login", http.StatusFound)
					return
				}
			}
		}
		if (r.URL.Path == "/user/main" || r.URL.Path == "/user/stats") && pageCfg != nil && len(pageCfg.UserApiKeys) > 0 {
			if auth.GetCurrentUser(r, pageCfg) == nil {
				http.Redirect(w, r, "/user/login", http.StatusFound)
				return
			}
		}
		b, err := fs.ReadFile(distFS, "dist/index.html")
		if err != nil {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(b)
	})
	return withMiddleware(mux)
}
func withMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, x-request-id")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		r.Header.Set("X-Client-IP", util.ExtractClientIP(r))
		next.ServeHTTP(w, r)
	})
}
