package e2e

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/proxy"
	"github.com/kkito/llm-gatego/internal/server"
)

func formValue(m map[string]string) string {
	v := url.Values{}
	for k, x := range m {
		v.Set(k, x)
	}
	return v.Encode()
}

func newFullServer(t *testing.T, cfg *config.ProxyConfig) (http.Handler, string) {
	t.Helper()
	if cfg.Models == nil {
		cfg.Models = []config.ProviderConfig{}
	}
	for i := range cfg.Models {
		if cfg.Models[i].Provider == "" {
			cfg.Models[i].Provider = config.ProviderOpenAI
		}
		if cfg.Models[i].RealModel == "" {
			cfg.Models[i].RealModel = cfg.Models[i].CustomModel
		}
		if cfg.Models[i].BaseURL == "" {
			cfg.Models[i].BaseURL = "http://up"
		}
		if cfg.Models[i].APIKey == "" {
			cfg.Models[i].APIKey = "k"
		}
	}
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	b, _ := json.Marshal(cfg)
	if err := os.WriteFile(path, b, 0600); err != nil {
		t.Fatal(err)
	}
	mux := server.New(cfg, proxy.Dependencies{}, config.ConfigContext{ConfigDir: dir, ConfigPath: path}, server.Options{})
	return mux, path
}

func postForm(t *testing.T, mux http.Handler, path string, values url.Values) *httptest.ResponseRecorder {
	t.Helper()
	r := httptest.NewRequest(http.MethodPost, path, strings.NewReader(values.Encode()))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Set("Referer", path)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, r)
	return w
}

func load(t *testing.T, path string) *config.ProxyConfig {
	t.Helper()
	c, err := config.LoadFullConfig(path)
	if err != nil {
		t.Fatal(err)
	}
	return c
}

func TestE2EModelCreateFormDefaultParams(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{Models: []config.ProviderConfig{}, ApiKeys: []config.ApiKey{}})
	v := url.Values{
		"customModel": {"m1"}, "realModel": {"r1"}, "provider": {"openai"},
		"baseUrl": {"http://up"}, "apiKey": {"k"}, "maxContextLength": {"200000"},
		"defaultParams": {`{"temperature":0.7,"max_tokens":4096}`},
	}
	w := postForm(t, mux, "/admin/models", v)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if len(cfg.Models) != 1 {
		t.Fatal(cfg.Models)
	}
	if cfg.Models[0].MaxContextLength != 200000 {
		t.Fatalf("maxContextLength=%d", cfg.Models[0].MaxContextLength)
	}
	if cfg.Models[0].DefaultParams["temperature"] != 0.7 {
		t.Fatalf("defaultParams=%v", cfg.Models[0].DefaultParams)
	}
}

func TestE2EModelEditFormDefaultParams(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1", RealModel: "r1", Provider: config.ProviderOpenAI, BaseURL: "http://up", APIKey: "k"}}})
	v := url.Values{
		"customModel": {"m1"}, "realModel": {"r2"}, "provider": {"openai"},
		"baseUrl": {"http://up2"}, "apiKey": {"sk-new"}, "maxContextLength": {"128000"},
		"defaultParams": {`{"temperature":0.2}`},
	}
	w := postForm(t, mux, "/admin/models/edit/m1", v)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if cfg.Models[0].RealModel != "r2" || cfg.Models[0].MaxContextLength != 128000 {
		t.Fatalf("%+v", cfg.Models[0])
	}
	if cfg.Models[0].DefaultParams["temperature"] != 0.2 {
		t.Fatalf("%v", cfg.Models[0].DefaultParams)
	}
}

func TestE2EApiKeyForms(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{})
	if w := postForm(t, mux, "/admin/api-keys", url.Values{"name": {"main"}, "key": {"sk-123"}}); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if len(cfg.ApiKeys) != 1 {
		t.Fatal(cfg.ApiKeys)
	}
	id := cfg.ApiKeys[0].ID
	if w := postForm(t, mux, "/admin/api-keys/edit/"+id, url.Values{"name": {"renamed"}, "key": {"sk-456"}}); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg = load(t, path)
	if cfg.ApiKeys[0].Name != "renamed" || cfg.ApiKeys[0].Key != "sk-456" {
		t.Fatal(cfg.ApiKeys)
	}
	if w := postForm(t, mux, "/admin/api-keys/delete/"+id, url.Values{}); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg = load(t, path)
	if len(cfg.ApiKeys) != 0 {
		t.Fatal(cfg.ApiKeys)
	}
}

func TestE2EUsersToggleForm(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{UserApiKeys: []config.UserApiKey{{Name: "u", APIKey: "sk-u"}}})
	if w := postForm(t, mux, "/admin/users/toggle", url.Values{"enabled": {"false"}}); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if len(cfg.UserApiKeys) != 0 {
		t.Fatal(cfg.UserApiKeys)
	}
	if w := postForm(t, mux, "/admin/users/toggle", url.Values{"enabled": {"true"}}); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg = load(t, path)
	if len(cfg.UserApiKeys) != 1 {
		t.Fatal(cfg.UserApiKeys)
	}
}

func TestE2EUserCreateFormAllowedModels(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1"}, {CustomModel: "m2"}}})
	v := url.Values{"name": {"u"}, "desc": {"desc"}, "allowedModels": {"m1", "m2"}}
	if w := postForm(t, mux, "/admin/users", v); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if len(cfg.UserApiKeys) != 1 || len(cfg.UserApiKeys[0].AllowedModels) != 2 {
		t.Fatalf("%+v", cfg.UserApiKeys)
	}
}

func TestE2EModelLimitAddForm(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1"}}})
	v := url.Values{"type": {"requests"}, "period": {"day"}, "periodValue": {"1"}, "max": {"100"}}
	if w := postForm(t, mux, "/admin/models/m1/limits/add", v); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if len(cfg.Models[0].Limits) != 1 || cfg.Models[0].Limits[0].Max != 100 {
		t.Fatalf("%+v", cfg.Models[0].Limits)
	}
}

func TestE2EPrivacyForm(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{})
	v := url.Values{"enabled": {"on"}, "stripUserField": {"on"}, "pathPlaceholder": {"ME"}, "detailLogEnabled": {"on"}}
	if w := postForm(t, mux, "/admin/privacy", v); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if cfg.PrivacySettings == nil || !cfg.PrivacySettings.Enabled || !cfg.PrivacySettings.StripUserField || cfg.PrivacySettings.PathPlaceholder != "ME" {
		t.Fatalf("%+v", cfg.PrivacySettings)
	}
	if !cfg.DetailLogEnabled {
		t.Fatal("detailLogEnabled not saved")
	}
}

func TestE2EAnnouncementForm(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{})
	v := url.Values{"content": {"hello"}, "enabled": {"on"}}
	if w := postForm(t, mux, "/admin/announcement", v); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if cfg.UiSettings == nil || cfg.UiSettings.AnnouncementMarkdown != "hello" || !cfg.UiSettings.Enabled {
		t.Fatalf("%+v", cfg.UiSettings)
	}
}

func TestE2EGroupModelLinks(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{
		Models:      []config.ProviderConfig{{CustomModel: "a"}, {CustomModel: "b"}},
		ModelGroups: []config.ModelGroup{{Name: "g1", Models: []string{"a", "b"}}},
	})
	for _, p := range []string{
		"/admin/model-groups/edit/g1/remove-model?model=a",
		"/admin/model-groups/edit/g1/add-model?model=a",
		"/admin/model-groups/edit/g1/move-model?model=b&delta=1",
	} {
		w := call(t, mux, http.MethodGet, p, "", nil)
		if w.Code != http.StatusSeeOther {
			t.Fatal(p, w.Code, w.Body.String())
		}
	}
	cfg := load(t, path)
	if len(cfg.ModelGroups[0].Models) != 2 || cfg.ModelGroups[0].Models[0] != "a" || cfg.ModelGroups[0].Models[1] != "b" {
		t.Fatal(cfg.ModelGroups)
	}
}

func TestE2EGroupCreateEditForms(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1"}}})
	if w := postForm(t, mux, "/admin/model-groups", url.Values{"name": {"g1"}, "desc": {"d1"}, "models": {"m1"}}); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if len(cfg.ModelGroups) != 1 || cfg.ModelGroups[0].Name != "g1" {
		t.Fatal(cfg.ModelGroups)
	}
	if w := postForm(t, mux, "/admin/model-groups/edit/g1", url.Values{"name": {"g1"}, "desc": {"d2"}}); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg = load(t, path)
	if cfg.ModelGroups[0].Desc != "d2" {
		t.Fatal(cfg.ModelGroups)
	}
}

func TestE2EUserEditFormAllowedModels(t *testing.T) {
	mux, path := newFullServer(t, &config.ProxyConfig{UserApiKeys: []config.UserApiKey{{Name: "u", APIKey: "sk-u", AllowedModels: []string{"m1"}}}})
	v := url.Values{"name": {"u"}, "desc": {"d2"}, "apikey": {"sk-u"}, "allowedModels": {"m1", "m2"}}
	if w := postForm(t, mux, "/admin/users/edit/u", v); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	cfg := load(t, path)
	if len(cfg.UserApiKeys[0].AllowedModels) != 2 {
		t.Fatalf("%+v", cfg.UserApiKeys[0])
	}
}

func TestE2EModelCreateFormSavedKeySelection(t *testing.T) {
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{}}
	cfg.ApiKeys, _, _ = config.AddAPIKey(cfg.ApiKeys, "opencode", "sk-opencode")
	mux, path := newFullServer(t, cfg)
	keyID := load(t, path).ApiKeys[0].ID
	v := url.Values{
		"customModel": {"m1"}, "realModel": {"r1"}, "provider": {"openai"},
		"baseUrl": {"http://up"}, "apiKeySource": {keyID},
	}
	w := postForm(t, mux, "/admin/models", v)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	got := load(t, path).Models[0].APIKey
	if got != "$$opencode$$" {
		t.Fatalf("apiKey=%q", got)
	}
}
