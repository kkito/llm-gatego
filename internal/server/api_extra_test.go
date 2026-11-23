package server

import (
	"encoding/json"
	"fmt"
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

func TestPasswordValidationAndDelete(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"models":[],"adminPassword":"old"}`), 0644)
	cfg := &config.ProxyConfig{AdminPassword: "old"}
	d := APIDeps{ConfigDir: dir, Get: func() *config.ProxyConfig { return cfg }}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/admin/password", func(w http.ResponseWriter, r *http.Request) { passwordHandler(w, r, d) })
	post := func(body string) map[string]any {
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, httptest.NewRequest("POST", "/api/admin/password", strings.NewReader(body)))
		var out map[string]any
		json.Unmarshal(w.Body.Bytes(), &out)
		return out
	}
	if out := post(`{"action":"change","currentPassword":"bad","newPassword":"n","confirmPassword":"n"}`); out["ok"] != false || !strings.Contains(fmt.Sprint(out["error"]), "当前密码错误") {
		t.Fatal(out)
	}
	if out := post(`{"action":"change","newPassword":"a","confirmPassword":"b"}`); out["ok"] != false {
		t.Fatal(out)
	}
	if out := post(`{"action":"delete","currentPassword":"old"}`); out["ok"] != true || func() bool {
		c, _ := config.LoadFullConfig(filepath.Join(dir, "config.json"))
		return c.AdminPassword != ""
	}() {
		c, _ := config.LoadFullConfig(filepath.Join(dir, "config.json"))
		t.Fatal(out, c.AdminPassword)
	}
}

func TestStatsAPIHeatmap182Days(t *testing.T) {
	d := extraDeps(t)
	mux := http.NewServeMux()
	RegisterExtraAdminAPIs(mux, d)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest("GET", "/api/admin/stats", nil))
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var env struct {
		Data struct {
			ByDate map[string]int `json:"byDate"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &env)
	if len(env.Data.ByDate) != 182 {
		t.Fatal(len(env.Data.ByDate))
	}
}

func TestLegacyFormBridgeConvertsURLEncodedBody(t *testing.T) {
	d := extraDeps(t)
	mux := http.NewServeMux()
	RegisterAdminAPIs(mux, d)
	RegisterExtraAdminAPIs(mux, d)
	RegisterLegacyFormAliases(mux)

	r := httptest.NewRequest(http.MethodPost, "/admin/api-keys", strings.NewReader("name=mykey&key=sk-secret"))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, r)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d body=%s", w.Code, w.Body.String())
	}
	if len(d.Get().ApiKeys) != 1 || d.Get().ApiKeys[0].Name != "mykey" {
		t.Fatalf("api keys = %+v", d.Get().ApiKeys)
	}
}

func TestModelEditAPIKeySourceAndFallback(t *testing.T) {
	d := extraDeps(t)
	mux := http.NewServeMux()
	RegisterAdminAPIs(mux, d)
	cfg := d.Get()
	var key config.ApiKey
	cfg.ApiKeys, key, _ = config.AddAPIKey(cfg.ApiKeys, "ref", "sk-ref")
	b, _ := json.Marshal(cfg)
	os.WriteFile(filepath.Join(d.ConfigDir, "config.json"), b, 0644)
	// api key source reference
	w := callExtra(t, mux, "POST", "/api/admin/models/edit/m1", `{"customModel":"m1","realModel":"r1","baseUrl":"http://u","provider":"openai","apiKeySource":"`+key.ID+`"}`)
	if w.Code != http.StatusOK {
		t.Fatal(w.Code, w.Body.String())
	}
	if d.Get().Models[0].APIKey != "$$ref$$" {
		t.Fatal(d.Get().Models[0].APIKey)
	}
	// fallback keeps old key when no manual key
	w = callExtra(t, mux, "POST", "/api/admin/models/edit/m1", `{"customModel":"m1","realModel":"r1","baseUrl":"http://u","provider":"openai","apiKey":""}`)
	if w.Code != http.StatusOK {
		t.Fatal(w.Code, w.Body.String())
	}
	if d.Get().Models[0].APIKey != "$$ref$$" {
		t.Fatal(d.Get().Models[0].APIKey)
	}
}
