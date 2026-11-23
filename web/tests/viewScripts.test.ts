import { describe, it, expect } from 'vitest'
import { modelsPage } from '../src/views/models.js'
import { groupFormPage } from '../src/views/groupForm.js'
import { modelLimitsPage } from '../src/views/modelLimits.js'
import { modelFormPage } from '../src/views/modelForm.js'
import { statsPage } from '../src/views/stats.js'
import { privacyPage } from '../src/views/privacy.js'
import { userHomePage } from '../src/views/userHome.js'
import { userStatsPage } from '../src/views/userStats.js'

function assertScriptsValid(html: string) {
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const code = m[1].trim()
    if (!code) continue
    expect(() => new Function(code), code.slice(0, 120)).not.toThrow()
  }
}

const stats = statsPage({ startDate: '2026-01-01', endDate: '2026-01-01', dateRange: 'x', totalRequests: 1, successfulRequests: 1, failedRequests: 0, totalInputTokens: 1, totalOutputTokens: 1, totalTokens: 2, totalCachedTokens: 0, avgDuration: 1, byModel: {}, byDate: {}, byHour: {} })

describe('original view script tests migrated', () => {
  it('models-page.test.tsx', () => assertScriptsValid(modelsPage([{ customModel: 'gpt-4', realModel: 'gpt-4' }])))
  it('model-group-form-page.test.tsx', () => assertScriptsValid(groupFormPage({ name: 'g', models: [] }, [])))
  it('model-limits-page.test.tsx', () => assertScriptsValid(modelLimitsPage('m', [])))
  it('model-test.test.tsx', () => assertScriptsValid(modelFormPage({ customModel: 'm', realModel: 'r' }, [])))
  it('privacy-settings.test.tsx', () => assertScriptsValid(privacyPage({ enabled: true, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: 'USER', whitelistFilter: false })))
  it('users-page.test.tsx', () => assertScriptsValid(stats))
  it('home-page.test.tsx', () => assertScriptsValid(userHomePage({ models: ['m'], modelGroups: [] })))
  it('user-layout.test.tsx', () => assertScriptsValid(userStatsPage({ userName: 'u', start: '2026-01-01', end: '2026-01-01', totalRequests: 0, successfulRequests: 0, totalTokens: 0, avgDuration: 0, byModel: {}, byDate: {} })))
})
