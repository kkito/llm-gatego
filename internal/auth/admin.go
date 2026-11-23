package auth

import (
	"github.com/kkito/llm-gatego/internal/config"
	"sync"
)

var adminMu sync.Mutex
var adminSessions = map[string]bool{}

func SetSession(id string)                              { adminMu.Lock(); defer adminMu.Unlock(); adminSessions[id] = true }
func ClearSession(id string)                            { adminMu.Lock(); defer adminMu.Unlock(); delete(adminSessions, id) }
func HasSession(id string) bool                         { adminMu.Lock(); defer adminMu.Unlock(); return adminSessions[id] }
func IsPasswordConfigured(cfg *config.ProxyConfig) bool { return cfg != nil && cfg.AdminPassword != "" }

func ClearUserSession(id string) {
	userMu.Lock()
	delete(userSessions, id)
	userMu.Unlock()
}
