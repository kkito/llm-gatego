package server

import (
	"net/http"
	"strings"
)

// RegisterLegacyFormAliases maps original llm-gateway v1.15.0 form URLs to
// the Go /api/admin JSON endpoints, preserving the original browser form actions.
func RegisterLegacyFormAliases(mux *http.ServeMux) {
	exact := map[string]string{
		"/admin/models":                 "/api/admin/models",
		"/admin/models/test":            "/api/admin/models/test",
		"/admin/model-groups":           "/api/admin/model-groups",
		"/admin/announcement":           "/api/admin/announcement",
		"/admin/password":               "/api/admin/password",
		"/admin/privacy":                "/api/admin/privacy",
		"/admin/api-keys":               "/api/admin/api-keys",
		"/admin/users":                  "/api/admin/users",
		"/admin/users/toggle":           "/api/admin/users/toggle",
		"/admin/users/new":              "/api/admin/users",
		"/admin/login":                  "/api/admin/login",
		"/admin/models/move/":           "/api/admin/models/move/",
		"/admin/models/copy/":           "/api/admin/models/copy/",
		"/admin/models/delete/":         "/api/admin/models/delete/",
		"/admin/models/toggle-hidden/":  "/api/admin/models/toggle-hidden/",
		"/admin/models/edit/":           "/api/admin/models/edit/",
		"/admin/models/":                "/api/admin/models/",
		"/admin/model-groups/delete/":   "/api/admin/model-groups/delete/",
		"/admin/model-groups/edit/":     "/api/admin/model-groups/edit/",
		"/admin/api-keys/delete/":       "/api/admin/api-keys/delete/",
		"/admin/api-keys/edit/":         "/api/admin/api-keys/edit/",
		"/admin/users/delete/":          "/api/admin/users/delete/",
		"/admin/users/edit/":            "/api/admin/users/edit/",
	}
	for from, to := range exact {
		from, to := from, to
		mux.HandleFunc("POST "+from, func(w http.ResponseWriter, r *http.Request) {
			clone := r.Clone(r.Context())
			u := *r.URL
			u.Path = to + strings.TrimPrefix(r.URL.Path, from)
			clone.URL = &u
			mux.ServeHTTP(w, clone)
		})
	}
}
