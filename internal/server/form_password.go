package server

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

// Original form POST for /admin/password: decode urlencoded into JSON API.
func registerFormPasswordAlias(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("POST /admin/password", func(w http.ResponseWriter, r *http.Request) {
		_ = r.ParseForm()
		in := map[string]any{
			"action": r.FormValue("action"), "currentPassword": r.FormValue("currentPassword"),
			"newPassword": r.FormValue("newPassword"), "confirmPassword": r.FormValue("confirmPassword"),
		}
		body, _ := json.Marshal(in)
		r.Body = io.NopCloser(bytes.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		passwordHandler(w, r, d)
	})
}
