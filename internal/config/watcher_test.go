package config

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestWatcherDetectsExternalChange(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	if err := os.WriteFile(path, []byte(`{"models":[]}`), 0600); err != nil { t.Fatal(err) }
	w, err := NewWatcher(path)
	if err != nil { t.Fatal(err) }
	defer w.Stop()

	changed := make(chan *ProxyConfig, 1)
	w.OnChange(func(cfg *ProxyConfig) { changed <- cfg })

	// external write
	if err := os.WriteFile(path, []byte(`{"models":[{"customModel":"m","realModel":"r","apiKey":"k","baseUrl":"u","provider":"openai"}]}`), 0600); err != nil { t.Fatal(err) }
	select {
	case cfg := <-changed:
		if len(cfg.Models) != 1 { t.Fatalf("got %d models", len(cfg.Models)) }
	case <-time.After(3 * time.Second):
		t.Fatal("watcher did not fire")
	}
}

func TestWatcherIgnoresSelfWrite(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	if err := os.WriteFile(path, []byte(`{"models":[]}`), 0600); err != nil { t.Fatal(err) }
	w, err := NewWatcher(path)
	if err != nil { t.Fatal(err) }
	defer w.Stop()
	fired := make(chan struct{}, 1)
	w.OnChange(func(_ *ProxyConfig) { fired <- struct{}{} })

	MarkSelfWrite()
	if err := os.WriteFile(path, []byte(`{"models":[],"adminPassword":"x"}`), 0600); err != nil { t.Fatal(err) }
	select {
	case <-fired:
		t.Fatal("self write should be ignored")
	case <-time.After(700 * time.Millisecond):
	}
}
