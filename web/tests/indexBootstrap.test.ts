import { describe, it, expect, vi } from 'vitest'
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
 *   1. parser builds <div id="app">, readyState = 'loading'
 *   2. external script (admin.js) is evaluated
 *   3. browser finishes parsing and fires DOMContentLoaded
 * and asserts that a real page (not blank) ends up in the document.
 */
describe('fluent component pruning', () => {
  it('bundles only the components used by the sample page', () => {
    const bundle = readFileSync(join(process.cwd(), 'dist/assets/admin.js'), 'utf8')
    for (const tag of ['fluent-button', 'fluent-anchor-button', 'fluent-badge', 'fluent-divider', 'fluent-message-bar']) {
      expect(bundle, `missing ${tag}`).toContain(tag)
    }
    // Full-catalog registration strings must not leak into the bundle.
    expect(bundle).not.toContain('fluent-accordion')
    expect(bundle).not.toContain('fluent-data-grid')
    expect(bundle).not.toContain('provideFluentDesignSystem')
  })
})

describe('index.html bootstrap', () => {
  it('renders a page when the script runs before DOMContentLoaded', async () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
    const src = html.match(/<script[^>]*src="([^"]+)"/)?.[1]
    expect(src, 'index.html must load the admin bundle').toBe('/assets/admin.js')

    const bundle = readFileSync(join(process.cwd(), 'dist/assets/admin.js'), 'utf8')

    const window = new Window({ url: 'http://localhost/admin/models' })
    // happy-dom doesn't implement ElementInternals, which Fluent components
    // use for ARIA/form state. A minimal stub lets us verify the real bundle
    // renders in a DOM without asserting Fluent internals.
    Object.defineProperty(window.HTMLElement.prototype, 'attachInternals', {
      configurable: true,
      value() {
        return {
          states: new Set<string>(),
          role: '', ariaLabel: '', ariaDisabled: '',
          form: null, labels: [],
          setFormValue() {}, setValidity() {},
        }
      },
    })
    const doc = window.document
    doc.body.innerHTML = '<div id="app"></div>'
    Object.defineProperty(doc, 'readyState', { value: 'loading', writable: true, configurable: true })

    // Stub the API call the models page makes.
    vi.stubGlobal('fetch', async () => ({
      status: 200,
      json: async () => ({ ok: true, data: [{ customModel: 'm1', realModel: 'gpt-4' }] }),
    }))
    Object.defineProperty(window, 'fetch', { value: (...args: any[]) => (globalThis as any).fetch(...args), configurable: true })

    // Step 2: evaluate the bundle exactly as a classic <script> would.
    window.eval(bundle)
    expect(doc.body.textContent).not.toContain('模型管理')

    // Step 3: browser finishes parsing.
    Object.defineProperty(doc, 'readyState', { value: 'complete', writable: true, configurable: true })
    doc.dispatchEvent(new window.Event('DOMContentLoaded'))

    // Let the async renderAdmin(...).then(...) microtasks flush.
    await new Promise(resolve => setTimeout(resolve, 30))

    expect(doc.body.textContent).toContain('模型管理')
    expect(doc.body.textContent).toContain('m1')
  })
})
