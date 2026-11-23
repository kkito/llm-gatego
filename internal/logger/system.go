package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type SystemLogger struct {
	logDir string
	mu     sync.Mutex
}

func NewSystemLogger(logDir string) *SystemLogger {
	_ = os.MkdirAll(logDir, 0755)
	return &SystemLogger{logDir: logDir}
}

func (s *SystemLogger) Log(message string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	f, err := os.OpenFile(filepath.Join(s.logDir, "system.log"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
	if err != nil {
		return
	}
	defer f.Close()
	fmt.Fprintf(f, "%s %s\n", time.Now().UTC().Format(time.RFC3339), message)
}
