package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type DetailLogger struct {
	logDir  string
	enabled bool
	mu      sync.Mutex
}

func NewDetailLogger(logDir string, enabled bool) *DetailLogger {
	_ = os.MkdirAll(logDir, 0755)
	return &DetailLogger{logDir: logDir, enabled: enabled}
}

func (d *DetailLogger) SetEnabled(v bool) { d.enabled = v }
func (d *DetailLogger) IsEnabled() bool   { return d.enabled }

func (d *DetailLogger) LogRequest(requestID string, body any)  { d.write(requestID, "request", body) }
func (d *DetailLogger) LogResponse(requestID string, body any) { d.write(requestID, "response", body) }

func (d *DetailLogger) write(requestID, stage string, body any) {
	d.mu.Lock()
	defer d.mu.Unlock()
	if !d.enabled {
		return
	}
	b, err := json.MarshalIndent(body, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(filepath.Join(d.logDir, fmt.Sprintf("%s_%s.log", requestID, stage)), b, 0600)
}
