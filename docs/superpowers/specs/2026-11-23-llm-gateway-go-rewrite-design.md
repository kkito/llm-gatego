# LLM Gateway → Go 全量重写设计 (llm-gatego)

日期：2026-11-23
状态：已与用户确认核心决策（全量 1:1 范围、SQLite-only 用量、标准库 CLI/HTTP、方案 A 架构）

## 1. 目标与范围

把 `/Users/kkito/proj/own/llm-gateway`（TypeScript / Hono / Node，v1.15.0，约 22k 行 src，133 个测试文件、约 1382 个 test case）在空目录 `/Users/kkito/proj/own/llm-gatego` 中用 Go 完整重写，包含：

1. CLI（start/stop/daemon/pidfile/version）+ HTTP 服务（三条代理路由、models、health）
2. 配置加载/校验/热重载、API Key 引用、级联清理纯函数
3. OpenAI ↔ Anthropic ↔ Responses 三种格式互转（含流式 SSE 有状态转换器）
4. Provider 工厂、限流/用量/计费、模型组 fallback、8 个拦截器、隐私保护
5. SQLite 持久化 + 异步批量 RequestLogger + migrations
6. Web 管理端与用户端：以 TypeScript WebComponents + vitest/happy-dom 单测组件，esbuild 打成一个 IIFE，由 Go `embed.FS` 内嵌进单二进制
7. 全部单元测试/集成测试/e2e 测试的语义级迁移

完成标准：`go test ./...` 与 `web/` 下 vitest 全绿；测试映射表无遗漏；UML 图组产出。

## 2. 已确认决策

| 决策点 | 选择 |
|---|---|
| 范围 | A：功能 1:1 全量移植（含前端） |
| 架构方案 | A：Go 单后端 `cmd/internal` 分层 + 独立 `web/` TS 组件目录（rybaproxy 模式） |
| 用量数据源 | A：统一 SQLite 查询，不保留读 JSON 日志文件的旧兼容路径 |
| CLI/HTTP 框架 | A：标准库 `flag` + `net/http` + `http.ServeMux`（Go 1.22+ method pattern） |

## 3. 目标目录结构

```
llm-gatego/
├── cmd/llm-gatego/            # main、flag 子命令、daemon/pidfile、信号处理
├── internal/
│   ├── config/                # ProxyConfig 类型、校验、load/save、API Key 引用、watch
│   ├── server/                # 路由组装、中间件、embed 静态资源、CORS/日志/notFound
│   ├── proxy/                 # chat/messages/responses handler、fallback、stream、response
│   ├── converter/             # canonical 类型、FormatAdapter 注册表、anthropic/responses 转换、SSE parser
│   ├── provider/              # Provider 接口、BaseProvider.buildUrl、OpenAI/Anthropic/ResponseAPI
│   ├── limiter/               # RateLimiter、UsageTracker、滑动窗口、cost calculator
│   ├── modelgroup/            # 组解析、findAvailableModel、ModelGroupExhaustedError
│   ├── interceptor/           # Manager + 8 个拦截器
│   ├── privacy/               # stripUser、路径脱敏/还原、白名单过滤
│   ├── store/                 # DatabaseManager、schema/migrations、RequestLogger
│   ├── stats/                 # 统计聚合 API（admin/usage）
│   ├── auth/                  # admin session、user API Key 中间件
│   ├── logger/                # 结构化 logger、detail logger、system logger
│   └── e2e/                   # httptest 端到端测试
├── web/                       # TS WebComponents + 纯函数渲染 + api.ts + vitest 测试
├── scripts/                   # build_web.cjs (esbuild)、gen go embed 辅助
├── migrations/                # SQL 迁移文件
├── docs/                      # UML HTML 图组 + specs/plans
├── Makefile                   # build / test / test-race / web-test / web-build
└── go.mod                     # 仅 modernc.org/sqlite 等极少数依赖
```

依赖方向（无环）：
`cmd → server → proxy → {converter, provider, limiter, modelgroup, interceptor, privacy, store, auth, stats} → config, logger`

## 4. 后端设计

### 4.1 配置域 (`internal/config`)

Go struct 与 TS interface 1:1 对应（JSON tags 同名）：
- `ProxyConfig{Models, ModelGroups, AdminPassword, ApiKeys, UserApiKeys, PrivacySettings, UiSettings, DetailLogEnabled}`
- `ProviderConfig` 含 customModel/realModel/apiKey/baseUrl/provider + limits/hidden/maxContextLength/defaultParams/proxy/价格三字段
- `ModelLimit`、`ApiKey`、`UserApiKey`、`ModelGroup`、`PrivacySettings`、`UiSettings`

函数映射：
- `loadConfig` / `loadFullConfig`（含旧格式数组兼容、默认值 200000、组名重复/模型引用校验）
- `saveConfig`（调用 watcher 的 markSelfWrite）
- `findProvider`、`update/deleteConfigEntry`、`add/update/delete/getApiKey`、`maskApiKey`、`getApiKeyOptions`
- `isApiKeyRef` / `getApiKeyRefName` / `resolveApiKey`（`$$name$$` 引用）
- `config-operations.ts` 的 4 个纯函数：`RemoveModelFromConfig`（级联清理 modelGroups/userApiKeys）、`RenameModelInConfig`、`RemoveModelGroupFromConfig`、`RenameApiKeyRefInConfig`，均返回新值不改入参
- `createConfigContext`（从单一 configDir 派生 configPath/logDir/detailLogDir/pidFile）
- `watchConfigFile`（fsnotify 或轮询，markSelfWrite 避免自写触发；测试可禁用）

### 4.2 代理路由 (`internal/proxy`)

`http.ServeMux` 模式注册：
- `POST /chat/completions`、`/v1/chat/completions`、`/v1/v1/chat/completions`（别名）
- `POST /messages`、`/v1/messages`、`/v1/v1/messages`
- `POST /responses`、`/v1/responses`
- `GET /models`、`/v1/models`
- `GET /health`

每个 handler 工厂接受 `ConfigGetter func() *ProxyConfig`（热更新）+ Logger + DetailLogger + timeout + logDir。
请求流水线（三个 endpoint 同构）：
1. 解析 JSON body；校验 model 与 model_group 互斥/必填
2. `detailLogger.logRequest`（隐私前原始副本）
3. 应用隐私保护
4. 模型组判定：`ModelGroupResolver.resolve` 或智能识别；`findAvailableModel` 限流筛选 + fallback 列表；全部超限 → 429 `ModelGroupExhaustedError`
5. 单模型：查表 → 404；`RateLimiter.checkLimits` → 429
6. `buildUpstreamRequest`：Key 引用解析 → `resolveConverterChain` → 格式转换/透传 → `mergeModelParams` → `buildHeaders/buildUrl` → tool parameters 修复 → `fetchWithProxy`（per-model proxy，用 `net/http.Transport.Proxy`）
7. `InterceptorManager.Execute`（顺序固定 8 个，见 4.5）
8. `sendUpstreamRequest`（timeout）
9. 响应：非流式 JSON 转换 + token 统计；流式有状态 `StreamConverter.transform/flush` 逐 chunk 转换并透传 SSE；TTFT/TPS 计算
10. 隐私路径还原
11. 日志：Logger + RequestLogger（唯一写入者，避免重复 INSERT）、`RecordUsage`
12. 错误映射：Timeout→504、组耗尽→429、Permission→403、其他→500

### 4.3 协议转换 (`internal/converter`)

- `canonical` 包：ChatRequest/ChatResponse/ChatStreamChunk/Tool 类型
- `FormatAdapter` 接口：`ToChatRequest/FromChatRequest/ToChatResponse/FromChatResponse/CreateUpstreamStream/CreateDownstreamStream`
- `StreamConverter`：`Transform(chunk any) []any`、`Flush() []any`（有状态，1 上游 chunk → 0..n 下游 chunk）
- 适配器：`chat`（透传）、`anthropic`、`responses`（`response-api` 别名归一化）
- `ResolveConverterChain(source, provider)` → `ChainPlan{Passthrough,...}`；未知格式报错
- SSE 解析：完整搬运 `sse-parser.ts` 的帧累积/边界逻辑及全部测试

### 4.4 Provider 与限流

- `Provider` 接口：`BuildHeaders(apiKey) map[string]string`、`GetEndpoint(path) string`、`GetType()`、`BuildUrl(config, path) string`
- `BaseProvider.BuildUrl`：尾斜杠归一 + `/v1` 前缀去重（覆盖 4 种 baseUrl 形态）；`DefaultProviderFactory.GetProvider`
- `RateLimiter.CheckLimits`：requests/input_tokens/cost × day/hours/week/month（滑动窗口）；cost 限制必须有完整价格配置
- `UsageTracker`：单例（logDir 变更自动重建 / ResetForTest），仅从 SQLite 聚合（已确认不做 JSON 日志扫描）
- `CalculateCost`、`HasValidPricing`、`PeriodUtils`（日/周/月/小时边界）
- `ModelGroupResolver.FindAvailableModel` 顺序探测，返回 triedModels 供 429/日志使用

### 4.5 拦截器（固定顺序，对齐 server.ts 注释）

1. anthropic-billing-cleaner（必须最先：清理 billing header + fingerprint 稳定）
2. claude-code-cache（4 个缓存子优化）
3. cache-control-normalize（分散标记 → 最后块）
4. ttl-management（注入 TTL）
5. claude-code-normalize（4 个规范化）
6. opencode-session
7. qwen-cache
8. user-model-access

`InterceptorManager` 支持 `Use`/`Execute`（链式，前一输出为后一输入）/`Clear`（测试）；拦截器不修改入参、返回新对象。

### 4.6 持久化 (`internal/store`)

- 驱动：`modernc.org/sqlite`（纯 Go，无 cgo），`database/sql`
- 迁移：`migrations/0000_create_requests.sql`（24 列 + 5 索引）、`0001_add_ttft_tps.sql`、`0002_add_client_ip.sql`；最小顺序 migrator 记录已执行版本；老库 "already exists" fallback
- `DatabaseManager`：单例、`Initialize`、`GetDB`、`Close`、`ResetForTest`、`CleanupOldRequests(90)`
- `RequestLogger`：100ms flush tick、500 队列上限（满则丢最旧并告警）、按 requestId 去重（map，最后一次写入生效）、`INSERT OR IGNORE`、批量事务、`Stop` 时 flush
- WAL + synchronous=NORMAL

### 4.7 认证与统计

- `admin/session`：内存 `map[string]struct{}`，Session 从 Cookie/Bearer/query 三种方式提取；`isPasswordConfigured`；login/password 路由豁免
- `user/auth`：userApiKey 认证，Bearer / x-api-key / `user_session` Cookie / query；`allowedModels` 由 interceptor 兜底；未配置 userApiKeys 时放行
- 统计 API：`/admin/api/stats`、`/admin/api/usage`、`/admin/users/api`、`/user/stats` 的 JSON 等价物；按日/周/月/模型/用户/客户端 IP 聚合，TTFT/TPS、token、缓存 token、费用

### 4.8 CLI (`cmd/llm-gatego`)

子命令/flag（对齐原 `cli/start.ts`）：`-config-dir/-C`、`-port`、`-timeout`、`-daemon`、`-stop`、`-debug`、`-version`。
daemon：fork 自身（或 `os.StartProcess`）、pidfile 检查（陈旧 pidfile 清理）、父进程等待就绪再返回、stdout/stderr 重定向日志文件；stop：SIGTERM → 等 3s → SIGKILL → 删 pidfile。
优雅退出：清理 flush ticker、关闭 DB、停止 watcher。

## 5. 前端设计 (`web/`，rybaproxy 模式)

- 工具链全局安装（vitest / happy-dom / esbuild / typescript），项目内不写 package.json、不提交 node_modules；`web/tsconfig.json` + `web/vitest.config.mjs`（happy-dom）
- `api.ts`：`api<T>(path, opts): Promise<{ok,data,error}>`、`unwrapPage<T>`，统一错误抛出
- WebComponents：`gw-card`、`gw-stat`、`gw-modal`、`gw-table`（shadow DOM / slots，参照 rybaproxy）
- 纯函数渲染模块：`models.ts`、`model-form.ts`、`model-groups.ts`、`limits.ts`、`users.ts`、`api-keys.ts`、`stats.ts`、`privacy.ts`、`home.ts`、`login.ts`（每个导出 `xxxRowHtml` 等纯函数 + 事件绑定辅助）
- `app.ts`：页面装配、fetch 数据、事件委托、轮询刷新；由 Go HTTP 服务静态托管（`/assets/gw-web.js`）
- 后端新增 JSON API：`/api/admin/*`（models/groups/limits/users/api-keys/privacy/announcement/stats）与 `/api/user/*`（home/stats/login/logout），返回统一 envelope
- 每个组件/渲染函数有对应 `web/tests/*.test.ts`，验证 customElements 注册、DOM 输出、事件行为、错误态

构建：`scripts/build_web.cjs`（esbuild → IIFE 全局 `GwWeb`）→ `go:embed` 进 `internal/server/assets.go`。

## 6. 测试迁移策略

- 源测试 133 文件 / 1382 case，按模块语义映射到 Go `_test.go` 或 web vitest 文件，维护 `docs/test-migration-map.md` 对照表（源路径 → 目标路径 → case 覆盖说明）
- 重点：converters（3746 行，含 SSE 状态机）、routes（7323 行）、e2e（6147 行）、interceptor（3488 行）逐条迁移，不以覆盖率数字替代语义对齐
- 测试分层：单元测试（每包 `_test.go`）/ 集成测试（`httptest.NewServer` + 临时 SQLite 文件）/ e2e（完整请求链 + mock 上游 HTTP 服务）/ web 组件测试（vitest + happy-dom）
- 所有单例提供 `ResetForTest`；测试间隔离临时目录；不依赖外部网络
- 完成标准命令：`make test`（go test ./... -race）、`make web-test`（NODE_PATH=$(npm root -g) vitest run）、`make web-build`（esbuild + 类型检查）

## 7. UML 图组（diagram-design skill 产出）

单图复杂度预算 9 节点/12 连线，完整 UML 必须拆分：
1. 组件/架构图：`cmd → server → proxy → 业务包 → config/store`，依赖方向
2. UML 类图（配置域）：ProxyConfig、ProviderConfig、ModelLimit、ApiKey、UserApiKey、ModelGroup
3. UML 类图（运行域）：Provider 接口族、FormatAdapter/StreamConverter、InterceptorManager、RateLimiter/UsageTracker、DatabaseManager/RequestLogger
4. 时序图：代理请求完整链路（含 model group fallback、流式分支）
5. 状态机图：流式转换器与请求生命周期状态
6. ER 图：SQLite requests 表 + 索引

每张图为自包含 HTML（inline SVG、dark/light 主题、可移植），保存到 `docs/uml/`。生成前需按 skill 规则确认/定制 style guide（当前为默认皮肤，届时会询问用户）。

## 8. 实施阶段（供 writing-plans 细化）

1. 脚手架：`go.mod`、Makefile、`cmd` 入口、config 包 + 测试
2. 基础层：logger/store/migrations/RequestLogger + 测试
3. Provider + converter（含 SSE）+ 测试
4. limiter/modelgroup/interceptor/privacy + 测试
5. proxy 三路由 + server 组装 + 集成测试
6. auth/stats/admin API + e2e 测试
7. web TS 组件 + vitest + esbuild 内嵌
8. CLI daemon/patch 收尾 + e2e 全量
9. UML 图组 + 测试映射表终检

## 9. 明确不在范围内 / 已知差异

- 用量统计只读 SQLite，不读旧 JSON 日志（已确认）
- Web 页面从 Hono JSX SSR 改为 TS WebComponent SPA 风格（方案 A 的必然结果）
- 原 `dist/` 构建产物、pnpm 锁文件等不迁移
- 不实现新功能；原项目 TODO 中未完成项不纳入
