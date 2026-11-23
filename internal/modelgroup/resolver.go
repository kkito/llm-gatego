package modelgroup

import (
	"fmt"
	"strings"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/limiter"
)

type TriedModel struct {
	Model    string `json:"model"`
	Exceeded bool   `json:"exceeded"`
	Message  string `json:"message,omitempty"`
}

type ModelGroupExhaustedError struct{ TriedModels []TriedModel }

func (e *ModelGroupExhaustedError) Error() string { return "All models in group exceeded their limits" }

type Resolver struct {
	Check func(*config.ProviderConfig) (limiter.LimitCheckResult, error)
}

func NewResolver() *Resolver { return &Resolver{} }

func (r *Resolver) ResolveModelGroup(groups []config.ModelGroup, name string, providers []config.ProviderConfig) ([]string, error) {
	var group *config.ModelGroup
	for i := range groups {
		if groups[i].Name == name {
			group = &groups[i]
			break
		}
	}
	if group == nil {
		return nil, fmt.Errorf("Model group %q not found", name)
	}
	out := make([]string, 0, len(group.Models))
	for _, mn := range group.Models {
		found := false
		for _, p := range providers {
			if p.CustomModel == mn {
				found = true
				break
			}
		}
		if !found {
			avail := []string{}
			for _, p := range providers {
				avail = append(avail, p.CustomModel)
			}
			return nil, fmt.Errorf("Model %q in group %q not found in provider configs. Available models: [%s]", mn, name, strings.Join(avail, ", "))
		}
		out = append(out, mn)
	}
	return out, nil
}

type AvailableModelResult struct {
	Model       string
	Provider    *config.ProviderConfig
	TriedModels []TriedModel
}

func (r *Resolver) FindAvailableModel(names []string, providers []config.ProviderConfig, logDir string) (AvailableModelResult, error) {
	tried := []TriedModel{}
	for _, name := range names {
		var provider *config.ProviderConfig
		for i := range providers {
			if providers[i].CustomModel == name {
				provider = &providers[i]
				break
			}
		}
		if provider == nil {
			tried = append(tried, TriedModel{name, false, "Model config not found"})
			continue
		}
		check := r.Check
		if check == nil {
			check = func(*config.ProviderConfig) (limiter.LimitCheckResult, error) { return limiter.LimitCheckResult{}, nil }
		}
		res, err := check(provider)
		if err != nil {
			tried = append(tried, TriedModel{name, false, err.Error()})
			continue
		}
		if res.Exceeded {
			tried = append(tried, TriedModel{name, true, res.Message})
			continue
		}
		return AvailableModelResult{name, provider, tried}, nil
	}
	return AvailableModelResult{}, &ModelGroupExhaustedError{tried}
}
