package config

import "testing"

func TestRemoveModelCascades(t *testing.T) {
	cfg := &ProxyConfig{
		Models:      []ProviderConfig{{CustomModel: "a"}, {CustomModel: "b"}},
		ModelGroups: []ModelGroup{{Name: "g", Models: []string{"a", "b"}}, {Name: "only", Models: []string{"a"}}},
		UserApiKeys: []UserApiKey{{Name: "u", AllowedModels: []string{"a"}}},
	}
	out, err := RemoveModelFromConfig(cfg, "a")
	if err != nil { t.Fatal(err) }
	if len(out.Models) != 1 || out.Models[0].CustomModel != "b" { t.Fatalf("models: %+v", out.Models) }
	if len(out.ModelGroups) != 1 || out.ModelGroups[0].Name != "g" { t.Fatalf("groups: %+v", out.ModelGroups) }
	if out.UserApiKeys[0].AllowedModels != nil { t.Fatalf("allowedModels should be nil: %+v", out.UserApiKeys[0]) }
	if len(cfg.Models) != 2 { t.Fatal("input mutated") }
	if _, err := RemoveModelFromConfig(cfg, "missing"); err == nil { t.Fatal("expected error") }
}

func TestRenameModelUpdatesGroups(t *testing.T) {
	cfg := &ProxyConfig{ModelGroups: []ModelGroup{{Name: "g", Models: []string{"a", "b"}}}}
	out := RenameModelInConfig(cfg, "a", "z")
	if out.ModelGroups[0].Models[0] != "z" { t.Fatalf("got %+v", out.ModelGroups[0]) }
	if cfg.ModelGroups[0].Models[0] != "a" { t.Fatal("input mutated") }
}

func TestRemoveGroupAndRenameRef(t *testing.T) {
	cfg := &ProxyConfig{
		ModelGroups: []ModelGroup{{Name: "g", Models: []string{"a"}}},
		Models:      []ProviderConfig{{CustomModel: "m", APIKey: "$$old$$"}},
	}
	out, err := RemoveModelGroupFromConfig(cfg, "g")
	if err != nil || len(out.ModelGroups) != 0 { t.Fatalf("%+v err=%v", out, err) }
	if _, err := RemoveModelGroupFromConfig(cfg, "missing"); err == nil { t.Fatal("expected error") }
	out2 := RenameAPIKeyRefInConfig(cfg, "old", "new")
	if out2.Models[0].APIKey != "$$new$$" { t.Fatalf("%+v", out2.Models[0]) }
	if cfg.Models[0].APIKey != "$$old$$" { t.Fatal("input mutated") }
}

func TestCreateConfigContext(t *testing.T) {
	ctx := CreateConfigContext("/tmp/cfg")
	if ctx.ConfigPath != "/tmp/cfg/config.json" { t.Fatal(ctx.ConfigPath) }
	if ctx.LogDir != "/tmp/cfg/logs/proxy" { t.Fatal(ctx.LogDir) }
	if ctx.PIDFile != "/tmp/cfg/llm-gateway.pid" { t.Fatal(ctx.PIDFile) }
}
