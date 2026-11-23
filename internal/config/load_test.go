package config

import (
	"os"
	"path/filepath"
	"testing"
)

func writeConfig(t *testing.T, data string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "config.json")
	if err := os.WriteFile(path, []byte(data), 0600); err != nil { t.Fatal(err) }
	return path
}

func TestLoadFullConfigValid(t *testing.T) {
	path := writeConfig(t, `{"models":[{"customModel":"gpt","realModel":"gpt-4o","apiKey":"sk-x","baseUrl":"https://api.openai.com","provider":"openai"}],"modelGroups":[{"name":"fast","models":["gpt"]}],"apiKeys":[]}`)
	cfg, err := LoadFullConfig(path)
	if err != nil { t.Fatalf("unexpected err: %v", err) }
	if len(cfg.Models) != 1 || cfg.Models[0].MaxContextLength != 200000 {
		t.Fatalf("default maxContextLength not applied: %+v", cfg.Models[0])
	}
}

func TestLoadFullConfigMissingField(t *testing.T) {
	path := writeConfig(t, `{"models":[{"customModel":"x"}]}`)
	if _, err := LoadFullConfig(path); err == nil { t.Fatal("expected missing field error") }
}

func TestLoadFullConfigLegacyArray(t *testing.T) {
	path := writeConfig(t, `[{"customModel":"m","realModel":"r","apiKey":"k","baseUrl":"u","provider":"openai"}]`)
	cfg, err := LoadFullConfig(path)
	if err != nil { t.Fatal(err) }
	if len(cfg.Models) != 1 { t.Fatalf("got %d", len(cfg.Models)) }
}

func TestLoadFullConfigInvalidLimits(t *testing.T) {
	path := writeConfig(t, `{"models":[{"customModel":"m","realModel":"r","apiKey":"k","baseUrl":"u","provider":"openai","limits":[{"type":"bad","period":"day","max":1}]}]}`)
	if _, err := LoadFullConfig(path); err == nil { t.Fatal("expected invalid limit type error") }
}

func TestLoadFullConfigInvalidModelGroup(t *testing.T) {
	path := writeConfig(t, `{"models":[],"modelGroups":[{"name":"g","models":["unknown"]}]}`)
	if _, err := LoadFullConfig(path); err == nil { t.Fatal("expected invalid model group error") }
}

func TestLoadFullConfigDefaultParamsMustBeObject(t *testing.T) {
	path := writeConfig(t, `{"models":[{"customModel":"m","realModel":"r","apiKey":"k","baseUrl":"u","provider":"openai","defaultParams":[]}]}`)
	if _, err := LoadFullConfig(path); err == nil { t.Fatal("expected defaultParams object error") }
}
