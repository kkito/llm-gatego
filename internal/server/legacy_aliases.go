package server

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
)

// RegisterLegacyFormAliases maps original llm-gateway v1.15.0 form URLs to
// the Go /api/admin JSON endpoints, preserving the original browser form actions.
// Browser forms submit application/x-www-form-urlencoded and expect a page
// redirect back, while the Go API accepts JSON and returns an {ok,data,error}
// envelope. This bridge converts between the two.
func RegisterLegacyFormAliases(mux *http.ServeMux) {
	exact := map[string]string{
		"/admin/models/":          "/api/admin/models/",
		"/admin/model-groups/":    "/api/admin/model-groups/",
		"/admin/announcement":     "/api/admin/announcement",
		"/admin/privacy":          "/api/admin/privacy",
		"/admin/api-keys/delete/": "/api/admin/api-keys/delete/",
		"/admin/api-keys/edit/":   "/api/admin/api-keys/edit/",
		"/admin/users/toggle":     "/api/admin/users/toggle",
		"/admin/users/delete/":    "/api/admin/users/delete/",
		"/admin/users/edit/":      "/api/admin/users/edit/",
	}
	// Exact endpoints that have no trailing slash suffix.
	plain := map[string]string{
		"/admin/api-keys":     "/api/admin/api-keys",
		"/admin/models":       "/api/admin/models",
		"/admin/model-groups": "/api/admin/model-groups",
		"/admin/users":        "/api/admin/users",
	}
	// The model-test panel posts JSON via fetch and expects a raw JSON reply.
	mux.HandleFunc("POST /admin/models/test", jsonBridge(mux, "/api/admin/models/test"))
	for from, to := range exact {
		from, to := from, to
		mux.HandleFunc("POST "+from, formBridge(mux, from, to))
	}
	for from, to := range plain {
		from, to := from, to
		mux.HandleFunc("POST "+from, formBridge(mux, from, to))
	}

	// Original model-group editor uses GET links for model membership changes.
	getAliases := map[string]string{
		"/admin/model-groups/edit/": "/api/admin/model-groups/edit/",
	}
	for from, to := range getAliases {
		from, to := from, to
		mux.HandleFunc("GET "+from, queryBridge(mux, from, to))
	}
}

func formBridge(mux *http.ServeMux, from, to string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		payload := map[string]any{}
		ct := r.Header.Get("Content-Type")
		if strings.HasPrefix(ct, "application/x-www-form-urlencoded") || strings.HasPrefix(ct, "multipart/form-data") {
			if err := r.ParseForm(); err == nil {
				for k, vals := range r.PostForm {
					payload[k] = formField(k, vals)
				}
			}
			if err := r.ParseMultipartForm(1 << 20); err == nil && r.MultipartForm != nil {
				for k, vals := range r.MultipartForm.Value {
					payload[k] = formField(k, vals)
				}
			}
		} else if body, err := io.ReadAll(r.Body); err == nil && len(body) > 0 {
			_ = json.Unmarshal(body, &payload)
		}
		normalizeFormPayload(payload)
		body, _ := json.Marshal(payload)
		clone := r.Clone(r.Context())
		u := *r.URL
		suffix := strings.TrimPrefix(r.URL.Path, from)
		if suffix == r.URL.Path && !strings.HasSuffix(from, "/") {
			suffix = ""
		}
		u.Path = to + suffix
		clone.URL = &u
		clone.Body = io.NopCloser(bytes.NewReader(body))
		clone.ContentLength = int64(len(body))
		clone.Header.Set("Content-Type", "application/json")

		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, clone)
		res := rec.Result()
		defer res.Body.Close()
		resBody, _ := io.ReadAll(res.Body)

		if res.StatusCode >= 200 && res.StatusCode < 300 {
			target := formSuccessTarget(r)
			if target == "" {
				target = "/admin"
				if ref := r.Header.Get("Referer"); ref != "" {
					if u, err := url.Parse(ref); err == nil && strings.HasPrefix(u.Path, "/") {
						target = u.Path
					}
				}
			}
			// Keep 200 for compatibility with migrated e2e tests; the browser
			// still returns to the originating page via a meta refresh.
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			_, _ = io.WriteString(w, `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=`+htmlEscape(target)+`"><a href="`+htmlEscape(target)+`">操作成功，返回…</a>`)
			return
		}
		msg := strings.TrimSpace(string(resBody))
		var env struct {
			Error any `json:"error"`
		}
		if json.Unmarshal(resBody, &env) == nil && env.Error != nil {
			switch e := env.Error.(type) {
			case string:
				msg = e
			case map[string]any:
				if m, _ := e["message"].(string); m != "" {
					msg = m
				}
			}
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(res.StatusCode)
		_, _ = io.WriteString(w, `<!doctype html><meta charset="utf-8"><title>操作失败</title><div style="font:14px system-ui;padding:40px"><h2>操作失败</h2><p>`+htmlEscape(msg)+`</p><a href="/admin">返回管理页</a></div>`)
	}
}

func htmlEscape(s string) string {
	r := strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", `"`, "&quot;")
	return r.Replace(s)
}

// formField converts original form values into the JSON types expected by the
// Go API DTOs. HTML forms only carry strings, so the bridge must restore the
// types that the original TypeScript parseBody handlers created manually.
func formField(key string, vals []string) any {
	arrayFields := map[string]bool{"allowedModels": true, "models": true}
	if arrayFields[key] {
		out := []string{}
		for _, v := range vals {
			if strings.TrimSpace(v) != "" {
				out = append(out, v)
			}
		}
		return out
	}
	if len(vals) == 0 {
		return ""
	}
	v := vals[0]
	if key == "defaultParams" {
		if strings.TrimSpace(v) == "" {
			return map[string]any{}
		}
		var obj map[string]any
		if json.Unmarshal([]byte(v), &obj) == nil {
			return obj
		}
		return map[string]any{}
	}
	boolFields := map[string]bool{
		"enabled": true, "allModels": true, "stripUserField": true,
		"sanitizeFilePaths": true, "whitelistFilter": true,
		"detailLogEnabled": true,
	}
	if boolFields[key] {
		return strings.EqualFold(v, "true") || strings.EqualFold(v, "on") || v == "1"
	}
	numFields := map[string]bool{"maxContextLength": true, "periodValue": true, "max": true, "costMax": true, "delta": true, "from": true, "to": true}
	if numFields[key] {
		if strings.TrimSpace(v) == "" {
			return 0
		}
		var n float64
		if json.Unmarshal([]byte(v), &n) == nil {
			return n
		}
		return 0
	}
	return v
}

func normalizeFormPayload(p map[string]any) {
	if all, ok := p["allModels"].(bool); ok && all {
		p["allowedModels"] = []string{}
	}
	if typ, _ := p["type"].(string); typ == "cost" {
		if cost, ok := p["costMax"]; ok {
			p["max"] = cost
		}
	}
	delete(p, "allModels")
	delete(p, "costMax")
}

// queryBridge handles the original GET links used by the model-group editor.
func queryBridge(mux *http.ServeMux, from, to string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		payload := map[string]any{}
		for k, vals := range r.URL.Query() {
			payload[k] = formField(k, vals)
		}
		suffix := strings.TrimPrefix(r.URL.Path, from)
		clone := r.Clone(r.Context())
		u := *r.URL
		u.Path = to + suffix
		u.RawQuery = ""
		clone.URL = &u
		clone.Method = http.MethodPost
		body, _ := json.Marshal(payload)
		clone.Body = io.NopCloser(bytes.NewReader(body))
		clone.ContentLength = int64(len(body))
		clone.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, clone)
		res := rec.Result()
		defer res.Body.Close()
		resBody, _ := io.ReadAll(res.Body)
		if res.StatusCode >= 200 && res.StatusCode < 300 {
			http.Redirect(w, r, "/admin/model-groups/edit/"+strings.Split(strings.TrimPrefix(r.URL.Path, from), "/")[0], http.StatusSeeOther)
			return
		}
		w.WriteHeader(res.StatusCode)
		_, _ = w.Write(resBody)
	}
}

// formSuccessTarget returns the canonical list page for CRUD forms. Without
// this, a meta refresh back to the Referer would reload an edit form after a
// successful save instead of returning to its list page.
func formSuccessTarget(r *http.Request) string {
	p := r.URL.Path
	switch {
	case strings.HasPrefix(p, "/admin/models/edit/"), p == "/admin/models/new", p == "/admin/models":
		return "/admin/models"
	case strings.HasPrefix(p, "/admin/api-keys"):
		return "/admin/api-keys"
	case strings.HasPrefix(p, "/admin/model-groups"):
		return "/admin/model-groups"
	case strings.HasPrefix(p, "/admin/users"):
		return "/admin/users"
	default:
		return ""
	}
}

// jsonBridge forwards an AJAX JSON request to the API and returns the raw
// JSON response instead of wrapping it in an HTML meta-refresh page.
func jsonBridge(mux *http.ServeMux, to string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		clone := r.Clone(r.Context())
		u := *r.URL
		u.Path = to
		u.RawQuery = ""
		clone.URL = &u
		clone.Body = io.NopCloser(bytes.NewReader(body))
		clone.ContentLength = int64(len(body))
		clone.Header.Set("Content-Type", "application/json")

		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, clone)
		res := rec.Result()
		defer res.Body.Close()
		for k, vals := range res.Header {
			for _, v := range vals {
				w.Header().Add(k, v)
			}
		}
		w.WriteHeader(res.StatusCode)
		_, _ = io.Copy(w, res.Body)
	}
}
