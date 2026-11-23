package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"
)

// MarkSelfWrite records the write timestamp so the watcher can ignore self-triggered events.
var lastSelfWrite int64

func MarkSelfWrite() { lastSelfWrite = nowMillis() }

func nowMillis() int64 {
	return time.Now().UnixMilli()
}

func LastSelfWrite() int64 { return lastSelfWrite }

func SaveConfig(cfg *ProxyConfig, path string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	MarkSelfWrite()
	b, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\n'), 0600)
}
