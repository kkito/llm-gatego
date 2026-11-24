import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GwApp, routeForPath } from '../src/components/gw-app.js'
import { navigate, stopRouter } from '../src/router.js'

describe('routeForPath', () => {
  it('maps admin and user paths to component tags', () => {
    expect(routeForPath('/admin/models')).toBe('gw-models-page')
    expect(routeForPath('/user/main')).toBe('gw-user-home-page')
    expect(routeForPath('/admin/models/new')).toBe('gw-model-form-page')
    expect(routeForPath('/')).toBe('gw-models-page')
  })
})

describe('GwApp SPA routing', () => {
  beforeEach(() => {
    stopRouter()
    history.replaceState({}, '', '/admin/models')
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 200, json: async () => ({ ok: true, data: [] }) })))
  })

  it('swaps page components when the URL changes without reloading', async () => {
    const el = document.createElement('gw-app') as any
    document.body.appendChild(el)
    await el.updateComplete
    const host = el.shadowRoot!.querySelector('.gw-page-host')!
    expect(host.firstElementChild?.tagName.toLowerCase()).toBe('gw-models-page')

    navigate('/admin/users')
    await el.updateComplete
    expect(host.firstElementChild?.tagName.toLowerCase()).toBe('gw-users-page')

    navigate('/admin/models')
    await el.updateComplete
    expect(host.firstElementChild?.tagName.toLowerCase()).toBe('gw-models-page')
    el.remove()
  })
})
