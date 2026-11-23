package server

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/auth"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/util"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type APIError struct {
	Code    string `json:"code,omitempty"`
	Message string `json:"message"`
}
type Envelope[T any] struct {
	OK    bool      `json:"ok"`
	Data  *T        `json:"data,omitempty"`
	Error *APIError `json:"error,omitempty"`
}

func okJSON[T any](w http.ResponseWriter, data T) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Envelope[T]{OK: true, Data: &data})
}
func fail(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(Envelope[any]{OK: false, Error: &APIError{Message: msg}})
}
func readJSON(w http.ResponseWriter, r *http.Request, dst any) bool {
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(dst); err != nil {
		fail(w, 400, "invalid JSON: "+err.Error())
		return false
	}
	return true
}

type APIDeps struct {
	ConfigDir string
	Get       func() *config.ProxyConfig
	Update    func(*config.ProxyConfig)
}

func (d APIDeps) path() string                       { return filepath.Join(d.ConfigDir, "config.json") }
func (d APIDeps) load() (*config.ProxyConfig, error) { return config.LoadFullConfig(d.path()) }
func (d APIDeps) save(cfg *config.ProxyConfig) error {
	if err := config.SaveConfig(cfg, d.path()); err != nil {
		return err
	}
	if d.Update != nil {
		d.Update(cfg)
	}
	return nil
}
func RegisterAdminAPIs(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("GET /api/admin/models", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, cfg.Models)
	})
	mux.HandleFunc("POST /api/admin/models", func(w http.ResponseWriter, r *http.Request) {
		var in config.ProviderConfig
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		for _, m := range cfg.Models {
			if m.CustomModel == in.CustomModel {
				fail(w, 400, "model already exists")
				return
			}
		}
		cfg.Models = append(cfg.Models, in)
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, in)
	})
	mux.HandleFunc("POST /api/admin/models/delete/{model}", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		cfg, err = config.RemoveModelFromConfig(cfg, r.PathValue("model"))
		if err != nil {
			fail(w, 400, err.Error())
			return
		}
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"deleted": true})
	})
	mux.HandleFunc("POST /api/admin/models/copy/{model}", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			NewName string `json:"newName"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		var copy *config.ProviderConfig
		for i, m := range cfg.Models {
			if m.CustomModel == r.PathValue("model") {
				c := m
				c.CustomModel = in.NewName
				copy = &c
				_ = i
				break
			}
		}
		if copy == nil {
			fail(w, 404, "model not found")
			return
		}
		cfg.Models = append(cfg.Models, *copy)
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, copy)
	})
	mux.HandleFunc("POST /api/admin/models/move/{model}", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			From int `json:"from"`
			To   int `json:"to"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		if in.From < 0 || in.To < 0 || in.From >= len(cfg.Models) || in.To >= len(cfg.Models) {
			fail(w, 400, "invalid index")
			return
		}
		m := cfg.Models[in.From]
		cfg.Models = append(cfg.Models[:in.From], cfg.Models[in.From+1:]...)
		cfg.Models = append(cfg.Models[:in.To], append([]config.ProviderConfig{m}, cfg.Models[in.To:]...)...)
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, cfg.Models)
	})
	mux.HandleFunc("POST /api/admin/models/toggle-hidden/{model}", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		found := false
		for i := range cfg.Models {
			if cfg.Models[i].CustomModel == r.PathValue("model") {
				cfg.Models[i].Hidden = !cfg.Models[i].Hidden
				found = true
				okJSON(w, cfg.Models[i])
				break
			}
		}
		if !found {
			fail(w, 404, "model not found")
			return
			_ = cfg
		}
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
		}
	})
	mux.HandleFunc("GET /api/admin/model-groups", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, cfg.ModelGroups)
	})
	mux.HandleFunc("POST /api/admin/model-groups", func(w http.ResponseWriter, r *http.Request) {
		var in config.ModelGroup
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		cfg.ModelGroups = append(cfg.ModelGroups, in)
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, in)
	})
	mux.HandleFunc("POST /api/admin/model-groups/delete/{name}", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		cfg, err = config.RemoveModelGroupFromConfig(cfg, r.PathValue("name"))
		if err != nil {
			fail(w, 400, err.Error())
			return
		}
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"deleted": true})
	})
	mux.HandleFunc("POST /api/admin/model-groups/edit/{name}/add-model", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Model string `json:"model"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		for i := range cfg.ModelGroups {
			if cfg.ModelGroups[i].Name == r.PathValue("name") {
				cfg.ModelGroups[i].Models = append(cfg.ModelGroups[i].Models, in.Model)
				if err := d.save(cfg); err != nil {
					fail(w, 500, err.Error())
					return
				}
				okJSON(w, cfg.ModelGroups[i])
				return
			}
		}
		fail(w, 404, "group not found")
	})
	mux.HandleFunc("GET /api/admin/api-keys", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		keys := []map[string]any{}
		for _, k := range cfg.ApiKeys {
			keys = append(keys, map[string]any{"id": k.ID, "name": k.Name, "key": config.MaskAPIKey(k.Key), "keyHint": config.MaskAPIKey(k.Key), "createdAt": k.CreatedAt, "updatedAt": k.UpdatedAt})
		}
		okJSON(w, keys)
	})
	mux.HandleFunc("POST /api/admin/api-keys", func(w http.ResponseWriter, r *http.Request) {
		var in struct{ Name, Key string }
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		cfg.ApiKeys, _, err = config.AddAPIKey(cfg.ApiKeys, in.Name, in.Key)
		if err != nil {
			fail(w, 400, err.Error())
			return
		}
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"name": in.Name})
	})
	mux.HandleFunc("POST /api/admin/api-keys/delete/{id}", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		out := []config.ApiKey{}
		for _, k := range cfg.ApiKeys {
			if k.ID != r.PathValue("id") {
				out = append(out, k)
			}
		}
		cfg.ApiKeys = out
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"deleted": true})
	})
	mux.HandleFunc("GET /api/admin/users", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, cfg.UserApiKeys)
	})
	mux.HandleFunc("POST /api/admin/users", func(w http.ResponseWriter, r *http.Request) {
		var in config.UserApiKey
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		cfg.UserApiKeys = append(cfg.UserApiKeys, in)
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, in)
	})
	mux.HandleFunc("POST /api/admin/users/delete/{name}", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		out := []config.UserApiKey{}
		for _, u := range cfg.UserApiKeys {
			if u.Name != r.PathValue("name") {
				out = append(out, u)
			}
		}
		cfg.UserApiKeys = out
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"deleted": true})
	})
	mux.HandleFunc("GET /api/admin/privacy", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		if cfg.PrivacySettings == nil {
			okJSON(w, config.PrivacySettings{})
			return
		}
		okJSON(w, *cfg.PrivacySettings)
	})
	mux.HandleFunc("POST /api/admin/privacy", func(w http.ResponseWriter, r *http.Request) {
		var in config.PrivacySettings
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		cfg.PrivacySettings = &in
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, in)
	})
	mux.HandleFunc("GET /api/admin/auth-status", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"passwordConfigured": auth.IsPasswordConfigured(cfg)})
	})
	mux.HandleFunc("POST /api/admin/password", func(w http.ResponseWriter, r *http.Request) { passwordHandler(w, r, d) })

	mux.HandleFunc("POST /api/admin/login", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Password string `json:"password"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		if cfg.AdminPassword == "" || in.Password != cfg.AdminPassword {
			fail(w, 401, "invalid password")
			return
		}
		id := util.SHA256Password(in.Password + strconv.Itoa(os.Getpid()))[:32]
		auth.SetSession(id)
		okJSON(w, map[string]any{"session": id})
	})
}
func passwordHandler(w http.ResponseWriter, r *http.Request, d APIDeps) {
	var in struct {
		Action          string `json:"action"`
		Password        string `json:"password"`
		NewPassword     string `json:"newPassword"`
		ConfirmPassword string `json:"confirmPassword"`
		CurrentPassword string `json:"currentPassword"`
	}
	if !readJSON(w, r, &in) {
		return
	}
	cfg, err := d.load()
	if err != nil {
		fail(w, 500, err.Error())
		return
	}
	hasPassword := auth.IsPasswordConfigured(cfg)
	action := in.Action
	if action == "" {
		action = "change"
	}
	switch action {
	case "delete":
		if !hasPassword {
			fail(w, 400, "当前未设置密码")
			return
		}
		if in.CurrentPassword != cfg.AdminPassword {
			fail(w, 400, "当前密码错误")
			return
		}
		cfg.AdminPassword = ""
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"updated": true, "message": "密码已删除"})
	case "change":
		newPassword := in.NewPassword
		if newPassword == "" {
			newPassword = in.Password
		}
		if newPassword == "" {
			fail(w, 400, "新密码不能为空")
			return
		}
		if newPassword != in.ConfirmPassword && in.ConfirmPassword != "" {
			fail(w, 400, "两次输入的新密码不一致")
			return
		}
		if hasPassword && in.CurrentPassword != cfg.AdminPassword {
			fail(w, 400, "当前密码错误")
			return
		}
		cfg.AdminPassword = newPassword
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"updated": true, "message": "密码已更新"})
	default:
		fail(w, 400, "未知操作")
	}
}
func RegisterUserAPIs(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("POST /api/user/login", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			APIKey string `json:"apikey"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		id, err := auth.LoginUserSession(in.APIKey, d.path())
		if err != nil || id == "" {
			fail(w, 401, "invalid API key")
			return
		}
		http.SetCookie(w, &http.Cookie{Name: "user_session", Value: id, Path: "/", HttpOnly: true})
		okJSON(w, map[string]any{"session": id})
	})
	mux.HandleFunc("POST /api/user/logout", func(w http.ResponseWriter, r *http.Request) {
		if c, err := r.Cookie("user_session"); err == nil {
			userLogout(c.Value)
		}
		http.SetCookie(w, &http.Cookie{Name: "user_session", Value: "", Path: "/", MaxAge: -1})
		okJSON(w, map[string]any{"ok": true})
	})
}
func userLogout(id string) { auth.ClearUserSession(id) }
func AdminAuth(next http.Handler, d APIDeps) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		if !auth.IsPasswordConfigured(cfg) {
			next.ServeHTTP(w, r)
			return
		}
		id := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		if id == "" {
			id = r.URL.Query().Get("session")
		}
		if id == "" || !auth.HasSession(id) {
			fail(w, 401, "unauthorized")
			return
		}
		next.ServeHTTP(w, r)
	})
}
