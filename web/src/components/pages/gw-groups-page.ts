import { LitElement, html, type TemplateResult } from 'lit'
import { pageHeader, panel, notice, empty, uiCSS } from '../ui.js'

export interface GroupView { name: string; desc?: string; models: string[] }

export class GwGroupsPage extends LitElement {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true }, success: { state: true } }
  data: GroupView[] = []
  error = ''
  success = ''

  render(): TemplateResult {
    const cards = this.data.map(g => html`<article class="ui-panel" style="margin:0">
      <div class="ui-panel-head"><div><h3 class="ui-panel-title">${g.name}</h3><p class="ui-panel-sub">${g.models.length} 个模型</p></div><a class="ui-btn ui-btn-sm" href=${`/admin/model-groups/edit/${encodeURIComponent(g.name)}`}>管理模型</a></div>
      <div class="ui-panel-body"><p class="ui-field-hint">${g.desc || '—'}</p><div class="ui-row" style="margin:10px 0 14px">${g.models.slice(0, 5).map(m => html`<a class="ui-badge" href=${`/admin/models/edit/${encodeURIComponent(m)}`}>${m}</a>`)}${g.models.length > 5 ? html`<span class="ui-field-hint">+${g.models.length - 5}</span>` : ''}</div>
      <form method="POST" action=${`/admin/model-groups/delete/${encodeURIComponent(g.name)}`}><button class="ui-btn ui-btn-sm ui-btn-danger">删除分组</button></form></div></article>`)
    return html`
${pageHeader({ eyebrow: 'Routing', title: '模型分组', subtitle: '管理模型分组配置', actions: html`<a class="ui-btn" href="/admin/models">返回模型</a><a class="ui-btn ui-btn-primary" href="/admin/model-groups/new">+ 新建分组</a>` })}
${this.error ? notice(this.error, 'error') : ''}${this.success ? notice(this.success, 'success') : ''}
${this.data.length ? html`<div class="ui-grid ui-grid-auto">${cards}</div>` : panel('分组列表', '', empty('暂无分组', '创建分组后可配置模型回退顺序。'))}
`
  }
}
if (!customElements.get('gw-groups-page')) customElements.define('gw-groups-page', GwGroupsPage)
