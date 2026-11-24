import { LitElement, html, css, type TemplateResult } from 'lit'
import { globalCSS } from '../styles/tokens-lit.js'
import { currentPath, subscribe } from '../router.js'

// Import for side effects: registers every page custom element.
import './gw-shell.js'
import './pages/gw-models-page.js'
import './pages/gw-groups-page.js'
import './pages/gw-users-page.js'
import './pages/gw-api-keys-page.js'
import './pages/gw-announcement-page.js'
import './pages/gw-privacy-page.js'
import './pages/gw-password-page.js'
import './pages/gw-model-form-page.js'
import './pages/gw-group-form-page.js'
import './pages/gw-user-form-page.js'
import './pages/gw-model-limits-page.js'
import './pages/gw-stats-page.js'
import './pages/gw-user-home-page.js'
import './pages/gw-user-stats-page.js'
import './pages/gw-login-page.js'

type Route = { pattern: RegExp; page: string; title?: string }

const routes: Route[] = [
  { pattern: /^\/$/, page: 'gw-models-page', title: '模型管理' },
  { pattern: /^\/admin\/models\/edit\//, page: 'gw-model-form-page', title: '编辑模型' },
  { pattern: /^\/admin\/models\/[^/]+\/limits$/, page: 'gw-model-limits-page', title: '模型限制' },
  { pattern: /^\/admin\/models\/new$/, page: 'gw-model-form-page', title: '新增模型' },
  { pattern: /^\/admin\/model-groups\/(?:new|edit\/.*)$/, page: 'gw-group-form-page', title: '模型分组' },
  { pattern: /^\/admin\/users\/(?:new|edit\/.*)$/, page: 'gw-user-form-page', title: '用户' },
  { pattern: /^\/admin\/api-keys\/edit\//, page: 'gw-api-keys-page', title: 'API Keys' },
  { pattern: /^\/admin\/models$/, page: 'gw-models-page', title: '模型管理' },
  { pattern: /^\/admin\/model-groups$/, page: 'gw-groups-page', title: '模型分组' },
  { pattern: /^\/admin\/users$/, page: 'gw-users-page', title: '用户管理' },
  { pattern: /^\/admin\/api-keys$/, page: 'gw-api-keys-page', title: 'API Keys' },
  { pattern: /^\/admin\/password$/, page: 'gw-password-page', title: '密码设置' },
  { pattern: /^\/admin\/privacy$/, page: 'gw-privacy-page', title: '隐私保护' },
  { pattern: /^\/admin\/announcement$/, page: 'gw-announcement-page', title: '公告管理' },
  { pattern: /^\/admin\/stats$/, page: 'gw-stats-page', title: '统计 Dashboard' },
  { pattern: /^\/admin\/login$/, page: 'gw-login-page' },
  { pattern: /^\/user\/login$/, page: 'gw-login-page' },
  { pattern: /^\/user\/main$/, page: 'gw-user-home-page', title: '控制台' },
  { pattern: /^\/user\/stats$/, page: 'gw-user-stats-page', title: '使用统计' },
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
    const route = matchRoute(this.path.split('?')[0].split('#')[0])
    if (!route) return
    let page = host.firstElementChild as any
    if (!page || page.tagName.toLowerCase() !== route.page) {
      host.innerHTML = ''
      page = document.createElement(route.page) as any
      host.appendChild(page)
    }
    const pathname = this.path.split('?')[0].split('#')[0]
    const m = pathname.match(/^\/admin\/models\/([^/]+)\/limits$/)
    Object.assign(page, {
      path: this.path,
      ...(route.title ? { title: route.title } : {}),
      ...(m ? { model: decodeURIComponent(m[1]) } : {}),
    })
  }

  render(): TemplateResult {
    return html`<div class="gw-page-host"></div>`
  }
}

if (!customElements.get('gw-app')) customElements.define('gw-app', GwApp)
