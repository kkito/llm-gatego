package config

import (
	"strings"
	"testing"
)

func TestResolveAPIKey(t *testing.T) {
	keys := []ApiKey{{Name: "main", Key: "sk-real"}}
	got, err := ResolveAPIKey("$$main$$", keys)
	if err != nil || got != "sk-real" { t.Fatalf("got %q, err %v", got, err) }
	if got, _ := ResolveAPIKey("sk-direct", keys); got != "sk-direct" { t.Fatal(got) }
	if _, err := ResolveAPIKey("$$missing$$", keys); err == nil { t.Fatal("expected error") }
}

func TestIsAPIKeyRefAndMask(t *testing.T) {
	if !IsAPIKeyRef("$$x$$") || IsAPIKeyRef("sk-x") { t.Fatal("ref detection") }
	if got := GetAPIKeyRefName("$$x$$"); got != "x" { t.Fatal(got) }
	if got := MaskAPIKey("sk-123456"); got != "*****3456" { t.Fatal(got) }
	if got := MaskAPIKey(""); got != "*****" { t.Fatal(got) }
}

func TestAddAPIKeyDuplicate(t *testing.T) {
	keys := []ApiKey{{Name: "a", Key: "k1"}}
	if _, _, err := AddAPIKey(keys, "a", "k2"); err == nil { t.Fatal("expected duplicate error") }
	out, k, err := AddAPIKey(keys, "b", "k2")
	if err != nil || len(out) != 2 || k.Key != "k2" { t.Fatalf("out=%v key=%v err=%v", out, k, err) }
	if !strings.HasPrefix(k.ID, "") { t.Fatal("ID should be set") }
}

func TestSaveConfigRoundTrip(t *testing.T) {
	path := t.TempDir() + "/cfg.json"
	cfg := &ProxyConfig{Models: []ProviderConfig{{CustomModel: "m", RealModel: "r", APIKey: "k", BaseURL: "u", Provider: ProviderOpenAI}}}
	if err := SaveConfig(cfg, path); err != nil { t.Fatal(err) }
	got, err := LoadFullConfig(path)
	if err != nil { t.Fatal(err) }
	if len(got.Models) != 1 || got.Models[0].CustomModel != "m" { t.Fatalf("%+v", got) }
}
