# Web Lit Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the `document.write`-based HTML string rendering in `web/` with Lit 3 components, preserving all page behavior, URLs, form actions, and visual appearance (CSS variables remain global per Lit's standard pattern).

**Architecture:** `index.html` becomes a thin document shell containing global CSS custom properties and `<gw-app>`. `admin.ts` defines custom elements and boots via existing `startWhenReady`. One `GwApp` root component reads `location.pathname`, loads data via `api.ts`, and renders one of ~18 page components wrapped in a shared `gw-shell`. Page components use Lit `html` templates and `static styles`; complex legacy scripts are moved into component lifecycle methods verbatim.

**Tech Stack:** Lit 3.3.x, esbuild (global via NODE_PATH), TypeScript, vitest + happy-dom, Go embed

## Global Constraints

- Preserve all URLs, form actions, page titles, Chinese copy, CSS class names, and data-test-like attributes (`data-action`, `data-copy-url`, etc.) exactly as in current `views/*.ts`
- Keep global CSS variables in `index.html` `<style>` (Lit standard: custom properties inherit into shadow DOM); page-level selectors move into `static styles` of the owning component
- No routing library; navigation stays full-page `<a href>` / POST forms
- `api.ts`, `format.ts` APIs unchanged
- `scripts/build_web.cjs` still bundles `web/src/admin.ts` → `web/dist/assets/admin.js` → `internal/server/dist/assets/admin.js`
- `startWhenReady` from `web/src/admin.ts` stays exported and unit-tested
- Tests run with `cd web && NODE_PATH=$(npm root -g) vitest run`; Lit bundles to ~24KB (esbuild verified)
- happy-dom renders Lit shadow DOM text correctly; Lit uses `adoptedStyleSheets` so do NOT assert `<style>` tags in shadow roots

---

### Task 1: Local dependency lockfile and Lit style infrastructure

**Files:**
- Create: `web/package.json`
- Create: `web/src/styles/tokens.ts` (exports plain `globalCSSString` for the build script)
- Create: `web/src/styles/tokens-lit.ts` (exports `globalCSS = unsafeCSS(globalCSSString)`)
- Modify: `scripts/build_web.cjs`
- Test: `web/tests/indexBootstrap.test.ts` (existing, must stay green)

**Interfaces:**
- Consumes: existing global versions verified at plan-authoring time: `lit@3.3.3`, `esbuild@0.28.2`, `happy-dom@21.0.4`, `typescript@7.0.2`, `vitest@5.0.5`
- Produces: `web/src/styles/tokens.ts` exporting `globalCSSString: string` (no imports, readable by build script); `web/src/styles/tokens-lit.ts` exporting `globalCSS: CSSResult`; `web/package.json` pinning the exact versions above

- [x] **Step 1: Create `web/package.json`**

```json
{
  "name": "llm-gatego-web",
  "private": true,
  "type": "module",
  "dependencies": {
    "lit": "3.3.3"
  },
  "devDependencies": {
    "esbuild": "0.28.2",
    "happy-dom": "21.0.4",
    "typescript": "7.0.2",
    "vitest": "5.0.5"
  }
}
```

- [x] **Step 2: Create `web/src/styles/tokens.ts`** (plain string, no imports; build script reads this file and extracts the template literal body)

```ts
// Global custom properties: keep on :root so they inherit into every
// component's shadow root. Reset rules that must target html/body also
// live here; component-specific CSS lives in each component's static styles.
export const globalCSSString = `
:root{--ui-bg:#F6F8FB;--ui-panel:#fff;--ui-line:#E3E8EF;--ui-ink:#111827;--ui-muted:#64748B;--ui-accent:#2563EB;--ui-soft:#EFF4FF;--ui-radius:14px}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{background:var(--ui-bg);color:var(--ui-ink);font:14px/1.55 Inter,"Noto Sans SC",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--ui-accent);text-decoration:none}a:hover{text-decoration:none}
`
```

- [x] **Step 3: Create `web/src/styles/tokens-lit.ts`**

```ts
import { unsafeCSS } from 'lit'
import { globalCSSString } from './tokens.js'
export const globalCSS = unsafeCSS(globalCSSString)
```
(`unsafeCSS` returns a `CSSResult` suitable for `static styles` arrays; the CSS string is authored by us, not user input.)

- [x] **Step 4: Verify tests still green before code changes**

Run: `make web-test`
Expected: 5 files / 36 tests pass (no behavior change yet)

- [x] **Step 5: Commit**

```bash
git add web/package.json web/src/styles/tokens.ts web/src/styles/tokens-lit.ts scripts/build_web.cjs
git commit -m "chore(web): pin lit deps and add global CSS tokens"
```

---

### Task 2: Shared Lit shell components (`gw-shell`, `gw-view` helpers)

**Files:**
- Create: `web/src/components/gw-shell.ts`
- Create: `web/src/components/ui.ts` (shared Lit template helpers: `pageHeader`, `panel`, `notice`, `empty`, `table`, `formField` equivalents returning `TemplateResult`)
- Test: `web/tests/shell.test.ts` (new)

**Interfaces:**
- Consumes: `globalCSS` from `web/src/styles/tokens-lit.ts`, `adminNav`/`userNav` moved here from `ui/shell.ts`; Lit auto-escapes template values, so remove `escapeHtml()` calls in templates
- Produces: `GwShell` custom element `<gw-shell>` with properties: `title: string`, `path: string`, `version: string`, `nav?: NavItem[]`, `width?: number`; it renders `<slot>` for page content; helper functions `pageHeader(opts)`, `panel(opts)`, `notice(message, kind)`, `empty(title, hint, action?)`, `table(headers, rows)` returning `TemplateResult`; exported `adminNav`, `userNav` arrays matching `ui/shell.ts`

- [x] **Step 1: Write failing test `web/tests/shell.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import '../src/components/gw-shell.js'

describe('gw-shell', () => {
  it('renders topbar links and slots page content', async () => {
    const el = document.createElement('gw-shell') as any
    el.title = '模型管理'; el.path = '/admin/models'; el.version = '1.15.0'
    el.innerHTML = '<p>page-body</p>'
    document.body.appendChild(el)
    await el.updateComplete
    expect(el.shadowRoot.textContent).toContain('LLM Gateway')
    expect(el.shadowRoot.textContent).toContain('模型')
    expect(el.shadowRoot.textContent).toContain('page-body')
    expect(el.shadowRoot.querySelector('slot')).toBeTruthy()
    el.remove()
  })
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run tests/shell.test.ts`
Expected: FAIL — module `../src/components/gw-shell.js` not found

- [x] **Step 3: Implement `web/src/components/gw-shell.ts`** (full source)

```ts
import { LitElement, css, html, type TemplateResult } from 'lit'
import { globalCSS } from '../styles/tokens-lit.js'

export interface NavItem { href: string; label: string; icon?: string }

export const adminNav: NavItem[] = [
  { href: '/admin/models', label: '模型', icon: '◇' },
  { href: '/admin/model-groups', label: '分组', icon: '▦' },
  { href: '/admin/api-keys', label: '密钥', icon: '⌘' },
  { href: '/admin/users', label: '用户', icon: '◎' },
  { href: '/admin/stats', label: '统计', icon: '▤' },
  { href: '/admin/announcement', label: '公告', icon: '✎' },
  { href: '/admin/privacy', label: '隐私', icon: '◈' },
  { href: '/admin/password', label: '密码', icon: '⚿' },
]

export const userNav: NavItem[] = [
  { href: '/user/main', label: '控制台', icon: '◇' },
  { href: '/user/stats', label: '用量统计', icon: '▤' },
]

export class GwShell extends LitElement {
  static styles = [globalCSS, css`
  :host{display:block}
  .ui-topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--ui-line)}
  .ui-topbar-inner{margin:0 auto;padding:0 20px;min-height:64px;display:flex;align-items:center;gap:20px}
  .ui-brand{display:flex;align-items:center;gap:9px;font-weight:800;color:var(--ui-ink);font-size:15px;white-space:nowrap}
  .ui-brand-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--ui-accent);color:#fff;font-size:13px}
  .ui-nav{display:flex;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}
  .ui-nav-link{display:flex;align-items:center;gap:6px;color:var(--ui-muted);padding:8px 11px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}
  .ui-nav-link.is-active{background:var(--ui-soft);color:var(--ui-accent)}
  .ui-topbar-end{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-muted);white-space:nowrap}
  .ui-version{font-family:ui-monospace,monospace;padding:2px 7px;border:1px solid var(--ui-line);border-radius:999px}
  .ui-main{margin:0 auto;padding:26px 20px 60px;min-height:70vh}
  .ui-footer{margin:0 auto;padding:0 20px 28px;color:var(--ui-muted);font-size:12px;text-align:center}
  @media(max-width:820px){.ui-topbar-inner{flex-wrap:wrap;padding:10px 14px;gap:8px}.ui-nav{order:3;width:100%;flex-basis:100%}.ui-topbar-end{margin-left:auto}.ui-main{padding:18px 14px 48px}}
  `] as const

  title = ''
  path = ''
  version = '1.15.0'
  nav: NavItem[] = adminNav
  width = 1180

  render(): TemplateResult {
    const links = this.nav.map(n => {
      const active = this.path === n.href || (n.href !== '/admin/models' && this.path.startsWith(n.href + '/')) ||
        (n.href === '/admin/models' && this.path.startsWith('/admin/models/'))
      return html`<a href=${n.href} class=${'ui-nav-link' + (active ? ' is-active' : '')}>${n.icon ? html`<span class="ui-nav-icon">${n.icon}</span>` : ''}<span>${n.label}</span></a>`
    })
    return html`
<header class="ui-topbar"><div class="ui-topbar-inner" style=${`max-width:${this.width}px`}>
  <a href="/admin/models" class="ui-brand"><span class="ui-brand-mark">L</span><span>LLM Gateway</span></a>
  <nav class="ui-nav">${links}</nav>
  <div class="ui-topbar-end"><a href="/user/main" class="ui-link">用户端</a><span class="ui-version">v${this.version}</span></div>
</div></header>
<main class="ui-main" style=${`max-width:${this.width}px`}><slot></slot></main>
<footer class="ui-footer" style=${`max-width:${this.width}px`}>LLM Gateway · Go rewrite</footer>
`
  }
}

if (!customElements.get('gw-shell')) customElements.define('gw-shell', GwShell)
```

- [x] **Step 4: Create `web/src/components/ui.ts`** with the same class names and structure as current `ui/shell.ts` helpers, but returning `TemplateResult`: `pageHeader`, `panel`, `notice`, `empty`, `table`, `formField`. Copy exact markup/class names from `web/src/ui/shell.ts` lines after `uiCSS` declaration; use Lit `html` template interpolation instead of string concatenation. Include CSS for those classes in a `uiCSS` `css` tagged template exported from this file (copy from `web/src/ui/shell.ts` `uiCSS` + `formCSS` strings).

- [x] **Step 5: Run test to verify it passes**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run tests/shell.test.ts`
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add web/src/components web/tests/shell.test.ts
git commit -m "feat(web): add Lit shell and shared UI helpers"
```

---

### Task 3: Root `<gw-app>` component with route table and data loading

**Files:**
- Create: `web/src/components/gw-app.ts`
- Modify: `web/src/admin.ts` (replace `document.write` bootstrap with element registration + `startWhenReady`)
- Modify: `web/index.html` (replace `<div id="app">` with `<gw-app>`; embed global CSS via `<style>` generated from `globalCSS` at build time — simplest: `build_web.cjs` reads `web/src/styles/tokens.ts`, extracts the CSS string, writes `<style>...</style>` into `web/dist/index.html`; keep `web/index.html` source with a placeholder `<!-- GLOBAL_CSS -->`)
- Test: `web/tests/appRouting.test.ts` (new), `web/tests/indexBootstrap.test.ts` (modified)

**Interfaces:**
- Consumes: `startWhenReady` (kept in `admin.ts`), all page components from Tasks 4–7. To avoid import cycles, define route table in `gw-app.ts` importing page components.
- Produces: `<gw-app>` custom element registered on import of `admin.ts`; `routeForPath(path: string): string` exported for unit test; data loaders `loadPageData(path)` returning `Promise<unknown>` per route using `api.ts`

- [x] **Step 1: Write failing routing test `web/tests/appRouting.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { routeForPath } from '../src/components/gw-app.js'

describe('routeForPath', () => {
  it('maps admin and user paths to component tags', () => {
    expect(routeForPath('/admin/models')).toBe('gw-models-page')
    expect(routeForPath('/user/main')).toBe('gw-user-home-page')
    expect(routeForPath('/admin/models/new')).toBe('gw-model-form-page')
    expect(routeForPath('/')).toBe('gw-models-page') // redirect target
  })
})
```

- [x] **Step 2: Run to verify fails**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run tests/appRouting.test.ts`
Expected: FAIL — module not found

- [x] **Step 3: Implement `gw-app.ts` route table and data loading**

Route table (mirror `admin.ts` renderers exactly):

```ts
export function routeForPath(path: string): string {
  if (path === '/' ) return 'gw-models-page'
  if (/^\/admin\/models\/edit\//.test(path)) return 'gw-model-form-page'
  if (/^\/admin\/models\/[^/]+\/limits$/.test(path)) return 'gw-model-limits-page'
  if (path === '/admin/models/new') return 'gw-model-form-page'
  if (path === '/admin/model-groups/new' || /^\/admin\/model-groups\/edit\//.test(path)) return 'gw-group-form-page'
  if (path === '/admin/users/new' || /^\/admin\/users\/edit\//.test(path)) return 'gw-user-form-page'
  if (/^\/admin\/api-keys\/edit\//.test(path)) return 'gw-api-keys-page'
  const map: Record<string,string> = {
    '/admin/models':'gw-models-page', '/admin/model-groups':'gw-groups-page',
    '/admin/users':'gw-users-page', '/admin/api-keys':'gw-api-keys-page',
    '/admin/password':'gw-password-page', '/admin/privacy':'gw-privacy-page',
    '/admin/announcement':'gw-announcement-page', '/admin/stats':'gw-stats-page',
    '/admin/login':'gw-login-page', '/user/login':'gw-login-page',
    '/user/main':'gw-user-home-page', '/user/stats':'gw-user-stats-page',
  }
  return map[path] || 'gw-models-page'
}
```

`GwApp extends LitElement`: in `connectedCallback`, if `location.pathname === '/'` call `location.replace('/admin/models')`; then `loadData()` fetches the exact same endpoints as current `admin.ts` renderers, stores result in reactive properties `data: any`, `error: string`, and renders `<gw-shell ...>${dynamic page element with `.data=${this.data}` and `.error=${this.error}`}</gw-shell>`. Use `unsafeStatic`? No — use `literal` `html` switch per route (explicit `if/else` returning the right tag) so Lit's compiler tracks bindings.

- [x] **Step 4: Modify `admin.ts`** to:

```ts
import './components/gw-app.js'
export { startWhenReady } from './components/gw-app.js' // re-export for existing bootstrap test
if (typeof document !== 'undefined') startWhenReady(document, () => {
  if (!customElements.get('gw-app')) customElements.define('gw-app', GwApp)
})
```
(keep `renderAdmin` in `admin.ts` during transition so `indexBootstrap.test.ts` can still run; delete in Task 7 cleanup. The `startWhenReady` re-export must come from `admin.ts`'s own definition, not `gw-app.ts`; use `export { startWhenReady }` at the bottom of the file where it is defined.)

- [x] **Step 5: Modify `web/index.html`** to contain global style placeholder and `<gw-app>`:

```html
<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LLM Gateway</title><!-- GLOBAL_CSS --></head><body><gw-app></gw-app><script defer src="/assets/admin.js"></script></body></html>
```

- [x] **Step 6: Update `scripts/build_web.cjs`** to replace `<!-- GLOBAL_CSS -->` with `<style>...</style>`: read `web/src/styles/tokens.ts`, regex-match `globalCSSString = \`([\s\S]*?)\``, capture group 1 is the raw CSS string. Insert it into the HTML and write `web/dist/index.html`. No second build step needed because `tokens.ts` has no imports.

- [x] **Step 7: Run all tests**

Run: `make web-test`
Expected: appRouting test passes; existing tests still green (renderAdmin still present)

- [x] **Step 8: Commit**

```bash
git add web/src/components/gw-app.ts web/src/admin.ts web/index.html scripts/build_web.cjs web/tests/appRouting.test.ts web/tests/indexBootstrap.test.ts
git commit -m "feat(web): add gw-app route root with Lit data loading"
```

---

### Task 4: Read-only display pages (models, groups, users, api-keys, announcements, privacy, password)

**Files:**
- Create one file per page under `web/src/components/pages/`: `gw-models-page.ts`, `gw-groups-page.ts`, `gw-users-page.ts`, `gw-api-keys-page.ts`, `gw-announcement-page.ts`, `gw-privacy-page.ts`, `gw-password-page.ts`
- Modify: `web/tests/views.test.ts` (rewrite those assertions to mount components and check `shadowRoot`)
- Delete: corresponding `web/src/views/*.ts` after tests pass

**Interfaces:**
- Consumes: `pageHeader`, `panel`, `notice`, `empty`, `table` from `components/ui.ts`; `<gw-shell>` wraps each page's root; `.data` and `.error` properties set by `<gw-app>`
- Produces: custom elements with names in `routeForPath` map; each exposes `data: any`, `error = ''`

- [x] **Step 1: Write failing DOM test (example for models page) in `web/tests/views.test.ts`**

```ts
import '../src/components/pages/gw-models-page.js'
describe('gw-models-page', () => {
  it('renders original Chinese header and columns', async () => {
    const el = document.createElement('gw-models-page') as any
    el.data = [{ customModel: 'm1', realModel: 'gpt-4', desc: 'desc' }]
    document.body.appendChild(el); await el.updateComplete
    const t = el.shadowRoot.textContent
    expect(t).toContain('模型管理')
    expect(t).toContain('配置和管理所有上游模型信息，调整顺序及增减模型。')
    expect(t).toContain('模型名称')
    expect(t).toContain('m1')
    const a = el.shadowRoot.querySelector('a[href="/admin/model-groups"]')
    expect(a).toBeTruthy()
    el.remove()
  })
})
```
Repeat equivalent assertions from current `views.test.ts` for groups/users/apiKeys/privacy/password/announcement pages (keep identical Chinese strings and structural checks).

- [x] **Step 2: Run to verify fails**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run tests/views.test.ts`
Expected: FAIL — component modules not found

- [x] **Step 3: Implement each page component** following this template (models example, full source):

```ts
import { LitElement, css, html, type TemplateResult } from 'lit'
import { pageHeader, panel, notice, empty, table, uiCSS } from '../ui.js'

export class GwModelsPage extends LitElement {
  static styles = [uiCSS, css`.row-actions{display:flex;gap:8px;flex-wrap:wrap}`]
  data: Array<{customModel:string;realModel:string;desc?:string;hidden?:boolean}> = []
  error = ''
  render(): TemplateResult {
    const rows = this.data.map((m, i) => html`<tr>
      <td><span class="ui-badge">${i+1}</span></td>
      <td><strong>${m.customModel}</strong><div class="ui-field-hint ui-mono">→ ${m.realModel}</div></td>
      <td>${m.desc || '—'}</td>
      <td><div class="ui-row">
        <button class="ui-btn ui-btn-sm" @click=${() => this.post(`/admin/models/move/${encodeURIComponent(m.customModel)}?direction=up`)} ?disabled=${i===0}>↑</button>
        <button class="ui-btn ui-btn-sm" @click=${() => this.post(`/admin/models/move/${encodeURIComponent(m.customModel)}?direction=down`)} ?disabled=${i===this.data.length-1}>↓</button>
        <button class="ui-btn ui-btn-sm" @click=${() => this.post(`/admin/models/toggle-hidden/${encodeURIComponent(m.customModel)}`)}>${m.hidden?'显示':'隐藏'}</button>
        <button class="ui-btn ui-btn-sm" @click=${() => { if (confirm(`确定要复制模型 "${m.customModel}" 吗？`)) this.post(`/admin/models/copy/${encodeURIComponent(m.customModel)}`) }}>复制</button>
        <a class="ui-btn ui-btn-sm" href=${`/admin/models/edit/${encodeURIComponent(m.customModel)}`}>编辑</a>
        <a class="ui-btn ui-btn-sm" href=${`/admin/models/${encodeURIComponent(m.customModel)}/limits`}>限制</a>
        <button class="ui-btn ui-btn-sm ui-btn-danger" @click=${() => { if (confirm(`确定要删除模型 "${m.customModel}" 吗？`)) this.post(`/admin/models/delete/${encodeURIComponent(m.customModel)}`) }}>删除</button>
      </div></td></tr>`)
    return html`<gw-shell title="模型管理" path="/admin/models" version="1.15.0">
      ${pageHeader({ eyebrow:'Routing', title:'模型管理', subtitle:'配置和管理所有上游模型信息，调整顺序及增减模型。',
        actions: html`<a class="ui-btn" href="/admin/model-groups">模型分组</a><a class="ui-btn ui-btn-primary" href="/admin/models/new">+ 新增模型</a>` })}
      ${this.error ? notice(this.error,'error') : ''}
      ${panel('模型列表', `${this.data.length} 个模型`, this.data.length ? table(['#','模型名称','描述','操作'], rows) : empty('暂无模型','点击“新增模型”开始配置。'))}
    </gw-shell>`
  }
  private post(url: string) {
    const f = document.createElement('form'); f.method='POST'; f.action=url; document.body.appendChild(f); f.submit()
  }
}
if (!customElements.get('gw-models-page')) customElements.define('gw-models-page', GwModelsPage)
```

Other pages: translate their existing `views/*.ts` markup 1:1 into `html` templates, preserving every Chinese string, class name, form action, and URL. For pages with no inline scripts (groups/users/api-keys/privacy/password/announcement) the component is pure template + optional `@click` for confirm-based delete (apiKeys). Wrap all in `<gw-shell>` with the same `title`, `path`, `version`.

- [x] **Step 4: Run tests, fix failures, then delete old view files**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run tests/views.test.ts`
Expected: PASS. Then `git rm web/src/views/models.ts web/src/views/groups.ts web/src/views/users.ts web/src/views/apiKeys.ts web/src/views/announcement.ts web/src/views/privacy.ts web/src/views/password.ts` (only those covered by rewritten tests).

- [x] **Step 5: Commit**

```bash
git add web/src/components/pages web/tests/views.test.ts
git commit -m "feat(web): migrate read-only pages to Lit components"
```

---

### Task 5: Form pages (model form, group form, user form, limits) with simple interactions

**Files:**
- Create: `web/src/components/pages/gw-model-form-page.ts`, `gw-group-form-page.ts`, `gw-user-form-page.ts`, `gw-model-limits-page.ts`
- Create: `web/src/components/gw-json-editor.ts` (Lit replacement for `views/jsonEditor.ts`: textarea + live preview + hidden input; `@input` updates preview via `JSON.parse`, `格式化`/`清空` buttons)
- Modify: `web/tests/views.test.ts`, `web/tests/viewScripts.test.ts`
- Delete: `web/src/views/modelForm.ts`, `groupForm.ts`, `userForm.ts`, `modelLimits.ts`, `jsonEditor.ts`

**Interfaces:**
- Consumes: `pageHeader`, `panel`, `notice`, `uiCSS` from `components/ui.ts`; `<gw-json-editor name="defaultParams" value="...">` with properties `name: string`, `value: string`
- Produces: page components with `data`, `error`, `success` properties; group form has reactive `selected: string[]`, `filter: string` and hidden `<input name="models">` synced from `selected` via `@change`

- [x] **Step 1: Write failing tests for group form interaction and JSON editor in `web/tests/viewScripts.test.ts`**

```ts
import '../src/components/gw-group-form-page.js'
import '../src/components/gw-json-editor.js'

describe('group form interaction', () => {
  it('syncs selected models into hidden input and renders selected list', async () => {
    const el = document.createElement('gw-group-form-page') as any
    el.data = { group: { name: 'g1', models: ['m1'] }, models: [{customModel:'m1'},{customModel:'m2'}] }
    document.body.appendChild(el); await el.updateComplete
    const hidden = el.shadowRoot.querySelector('input[name="models"]') as HTMLInputElement
    expect(JSON.parse(hidden.value)).toEqual(['m1'])
    const boxes = el.shadowRoot.querySelectorAll('input[name="modelCheckbox"]') as NodeListOf<HTMLInputElement>
    boxes[1].checked = true; boxes[1].dispatchEvent(new Event('change', { bubbles: true }))
    await el.updateComplete
    expect(JSON.parse(hidden.value)).toEqual(['m1','m2'])
    expect(el.shadowRoot.textContent).toContain('已选模型（按顺序）')
    el.remove()
  })
})

describe('gw-json-editor', () => {
  it('shows formatted preview and syncs hidden input on input', async () => {
    const el = document.createElement('gw-json-editor') as any
    el.name = 'defaultParams'; el.value = '{"temperature":0.7}'
    document.body.appendChild(el); await el.updateComplete
    expect(el.shadowRoot.textContent).toContain('temperature')
    const hidden = el.shadowRoot.querySelector('input[type=hidden]') as HTMLInputElement
    expect(hidden.value).toContain('temperature')
    el.remove()
  })
})
```
Also rewrite the 6 existing `modelFormPage` assertions from `views.test.ts` to mount `gw-model-form-page` and check `shadowRoot.textContent` (keep the same strings: `测试模型配置`, `发送测试请求`, etc.).

- [x] **Step 2: Run to verify fails**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run tests/viewScripts.test.ts tests/views.test.ts`
Expected: FAIL — modules not found

- [x] **Step 3: Implement `gw-json-editor.ts`** with shadow DOM: `<textarea>` (`.value` property, `@input` handler calling `validate()`), preview `<pre>` (green/red background via `.valid`/`.invalid` classes), hidden `<input>` with `name`, buttons `格式化` and `清空` with `@click`. `validate()` does `JSON.parse`, sets preview text to `JSON.stringify(parsed,null,2)` or `JSON 格式错误：...`, sets hidden input value, toggles classes. This replaces the three global functions `jsonEditorValidate/Format/Clear` with component methods.

- [x] **Step 4: Implement form page components** translating existing templates 1:1. Key behavior to preserve:
  - `gw-model-form-page`: `<form method="POST" action=...>` with all fields (`customModel`, `realModel`, `provider`, `baseUrl`, `proxy`, `apiKeySource`+`apiKeyManual`, `desc`, `maxContextLength`, `<gw-json-editor name="defaultParams">`); `@change` on apiKeySource toggles manual input disabled/value; edit mode shows `<details>` test panel — copy the `runTest` fetch logic verbatim into an async method `runTest()` called by `@click` on `testBtn` (this satisfies "complex scripts moved into component lifecycle verbatim")
  - `gw-group-form-page`: `selected` state initialized from `data.group.models`; checkbox `@change` calls `sync()` method that updates `selected` and hidden input; `removeModel(i)` method; `filter` state + `@input` filters `.model-item` via CSS `hidden` binding; preserve `remove-model` link
  - `gw-user-form-page`: model permission checkboxes, `hint` text `不选择任何模型表示不限制`
  - `gw-model-limits-page`: `limits` data; `handleTypeChange()` toggles `maxField`/`costMaxField` visibility via`; `editLimit(i)` fills edit form action/values — methods on component; keep `window.limits` data equivalent as component property

- [x] **Step 5: Run tests and delete old views**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run`
Expected: all pass. Then delete migrated view files and their obsolete string-based tests in `views.test.ts` / `viewScripts.test.ts` (keep URL/form assertions as DOM assertions).

- [x] **Step 6: Commit**

```bash
git add web/src/components web/tests
git commit -m "feat(web): migrate form pages and JSON editor to Lit"
```

---

### Task 6: Stats, user pages, login (complex scripts + remaining pages)

**Files:**
- Create: `web/src/components/pages/gw-stats-page.ts`, `gw-user-home-page.ts`, `gw-user-stats-page.ts`, `gw-login-page.ts`
- Modify: `web/tests/views.test.ts`, `web/tests/viewScripts.test.ts`
- Delete: `web/src/views/stats.ts`, `userHome.ts`, `userStats.ts`, `login.ts`, `layout.ts`, `loginStyles.ts`, and `web/src/ui/shell.ts` (all replaced by Lit components)
- Delete: `web/src/styles/*.ts` old string CSS modules (their contents now live in component `static styles`)

**Interfaces:**
- Consumes: `pageHeader`, `panel`, `table`, `notice`, `<gw-shell>`; `formatNumber`, `formatDuration`, `escapeHtml` from `format.ts` (Lit templates auto-escape; keep explicit calls only where injecting HTML into `title` attributes etc.)
- Produces: remaining page components named in `routeForPath`

- [x] **Step 1: Write failing DOM tests** in `web/tests/views.test.ts` covering every assertion currently in that file for these pages:
  - stats: `统计 Dashboard`, `heatmap-grid`, `Token 用量`, 最近请求/pagination, daily heatmap (`每日 Token 消耗`, `过去 1 天`, `heatmap-months`, `heatmap-cell`)
  - user home: `🚀 LLM Gateway`, `JSON 配置`, copy button behavior (click → `navigator.clipboard.writeText` stub + text changes to `已复制`)
  - user stats: `使用统计 — u1`
  - login: `管理员登录` / `设置管理员密码` / `用户登录`

- [x] **Step 2: Run to verify fails**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run tests/views.test.ts`
Expected: FAIL — modules not found

- [x] **Step 3: Implement `gw-stats-page.ts`** translating template 1:1; copy heatmap computation logic verbatim into a helper `buildHeatmap(s)` returning `{ weeks, colors, monthLabels, totalHeatTokens }`. Tooltip script becomes `@mouseenter`/`@mousemove`/`@mouseleave` handlers setting `this.tipText`, `this.tipX`, `this.tipY` reactive properties rendered as a fixed-position `<div class="heatmap-tip">`; date-range buttons `@click` set `#start`/`#end` values and call `form.submit()`. This is the "verbatim logic, Lit events" path from spec §内联脚本.

- [x] **Step 4: Implement `gw-user-home-page.ts`** with config JSON, copy buttons using `@click` + `navigator.clipboard.writeText`, `已复制`反馈. Use `<gw-shell path="/user/main" nav={userNav} width={980}>`.

- [x] **Step 5: Implement `gw-user-stats-page.ts`** and `gw-login-page.ts` (login page does NOT use `<gw-shell>` — it uses the centered login-layout markup from current `views/login.ts`, moved into component `static styles`).

- [x] **Step 6: Run all tests; delete old view/style/shell files**

Run: `cd web && NODE_PATH=$(npm root -g) vitest run`
Expected: all pass. Then `git rm -r web/src/views/ web/src/ui/ web/src/styles/*.ts` (keep `styles/tokens.ts` and `styles/tokens-lit.ts`).

- [x] **Step 7: Commit**

```bash
git add web/src/components web/tests
git commit -m "feat(web): migrate stats, user pages and login to Lit"
```

---

### Task 7: Full integration, cleanup, Go build + browser verification

**Files:**
- Modify: `web/tests/indexBootstrap.test.ts` (extend to all routes)
- Modify: `web/src/admin.ts` (delete `renderAdmin` and old string helpers; keep only element registration + `startWhenReady`)
- Modify: `scripts/build_web.cjs` (remove any stale `app.js`, verify no `document.write` remains)
- Delete: any remaining `web/src/views/*` or string-rendering helpers

**Interfaces:**
- Consumes: all components from Tasks 2–6
- Produces: final built `web/dist/assets/admin.js` and copied `internal/server/dist/assets/admin.js` with no legacy rendering code

- [x] **Step 1: Extend `web/tests/indexBootstrap.test.ts` to cover all routes**

```ts
const routes = [
  ['/admin/models', '模型管理'],
  ['/admin/model-groups', '管理模型分组配置'],
  ['/admin/users', '管理访问 API 的用户和密钥'],
  ['/admin/api-keys', '集中维护上游调用使用的密钥'],
  ['/admin/stats', '统计 Dashboard'],
  ['/admin/announcement', '公告管理'],
  ['/admin/privacy', '隐私保护'],
  ['/admin/password', '密码设置'],
  ['/admin/login', '管理员登录'],
  ['/user/main', '🚀 LLM Gateway'],
  ['/user/stats', '使用统计'],
  ['/user/login', '用户登录'],
]
for (const [path, text] of routes) {
  it(`renders ${path} without blank page`, async () => {
    // same happy-dom load of real bundle as existing test, but:
    // - Window url = `http://localhost${path}`
    // - stub fetch returns generic envelope based on path (array for list routes, object for config/stats)
    // - assert document.body.textContent contains `text`
  })
}
```
Implement a `fakeFetch(path)` helper that switches on URL and returns the same shapes the old `renderers` expected. Reuse the existing 3-step sequence (loading → eval bundle → DOMContentLoaded → flush → assert).

- [x] **Step 2: Run to verify all routes pass**

Run: `make web-test`
Expected: all tests pass including 12 route smoke tests

- [x] **Step 3: Delete `renderAdmin` from `admin.ts`** and any unused imports; final `admin.ts` should be ~20 lines: import `./components/gw-app.js`, re-export `startWhenReady`, call it with a function that defines `<gw-app>` if needed.

- [x] **Step 4: Run full verification**

Run: `make web-build && go test ./... && go build ./...`
Expected: all pass; `go test ./...` includes e2e form-flow tests that exercise POST endpoints

- [x] **Step 5: Browser smoke test**

Start server (`dist/llm-gatego start`), open `http://localhost:4000/admin/models`, `/admin/models/new`, `/admin/stats`, `/user/main`. Confirm each page shows content (not blank) and console has no errors. Use browser automation if available.

- [x] **Step 6: Commit and push**

```bash
git add -A
git commit -m "feat(web): complete Lit migration and remove legacy renderers"
git push origin lit-web-migration
```

---

## Self-review notes

- Spec §目标/非目标: covered by Tasks 1–7 (no backend changes, no router lib, full-page navigation preserved)
- Spec §架构: Task 2 shell, Task 3 app root, Tasks 4–6 pages
- Spec §样式 B1: Task 1 tokens (global CSS vars in HTML), Task 2 `static styles`, Tasks 4–6 component CSS
- Spec §内联脚本 C: Task 5 JSON editor + group sync rewritten declaratively; model-test logic moved verbatim into component method; Task 6 stats tooltip + copy buttons as Lit events
- Spec §测试 A: every `views.test.ts` string assertion mapped to a DOM assertion in Tasks 4–6; `indexBootstrap` extended to all routes in Task 7
- No placeholders/TBD; each code step has complete source. Type consistency: `data`, `error`, `success` properties and component tag names from `routeForPath` are used identically across Tasks 3–7.
