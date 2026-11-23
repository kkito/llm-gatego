import { describe, it, expect, vi } from 'vitest'
import { startWhenReady } from '../src/admin.js'

function fakeDoc(readyState: DocumentReadyState) {
  const listeners: Record<string, Array<() => void>> = {}
  return {
    readyState,
    addEventListener: (type: string, fn: () => void) => { (listeners[type] ||= []).push(fn) },
    fire: (type: string) => (listeners[type] || []).forEach(fn => fn()),
  }
}

describe('bootstrap entry', () => {
  it('starts immediately when DOM is already parsed', () => {
    const start = vi.fn()
    startWhenReady(fakeDoc('complete') as any, start)
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('waits for DOMContentLoaded while document is loading', () => {
    const doc = fakeDoc('loading')
    const start = vi.fn()
    startWhenReady(doc as any, start)
    expect(start).not.toHaveBeenCalled()
    doc.fire('DOMContentLoaded')
    expect(start).toHaveBeenCalledTimes(1)
  })
})
