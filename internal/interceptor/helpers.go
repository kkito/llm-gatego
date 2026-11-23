package interceptor

import "strings"

func IsAnthropicV1Messages(url string) bool { return strings.Contains(url, "/v1/messages") }
func IsAnthropicEndpoint(path string) bool {
	if path == "" {
		return false
	}
	return path == "/v1/messages" || path == "/v1/message" || path == "/messages" || strings.HasSuffix(path, "/messages")
}

func asMap(v any) map[string]any { m, _ := v.(map[string]any); return m }
func asSlice(v any) []any        { a, _ := v.([]any); return a }
func asStr(v any) string         { s, _ := v.(string); return s }
