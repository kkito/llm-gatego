package config

import (
	"encoding/json"
	"fmt"
	"os"
)

const defaultMaxContextLength = 200000

var requiredFields = []string{"customModel", "realModel", "apiKey", "baseUrl", "provider"}

func validateProvider(m map[string]any, index int) error {
	for _, f := range requiredFields {
		v, ok := m[f]
		if !ok || v == nil || v == "" {
			return fmt.Errorf("missing required field: %s at index %d", f, index)
		}
	}
	return nil
}

func validateLimit(lm map[string]any, modelIdx, limitIdx int) error {
	validTypes := map[string]bool{"requests": true, "input_tokens": true, "cost": true}
	validPeriods := map[string]bool{"day": true, "hours": true, "week": true, "month": true}
	t, _ := lm["type"].(string)
	p, _ := lm["period"].(string)
	if !validTypes[t] {
		return fmt.Errorf("invalid limit type %q at model %d limit %d", t, modelIdx, limitIdx)
	}
	if !validPeriods[p] {
		return fmt.Errorf("invalid limit period %q at model %d limit %d", p, modelIdx, limitIdx)
	}
	if p == "hours" {
		if _, ok := lm["periodValue"].(float64); !ok {
			return fmt.Errorf("missing periodValue for hours period at model %d limit %d", modelIdx, limitIdx)
		}
	}
	if _, ok := lm["max"].(float64); !ok {
		return fmt.Errorf("missing or invalid max at model %d limit %d", modelIdx, limitIdx)
	}
	return nil
}

func validateAndNormalize(raw []map[string]any) ([]ProviderConfig, error) {
	for i, m := range raw {
		if err := validateProvider(m, i); err != nil {
			return nil, err
		}
		if limits, ok := m["limits"]; ok {
			arr, ok := limits.([]any)
			if !ok {
				return nil, fmt.Errorf("limits must be an array at model %d", i)
			}
			for j, l := range arr {
				lm, ok := l.(map[string]any)
				if !ok {
					return nil, fmt.Errorf("invalid limit at model %d index %d", i, j)
				}
				if err := validateLimit(lm, i, j); err != nil {
					return nil, err
				}
			}
		}
		if dp, ok := m["defaultParams"]; ok && dp != nil {
			if _, ok := dp.(map[string]any); !ok {
				return nil, fmt.Errorf("defaultParams must be an object at model %d", i)
			}
		}
		if p, ok := m["proxy"]; ok && p != nil {
			if _, ok := p.(string); !ok {
				return nil, fmt.Errorf("proxy must be a string at model %d", i)
			}
		}
		if m["maxContextLength"] == nil {
			m["maxContextLength"] = float64(defaultMaxContextLength)
		}
	}
	b, err := json.Marshal(raw)
	if err != nil {
		return nil, err
	}
	var out []ProviderConfig
	if err := json.Unmarshal(b, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func toRawModels(v any) ([]map[string]any, error) {
	var arr []any
	switch t := v.(type) {
	case []any:
		arr = t
	case map[string]any:
		a, ok := t["models"].([]any)
		if !ok {
			return nil, fmt.Errorf("config must have a \"models\" array")
		}
		arr = a
	default:
		return nil, fmt.Errorf("config must be an array or an object with \"models\" array")
	}
	out := make([]map[string]any, 0, len(arr))
	for _, item := range arr {
		m, ok := item.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("model entry must be object")
		}
		out = append(out, m)
	}
	return out, nil
}

func validateModelGroups(cfg *ProxyConfig) error {
	names := map[string]bool{}
	for _, m := range cfg.Models {
		names[m.CustomModel] = true
	}
	groupNames := map[string]bool{}
	for i, g := range cfg.ModelGroups {
		if g.Name == "" {
			return fmt.Errorf("model group at index %d must have a name", i)
		}
		if groupNames[g.Name] {
			return fmt.Errorf("duplicate model group name: %q", g.Name)
		}
		groupNames[g.Name] = true
		if g.Models == nil {
			cfg.ModelGroups[i].Models = []string{}
		}
		for _, mn := range g.Models {
			if !names[mn] {
				return fmt.Errorf("model %q in group %q not found", mn, g.Name)
			}
		}
	}
	return nil
}

// DefaultConfig returns a fresh empty configuration with non-nil collections.
func DefaultConfig() *ProxyConfig {
	return &ProxyConfig{
		Models:      []ProviderConfig{},
		ApiKeys:     []ApiKey{},
		UserApiKeys: []UserApiKey{},
		UiSettings:  &UiSettings{},
	}
}

// LoadFullConfig loads and validates the complete config file (object or legacy array).
func LoadFullConfig(path string) (*ProxyConfig, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		if !os.IsNotExist(err) {
			return nil, fmt.Errorf("config file not found: %s", path)
		}
		// First run: create an empty config so the admin UI and APIs can boot.
		cfg := DefaultConfig()
		if saveErr := SaveConfig(cfg, path); saveErr != nil {
			return nil, fmt.Errorf("failed to create default config: %w", saveErr)
		}
		return cfg, nil
	}
	var v any
	if err := json.Unmarshal(b, &v); err != nil {
		return nil, fmt.Errorf("invalid JSON: %w", err)
	}
	rawModels, err := toRawModels(v)
	if err != nil {
		return nil, err
	}
	models, err := validateAndNormalize(rawModels)
	if err != nil {
		return nil, err
	}
	cfg := &ProxyConfig{Models: models, ApiKeys: []ApiKey{}}
	if obj, ok := v.(map[string]any); ok {
		objB, _ := json.Marshal(obj)
		if err := json.Unmarshal(objB, cfg); err != nil {
			return nil, err
		}
		cfg.Models = models
		if err := validateModelGroups(cfg); err != nil {
			return nil, err
		}
	}
	return cfg, nil
}

// LoadConfig returns only the models array (backwards-compatible with src/config.ts loadConfig).
func LoadConfig(path string) ([]ProviderConfig, error) {
	cfg, err := LoadFullConfig(path)
	if err != nil {
		return nil, err
	}
	return cfg.Models, nil
}

// FindProvider finds a provider config by custom model name.
func FindProvider(models []ProviderConfig, model string) *ProviderConfig {
	for i := range models {
		if models[i].CustomModel == model {
			return &models[i]
		}
	}
	return nil
}
