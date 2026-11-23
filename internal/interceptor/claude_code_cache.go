package interceptor

import (
	"crypto/sha256"
	"encoding/hex"
	"regexp"
	"sort"
	"strings"
)

// Go regexp lacks lookahead; use manual peel instead.
func peelTrailingReminder(s string) (string, string, bool) {
	idx := strings.LastIndex(s, "\n\n<system-reminder>\n")
	if idx < 0 {
		return s, "", false
	}
	tail := s[idx+2:]
	end := strings.Index(tail, "</system-reminder>")
	if end < 0 {
		return s, "", false
	}
	end += len("</system-reminder>")
	reminder := tail[:end]
	rest := strings.TrimRightFunc(tail[end:], func(r rune) bool { return r == ' ' || r == '\n' || r == '\t' || r == '\r' })
	if rest != "" {
		return s, "", false
	}
	return s[:idx], reminder, true
}

func splitSmooshedReminders(messages []any) ([]any, int) {
	total := 0
	result := make([]any, 0, len(messages))
	for _, raw := range messages {
		msg := asMap(raw)
		if msg["role"] != "user" {
			result = append(result, raw)
			continue
		}
		content, ok := msg["content"].([]any)
		if !ok {
			result = append(result, raw)
			continue
		}
		out := []any{}
		reminders := []any{}
		mutated := false
		for _, rb := range content {
			b := asMap(rb)
			if b["type"] == "tool_result" {
				if s, ok := b["content"].(string); ok {
					local := []string{}
					cur := s
					for {
						r, rem, yes := peelTrailingReminder(cur)
						if !yes {
							break
						}
						local = append([]string{rem}, local...)
						cur = r
					}
					if len(local) > 0 {
						nm := map[string]any{}
						for k, v := range b {
							nm[k] = v
						}
						nm["content"] = cur
						out = append(out, nm)
						for _, rem := range local {
							reminders = append(reminders, map[string]any{"type": "text", "text": rem})
						}
						total += len(local)
						mutated = true
						continue
					}
				}
			}
			out = append(out, rb)
		}
		if mutated {
			nm := map[string]any{}
			for k, v := range msg {
				nm[k] = v
			}
			nm["content"] = append(out, reminders...)
			result = append(result, nm)
		} else {
			result = append(result, raw)
		}
	}
	if total == 0 {
		return messages, 0
	}
	return result, total
}
func IsSkillsBlock(v any) bool {
	s, ok := v.(string)
	return ok && strings.Contains(s, "User-invocable skills")
}
func IsDeferredToolsBlock(v any) bool {
	s, ok := v.(string)
	return ok && strings.Contains(s, "deferred tools are now available")
}

var skillsSplitRE = regexp.MustCompile(`(?s)^([\s\S]*?\n\n)(- [\s\S]+?)(\n</system-reminder>\s*)$`)

func sortSkillsBlock(text string) string {
	m := skillsSplitRE.FindStringSubmatch(text)
	if m == nil {
		return text
	}
	rawEntries := strings.Split(m[2], "\n- ")
	entries := []string{}
	for i, part := range rawEntries {
		if i > 0 {
			part = "- " + part
		}
		entries = append(entries, part)
	}
	sort.Strings(entries)
	return m[1] + strings.Join(entries, "\n") + m[3]
}

var deferredSplitRE = regexp.MustCompile(`(?s)^(<system-reminder>\nThe following deferred tools are now available[^\n]*\n)([\s\S]+?)(\n</system-reminder>\s*)$`)

func sortDeferredToolsBlock(text string) string {
	m := deferredSplitRE.FindStringSubmatch(text)
	if m == nil {
		return text
	}
	parts := strings.Split(m[2], "\n")
	tools := []string{}
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			tools = append(tools, p)
		}
	}
	sort.Strings(tools)
	return m[1] + strings.Join(tools, "\n") + m[3]
}
func sortSystemBlocks(system []any) ([]any, bool) {
	modified := false
	result := make([]any, 0, len(system))
	for _, raw := range system {
		b := asMap(raw)
		if b["type"] != "text" {
			result = append(result, raw)
			continue
		}
		text, ok := b["text"].(string)
		if !ok {
			result = append(result, raw)
			continue
		}
		sorted := text
		if IsSkillsBlock(text) {
			sorted = sortSkillsBlock(text)
		} else if IsDeferredToolsBlock(text) {
			sorted = sortDeferredToolsBlock(text)
		}
		if sorted != text {
			modified = true
			nm := map[string]any{}
			for k, v := range b {
				nm[k] = v
			}
			nm["text"] = sorted
			result = append(result, nm)
		} else {
			result = append(result, raw)
		}
	}
	return result, modified
}
func sortTools(tools []any) ([]any, bool) {
	if len(tools) == 0 {
		return tools, false
	}
	out := append([]any{}, tools...)
	sort.SliceStable(out, func(i, j int) bool {
		ni, _ := asMap(out[i])["name"].(string)
		nj, _ := asMap(out[j])["name"].(string)
		return ni < nj
	})
	return out, true
}

const sr = "<system-reminder>\n"

func isHooksBlock(t string) bool {
	return isSystemReminder(t) && strings.Contains(t[:min(len(t), 200)], "hook success")
}
func isSystemReminder(t string) bool { return strings.HasPrefix(t, "<system-reminder>") }
func isSkillsBlockFS(t string) bool {
	return strings.HasPrefix(t, sr+"The following skills are available")
}
func isDeferredToolsBlockFS(t string) bool {
	return strings.HasPrefix(t, sr+"The following deferred tools are now available")
}
func isMcpBlock(t string) bool { return strings.HasPrefix(t, sr+"# MCP Server Instructions") }
func isClearArtifact(t string) bool {
	return strings.HasPrefix(t, "<local-command-caveat>") || strings.HasPrefix(t, "<command-name>") || strings.HasPrefix(t, "<local-command-stdout>")
}
func stripClearArtifacts(content []any) ([]any, bool) {
	out := []any{}
	changed := false
	for _, b := range content {
		t, _ := asMap(b)["text"].(string)
		if isClearArtifact(t) {
			changed = true
			continue
		}
		out = append(out, b)
	}
	if !changed {
		return content, false
	}
	return out, true
}
func isRelocatableBlock(v any) bool {
	t, ok := v.(string)
	if !ok {
		return false
	}
	return isHooksBlock(t) || isSkillsBlockFS(t) || isDeferredToolsBlockFS(t) || isMcpBlock(t)
}
func getBlockType(t string) string {
	if isSkillsBlockFS(t) {
		return "skills"
	}
	if isDeferredToolsBlockFS(t) {
		return "deferred"
	}
	if isMcpBlock(t) {
		return "mcp"
	}
	if isHooksBlock(t) {
		return "hooks"
	}
	return ""
}

var sessionKnowledgeRE = regexp.MustCompile(`(?s)\n<session_knowledge[^>]*>[\s\S]*?</session_knowledge>`)
var pinned = map[string]struct{ hash, text string }{}

func pinBlockContent(blockType, text string) string {
	normalized := regexp.MustCompile(`\s+(</system-reminder>)\s*$`).ReplaceAllString(text, "\n$1")
	sum := sha256.Sum256([]byte(normalized))
	hash := hex.EncodeToString(sum[:])[:16]
	if p, ok := pinned[blockType]; ok && p.hash == hash {
		return p.text
	}
	pinned[blockType] = struct{ hash, text string }{hash, normalized}
	return normalized
}
func fixBlockText(blockType, text string) string {
	fixed := text
	if blockType == "skills" {
		fixed = sortSkillsBlock(fixed)
	} else if blockType == "deferred" {
		fixed = sortDeferredToolsBlock(fixed)
	} else if blockType == "hooks" {
		fixed = sessionKnowledgeRE.ReplaceAllString(fixed, "")
	}
	return pinBlockContent(blockType, fixed)
}
func freshSessionSort(messages []any) {
	first := -1
	for i, raw := range messages {
		if asMap(raw)["role"] == "user" {
			first = i
			break
		}
	}
	if first < 0 {
		return
	}
	firstMsg := asMap(messages[first])
	content, ok := firstMsg["content"].([]any)
	if !ok {
		return
	}
	if cleaned, changed := stripClearArtifacts(content); changed {
		content = cleaned
		nm := map[string]any{}
		for k, v := range firstMsg {
			nm[k] = v
		}
		nm["content"] = cleaned
		messages[first] = nm
		firstMsg = nm
	}
	scattered := false
	for i := first + 1; i < len(messages) && !scattered; i++ {
		m := asMap(messages[i])
		if m["role"] != "user" {
			continue
		}
		c, ok := m["content"].([]any)
		if !ok {
			continue
		}
		for _, b := range c {
			if isRelocatableBlock(asMap(b)["text"]) {
				scattered = true
				break
			}
		}
	}
	if !scattered {
		newContent := []any{}
		modified := false
		for _, b := range content {
			t, _ := asMap(b)["text"].(string)
			bt := getBlockType(t)
			if bt == "" {
				newContent = append(newContent, b)
				continue
			}
			fixed := fixBlockText(bt, t)
			if fixed != t {
				modified = true
				nm := map[string]any{}
				for k, v := range asMap(b) {
					if k != "cache_control" {
						nm[k] = v
					}
				}
				nm["text"] = fixed
				newContent = append(newContent, nm)
			} else {
				newContent = append(newContent, b)
			}
		}
		if modified {
			nm := map[string]any{}
			for k, v := range firstMsg {
				nm[k] = v
			}
			nm["content"] = newContent
			messages[first] = nm
		}
		return
	}
	found := map[string]any{}
	for i := len(messages) - 1; i >= first; i-- {
		m := asMap(messages[i])
		if m["role"] != "user" {
			continue
		}
		c, ok := m["content"].([]any)
		if !ok {
			continue
		}
		for j := len(c) - 1; j >= 0; j-- {
			b := asMap(c[j])
			t, _ := b["text"].(string)
			bt := getBlockType(t)
			if bt == "" {
				continue
			}
			if _, has := found[bt]; has {
				continue
			}
			fixed := fixBlockText(bt, t)
			nm := map[string]any{}
			for k, v := range b {
				if k != "cache_control" {
					nm[k] = v
				}
			}
			nm["text"] = fixed
			found[bt] = nm
		}
	}
	if len(found) == 0 {
		return
	}
	for i, raw := range messages {
		m := asMap(raw)
		if m["role"] != "user" {
			continue
		}
		c, ok := m["content"].([]any)
		if !ok {
			continue
		}
		kept := []any{}
		changed := false
		for _, b := range c {
			if isRelocatableBlock(asMap(b)["text"]) {
				changed = true
				continue
			}
			kept = append(kept, b)
		}
		if changed {
			nm := map[string]any{}
			for k, v := range m {
				nm[k] = v
			}
			nm["content"] = kept
			messages[i] = nm
		}
	}
	toRelocate := []any{}
	for _, t := range []string{"deferred", "mcp", "skills", "hooks"} {
		if v, ok := found[t]; ok {
			toRelocate = append(toRelocate, v)
		}
	}
	last := asMap(messages[first])
	lc, _ := last["content"].([]any)
	nm := map[string]any{}
	for k, v := range last {
		nm[k] = v
	}
	nm["content"] = append(toRelocate, lc...)
	messages[first] = nm
}

const continueTrailer = "Continue from where you left off."

func isContinueTrailerBlock(block any) bool {
	b := asMap(block)
	return b["type"] == "text" && b["text"] == continueTrailer
}

var reminderWrapRE = regexp.MustCompile(`(?s)^<system-reminder>\n([\s\S]*?)\n</system-reminder>\s*$`)
var bookkeepingPatterns = []*regexp.Regexp{regexp.MustCompile(`^Token usage: \d+/\d+; \d+ remaining\s*$`), regexp.MustCompile(`^Output tokens — turn: [^\n]+ · session: [^\n]+\s*$`), regexp.MustCompile(`^USD budget: \$[\d.]+/\$[\d.]+; \$[\d.]+ remaining\s*$`), regexp.MustCompile(`^The task tools haven't been used recently\.`), regexp.MustCompile(`^The TodoWrite tool hasn't been used recently\.`), regexp.MustCompile(`^Remaining conversation turns: `), regexp.MustCompile(`^Messages? until auto-compact: `)}

func isBookkeepingReminder(v any) bool {
	s, ok := v.(string)
	if !ok {
		return false
	}
	m := reminderWrapRE.FindStringSubmatch(s)
	if m == nil {
		return false
	}
	for _, rx := range bookkeepingPatterns {
		if rx.MatchString(m[1]) {
			return true
		}
	}
	return false
}
func stripContentBlocks(messages []any) ([]any, int, int) {
	trailerCount, reminderCount := 0, 0
	result := make([]any, 0, len(messages))
	for _, raw := range messages {
		m := asMap(raw)
		if m["role"] != "user" {
			result = append(result, raw)
			continue
		}
		c, ok := m["content"].([]any)
		if !ok {
			result = append(result, raw)
			continue
		}
		kept := []any{}
		for _, b := range c {
			if isContinueTrailerBlock(b) {
				trailerCount++
				continue
			}
			if asMap(b)["type"] == "text" && isBookkeepingReminder(asMap(b)["text"]) {
				reminderCount++
				continue
			}
			kept = append(kept, b)
		}
		if len(kept) == 0 || len(kept) == len(c) {
			result = append(result, raw)
		} else {
			nm := map[string]any{}
			for k, v := range m {
				nm[k] = v
			}
			nm["content"] = kept
			result = append(result, nm)
		}
	}
	if trailerCount+reminderCount == 0 {
		return messages, 0, 0
	}
	return result, trailerCount, reminderCount
}
func ClaudeCodeCache(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if !IsAnthropicEndpoint(ctx.RequestPath) {
		return req, nil
	}
	if req.Body["messages"] == nil {
		return req, nil
	}
	body := map[string]any{}
	for k, v := range req.Body {
		body[k] = v
	}
	if msgs, ok := body["messages"].([]any); ok {
		if peeled, count := splitSmooshedReminders(msgs); count > 0 {
			body["messages"] = peeled
		}
	}
	if sys, ok := body["system"].([]any); ok {
		if sorted, changed := sortSystemBlocks(sys); changed {
			body["system"] = sorted
		}
	}
	if tools, ok := body["tools"].([]any); ok {
		if sorted, changed := sortTools(tools); changed {
			body["tools"] = sorted
		}
	}
	if msgs, ok := body["messages"].([]any); ok {
		cp := append([]any{}, msgs...)
		freshSessionSort(cp)
		body["messages"] = cp
		if stripped, t, r := stripContentBlocks(cp); t+r > 0 {
			body["messages"] = stripped
		}
	}
	return &UpstreamRequest{URL: req.URL, Headers: req.Headers, Body: body}, nil
}
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
