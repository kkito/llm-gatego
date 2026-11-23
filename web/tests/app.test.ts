import { describe, it, expect, vi } from 'vitest'
import { pageForHash, bindEvents, loadPage } from '../src/app.js'
import { formatNumber, formatDuration, formatPct, escapeHtml } from '../src/format.js'
describe('app helpers', () => {
  it('maps hash to page', () => { expect(pageForHash('#/models')).toBe('models'); expect(pageForHash('')).toBe('home') })
  it('binds delegated events', () => {
    const root = document.createElement('div')
    let clicked = ''
    bindEvents(root, { del: el => { clicked = el.dataset.model || '' } })
    const btn = document.createElement('button'); btn.dataset.action = 'del'; btn.dataset.model = 'm1'; root.appendChild(btn)
    btn.click(); expect(clicked).toBe('m1')
  })
  it('loads page data through api', async () => {
    vi.stubGlobal('fetch', async () => ({ status: 200, json: async () => ({ ok: true, data: [{ customModel: 'm1', realModel: 'r', provider: 'openai', baseUrl: 'u' }] }) }))
    const html = await loadPage('models'); expect(html).toContain('m1')
  })
  it('formats values', () => { expect(formatNumber(12345)).toContain('12,345'); expect(formatDuration(1500)).toBe('1.5s'); expect(formatPct(0.125)).toBe('12.5%') })
  it('escapes HTML', () => { expect(escapeHtml('<x>')).toBe('&lt;x&gt;') })
})
