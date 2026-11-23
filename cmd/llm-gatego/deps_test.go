package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/kkito/llm-gatego/internal/config"
)

func TestProxyDepsReloadsConfigAfterAdminWrite(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{}}
	b, _ := json.Marshal(cfg)
	if err := os.WriteFile(path, b, 0600); err != nil {
		t.Fatal(err)
	}
	ctx := config.ConfigContext{ConfigDir: dir, ConfigPath: path}
	deps := proxyDeps(cfg, ctx, 1000)
	updated := &config.ProxyConfig{Models: []config.ProviderConfig{{CustomModel: "m1"}}}
	b, _ = json.Marshal(updated)
	if err := os.WriteFile(path, b, 0600); err != nil {
		t.Fatal(err)
	}
	got := deps.ConfigGetter()
	if len(got.Models) != 1 || got.Models[0].CustomModel != "m1" {
		t.Fatalf("stale config: %+v", got)
	}
}
