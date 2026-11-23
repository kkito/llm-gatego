package config

import "fmt"

// RemoveModelFromConfig removes a model and cascades to model groups and user API keys.
func RemoveModelFromConfig(cfg *ProxyConfig, name string) (*ProxyConfig, error) {
	found := false
	for _, m := range cfg.Models {
		if m.CustomModel == name {
			found = true
			break
		}
	}
	if !found {
		return nil, fmt.Errorf("未找到模型：%s", name)
	}
	out := *cfg
	out.Models = make([]ProviderConfig, 0, len(cfg.Models))
	for _, m := range cfg.Models {
		if m.CustomModel != name {
			out.Models = append(out.Models, m)
		}
	}
	if cfg.ModelGroups != nil {
		out.ModelGroups = make([]ModelGroup, 0, len(cfg.ModelGroups))
		for _, g := range cfg.ModelGroups {
			ng := g
			ng.Models = nil
			for _, mn := range g.Models {
				if mn != name {
					ng.Models = append(ng.Models, mn)
				}
			}
			if len(ng.Models) > 0 {
				out.ModelGroups = append(out.ModelGroups, ng)
			}
		}
	}
	if cfg.UserApiKeys != nil {
		out.UserApiKeys = make([]UserApiKey, 0, len(cfg.UserApiKeys))
		for _, u := range cfg.UserApiKeys {
			nu := u
			changed := false
			filtered := make([]string, 0, len(u.AllowedModels))
			for _, mn := range u.AllowedModels {
				if mn == name {
					changed = true
					continue
				}
				filtered = append(filtered, mn)
			}
			if changed {
				if len(filtered) > 0 {
					nu.AllowedModels = filtered
				} else {
					nu.AllowedModels = nil
				}
			}
			out.UserApiKeys = append(out.UserApiKeys, nu)
		}
	}
	return &out, nil
}

func RenameModelInConfig(cfg *ProxyConfig, old, newName string) *ProxyConfig {
	if old == newName || len(cfg.ModelGroups) == 0 {
		return cfg
	}
	out := *cfg
	out.ModelGroups = make([]ModelGroup, 0, len(cfg.ModelGroups))
	for _, g := range cfg.ModelGroups {
		ng := g
		ng.Models = make([]string, len(g.Models))
		copy(ng.Models, g.Models)
		for i, mn := range ng.Models {
			if mn == old {
				ng.Models[i] = newName
			}
		}
		out.ModelGroups = append(out.ModelGroups, ng)
	}
	return &out
}

func RemoveModelGroupFromConfig(cfg *ProxyConfig, name string) (*ProxyConfig, error) {
	found := false
	for _, g := range cfg.ModelGroups {
		if g.Name == name {
			found = true
			break
		}
	}
	if !found {
		return nil, fmt.Errorf("未找到 Model Group：%s", name)
	}
	out := *cfg
	out.ModelGroups = make([]ModelGroup, 0, len(cfg.ModelGroups))
	for _, g := range cfg.ModelGroups {
		if g.Name != name {
			out.ModelGroups = append(out.ModelGroups, g)
		}
	}
	return &out, nil
}

func RenameAPIKeyRefInConfig(cfg *ProxyConfig, old, newName string) *ProxyConfig {
	if old == newName {
		return cfg
	}
	out := *cfg
	out.Models = make([]ProviderConfig, len(cfg.Models))
	copy(out.Models, cfg.Models)
	for i, m := range out.Models {
		if m.APIKey == "$$"+old+"$$" {
			out.Models[i].APIKey = "$$" + newName + "$$"
		}
	}
	return &out
}
