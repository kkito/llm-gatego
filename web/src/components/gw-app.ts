import { LitElement, html, css, type TemplateResult } from 'lit'
import { globalCSS } from '../styles/tokens-lit.js'
import { api } from '../api.js'

export function routeForPath(pathname: string): string {
  if (pathname === '/') return 'gw-models-page'
  if (/^\/admin\/models\/edit\//.test(pathname)) return 'gw-model-form-page'
  if (/^\/admin\/models\/[^/]+\/limits$/.test(pathname)) return 'gw-model-limits-page'
  if (pathname === '/admin/models/new') return 'gw-model-form-page'
  if (pathname === '/admin/model-groups/new' || /^\/admin\/model-groups\/edit\//.test(pathname)) return 'gw-group-form-page'
  if (pathname === '/admin/users/new' || /^\/admin\/users\/edit\//.test(pathname)) return 'gw-user-form-page'
  if (/^\/admin\/api-keys\/edit\//.test(pathname)) return 'gw-api-keys-page'
  const map: Record<string, string> = {
    '/admin/models': 'gw-models-page',
    '/admin/model-groups': 'gw-groups-page',
    '/admin/users': 'gw-users-page',
    '/admin/api-keys': 'gw-api-keys-page',
    '/admin/password': 'gw-password-page',
    '/admin/privacy': 'gw-privacy-page',
    '/admin/announcement': 'gw-announcement-page',
    '/admin/stats': 'gw-stats-page',
    '/admin/login': 'gw-login-page',
    '/user/login': 'gw-login-page',
    '/user/main': 'gw-user-home-page',
    '/user/stats': 'gw-user-stats-page',
  }
  return map[pathname] || 'gw-models-page'
}

const q = (name: string): string => new URLSearchParams(location.search).get(name) || ''
const today = (): string => new Date().toISOString().slice(0, 10)

// Same data shape the legacy renderers consumed. Kept here verbatim so the
// transition from string HTML to Lit page components cannot change API calls.
export async function loadPageData(pathname: string): Promise<unknown> {
  if (pathname === '/') return []
  if (pathname === '/admin/models') return (await api<any[]>('/api/admin/models')).data || []
  if (pathname === '/admin/model-groups') return (await api<any[]>('/api/admin/model-groups')).data || []
  if (pathname === '/admin/users') return (await api<any[]>('/api/admin/users')).data || []
  if (pathname === '/admin/api-keys') return (await api<any[]>('/api/admin/api-keys')).data || []
  if (pathname === '/admin/privacy') return (await api<any>('/api/admin/privacy')).data?.settings || { enabled: false, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: 'USER' }
  if (pathname === '/admin/announcement') return (await api<any>('/api/admin/announcement')).data?.content || ''
  if (pathname === '/admin/models/new') return (await api<any[]>('/api/admin/api-keys')).data || []
  if (pathname === '/admin/model-groups/new') return (await api<any[]>('/api/admin/models')).data || []
  if (pathname === '/admin/users/new') return (await api<any[]>('/api/admin/models')).data || []
  if (pathname === '/admin/stats') {
    const search = location.search
    const d = (await api<any>('/api/admin/stats' + search)).data || {}
    return {
      startDate: q('startDate') || today(), endDate: q('endDate') || q('startDate') || today(),
      dateRange: d.dateRange || '', userName: q('userName'), model: q('model'),
      totalRequests: d.totalRequests || 0, successfulRequests: d.successfulRequests || 0, failedRequests: d.failedRequests || 0,
      totalInputTokens: d.totalInputTokens || 0, totalOutputTokens: d.totalOutputTokens || 0,
      totalTokens: d.totalTokens || 0, totalCachedTokens: d.totalCachedTokens || 0, avgDuration: d.avgDuration || 0,
      byModel: d.byModel || {}, byDate: d.byDate || {}, byHour: d.byHour || {},
      dailyHeatmap: d.dailyHeatmap || [], heatmapStart: d.heatmapStart || '', heatmapEnd: d.heatmapEnd || '',
      page: d.page, totalPages: d.totalPages, details: d.details || [],
    }
  }
  if (pathname === '/admin/login') return !(await api<any>('/api/admin/auth-status')).data?.passwordConfigured
  if (pathname === '/user/main') {
    const d = (await api<any>('/api/user/config')).data || {}
    return { models: (d.models || []).map((m: any) => m.customModel), modelGroups: (d.modelGroups || []).map((g: any) => g.name), announcement: d.announcement, userName: q('userName') }
  }
  if (pathname === '/user/stats') {
    const d = (await api<any>('/api/user/stats' + location.search)).data || {}
    return { userName: q('userName') || 'User', start: q('startDate') || today(), end: q('endDate') || today(), totalRequests: d.total || 0, successfulRequests: d.successful || 0, totalTokens: d.totalTokens || 0, avgDuration: d.avgDuration || 0, byModel: d.byModel || {}, byDate: d.byDate || {} }
  }
  if (pathname === '/user/login' || pathname === '/admin/password') return undefined
  let m: RegExpMatchArray | null
  if ((m = pathname.match(/^\/admin\/models\/edit\/(.+)$/))) {
    const models = (await api<any[]>('/api/admin/models')).data || []
    const model = models.find(x => x.customModel === decodeURIComponent(m![1]))
    const keys = (await api<any[]>('/api/admin/api-keys')).data || []
    const ref = model?.apiKey?.startsWith('$$') && model.apiKey.endsWith('$$') ? model.apiKey.slice(2, -2) : ''
    return { model, keys, version: '1.15.0', ref }
  }
  if ((m = pathname.match(/^\/admin\/models\/([^/]+)\/limits$/))) return (await api<any[]>(`/api/admin/models/${m[1]}/limits`)).data || []
  if ((m = pathname.match(/^\/admin\/model-groups\/edit\/(.+)$/))) {
    const groups = (await api<any[]>('/api/admin/model-groups')).data || []
    const g = groups.find(x => x.name === decodeURIComponent(m![1]))
    return { group: g, models: (await api<any[]>('/api/admin/models')).data || [] }
  }
  if ((m = pathname.match(/^\/admin\/users\/edit\/(.+)$/))) {
    const users = (await api<any[]>('/api/admin/users')).data || []
    const u = users.find(x => x.name === decodeURIComponent(m![1]))
    return { user: u, models: ((await api<any[]>('/api/admin/models')).data || []).map((x: any) => x.customModel) }
  }
  if ((m = pathname.match(/^\/admin\/api-keys\/edit\/(.+)$/))) {
    const all = (await api<any[]>('/api/admin/api-keys')).data || []
    const k = all.find(x => x.id === decodeURIComponent(m![1]))
    return { keys: all, error: k ? undefined : '未找到该 API Key', edit: k ? { id: k.id, name: k.name, keyHint: k.keyHint || '*****' } : undefined }
  }
  return []
}

export class GwApp extends LitElement {
  static styles = css`${globalCSS}:host{display:block}`

  data: unknown = []
  error = ''
  private path = location.pathname

  connectedCallback(): void {
    super.connectedCallback()
    if (this.path === '/') { location.replace('/admin/models'); return }
    this.load()
  }

  private async load(): Promise<void> {
    try { this.data = await loadPageData(this.path) }
    catch (e) { this.error = (e as Error).message }
  }

  render(): TemplateResult {
    const tag = routeForPath(this.path)
    // Page components are registered in Tasks 4-6; until then the legacy
    // admin.ts bootstrap remains the active renderer.
    return html`<div class="gw-app-root" data-tag=${tag}>${this.error ? html`<div class="ui-notice ui-notice-error">${this.error}</div>` : ''}<slot></slot></div>`
  }
}

if (!customElements.get('gw-app')) customElements.define('gw-app', GwApp)
