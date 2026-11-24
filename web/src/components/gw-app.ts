import { LitElement, html, css, type TemplateResult } from 'lit'
import { globalCSS } from '../styles/tokens-lit.js'
import { currentPath, subscribe } from '../router.js'

import './gw-shell.js'

type Route = {
  pattern: RegExp
  page: string
  title?: string
  load: () => Promise<unknown>
}

const routes: Route[] = [
  { pattern: /^\/$/, page: 'gw-models-page', title: '模型管理', load: () => import('./pages/gw-models-page.js') },
  { pattern: /^\/admin\/models\/edit\//, page: 'gw-model-form-page', title: '编辑模型', load: () => import('./pages/gw-model-form-page.js') },
  { pattern: /^\/admin\/models\/[^/]+\/limits$/, page: 'gw-model-limits-page', title: '模型限制', load: () => import('./pages/gw-model-limits-page.js') },
  { pattern: /^\/admin\/models\/new$/, page: 'gw-model-form-page', title: '新增模型', load: () => import('./pages/gw-model-form-page.js') },
  { pattern: /^\/admin\/model-groups\/(?:new|edit\/.*)$/, page: 'gw-group-form-page', title: '模型分组', load: () => import('./pages/gw-group-form-page.js') },
  { pattern: /^\/admin\/users\/(?:new|edit\/.*)$/, page: 'gw-user-form-page', title: '用户', load: () => import('./pages/gw-user-form-page.js') },
  { pattern: /^\/admin\/api-keys\/edit\//, page: 'gw-api-keys-page', title: 'API Keys', load: () => import('./pages/gw-api-keys-page.js') },
  { pattern: /^\/admin\/models$/, page: 'gw-models-page', title: '模型管理', load: () => import('./pages/gw-models-page.js') },
  { pattern: /^\/admin\/model-groups$/, page: 'gw-groups-page', title: '模型分组', load: () => import('./pages/gw-groups-page.js') },
  { pattern: /^\/admin\/users$/, page: 'gw-users-page', title: '用户管理', load: () => import('./pages/gw-users-page.js') },
  { pattern: /^\/admin\/api-keys$/, page: 'gw-api-keys-page', title: 'API Keys', load: () => import('./pages/gw-api-keys-page.js') },
  { pattern: /^\/admin\/password$/, page: 'gw-password-page', title: '密码设置', load: () => import('./pages/gw-password-page.js') },
  { pattern: /^\/admin\/privacy$/, page: 'gw-privacy-page', title: '隐私保护', load: () => import('./pages/gw-privacy-page.js') },
  { pattern: /^\/admin\/announcement$/, page: 'gw-announcement-page', title: '公告管理', load: () => import('./pages/gw-announcement-page.js') },
  { pattern: /^\/admin\/stats$/, page: 'gw-stats-page', title: '统计 Dashboard', load: () => import('./pages/gw-stats-page.js') },
  { pattern: /^\/admin\/login$/, page: 'gw-login-page', load: () => import('./pages/gw-login-page.js') },
  { pattern: /^\/user\/login$/, page: 'gw-login-page', load: () => import('./pages/gw-login-page.js') },
  { pattern: /^\/user\/main$/, page: 'gw-user-home-page', title: '控制台', load: () => import('./pages/gw-user-home-page.js') },
  { pattern: /^\/user\/stats$/, page: 'gw-user-stats-page', title: '使用统计', load: () => import('./pages/gw-user-stats-page.js') },
]

function matchRoute(pathname: string): Route | undefined {
  return routes.find(r => r.pattern.test(pathname))
}

export function routeForPath(pathname: string): string {
  return matchRoute(pathname)?.page ?? 'gw-models-page'
}

export class GwApp extends LitElement {
  static styles = css`${globalCSS}:host{display:block}`

  static properties = { path: { state: true } }

  path = currentPath()
  private unsubscribe?: () => void
  private routeToken = 0

  connectedCallback(): void {
    super.connectedCallback()
    if (this.path === '/') { history.replaceState({}, '', '/admin/models'); this.path = currentPath() }
    this.unsubscribe = subscribe(path => { this.path = path })
  }

  disconnectedCallback(): void {
    this.unsubscribe?.()
    super.disconnectedCallback()
  }

  protected updated(): void {
    const host = this.shadowRoot?.querySelector('.gw-page-host')
    if (!host) return
    const pathname = this.path.split('?')[0].split('#')[0]
    const route = matchRoute(pathname)
    if (!route) return

    const token = ++this.routeToken
    void route.load().then(() => {
      if (token !== this.routeToken) return
      let page = host.firstElementChild as any
      if (!page || page.tagName.toLowerCase() !== route.page) {
        host.replaceChildren(document.createElement(route.page))
        page = host.firstElementChild as any
      }
      const m = pathname.match(/^\/admin\/models\/([^/]+)\/limits$/)
      Object.assign(page, {
        path: this.path,
        ...(route.title ? { title: route.title } : {}),
        ...(m ? { model: decodeURIComponent(m[1]) } : {}),
      })
    })
  }

  render(): TemplateResult {
    return html`<div class="gw-page-host"></div>`
  }
}

if (!customElements.get('gw-app')) customElements.define('gw-app', GwApp)
