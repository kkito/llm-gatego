import { describe, it, expect } from 'vitest'
import { afterWrite, formToObject, type ApiEnvelope } from '../src/api.js'

describe('api helpers', () => {
  it('serializes form values including checkboxes and multi-selects', () => {
    const form = document.createElement('form')
    form.innerHTML = `
      <input name="name" value="m1">
      <input name="enabled" type="checkbox" checked>
      <input name="hidden" type="checkbox">
      <select name="models" multiple><option value="a" selected>a</option><option value="b" selected>b</option></select>
    `
    document.body.appendChild(form)
    expect(formToObject(form)).toEqual({ name: 'm1', enabled: true, hidden: false, models: ['a', 'b'] })
    form.remove()
  })

  it('honors API redirect hints', () => {
    const res: ApiEnvelope = { ok: true, redirect: '/admin/models' }
    expect(afterWrite(res, '/admin')).toBe('/admin/models')
    expect(afterWrite({ ok: true }, '/admin')).toBe('/admin')
  })
})
