import { describe, it, expect, vi } from 'vitest'

// Lit components replace inline <script> blocks with declarative event
// handlers. These tests preserve the original intent: each page that used
// to carry an inline script must still mount cleanly and expose the
// interactive controls the script used to wire up.
import '../src/components/pages/gw-models-page.js'
import '../src/components/pages/gw-group-form-page.js'
import '../src/components/pages/gw-model-limits-page.js'
import '../src/components/pages/gw-model-form-page.js'
import '../src/components/pages/gw-privacy-page.js'
import '../src/components/pages/gw-stats-page.js'
import '../src/components/pages/gw-user-home-page.js'
import '../src/components/pages/gw-user-stats-page.js'

async function mount(tag: string, props: Record<string, unknown> = {}): Promise<any> {
  const el = document.createElement(tag) as any
  Object.assign(el, props)
  document.body.appendChild(el)
  await el.updateComplete
  return el
}

describe('original view script tests migrated', () => {
  it('models page wires delete/move/copy/toggle actions', async () => {
    const el = await mount('gw-models-page', { data: [{ customModel: 'gpt-4', realModel: 'gpt-4' }] })
    expect(el.shadowRoot.querySelector('[data-delete-url]')).toBeTruthy()
    expect(el.shadowRoot.querySelector('[data-move-url]')).toBeTruthy()
    expect(el.shadowRoot.querySelector('[data-copy-url]')).toBeTruthy()
    expect(el.shadowRoot.querySelector('[data-toggle-url]')).toBeTruthy()
    el.remove()
  })
  it('group form wires model synchronisation', async () => {
    const el = await mount('gw-group-form-page', { data: { group: { name: 'g', models: [] }, models: [{ customModel: 'm1' }] } })
    const box = el.shadowRoot.querySelector('input[name="modelCheckbox"]') as HTMLInputElement
    box.checked = true; box.dispatchEvent(new Event('change', { bubbles: true }))
    await el.updateComplete
    expect(JSON.parse((el.shadowRoot.querySelector('input[name="models"]') as HTMLInputElement).value)).toEqual(['m1'])
    el.remove()
  })
  it('model limits page wires type change and edit', async () => {
    const el = await mount('gw-model-limits-page', { model: 'm', data: [{ type: 'rpm', period: 'minute', periodValue: 1, max: 10, costMax: 0, groupName: 'default', enabled: true }] })
    expect(el.shadowRoot.querySelector('#type')).toBeTruthy()
    expect(el.shadowRoot.querySelector('#editForm')).toBeTruthy()
    ;(el.shadowRoot.querySelector('#type') as HTMLSelectElement).value = 'cost'
    ;(el.shadowRoot.querySelector('#type') as HTMLSelectElement).dispatchEvent(new Event('change', { bubbles: true }))
    await el.updateComplete
    expect((el.shadowRoot.querySelector('#costMaxField') as HTMLElement).style.display).not.toBe('none')
    el.remove()
  })
  it('model form wires the test panel', async () => {
    const el = await mount('gw-model-form-page', { data: { model: { customModel: 'm', realModel: 'r' }, keys: [] } })
    expect(el.shadowRoot.querySelector('#testBtn')).toBeTruthy()
    expect(el.shadowRoot.querySelector('gw-json-editor')).toBeTruthy()
    el.remove()
  })
  it('privacy page wires form fields', async () => {
    const el = await mount('gw-privacy-page', { data: { enabled: true, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: 'USER', whitelistFilter: false } })
    expect(el.shadowRoot.querySelector('#privacy-form')).toBeTruthy()
    expect(el.shadowRoot.querySelectorAll('input[type=checkbox]').length).toBeGreaterThan(0)
    el.remove()
  })
  it('stats page wires date-range buttons and heatmap', async () => {
    const el = await mount('gw-stats-page', { data: {
      startDate: '2026-01-01', endDate: '2026-01-01', dateRange: 'x', totalRequests: 1, successfulRequests: 1, failedRequests: 0,
      totalInputTokens: 1, totalOutputTokens: 1, totalTokens: 2, totalCachedTokens: 0, avgDuration: 1, byModel: {}, byDate: {}, byHour: {},
      dailyHeatmap: [{ date: '2026-01-01', requests: 1, totalTokens: 2 }],
    } })
    expect(el.shadowRoot.querySelectorAll('[data-days]').length).toBe(3)
    expect(el.shadowRoot.querySelector('[data-heatmap-grid]')).toBeTruthy()
    el.remove()
  })
  it('user home wires copy buttons', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const el = await mount('gw-user-home-page', { data: { models: ['m'], modelGroups: [] } })
    const btn = el.shadowRoot.querySelector('.copy-btn') as HTMLButtonElement
    btn.click()
    await new Promise(r => setTimeout(r, 0))
    expect(writeText).toHaveBeenCalled()
    expect((el.shadowRoot.querySelector('.copy-btn') as HTMLButtonElement).textContent).toBe('已复制')
    el.remove()
  })
  it('user stats renders without inline scripts', async () => {
    const el = await mount('gw-user-stats-page', { data: { userName: 'u', start: '2026-01-01', end: '2026-01-01', totalRequests: 0, successfulRequests: 0, totalTokens: 0, avgDuration: 0, byModel: {}, byDate: {} } })
    expect(el.shadowRoot.querySelector('form')).toBeTruthy()
    el.remove()
  })
})
