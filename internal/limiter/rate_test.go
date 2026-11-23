package limiter

import (
	"strings"
	"testing"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/store"
)

func testConfig(limits []config.ModelLimit, price bool) *config.ProviderConfig {
	c := &config.ProviderConfig{CustomModel: "test-model", Limits: limits}
	if price {
		a, b, d := 10.0, 30.0, 0.0
		c.InputPricePer1M = &a
		c.OutputPricePer1M = &b
		c.CachedPricePer1M = &d
	}
	return c
}
func countLimit(n float64) config.ModelLimit {
	return config.ModelLimit{Type: config.LimitRequests, Period: config.PeriodDay, Max: n}
}
func tokenLimit(n float64) config.ModelLimit {
	return config.ModelLimit{Type: config.LimitInputTokens, Period: config.PeriodDay, Max: n}
}
func costLimit(n float64) config.ModelLimit {
	return config.ModelLimit{Type: config.LimitCost, Period: config.PeriodMonth, Max: n}
}

// Mirrors tests/lib/rate-limiter.test.ts (13 cases).
func TestRateLimiter(t *testing.T) {
	t.Run("no limits", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		res, err := r.CheckLimits(testConfig(nil, false))
		if err != nil || res.Exceeded {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("empty limits", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{}, false))
		if err != nil || res.Exceeded {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("requests under limit", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.Today.Requests = 50
		c.Today.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{countLimit(100)}, false))
		if err != nil || res.Exceeded {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("requests at limit", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.Today.Requests = 100
		c.Today.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{countLimit(100)}, false))
		if err != nil || !res.Exceeded || !strings.Contains(res.Message, "Daily request count limit (100) reached") {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("input tokens under limit", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.Today.InputTokens = 10000
		c.Today.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{tokenLimit(50000)}, false))
		if err != nil || res.Exceeded {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("input tokens at limit", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.Today.InputTokens = 50000
		c.Today.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{tokenLimit(50000)}, false))
		if err != nil || !res.Exceeded || !strings.Contains(res.Message, "Daily input token limit (50000) reached") {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("cost under limit", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.ThisMonth.Cost = 100
		c.ThisMonth.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{costLimit(500)}, true))
		if err != nil || res.Exceeded {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("cost at limit", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.ThisMonth.Cost = 500
		c.ThisMonth.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{costLimit(500)}, true))
		if err != nil || !res.Exceeded || !strings.Contains(res.Message, "Monthly cost limit") {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("cost without pricing errors", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		_, err := r.CheckLimits(testConfig([]config.ModelLimit{costLimit(500)}, false))
		if err == nil || !strings.Contains(err.Error(), "Cost limit requires pricing configuration") {
			t.Fatalf("err %v", err)
		}
	})
	t.Run("multiple limits first exceeded", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.Today.Requests = 100
		c.Today.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{countLimit(100), tokenLimit(50000), costLimit(500)}, true))
		if err != nil || !res.Exceeded || res.Limit.Type != config.LimitRequests {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("checks in order", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		c := r.Tracker().GetCounter("test-model")
		c.Today.Requests = 50
		c.Today.InputTokens = 50000
		c.Today.Loaded = true
		res, err := r.CheckLimits(testConfig([]config.ModelLimit{countLimit(100), tokenLimit(50000)}, false))
		if err != nil || !res.Exceeded || res.Limit.Type != config.LimitInputTokens {
			t.Fatalf("%+v %v", res, err)
		}
	})
	t.Run("error response", func(t *testing.T) {
		r := NewRateLimiter(t.TempDir())
		e := asMapGeneral(r.CreateErrorResponse("Rate limit exceeded")["error"])
		if e["type"] != "rate_limit_error" || e["code"] != "rate_limit_exceeded" || e["param"] != nil {
			t.Fatalf("%+v", e)
		}
	})
	t.Run("record usage", func(t *testing.T) {
		ResetUsageTrackerForTest()
		r := NewRateLimiter(t.TempDir())
		p := &Pricing{10, 30, 0}
		prompt := 1000
		r.RecordUsage("test-model", store.RequestLogEntry{PromptTokens: &prompt}, p)
		c := r.Tracker().GetCounter("test-model")
		if c.Today.Requests != 1 || c.Today.InputTokens != 1000 {
			t.Fatalf("%+v", c.Today)
		}
	})
}

func asMapGeneral(v any) map[string]any { m, _ := v.(map[string]any); return m }
