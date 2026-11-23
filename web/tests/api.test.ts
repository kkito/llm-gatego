import { describe, it, expect, vi } from 'vitest'
import { api, post } from '../src/api.js'
describe('api', () => {
  it('returns data on success', async () => {
    vi.stubGlobal('fetch', async () => ({ status: 200, json: async () => ({ ok: true, data: [1, 2] }) }))
    expect((await api<number[]>('/x')).data).toEqual([1, 2])
  })
  it('throws on error envelope', async () => {
    vi.stubGlobal('fetch', async () => ({ status: 400, json: async () => ({ ok: false, error: { message: 'bad' } }) }))
    await expect(api('/x')).rejects.toThrow('bad')
  })
  it('throws on HTTP error without envelope message', async () => {
    vi.stubGlobal('fetch', async () => ({ status: 500, json: async () => ({ ok: false }) }))
    await expect(api('/x')).rejects.toThrow('HTTP 500')
  })
  it('post sends JSON body', async () => {
    let captured = ''
    vi.stubGlobal('fetch', async (_p: string, o: RequestInit) => { captured = String(o.body); return { status: 200, json: async () => ({ ok: true, data: {} }) } })
    await post('/x', { a: 1 })
    expect(captured).toBe('{"a":1}')
  })
})
