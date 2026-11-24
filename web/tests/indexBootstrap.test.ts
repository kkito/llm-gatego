import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const webRoot = process.cwd()
const distRoot = join(webRoot, 'dist')

function builtHtml(): string {
  const path = join(distRoot, 'index.html')
  expect(existsSync(path), 'vite build must generate dist/index.html').toBe(true)
  return readFileSync(path, 'utf8')
}

describe('vite production output', () => {
  it('keeps the gw-app bootstrap element', () => {
    expect(builtHtml()).toContain('<gw-app>')
  })

  it('loads a hashed module entry instead of the old admin.js', () => {
    const html = builtHtml()
    expect(html).not.toContain('/assets/admin.js')
    const src = html.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"/)?.[1]
      || html.match(/<script[^>]+src="([^"]+\.js)"[^>]+type="module"/)?.[1]
    expect(src, 'built index.html must load a module entry').toBeTruthy()
    expect(src!).toMatch(/^\/assets\/index-[A-Za-z0-9_-]+\.js$/)
    expect(existsSync(join(distRoot, src!.replace(/^\//, ''))), 'entry chunk must exist').toBe(true)
  })

  it('injects global CSS and favicon', () => {
    const html = builtHtml()
    expect(html).toContain('--ui-bg')
    expect(html).toContain('/favicon.ico')
    expect(existsSync(join(distRoot, 'favicon.ico'))).toBe(true)
  })

  it('splits route pages into separate chunks', () => {
    const assets = join(distRoot, 'assets')
    const js = readdirSync(assets).filter(name => name.endsWith('.js'))
    expect(js.length).toBeGreaterThan(5)
    expect(js.some(name => name.includes('login'))).toBe(true)
    expect(js.some(name => name.includes('stats'))).toBe(true)
    expect(js.some(name => name.includes('models'))).toBe(true)
  })

  it('preserves DOMContentLoaded bootstrap logic in the entry chunk', () => {
    const html = builtHtml()
    const src = html.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"/)?.[1]
      || html.match(/<script[^>]+src="([^"]+\.js)"[^>]+type="module"/)?.[1]
    expect(src).toBeTruthy()
    const entry = readFileSync(join(distRoot, src!.replace(/^\//, '')), 'utf8')
    expect(entry).toContain('DOMContentLoaded')
    expect(entry).toContain('gw-app')
  })
})
