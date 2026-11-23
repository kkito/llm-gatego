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
		"/admin/models/test":      "/api/admin/models/test",
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
	for from, to := range exact {
		from, to := from, to
		mux.HandleFunc("POST "+from, formBridge(mux, from, to))
	}
	for from, to := range plain {
		from, to := from, to
		mux.HandleFunc("POST "+from, formBridge(mux, from, to))
	}
}

func formBridge(mux *http.ServeMux, from, to string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		payload := map[string]any{}
		ct := r.Header.Get("Content-Type")
		if strings.HasPrefix(ct, "application/x-www-form-urlencoded") || strings.HasPrefix(ct, "multipart/form-data") {
			if err := r.ParseForm(); err == nil {
				for k, vals := range r.PostForm {
					if len(vals) > 0 {
						payload[k] = vals[0]
					}
				}
			}
			if err := r.ParseMultipartForm(1 << 20); err == nil && r.MultipartForm != nil {
				for k, vals := range r.MultipartForm.Value {
					if len(vals) > 0 {
						payload[k] = vals[0]
					}
				}
			}
		} else if body, err := io.ReadAll(r.Body); err == nil && len(body) > 0 {
			_ = json.Unmarshal(body, &payload)
		}
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
			target := "/admin"
			if ref := r.Header.Get("Referer"); ref != "" {
				if u, err := url.Parse(ref); err == nil && strings.HasPrefix(u.Path, "/") {
					target = u.Path
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
			Error string `json:"error"`
		}
		if json.Unmarshal(resBody, &env) == nil && env.Error != "" {
			msg = env.Error
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
