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

async function waitForPage(host: Element, tag: string): Promise<void> {
  for (let i = 0; i < 50; i++) {
    if (host.firstElementChild?.tagName.toLowerCase() === tag) return
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`expected page ${tag}, got ${host.firstElementChild?.tagName.toLowerCase()}`)
}

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
    await waitForPage(host, 'gw-models-page')

    navigate('/admin/users')
    await el.updateComplete
    await waitForPage(host, 'gw-users-page')

    navigate('/admin/models')
    await el.updateComplete
    await waitForPage(host, 'gw-models-page')
    el.remove()
  })
})
