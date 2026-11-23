import { api, post } from './api.js'
import './gw-card.js'
import './gw-modal.js'
import './gw-stat.js'
import './gw-table.js'
import { renderModels, renderModelForm, Model } from './pages/models.js'
import { renderGroups } from './pages/groups.js'
import { renderUsers } from './pages/users.js'
import { renderApiKeys } from './pages/apiKeys.js'
import { renderStats } from './pages/stats.js'
import { renderPrivacy } from './pages/privacy.js'
import { renderHome } from './pages/home.js'
import { renderLogin } from './pages/login.js'

export interface AppState { page: string; models: Model[]; groups: any[]; users: any[]; keys: any[]; stats: any; privacy: any }
export function pageForHash(hash: string): string {
  const path = hash.replace(/^#\/?/, '').split('/')[0]
  return path || 'home'
}
export function bindEvents(root: HTMLElement, handlers: Record<string, (el: HTMLElement) => void>): void {
  root.addEventListener('click', e => {
    const el = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null
    if (el && handlers[el.dataset.action || '']) handlers[el.dataset.action || ''](el)
  })
}
export async function loadPage(page: string): Promise<string> {
  try {
    if (page === 'models') return renderModels((await api<Model[]>('/api/admin/models')).data || [])
    if (page === 'groups') return renderGroups((await api<any[]>('/api/admin/model-groups')).data || [])
    if (page === 'users') return renderUsers((await api<any[]>('/api/admin/users')).data || [])
    if (page === 'api-keys') return renderApiKeys((await api<any[]>('/api/admin/api-keys')).data || [])
    if (page === 'stats') return renderStats((await api<any>('/api/stats')).data || { summary: { totalRequests: 0, totalTokens: 0, avgTtft: 0, avgTps: 0, avgDuration: 0 }, byModel: [] })
    if (page === 'privacy') return renderPrivacy((await api<any>('/api/admin/privacy')).data || { enabled: false, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: 'USER' })
    if (page === 'home') return renderHome((await api<any[]>('/api/admin/model-groups')).data || [])
    if (page === 'login') return renderLogin()
  } catch (e) { return `<p class="error">${(e as Error).message}</p>` }
  return '<p class="empty">Not found</p>'
}
export async function mount(root: HTMLElement): Promise<void> {
  const render = async () => { root.innerHTML = await loadPage(pageForHash(location.hash)) }
  window.addEventListener('hashchange', render)
  await render()
}
export { renderModelForm, renderLogin, post }
