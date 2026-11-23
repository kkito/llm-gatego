# 测试迁移对照表

源文件：`llm-gateway/tests/*.test.ts`（118 个测试文件）。目标：Go `internal/*` 单测 + `web/tests/*.test.ts` + `internal/e2e`。

| 源测试文件 | 目标实现/测试 | 用例数 | 状态 |
|---|---|---:|---|
| `tests/admin/routes/heatmap.test.ts` | internal/server + web/tests（Task 12.5/15） | 4 | 语义对齐/已覆盖 |
| `tests/admin/routes/stats.test.ts` | internal/server + web/tests（Task 12.5/15） | 4 | 语义对齐/已覆盖 |
| `tests/admin/views/hour-tz.test.ts` | internal/server + web/tests（Task 12.5/15） | 9 | 语义对齐/已覆盖 |
| `tests/api-keys.test.ts` | internal/config（Task 2/3） | 7 | 语义对齐/已覆盖 |
| `tests/cli/start.test.ts` | cmd/llm-gatego（Task 14） | 3 | 语义对齐/已覆盖 |
| `tests/config-operations-apikey-refs.test.ts` | internal/config（Task 2/3） | 5 | 语义对齐/已覆盖 |
| `tests/config-operations.test.ts` | internal/config（Task 2/3） | 21 | 语义对齐/已覆盖 |
| `tests/config-uiSettings.test.ts` | internal/config（Task 2/3） | 3 | 语义对齐/已覆盖 |
| `tests/config.test.ts` | internal/config（Task 2/3） | 39 | 语义对齐/已覆盖 |
| `tests/converters.test.ts` | internal/converter（Task 7a） | 19 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/anthropic-to-openai-request.test.ts` | internal/converter（Task 7a/7b/7c） | 24 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/anthropic-to-openai-sse-parsing.test.ts` | internal/converter（Task 7a/7b/7c） | 10 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/anthropic-to-openai-stream-event.test.ts` | internal/converter（Task 7a/7b/7c） | 19 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/openai-to-anthropic-request.test.ts` | internal/converter（Task 7a/7b/7c） | 19 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/openai-to-anthropic-response.test.ts` | internal/converter（Task 7a/7b/7c） | 4 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/openai-to-anthropic-sse-parsing.test.ts` | internal/converter（Task 7a/7b/7c） | 6 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/openai-to-anthropic-stream-event.test.ts` | internal/converter（Task 7a/7b/7c） | 11 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/openai-to-anthropic-stream-text.test.ts` | internal/converter（Task 7a/7b/7c） | 3 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/openai-to-anthropic-stream-thinking.test.ts` | internal/converter（Task 7a/7b/7c） | 10 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/request-conversion.test.ts` | internal/converter（Task 7a/7b/7c） | 2 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/shared/finish-reason.test.ts` | internal/converter（Task 7a/7b/7c） | 13 | 语义对齐/已覆盖 |
| `tests/converters/anthropic/shared/sse-parser.test.ts` | internal/converter（Task 7a/7b/7c） | 15 | 语义对齐/已覆盖 |
| `tests/converters/canonical/tools.test.ts` | internal/converter（Task 7a/7b/7c） | 7 | 语义对齐/已覆盖 |
| `tests/converters/multimodal.test.ts` | internal/converter（Task 7a） | 7 | 语义对齐/已覆盖 |
| `tests/converters/responses/request.test.ts` | internal/converter（Task 7a/7b/7c） | 19 | 语义对齐/已覆盖 |
| `tests/converters/responses/response.test.ts` | internal/converter（Task 7a/7b/7c） | 8 | 语义对齐/已覆盖 |
| `tests/converters/responses/stream.test.ts` | internal/converter（Task 7a/7b/7c） | 12 | 语义对齐/已覆盖 |
| `tests/converters/router.test.ts` | internal/converter（Task 7a） | 6 | 语义对齐/已覆盖 |
| `tests/converters/sse-response-conversion.test.ts` | internal/converter（Task 7a） | 7 | 语义对齐/已覆盖 |
| `tests/e2e/admin-api-keys.e2e.test.ts` | internal/e2e（Task 16） | 10 | 语义对齐/已覆盖 |
| `tests/e2e/admin-auth.e2e.test.ts` | internal/e2e（Task 16） | 34 | 语义对齐/已覆盖 |
| `tests/e2e/admin-model-delete-cleanup.e2e.test.ts` | internal/e2e（Task 16） | 5 | 语义对齐/已覆盖 |
| `tests/e2e/admin-model-group-form.e2e.test.ts` | internal/e2e（Task 16） | 24 | 语义对齐/已覆盖 |
| `tests/e2e/admin-model-limit.e2e.test.ts` | internal/e2e（Task 16） | 11 | 语义对齐/已覆盖 |
| `tests/e2e/admin-model-management.e2e.test.ts` | internal/e2e（Task 16） | 11 | 语义对齐/已覆盖 |
| `tests/e2e/admin-model-test.e2e.test.ts` | internal/e2e（Task 16） | 12 | 语义对齐/已覆盖 |
| `tests/e2e/admin-models-edit-limit-bug.e2e.test.ts` | internal/e2e（Task 16） | 10 | 语义对齐/已覆盖 |
| `tests/e2e/admin-models-form.e2e.test.ts` | internal/e2e（Task 16） | 16 | 语义对齐/已覆盖 |
| `tests/e2e/admin-users.e2e.test.ts` | internal/e2e（Task 16） | 29 | 语义对齐/已覆盖 |
| `tests/e2e/default-params.e2e.test.ts` | internal/e2e（Task 16） | 5 | 语义对齐/已覆盖 |
| `tests/e2e/model-group.e2e.test.ts` | internal/e2e（Task 16） | 11 | 语义对齐/已覆盖 |
| `tests/e2e/proxy.e2e.test.ts` | internal/e2e（Task 16） | 5 | 语义对齐/已覆盖 |
| `tests/e2e/rate-limit.e2e.test.ts` | internal/e2e（Task 16） | 4 | 语义对齐/已覆盖 |
| `tests/e2e/sqlite-db-init.e2e.test.ts` | internal/e2e（Task 16） | 3 | 语义对齐/已覆盖 |
| `tests/e2e/user-auth-no-guest.e2e.test.ts` | internal/e2e（Task 16） | 7 | 语义对齐/已覆盖 |
| `tests/e2e/user-auth.e2e.test.ts` | internal/e2e（Task 16） | 13 | 语义对齐/已覆盖 |
| `tests/e2e/user-home.e2e.test.ts` | internal/e2e（Task 16） | 5 | 语义对齐/已覆盖 |
| `tests/e2e/user-model-access.e2e.test.ts` | internal/e2e（Task 16） | 5 | 语义对齐/已覆盖 |
| `tests/integration/proxy.test.ts` | internal/proxy + internal/e2e（Task 12/16） | 3 | 语义对齐/已覆盖 |
| `tests/integration/sqlite-logging.test.ts` | internal/proxy + internal/e2e（Task 12/16） | 3 | 语义对齐/已覆盖 |
| `tests/interceptor/anthropic-billing-cleaner.test.ts` | internal/interceptor（Task 9） | 45 | 语义对齐/已覆盖 |
| `tests/interceptor/cache-control-normalize.test.ts` | internal/interceptor（Task 9） | 14 | 语义对齐/已覆盖 |
| `tests/interceptor/claude-code-cache.test.ts` | internal/interceptor（Task 9） | 76 | 语义对齐/已覆盖 |
| `tests/interceptor/claude-code-normalize.test.ts` | internal/interceptor（Task 9） | 42 | 语义对齐/已覆盖 |
| `tests/interceptor/helpers.test.ts` | internal/interceptor（Task 9） | 13 | 语义对齐/已覆盖 |
| `tests/interceptor/index.test.ts` | internal/interceptor（Task 9） | 9 | 语义对齐/已覆盖 |
| `tests/interceptor/opencode-session.test.ts` | internal/interceptor（Task 9） | 27 | 语义对齐/已覆盖 |
| `tests/interceptor/qwen-cache.test.ts` | internal/interceptor（Task 9） | 22 | 语义对齐/已覆盖 |
| `tests/interceptor/ttl-management.test.ts` | internal/interceptor（Task 9） | 12 | 语义对齐/已覆盖 |
| `tests/interceptor/user-model-access.test.ts` | internal/interceptor（Task 9） | 9 | 语义对齐/已覆盖 |
| `tests/lib/apikey.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 6 | 语义对齐/已覆盖 |
| `tests/lib/client-ip.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 6 | 语义对齐/已覆盖 |
| `tests/lib/config-context.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 3 | 语义对齐/已覆盖 |
| `tests/lib/config-utils.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 14 | 语义对齐/已覆盖 |
| `tests/lib/config-watcher.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 4 | 语义对齐/已覆盖 |
| `tests/lib/cost-calculator.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 10 | 语义对齐/已覆盖 |
| `tests/lib/db.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 7 | 语义对齐/已覆盖 |
| `tests/lib/detail-logger.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 4 | 语义对齐/已覆盖 |
| `tests/lib/format.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 9 | 语义对齐/已覆盖 |
| `tests/lib/logger-client-ip.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 1 | 语义对齐/已覆盖 |
| `tests/lib/model-group-config.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 4 | 语义对齐/已覆盖 |
| `tests/lib/model-group-resolver.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 7 | 语义对齐/已覆盖 |
| `tests/lib/params-merger.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 8 | 语义对齐/已覆盖 |
| `tests/lib/paths.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 4 | 语义对齐/已覆盖 |
| `tests/lib/period-utils.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 11 | 语义对齐/已覆盖 |
| `tests/lib/rate-limiter.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 13 | 语义对齐/已覆盖 |
| `tests/lib/request-logger.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 8 | 语义对齐/已覆盖 |
| `tests/lib/schema.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 3 | 语义对齐/已覆盖 |
| `tests/lib/stream-metrics.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 5 | 语义对齐/已覆盖 |
| `tests/lib/system-logger.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 9 | 语义对齐/已覆盖 |
| `tests/lib/time-utils.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 24 | 语义对齐/已覆盖 |
| `tests/lib/usage-tracker-singleton.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 6 | 语义对齐/已覆盖 |
| `tests/lib/usage-tracker.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 14 | 语义对齐/已覆盖 |
| `tests/lib/version.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 5 | 语义对齐/已覆盖 |
| `tests/logger.test.ts` | internal/util + internal/logger + internal/store（Task 3.5/4/5） | 4 | 语义对齐/已覆盖 |
| `tests/privacy/apply.test.ts` | internal/privacy（Task 10） | 5 | 语义对齐/已覆盖 |
| `tests/privacy/sanitizer.test.ts` | internal/privacy（Task 10） | 11 | 语义对齐/已覆盖 |
| `tests/privacy/strip-user.test.ts` | internal/privacy（Task 10） | 3 | 语义对齐/已覆盖 |
| `tests/privacy/whitelist-filter.test.ts` | internal/privacy（Task 10） | 7 | 语义对齐/已覆盖 |
| `tests/providers/build-url.test.ts` | internal/provider（Task 6） | 14 | 语义对齐/已覆盖 |
| `tests/routes-alias.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 0 | 语义对齐/已覆盖 |
| `tests/routes.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 6 | 语义对齐/已覆盖 |
| `tests/routes/chat-completions-privacy.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 6 | 语义对齐/已覆盖 |
| `tests/routes/handler.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 17 | 语义对齐/已覆盖 |
| `tests/routes/messages-handler.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 17 | 语义对齐/已覆盖 |
| `tests/routes/messages-non-stream-handler.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 7 | 语义对齐/已覆盖 |
| `tests/routes/messages-stream-handler.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 14 | 语义对齐/已覆盖 |
| `tests/routes/messages-upstream-request.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 9 | 语义对齐/已覆盖 |
| `tests/routes/model-fallback.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 13 | 语义对齐/已覆盖 |
| `tests/routes/model-group-smart-detect.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 3 | 语义对齐/已覆盖 |
| `tests/routes/model-management.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 5 | 语义对齐/已覆盖 |
| `tests/routes/models.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 9 | 语义对齐/已覆盖 |
| `tests/routes/msg-fallback.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 15 | 语义对齐/已覆盖 |
| `tests/routes/msg-response.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 11 | 语义对齐/已覆盖 |
| `tests/routes/non-stream-handler.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 6 | 语义对齐/已覆盖 |
| `tests/routes/privacy.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 6 | 语义对齐/已覆盖 |
| `tests/routes/response-processor.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 14 | 语义对齐/已覆盖 |
| `tests/routes/responses-upstream-request.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 4 | 语义对齐/已覆盖 |
| `tests/routes/sse-passthrough.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 9 | 语义对齐/已覆盖 |
| `tests/routes/stream-handler.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 18 | 语义对齐/已覆盖 |
| `tests/routes/upstream-request.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 10 | 语义对齐/已覆盖 |
| `tests/routes/utils/sse-handlers-build-response.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 10 | 语义对齐/已覆盖 |
| `tests/routes/utils/sse-handlers-messages.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 12 | 语义对齐/已覆盖 |
| `tests/routes/utils/stream-usage.test.ts` | internal/proxy + internal/server（Task 12/12.5） | 18 | 语义对齐/已覆盖 |
| `tests/user/middleware/auth.test.ts` | internal/server + web/tests（Task 12.5/15） | 11 | 语义对齐/已覆盖 |
| `tests/user/routes/stats.test.ts` | internal/server + web/tests（Task 12.5/15） | 11 | 语义对齐/已覆盖 |
| `tests/user/views/format-token-cache-sum.test.ts` | internal/server + web/tests（Task 12.5/15） | 6 | 语义对齐/已覆盖 |
| `tests/user/views/stats-client-js.test.ts` | internal/server + web/tests（Task 12.5/15） | 8 | 语义对齐/已覆盖 |

总计：118 个测试文件，1315 个源用例。

> 注：Go 侧将 TS 参数化用例拆成独立 subtest，Go `testing` 子测试总数多于源 `it()` 数；此表按源文件逐行登记，覆盖所有测试文件。
>
> 原项目另有 67 个测试用例来自 `it.each`/动态生成（合计约 1382 个），其分支由表中对应文件的参数化 Go 测试与 Web 组件测试覆盖。
