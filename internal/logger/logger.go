package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// TriedModel matches src/logger.ts LogEntry.triedModels.
type TriedModel struct {
	Model     string `json:"model"`
	Exceeded  bool   `json:"exceeded"`
	Message   string `json:"message,omitempty"`
}

type LogError struct {
	Message string `json:"message"`
	Type    string `json:"type,omitempty"`
}

// LogEntry mirrors src/logger.ts LogEntry.
type LogEntry struct {
	Timestamp        string       `json:"timestamp"`
	RequestID        string       `json:"requestId"`
	CustomModel      string       `json:"customModel"`
	RealModel        string       `json:"realModel,omitempty"`
	Provider         string       `json:"provider,omitempty"`
	Endpoint         string       `json:"endpoint"`
	Method           string       `json:"method,omitempty"`
	StatusCode       int          `json:"statusCode"`
	DurationMs       int64        `json:"durationMs"`
	IsStreaming      bool         `json:"isStreaming"`
	PromptTokens     *int         `json:"promptTokens,omitempty"`
	CompletionTokens *int         `json:"completionTokens,omitempty"`
	TotalTokens      *int         `json:"totalTokens,omitempty"`
	CachedTokens     *int         `json:"cachedTokens,omitempty"`
	UserName         string       `json:"userName,omitempty"`
	ClientIP         *string      `json:"clientIp,omitempty"`
	ModelGroup       string       `json:"modelGroup,omitempty"`
	ActualModel      string       `json:"actualModel,omitempty"`
	TriedModels      []TriedModel `json:"triedModels,omitempty"`
	Error            *LogError    `json:"error,omitempty"`
	ResponseMetadata string       `json:"responseMetadata,omitempty"`
}

type Logger struct {
	logDir   string
	filename string
	mu       sync.Mutex
}

func NewLogger(logDir string, customFilename ...string) *Logger {
	name := ""
	if len(customFilename) > 0 {
		name = customFilename[0]
	}
	return &Logger{logDir: logDir, filename: name}
}

func (l *Logger) Log(entry LogEntry) error {
	if entry.Timestamp == "" {
		entry.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}
	if entry.Method == "" {
		entry.Method = "POST"
	}
	b, err := json.Marshal(entry)
	if err != nil {
		return err
	}
	name := l.filename
	if name == "" {
		name = "proxy-" + time.Now().Format("2006-01-02") + ".log"
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	if err := os.MkdirAll(l.logDir, 0755); err != nil {
		return err
	}
	f, err := os.OpenFile(filepath.Join(l.logDir, name), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = fmt.Fprintln(f, string(b))
	return err
}

func (l *Logger) GetFilePath() string {
	name := l.filename
	if name == "" {
		name = "proxy-" + time.Now().Format("2006-01-02") + ".log"
	}
	return filepath.Join(l.logDir, name)
}
