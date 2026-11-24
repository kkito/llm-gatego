import { describe, it, expect } from 'vitest'

async function mount(tag: string, props: Record<string, unknown> = {}): Promise<any> {
  const el = document.createElement(tag) as any
  document.body.appendChild(el)
  // Let the component's connectedCallback load() finish before applying test
  // fixtures, so the fixture isn't overwritten by an empty API response.
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  Object.assign(el, props)
  await el.updateComplete
  return el
}

function deepText(node: any): string {
  let out = node.nodeType === 3 ? (node.textContent || '') : ''
  if (node.shadowRoot) out += deepText(node.shadowRoot)
  for (const child of Array.from(node.childNodes || [])) out += deepText(child)
  return out
}

function text(el: any): string { return deepText(el.shadowRoot || el) }
function queryAll(el: any): (sel: string) => NodeListOf<Element> {
  return (sel: string) => deepQueryAll(el.shadowRoot || el, sel)
}
function deepQueryAll(root: any, sel: string): NodeListOf<Element> {
  const found = Array.from(root.querySelectorAll?.(sel) || []) as Element[]
  for (const node of Array.from(root.querySelectorAll?.('*') || [])) {
    if ((node as any).shadowRoot) found.push(...Array.from(deepQueryAll((node as any).shadowRoot, sel)))
  }
  return found as NodeListOf<Element>
}
function query(el: any): (sel: string) => Element | null {
  return (sel: string) => deepQuery(el.shadowRoot || el, sel)
}
function deepQuery(root: any, sel: string): Element | null {
  const hit = root.querySelector?.(sel)
  if (hit) return hit
  for (const node of Array.from(root.querySelectorAll?.('*') || [])) {
    if ((node as any).shadowRoot) {
      const inner = deepQuery((node as any).shadowRoot, sel)
      if (inner) return inner
    }
  }
  return null
}
import '../src/components/pages/gw-models-page.js'
import '../src/components/pages/gw-groups-page.js'
import '../src/components/pages/gw-users-page.js'

import '../src/components/pages/gw-api-keys-page.js'
import '../src/components/pages/gw-announcement-page.js'
import '../src/components/pages/gw-privacy-page.js'
import '../src/components/pages/gw-password-page.js'

describe('Lit read-only pages', () => {
  it('api keys page renders original header and form', async () => {
    const el = await mount('gw-api-keys-page', { data: [] })
    expect(text(el)).toContain('集中维护上游调用使用的密钥')
    expect(query(el)('form')).toBeTruthy()
    el.remove()
  })
  it('announcement page renders textarea and labels', async () => {
    const el = await mount('gw-announcement-page', { data: 'hello' })
    expect(text(el)).toContain('公告管理')
    expect(query(el)('textarea[name=content]')?.value).toBe('hello')
    el.remove()
  })
  it('privacy page renders labels and debug hint', async () => {
    const el = await mount('gw-privacy-page', { data: { enabled: false, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: 'USER', whitelistFilter: false }, cliDebug: true })
    const t = text(el)
    for (const s of ['隐私保护', '启用隐私保护', '抹掉 user 字段', '文件路径用户名替换', '白名单字段过滤', '日志记录', '记录完整请求/响应日志', '--debug']) expect(t).toContain(s)
    expect(query(el)('[name=detailLogEnabled]')?.disabled).toBe(true)
    el.remove()
  })
  it('password page renders fields', async () => {
    const el = await mount('gw-password-page', { hasPassword: true })
    const t = text(el)
    expect(t).toContain('密码设置')
    expect(t).toContain('当前密码')
    expect(query(el)('[name=newPassword]')).toBeTruthy()
    el.remove()
  })
})

import '../src/components/pages/gw-model-form-page.js'
import '../src/components/pages/gw-group-form-page.js'
import '../src/components/pages/gw-user-form-page.js'
import '../src/components/pages/gw-model-limits-page.js'
import '../src/components/pages/gw-stats-page.js'
import '../src/components/pages/gw-user-home-page.js'
import '../src/components/pages/gw-user-stats-page.js'
import '../src/components/pages/gw-login-page.js'

describe('Lit form and remaining pages', () => {
  it('model form renders edit mode with test panel', async () => {
    const el = await mount('gw-model-form-page', { data: { model: { customModel: 'm', realModel: 'r', provider: 'openai', baseUrl: 'http://x', defaultParams: { temperature: 0.7 } }, keys: [] } })
    const t = text(el)
    expect(t).toContain('编辑模型'); expect(t).toContain('测试模型配置'); expect(t).toContain('发送测试请求')
    expect(query(el)('gw-json-editor')).toBeTruthy()
    el.remove()
  })
  it('model form new mode hides test panel', async () => {
    const el = await mount('gw-model-form-page', { data: { keys: [] } })
    expect(text(el)).toContain('新增模型')
    expect(text(el)).not.toContain('模型测试')
    el.remove()
  })
  it('group form renders model selectors and syncs hidden input', async () => {
    const el = await mount('gw-group-form-page', { data: { group: { name: 'g1', models: ['m1'] }, models: [{ customModel: 'm1' }, { customModel: 'm2' }] } })
    const t = text(el)
    expect(t).toContain('已选模型（按顺序）'); expect(t).toContain('可用模型')
    expect(query(el)('a[href*="/remove-model"]')?.getAttribute('href')).toContain('/admin/model-groups/edit/g1/remove-model')
    const hidden = query(el)('input[name="models"]') as HTMLInputElement
    expect(JSON.parse(hidden.value)).toEqual(['m1'])
    const boxes = queryAll(el)('input[name="modelCheckbox"]') as NodeListOf<HTMLInputElement>
    boxes[1].checked = true; boxes[1].dispatchEvent(new Event('change', { bubbles: true }))
    await el.updateComplete
    expect(JSON.parse((query(el)('input[name="models"]') as HTMLInputElement).value)).toEqual(['m1', 'm2'])
    el.remove()
  })
  it('user form renders permission checkboxes', async () => {
    const el = await mount('gw-user-form-page', { data: { user: { name: 'u1', apikey: 'sk-1', allowedModels: ['m1'] }, models: ['m1', 'm2'] } })
    const t = text(el)
    expect(t).toContain('模型权限'); expect(t).toContain('不选择任何模型表示不限制')
    expect((query(el)('#apiKey') as HTMLInputElement).value).toBe('sk-1')
    el.remove()
  })
  it('limits page renders rules and forms', async () => {
    const el = await mount('gw-model-limits-page', { model: 'm1', data: [] })
    expect(text(el)).toContain('限制规则管理')
    el.remove()
  })
  it('stats page renders heatmap and token cards', async () => {
    const el = await mount('gw-stats-page', { data: {
      startDate: '2026-01-01', endDate: '2026-01-01', dateRange: '2026-01-01', totalRequests: 2, successfulRequests: 1, failedRequests: 1,
      totalInputTokens: 10, totalOutputTokens: 20, totalTokens: 30, totalCachedTokens: 5, avgDuration: 100, byModel: { m1: { requests: 2, successful: 1, failed: 1, totalTokens: 30 } }, byDate: { '2026-01-01': 30 }, byHour: {},
      dailyHeatmap: [{ date: '2026-01-01', requests: 2, totalTokens: 30 }], heatmapStart: '2026-01-01', heatmapEnd: '2026-01-01',
      details: [{ timestamp: '2026-01-01T00:00:00Z', userName: 'u', customModel: 'm', modelGroup: '', statusCode: 200, durationMs: 12, completionTokens: 1, promptTokens: 2, cachedTokens: 0 }], page: 1, totalPages: 2,
    } })
    const t = text(el)
    expect(t).toContain('统计 Dashboard'); expect(t).toContain('Token 用量'); expect(t).toContain('每日 Token 消耗'); expect(t).toContain('过去 1 天')
    expect(t).toContain('最近请求'); expect(query(el)('[data-heatmap-grid]')).toBeTruthy()
    el.remove()
  })
  it('user home renders hero and config', async () => {
    const el = await mount('gw-user-home-page', { data: { models: ['m1'], modelGroups: [] } })
    expect(text(el)).toContain('🚀 LLM Gateway'); expect(text(el)).toContain('JSON 配置')
    el.remove()
  })
  it('user stats renders username', async () => {
    const el = await mount('gw-user-stats-page', { data: { userName: 'u1', start: '2026-01-01', end: '2026-01-01', totalRequests: 1, successfulRequests: 1, totalTokens: 1, avgDuration: 1, byModel: {}, byDate: {} } })
    expect(text(el)).toContain('使用统计 — u1')
    el.remove()
  })
  it('list pages no longer use native POST forms', async () => {
    for (const tag of ['gw-models-page', 'gw-groups-page', 'gw-users-page', 'gw-api-keys-page']) {
      const el = await mount(tag, { data: [] })
      const forms = Array.from(query(el)('form') ? [query(el)('form')] : []) as HTMLFormElement[]
      expect(forms.some(f => (f.getAttribute('method') || '').toLowerCase() === 'post'), `${tag} still has a native POST form`).toBe(false)
      el.remove()
    }
  })
  it('login pages render correct headings', async () => {
    const a = await mount('gw-login-page', { mode: 'admin-login' }); expect(a.shadowRoot.textContent).toContain('管理员登录'); a.remove()
    const s = await mount('gw-login-page', { mode: 'admin-setup' }); expect(s.shadowRoot.textContent).toContain('设置管理员密码'); s.remove()
    const u = await mount('gw-login-page', { mode: 'user-login' }); expect(u.shadowRoot.textContent).toContain('用户登录'); u.remove()
  })
})
