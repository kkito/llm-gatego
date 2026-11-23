package server

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/limiter"
	"github.com/kkito/llm-gatego/internal/store"
	"github.com/kkito/llm-gatego/internal/util"
)

// RegisterExtraAdminAPIs completes the original llm-gateway admin API surface.
func RegisterExtraAdminAPIs(mux *http.ServeMux, d APIDeps) {
	registerStatsAPI(mux, d)
	registerUsageAPI(mux)
	registerLimitsAPI(mux, d)
	registerMiscAdminAPI(mux, d)
	registerUsersExtraAPI(mux, d)
	registerGroupsExtraAPI(mux, d)
	registerKeysExtraAPI(mux, d)
	registerUserPagesAPI(mux, d)
}

type statsOverview struct {
	TotalRequests      int     `json:"totalRequests"`
	SuccessfulRequests int     `json:"successfulRequests"`
	FailedRequests     int     `json:"failedRequests"`
	AvgDuration        float64 `json:"avgDuration"`
	TotalInputTokens   int64   `json:"totalInputTokens"`
	TotalOutputTokens  int64   `json:"totalOutputTokens"`
	TotalTokens        int64   `json:"totalTokens"`
	TotalCachedTokens  int64   `json:"totalCachedTokens"`
}

func localDayRangeTZ(date, tz string) (string, string, error) {
	loc := time.UTC
	if tz != "" {
		if l, err := time.LoadLocation(tz); err == nil {
			loc = l
		}
	}
	t, err := time.ParseInLocation("2006-01-02", date, loc)
	if err != nil {
		return "", "", err
	}
	return t.UTC().Format(time.RFC3339Nano), t.Add(24 * time.Hour).UTC().Format(time.RFC3339Nano), nil
}

func registerStatsAPI(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("GET /api/admin/stats", func(w http.ResponseWriter, r *http.Request) {
		dm := store.GetDatabaseManager(d.ConfigDir)
		if err := dm.Initialize(); err != nil {
			fail(w, 500, err.Error())
			return
		}
		q := r.URL.Query()
		tz := q.Get("timezone")
		if tz == "" {
			tz = "UTC"
		}
		startDate := q.Get("startDate")
		if startDate == "" {
			startDate = util.GetTodayDate()
		}
		endDate := q.Get("endDate")
		if endDate == "" {
			endDate = startDate
		}
		from, _, err := localDayRangeTZ(startDate, tz)
		if err != nil {
			fail(w, 400, err.Error())
			return
		}
		_, to, err := localDayRangeTZ(endDate, tz)
		if err != nil {
			fail(w, 400, err.Error())
			return
		}
		rows, err := dm.QueryRows(from, to, 0)
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		userFilter, modelFilter := q.Get("userName"), q.Get("model")
		ov := statsOverview{}
		byModel := map[string]any{}
		byProvider := map[string]int{}
		byHour := map[string]int{}
		byDate := map[string]int{}
		users := map[string]any{}
		type agg struct{ requests, successful, failed, in, out, total, cached int64 }
		ma := map[string]*agg{}
		ua := map[string]*agg{}
		for _, row := range rows {
			if userFilter != "" && row.UserName != userFilter {
				continue
			}
			if modelFilter != "" && row.CustomModel != modelFilter && row.ModelGroup != modelFilter {
				continue
			}
			ov.TotalRequests++
			status := row.StatusCode
			if status >= 200 && status < 300 {
				ov.SuccessfulRequests++
			}
			if status >= 400 {
				ov.FailedRequests++
			}
			ov.AvgDuration += float64(row.DurationMs)
			in, out, total, cached := ptrInt(row.PromptTokens), ptrInt(row.CompletionTokens), ptrInt(row.TotalTokens), ptrInt(row.CachedTokens)
			ov.TotalInputTokens += int64(in)
			ov.TotalOutputTokens += int64(out)
			ov.TotalTokens += int64(total)
			ov.TotalCachedTokens += int64(cached)
			key := row.CustomModel
			if ma[key] == nil {
				ma[key] = &agg{}
			}
			a := ma[key]
			a.requests++
			if status >= 200 && status < 300 {
				a.successful++
			}
			if status >= 400 {
				a.failed++
			}
			a.in += int64(in)
			a.out += int64(out)
			a.total += int64(total)
			a.cached += int64(cached)
			byProvider[row.Provider]++
			t, err := time.Parse(time.RFC3339, row.Timestamp)
			if err == nil {
				loc, _ := time.LoadLocation(tz)
				lt := t.In(loc)
				byHour[strconv.Itoa(lt.Hour())]++
				byDate[lt.Format("2006-01-02")]++
			}
			if row.UserName != "" {
				if ua[row.UserName] == nil {
					ua[row.UserName] = &agg{}
				}
				ua[row.UserName].requests++
			}
		}
		if ov.TotalRequests > 0 {
			ov.AvgDuration /= float64(ov.TotalRequests)
		}
		for k, a := range ma {
			byModel[k] = map[string]any{"requests": a.requests, "successful": a.successful, "failed": a.failed, "inputTokens": a.in, "outputTokens": a.out, "totalTokens": a.total, "cachedTokens": a.cached}
		}
		for k, a := range ua {
			users[k] = map[string]any{"requests": a.requests}
		}
		payload := map[string]any{
			"success": true,
			"data": map[string]any{"overview": ov, "byModel": byModel, "byProvider": byProvider, "byHour": byHour, "byDate": byDate, "byUser": users,
				"totalRequests": ov.TotalRequests, "successfulRequests": ov.SuccessfulRequests, "failedRequests": ov.FailedRequests,
				"totalInputTokens": ov.TotalInputTokens, "totalOutputTokens": ov.TotalOutputTokens, "totalTokens": ov.TotalTokens, "totalCachedTokens": ov.TotalCachedTokens},
			"dateRange": startDate + " ~ " + endDate,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(payload)
	})
}

func ptrInt(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}

func registerUsageAPI(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/admin/usage", func(w http.ResponseWriter, r *http.Request) {
		model := r.URL.Query().Get("model")
		if model == "" {
			fail(w, 400, "model parameter required")
			return
		}
		tracker := limiter.GetUsageTracker("")
		c := tracker.GetCounter(model)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"success": true, "data": map[string]any{"model": model, "requests": c.Today.Requests, "inputTokens": c.Today.InputTokens, "cost": c.Today.Cost, "date": c.Today.Date}})
	})
}

func registerLimitsAPI(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("GET /api/admin/models/{model}/limits", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		model := r.PathValue("model")
		for _, m := range cfg.Models {
			if m.CustomModel == model {
				okJSON(w, m.Limits)
				return
			}
		}
		fail(w, 404, "model not found")
	})
	mux.HandleFunc("POST /api/admin/models/{model}/limits/add", func(w http.ResponseWriter, r *http.Request) {
		var l config.ModelLimit
		if !readJSON(w, r, &l) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		model := r.PathValue("model")
		for i := range cfg.Models {
			if cfg.Models[i].CustomModel == model {
				cfg.Models[i].Limits = append(cfg.Models[i].Limits, l)
				if err := d.save(cfg); err != nil {
					fail(w, 500, err.Error())
					return
				}
				okJSON(w, cfg.Models[i].Limits)
				return
			}
		}
		fail(w, 404, "model not found")
	})
	mux.HandleFunc("POST /api/admin/models/{model}/limits/delete/{index}", func(w http.ResponseWriter, r *http.Request) {
		idx, err := strconv.Atoi(r.PathValue("index"))
		if err != nil {
			fail(w, 400, "invalid index")
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		model := r.PathValue("model")
		for i := range cfg.Models {
			if cfg.Models[i].CustomModel == model {
				limits := cfg.Models[i].Limits
				if idx < 0 || idx >= len(limits) {
					fail(w, 400, "invalid index")
					return
				}
				cfg.Models[i].Limits = append(limits[:idx], limits[idx+1:]...)
				if err := d.save(cfg); err != nil {
					fail(w, 500, err.Error())
					return
				}
				okJSON(w, cfg.Models[i].Limits)
				return
			}
		}
		fail(w, 404, "model not found")
	})
}

func registerMiscAdminAPI(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("GET /api/admin/announcement", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		if cfg.UiSettings == nil {
			cfg.UiSettings = &config.UiSettings{}
		}
		okJSON(w, map[string]any{"content": cfg.UiSettings.AnnouncementMarkdown})
	})
	mux.HandleFunc("POST /api/admin/announcement", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Content string `json:"content"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		if cfg.UiSettings == nil {
			cfg.UiSettings = &config.UiSettings{}
		}
		cfg.UiSettings.AnnouncementMarkdown = in.Content
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		if cfg.UiSettings == nil {
			cfg.UiSettings = &config.UiSettings{}
		}
		okJSON(w, map[string]any{"content": cfg.UiSettings.AnnouncementMarkdown})
	})
	mux.HandleFunc("POST /api/admin/models/test", func(w http.ResponseWriter, r *http.Request) {
		var in config.ProviderConfig
		if !readJSON(w, r, &in) {
			return
		}
		if in.Provider == "" || in.BaseURL == "" || in.RealModel == "" {
			fail(w, 400, "missing required fields")
			return
		}
		key, err := config.ResolveAPIKey(in.APIKey, nil)
		if err != nil {
			fail(w, 400, err.Error())
			return
		}
		okJSON(w, map[string]any{"success": true, "message": "configuration valid", "provider": in.Provider, "apiKey": config.MaskAPIKey(key)})
	})
}

func registerUsersExtraAPI(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("GET /api/admin/users/api", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"users": cfg.UserApiKeys, "models": cfg.Models})
	})
	mux.HandleFunc("POST /api/admin/users/toggle", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Enabled bool `json:"enabled"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		if !in.Enabled {
			disabledUsers = cfg.UserApiKeys
			cfg.UserApiKeys = nil
		} else if len(disabledUsers) > 0 {
			cfg.UserApiKeys = disabledUsers
			disabledUsers = nil
		}
		if err := d.save(cfg); err != nil {
			fail(w, 500, err.Error())
			return
		}
		okJSON(w, map[string]any{"enabled": in.Enabled})
	})
	mux.HandleFunc("POST /api/admin/users/edit/{name}", func(w http.ResponseWriter, r *http.Request) {
		var in config.UserApiKey
		if !readJSON(w, r, &in) {
			return
		}
		if in.Name == "" {
			fail(w, 400, "user name required")
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		old := r.PathValue("name")
		for i := range cfg.UserApiKeys {
			if cfg.UserApiKeys[i].Name == old {
				cfg.UserApiKeys[i] = in
				if err := d.save(cfg); err != nil {
					fail(w, 500, err.Error())
					return
				}
				okJSON(w, in)
				return
			}
		}
		fail(w, 404, "user not found")
	})
}

func registerGroupsExtraAPI(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("POST /api/admin/model-groups/edit/{name}/remove-model", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Model string `json:"model"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		for i := range cfg.ModelGroups {
			if cfg.ModelGroups[i].Name == r.PathValue("name") {
				models := []string{}
				for _, m := range cfg.ModelGroups[i].Models {
					if m != in.Model {
						models = append(models, m)
					}
				}
				cfg.ModelGroups[i].Models = models
				if err := d.save(cfg); err != nil {
					fail(w, 500, err.Error())
					return
				}
				okJSON(w, cfg.ModelGroups[i])
				return
			}
		}
		fail(w, 404, "group not found")
	})
	mux.HandleFunc("POST /api/admin/model-groups/edit/{name}/move-model", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Model string `json:"model"`
			Delta int    `json:"delta"`
		}
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		for i := range cfg.ModelGroups {
			if cfg.ModelGroups[i].Name == r.PathValue("name") {
				ms := cfg.ModelGroups[i].Models
				idx := -1
				for j, m := range ms {
					if m == in.Model {
						idx = j
					}
				}
				if idx < 0 {
					fail(w, 404, "model not in group")
					return
				}
				ni := idx + in.Delta
				if ni < 0 || ni >= len(ms) {
					fail(w, 400, "cannot move")
					return
				}
				ms[idx], ms[ni] = ms[ni], ms[idx]
				if err := d.save(cfg); err != nil {
					fail(w, 500, err.Error())
					return
				}
				okJSON(w, cfg.ModelGroups[i])
				return
			}
		}
		fail(w, 404, "group not found")
	})
}

func registerKeysExtraAPI(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("POST /api/admin/api-keys/edit/{id}", func(w http.ResponseWriter, r *http.Request) {
		var in struct{ Name, Key string }
		if !readJSON(w, r, &in) {
			return
		}
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		for i := range cfg.ApiKeys {
			if cfg.ApiKeys[i].ID == r.PathValue("id") {
				if in.Name != "" {
					cfg.ApiKeys[i].Name = in.Name
				}
				if in.Key != "" {
					cfg.ApiKeys[i].Key = in.Key
				}
				if err := d.save(cfg); err != nil {
					fail(w, 500, err.Error())
					return
				}
				okJSON(w, map[string]any{"id": cfg.ApiKeys[i].ID, "name": cfg.ApiKeys[i].Name, "key": config.MaskAPIKey(cfg.ApiKeys[i].Key)})
				return
			}
		}
		fail(w, 404, "key not found")
	})
}

func registerUserPagesAPI(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("GET /api/user/config", func(w http.ResponseWriter, r *http.Request) {
		cfg, err := d.load()
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		visible := []config.ProviderConfig{}
		for _, m := range cfg.Models {
			if !m.Hidden {
				visible = append(visible, m)
			}
		}
		okJSON(w, map[string]any{"models": visible, "modelGroups": cfg.ModelGroups, "announcement": cfg.UiSettings.AnnouncementMarkdown, "uiSettings": cfg.UiSettings})
	})
	mux.HandleFunc("GET /api/user/stats", func(w http.ResponseWriter, r *http.Request) {
		dm := store.GetDatabaseManager(d.ConfigDir)
		if err := dm.Initialize(); err != nil {
			fail(w, 500, err.Error())
			return
		}
		rows, err := dm.QueryRows("", "", 0)
		if err != nil {
			fail(w, 500, err.Error())
			return
		}
		byModel := map[string]int{}
		for _, row := range rows {
			byModel[row.CustomModel]++
		}
		keys := make([]string, 0, len(byModel))
		for k := range byModel {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		_ = keys
		okJSON(w, map[string]any{"total": len(rows), "byModel": byModel})
	})
}

func randomID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func ensureDir(path string) error { return os.MkdirAll(filepath.Dir(path), 0755) }

var disabledUsers []config.UserApiKey

var _ = strings.TrimSpace
