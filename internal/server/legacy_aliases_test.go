package server

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestFormBridgeRedirectsModelEditToModelList(t *testing.T) {
	api := http.NewServeMux()
	api.HandleFunc("POST /api/admin/models/edit/m1", func(w http.ResponseWriter, r *http.Request) {
		okJSON(w, map[string]any{"ok": true})
	})
	mux := http.NewServeMux()
	mux.Handle("/", api)
	RegisterLegacyFormAliases(mux)

	v := url.Values{"customModel": {"m1"}, "realModel": {"r1"}, "provider": {"openai"}, "baseUrl": {"http://u"}}
	req := httptest.NewRequest(http.MethodPost, "/admin/models/edit/m1", strings.NewReader(v.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Referer", "http://localhost:4000/admin/models/edit/m1")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), `content="0;url=/admin/models"`) {
		t.Fatal(w.Body.String())
	}
}

func TestFormBridgeModelTestReturnsJSON(t *testing.T) {
	api := http.NewServeMux()
	api.HandleFunc("POST /api/admin/models/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":true,"content":"ok"}`))
	})
	mux := http.NewServeMux()
	mux.Handle("/", api)
	RegisterLegacyFormAliases(mux)

	req := httptest.NewRequest(http.MethodPost, "/admin/models/test", strings.NewReader(`{"realModel":"r1"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if strings.Contains(w.Body.String(), "<!doctype") {
		t.Fatal(w.Body.String())
	}
	if !strings.Contains(w.Body.String(), `"success":true`) {
		t.Fatal(w.Body.String())
	}
}
