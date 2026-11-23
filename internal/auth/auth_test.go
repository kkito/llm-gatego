package auth

import (
	"github.com/kkito/llm-gatego/internal/config"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestAdminSessions(t *testing.T) {
	ResetForTest()
	if HasSession("x") {
		t.Fatal("has")
	}
	SetSession("x")
	if !HasSession("x") {
		t.Fatal("missing")
	}
	ClearSession("x")
	if HasSession("x") {
		t.Fatal("still")
	}
	if IsPasswordConfigured(&config.ProxyConfig{}) {
		t.Fatal("no password")
	}
	if !IsPasswordConfigured(&config.ProxyConfig{AdminPassword: "secret"}) {
		t.Fatal("password")
	}
}
func TestUserAuth(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	os.WriteFile(path, []byte(`{"models":[],"userApiKeys":[{"name":"Alice","apikey":"key-1","allowedModels":["gpt-4"]}]}`), 0644)
	ResetForTest()
	if id, err := LoginUserSession("bad", path); err != nil || id != "" {
		t.Fatal(id, err)
	}
	id, err := LoginUserSession("key-1", path)
	if err != nil || id == "" {
		t.Fatal(id, err)
	}
	r := httptest.NewRequest("GET", "/user/main", nil)
	r.AddCookie(&http.Cookie{Name: "user_session", Value: id})
	u := GetCurrentUser(r, nil)
	if u == nil || len(u.AllowedModels) != 1 {
		t.Fatal("no user")
	}
	// middleware: auth configured
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusNoContent) })
	mw := UserAuthMiddleware(path, next)
	w := httptest.NewRecorder()
	mw.ServeHTTP(w, httptest.NewRequest("GET", "/user/main", nil))
	if w.Code != http.StatusFound {
		t.Fatal(w.Code)
	}
	w = httptest.NewRecorder()
	rr := httptest.NewRequest("GET", "/user/main", nil)
	rr.Header.Set("Authorization", "Bearer wrong")
	mw.ServeHTTP(w, rr)
	if w.Code != http.StatusFound {
		t.Fatal(w.Code)
	}
	w = httptest.NewRecorder()
	rr = httptest.NewRequest("GET", "/api/user/me", nil)
	mw.ServeHTTP(w, rr)
	if w.Code != http.StatusUnauthorized {
		t.Fatal(w.Code)
	}
	rr = httptest.NewRequest("GET", "/user/main", nil)
	rr.AddCookie(&http.Cookie{Name: "user_session", Value: id})
	w = httptest.NewRecorder()
	mw.ServeHTTP(w, rr)
	if w.Code != http.StatusNoContent {
		t.Fatal(w.Code)
	}
	rr = httptest.NewRequest("GET", "/user/main", nil)
	rr.Header.Set("x-api-key", "key-1")
	w = httptest.NewRecorder()
	mw.ServeHTTP(w, rr)
	if w.Code != http.StatusNoContent {
		t.Fatal(w.Code)
	}
	// auth disabled
	empty := filepath.Join(dir, "empty.json")
	os.WriteFile(empty, []byte(`{"models":[]}`), 0644)
	w = httptest.NewRecorder()
	UserAuthMiddleware(empty, next).ServeHTTP(w, httptest.NewRequest("GET", "/user/main", nil))
	if w.Code != http.StatusNoContent {
		t.Fatal(w.Code)
	}
}
