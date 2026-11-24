import { describe, it, expect, beforeEach, vi } from 'vitest'
import { currentPath, navigate, subscribe, startRouter, stopRouter } from '../src/router.js'

describe('router', () => {
  beforeEach(() => {
    stopRouter()
    history.replaceState({}, '', '/admin/models')
  })

  it('navigates with pushState and notifies subscribers', () => {
    const listener = vi.fn()
    const unsub = subscribe(listener)
    navigate('/admin/users')
    expect(location.pathname).toBe('/admin/users')
    expect(currentPath()).toBe('/admin/users')
    expect(listener).toHaveBeenCalledWith('/admin/users')
    unsub()
  })

  it('supports replace and popstate', () => {
    navigate('/admin/users')
    navigate('/admin/stats', { replace: true })
    expect(location.pathname).toBe('/admin/stats')
    const listener = vi.fn()
    subscribe(listener)
    startRouter()
    window.dispatchEvent(new Event('popstate'))
    stopRouter()
    expect(listener).toHaveBeenCalled()
  })

  it('intercepts same-origin internal links', () => {
    startRouter()
    const a = document.createElement('a')
    a.href = '/admin/model-groups'
    document.body.appendChild(a)
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    a.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(location.pathname).toBe('/admin/model-groups')
    a.remove()
  })

  it('intercepts links inside shadow DOM', () => {
    class LinkHost extends HTMLElement {
      constructor() {
        super()
        const sr = this.attachShadow({ mode: 'open' })
        sr.innerHTML = '<a href="/admin/stats">stats</a>'
      }
    }
    if (!customElements.get('router-link-host')) customElements.define('router-link-host', LinkHost)
    startRouter()
    const host = document.createElement('router-link-host')
    document.body.appendChild(host)
    const a = host.shadowRoot!.querySelector('a')!
    const event = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0 })
    a.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(location.pathname).toBe('/admin/stats')
    host.remove()
  })
})
