import { vi } from 'vitest'

// Components now submit via fetch instead of native forms. Tests that mount a
// page get a harmless default; integration tests override it with their own.
vi.stubGlobal('confirm', vi.fn(() => true))
vi.stubGlobal('fetch', vi.fn(async () => ({
  status: 200,
  json: async () => ({ ok: true, data: [] }),
})))
