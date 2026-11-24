import { html, type TemplateResult } from 'lit'
import { GwPage } from '../gw-page.js'
import { loadData } from '../loaders.js'
import { pageHeader, panel, notice, empty, uiCSS } from '../ui.js'

export interface UserView { name: string; apikey: string; desc?: string; allowedModels?: string[] }

export class GwUsersPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true }, enabled: { state: true } }
  data: UserView[] = []
  enabled = true
  error = ''

  protected load(): Promise<void> {
    return loadData(this.path).then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    const cards = this.data.map(u => html`<article class="ui-panel" style="margin:0">
      <div class="ui-panel-head"><div><h3 class="ui-panel-title">${u.name}</h3><p class="ui-panel-sub">${u.desc || '—'}</p></div><a class="ui-btn ui-btn-sm" href=${`/admin/users/edit/${encodeURIComponent(u.name)}`}>编辑</a></div>
      <div class="ui-panel-body">
        <div class="ui-field-hint ui-mono" style="margin-bottom:10px">${u.apikey.slice(0, 8)}…</div>
        <div class="ui-row">${!u.allowedModels || u.allowedModels.length === 0 ? html`<span class="ui-badge">所有模型</span>` : html`${u.allowedModels.slice(0, 3).map(m => html`<span class="ui-badge">${m}</span>`)}${(u.allowedModels?.length || 0) > 3 ? html`<span class="ui-field-hint">等${u.allowedModels!.length - 3}个模型</span>` : ''}`}</div>
        <div class="ui-row" style="margin-top:14px"><form method="post" action=${`/api/admin/users/delete/${encodeURIComponent(u.name)}`}><button class="ui-btn ui-btn-sm ui-btn-danger">删除</button></form></div>
      </div></article>`)
    const toggle = html`<form method="post" action="/admin/users/toggle"><input type="hidden" name="enabled" value=${this.enabled ? 'false' : 'true'}><button class="ui-btn">${this.enabled ? '禁用用户认证' : '启用用户认证'}</button></form>`
    return html`
${pageHeader({ eyebrow: 'Access', title: '用户管理', subtitle: '管理访问 API 的用户和密钥', actions: html`<a class="ui-btn ui-btn-primary" href="/admin/users/new">+ 新增用户</a>${toggle}` })}
${this.error ? notice(this.error, 'error') : ''}
${this.data.length ? html`<div class="ui-grid ui-grid-auto">${cards}</div>` : panel('用户列表', '', empty('暂无用户', '添加用户后即可按密钥限制访问。'))}
`
  }
}
if (!customElements.get('gw-users-page')) customElements.define('gw-users-page', GwUsersPage)
