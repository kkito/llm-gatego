# Web → Lit 迁移设计

日期：2026-11-24
分支：`lit-web-migration`

## 目标

把 `web/` 的渲染层完整迁移到 [Lit](https://lit.dev/)（Lit 3.x），**功能等价**：页面外观、交互、URL、后端 API、表单提交语义全部保持现状。不做 UI 重设计，不引入新路由库。

## 非目标

- 不改 Go 后端、API 接口、认证流程、embed 方式
- 不重构 `views/*.ts` 之外的业务逻辑
- 不引入 SPA 客户端路由；导航继续使用整页 `<a href>` / POST form

## 当前状态

- `web/src/admin.ts` 是唯一入口：按 `location.pathname` 匹配 `renderers`，得到完整 HTML 字符串后 `document.write`
- `web/src/views/*.ts`（18 个）生成完整 HTML 文档，含 `shell()` / `adminPage()` 文档壳
- `web/src/styles/*.ts`（12 个）导出 CSS 字符串，注入到 `<head><style>`
- 9 个页面有内联 `<script>`，部分使用全局函数（`window.sync` 等）
- 构建：`scripts/build_web.cjs` 用全局 esbuild 打包 `admin.ts` → `web/dist/assets/admin.js`，再复制到 `internal/server/dist/`
- 测试：vitest + happy-dom，5 个测试文件 / 36 个用例

## 方案

### 架构

```
index.html (文档壳 + 全局 CSS)
  └─ <gw-app>                   根组件，读 location.pathname 选页面
       ├─ <gw-shell>            共享 topbar/footer/layout
       └─ <gw-{page}-page>      18 个页面组件，各自 static styles
```

- `index.html` 只保留 `<div id="app">` / `<gw-app>` 和 `<script defer src="/assets/admin.js">`
- `admin.ts` 只做 `customElements.define` 和启动（保留 `startWhenReady`），不再 `document.write`
- 页面组件在 `render()` 里返回 Lit `html` 模板，数据获取在 `connectedCallback` / `firstUpdated` 中通过现有 `api.ts` 完成
- 路由信息从 `location.pathname` 和 `location.search` 读取，与原 `admin.ts` 一致；`"/"` 重定向到 `/admin/models` 的行为保持不变

### 样式（Lit 标准方案 / B1）

- 页面组件用 `static styles = css\`...\`` 封装自己的 CSS（Shadow DOM 隔离）
- 全局 `:root { --ui-*: ... }` CSS 变量和 `html/body` reset 保留在 `index.html` 的 `<style>` 中；CSS 自定义属性可穿透 Shadow DOM 边界被组件继承，这是 Lit 官方推荐的主题方案
- 现有跨组件全局选择器（如 `.ui-table th`、`body{...}`）按归属拆入对应页面组件或根组件，逐条对照原 CSS 验证视觉等价

### 内联脚本（混合策略 / C）

- 简单交互（删除/复制/移动确认、POST form 提交、toggle）→ 用 Lit 声明式事件（`@click`、`@change`）重写，移除全局函数
- 高风险复杂脚本（modelForm 的模型测试面板、jsonEditor、stats 热力图 tooltip、groupForm 的选中模型同步）→ 先把原逻辑搬入组件生命周期（`firstUpdated` / `updated`），保持行为一致，后续迭代再清理

### 数据层

- 复用 `web/src/api.ts`，不封装新的数据层
- 页面加载中/错误状态：原实现是同步 `document.write` 完整 HTML（无 loading 态），迁移后允许组件内有极短暂的空白到内容切换，但最终 DOM 必须等价

## 测试（A：保留意图，改写成 DOM 断言）

- `views.test.ts`：挂载对应 Lit 页面组件（stub fetch），断言 `shadowRoot.textContent` / 选择器命中，保留原有全部断言意图（如“模型管理”“heatmap-grid”“新增模型”）
- `viewScripts.test.ts`：内联脚本大多消失，改为测试 Lit 事件行为（点击删除 → confirm + form 提交、表单同步等）；删除不再适用的`new Function`语法检查
- `api.test.ts`：不变
- `bootstrap.test.ts`：保留，验证 `startWhenReady`
- `indexBootstrap.test.ts`：保留并强化——从真实 `index.html` 加载真实打包产物，覆盖所有路由，断言每页渲染非空白且含关键文字
- 所有断言仍以“最终用户看到什么”为准，不测 Lit 内部实现细节

## 验证方式

1. `make web-test`：全部测试通过
2. `make web-build`：esbuild 正确打包 Lit 依赖（bundle 中含 `lit` 运行时）
3. `go test ./...`：Go e2e 测试通过，确认后端/表单流程无回归
4. 浏览器实测 `/admin/models`、`/admin/models/new`、`/admin/stats`、`/user/main` 等关键页面

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| CSS 拆进 Shadow DOM 后视觉变化 | 对照原 CSS 逐条迁移；浏览器截图对比关键页面 |
| 内联脚本行为不等价 | 高风险脚本先原样搬入生命周期；e2e 覆盖表单流程 |
| esbuild 无法解析全局 lit | 添加本地 `web/package.json` 锁定依赖（lit/esbuild/vitest/happy-dom），或修改构建脚本的 `NODE_PATH` 解析 |
| happy-dom 对 Shadow DOM + Lit 支持不足 | 先做 spike 验证；必要时用 `jsdom` 或调整断言层级 |
| 页面数据加载的异步时序变化 | 测试中显式等待组件更新；冒烟测试加 `await` |

## 交付

完成后在 `lit-web-migration` 分支提交并推送（不合并到 main，除非用户另行指示）。
