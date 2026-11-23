import { describe, it, expect } from 'vitest'
import '../src/gw-card.js'
import '../src/gw-stat.js'
import '../src/gw-modal.js'
import '../src/gw-table.js'
describe('web components', () => {
  it('defines custom elements', () => {
    expect(customElements.get('gw-card')).toBeTruthy()
    expect(customElements.get('gw-stat')).toBeTruthy()
    expect(customElements.get('gw-modal')).toBeTruthy()
    expect(customElements.get('gw-table')).toBeTruthy()
  })
  it('card renders slots in shadow DOM', () => {
    const el = document.createElement('gw-card') as any
    expect(el.shadowRoot.querySelector('slot[name="title"]')).toBeTruthy()
    expect(el.shadowRoot.querySelector('slot:not([name])')).toBeTruthy()
  })
  it('stat renders value and label slots', () => {
    const el = document.createElement('gw-stat') as any
    expect(el.shadowRoot.querySelector('.value slot[name="value"]')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.label slot[name="label"]')).toBeTruthy()
  })
  it('modal opens and closes', () => {
    const el = document.createElement('gw-modal') as any
    el.open(); expect(el.hasAttribute('open')).toBe(true)
    el.close(); expect(el.hasAttribute('open')).toBe(false)
  })
  it('table renders head and body slots', () => {
    const el = document.createElement('gw-table') as any
    expect(el.shadowRoot.querySelector('div slot[name="head"]')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.body slot')).toBeTruthy()
  })
})
