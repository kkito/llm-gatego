import { describe, it, expect } from 'vitest'
import { routeForPath } from '../src/components/gw-app.js'

describe('routeForPath', () => {
  it('maps admin and user paths to component tags', () => {
    expect(routeForPath('/admin/models')).toBe('gw-models-page')
    expect(routeForPath('/user/main')).toBe('gw-user-home-page')
    expect(routeForPath('/admin/models/new')).toBe('gw-model-form-page')
    expect(routeForPath('/')).toBe('gw-models-page')
  })
})
