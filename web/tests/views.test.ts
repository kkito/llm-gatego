import { describe, it, expect } from 'vitest'
import { adminPage } from '../src/views/layout.js'
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
import { passwordPage } from '../src/views/password.js'
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
    expect(apiKeysPage([])).toContain('集中维护上游调用使用的密钥')
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

describe('view interaction fidelity', () => {
  it('model form includes model-test panel for edit', () => {
    const h = modelFormPage({ customModel: 'm1', realModel: 'gpt-4', provider: 'openai', baseUrl: 'http://x', defaultParams: { temperature: 0.7 } }, [])
    expect(h).toContain('测试模型配置')
    expect(h).toContain("fetch('/admin/models/test'")
    expect(h).toContain('&quot;temperature&quot;: 0.7')
    expect(h).toContain('name="defaultParams" value="{')

    expect(modelFormPage(undefined, [])).not.toContain('模型测试')
  })
  it('stats page renders request details and pagination', () => {
    const h = statsPage({
      startDate: '2026-01-01', endDate: '2026-01-01', dateRange: 'x', totalRequests: 1, successfulRequests: 1, failedRequests: 0,
      totalInputTokens: 1, totalOutputTokens: 1, totalTokens: 2, totalCachedTokens: 0, avgDuration: 1,
      byModel: {}, byDate: {}, byHour: {}, page: 1, totalPages: 2,
      details: [{ timestamp: '2026-01-01T00:00:00Z', userName: 'u', customModel: 'm', modelGroup: '', statusCode: 200, durationMs: 12, completionTokens: 1, promptTokens: 2, cachedTokens: 0 }],
    })
    expect(h).toContain('最近请求')
    expect(h).toContain('pagination')
    expect(h).toContain('m')
  })
  it('models page uses original form action URLs', () => {
    const h = modelsPage([{ customModel: 'm/a', realModel: 'r' }])
    expect(h).toContain('/admin/models/delete/')
    expect(h).toContain('/admin/models/move/')
    expect(h).toContain('/admin/models/toggle-hidden/')
  })
})

import { groupFormPage } from '../src/views/groupForm.js'
import { userFormPage } from '../src/views/userForm.js'
import { jsonEditor } from '../src/views/jsonEditor.js'

describe('remaining admin components', () => {
  it('group form has model selectors', () => {
    const h = groupFormPage({ name: 'g1', models: ['m1'] }, [{ customModel: 'm1' }, { customModel: 'm2' }])
    expect(h).toContain('Model Group')
    expect(h).toContain('可用模型')
    expect(h).toContain('已选模型（按顺序）')
    expect(h).toContain('/admin/model-groups/edit/g1/remove-model')
  })
  it('user form has model permission checkboxes', () => {
    const h = userFormPage({ name: 'u1', apikey: 'sk-1', allowedModels: ['m1'] }, ['m1', 'm2'])
    expect(h).toContain('模型权限')
    expect(h).toContain('sk-1')
    expect(h).toContain('不选择任何模型表示不限制')
  })
  it('json editor has validate/format/clear', () => {
    const h = jsonEditor('defaultParams', '{"temperature":0.7}')
    expect(h).toContain('jsonEditorValidate')
    expect(h).toContain('jsonEditorFormat')
    expect(h).toContain('text')
  })
})

describe('original model-test view assertions', () => {
  const h = modelFormPage({ customModel: 'm', realModel: 'r' }, ['$key1$'])
  it('renders details and all required ids', () => {
    for (const s of ['<details', '测试模型配置', 'id="testMessage"', '请介绍一下你自己', 'id="testBtn"', '发送测试请求', 'id="testLoading"', 'id="testResult"', 'id="testResultContent"', 'id="testResultModel"', 'id="testResultUsage"', 'id="testError"', 'id="testErrorMessage"', 'id="testRawResponse"', 'id="rawResponseSection"']) expect(h).toContain(s)
  })
  it('has onclick runTest and global functions', () => {
    expect(h).toContain('onclick="runTest()"')
    expect(h).toContain('window.runTest =')
    expect(h).toContain('window.toggleRawResponse =')
    expect(h).toContain('apiKeySource')
    expect(h).toContain('apiKeyId')
  })
})

import { privacyPage } from '../src/views/privacy.js'
describe('original privacy-settings view assertions', () => {
  const settings = { enabled: false, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: '__USER__', whitelistFilter: false }
  it('renders original labels and banners', () => {
  const h = privacyPage(settings)
  for (const s of ['隐私保护', '启用隐私保护', '抹掉 user 字段', '文件路径用户名替换', '白名单字段过滤', '日志记录', '记录完整请求/响应日志']) expect(h).toContain(s)
  expect(h).not.toContain('checked')
  expect(privacyPage(settings, false, false, '加载失败')).toContain('加载失败')
  expect(privacyPage(settings, false, false, undefined, '设置已保存')).toContain('设置已保存')
  const debug = privacyPage(settings, false, true)
  expect(debug).toContain('--debug')
  expect(debug).toContain('disabled')
  })
})

describe('original users-page view assertions', () => {
  it('renders all-models and overflow tags', () => {
    expect(usersPage([{ name: 'u', apikey: 'k', allowedModels: [] }])).toContain('所有模型')
    const many = usersPage([{ name: 'u', apikey: 'k', allowedModels: ['m1', 'm2', 'm3', 'm4', 'm5'] }])
    expect(many).toContain('m1'); expect(many).toContain('m2'); expect(many).toContain('m3')
    expect(many).toContain('等2个模型'); expect(many).not.toContain('m4'); expect(many).not.toContain('m5')
  })
})

describe('original admin-auth view assertions', () => {
  it('setup page shows setup text, login page shows login', () => {
    const setup = adminLoginPage(true)
    expect(setup).toContain('设置管理员密码')
    expect(setup).not.toContain('>登录<')
    expect(adminLoginPage(false)).toContain('管理员登录')
  })
})

describe('console shell redesign', () => {
  it('applies centered desktop container and mobile adaptations', () => {
    const h = adminPage('模型', '/admin/models', '<div class="stat-card"></div>', '')
    expect(h).toContain('max-width:1180px!important')
    expect(h).toContain('@media (max-width:768px)')
    expect(h).toContain('overflow-x:auto')
    expect(h).toContain('--gw-bg:#F5F7FA')
    expect(h).toContain('prefers-reduced-motion')
    expect(h).toContain('min-height:44px')
  })
})

describe('per-page styling layer', () => {
  it('injects page-specific refinements for every admin page', () => {
    const h = adminPage('x', '/admin/models', '', '')
    expect(h).toContain('.models-table .model-name-cell')
    expect(h).toContain('.user-card-header')
    expect(h).toContain('.key-card')
    expect(h).toContain('.model-selector')
  })
})


it('group create form submits selected models', () => {
  const h = groupFormPage(undefined, [{ customModel: 'm1' }, { customModel: 'm2' }])
  expect(h).toContain('name="models"')
  expect(h).toContain('name="modelCheckbox"')
  expect(h).toContain('value="m1"')
  expect(h).toContain('input[name="models"]')
})

describe('unified shell coverage for remaining pages', () => {
  it('all remaining admin pages use the shared shell', () => {
    const pages = [
      modelFormPage({ customModel: 'm', realModel: 'r' }, []),
      modelLimitsPage('m', []),
      announcementPage('hello'),
      passwordPage(true),
      privacyPage({ enabled: false, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: 'USER', whitelistFilter: false }),
      userFormPage({ name: 'u' }, []),
      groupFormPage({ name: 'g', models: [] }, []),
    ]
    for (const h of pages) {
      expect(h).toContain('ui-topbar')
      expect(h).toContain('ui-main')
      expect(h).toContain('ui-nav-link')
      expect(h).toContain('ui-page-head')
      expect(h).toContain('ui-panel')
    }
  })
})

describe('stats daily heatmap', () => {
  it('renders a compact GitHub-style heatmap instead of badge rows', () => {
    const h = statsPage({
      startDate: '2026-11-23', endDate: '2026-11-23', dateRange: '2026-11-23 ~ 2026-11-23',
      totalRequests: 1, successfulRequests: 1, failedRequests: 0,
      totalInputTokens: 10, totalOutputTokens: 20, totalTokens: 30, totalCachedTokens: 0, avgDuration: 0,
      byModel: {}, byDate: { '2026-11-23': 1 }, byHour: {},
      dailyHeatmap: [{ date: '2026-11-23', requests: 1, totalTokens: 30 }],
      heatmapStart: '2026-11-23', heatmapEnd: '2026-11-23',
    } as any)
    expect(h).toContain('每日 Token 消耗')
    expect(h).toContain('过去 1 天')
    expect(h).toContain('heatmap-months')
    expect(h).toContain('heatmap-cell')
    expect(h).not.toContain('ui-badge title="2026-11-23: 1"')
  })
})
