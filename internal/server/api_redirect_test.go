package server

import (
	"encoding/json"
	"net/http/httptest"
	"testing"
)

func TestOKJSONRedirectIncludesRedirectField(t *testing.T) {
	w := httptest.NewRecorder()
	okJSONRedirect(w, map[string]any{"ok": true}, "/admin/models")
	var env Envelope[map[string]any]
	if err := json.Unmarshal(w.Body.Bytes(), &env); err != nil {
		t.Fatal(err)
	}
	if !env.OK || env.Redirect != "/admin/models" {
		t.Fatalf("unexpected envelope: %+v", env)
	}
}

func TestOKJSONOmitsRedirectField(t *testing.T) {
	w := httptest.NewRecorder()
	okJSON(w, map[string]any{"ok": true})
	var raw map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &raw); err != nil {
		t.Fatal(err)
	}
	if _, exists := raw["redirect"]; exists {
		t.Fatalf("redirect should be omitted: %s", w.Body.String())
	}
}
