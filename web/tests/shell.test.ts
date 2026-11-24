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
    expect(el.textContent).toContain('page-body')
    expect(el.shadowRoot.querySelector('slot')).toBeTruthy()
    el.remove()
  })
})
