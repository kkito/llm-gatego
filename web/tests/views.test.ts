import { describe, it, expect } from 'vitest'
import { modelsPage } from '../src/views/models.js'
import { groupsPage } from '../src/views/groups.js'
import { usersPage } from '../src/views/users.js'
import { statsPage } from '../src/views/stats.js'
import { adminLoginPage, userLoginPage } from '../src/views/login.js'
import { userHomePage } from '../src/views/userHome.js'
import { userStatsPage } from '../src/views/userStats.js'
import { apiKeysPage } from '../src/views/apiKeys.js'
import { modelLimitsPage } from '../src/views/modelLimits.js'
import { modelFormPage } from '../src/views/modelForm.js'
import { announcementPage } from '../src/views/announcement.js'

describe('original view fidelity', () => {
  it('models page has original Chinese header and columns', () => {
    const h = modelsPage([{ customModel: 'm1', realModel: 'gpt-4', desc: 'desc' }])
    expect(h).toContain('模型管理')
    expect(h).toContain('配置和管理所有上游模型信息，调整顺序及增减模型。')
    expect(h).toContain('模型名称')
    expect(h).toContain('m1')
    expect(h).toContain('/admin/model-groups')
  })
  it('groups/users/api keys pages have original headers', () => {
    expect(groupsPage([])).toContain('管理模型分组配置')
    expect(usersPage([])).toContain('管理访问 API 的用户和密钥')
    expect(apiKeysPage([])).toContain('管理外部调用使用的 API Key')
  })
  it('stats page has heatmap and token cards', () => {
    const h = statsPage({ startDate: '2026-01-01', endDate: '2026-01-01', dateRange: '2026-01-01', totalRequests: 2, successfulRequests: 1, failedRequests: 1, totalInputTokens: 10, totalOutputTokens: 20, totalTokens: 30, totalCachedTokens: 5, avgDuration: 100, byModel: { m1: { requests: 2, successful: 1, failed: 1, totalTokens: 30 } }, byDate: { '2026-01-01': 30 }, byHour: {} })
    expect(h).toContain('统计 Dashboard')
    expect(h).toContain('heatmap-grid')
    expect(h).toContain('Token 用量')
  })
  it('forms and login pages render', () => {
    expect(modelFormPage(undefined, [])).toContain('新增模型')
    expect(modelFormPage({ customModel: 'm1' }, [])).toContain('编辑模型')
    expect(modelLimitsPage('m1', [])).toContain('限制规则管理')
    expect(announcementPage('hello')).toContain('公告管理')
    expect(adminLoginPage(false)).toContain('管理员登录')
    expect(userLoginPage()).toContain('用户登录')
  })
  it('user pages render original hero and stats', () => {
    const home = userHomePage({ models: ['m1'], modelGroups: [] })
    expect(home).toContain('🚀 LLM Gateway')
    expect(home).toContain('JSON 配置')
    expect(userStatsPage({ userName: 'u1', start: '2026-01-01', end: '2026-01-01', totalRequests: 1, successfulRequests: 1, totalTokens: 1, avgDuration: 1, byModel: {}, byDate: {} })).toContain('使用统计 — u1')
  })
})
