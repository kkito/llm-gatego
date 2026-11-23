package interceptor

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

var sessionStartResumeRE = regexp.MustCompile(`SessionStart:resume hook success:`)
var sessionStartIDRE = regexp.MustCompile("\n?<session-id>[^<]*</session-id>")
var sessionStartLastActiveRE = regexp.MustCompile(`\nLast active:[^\n]*`)

func NormalizeSessionStartText(text string) (string, int) {
	if !strings.Contains(text, "SessionStart:") {
		return text, 0
	}
	count := 0
	out := text
	if rep := sessionStartResumeRE.ReplaceAllString(out, "SessionStart:startup hook success:"); rep != out {
		out = rep
		count++
	}
	if rep := sessionStartIDRE.ReplaceAllString(out, ""); rep != out {
		out = rep
		count++
	}
	if rep := sessionStartLastActiveRE.ReplaceAllString(out, ""); rep != out {
		out = rep
		count++
	}
	return out, count
}
func NormalizeToolUseInputsInBody(body map[string]any) int {
	messages, ok := body["messages"].([]any)
	if !ok {
		return 0
	}
	tools, ok := body["tools"].([]any)
	if !ok {
		return 0
	}
	schemas := map[string][]string{}
	for _, raw := range tools {
		b := asMap(raw)
		name, _ := b["name"].(string)
		if name == "" {
			continue
		}
		props := asMap(asMap(b["input_schema"])["properties"])
		if len(props) == 0 {
			continue
		}
		keys := make([]string, 0, len(props))
		for k := range props {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		schemas[name] = keys
	}
	modified := 0
	for _, raw := range messages {
		m := asMap(raw)
		if m["role"] != "assistant" {
			continue
		}
		content, ok := m["content"].([]any)
		if !ok {
			continue
		}
		for i, cb := range content {
			b := asMap(cb)
			if b["type"] != "tool_use" {
				continue
			}
			input := asMap(b["input"])
			if len(input) == 0 {
				continue
			}
			name, _ := b["name"].(string)
			keys, has := schemas[name]
			if !has {
				continue
			}
			keySet := map[string]bool{}
			for _, k := range keys {
				keySet[k] = true
			}
			extras := false
			for k := range input {
				if !keySet[k] {
					extras = true
					break
				}
			}
			present := []string{}
			for _, k := range keys {
				if _, ok := input[k]; ok {
					present = append(present, k)
				}
			}
			current := []string{}
			for k := range input {
				if keySet[k] {
					current = append(current, k)
				}
			}
			orderDiff := len(present) != len(current)
			if !orderDiff {
				for j := range present {
					if present[j] != current[j] {
						orderDiff = true
						break
					}
				}
			}
			if !extras && !orderDiff {
				continue
			}
			newInput := map[string]any{}
			for _, k := range present {
				newInput[k] = input[k]
			}
			nm := map[string]any{}
			for k, v := range b {
				nm[k] = v
			}
			nm["input"] = newInput
			content[i] = nm
			modified++
		}
		m["content"] = content
	}
	return modified
}

const DeferredAvailable = "The following deferred tools are now available via ToolSearch"
const DeferredUnavailable = "The following deferred tools are no longer available"

var DeferredSnapshotDir = filepath.Join(os.Getenv("HOME"), ".claude", "cache-fix-state")

func shortHash(key string) string {
	sum := sha1.Sum([]byte(key))
	return hex.EncodeToString(sum[:])[:16]
}
func DeferredToolsSnapshotPath(key string) string {
	return filepath.Join(DeferredSnapshotDir, "deferred-tools-"+shortHash(key)+".txt")
}
func FindDeferredToolsBlock(body map[string]any) (int, int, string, bool) {
	messages, ok := body["messages"].([]any)
	if !ok {
		return 0, 0, "", false
	}
	for mi, raw := range messages {
		m := asMap(raw)
		if m["role"] != "user" {
			continue
		}
		content, ok := m["content"].([]any)
		if !ok {
			continue
		}
		for bi, braw := range content {
			b := asMap(braw)
			if b["type"] == "text" {
				if s, ok := b["text"].(string); ok && strings.Contains(s, DeferredAvailable) {
					return mi, bi, s, true
				}
			}
		}
	}
	return 0, 0, "", false
}

const StickyMaxPositions = 2

var StickyDir = filepath.Join(os.Getenv("HOME"), ".claude", "cache-fix-state")

func ComputeStickyMessageHash(msg map[string]any) string {
	content, ok := msg["content"].([]any)
	if !ok || len(content) == 0 {
		return ""
	}
	role, _ := msg["role"].(string)
	for _, raw := range content {
		b := asMap(raw)
		if b["type"] == "tool_use" {
			if id, ok := b["id"].(string); ok && id != "" {
				return shortHash(role + "|tool_use|" + id)
			}
		}
		if b["type"] == "tool_result" {
			if id, ok := b["tool_use_id"].(string); ok && id != "" {
				return shortHash(role + "|tool_result|" + id)
			}
		}
	}
	for _, raw := range content {
		b := asMap(raw)
		if b["type"] == "text" {
			if t, ok := b["text"].(string); ok {
				prefix := t
				if len(prefix) > 256 {
					prefix = prefix[:256]
				}
				return shortHash(role + "|text|" + prefix)
			}
		}
	}
	return ""
}

type StickyPosition struct {
	MsgHash      string         `json:"msg_hash"`
	PositionHint string         `json:"position_hint"`
	Marker       map[string]any `json:"marker"`
}
type StickyState struct {
	Version   int              `json:"version"`
	Positions []StickyPosition `json:"positions"`
}

func stickyStatePath(key string) string {
	return filepath.Join(StickyDir, "cache-control-sticky-"+shortHash(key)+".json")
}
func ReadStickyState(key string) StickyState {
	raw, err := os.ReadFile(stickyStatePath(key))
	if err != nil {
		return StickyState{Version: 1, Positions: []StickyPosition{}}
	}
	var p struct {
		Positions []struct {
			MsgHash string         `json:"msg_hash"`
			Marker  map[string]any `json:"marker"`
		} `json:"positions"`
	}
	if json.Unmarshal(raw, &p) != nil {
		return StickyState{Version: 1, Positions: []StickyPosition{}}
	}
	positions := []StickyPosition{}
	for _, v := range p.Positions {
		if v.MsgHash == "" {
			continue
		}
		marker := v.Marker
		if marker == nil || marker["type"] == nil {
			marker = map[string]any{"type": "ephemeral", "ttl": "1h"}
		}
		positions = append(positions, StickyPosition{MsgHash: v.MsgHash, PositionHint: "last_block", Marker: marker})
	}
	return StickyState{Version: 1, Positions: positions}
}
func WriteStickyState(key string, state StickyState) {
	_ = os.MkdirAll(StickyDir, 0755)
	b, _ := json.MarshalIndent(state, "", "  ")
	_ = os.WriteFile(stickyStatePath(key), b, 0644)
}

type StickyMutation struct {
	MsgIdx   int
	BlockIdx int
	Marker   map[string]any
}

func UpdateStickyState(body map[string]any, prior StickyState) (StickyState, []StickyMutation) {
	empty := StickyState{Version: 1, Positions: []StickyPosition{}}
	messages, ok := body["messages"].([]any)
	if !ok {
		return empty, nil
	}
	positions := append([]StickyPosition{}, prior.Positions...)
	priorIndex := map[string]int{}
	for i, p := range positions {
		priorIndex[p.MsgHash] = i
	}
	hashToMsgIdx := map[string]int{}
	for mi, raw := range messages {
		m := asMap(raw)
		if m["role"] != "user" {
			continue
		}
		content, ok := m["content"].([]any)
		if !ok || len(content) == 0 {
			continue
		}
		h := ComputeStickyMessageHash(m)
		if h == "" {
			continue
		}
		if _, has := hashToMsgIdx[h]; !has {
			hashToMsgIdx[h] = mi
		}
		for _, braw := range content {
			b := asMap(braw)
			if cc := asMap(b["cache_control"]); len(cc) > 0 {
				marker := map[string]any{}
				for k, v := range cc {
					marker[k] = v
				}
				if idx, has := priorIndex[h]; has {
					positions[idx] = StickyPosition{MsgHash: h, PositionHint: "last_block", Marker: marker}
				} else {
					positions = append(positions, StickyPosition{MsgHash: h, PositionHint: "last_block", Marker: marker})
					priorIndex[h] = len(positions) - 1
				}
				break
			}
		}
	}
	if len(positions) > StickyMaxPositions {
		positions = positions[len(positions)-StickyMaxPositions:]
	}
	existing := 0
	for _, raw := range asSlice(body["system"]) {
		if len(asMap(asMap(raw)["cache_control"])) > 0 {
			existing++
		}
	}
	for _, raw := range messages {
		for _, b := range asSlice(asMap(raw)["content"]) {
			if len(asMap(asMap(b)["cache_control"])) > 0 {
				existing++
			}
		}
	}
	budget := 4 - existing
	if budget < 0 {
		budget = 0
	}
	mutations := []StickyMutation{}
	for _, p := range positions {
		if len(mutations) >= budget {
			break
		}
		mi, has := hashToMsgIdx[p.MsgHash]
		if !has {
			continue
		}
		m := asMap(messages[mi])
		content, ok := m["content"].([]any)
		if !ok || len(content) == 0 {
			continue
		}
		hasMarker := false
		for _, b := range content {
			if len(asMap(asMap(b)["cache_control"])) > 0 {
				hasMarker = true
				break
			}
		}
		if hasMarker {
			continue
		}
		marker := map[string]any{}
		for k, v := range p.Marker {
			marker[k] = v
		}
		mutations = append(mutations, StickyMutation{MsgIdx: mi, BlockIdx: len(content) - 1, Marker: marker})
	}
	return StickyState{Version: 1, Positions: positions}, mutations
}
func ApplySticky(body map[string]any, key string) int {
	messages, ok := body["messages"].([]any)
	if !ok {
		return 0
	}
	prior := ReadStickyState(key)
	newState, mutations := UpdateStickyState(body, prior)
	for _, mut := range mutations {
		if mut.MsgIdx < 0 || mut.MsgIdx >= len(messages) {
			continue
		}
		m := asMap(messages[mut.MsgIdx])
		content, ok := m["content"].([]any)
		if !ok || mut.BlockIdx < 0 || mut.BlockIdx >= len(content) {
			continue
		}
		newContent := append([]any{}, content...)
		nm := map[string]any{}
		for k, v := range asMap(newContent[mut.BlockIdx]) {
			nm[k] = v
		}
		nm["cache_control"] = mut.Marker
		newContent[mut.BlockIdx] = nm
		nm2 := map[string]any{}
		for k, v := range m {
			nm2[k] = v
		}
		nm2["content"] = newContent
		messages[mut.MsgIdx] = nm2
	}
	body["messages"] = messages
	WriteStickyState(key, newState)
	return len(mutations)
}
func ClaudeCodeNormalize(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if !IsAnthropicEndpoint(ctx.RequestPath) {
		return req, nil
	}
	body := req.Body
	changed := false
	current := map[string]any{}
	for k, v := range body {
		current[k] = v
	}
	if messages, ok := current["messages"].([]any); ok {
		cp := append([]any{}, messages...)
		newMessages := make([]any, 0, len(cp))
		for _, raw := range cp {
			m := asMap(raw)
			if m["role"] != "user" {
				newMessages = append(newMessages, raw)
				continue
			}
			content, ok := m["content"].([]any)
			if !ok {
				newMessages = append(newMessages, raw)
				continue
			}
			newContent := make([]any, 0, len(content))
			cc := false
			for _, braw := range content {
				b := asMap(braw)
				if b["type"] == "text" {
					if s, ok := b["text"].(string); ok && strings.Contains(s, "SessionStart:") {
						if t, n := NormalizeSessionStartText(s); n > 0 {
							cc = true
							nm := map[string]any{}
							for k, v := range b {
								nm[k] = v
							}
							nm["text"] = t
							newContent = append(newContent, nm)
							continue
						}
					}
				} else if b["type"] == "tool_result" {
					if s, ok := b["content"].(string); ok && strings.Contains(s, "SessionStart:") {
						if t, n := NormalizeSessionStartText(s); n > 0 {
							cc = true
							nm := map[string]any{}
							for k, v := range b {
								nm[k] = v
							}
							nm["content"] = t
							newContent = append(newContent, nm)
							continue
						}
					}
				}
				newContent = append(newContent, braw)
			}
			if cc {
				changed = true
				nm := map[string]any{}
				for k, v := range m {
					nm[k] = v
				}
				nm["content"] = newContent
				newMessages = append(newMessages, nm)
			} else {
				newMessages = append(newMessages, raw)
			}
		}
		current["messages"] = newMessages
	}
	if n := NormalizeToolUseInputsInBody(current); n > 0 {
		changed = true
	}
	if _, ok := current["messages"].([]any); ok {
		mi, bi, text, found := FindDeferredToolsBlock(current)
		if found {
			path := DeferredToolsSnapshotPath(wd())
			if !strings.Contains(text, DeferredUnavailable) {
				_ = os.MkdirAll(DeferredSnapshotDir, 0755)
				_ = os.WriteFile(path, []byte(text), 0644)
			} else if snap, err := os.ReadFile(path); err == nil && len(snap) > len(text) {
				messages := asSlice(current["messages"])
				m := asMap(messages[mi])
				content := asSlice(m["content"])
				nm := map[string]any{}
				for k, v := range asMap(content[bi]) {
					nm[k] = v
				}
				nm["text"] = string(snap)
				content[bi] = nm
				nm2 := map[string]any{}
				for k, v := range m {
					nm2[k] = v
				}
				nm2["content"] = content
				messages[mi] = nm2
				current["messages"] = messages
				changed = true
			}
		}
	}
	if ApplySticky(current, wd()) > 0 {
		changed = true
	}
	if !changed {
		return req, nil
	}
	return &UpstreamRequest{URL: req.URL, Headers: req.Headers, Body: current}, nil
}
func wd() string { d, _ := os.Getwd(); return d }
