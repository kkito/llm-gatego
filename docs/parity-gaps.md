# Parity gaps (functional 1:1; pixel-level explicitly out of scope)

User decision (2026-11-23): functional parity only; do not chase pixel-perfect CSS.

## Functional status

- [x] Proxy routes, aliases, fallback, streaming, converter chains, 8 interceptors (269 cases), privacy (26 cases).
- [x] Config load/save/refs/watch, SQLite 24-col schema, CLI start/stop/daemon/stats, port 4000.
- [x] Admin/user JSON APIs: stats/usage/limits/announcement/model-test/password/privacy/groups/users/api-keys/user config+stats.
- [x] Original form POST aliases, login/password form handlers with cookies + 302 redirects.
- [x] Page-level admin/user auth redirects; setup/login text parity.
- [x] defaultParams deep merge; model-delete cleanup; 182-day zero-filled heatmap series.
- [x] Frontend TS renderers for all original admin/user pages and dynamic form routes; 51 vitest cases.
- [x] Page functionality: forms submit to APIs, model-test performs real upstream request, JSON editor, stats detail/pagination, user stats filters.
- [ ] Remaining functional gaps: exhaustive migration of original 118 test files / 1382 cases (especially e2e), exact error-message parity for some form validations, full user stats/home data fields if live comparison reveals differences.

## Historical (superseded) gap list

## A. 后端缺失/简化

- [ ] `/admin/api/stats` 完整响应（heatmap 182 天、model/user/daily、summary、tz）
- [ ] `/admin/api/usage`（UsageTracker 实时用量）
- [ ] `/admin/models/:model/limits` GET + limits/add + limits/delete
- [ ] `/admin/models/test`（上游连通测试）
- [ ] `/admin/announcement` GET/POST
- [ ] `/admin/password` GET/POST（含删除、校验）
- [ ] `/admin/privacy` GET/POST（含 detailLog、cliDebug）
- [ ] `/admin/users/api`、toggle、edit/new 完整校验
- [ ] `/admin/model-groups` edit/add-model/remove-model/move-model
- [ ] `/admin/api-keys` edit/delete 完整校验
- [ ] `/user/main`、`/user/stats`、home 配置数据
- [ ] CORS / client IP / auth middleware 细节对齐
- [ ] 模型复制/移动/隐藏后的配置清理与通知

## B. 前端缺失（原版 8,069 行 view + 组件）

- [ ] admin Layout / TopbarNav / JsonEditor
- [ ] admin views: announcement / api-keys / login / model-form / model-group-form /
      model-groups / model-limits / model-test / models / password /
      privacy-settings / stats / user-form / users（14 个）
- [ ] user Layout + home / login / stats（3 个）
- [ ] 原版样式（紫渐变、卡片、表格、中文文案、heatmap）
- [ ] 每个组件/页面 vitest 测试

## C. 测试真实性

- [ ] 修正 `docs/test-migration-map.md` 虚标状态
- [ ] 补齐 admin/user 视图与 e2e 用例

## Progress updates (P1/P2)
- [x] P1: API surface completed and committed (`af3584d`): stats, usage, limits, announcement, groups, users, keys, user config/stats.
- [x] P2 partial: original CSS extracted from all 17 view files into `web/src/styles/*.ts`; Chinese UI view renderers added for all 14 admin + 3 user views; shared TopbarNav layout; admin/user URL routing via shell + `admin.js`; 32 web tests.
- [ ] Remaining: full interactive parity (model-test execution, detail-log polling, heatmap timezone, pagination, form validation/messages), exact API response shapes for stats/user pages, and migration of original view/e2e tests beyond smoke-level.
- [x] P3: original form POST URLs aliased to Go JSON endpoints (`legacy_aliases.go`); full user stats aggregation implemented.
- [ ] Remaining P4: model-test UI execution, detail-log polling, pagination, exact form validation messages, and original view/e2e test migration.
- [x] P4 partial: model-form now includes original model-test UI calling `/admin/models/test`; stats API envelope aligned with frontend (`ok`+`success`).
- [ ] Remaining P5: stats detail log pagination, admin detail-log polling endpoint, exact timezone handling, and view/e2e test migration.
- [x] P5: stats detail log table + pagination in admin stats view/API.
- [ ] Remaining P6: admin detail-log polling endpoint, exact timezone/cookie handling, complete view/e2e test migration.
- [x] P6 partial: e2e legacy-form-alias + stats API test; view interaction tests (35 web tests total).
- [ ] Still open: exhaustive original view/e2e test migration, exact CSS class-by-class fidelity verification, timezone/cookie behavior.
- [x] P7: ported group-form/user-form/JsonEditor views; wired dynamic routes; DST-safe timezone ranges; user stats param names aligned; migrated 8 original view test files' semantics (50 web tests). Fixed real JS syntax bug in user home copy script.
- [ ] Still open: remaining original e2e/unit cases, exact CSS class-by-class fidelity, cookie/auth middleware details.
- [x] P8: defaultParams deep-merge (user wins, extra_body deep merge) implemented and e2e-tested; model-delete cleanup e2e migrated; DST test.
- [ ] Still open: remaining 15+ e2e files' cases, full admin auth/user auth e2e, exact CSS fidelity.
- [x] P9: page-level admin/user auth redirects (302 to login), auth-status API, login setup text parity, e2e test.
- [ ] Still open: remaining e2e/unit cases, exact CSS fidelity.
- [x] P10: added missing original CSS class hooks in stats/user-home/layout (navbar, heatmap legend/months, request-list, stats-table, pagination-info).
- [ ] Still open: exhaustive e2e/unit migration and pixel-level CSS verification.
- [x] P11: original form-login behavior (cookie + 302 redirect, first-time password setup, invalid password redirect) migrated and e2e-tested.
- [ ] Still open: exhaustive original test-suite migration, pixel-level CSS verification.
