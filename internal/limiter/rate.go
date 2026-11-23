package limiter

import (
	"fmt"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/store"
)

type LimitCheckResult struct {
	Exceeded bool
	Limit    *config.ModelLimit
	Current  float64
	Message  string
}

type RateLimiter struct{ LogDir string }

func NewRateLimiter(logDir string) *RateLimiter { return &RateLimiter{logDir} }
func (r *RateLimiter) Tracker() *UsageTracker   { return GetUsageTracker(r.LogDir) }

func (r *RateLimiter) CheckLimits(cfg *config.ProviderConfig) (LimitCheckResult, error) {
	if len(cfg.Limits) == 0 {
		return LimitCheckResult{}, nil
	}
	var pricing *Pricing
	if cfg.InputPricePer1M != nil && cfg.OutputPricePer1M != nil && cfg.CachedPricePer1M != nil {
		pricing = &Pricing{*cfg.InputPricePer1M, *cfg.OutputPricePer1M, *cfg.CachedPricePer1M}
	}
	tracker := r.Tracker()
	counter := tracker.GetCounter(cfg.CustomModel)
	for i := range cfg.Limits {
		limit := &cfg.Limits[i]
		if limit.Type == config.LimitCost && !HasValidPricing(pricing) {
			return LimitCheckResult{}, fmt.Errorf("Cost limit requires pricing configuration for model '%s'", cfg.CustomModel)
		}
		if err := tracker.EnsureLoaded(counter, limit.Period, derefInt(limit.PeriodValue), pricing); err != nil {
			return LimitCheckResult{}, err
		}
		current := tracker.GetCurrentUsage(counter, *limit)
		if current >= limit.Max {
			return LimitCheckResult{Exceeded: true, Limit: limit, Current: current, Message: formatLimitMessage(cfg.CustomModel, *limit)}, nil
		}
	}
	return LimitCheckResult{}, nil
}
func limitTypeDescription(l config.ModelLimit) string {
	switch l.Type {
	case config.LimitRequests:
		return "request count"
	case config.LimitInputTokens:
		return "input token"
	case config.LimitCost:
		return "cost ($"
	}
	return string(l.Type)
}

func (r *RateLimiter) CreateErrorResponse(message string) map[string]any {
	return map[string]any{"error": map[string]any{"message": message, "type": "rate_limit_error", "param": nil, "code": "rate_limit_exceeded"}}
}
func (r *RateLimiter) RecordUsage(model string, entry store.RequestLogEntry, pricing *Pricing) {
	r.Tracker().RecordUsage(model, entry, pricing)
}

func formatLimitMessage(model string, l config.ModelLimit) string {
	period := capFirst(periodDescription(l.Period, derefInt(l.PeriodValue)))
	switch l.Type {
	case config.LimitRequests:
		return fmt.Sprintf("Rate limit exceeded for model '%s': %s request count limit (%g) reached", model, period, l.Max)
	case config.LimitInputTokens:
		return fmt.Sprintf("Rate limit exceeded for model '%s': %s input token limit (%g) reached", model, period, l.Max)
	case config.LimitCost:
		return fmt.Sprintf("Rate limit exceeded for model '%s': %s cost limit ($%g) reached", model, period, l.Max)
	}
	return ""
}
