package server

import (
	"io"
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

func TestGroupEditPageGETDoesNotLoop(t *testing.T) {
	api := http.NewServeMux()
	api.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("PAGE"))
	})
	api.HandleFunc("POST /api/admin/model-groups/edit/g1", func(w http.ResponseWriter, r *http.Request) {
		okJSON(w, map[string]any{"ok": true})
	})
	mux := http.NewServeMux()
	mux.Handle("/", api)
	RegisterLegacyFormAliases(mux)

	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/admin/model-groups/edit/g1", nil))
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	if w.Body.String() != "PAGE" {
		t.Fatalf("body=%s", w.Body.String())
	}
}

func TestGroupActionGETStillBridgesToAPI(t *testing.T) {
	var gotPath string
	var gotBody string
	api := http.NewServeMux()
	api.HandleFunc("POST /api/admin/model-groups/edit/g1/add-model", func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		b, _ := io.ReadAll(r.Body)
		gotBody = string(b)
		okJSON(w, map[string]any{"ok": true})
	})
	mux := http.NewServeMux()
	mux.Handle("/", api)
	RegisterLegacyFormAliases(mux)

	w := httptest.NewRecorder()
	mux.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/admin/model-groups/edit/g1/add-model?model=m2", nil))
	if w.Code != http.StatusSeeOther {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	if got := w.Header().Get("Location"); got != "/admin/model-groups/edit/g1" {
		t.Fatalf("location=%q", got)
	}
	if gotPath != "/api/admin/model-groups/edit/g1/add-model" {
		t.Fatalf("path=%q", gotPath)
	}
	if !strings.Contains(gotBody, `"model":"m2"`) {
		t.Fatalf("body=%s", gotBody)
	}
}
