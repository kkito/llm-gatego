package server

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/config"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func newAPITest(t *testing.T) (*http.ServeMux, APIDeps) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	os.WriteFile(path, []byte(`{"models":[{"customModel":"m1","realModel":"r1","baseUrl":"http://up","provider":"openai","apiKey":"k"}],"modelGroups":[{"name":"g1","models":["m1"]}],"userApiKeys":[{"name":"Alice","apikey":"key-1"}],"apiKeys":[]}`), 0644)
	var current *config.ProxyConfig
	d := APIDeps{ConfigDir: dir, Get: func() *config.ProxyConfig { return current }, Update: func(c *config.ProxyConfig) { current = c }}
	mux := http.NewServeMux()
	RegisterAdminAPIs(mux, d)
	RegisterUserAPIs(mux, d)
	return mux, d
}
func call(t *testing.T, mux http.Handler, method, path, body string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest(method, path, strings.NewReader(body)))
	return w
}
func TestAdminAPIEnvelopeAndCRUD(t *testing.T) {
	mux, d := newAPITest(t)
	w := call(t, mux, "GET", "/api/admin/models", "")
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var out Envelope[[]config.ProviderConfig]
	json.Unmarshal(w.Body.Bytes(), &out)
	if !out.OK || out.Data == nil || len(*out.Data) != 1 {
		t.Fatal(out)
	}
	w = call(t, mux, "POST", "/api/admin/models", `{"customModel":"m2","realModel":"r2","baseUrl":"http://up","provider":"openai","apiKey":"k"}`)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "GET", "/api/admin/models", "")
	if !strings.Contains(w.Body.String(), "m2") {
		t.Fatal(w.Body.String())
	}
	w = call(t, mux, "POST", "/api/admin/models/delete/m1", "")
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "GET", "/api/admin/models", "")
	if strings.Contains(w.Body.String(), "m1") {
		t.Fatal(w.Body.String())
	}
	w = call(t, mux, "POST", "/api/admin/models", `{"customModel":"m2"}`)
	if w.Code != 400 {
		t.Fatal(w.Code)
	}
	_ = d
}
func TestAdminModelGroupAndKeys(t *testing.T) {
	mux, _ := newAPITest(t)
	w := call(t, mux, "POST", "/api/admin/model-groups/add-placeholder", "")
	if w.Code != 404 {
		t.Fatal(w.Code)
	}
	w = call(t, mux, "POST", "/api/admin/model-groups", `{"name":"g2","models":["m1"]}`)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "POST", "/api/admin/model-groups/delete/g1", "")
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "POST", "/api/admin/api-keys", `{"name":"K","key":"sk-secret"}`)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "GET", "/api/admin/api-keys", "")
	if strings.Contains(w.Body.String(), "sk-secret") || !strings.Contains(w.Body.String(), "K") {
		t.Fatal(w.Body.String())
	}
}
func TestAdminPrivacyPasswordAuth(t *testing.T) {
	mux, d := newAPITest(t)
	w := call(t, mux, "GET", "/api/admin/privacy", "")
	if w.Code != 200 || !strings.Contains(w.Body.String(), "ok") {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "POST", "/api/admin/privacy", `{"enabled":true,"stripUserField":true,"sanitizeFilePaths":true,"pathPlaceholder":"U","whitelistFilter":true}`)
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
	w = call(t, mux, "POST", "/api/admin/password", `{"password":"secret"}`)
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
	guarded := AdminAuth(mux, d)
	w = call(t, guarded, "GET", "/api/admin/models", "")
	if w.Code != 401 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "POST", "/api/admin/login", `{"password":"wrong"}`)
	if w.Code != 401 {
		t.Fatal(w.Code)
	}
	w = call(t, mux, "POST", "/api/admin/login", `{"password":"secret"}`)
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
	var login Envelope[map[string]any]
	json.Unmarshal(w.Body.Bytes(), &login)
	session := (*login.Data)["session"].(string)
	r := httptest.NewRequest("GET", "/api/admin/models", nil)
	r.Header.Set("Authorization", "Bearer "+session)
	w = httptest.NewRecorder()
	guarded.ServeHTTP(w, r)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
}
func TestUserAPI(t *testing.T) {
	mux, _ := newAPITest(t)
	w := call(t, mux, "POST", "/api/user/login", `{"apikey":"bad"}`)
	if w.Code != 401 {
		t.Fatal(w.Code)
	}
	w = call(t, mux, "POST", "/api/user/login", `{"apikey":"key-1"}`)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	w = call(t, mux, "POST", "/api/user/logout", "")
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
}
