import { LitElement, html, css, type TemplateResult } from 'lit'
import { uiCSS } from '../ui.js'
import { api } from '../../api.js'

export class GwLoginPage extends LitElement {
  static styles = [uiCSS, css`
  :host{display:block}
  .ui-login-wrap{min-height:100vh;display:grid;place-items:center;padding:24px}
  .ui-login-card{width:min(100%,420px);background:#fff;border:1px solid var(--ui-line);border-radius:16px;box-shadow:0 24px 60px rgba(16,24,40,.10);padding:28px}
  .ui-login-mark{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--ui-accent);color:#fff;font-weight:800;margin-bottom:16px}
  .ui-login-title{font-size:22px;margin:0 0 6px}.ui-login-sub{margin:0 0 22px;color:var(--ui-muted);font-size:13px}
  `]
  static properties = { error: { state: true }, mode: { state: true }, path: { state: true } }

  mode: 'admin-setup' | 'admin-login' | 'user-login' = 'admin-login'
  error = ''
  path = location.pathname

  connectedCallback(): void {
    super.connectedCallback()
    this.loadMode()
  }

  private loadMode(): void {
    if (this.path !== '/admin/login') {
      if (this.path === '/user/login') this.mode = 'user-login'
      return
    }
    void api<any>('/api/admin/auth-status').then(r => {
      this.mode = r.data?.passwordConfigured ? 'admin-login' : 'admin-setup'
    }).catch(e => { this.error = e.message })
  }

  protected updated(changed: Map<string, unknown>): void {
    if (!changed.has('path')) return
    this.loadMode()
  }

  render(): TemplateResult {
    const setup = this.mode === 'admin-setup'
    const isAdmin = this.mode !== 'user-login'
    const heading = setup ? '设置管理员密码' : isAdmin ? '管理员登录' : '用户登录'
    const sub = setup ? '首次使用请设置管理员密码' : isAdmin ? '登录后管理模型、密钥与统计信息。' : '使用用户 API Key 查看可用模型与用量。'
    const action = isAdmin ? '/api/admin/login' : '/api/user/login'
    const label = isAdmin ? '密码' : 'API Key'
    const name = isAdmin ? 'password' : 'apikey'
    const btn = setup ? '设置密码' : '登录'
    return html`<div class="ui-login-wrap"><div class="ui-login-card"><div class="ui-login-mark">L</div><h1 class="ui-login-title">${heading}</h1>
<p class="ui-login-sub">${sub}</p>
${this.error ? html`<div class="ui-notice ui-notice-error">${this.error}</div>` : ''}
<form method="post" action=${action}><label class="ui-field"><span class="ui-field-label">${label}</span><input class="ui-input" type="password" name=${name} placeholder=${isAdmin ? '请输入密码' : '请输入 API Key'} required></label><button class="ui-btn ui-btn-primary" style="width:100%">${btn}</button></form>
</div></div>`
  }
}
if (!customElements.get('gw-login-page')) customElements.define('gw-login-page', GwLoginPage)
