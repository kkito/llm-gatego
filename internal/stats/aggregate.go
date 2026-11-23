package stats

import (
	"github.com/kkito/llm-gatego/internal/store"
	"sort"
	"strings"
	"time"
)

type ModelStat struct {
	Model       string  `json:"model"`
	Requests    int     `json:"requests"`
	Tokens      int     `json:"tokens"`
	Errors      int     `json:"errors"`
	AvgDuration float64 `json:"avgDuration"`
}
type UserStat struct {
	User     string  `json:"user"`
	Requests int     `json:"requests"`
	Tokens   int     `json:"tokens"`
	Cost     float64 `json:"cost"`
}
type DailyStat struct {
	Date     string  `json:"date"`
	Requests int     `json:"requests"`
	Tokens   int     `json:"tokens"`
	Cost     float64 `json:"cost"`
}
type Summary struct {
	TotalRequests    int     `json:"totalRequests"`
	TotalTokens      int     `json:"totalTokens"`
	PromptTokens     int     `json:"promptTokens"`
	CompletionTokens int     `json:"completionTokens"`
	CachedTokens     int     `json:"cachedTokens"`
	Errors           int     `json:"errors"`
	AvgTTFT          float64 `json:"avgTtft"`
	AvgTPS           float64 `json:"avgTps"`
	AvgDuration      float64 `json:"avgDuration"`
	Cost             float64 `json:"cost"`
}
type StatsSummary struct {
	Summary Summary     `json:"summary"`
	ByModel []ModelStat `json:"byModel"`
	ByUser  []UserStat  `json:"byUser"`
	ByDate  []DailyStat `json:"byDate"`
}

func num(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}
func flt(p *float64) float64 {
	if p == nil {
		return 0
	}
	return *p
}
func dateOf(row store.RequestLogEntry) string {
	t, err := time.Parse(time.RFC3339, row.Timestamp)
	if err == nil {
		return t.Format("2006-01-02")
	}
	if len(row.Timestamp) >= 10 {
		return row.Timestamp[:10]
	}
	return ""
}
func price(row store.RequestLogEntry, cfgPricing map[string][2]float64) float64 {
	entry, ok := cfgPricing[row.RealModel]
	p, c := entry[0], entry[1]
	if !ok {
		entry = cfgPricing[row.CustomModel]
		p, c = entry[0], entry[1]
	}
	if !ok {
		return 0
	}
	return float64(num(row.PromptTokens))/1e6*p + float64(num(row.CompletionTokens))/1e6*c
}
func Aggregate(rows []store.RequestLogEntry, pricing map[string][2]float64) StatsSummary {
	var s StatsSummary
	models := map[string]*ModelStat{}
	users := map[string]*UserStat{}
	dates := map[string]*DailyStat{}
	var ttftSum, ttftN, tpsSum, tpsN, dur float64
	for _, r := range rows {
		s.Summary.TotalRequests++
		s.Summary.PromptTokens += num(r.PromptTokens)
		s.Summary.CompletionTokens += num(r.CompletionTokens)
		s.Summary.TotalTokens += num(r.TotalTokens)
		s.Summary.CachedTokens += num(r.CachedTokens)
		cost := price(r, pricing)
		s.Summary.Cost += cost
		dur += float64(r.DurationMs)
		if r.TTFTMs != nil {
			ttftSum += float64(*r.TTFTMs)
			ttftN++
		}
		if r.TPS != nil {
			tpsSum += *r.TPS
			tpsN++
		}
		err := r.StatusCode >= 400 || r.ErrorMessage != "" || r.ErrorType != ""
		if err {
			s.Summary.Errors++
		}
		m := models[r.CustomModel]
		if m == nil {
			m = &ModelStat{Model: r.CustomModel}
			models[r.CustomModel] = m
		}
		m.Requests++
		m.Tokens += num(r.TotalTokens)
		if err {
			m.Errors++
		}
		u := users[r.UserName]
		if u == nil {
			u = &UserStat{User: r.UserName}
			users[r.UserName] = u
		}
		u.Requests++
		u.Tokens += num(r.TotalTokens)
		u.Cost += cost
		d := dateOf(r)
		ds := dates[d]
		if ds == nil {
			ds = &DailyStat{Date: d}
			dates[d] = ds
		}
		ds.Requests++
		ds.Tokens += num(r.TotalTokens)
		ds.Cost += cost
	}
	if ttftN > 0 {
		s.Summary.AvgTTFT = ttftSum / ttftN
	}
	if tpsN > 0 {
		s.Summary.AvgTPS = tpsSum / tpsN
	}
	if len(rows) > 0 {
		s.Summary.AvgDuration = dur / float64(len(rows))
	}
	for _, v := range models {
		if len(rows) > 0 {
			v.AvgDuration = dur / float64(len(rows))
		}
		s.ByModel = append(s.ByModel, *v)
	}
	for _, v := range users {
		s.ByUser = append(s.ByUser, *v)
	}
	for _, v := range dates {
		s.ByDate = append(s.ByDate, *v)
	}
	sort.Slice(s.ByModel, func(i, j int) bool { return s.ByModel[i].Model < s.ByModel[j].Model })
	sort.Slice(s.ByUser, func(i, j int) bool { return strings.Compare(s.ByUser[i].User, s.ByUser[j].User) < 0 })
	sort.Slice(s.ByDate, func(i, j int) bool { return s.ByDate[i].Date < s.ByDate[j].Date })
	return s
}
