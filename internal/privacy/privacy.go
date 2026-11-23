package privacy

import (
	"encoding/json"
	"github.com/kkito/llm-gatego/internal/config"
	"reflect"
	"regexp"
	"strings"
	"sync"
)

var safeFields = map[string]bool{"messages": true, "stream": true, "temperature": true, "max_tokens": true, "top_p": true, "presence_penalty": true, "frequency_penalty": true, "stop": true, "response_format": true, "tools": true, "tool_choice": true, "seed": true, "stream_options": true, "reasoning_effort": true, "extra_body": true}

func FilterWhitelistedFields(body map[string]any, requestID string) map[string]any {
	out := map[string]any{}
	for k, v := range body {
		if safeFields[k] {
			out[k] = v
		}
	}
	return out
}
func StripUserField(body map[string]any, requestID string) { delete(body, "user") }

var pathMappings = map[string]map[string]string{}
var pathMu sync.Mutex

func ClearPathMappings() {
	pathMu.Lock()
	defer pathMu.Unlock()
	pathMappings = map[string]map[string]string{}
}

var patterns = []struct{ re *regexp.Regexp }{
	{regexp.MustCompile(`(/home/)([^/"]+)(/)`)},
	{regexp.MustCompile(`(/Users/)([^/"]+)(/)`)},
	{regexp.MustCompile(`([A-Za-z]:\\\\Users\\\\)([^\\\\"]+)(\\\\)`)},
}

func sanitizeJSONString(s, placeholder string, mapping map[string]string) string {
	for _, p := range patterns {
		s = p.re.ReplaceAllStringFunc(s, func(match string) string {
			groups := p.re.FindStringSubmatch(match)
			if len(groups) < 4 {
				return match
			}
			ph := groups[1] + placeholder + groups[3]
			real := groups[1] + groups[2] + groups[3]
			mapping[ph] = real
			return ph
		})
	}
	return s
}
func replaceInPlace(body any, f func(string) string) {
	b, err := json.Marshal(body)
	if err != nil {
		return
	}
	var parsed any
	if json.Unmarshal([]byte(f(string(b))), &parsed) != nil {
		return
	}
	applyReplace(body, parsed)
}
func applyReplace(original, replacement any) {
	deepCopyInto(reflect.ValueOf(original), reflect.ValueOf(replacement))
}
func deepCopyInto(dst, src reflect.Value) {
	if !src.IsValid() {
		return
	}
	if src.Kind() == reflect.Interface {
		src = src.Elem()
	}
	if !src.IsValid() {
		return
	}
	switch dst.Kind() {
	case reflect.Map:
		if src.Kind() != reflect.Map {
			return
		}
		for _, k := range src.MapKeys() {
			key := k.String()
			dv := dst.MapIndex(reflect.ValueOf(key))
			if !dv.IsValid() {
				dst.SetMapIndex(reflect.ValueOf(key), src.MapIndex(k))
				continue
			}
			if dv.Kind() == reflect.Interface {
				dv = dv.Elem()
			}
			if dv.Kind() == reflect.Map || dv.Kind() == reflect.Slice {
				deepCopyInto(dv, src.MapIndex(k))
			} else {
				dst.SetMapIndex(reflect.ValueOf(key), src.MapIndex(k))
			}
		}
	case reflect.Slice:
		if src.Kind() != reflect.Slice {
			return
		}
		if dst.Len() != src.Len() {
			dst.SetLen(src.Len())
		}
		for i := 0; i < src.Len(); i++ {
			element := dst.Index(i)
			inner := element
			if inner.Kind() == reflect.Interface {
				inner = inner.Elem()
			}
			sv := src.Index(i)
			if sv.Kind() == reflect.Interface {
				sv = sv.Elem()
			}
			if inner.IsValid() && (inner.Kind() == reflect.Map || inner.Kind() == reflect.Slice) {
				deepCopyInto(inner, sv)
			} else if element.CanSet() && sv.IsValid() {
				element.Set(sv)
			}
		}
	}
}
func SanitizePaths(body any, placeholder, requestID string) {
	mapping := map[string]string{}
	replaceInPlace(body, func(s string) string { return sanitizeJSONString(s, placeholder, mapping) })
	if len(mapping) == 0 {
		return
	}
	pathMu.Lock()
	pathMappings[requestID] = mapping
	pathMu.Unlock()
}
func restoreString(s string, mapping map[string]string) string {
	for ph, real := range mapping {
		s = strings.ReplaceAll(s, ph, real)
	}
	return s
}
func RestorePaths(body any, requestID string) {
	pathMu.Lock()
	mapping, ok := pathMappings[requestID]
	if ok {
		delete(pathMappings, requestID)
	}
	pathMu.Unlock()
	if !ok {
		return
	}
	replaceInPlace(body, func(s string) string { return restoreString(s, mapping) })
}
func SanitizeSSEChunk(line, requestID string) string {
	pathMu.Lock()
	mapping := pathMappings[requestID]
	pathMu.Unlock()
	if mapping == nil {
		return line
	}
	return restoreString(line, mapping)
}
func ApplyProtection(body map[string]any, settings config.PrivacySettings, requestID string) map[string]any {
	if !settings.Enabled {
		return body
	}
	processed := body
	if settings.WhitelistFilter {
		processed = FilterWhitelistedFields(processed, requestID)
	}
	if settings.StripUserField {
		StripUserField(processed, requestID)
	}
	if settings.SanitizeFilePaths {
		SanitizePaths(processed, settings.PathPlaceholder, requestID)
	}
	return processed
}
