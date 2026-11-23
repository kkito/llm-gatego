package config

import (
	"fmt"
	"regexp"
	"time"

	"github.com/google/uuid"
)

var apiKeyRefRE = regexp.MustCompile(`^\$\$(.+)\$\$$`)

func IsAPIKeyRef(s string) bool { return apiKeyRefRE.MatchString(s) }

func GetAPIKeyRefName(s string) string {
	m := apiKeyRefRE.FindStringSubmatch(s)
	if m == nil {
		return ""
	}
	return m[1]
}

// ResolveAPIKey resolves "$$name$$" references against saved API keys.
func ResolveAPIKey(s string, keys []ApiKey) (string, error) {
	name := GetAPIKeyRefName(s)
	if name == "" {
		return s, nil
	}
	for _, k := range keys {
		if k.Name == name {
			return k.Key, nil
		}
	}
	return "", fmt.Errorf("API Key reference $$%s$$ not found in saved API keys", name)
}

func MaskAPIKey(key string) string {
	if len(key) <= 4 {
		return "*****"
	}
	return "*****" + key[len(key)-4:]
}

func AddAPIKey(keys []ApiKey, name, key string) ([]ApiKey, ApiKey, error) {
	for _, k := range keys {
		if k.Name == name {
			return nil, ApiKey{}, fmt.Errorf("API Key name %q already exists", name)
		}
	}
	now := time.Now().UnixMilli()
	entry := ApiKey{ID: uuid.NewString(), Name: name, Key: key, CreatedAt: now, UpdatedAt: now}
	return append(append([]ApiKey{}, keys...), entry), entry, nil
}
