package auth

import (
	"crypto/rand"
	"encoding/hex"
	"github.com/kkito/llm-gatego/internal/config"
	"net/http"
	"strings"
	"sync"
)

var userMu sync.Mutex
var userSessions = map[string]*config.UserApiKey{}

func LoginUserSession(apiKey, configPath string) (string, error) {
	cfg, err := config.LoadFullConfig(configPath)
	if err != nil {
		return "", err
	}
	for _, u := range cfg.UserApiKeys {
		if u.APIKey == apiKey {
			b := make([]byte, 16)
			_, _ = rand.Read(b)
			id := hex.EncodeToString(b)
			userMu.Lock()
			userSessions[id] = &u
			userMu.Unlock()
			return id, nil
		}
	}
	return "", nil
}
func getCurrentUserFromRequest(r *http.Request, cfg *config.ProxyConfig, configPath string) *config.UserApiKey {
	h := r.Header.Get("Authorization")
	if strings.HasPrefix(h, "Bearer ") {
		h = strings.TrimPrefix(h, "Bearer ")
	}
	if h == "" {
		h = r.Header.Get("x-api-key")
	}
	if h != "" && configPath != "" {
		c, err := config.LoadFullConfig(configPath)
		if err == nil {
			for i := range c.UserApiKeys {
				if c.UserApiKeys[i].APIKey == h {
					return &c.UserApiKeys[i]
				}
			}
		}
		return nil
	}
	sid := sessionIDFromRequest(r)
	if sid == "" {
		return nil
	}
	userMu.Lock()
	defer userMu.Unlock()
	return userSessions[sid]
}
func sessionIDFromRequest(r *http.Request) string {
	for _, c := range r.Cookies() {
		if c.Name == "user_session" {
			return c.Value
		}
	}
	return r.URL.Query().Get("session")
}
func GetCurrentUser(r *http.Request, cfg *config.ProxyConfig) *config.UserApiKey {
	return getCurrentUserFromRequest(r, cfg, "")
}
func UserAuthMiddleware(configPath string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cfg, err := config.LoadFullConfig(configPath)
		if err != nil || len(cfg.UserApiKeys) == 0 {
			next.ServeHTTP(w, r)
			return
		}
		if r.URL.Path == "/user/login" || r.URL.Path == "/user/logout" {
			next.ServeHTTP(w, r)
			return
		}
		if sessionIDFromRequest(r) != "" {
			if userMu.Lock(); userSessions[sessionIDFromRequest(r)] != nil {
				userMu.Unlock()
				next.ServeHTTP(w, r)
				return
			}
			userMu.Unlock()
		}
		h := r.Header.Get("Authorization")
		if strings.HasPrefix(h, "Bearer ") {
			h = strings.TrimPrefix(h, "Bearer ")
		}
		if h == "" {
			h = r.Header.Get("x-api-key")
		}
		valid := false
		for _, u := range cfg.UserApiKeys {
			if u.APIKey == h {
				valid = true
				break
			}
		}
		if !valid {
			if strings.HasPrefix(r.URL.Path, "/user/") {
				http.Redirect(w, r, "/user/login", http.StatusFound)
				return
			}
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":{"message":"Missing API Key"}}`))
			return
		}
		next.ServeHTTP(w, r)
	})
}
func ResetForTest() {
	adminMu.Lock()
	adminSessions = map[string]bool{}
	adminMu.Unlock()
	userMu.Lock()
	userSessions = map[string]*config.UserApiKey{}
	userMu.Unlock()
}
