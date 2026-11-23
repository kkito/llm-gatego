package config

import (
	"os"
	"path/filepath"
)

type ConfigContext struct {
	ConfigDir    string
	ConfigPath   string
	LogDir       string
	DetailLogDir string
	PIDFile      string
}

func CreateConfigContext(dir string) ConfigContext {
	if dir == "" {
		home, _ := os.UserHomeDir()
		dir = filepath.Join(home, ".llm-gateway")
	}
	return ConfigContext{
		ConfigDir:    dir,
		ConfigPath:   filepath.Join(dir, "config.json"),
		LogDir:       filepath.Join(dir, "logs", "proxy"),
		DetailLogDir: filepath.Join(dir, "logs"),
		PIDFile:      filepath.Join(dir, "llm-gateway.pid"),
	}
}
