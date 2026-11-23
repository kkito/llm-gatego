import { describe, it, expect } from 'vitest'
import { renderModels, renderModelForm } from '../src/pages/models.js'
import { renderGroups } from '../src/pages/groups.js'
import { renderUsers } from '../src/pages/users.js'
import { renderApiKeys } from '../src/pages/apiKeys.js'
import { renderLimits } from '../src/pages/limits.js'
import { renderStats } from '../src/pages/stats.js'
import { renderPrivacy } from '../src/pages/privacy.js'
import { renderHome } from '../src/pages/home.js'
import { renderLogin } from '../src/pages/login.js'
import { renderAnnouncement } from '../src/pages/announcement.js'
describe('page renderers', () => {
  const models = [{ customModel: 'm1', realModel: 'gpt-4o', provider: 'openai', baseUrl: 'http://up' }]
  it('renders models table and empty state', () => {
    expect(renderModels(models)).toContain('m1')
    expect(renderModels([])).toContain('No models')
  })
  it('renders model actions and hidden badge', () => {
    const html = renderModels([{ ...models[0], hidden: true }])
    expect(html).toContain('hidden')
    expect(html).toContain('data-action="toggle-hidden"')
    expect(html).toContain('data-action="copy"')
  })
  it('escapes HTML in model names', () => {
    expect(renderModels([{ ...models[0], customModel: '<script>' }])).toContain('&lt;script&gt;')
  })
  it('renders model form with provider options', () => {
    const html = renderModelForm(models[0])
    expect(html).toContain('value="m1"')
    expect(html).toContain('<option value="anthropic"')
  })
  it('renders groups', () => { expect(renderGroups([{ name: 'g', models: ['m1'] }])).toContain('g') })
  it('renders users', () => { expect(renderUsers([{ name: 'Alice', allowedModels: ['m1'] }])).toContain('Alice') })
  it('renders api keys', () => { expect(renderApiKeys([{ id: '1', name: 'K', key: 'sk-****' }])).toContain('sk-****') })
  it('renders limits', () => { expect(renderLimits([{ type: 'requests', period: 'day', periodValue: 1, limit: 100 }], 'm1')).toContain('Limits for m1') })
  it('renders stats', () => { expect(renderStats({ summary: { totalRequests: 10, totalTokens: 100, avgTtft: 250, avgTps: 40, avgDuration: 1000 }, byModel: [{ model: 'm1', requests: 10, tokens: 100 }] })).toContain('250ms') })
  it('renders privacy toggles', () => { expect(renderPrivacy({ enabled: true, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: 'USER' })).toContain('checked') })
  it('renders home and empty state', () => { expect(renderHome([{ name: 'g', models: ['m1'] }])).toContain('g'); expect(renderHome([])).toContain('No model groups') })
  it('renders login forms', () => { expect(renderLogin()).toContain('Admin login'); expect(renderLogin(true)).toContain('User login') })
  it('renders announcement', () => { expect(renderAnnouncement('hello')).toContain('hello'); expect(renderAnnouncement('')).toBe('') })
})
