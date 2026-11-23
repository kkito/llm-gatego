package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync/atomic"
	"time"
)

// MarkSelfWrite records the write timestamp so the watcher can ignore self-triggered events.
var lastSelfWrite atomic.Int64

func MarkSelfWrite() { lastSelfWrite.Store(nowMillis()) }

func nowMillis() int64 {
	return time.Now().UnixMilli()
}

func LastSelfWrite() int64 { return lastSelfWrite.Load() }

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
