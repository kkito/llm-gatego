package modelgroup

import (
	"github.com/kkito/llm-gatego/internal/config"
	"testing"
)

func TestResolveModelGroup(t *testing.T) {
	groups := []config.ModelGroup{{Name: "g", Models: []string{"a", "b"}}}
	providers := []config.ProviderConfig{{CustomModel: "a"}, {CustomModel: "b"}}
	r := NewResolver()
	got, err := r.ResolveModelGroup(groups, "g", providers)
	if err != nil || len(got) != 2 {
		t.Fatalf("got %v err %v", got, err)
	}
	if _, err := r.ResolveModelGroup(groups, "missing", providers); err == nil {
		t.Fatal("expected not found")
	}
	if _, err := r.ResolveModelGroup([]config.ModelGroup{{Name: "x", Models: []string{"z"}}}, "x", providers); err == nil {
		t.Fatal("expected missing model error")
	}
}

func TestFindAvailableModel(t *testing.T) {
	r := NewResolver()
	providers := []config.ProviderConfig{{CustomModel: "a"}, {CustomModel: "b"}}
	res, err := r.FindAvailableModel([]string{"a", "b"}, providers, "/tmp")
	if err != nil || res.Model != "a" {
		t.Fatalf("%+v %v", res, err)
	}
	_, err = r.FindAvailableModel([]string{"missing"}, providers, "/tmp")
	if _, ok := err.(*ModelGroupExhaustedError); !ok {
		t.Fatalf("wrong error type %T", err)
	}
}
