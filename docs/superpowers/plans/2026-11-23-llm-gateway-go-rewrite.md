# LLM Gateway Go 全量重写 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `llm-gatego` 中用 Go 全量 1:1 重写 llm-gateway（含 Web 前端与全部测试语义迁移）。

**Architecture:** Go 单后端 `cmd/internal` 分层，标准库 `flag` + `net/http.ServeMux`；前端为独立 `web/` TS WebComponents 目录，esbuild 打成一个 IIFE 由 `embed.FS` 内嵌进单二进制。用量统一走 SQLite。所有架构/流程/时序/类/状态/ER 图以 Mermaid 代码块写在 `docs/` markdown 文档内。

**Tech Stack:** Go 1.25（标准库 + `modernc.org/sqlite`）；TypeScript + vitest + happy-dom + esbuild（全局工具链）；SQLite WAL。

## Global Constraints

- 源项目路径：`<original-llm-gateway>`（只读参考）；目标路径：`<project-root>`。
- 所有后端包位于 `internal/`，测试文件与实现同包同目录（`*_test.go`）。
- 所有单例必须提供 `ResetForTest()` / `resetForTest()`；测试间用 `t.TempDir()` 隔离，不依赖网络。
- 测试分层：单元（每包 `_test.go`）/ 集成（`httptest` + 临时 SQLite）/ e2e（`internal/e2e`）/ 前端（vitest + happy-dom）。
- 测试迁移必须有对照表 `docs/test-migration-map.md`：源测试路径 → 目标测试路径 → 覆盖说明。
- Web 工具链全局安装，项目内不写 `web/package.json`、不提交 `web/node_modules`；测试命令用 `NODE_PATH=$(npm root -g) vitest run`。
- 完成标准：`make test`（`go test ./... -race`）+ `make web-test` 全绿；`docs/` 下所有 Mermaid 图齐全。
- 对齐原项目 v1.15.0 细节：默认端口 **4000**；CLI 含 `stats` 子命令；路由别名含 `/v1/v1/*`；DB schema 为单文件建表 24 列 5 索引（无增量 ALTER）；前端 JSON API 前缀 `/api/admin/*` + `/api/user/*`。
- 禁止使用 cgo 依赖（SQLite 用纯 Go 驱动）。

---

## 文件结构总览

```
cmd/llm-gatego/{main,daemon,stats}.go     # CLI 入口 + daemon + stats 子命令
internal/config/{types,load,save,operations,apikey,context,watcher}.go + _test.go
internal/util/{format,time,clientip,password,paths,streammetrics,openaifields}.go + _test.go
internal/logger/{logger,detail,system}.go + _test.go
internal/store/{manager,migrations,schema,request_logger}.go + _test.go
internal/provider/{provider,base,openai,anthropic,response_api,factory}.go + _test.go
internal/converter/{types,router,chat,anthropic,responses,sse_parser,params}.go + subpackages + _test.go
internal/limiter/{rate,cost,usage,period,params_merge}.go + _test.go
internal/modelgroup/{resolver,error}.go + _test.go
internal/interceptor/{manager,types,billing,cache,normalize,ttl,claude,opencode,qwen,user_access}.go + _test.go
internal/privacy/{types,apply,strip_user,sanitizer,whitelist}.go + _test.go
internal/auth/{admin,user}.go + _test.go
internal/stats/{aggregate,api}.go + _test.go
internal/proxy/{chat,messages,responses,models,upstream,fallback,stream,response}.go + _test.go
internal/server/{server,middleware,assets,admin_api,user_api}.go + _test.go
internal/e2e/{proxy,admin,user,config,logging}_test.go
web/{src,tests}/ …
scripts/build_web.cjs
migrations/*.sql
docs/{architecture,uml-flows,uml-sequences,uml-classes,data-model,test-migration-map}.md
Makefile, go.mod, README.md
```

---

## Task 1: 项目脚手架、go.mod 与 Makefile

**Files:**
- Create: `go.mod`, `Makefile`, `README.md`, `.gitignore`, `cmd/llm-gatego/main.go`

**Interfaces:**
- Produces: `make build/test/test-race/web-build/web-test` 可用；`go run ./cmd/llm-gatego -version` 打印版本。

- [ ] **Step 1: 初始化 go.mod**

```bash
cd <project-root>
go mod init github.com/kkito/llm-gatego
go get modernc.org/sqlite@latest
```

- [ ] **Step 2: 写 Makefile**

```makefile
.PHONY: build test test-race web-build web-test all clean

VERSION := 1.15.0
LDFLAGS := -ldflags "-X main.version=$(VERSION)"

build: web-build
	go build $(LDFLAGS) -o dist/llm-gatego ./cmd/llm-gatego

test:
	go test ./...

test-race:
	go test -race ./...

web-build:
	node scripts/build_web.cjs

web-test:
	cd web && NODE_PATH=$(shell npm root -g) vitest run

all: test web-test build
clean:
	rm -rf dist build/web-dist
```

- [ ] **Step 3: 写最小 main.go**

```go
package main

import (
	"flag"
	"fmt"
)

var version = "dev"

func main() {
	showVersion := flag.Bool("version", false, "print version")
	flag.Parse()
	if *showVersion {
		fmt.Println("llm-gatego " + version)
		return
	}
	fmt.Println("llm-gatego: use -version or start/stop (coming next)")
}
```

- [ ] **Step 4: 写 .gitignore**

```
/dist/
/build/
/web/node_modules/
*.db
*.db-wal
*.db-shm
```

- [ ] **Step 5: 验证并提交**

```bash
go run ./cmd/llm-gatego -version
# Expected: llm-gatego 1.15.0 (via Makefile ldflags) or dev via go run
go build ./...
git add . && git commit -m "chore: scaffold Go project, Makefile, CLI entry"
```

---

## Task 2: 配置类型与加载（`internal/config`）

**Files:**
- Create: `internal/config/types.go`, `internal/config/load.go`, `internal/config/load_test.go`, `internal/config/testdata/valid.json`

**Interfaces:**
- Produces: `config.ProxyConfig`, `config.ProviderConfig`, `config.ModelLimit`, `config.LoadFullConfig(path string) (*ProxyConfig, error)`, `config.LoadConfig(path string) ([]ProviderConfig, error)`, `config.FindProvider(cfg []ProviderConfig, model string) *ProviderConfig`.

- [ ] **Step 1: 写类型定义 types.go**

```go
package config

type ProviderType string

const (
	ProviderOpenAI     ProviderType = "openai"
	ProviderAnthropic  ProviderType = "anthropic"
	ProviderResponseAPI ProviderType = "response-api"
)

type LimitType string
const (
	LimitRequests   LimitType = "requests"
	LimitInputTokens LimitType = "input_tokens"
	LimitCost       LimitType = "cost"
)

type LimitPeriod string
const (
	PeriodDay    LimitPeriod = "day"
	PeriodHours  LimitPeriod = "hours"
	PeriodWeek   LimitPeriod = "week"
	PeriodMonth  LimitPeriod = "month"
)

type ModelLimit struct {
	Type        LimitType   `json:"type"`
	Period      LimitPeriod `json:"period"`
	PeriodValue *int        `json:"periodValue,omitempty"`
	Max         float64     `json:"max"`
}

type ApiKey struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Key       string `json:"key"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
}

type ProviderConfig struct {
	CustomModel       string           `json:"customModel"`
	RealModel         string           `json:"realModel"`
	APIKey            string           `json:"apiKey"`
	BaseURL           string           `json:"baseUrl"`
	Provider          ProviderType     `json:"provider"`
	Desc              string           `json:"desc,omitempty"`
	InputPricePer1M   *float64         `json:"inputPricePer1M,omitempty"`
	OutputPricePer1M  *float64         `json:"outputPricePer1M,omitempty"`
	CachedPricePer1M  *float64         `json:"cachedPricePer1M,omitempty"`
	Limits            []ModelLimit     `json:"limits,omitempty"`
	Hidden            bool             `json:"hidden,omitempty"`
	MaxContextLength  int              `json:"maxContextLength,omitempty"`
	DefaultParams     map[string]any   `json:"defaultParams,omitempty"`
	Proxy             string           `json:"proxy,omitempty"`
}

type UserApiKey struct {
	Name          string   `json:"name"`
	APIKey        string   `json:"apikey"`
	Desc          string   `json:"desc,omitempty"`
	AllowedModels []string `json:"allowedModels,omitempty"`
}

type ModelGroup struct {
	Name   string   `json:"name"`
	Models []string `json:"models"`
	Desc   string   `json:"desc,omitempty"`
}

type PrivacySettings struct {
	Enabled           bool   `json:"enabled"`
	StripUserField    bool   `json:"stripUserField"`
	SanitizeFilePaths bool   `json:"sanitizeFilePaths"`
	PathPlaceholder   string `json:"pathPlaceholder"`
	WhitelistFilter   bool   `json:"whitelistFilter"`
}

type UiSettings struct {
	Enabled              bool   `json:"enabled,omitempty"`
	AnnouncementMarkdown string `json:"announcementMarkdown,omitempty"`
}

type ProxyConfig struct {
	Models           []ProviderConfig `json:"models"`
	ModelGroups      []ModelGroup     `json:"modelGroups,omitempty"`
	AdminPassword    string           `json:"adminPassword,omitempty"`
	ApiKeys          []ApiKey         `json:"apiKeys,omitempty"`
	UserApiKeys      []UserApiKey     `json:"userApiKeys,omitempty"`
	PrivacySettings  *PrivacySettings `json:"privacySettings,omitempty"`
	UiSettings       *UiSettings      `json:"uiSettings,omitempty"`
	DetailLogEnabled bool             `json:"detailLogEnabled,omitempty"`
}
```

- [ ] **Step 2: 写失败测试（加载有效配置 + 校验错误）**

```go
package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadFullConfigValid(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	data := `{"models":[{"customModel":"gpt","realModel":"gpt-4o","apiKey":"sk-x","baseUrl":"https://api.openai.com","provider":"openai"}],"modelGroups":[{"name":"fast","models":["gpt"]}],"apiKeys":[]}`
	if err := os.WriteFile(path, []byte(data), 0600); err != nil { t.Fatal(err) }
	cfg, err := LoadFullConfig(path)
	if err != nil { t.Fatalf("unexpected err: %v", err) }
	if len(cfg.Models) != 1 || cfg.Models[0].MaxContextLength != 200000 {
		t.Fatalf("default maxContextLength not applied: %+v", cfg.Models[0])
	}
}

func TestLoadFullConfigMissingField(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	if err := os.WriteFile(path, []byte(`{"models":[{"customModel":"x"}]}`), 0600); err != nil { t.Fatal(err) }
	_, err := LoadFullConfig(path)
	if err == nil { t.Fatal("expected missing field error") }
}

func TestLoadFullConfigLegacyArray(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	data := `[{"customModel":"m","realModel":"r","apiKey":"k","baseUrl":"u","provider":"openai"}]`
	if err := os.WriteFile(path, []byte(data), 0600); err != nil { t.Fatal(err) }
	cfg, err := LoadFullConfig(path)
	if err != nil { t.Fatal(err) }
	if len(cfg.Models) != 1 { t.Fatalf("got %d", len(cfg.Models)) }
}
```

- [ ] **Step 3: 运行测试确认失败**

```bash
cd <project-root> && go test ./internal/config -run TestLoadFullConfig -v
# Expected: FAIL — undefined: LoadFullConfig
```

- [ ] **Step 4: 实现 load.go**

```go
package config

import (
	"encoding/json"
	"fmt"
	"os"
)

const defaultMaxContextLength = 200000

var requiredFields = []string{"customModel", "realModel", "apiKey", "baseUrl", "provider"}

func validateProvider(m map[string]any, index int) error {
	for _, f := range requiredFields {
		v, ok := m[f]
		if !ok || v == nil || v == "" {
			return fmt.Errorf("missing required field: %s at index %d", f, index)
		}
	}
	return nil
}

func validateAndNormalize(raw []map[string]any) ([]ProviderConfig, error) {
	for i, m := range raw {
		if err := validateProvider(m, i); err != nil { return nil, err }
		if limits, ok := m["limits"]; ok {
			arr, ok := limits.([]any)
			if !ok { return nil, fmt.Errorf("limits must be an array at model %d", i) }
			for j, l := range arr {
				lm, ok := l.(map[string]any)
				if !ok { return nil, fmt.Errorf("invalid limit at model %d index %d", i, j) }
				if err := validateLimit(lm, i, j); err != nil { return nil, err }
			}
		}
		if _, ok := m["maxContextLength"]; !ok {
			m["maxContextLength"] = float64(defaultMaxContextLength)
		}
	}
	b, err := json.Marshal(raw)
	if err != nil { return nil, err }
	var out []ProviderConfig
	if err := json.Unmarshal(b, &out); err != nil { return nil, err }
	return out, nil
}

func validateLimit(lm map[string]any, modelIdx, limitIdx int) error {
	validTypes := map[string]bool{"requests": true, "input_tokens": true, "cost": true}
	validPeriods := map[string]bool{"day": true, "hours": true, "week": true, "month": true}
	t, _ := lm["type"].(string)
	p, _ := lm["period"].(string)
	if !validTypes[t] { return fmt.Errorf("invalid limit type %q at model %d limit %d", t, modelIdx, limitIdx) }
	if !validPeriods[p] { return fmt.Errorf("invalid limit period %q at model %d limit %d", p, modelIdx, limitIdx) }
	if p == "hours" {
		if _, ok := lm["periodValue"].(float64); !ok { return fmt.Errorf("missing periodValue for hours period at model %d limit %d", modelIdx, limitIdx) }
	}
	if _, ok := lm["max"].(float64); !ok { return fmt.Errorf("missing or invalid max at model %d limit %d", modelIdx, limitIdx) }
	return nil
}

func decodeConfig(path string) (any, error) {
	b, err := os.ReadFile(path)
	if err != nil { return nil, fmt.Errorf("config file not found: %s", path) }
	var v any
	if err := json.Unmarshal(b, &v); err != nil { return nil, fmt.Errorf("invalid JSON: %w", err) }
	return v, nil
}

func toRawModels(v any) ([]map[string]any, error) {
	switch t := v.(type) {
	case []any:
		out := make([]map[string]any, 0, len(t))
		for _, item := range t {
			m, ok := item.(map[string]any)
			if !ok { return nil, fmt.Errorf("model entry must be object") }
			out = append(out, m)
		}
		return out, nil
	case map[string]any:
		arr, ok := t["models"].([]any)
		if !ok { return nil, fmt.Errorf("config must have a \"models\" array") }
		out := make([]map[string]any, 0, len(arr))
		for _, item := range arr {
			m, ok := item.(map[string]any)
			if !ok { return nil, fmt.Errorf("model entry must be object") }
			out = append(out, m)
		}
		return out, nil
	default:
		return nil, fmt.Errorf("config must be an array or an object with \"models\" array")
	}
}

// LoadFullConfig loads and validates the complete config file.
func LoadFullConfig(path string) (*ProxyConfig, error) {
	v, err := decodeConfig(path)
	if err != nil { return nil, err }
	rawModels, err := toRawModels(v)
	if err != nil { return nil, err }
	models, err := validateAndNormalize(rawModels)
	if err != nil { return nil, err }
	cfg := &ProxyConfig{Models: models, ApiKeys: []ApiKey{}}
	if obj, ok := v.(map[string]any); ok {
		b, _ := json.Marshal(obj)
		if err := json.Unmarshal(b, cfg); err != nil { return nil, err }
		cfg.Models = models // preserve normalization
		if err := validateModelGroups(cfg); err != nil { return nil, err }
	}
	return cfg, nil
}

// LoadConfig returns only the models array (backwards-compatible helper).
func LoadConfig(path string) ([]ProviderConfig, error) {
	cfg, err := LoadFullConfig(path)
	if err != nil { return nil, err }
	return cfg.Models, nil
}

func validateModelGroups(cfg *ProxyConfig) error {
	names := map[string]bool{}
	for _, m := range cfg.Models { names[m.CustomModel] = true }
	groupNames := map[string]bool{}
	for i, g := range cfg.ModelGroups {
		if g.Name == "" { return fmt.Errorf("model group at index %d must have a name", i) }
		if groupNames[g.Name] { return fmt.Errorf("duplicate model group name: %q", g.Name) }
		groupNames[g.Name] = true
		if len(g.Models) == 0 { return fmt.Errorf("model group %q models array cannot be empty", g.Name) }
		for _, mn := range g.Models {
			if !names[mn] { return fmt.Errorf("model %q in group %q not found", mn, g.Name) }
		}
	}
	return nil
}

func FindProvider(models []ProviderConfig, model string) *ProviderConfig {
	for i := range models {
		if models[i].CustomModel == model { return &models[i] }
	}
	return nil
}
```

- [ ] **Step 5: 验证并提交**

```bash
go test ./internal/config -v
git add internal/config && git commit -m "feat(config): types, load/validate, legacy array support"
```

---

## Task 3: 配置保存、API Key 引用与纯函数操作

**Files:**
- Create: `internal/config/{save,apikey,operations,context}.go` + 对应 `_test.go`

**Interfaces:**
- Produces:
  - `config.SaveConfig(cfg *ProxyConfig, path string) error`
  - `config.MaskAPIKey(key string) string`, `config.IsAPIKeyRef(s string) bool`, `config.GetAPIKeyRefName(s string) string`, `config.ResolveAPIKey(s string, keys []ApiKey) (string, error)`
  - `config.RemoveModelFromConfig(cfg *ProxyConfig, name string) (*ProxyConfig, error)`, `RenameModelInConfig`, `RemoveModelGroupFromConfig`, `RenameAPIKeyRefInConfig`, `RemoveAPIKeyRefFromConfig`
  - `config.ConfigContext{ConfigDir, ConfigPath, LogDir, DetailLogDir, PIDFile}`, `config.CreateConfigContext(dir string) ConfigContext`

- [ ] **Step 1: 写失败测试**

```go
package config

import (
	"strings"
	"testing"
)

func TestResolveAPIKey(t *testing.T) {
	keys := []ApiKey{{Name: "main", Key: "sk-real"}}
	got, err := ResolveAPIKey("$$main$$", keys)
	if err != nil || got != "sk-real" { t.Fatalf("got %q, err %v", got, err) }
	if got, _ := ResolveAPIKey("sk-direct", keys); got != "sk-direct" { t.Fatal(got) }
	if _, err := ResolveAPIKey("$$missing$$", keys); err == nil { t.Fatal("expected error") }
}

func TestRemoveModelCascades(t *testing.T) {
	cfg := &ProxyConfig{
		Models: []ProviderConfig{{CustomModel: "a"}, {CustomModel: "b"}},
		ModelGroups: []ModelGroup{{Name: "g", Models: []string{"a", "b"}}, {Name: "only", Models: []string{"a"}}},
		UserApiKeys: []UserApiKey{{Name: "u", AllowedModels: []string{"a"}}},
	}
	out, err := RemoveModelFromConfig(cfg, "a")
	if err != nil { t.Fatal(err) }
	if len(out.Models) != 1 || out.Models[0].CustomModel != "b" { t.Fatalf("models: %+v", out.Models) }
	if len(out.ModelGroups) != 1 || out.ModelGroups[0].Name != "g" { t.Fatalf("groups: %+v", out.ModelGroups) }
	if out.UserApiKeys[0].AllowedModels != nil { t.Fatalf("allowedModels should be nil: %+v", out.UserApiKeys[0]) }
	if len(cfg.Models) != 2 { t.Fatal("input mutated") }
}

func TestRenameModelUpdatesGroups(t *testing.T) {
	cfg := &ProxyConfig{ModelGroups: []ModelGroup{{Name: "g", Models: []string{"a", "b"}}}}
	out := RenameModelInConfig(cfg, "a", "z")
	if out.ModelGroups[0].Models[0] != "z" { t.Fatalf("got %+v", out.ModelGroups[0]) }
	if cfg.ModelGroups[0].Models[0] != "a" { t.Fatal("input mutated") }
}

func TestMaskAPIKeyAndCreateConfigContext(t *testing.T) {
	if got := MaskAPIKey("sk-123456"); got != "*****3456" { t.Fatal(got) }
	ctx := CreateConfigContext("/tmp/cfg")
	if !strings.HasSuffix(ctx.ConfigPath, "config.json") || !strings.HasSuffix(ctx.LogDir, "logs/proxy") { t.Fatalf("%+v", ctx) }
}
```

- [ ] **Step 2: 运行测试确认失败**

```bash
go test ./internal/config -run 'TestResolveAPIKey|TestRemoveModel|TestRename|TestMask' -v
```

- [ ] **Step 3: 实现 save.go**

```go
package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

func SaveConfig(cfg *ProxyConfig, path string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil { return err }
	MarkSelfWrite()
	b, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil { return err }
	return os.WriteFile(path, append(b, '\n'), 0600)
}
```

- [ ] **Step 4: 实现 apikey.go**

```go
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
	if m == nil { return "" }
	return m[1]
}

func ResolveAPIKey(s string, keys []ApiKey) (string, error) {
	name := GetAPIKeyRefName(s)
	if name == "" { return s, nil }
	for _, k := range keys {
		if k.Name == name { return k.Key, nil }
	}
	return "", fmt.Errorf("API Key reference $$%s$$ not found in saved API keys", name)
}

func MaskAPIKey(key string) string {
	if key == "" { return "*****" }
	if len(key) <= 4 { return "*****" + key }
	return "*****" + key[len(key)-4:]
}

func AddAPIKey(keys []ApiKey, name, key string) ([]ApiKey, ApiKey, error) {
	for _, k := range keys { if k.Name == name { return nil, ApiKey{}, fmt.Errorf("API Key name %q already exists", name) } }
	now := time.Now().UnixMilli()
	entry := ApiKey{ID: uuid.NewString(), Name: name, Key: key, CreatedAt: now, UpdatedAt: now}
	return append(keys, entry), entry, nil
}
```

> 注：`github.com/google/uuid` 需 `go get github.com/google/uuid`。

- [ ] **Step 5: 实现 operations.go**

```go
package config

import "fmt"

func RemoveModelFromConfig(cfg *ProxyConfig, name string) (*ProxyConfig, error) {
	found := false
	for _, m := range cfg.Models { if m.CustomModel == name { found = true; break } }
	if !found { return nil, fmt.Errorf("未找到模型：%s", name) }
	out := *cfg
	out.Models = make([]ProviderConfig, 0, len(cfg.Models))
	for _, m := range cfg.Models { if m.CustomModel != name { out.Models = append(out.Models, m) } }
	if cfg.ModelGroups != nil {
		out.ModelGroups = make([]ModelGroup, 0, len(cfg.ModelGroups))
		for _, g := range cfg.ModelGroups {
			ng := g
			ng.Models = nil
			for _, mn := range g.Models { if mn != name { ng.Models = append(ng.Models, mn) } }
			if len(ng.Models) > 0 { out.ModelGroups = append(out.ModelGroups, ng) }
		}
	}
	if cfg.UserApiKeys != nil {
		out.UserApiKeys = make([]UserApiKey, 0, len(cfg.UserApiKeys))
		for _, u := range cfg.UserApiKeys {
			nu := u
			changed := false
			filtered := make([]string, 0, len(u.AllowedModels))
			for _, mn := range u.AllowedModels {
				if mn == name { changed = true; continue }
				filtered = append(filtered, mn)
			}
			if changed {
				if len(filtered) > 0 { nu.AllowedModels = filtered } else { nu.AllowedModels = nil }
			}
			out.UserApiKeys = append(out.UserApiKeys, nu)
		}
	}
	return &out, nil
}

func RenameModelInConfig(cfg *ProxyConfig, old, newName string) *ProxyConfig {
	if old == newName || len(cfg.ModelGroups) == 0 { return cfg }
	out := *cfg
	out.ModelGroups = make([]ModelGroup, 0, len(cfg.ModelGroups))
	for _, g := range cfg.ModelGroups {
		ng := g
		ng.Models = make([]string, len(g.Models))
		copy(ng.Models, g.Models)
		for i, mn := range ng.Models { if mn == old { ng.Models[i] = newName } }
		out.ModelGroups = append(out.ModelGroups, ng)
	}
	return &out
}

func RemoveModelGroupFromConfig(cfg *ProxyConfig, name string) (*ProxyConfig, error) {
	found := false
	for _, g := range cfg.ModelGroups { if g.Name == name { found = true; break } }
	if !found { return nil, fmt.Errorf("未找到 Model Group：%s", name) }
	out := *cfg
	out.ModelGroups = make([]ModelGroup, 0, len(cfg.ModelGroups))
	for _, g := range cfg.ModelGroups { if g.Name != name { out.ModelGroups = append(out.ModelGroups, g) } }
	return &out, nil
}

func RenameAPIKeyRefInConfig(cfg *ProxyConfig, old, newName string) *ProxyConfig {
	if old == newName { return cfg }
	out := *cfg
	out.Models = make([]ProviderConfig, len(cfg.Models))
	copy(out.Models, cfg.Models)
	for i, m := range out.Models {
		if m.APIKey == "$$"+old+"$$" { out.Models[i].APIKey = "$$" + newName + "$$" }
	}
	return &out
}

func RemoveAPIKeyRefFromConfig(cfg *ProxyConfig, _ string) *ProxyConfig { return cfg }
```

- [ ] **Step 6: 实现 context.go**

```go
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
		ConfigDir: dir,
		ConfigPath: filepath.Join(dir, "config.json"),
		LogDir: filepath.Join(dir, "logs", "proxy"),
		DetailLogDir: filepath.Join(dir, "logs"),
		PIDFile: filepath.Join(dir, "llm-gateway.pid"),
	}
}
```

- [ ] **Step 7: 写 watcher（含自写抑制）与测试**

`internal/config/watcher.go`：用 `fsnotify`（`go get github.com/fsnotify/fsnotify`）监听 config 所在目录，Debounce 200ms，`MarkSelfWrite()` 记录时间，2s 窗口内忽略；解析失败保留旧配置并记日志；提供 `Stop()`。测试用临时目录 + 写文件 + 等待 channel 验证热加载触发与自写抑制。

- [ ] **Step 8: 验证并提交**

```bash
go test ./internal/config -race -v
git add internal/config go.mod go.sum && git commit -m "feat(config): save, apikey refs, pure operations, watcher"
```

---

## Task 3.5: 基础工具函数移植（`internal/util`）

**Files:**
- Create: `internal/util/{format,time,clientip,password,paths,streammetrics,openaifields}.go` + `_test.go`

**Interfaces:** 对齐原 `src/lib/` 中的纯函数工具：
- `util.FormatNumber(n *int64) string`, `FormatDuration(ms *int) string`, `FormatPct(value, total int) string`（原 `lib/format.ts`）
- `util.LocalDateToUTCRange(date, week, month string) (start, end int64, err error)`, `GetTodayDate/GetWeekStart/GetMonthStart`（原 `lib/time-utils.ts` + `period-utils.ts`）
- `util.ExtractClientIP(r *http.Request) string`（X-Forwarded-For → X-Real-IP → RemoteAddr，原 `lib/client-ip.ts`）
- `util.SHA256Password(password string) string`（原 `lib/password.ts`）
- `util.ResolvePaths(configDir string) (configPath, logDir, detailLogDir, pidFile string)`（原 `lib/paths.ts`，与 `config.CreateConfigContext` 合并或保留 shim）
- `util.CalculateStreamMetrics(firstTokenTime, lastTokenTime time.Time, completionTokens int) (ttftMs *int, tps *float64)`（原 `lib/stream-metrics.ts` + `stream-usage.ts`）
- `util.RepairToolParameters(body map[string]any)`（原 `lib/openai-chat-fields.ts` 中的 tool parameters 修复）
- `util.Version = "1.15.0"`（原 `lib/version.ts`）

每个函数有对应 `_test.go`，从源 `tests/lib/format.test.ts`、`time-utils.test.ts`、`client-ip.test.ts`、`stream-metrics.test.ts` 等迁移语义。

- [ ] **Step 1: 写失败测试 → 实现 → 验证 → 提交**

```bash
go test ./internal/util/... -race -v
git add internal/util && git commit -m "feat(util): format, time, clientip, password, stream metrics helpers"
```

---

## Task 4: 日志系统（`internal/logger`）

**Files:**
- Create: `internal/logger/{logger,detail,system}.go` + `_test.go`

**Interfaces:**
- Produces:
  - `logger.LogEntry` struct（对应原 TS `LogEntry` 全部字段）
  - `logger.NewLogger(logDir string, customFilename ...string) *Logger` + `(*Logger).Log(entry LogEntry) error` + `GetFilePath() string`
  - `logger.NewDetailLogger(logDir string, enabled bool) *DetailLogger` + `SetEnabled/IsEnabled/LogRequest/LogResponse`
  - `logger.NewSystemLogger(logDir string) *SystemLogger` + `Log(msg string)`

- [ ] **Step 1: 写测试（结构化日志写入 + detail 开关 + 系统日志）**

```go
package logger

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLoggerWritesJSONLine(t *testing.T) {
	dir := t.TempDir()
	l := NewLogger(dir, "test.log")
	err := l.Log(LogEntry{RequestID: "r1", CustomModel: "m", Endpoint: "/v1/chat/completions", StatusCode: 200})
	if err != nil { t.Fatal(err) }
	b, err := os.ReadFile(filepath.Join(dir, "test.log"))
	if err != nil { t.Fatal(err) }
	if !strings.Contains(string(b), `"requestId":"r1"`) { t.Fatalf("unexpected log: %s", b) }
}

func TestDetailLoggerRespectsEnabled(t *testing.T) {
	dir := t.TempDir()
	d := NewDetailLogger(dir, false)
	d.LogRequest("r1", map[string]any{"a": 1})
	if _, err := os.Stat(filepath.Join(dir, "r1_request.log")); !os.IsNotExist(err) { t.Fatal("should not write when disabled") }
	d.SetEnabled(true)
	d.LogRequest("r1", map[string]any{"a": 1})
	if _, err := os.Stat(filepath.Join(dir, "r1_request.log")); err != nil { t.Fatal(err) }
}
```

- [ ] **Step 2: 运行测试确认失败**，然后实现三个文件。

`logger.go`：`LogEntry` 字段含 `Timestamp, RequestID, ClientIP *string, CustomModel, RealModel, Provider, ModelGroup, ActualModel, TriedModels []TriedModel, Endpoint, Method, StatusCode, DurationMs, IsStreaming, PromptTokens, CompletionTokens, TotalTokens, CachedTokens, UserName, Error *LogError, ResponseMetadata string`。`Log()` 用 `os.OpenFile(O_APPEND|O_CREATE|O_WRONLY, 0600)` 写一行 JSON；文件名 `proxy-YYYY-MM-DD.log`（customFilename 优先）。

`detail.go`：`LogRequest/LogResponse` 写 `{requestId}_{stage}.log`，JSON indent；线程安全用 `sync.Mutex`。

`system.go`：写 `system.log`，格式 `timestamp message`。

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/logger -race -v
git add internal/logger && git commit -m "feat(logger): structured, detail, system loggers"
```

---

## Task 5: SQLite 存储、迁移与 RequestLogger

**Files:**
- Create: `internal/store/{manager,migrations,request_logger}.go`, `migrations/0001_create_requests.sql`（单文件，24 列 + 5 索引全部建表时创建，与原 `src/lib/schema.ts` 完全一致）+ `_test.go`

**Interfaces:**
- Produces:
  - `store.DatabaseManager` 单例：`store.GetDatabaseManager(dir string) *DatabaseManager`, `(*DatabaseManager).Initialize() error`, `GetDB() *sql.DB`, `Close()`, `CleanupOldRequests(days int) error`, `ResetForTest()`
  - `store.RequestLogEntry` struct（与日志字段对齐）
  - `store.RequestLogger` 单例：`store.GetRequestLogger(dm *DatabaseManager) *RequestLogger`, `Start()`, `Log(entry RequestLogEntry)`, `Stop()`, `ResetForTest()`
  - `store.RequestLogRow` 查询结果类型 + `store.QueryRequests(...)` 供 stats 使用

- [ ] **Step 1: 写迁移 SQL**

```sql
-- migrations/0001_create_requests.sql
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL UNIQUE,
  timestamp TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  user_name TEXT,
  custom_model TEXT,
  real_model TEXT,
  provider TEXT,
  model_group TEXT,
  actual_model TEXT,
  endpoint TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  is_streaming INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cached_tokens INTEGER,
  error_message TEXT,
  error_type TEXT,
  response_metadata TEXT
);
CREATE INDEX IF NOT EXISTS idx_timestamp ON requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_name ON requests(user_name);
CREATE INDEX IF NOT EXISTS idx_custom_model ON requests(custom_model);
CREATE INDEX IF NOT EXISTS idx_created_at ON requests(created_at);
```

> 注：原项目 schema.ts 已包含 `client_ip`、`ttft_ms`、`tps` 列，无需 ALTER 迁移。仅需这一个迁移文件。

- [ ] **Step 2: 写失败测试**

```go
package store

import (
	"path/filepath"
	"testing"
	"time"
)

func TestRequestLoggerBatchInsertAndDedup(t *testing.T) {
	ResetForTest()
	dir := t.TempDir()
	dm := GetDatabaseManager(dir)
	if err := dm.Initialize(); err != nil { t.Fatal(err) }
	rl := GetRequestLogger(dm)
	rl.Log(RequestLogEntry{RequestID: "r1", Endpoint: "/v1/messages", StatusCode: 200})
	rl.Log(RequestLogEntry{RequestID: "r1", Endpoint: "/v1/messages", StatusCode: 200, TTFTMs: intPtr(120)})
	rl.Log(RequestLogEntry{RequestID: "r2", Endpoint: "/v1/chat/completions", StatusCode: 500})
	rl.Stop() // flush
	var count int
	if err := dm.GetDB().QueryRow(`SELECT COUNT(*) FROM requests`).Scan(&count); err != nil { t.Fatal(err) }
	if count != 2 { t.Fatalf("expected 2 rows after dedup, got %d", count) }
	var ttft int
	if err := dm.GetDB().QueryRow(`SELECT ttft_ms FROM requests WHERE request_id='r1'`).Scan(&ttft); err != nil { t.Fatal(err) }
	if ttft != 120 { t.Fatalf("last write should win, got %d", ttft) }
}

func intPtr(i int) *int { return &i }
```

- [ ] **Step 3: 运行测试确认失败**，然后实现三个 Go 文件。

`manager.go`：单例 + `sync.Once` 风格（ResetForTest 清空），连接 `file:<path>?_pragma=journal_mode(WAL)&_pragma=synchronous(NORMAL)`，按顺序执行 migrations（`CREATE TABLE IF NOT EXISTS` + `ALTER` 忽略 duplicate column 错误），`schema_migrations` 表记录版本。

`request_logger.go`：字段 `queue []RequestLogEntry`、`mu sync.Mutex`、`ticker *time.Ticker`（100ms）、`maxQueue=500`；`Log` 满时丢最旧；`flush` 按 requestId 保留最后一条，事务批量 `INSERT OR IGNORE ... ON CONFLICT(request_id) DO UPDATE SET`（后者保证最后写入生效，与 TS 版 map 去重语义一致）；`Stop` 停 ticker 并 flush。

- [ ] **Step 4: 验证并提交**

```bash
go get modernc.org/sqlite
go test ./internal/store -race -v
git add internal/store migrations go.mod go.sum && git commit -m "feat(store): SQLite migrations, DatabaseManager, async RequestLogger"
```

---

## Task 6: Provider 工厂与 URL 构建

**Files:**
- Create: `internal/provider/{provider,base,openai,anthropic,response_api,factory,build_url_test}.go`

**Interfaces:**
- Produces:
  - `provider.Provider` interface: `BuildHeaders(apiKey string) map[string]string`, `GetEndpoint(path string) string`, `GetType() config.ProviderType`, `BuildURL(cfg *config.ProviderConfig, path string) string`
  - `provider.GetProvider(cfg *config.ProviderConfig) Provider`, `provider.BuildHeaders`, `provider.BuildURL`
  - `provider.UpstreamRequest{URL string, Headers map[string]string, Body any, Proxy string}`

- [ ] **Step 1: 写 URL 构建测试（4 种 baseUrl 形态、/v1 去重）**

```go
package provider

import (
	"testing"
	"github.com/kkito/llm-gatego/internal/config"
)

func TestBuildURLDeduplicatesV1(t *testing.T) {
	cases := []struct{ base, want string }{
		{"https://api.openai.com", "https://api.openai.com/v1/chat/completions"},
		{"https://api.openai.com/", "https://api.openai.com/v1/chat/completions"},
		{"https://api.openai.com/v1", "https://api.openai.com/v1/chat/completions"},
		{"https://api.openai.com/v1/", "https://api.openai.com/v1/chat/completions"},
	}
	for _, tc := range cases {
		cfg := &config.ProviderConfig{BaseURL: tc.base, Provider: config.ProviderOpenAI}
		got := BuildURL(cfg, "chat")
		if got != tc.want { t.Errorf("base=%q got %q want %q", tc.base, got, tc.want) }
	}
}
```

- [ ] **Step 2: 实现 `base.go`（BaseProvider.BuildURL 的尾斜杠与前缀去重）与三个具体 Provider + factory。**

`OpenAIProvider.BuildHeaders`: `Authorization: Bearer <key>`, `Content-Type: application/json`。
`AnthropicProvider.BuildHeaders`: `x-api-key: <key>`, `anthropic-version: 2023-06-01`, `Content-Type: application/json`。
`ResponseAPIProvider` 同 OpenAI，`GetEndpoint("responses")` 返回 `/v1/responses`。

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/provider -race -v
git add internal/provider && git commit -m "feat(provider): interfaces, URL builder, OpenAI/Anthropic/ResponseAPI"
```

---

## Task 7: 格式转换核心（canonical + router + chat/anthropic/responses）

> 源 converter 测试共 3,746 行 / 202 case（anthropic 2,613 行 136 case；responses 692 行 39 case；canonical 51 行 7 case；其余 390 行）。为保证语义级迁移，拆成 7a/7b/7c 三个子任务，各自独立测试+提交。

### Task 7a: canonical 类型 + router + chat 透传 + SSE parser + params

**Files:**
- Create: `internal/converter/{canonical,types,router,adapter_chat,adapter_anthropic,adapter_responses,sse_parser,params}.go` + `_test.go`（含从源 `tests/converters/` 迁移的 19 个测试文件的语义）

**Interfaces:**
- Produces:
  - `converter.FormatName` 常量 `chat/openai/anthropic/responses/response-api`
  - `converter.StreamConverter` interface: `Transform(chunk any) []any`, `Flush() []any`
  - `converter.FormatAdapter` interface: `Name() FormatName`, `ToChatRequest(any) (canonical.ChatRequest, error)`, `FromChatRequest(canonical.ChatRequest) (any, error)`, `ToChatResponse(any) (canonical.ChatResponse, error)`, `FromChatResponse(canonical.ChatResponse) (any, error)`, `CreateUpstreamStream() StreamConverter`, `CreateDownstreamStream() StreamConverter`
  - `converter.ResolveConverterChain(source, provider FormatName) (ChainPlan, error)`
  - `converter.ParseSSEStream(reader io.Reader) <-chan SSEEvent`（帧累积、多行 data、注释/心跳处理）

- [ ] **Step 1: 写失败测试（chain 归一化 + SSE parser + 请求/响应转换）**

```go
package converter

import "testing"

func TestResolveConverterChainPassthrough(t *testing.T) {
	p, err := ResolveConverterChain("openai", "chat")
	if err != nil { t.Fatal(err) }
	if !p.Passthrough { t.Fatal("expected passthrough for openai→chat") }
	p2, _ := ResolveConverterChain("response-api", "responses")
	if !p2.Passthrough { t.Fatal("expected passthrough for response-api→responses") }
	if _, err := ResolveConverterChain("bogus", "chat"); err == nil { t.Fatal("expected error") }
}
```

迁移源 `tests/converters/router.test.ts`、`sse-response-conversion.test.ts`、`canonical/`、`multimodal.test.ts` 的语义到 `internal/converter/{router,sse_parser,params,canonical}_test.go`。

- [ ] **Step 2: 实现 canonical 类型、chat adapter、router、SSE parser、deepMerge。**

`params.go`：`MergeModelParams(defaults map[string]any, body map[string]any) map[string]any` —— 深度递归合并，数组整体替换，用户参数优先（对齐 `params-merger.ts`）。

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/converter/... -race -v
git add internal/converter && git commit -m "feat(converter): canonical, router, SSE parser, params"
```

### Task 7b: Anthropic 转换器（136 case / 2,613 行）

**Files:** Create `internal/converter/anthropic/{request,response,stream,shared,finish_reason}_test.go`，对应实现文件同目录。

逐条迁移源 `tests/converters/anthropic/` 的 136 个 case：thinking/tool_use/input_json_delta/multimodal/finish_reason 映射/SSE 分片边界/flush 收尾。

- [ ] **Step 1: 写失败测试 → Step 2: 实现 → Step 3: `go test ./internal/converter/anthropic/... -race -v` → 提交**

```bash
git add internal/converter/anthropic && git commit -m "feat(converter): anthropic request/response/stream converters + 136 migrated cases"
```

### Task 7c: Responses 转换器（39 case / 692 行）

**Files:** Create `internal/converter/responses/{request,response,stream}_test.go`，对应实现文件同目录。

逐条迁移源 `tests/converters/responses/` 的 39 个 case，`response-api` 别名归一化。

- [ ] **Step 1: 写失败测试 → Step 2: 实现 → Step 3: `go test ./internal/converter/responses/... -race -v` → 提交**

```bash
git add internal/converter/responses && git commit -m "feat(converter): responses converters + 39 migrated cases"
```

---

## Task 8: 限流、计费、模型组 fallback 与参数合并

**Files:**
- Create: `internal/limiter/{cost,rate,usage,period}.go`, `internal/modelgroup/{resolver,error}.go` + `_test.go`

**Interfaces:**
- Produces:
  - `limiter.Pricing{InputPricePer1M, OutputPricePer1M, CachedPricePer1M float64}`, `limiter.CalculateCost(usage TokenUsage, p Pricing) float64`, `limiter.HasValidPricing(*Pricing) bool`
  - `limiter.RateLimiter`, `limiter.NewRateLimiter(logDir string)`, `CheckLimits(cfg *config.ProviderConfig) (LimitCheckResult, error)`, `RecordUsage(model string, entry logger.LogEntry, pricing *Pricing)`
  - `modelgroup.Resolver.ResolveModelGroup(groups []config.ModelGroup, name string, models []config.ProviderConfig) ([]string, error)`, `FindAvailableModel(names []string, models []config.ProviderConfig, logDir string) (AvailableModelResult, error)`, `ModelGroupExhaustedError`

- [ ] **Step 1: 写测试（成本计算、有效价格、组解析、全部超限）**

```go
package limiter

import "testing"

func TestCalculateCost(t *testing.T) {
	got := CalculateCost(TokenUsage{InputTokens: 1_000_000, OutputTokens: 500_000, CachedTokens: 200_000}, Pricing{1.0, 2.0, 0.5})
	if got != 2.1 { t.Fatalf("got %f", got) }
}
```

```go
package modelgroup

import (
	"testing"
	"github.com/kkito/llm-gatego/internal/config"
)

func TestResolveModelGroup(t *testing.T) {
	groups := []config.ModelGroup{{Name: "g", Models: []string{"a", "b"}}}
	models := []config.ProviderConfig{{CustomModel: "a"}, {CustomModel: "b"}}
	got, err := NewResolver().ResolveModelGroup(groups, "g", models)
	if err != nil || len(got) != 2 { t.Fatalf("got %v err %v", got, err) }
	if _, err := NewResolver().ResolveModelGroup(groups, "missing", models); err == nil { t.Fatal("expected error") }
}
```

- [ ] **Step 2: 实现 cost/period/usage/rate/resolver。**

`usage.go`：单例 `UsageTracker`（按 logDir 重置），`GetCounter(model)`，`EnsureLoaded(counter, period, periodValue, pricing) error`，`GetCurrentUsage(counter, limit) float64`，全部从 store SQLite 聚合（`SELECT ... WHERE created_at >= ? AND custom_model = ?`）。

`rate.go`：`CheckLimits` 对齐 TS：无 limits 直接通过；cost 限制无有效价格报错；`current >= max` 返回 exceeded + 格式化消息。`RecordUsage` 写入内存计数 + 由 RequestLogger 负责持久化（此处仅更新 sliding window 内存，重启后从 SQLite 恢复）。

`modelgroup/error.go`：`ModelGroupExhaustedError` 含 `TriedModels []TriedModel` 与 `Error()` 方法。

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/limiter/... ./internal/modelgroup/... -race -v
git add internal/limiter internal/modelgroup && git commit -m "feat(limiter): cost, usage, rate limits, model group fallback"
```

---

## Task 9: 拦截器链与 8 个拦截器

**Files:**
- Create: `internal/interceptor/{types,manager,billing,cache,normalize,ttl,claude,opencode,qwen,user_access}.go` + `_test.go`

**Interfaces:**
- Produces:
  - `interceptor.Context{Provider *config.ProviderConfig, CurrentUser *config.UserApiKey, ClientIP *string, RequestID, CustomModel string, ModelGroup *string, Stream bool}` （请求上下文由 proxy 层填充）
  - `interceptor.Interceptor func(ctx context.Context, upstream *provider.UpstreamRequest, ictx *Context) (*provider.UpstreamRequest, error)`
  - `interceptor.Manager`: `Use(Interceptor)`, `Execute(ctx, upstream, ictx) (*UpstreamRequest, error)`, `Clear()`
  - `interceptor.NewDefaultManager() *Manager` 按固定顺序注册 8 个拦截器

- [ ] **Step 1: 写测试（注册顺序、链式传递、每个拦截器行为）**

```go
package interceptor

import (
	"context"
	"testing"
	"github.com/kkito/llm-gatego/internal/provider"
)

func TestManagerChainsInOrder(t *testing.T) {
	m := NewManager()
	var order []string
	m.Use(func(_ context.Context, u *provider.UpstreamRequest, _ *Context) (*provider.UpstreamRequest, error) {
		order = append(order, "first")
		u.Headers["x-first"] = "1"; return u, nil
	})
	m.Use(func(_ context.Context, u *provider.UpstreamRequest, _ *Context) (*provider.UpstreamRequest, error) {
		order = append(order, "second")
		if u.Headers["x-first"] != "1" { t.Fatal("chain ordering broken") }
		return u, nil
	})
	_, err := m.Execute(context.Background(), &provider.UpstreamRequest{Headers: map[string]string{}}, &Context{})
	if err != nil { t.Fatal(err) }
	if len(order) != 2 || order[0] != "first" || order[1] != "second" { t.Fatalf("%v", order) }
}
```

逐条迁移源 `tests/interceptor/*.test.ts`（10 文件、3488 行）的语义到对应 `_test.go`：billing header 清理、cache_control 规范化、TTL 注入、Claude Code 会话规范化、opencode session、qwen cache、user-model-access 403。

- [ ] **Step 2: 实现 8 个拦截器（纯函数风格，不修改入参，返回新 UpstreamRequest）。**

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/interceptor/... -race -v
git add internal/interceptor && git commit -m "feat(interceptor): manager and 8 ordered interceptors"
```

---

## Task 10: 隐私保护

**Files:**
- Create: `internal/privacy/{types,apply,strip_user,sanitizer,whitelist}.go` + `_test.go`

**Interfaces:**
- Produces:
  - `privacy.ApplyProtection(body map[string]any, settings config.PrivacySettings, requestID string) map[string]any`
  - `privacy.RestorePaths(body map[string]any, requestID string)` / `privacy.ClearPathMappings()`（测试）

- [ ] **Step 1: 写测试（白名单过滤 → stripUser → 路径脱敏/还原的端到端语义，对齐源 4 个测试文件）**

- [ ] **Step 2: 实现。**

`sanitizer.go`：全局 `map[string]map[string]string`（requestId → placeholder→real），支持 `/home/<u>/`、`/Users/<u>/`、`C:\Users\<u>\` 三种模式；`RestorePaths` 递归替换 JSON 中的占位符。

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/privacy/... -race -v
git add internal/privacy && git commit -m "feat(privacy): strip user, path sanitize/restore, whitelist"
```

---

## Task 11: 认证与统计 API

**Files:**
- Create: `internal/auth/{admin,user}.go`, `internal/stats/{aggregate,api}.go` + `_test.go`

**Interfaces:**
- Produces:
  - `auth.AdminSessions`: `SetSession(id)`, `ClearSession(id)`, `HasSession(id) bool`, `IsPasswordConfigured(cfg *config.ProxyConfig) bool`
  - `auth.UserAuth`: `LoginUserSession(apiKey, configPath string) (string, error)`, `GetCurrentUser(r *http.Request, cfg *config.ProxyConfig) *config.UserApiKey`, `UserAuthMiddleware(configPath string, next http.Handler) http.Handler`
  - `stats.Aggregate(rows []store.RequestLogRow) StatsSummary`（按模型/用户/日期聚合、TTFT/TPS、token、费用）
  - `stats.RegisterRoutes(mux *http.ServeMux, configDir string)`

- [ ] **Step 1: 写测试（三种 session 来源、未配置认证放行、allowedModels、统计聚合）**

- [ ] **Step 2: 实现。**

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/auth/... ./internal/stats/... -race -v
git add internal/auth internal/stats && git commit -m "feat(auth,stats): admin/user auth and stats aggregation API"
```

---

## Task 12: 代理路由核心（chat/messages/responses 三路由）

**Files:**
- Create: `internal/proxy/{handler,upstream,fallback,response,stream,models,routes}.go` + `_test.go`（迁移源 `tests/routes/` 23 文件 7323 行语义）

**Interfaces:**
- Produces:
  - `proxy.NewHandler(cfgGetter func() *config.ProxyConfig, logger *logger.Logger, detail *logger.DetailLogger, timeout time.Duration, logDir string) http.Handler`
  - `proxy.BuildUpstreamRequest(ctx context.Context, provider *config.ProviderConfig, body map[string]any, stream bool, apiKeys []config.ApiKey, interceptors *interceptor.Manager, ictx *interceptor.Context) (*provider.UpstreamRequest, error)`
  - `proxy.SendUpstreamRequest(ctx context.Context, req *provider.UpstreamRequest, timeout time.Duration) (*http.Response, error)`
  - `proxy.RegisterRoutes(mux *http.ServeMux, deps Dependencies)` 注册全部代理+models+health 路由
  - 全部路由别名（对齐原 `src/server.ts`）：`/chat/completions` `/v1/chat/completions` `/v1/v1/chat/completions`；`/messages` `/v1/messages` `/v1/v1/messages`；`/responses` `/v1/responses`；`/models` `/v1/models`；`/health`
  - `proxy.Dependencies{ConfigGetter, Logger, DetailLogger, Timeout, LogDir, Interceptors}`

- [ ] **Step 1: 写测试（互斥校验、404、fallback、429、超时、转换路径、流式）**

```go
package proxy

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/interceptor"
	"github.com/kkito/llm-gatego/internal/logger"
)

func TestMissingModelAndModelGroupReturns400(t *testing.T) {
	cfg := &config.ProxyConfig{Models: []config.ProviderConfig{}}
	h := NewHandler(func() *config.ProxyConfig { return cfg }, logger.NewLogger(t.TempDir()), logger.NewDetailLogger(t.TempDir(), false), 300000, t.TempDir())
	req := httptest.NewRequest(http.MethodPost, "/v1/messages", strings.NewReader(`{}`))
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != 400 { t.Fatalf("got %d: %s", w.Code, w.Body.String()) }
}
```

- [ ] **Step 2: 实现流水线。**

`handler.go` 按 spec §4.2 的 12 步顺序；每个 endpoint（chat/messages/responses）调用同一流水线但用不同的 converter chain source（`chat`/`anthropic`/`responses`）。`stream.go` 实现 SSE 逐 chunk 转换 + TTFT/TPS 计算 + 唯一日志写入（用 `sync.Once` 保证）。`fallback.go` 使用 `modelgroup.Resolver`，429 映射。`upstream.go` 用 `net/http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyURL)}}` 支持 per-model proxy。

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/proxy/... -race -v
git add internal/proxy && git commit -m "feat(proxy): chat/messages/responses handlers, fallback, streaming"
```

---

## Task 12.5: Admin/User JSON API 路由（前端数据接口）

**Files:**
- Create: `internal/server/{admin_api,user_api}.go` + `_test.go`

**Interfaces:**
- 统一 envelope: `type Envelope[T any] struct { OK bool `json:"ok"`; Data *T `json:"data,omitempty"`; Error *APIError `json:"error,omitempty"` }`
- `admin_api.go` 注册 `/api/admin/*`：
  - models: GET/POST `/api/admin/models`, POST `/api/admin/models/delete/:model`, `/copy/:model`, `/move/:model`, `/toggle-hidden/:model`, `/test`, `/edit/:model`
  - model-groups: GET/POST `/api/admin/model-groups`, `/delete/:name`, `/edit/:name`, `/edit/:name/add-model`, `/remove-model`, `/move-model`, `/new`
  - limits: GET/POST `/api/admin/models/:model/limits`, `/add`, `/delete/:index`
  - users: GET/POST `/api/admin/users`, `/new`, `/edit/:name`, `/delete/:name`, `/toggle`, `/api`
  - api-keys: GET/POST `/api/admin/api-keys`, `/edit/:id`, `/delete/:id`
  - privacy: GET/POST `/api/admin/privacy`
  - announcement: GET/POST `/api/admin/announcement`
  - password: POST `/api/admin/password`
  - stats/usage: GET `/api/admin/api/stats`, `/api/admin/api/usage`
- `user_api.go` 注册 `/api/user/*`：login, logout, main(home), stats

所有路由调用 config 纯函数 + SaveConfig + onConfigChange（对齐原 `src/admin/routes/*.tsx` 与 `src/user/routes/*`）。

- [ ] **Step 1: 写测试（envelope 格式、鉴权、CRUD 级联、错误码） → 实现 → 验证 → 提交**

```bash
go test ./internal/server/... -race -v
git add internal/server && git commit -m "feat(server): admin/user JSON API routes"
```

---

## Task 13: HTTP Server 组装与中间件

**Files:**
- Create: `internal/server/{server,middleware,assets}.go` + `_test.go`

**Interfaces:**
- Produces:
  - `server.New(cfg *config.ProxyConfig, deps proxy.Dependencies, ctx config.ConfigContext, opts server.Options) http.Handler`
  - `server.Options{CLI Debug bool, TestEnv bool}`
  - `assets.go`: `//go:embed ../../web/dist/*` 的 FS 变量 + `/assets/*` handler

- [ ] **Step 1: 写测试（health、CORS、404、静态资源、admin 认证中间件位置、路由别名）**

- [ ] **Step 2: 实现。**

`server.go`：按源 `server.ts` 的注册顺序装配（CORS → 全局日志 → health → 静态 → user login/logout/stats → user auth → proxy routes → admin auth → admin API/页面）；`currentConfig` 变量 + getter 闭包实现热更新；`onConfigChange` 回调。`middleware.go`：CORS、请求日志、client IP（`X-Forwarded-For` → `X-Real-IP` → RemoteAddr）。

- [ ] **Step 3: 验证并提交**

```bash
go test ./internal/server/... -race -v
git add internal/server && git commit -m "feat(server): HTTP assembly, middleware, embedded assets"
```

---

## Task 14: CLI 完善（start / stop / daemon / config-dir）

**Files:**
- Modify: `cmd/llm-gatego/main.go`
- Create: `cmd/llm-gatego/daemon.go`, `cmd/llm-gatego/stats.go` + `_test.go`

**Interfaces:**
- Consumes: `config.LoadFullConfig`, `config.CreateConfigContext`, `server.New`, `store.DatabaseManager`, `stats.Aggregate`
- Produces: `run(args []string) error` 可测试入口；start flags: `-C/-config-dir`（默认 `~/.llm-gateway/`）、`-p/-port`（默认 **4000**）、`-t/-timeout`（默认 300000ms）、`-D/-daemon`、`--stop`、`--debug`、`-version`；**`stats` 子命令**：`-C`、`--date YYYY-MM-DD`、`--week YYYY-Www`、`--month YYYY-MM`、`--by-hour`、`--json`，输出模型/供应商维度请求数、成功/失败、token 统计、按时/按日分布。

- [ ] **Step 1: 写测试（参数解析、pidfile 检测与陈旧清理、stop 信号流程）**

- [ ] **Step 2: 实现 daemon 逻辑（os.StartProcess 自重启带 -daemon-child 内部标记、pidfile 写入/检查、父进程等端口就绪）。**

- [ ] **Step 3: 验证并提交**

```bash
go test ./cmd/... -race -v
go run ./cmd/llm-gatego -version
git add cmd && git commit -m "feat(cli): start/stop/daemon/pidfile"
```

---

## Task 15: Web 前端组件（TS WebComponents + vitest）

**Files:**
- Create: `web/tsconfig.json`, `web/vitest.config.mjs`, `web/src/{api,gw-card,gw-stat,gw-modal,gw-table,app}.ts`, `web/src/pages/*.ts`（对应原 14 个 admin views + 3 个 user views + Layout/TopbarNav/JsonEditor 组件）, `web/tests/*.test.ts`, `web/index.html`, `web/style.css`, `scripts/build_web.cjs`

**Interfaces:**
- Consumes: 后端 JSON API `/api/admin/*`（models CRUD+copy+move+toggle-hidden+test、model-groups CRUD+add/remove/move-model、limits add/delete、users CRUD+toggle、api-keys CRUD、privacy、announcement、password、stats、usage）与 `/api/user/*`（home/stats/login/logout），返回 `{ok,data,error}` envelope
- Produces: `web/dist/gw-web.js`（IIFE 全局 `GwWeb`），由 Go embed 内嵌；每个组件/渲染模块有 vitest 测试。

- [ ] **Step 1: 写 api.ts 与失败测试**

```ts
// web/src/api.ts
export interface ApiEnvelope<T = unknown> { ok: boolean; data?: T; error?: { message?: string } }
export async function api<T = unknown>(path: string, opts?: RequestInit): Promise<ApiEnvelope<T>> {
  const r = await fetch(path, opts);
  const j = await r.json() as ApiEnvelope<T>;
  if (!j.ok) throw new Error(j.error?.message || 'HTTP ' + r.status);
  return j;
}
```

```ts
// web/tests/api.test.ts
import { describe, it, expect, vi } from 'vitest'
import { api } from '../src/api.js'
describe('api', () => {
  it('throws on error envelope', async () => {
    vi.stubGlobal('fetch', async () => ({ json: async () => ({ ok: false, error: { message: 'bad' } }) }))
    await expect(api('/x')).rejects.toThrow('bad')
  })
})
```

- [ ] **Step 2: 运行 `cd web && NODE_PATH=$(npm root -g) vitest run` 确认失败**，再实现各组件。

- [ ] **Step 3: 按 rybaproxy 模式实现 `gw-card`/`gw-stat`/`gw-modal`（shadow DOM + slots），每个有对应 test（customElements 定义、DOM 输出）。**

- [ ] **Step 4: 实现纯函数渲染模块（models/form/groups/limits/users/api-keys/stats/privacy/home/login）与对应测试（HTML 输出、事件绑定、错误/空态）。**

- [ ] **Step 5: 实现 app.ts（fetch 数据、事件委托、轮询），实现 index.html + style.css。**

- [ ] **Step 6: 实现 scripts/build_web.cjs（esbuild IIFE），运行验证产物。**

```js
// scripts/build_web.cjs
const esbuild = require('esbuild');
esbuild.buildSync({
  entryPoints: ['web/src/app.ts'], bundle: true, format: 'iife',
  globalName: 'GwWeb', outfile: 'web/dist/gw-web.js', target: 'es2020',
});
```

- [ ] **Step 7: 验证并提交**

```bash
make web-test && make web-build
git add web scripts && git commit -m "feat(web): TS WebComponents, vitest tests, esbuild bundle"
```

---

## Task 16: E2E 测试与测试迁移对照表

**Files:**
- Create: `internal/e2e/{proxy,fallback,stream,admin,user,config,logging}_test.go`, `docs/test-migration-map.md`

**Interfaces:**
- Consumes: 全部内部包；mock 上游用 `httptest.NewServer`。

- [ ] **Step 1: 写 e2e（迁移源 19 个 e2e 测试文件的语义）**

覆盖：proxy 转发（含 `/v1/v1/*` 别名）、model group、rate limit、admin auth/API keys/model management（copy/move/toggle-hidden/delete cleanup）/model-groups/limits/users、user auth/home/model access、sqlite db init、client IP logging、stream 指标（TTFT/TPS）、default params、CLI stats 子命令输出。每个测试启动内存 SQLite + `httptest.Server` mock LLM API。

- [ ] **Step 2: 写 test-migration-map.md**

按源 `tests/` 的每个文件列一行：源文件路径 → 目标文件路径 → 覆盖的 test case 数/关键场景。统计总数应达到 1382 case 的语义覆盖。

- [ ] **Step 3: 全量验证并提交**

```bash
make test web-test
# Expected: 全部 PASS
git add internal/e2e docs/test-migration-map.md && git commit -m "test: e2e suite and migration map"
```

---

## Task 17: 文档内 Mermaid 图集

**Files:**
- Create: `docs/architecture.md`, `docs/uml-flows.md`, `docs/uml-sequences.md`, `docs/uml-classes.md`, `docs/data-model.md`

**Interfaces:** 纯文档，无代码接口。

- [ ] **Step 1: 写 `docs/architecture.md`**

包含 4 张 mermaid 图：系统上下文（`flowchart LR`）、顶层组件（`flowchart TD`，`subgraph` 分层）、运行时组件、部署（`flowchart TB` + configDir 目录树）。

- [ ] **Step 2: 写 `docs/uml-flows.md`**

7 张 `flowchart TD` + 2 张 `stateDiagram-v2`：请求生命周期、模型判定、fallback、限流、格式转换、SSE 处理、配置管理、请求生命周期状态、流转换器状态。每个决策分支都要标注（对齐 skill "no unlabeled decision branches"）。

- [ ] **Step 3: 写 `docs/uml-sequences.md`**

6 张 `sequenceDiagram`：单模型非流式、组 fallback（`alt`）、流式 SSE、admin 配置、user 鉴权、日志异步写。使用 `actor`/`participant`/`Note over`/`alt...else...end`。

- [ ] **Step 4: 写 `docs/uml-classes.md`**

4 张 `classDiagram`：配置域、转换域、运行域、持久化域。用 `<<interface>>`、`+field: type`、`+method()`, Mermaid 关系语法（实现 `<|..`、组合 `*--`、聚合 `o--`、依赖 `..>`）。

- [ ] **Step 5: 写 `docs/data-model.md`**

1 张 `erDiagram`：requests 表 24 列 + 类型 + 5 索引说明（与原 `schema.ts` 完全一致，单建表，无增量 ALTER）；加上迁移记录表。

- [ ] **Step 6: 验证 Mermaid 语法并提交**

逐文件检查所有 mermaid fenced blocks 可被 GitHub 渲染（无未闭合 `alt`/`subgraph`）。

```bash
git add docs && git commit -m "docs: inline Mermaid architecture, UML flows/sequences/classes, ER"
```

---

## Task 18: 终检与收尾

- [ ] **Step 1: 全量测试**

```bash
make all
# go test ./... -race, vitest run, go build — 全部 PASS
```

- [ ] **Step 2: 检查测试映射表无遗漏**

对照 `docs/test-migration-map.md`，确认源 133 个测试文件全部有对应行且标注了覆盖状态。

- [ ] **Step 3: 检查文档图完整**

确认 `docs/` 下 5 个文档共 20+ 张 mermaid 图，覆盖 spec §7 全部清单。

- [ ] **Step 4: 最终提交 + 版本 tag**

```bash
git add -A && git commit -m "release: llm-gatego 1.15.0 Go rewrite complete"
git tag v1.15.0
```
