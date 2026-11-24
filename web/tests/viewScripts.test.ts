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
  document.body.appendChild(el)
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  Object.assign(el, props)
  await el.updateComplete
  return el
}

function find(root: any, sel: string): any {
  const hit = root.querySelector?.(sel)
  if (hit) return hit
  for (const node of Array.from(root.querySelectorAll?.('*') || [])) {
    if ((node as any).shadowRoot) {
      const inner = find((node as any).shadowRoot, sel)
      if (inner) return inner
    }
  }
  return null
}
function findAll(root: any, sel: string): any[] {
  const found = Array.from(root.querySelectorAll?.(sel) || []) as any[]
  for (const node of Array.from(root.querySelectorAll?.('*') || [])) {
    if ((node as any).shadowRoot) found.push(...findAll((node as any).shadowRoot, sel))
  }
  return found
}
const q = (el: any, sel: string) => find(el.shadowRoot || el, sel)
const qa = (el: any, sel: string) => findAll(el.shadowRoot || el, sel)

describe('original view script tests migrated', () => {
  it('models page wires delete/move/copy/toggle actions', async () => {
    const el = await mount('gw-models-page', { data: [{ customModel: 'gpt-4', realModel: 'gpt-4' }] })
    expect(q(el, '[data-delete-url]')).toBeTruthy()
    expect(q(el, '[data-move-url]')).toBeTruthy()
    expect(q(el, '[data-copy-url]')).toBeTruthy()
    expect(q(el, '[data-toggle-url]')).toBeTruthy()
    el.remove()
  })
  it('group form wires model synchronisation', async () => {
    const el = await mount('gw-group-form-page', { data: { group: { name: 'g', models: [] }, models: [{ customModel: 'm1' }] } })
    const box = q(el, 'input[name="modelCheckbox"]') as HTMLInputElement
    box.checked = true; box.dispatchEvent(new Event('change', { bubbles: true }))
    await el.updateComplete
    expect(JSON.parse((q(el, 'input[name="models"]') as HTMLInputElement).value)).toEqual(['m1'])
    el.remove()
  })
  it('model limits page wires type change and edit', async () => {
    const el = await mount('gw-model-limits-page', { model: 'm', data: [{ type: 'rpm', period: 'minute', periodValue: 1, max: 10, costMax: 0, groupName: 'default', enabled: true }] })
    expect(q(el, '#type')).toBeTruthy()
    expect(q(el, '#editForm')).toBeTruthy()
    ;(q(el, '#type') as HTMLSelectElement).value = 'cost'
    ;(q(el, '#type') as HTMLSelectElement).dispatchEvent(new Event('change', { bubbles: true }))
    await el.updateComplete
    expect((q(el, '#costMaxField') as HTMLElement).style.display).not.toBe('none')
    el.remove()
  })
  it('model form wires the test panel', async () => {
    const el = await mount('gw-model-form-page', { data: { model: { customModel: 'm', realModel: 'r' }, keys: [] } })
    expect(q(el, '#testBtn')).toBeTruthy()
    expect(q(el, 'gw-json-editor')).toBeTruthy()
    el.remove()
  })
  it('privacy page wires form fields', async () => {
    const el = await mount('gw-privacy-page', { data: { enabled: true, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: 'USER', whitelistFilter: false } })
    expect(q(el, '#privacy-form')).toBeTruthy()
    expect(qa(el, 'input[type=checkbox]').length).toBeGreaterThan(0)
    el.remove()
  })
  it('stats page wires date-range buttons and heatmap', async () => {
    const el = await mount('gw-stats-page', { data: {
      startDate: '2026-01-01', endDate: '2026-01-01', dateRange: 'x', totalRequests: 1, successfulRequests: 1, failedRequests: 0,
      totalInputTokens: 1, totalOutputTokens: 1, totalTokens: 2, totalCachedTokens: 0, avgDuration: 1, byModel: {}, byDate: {}, byHour: {},
      dailyHeatmap: [{ date: '2026-01-01', requests: 1, totalTokens: 2 }],
    } })
    expect(qa(el, '[data-days]').length).toBe(3)
    expect(q(el, '[data-heatmap-grid]')).toBeTruthy()
    el.remove()
  })
  it('user home wires copy buttons', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const el = await mount('gw-user-home-page', { data: { models: ['m'], modelGroups: [] } })
    const btn = q(el, '.copy-btn') as HTMLButtonElement
    btn.click()
    await new Promise(r => setTimeout(r, 0))
    expect(writeText).toHaveBeenCalled()
    expect((q(el, '.copy-btn') as HTMLButtonElement).textContent).toBe('已复制')
    el.remove()
  })
  it('user stats renders without inline scripts', async () => {
    const el = await mount('gw-user-stats-page', { data: { userName: 'u', start: '2026-01-01', end: '2026-01-01', totalRequests: 0, successfulRequests: 0, totalTokens: 0, avgDuration: 0, byModel: {}, byDate: {} } })
    expect(q(el, 'form')).toBeTruthy()
    el.remove()
  })
})
