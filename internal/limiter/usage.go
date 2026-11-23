package limiter

import (
	"sync"
	"time"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/store"
	"github.com/kkito/llm-gatego/internal/util"
)

type Window struct {
	Date        string  `json:"date"`
	Requests    float64 `json:"requests"`
	InputTokens float64 `json:"inputTokens"`
	Cost        float64 `json:"cost"`
	Loaded      bool    `json:"loaded"`
}
type ModelUsageCounter struct {
	Model     string `json:"model"`
	Today     Window `json:"today"`
	ThisWeek  Window `json:"thisWeek"`
	ThisMonth Window `json:"thisMonth"`
	Sliding   map[string][]WindowEntry
}
type WindowEntry struct {
	Timestamp                   float64
	Requests, InputTokens, Cost float64
}

type UsageTracker struct {
	mu       sync.Mutex
	logDir   string
	counters map[string]*ModelUsageCounter
}

var (
	usageMu       sync.Mutex
	usageInstance *UsageTracker
)

func GetUsageTracker(logDir string) *UsageTracker {
	usageMu.Lock()
	defer usageMu.Unlock()
	if usageInstance == nil || usageInstance.logDir != logDir {
		usageInstance = &UsageTracker{logDir: logDir, counters: map[string]*ModelUsageCounter{}}
	}
	return usageInstance
}
func ResetUsageTrackerForTest() { usageMu.Lock(); usageInstance = nil; usageMu.Unlock() }

func (u *UsageTracker) GetCounter(model string) *ModelUsageCounter {
	u.mu.Lock()
	defer u.mu.Unlock()
	c := u.counters[model]
	if c == nil {
		c = &ModelUsageCounter{Model: model, Today: Window{Date: util.GetTodayDate()}, ThisWeek: Window{Date: util.GetWeekStart()}, ThisMonth: Window{Date: util.GetMonthStart()}, Sliding: map[string][]WindowEntry{}}
		u.counters[model] = c
	}
	return c
}

func periodDescription(period config.LimitPeriod, value int) string {
	switch period {
	case config.PeriodDay:
		return "daily"
	case config.PeriodWeek:
		return "weekly"
	case config.PeriodMonth:
		return "monthly"
	case config.PeriodHours:
		return "last " + itoa(value)
	}
	return "daily"
}
func itoa(n int) string {
	if n == 0 {
		return "24"
	}
	s := ""
	for n > 0 {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	return s
}
func capFirst(s string) string {
	if s == "" {
		return s
	}
	return string(s[0]-32) + s[1:]
}

func (u *UsageTracker) EnsureLoaded(c *ModelUsageCounter, period config.LimitPeriod, value int, pricing *Pricing) error {
	// SQLite-only: aggregate from requests table; in-memory counters take precedence if already loaded.
	var w *Window
	switch period {
	case config.PeriodDay:
		w = &c.Today
	case config.PeriodWeek:
		w = &c.ThisWeek
	case config.PeriodMonth:
		w = &c.ThisMonth
	default:
		return nil
	}
	if w.Loaded {
		return nil
	}
	dm := store.GetDatabaseManager(u.logDir)
	if err := dm.Initialize(); err != nil {
		return err
	}
	db := dm.GetDB()
	startT, err := time.ParseInLocation("2006-01-02", w.Date, time.Local)
	if err != nil {
		return err
	}
	start := startT.UTC().Format(time.RFC3339)
	end := time.Now().UTC().Format(time.RFC3339)
	var requests, input, output, cached float64
	if err := db.QueryRow(`SELECT COUNT(*), COALESCE(SUM(prompt_tokens),0), COALESCE(SUM(completion_tokens),0), COALESCE(SUM(cached_tokens),0) FROM requests WHERE custom_model=? AND status_code BETWEEN 200 AND 299 AND created_at>=? AND created_at<=?`, c.Model, start, end).Scan(&requests, &input, &output, &cached); err != nil {
		return err
	}
	w.Requests = requests
	w.InputTokens = input
	w.Loaded = true
	if pricing != nil {
		w.Cost = CalculateCost(TokenUsage{input, output, cached}, *pricing)
	}
	return nil
}

func (u *UsageTracker) GetCurrentUsage(c *ModelUsageCounter, limit config.ModelLimit) float64 {
	var w *Window
	switch limit.Period {
	case config.PeriodDay:
		w = &c.Today
	case config.PeriodWeek:
		w = &c.ThisWeek
	case config.PeriodMonth:
		w = &c.ThisMonth
	default:
		w = &c.Today
	}
	switch limit.Type {
	case config.LimitRequests:
		return w.Requests
	case config.LimitInputTokens:
		return w.InputTokens
	case config.LimitCost:
		return w.Cost
	}
	return 0
}

func (u *UsageTracker) RecordUsage(model string, entry store.RequestLogEntry, pricing *Pricing) {
	c := u.GetCounter(model)
	c.Today.Requests++
	c.ThisWeek.Requests++
	c.ThisMonth.Requests++
	c.Today.InputTokens += pt(entry.PromptTokens)
	c.ThisWeek.InputTokens += pt(entry.PromptTokens)
	c.ThisMonth.InputTokens += pt(entry.PromptTokens)
	if pricing != nil {
		cost := CalculateCost(TokenUsage{pt(entry.PromptTokens), pt(entry.CompletionTokens), pt(entry.CachedTokens)}, *pricing)
		c.Today.Cost += cost
		c.ThisWeek.Cost += cost
		c.ThisMonth.Cost += cost
	}
	c.Today.Loaded = true
	c.ThisWeek.Loaded = true
	c.ThisMonth.Loaded = true
}

func pt(p *int) float64 {
	if p == nil {
		return 0
	}
	return float64(*p)
}
