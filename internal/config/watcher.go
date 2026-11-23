package config

import (
	"path/filepath"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
)

const (
	selfWriteIgnoreMS = 2000
	debounceMS        = 200
)

// Watcher reloads config when the config file changes externally.
type Watcher struct {
	path     string
	fsw      *fsnotify.Watcher
	mu       sync.Mutex
	callback func(*ProxyConfig)
	timer    *time.Timer
	stop     chan struct{}
	once     sync.Once
}

func NewWatcher(path string) (*Watcher, error) {
	fsw, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}
	// Watch the directory (editors use atomic rename; file watchers break on that).
	if err := fsw.Add(filepath.Dir(path)); err != nil {
		fsw.Close()
		return nil, err
	}
	w := &Watcher{path: path, fsw: fsw, stop: make(chan struct{})}
	go w.loop()
	return w, nil
}

func (w *Watcher) OnChange(fn func(*ProxyConfig)) {
	w.mu.Lock()
	w.callback = fn
	w.mu.Unlock()
}

func (w *Watcher) loop() {
	for {
		select {
		case ev, ok := <-w.fsw.Events:
			if !ok {
				return
			}
			if filepath.Clean(ev.Name) != filepath.Clean(w.path) {
				continue
			}
			if ev.Op&(fsnotify.Write|fsnotify.Create|fsnotify.Rename) == 0 {
				continue
			}
			if last := LastSelfWrite(); last > 0 && time.Since(time.UnixMilli(last)).Milliseconds() < selfWriteIgnoreMS {
				continue
			}
			w.mu.Lock()
			if w.timer != nil {
				w.timer.Stop()
			}
			w.timer = time.AfterFunc(debounceMS*time.Millisecond, w.reload)
			w.mu.Unlock()
		case _, ok := <-w.fsw.Errors:
			if !ok {
				return
			}
		case <-w.stop:
			return
		}
	}
}

func (w *Watcher) reload() {
	cfg, err := LoadFullConfig(w.path)
	if err != nil {
		return // keep old config on parse error
	}
	w.mu.Lock()
	fn := w.callback
	w.mu.Unlock()
	if fn != nil {
		fn(cfg)
	}
}

func (w *Watcher) Stop() {
	w.once.Do(func() {
		close(w.stop)
		w.fsw.Close()
		w.mu.Lock()
		if w.timer != nil {
			w.timer.Stop()
		}
		w.mu.Unlock()
	})
}
