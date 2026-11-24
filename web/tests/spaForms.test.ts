import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../src/components/pages/gw-login-page.js'
import '../src/components/pages/gw-stats-page.js'
import { stopRouter } from '../src/router.js'

function q(root: any, sel: string): any {
  const hit = root.shadowRoot?.querySelector(sel)
  if (hit) return hit
  for (const node of Array.from(root.shadowRoot?.querySelectorAll('*') || [])) {
    if ((node as any).shadowRoot) {
      const found = q(node, sel)
      if (found) return found
    }
  }
  return null
}

describe('SPA forms', () => {
  beforeEach(() => {
    stopRouter()
    history.replaceState({}, '', '/admin/login')
  })

  it('login posts JSON and follows redirect', async () => {
    const fetchMock = vi.fn(async () => ({ status: 200, json: async () => ({ ok: true, redirect: '/admin/models' }) }))
    vi.stubGlobal('fetch', fetchMock)
    const el = document.createElement('gw-login-page') as any
    document.body.appendChild(el)
    await el.updateComplete
    ;(q(el, 'input[name=password]') as HTMLInputElement).value = 'pw'
    q(el, 'form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise(r => setTimeout(r, 0))
    expect(fetchMock).toHaveBeenCalled()
    const postCall = fetchMock.mock.calls.find(c => (c[1] as RequestInit)?.method === 'POST')
    const init = postCall![1] as RequestInit
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ password: 'pw' })
    expect(location.pathname).toBe('/admin/models')
    el.remove()
  })

  it('stats filter navigates with query string', async () => {
    history.replaceState({}, '', '/admin/stats')
    const el = document.createElement('gw-stats-page') as any
    document.body.appendChild(el)
    await el.updateComplete
    Object.assign(el, { data: { startDate: '2026-01-01', endDate: '2026-01-02', byModel: {}, byDate: {}, byHour: {}, dailyHeatmap: [] } })
    await el.updateComplete
    q(el, 'input[name=userName]').value = 'alice'
    q(el, 'form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    expect(location.pathname).toBe('/admin/stats')
    expect(location.search).toContain('userName=alice')
    el.remove()
  })
})
