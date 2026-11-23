# 1:1 对齐缺口清单（持续更新）

原版：`llm-gateway` v1.15.0（25,570 行 src，118 个测试文件）。
目标：`llm-gatego` 完整 1:1。

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
