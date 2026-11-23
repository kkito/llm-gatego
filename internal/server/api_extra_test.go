package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kkito/llm-gatego/internal/config"
)

func extraDeps(t *testing.T) APIDeps {
	dir := t.TempDir()
	cfg := &config.ProxyConfig{
		Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "r1", Provider: config.ProviderOpenAI, APIKey: "k", BaseURL: "http://u"},
			{CustomModel: "m2", RealModel: "r2", Provider: config.ProviderOpenAI, APIKey: "k", BaseURL: "http://u"}},
		ModelGroups: []config.ModelGroup{{Name: "g", Models: []string{"m1"}}},
		UserApiKeys: []config.UserApiKey{{Name: "Alice", APIKey: "sk-a", AllowedModels: []string{"m1"}}},
		UiSettings:  &config.UiSettings{AnnouncementMarkdown: "hello"},
	}
	b, _ := configJSON(cfg)
	if err := os.WriteFile(filepath.Join(dir, "config.json"), b, 0644); err != nil {
		t.Fatal(err)
	}
	return APIDeps{ConfigDir: dir, Get: func() *config.ProxyConfig { return cfg }, Update: func(c *config.ProxyConfig) { *cfg = *c }}
}

func configJSON(c *config.ProxyConfig) ([]byte, error) {
	return json.Marshal(c)
}

func callExtra(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	r := httptest.NewRequest(method, path, strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}

func TestExtraAdminAPIs(t *testing.T) {
	d := extraDeps(t)
	mux := http.NewServeMux()
	RegisterAdminAPIs(mux, d)
	RegisterExtraAdminAPIs(mux, d)
	for _, tc := range []struct{ method, path, body, want string }{
		{"GET", "/api/admin/announcement", "", "hello"},
		{"POST", "/api/admin/announcement", `{"content":"world"}`, "world"},
		{"GET", "/api/admin/users/api", "", "Alice"},
		{"GET", "/api/user/config", "", "m1"},
		{"GET", "/api/admin/models/m1/limits", "", "ok"},
		{"POST", "/api/admin/models/m1/limits/add", `{"type":"requests","period":"day","periodValue":1,"max":100}`, "ok"},
		{"POST", "/api/admin/models/m1/limits/delete/0", "", "ok"},
		{"POST", "/api/admin/model-groups/edit/g/add-model", `{"model":"m2"}`, "m2"},
		{"POST", "/api/admin/model-groups/edit/g/remove-model", `{"model":"m2"}`, "ok"},
		{"GET", "/api/admin/usage?model=m1", "", "m1"},
	} {
		w := callExtra(t, mux, tc.method, tc.path, tc.body)
		if w.Code != 200 || !strings.Contains(w.Body.String(), tc.want) {
			t.Errorf("%s %s => %d %s", tc.method, tc.path, w.Code, w.Body.String())
		}
	}
}
