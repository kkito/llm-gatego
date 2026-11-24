import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { Window } = require('happy-dom') as typeof import('happy-dom')

/**
 * Regression test for the "blank page" bug:
 * index.html used to load admin.js as a classic blocking <script>, which runs
 * while document.readyState === 'loading'. If the entry only boots when the
 * document is already parsed, nothing ever renders and the page stays blank.
 *
 * This test simulates the real browser sequence from index.html:
 *   1. parser builds <gw-app>, readyState = 'loading'
 *   2. external script (admin.js) is evaluated
 *   3. browser finishes parsing and fires DOMContentLoaded
 * and asserts that every route renders real page content (not blank).
 */
function fakeFetch(): (url: string) => Promise<any> {
  return async (url: string) => {
    const wrap = (data: any) => ({ status: 200, json: async () => ({ ok: true, data }) })
    if (url.includes('/api/admin/models/')) return wrap([])
    if (url.endsWith('/api/admin/models')) return wrap([])
    if (url.includes('/api/admin/models')) return wrap([{ customModel: 'm1', realModel: 'gpt-4' }])
    if (url.includes('/api/admin/model-groups')) return wrap([])
    if (url.includes('/api/admin/users')) return wrap([])
    if (url.includes('/api/admin/api-keys')) return wrap([])
    if (url.includes('/api/admin/stats')) return wrap({
      dateRange: '2026-01-01', totalRequests: 0, successfulRequests: 0, failedRequests: 0,
      totalInputTokens: 0, totalOutputTokens: 0, totalTokens: 0, totalCachedTokens: 0, avgDuration: 0,
      byModel: {}, byDate: {}, byHour: {}, dailyHeatmap: [], details: [],
    })
    if (url.includes('/api/admin/privacy')) return wrap({ settings: { enabled: false, pathPlaceholder: 'USER' } })
    if (url.includes('/api/admin/announcement')) return wrap({ content: '' })
    if (url.includes('/api/admin/auth-status')) return wrap({ passwordConfigured: true })
    if (url.includes('/api/user/config')) return wrap({ models: [{ customModel: 'm1' }], modelGroups: [], announcement: '' })
    if (url.includes('/api/user/stats')) return wrap({})
    return wrap([])
  }
}

async function renderRoute(path: string): Promise<string> {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
  expect(html, 'index.html must use <gw-app>').toContain('<gw-app>')
  const src = html.match(/<script[^>]*src="([^"]+)"/)?.[1]
  expect(src, 'index.html must load the admin bundle').toBe('/assets/admin.js')
  const bundle = readFileSync(join(process.cwd(), 'dist/assets/admin.js'), 'utf8')

  const window = new Window({ url: 'http://localhost' + path })
  const doc = window.document
  doc.body.innerHTML = '<gw-app></gw-app>'
  Object.defineProperty(doc, 'readyState', { value: 'loading', writable: true, configurable: true })
  vi.stubGlobal('fetch', fakeFetch())
  Object.defineProperty(window, 'fetch', { value: (...args: any[]) => (globalThis as any).fetch(...args), configurable: true })

  window.eval(bundle)
  expect(doc.body.textContent).not.toContain('模型管理')
  Object.defineProperty(doc, 'readyState', { value: 'complete', writable: true, configurable: true })
  doc.dispatchEvent(new window.Event('DOMContentLoaded'))
  await new Promise(resolve => setTimeout(resolve, 60))
  // Page components render inside gw-app's shadow DOM, which is reflected in
  // body.textContent via slotted <gw-shell> content.
  function deepText(node: any): string {
    let out = node.nodeType === 3 ? (node.textContent || '') : ''
    if (node.shadowRoot) out += deepText(node.shadowRoot)
    for (const child of Array.from(node.childNodes || [])) out += deepText(child)
    return out
  }
  return deepText(doc.body)
}

describe('index.html bootstrap', () => {
  afterEach(() => vi.unstubAllGlobals())
  const routes: Array<[string, string]> = [
    ['/admin/models', '模型管理'],
    ['/admin/models/new', '新增模型'],
    ['/admin/model-groups/new', '新增 Model Group'],
    ['/admin/users/new', '新增用户'],
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
      const body = await renderRoute(path)
      expect(body).toContain(text)
    }, 10000)
  }
})
