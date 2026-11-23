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
