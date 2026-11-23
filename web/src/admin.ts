import { api } from './api.js'
import { modelsPage } from './views/models.js'
import { groupsPage } from './views/groups.js'
import { usersPage } from './views/users.js'
import { apiKeysPage } from './views/apiKeys.js'
import { passwordPage } from './views/password.js'
import { privacyPage } from './views/privacy.js'
import { announcementPage } from './views/announcement.js'
import { modelFormPage } from './views/modelForm.js'
import { modelLimitsPage } from './views/modelLimits.js'
import { statsPage } from './views/stats.js'
import { adminLoginPage, userLoginPage } from './views/login.js'
import { userHomePage } from './views/userHome.js'
import { userStatsPage } from './views/userStats.js'
import { groupFormPage } from './views/groupForm.js'
import { userFormPage } from './views/userForm.js'

export interface PageContext { path: string; version: string }
export type PageRenderer = (ctx: PageContext) => Promise<string> | string

const q = (name: string) => new URLSearchParams(location.search).get(name) || ''
const today = () => new Date().toISOString().slice(0, 10)

export const renderers: Record<string, PageRenderer> = {
  '/admin/models': async () => modelsPage((await api<any[]>('/api/admin/models')).data || []),
  '/admin/model-groups': async () => groupsPage((await api<any[]>('/api/admin/model-groups')).data || []),
  '/admin/users': async () => usersPage((await api<any[]>('/api/admin/users')).data || []),
  '/admin/api-keys': async () => apiKeysPage((await api<any[]>('/api/admin/api-keys')).data || []),
  '/admin/password': () => passwordPage(true),
  '/admin/privacy': async () => privacyPage((await api<any>('/api/admin/privacy')).data?.settings || { enabled: false, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: 'USER' }),
  '/admin/announcement': async () => announcementPage((await api<any>('/api/admin/announcement')).data?.content || ''),
  '/admin/models/new': () => modelFormPage(undefined, []),
  '/admin/model-groups/new': async () => groupFormPage(undefined, (await api<any[]>('/api/admin/models')).data || []),
  '/admin/users/new': async () => userFormPage(undefined, (await api<any[]>('/api/admin/models')).data || []),
  '/admin/stats': async () => {
    const d = (await api<any>('/api/admin/stats' + location.search)).data || {}
    return statsPage({
      startDate: q('startDate') || today(), endDate: q('endDate') || q('startDate') || today(),
      dateRange: d.dateRange || '', userName: q('userName'), model: q('model'),
      totalRequests: d.totalRequests || 0, successfulRequests: d.successfulRequests || 0, failedRequests: d.failedRequests || 0,
      totalInputTokens: d.totalInputTokens || 0, totalOutputTokens: d.totalOutputTokens || 0,
      totalTokens: d.totalTokens || 0, totalCachedTokens: d.totalCachedTokens || 0, avgDuration: d.avgDuration || 0,
      byModel: d.byModel || {}, byDate: d.byDate || {}, byHour: d.byHour || {},
      page: d.page, totalPages: d.totalPages, details: d.details || [],
    })
  },
  '/admin/login': () => adminLoginPage(false),
  '/user/login': () => userLoginPage(),
  '/user/main': async () => {
    const d = (await api<any>('/api/user/config')).data || {}
    return userHomePage({ models: (d.models || []).map((m: any) => m.customModel), modelGroups: (d.modelGroups || []).map((g: any) => g.name), announcement: d.announcement, userName: q('userName') })
  },
  '/user/stats': async () => {
    const d = (await api<any>('/api/user/stats' + location.search)).data || {}
    return userStatsPage({ userName: q('userName') || 'User', start: q('startDate') || today(), end: q('endDate') || today(), totalRequests: d.total || 0, successfulRequests: d.successful || 0, totalTokens: d.totalTokens || 0, avgDuration: d.avgDuration || 0, byModel: d.byModel || {}, byDate: d.byDate || {} })
  },
}

// Dynamic editor/limits routes
export async function renderAdmin(ctx: PageContext): Promise<string> {
  let path = ctx.path
  let m: RegExpMatchArray | null
  if ((m = path.match(/^\/admin\/models\/edit\/(.+)$/))) {
    const models = (await api<any[]>('/api/admin/models')).data || []
    return modelFormPage(models.find(x => x.customModel === decodeURIComponent(m![1])), [])
  }
  if ((m = path.match(/^\/admin\/models\/([^/]+)\/limits$/))) return modelLimitsPage(decodeURIComponent(m[1]), (await api<any[]>(`/api/admin/models/${m[1]}/limits`)).data || [])
  if ((m = path.match(/^\/admin\/model-groups\/edit\/(.+)$/))) {
    const groups = (await api<any[]>('/api/admin/model-groups')).data || []
    const g = groups.find(x => x.name === decodeURIComponent(m![1]))
    return groupFormPage(g, (await api<any[]>('/api/admin/models')).data || [])
  }
  if ((m = path.match(/^\/admin\/users\/edit\/(.+)$/))) {
    const users = (await api<any[]>('/api/admin/users')).data || []
    const u = users.find(x => x.name === decodeURIComponent(m![1]))
    const models = (await api<any[]>('/api/admin/models')).data || []
    return userFormPage(u, models.map((x: any) => x.customModel))
  }
  const fn = renderers[path]
  if (!fn) return modelsPage([], `Page not implemented: ${path}`, ctx.version)
  try { return await fn(ctx) } catch (e) { return modelsPage([], (e as Error).message, ctx.version) }
}

if (typeof document !== 'undefined' && (document as any).readyState !== 'loading') {
  const root = document.getElementById('app')
  if (root) renderAdmin({ path: location.pathname, version: '1.15.0' }).then(html => {
    document.open(); document.write(html); document.close()
  })
}
