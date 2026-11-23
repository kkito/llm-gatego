package interceptor

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"github.com/kkito/llm-gatego/internal/config"
	"math/big"
	"strings"
	"sync"
	"time"
)

const sessionTTL = 20 * time.Minute

var sessionHeaderBlacklist = []string{"authorization", "cookie", "set-cookie", "apikey", "token"}

type sessionEntry struct {
	sessionID string
	expiresAt time.Time
}

var sessionMu sync.Mutex
var sessionMap = map[string]sessionEntry{}
var idCounter int64
var lastIDTimestamp int64

func randomBase62(n int) string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	out := make([]byte, n)
	for i := range out {
		v, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			out[i] = chars[0]
		} else {
			out[i] = chars[v.Int64()]
		}
	}
	return string(out)
}
func generateOpenCodeID(prefix string, descending bool) string {
	nowMs := time.Now().UnixMilli()
	if nowMs != lastIDTimestamp {
		lastIDTimestamp = nowMs
		idCounter = 0
	}
	idCounter++
	n := uint64(nowMs)*0x1000 + uint64(idCounter)
	if descending {
		n = ^n
	}
	parts := make([]string, 6)
	for i := 0; i < 6; i++ {
		parts[i] = fmt.Sprintf("%02x", byte(n>>uint(40-8*i)))
	}
	return prefix + "_" + strings.Join(parts, "") + randomBase62(14)
}
func getClientHeader(ctx *Context, name string) string {
	if v, ok := ctx.RequestHeaders[name]; ok && strings.TrimSpace(v) != "" {
		return strings.TrimSpace(v)
	}
	for k, v := range ctx.RequestHeaders {
		if strings.EqualFold(k, name) && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}
func findSessionHeaderValue(ctx *Context) string {
	names := []string{}
	for k := range ctx.RequestHeaders {
		names = append(names, k)
	}
	usable := func(name string) string {
		lower := strings.ToLower(name)
		for _, b := range sessionHeaderBlacklist {
			if strings.Contains(lower, b) {
				return ""
			}
		}
		return getClientHeader(ctx, name)
	}
	for _, name := range names {
		if strings.Contains(strings.ToLower(name), "session-id") {
			if v := usable(name); v != "" {
				return v
			}
		}
	}
	for _, name := range names {
		if strings.Contains(strings.ToLower(name), "session") {
			if v := usable(name); v != "" {
				return v
			}
		}
	}
	return ""
}
func computeFingerprint(ctx *Context) string {
	ip := ctx.ClientIP
	if ip == "" {
		ip = "unknown"
	}
	user := ""
	if ctx.CurrentUser != nil {
		user = ctx.CurrentUser.Name
	}
	model := ""
	group := ""
	if ctx.Provider != nil {
		model = strings.ToLower(ctx.Provider.RealModel)
	}
	if ctx.ModelGroup != "" {
		group = ctx.ModelGroup
	}
	var material string
	if head := findSessionHeaderValue(ctx); head != "" {
		material = strings.Join([]string{head, ip, user, model, group}, "\n")
	} else {
		ua := getClientHeader(ctx, "user-agent")
		stainlessParts := []string{getClientHeader(ctx, "x-stainless-lang"), getClientHeader(ctx, "x-stainless-package-version"), getClientHeader(ctx, "x-stainless-runtime"), getClientHeader(ctx, "x-stainless-runtime-version")}
		stainless := ""
		for _, p := range stainlessParts {
			if p != "" {
				stainless = strings.Join(stainlessParts, "|")
				break
			}
		}
		if stainless != "" {
			material = strings.Join([]string{stainless, ip, ua, user, model, group}, "\n")
		} else {
			material = strings.Join([]string{ip, ua, user, model, group}, "\n")
		}
	}
	sum := sha256.Sum256([]byte(material))
	return hex.EncodeToString(sum[:])
}
func lazyCleanupLocked() {
	now := time.Now()
	scanned := 0
	for k, v := range sessionMap {
		if scanned >= 100 {
			break
		}
		scanned++
		if !v.expiresAt.After(now) {
			delete(sessionMap, k)
		}
	}
}
func getOrCreateSession(key string) string {
	sessionMu.Lock()
	defer sessionMu.Unlock()
	lazyCleanupLocked()
	now := time.Now()
	if e, ok := sessionMap[key]; ok && e.expiresAt.After(now) {
		e.expiresAt = now.Add(sessionTTL)
		sessionMap[key] = e
		return e.sessionID
	}
	id := generateOpenCodeID("ses", true)
	sessionMap[key] = sessionEntry{id, now.Add(sessionTTL)}
	return id
}
func ResetSessionCache() {
	sessionMu.Lock()
	defer sessionMu.Unlock()
	sessionMap = map[string]sessionEntry{}
	idCounter = 0
	lastIDTimestamp = 0
}
func SetSessionExpiry(key string, d time.Duration) {
	sessionMu.Lock()
	defer sessionMu.Unlock()
	if e, ok := sessionMap[key]; ok {
		e.expiresAt = time.Now().Add(d)
		sessionMap[key] = e
	}
}
func OpencodeSession(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if ctx.Provider == nil || !strings.Contains(strings.ToLower(ctx.Provider.BaseURL), "opencode.ai") {
		return req, nil
	}
	sessionID := getOrCreateSession(computeFingerprint(ctx))
	headers := map[string]string{}
	for k, v := range req.Headers {
		headers[k] = v
	}
	headers["x-opencode-session"] = sessionID
	body := req.Body
	if ctx.Provider.Provider != config.ProviderAnthropic {
		body = map[string]any{}
		for k, v := range req.Body {
			body[k] = v
		}
		body["prompt_cache_key"] = sessionID
	}
	return &UpstreamRequest{URL: req.URL, Headers: headers, Body: body}, nil
}
