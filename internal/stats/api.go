package stats

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/store"
	"net/http"
	"strconv"
	"time"
)

func RegisterRoutes(mux *http.ServeMux, configDir string) {
	mux.HandleFunc("GET /api/stats", func(w http.ResponseWriter, r *http.Request) {
		dm := store.GetDatabaseManager(configDir)
		from, to := "", ""
		if start := r.URL.Query().Get("start"); start != "" {
			from = start
		}
		if end := r.URL.Query().Get("end"); end != "" {
			to = end
		}
		if from == "" && to == "" {
			from = time.Now().AddDate(0, 0, -30).Format(time.RFC3339)
		}
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		rows, err := dm.QueryRows(from, to, limit)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		result := Aggregate(rows, nil)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"ok": true, "data": result})
	})
}
