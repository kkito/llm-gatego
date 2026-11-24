import { html, type TemplateResult } from 'lit'
import { submitAndNavigate } from '../../api.js'
import { GwPage } from '../gw-page.js'
import { loadData } from '../loaders.js'
import { pageHeader, panel, notice, uiCSS } from '../ui.js'

export interface UserFormData { name?: string; description?: string; apiKey?: string; groups?: string[]; allowedModels?: string[]; apikey?: string; [k: string]: unknown }

export class GwUserFormPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true } }
  data: { user?: UserFormData; models: Array<{ name: string; desc?: string } | string>; error?: string; success?: string } = { models: [] }
  error = ''

  private async submit(e: Event): Promise<void> {
    e.preventDefault()
    const isEdit = !!this.data.user?.name
    const url = isEdit ? `/api/admin/users/edit/${encodeURIComponent(this.data.user!.name!)}` : '/api/admin/users'
    try { await submitAndNavigate(e.currentTarget as HTMLFormElement, url) } catch (err) { this.error = (err as Error).message }
  }

  protected load(): Promise<void> {
    return loadData(this.path).then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    const user = this.data.user || {}
    const isEdit = !!user.name
    const title = isEdit ? '编辑用户' : '新增用户'
    const groups = Array.isArray(user.allowedModels) ? user.allowedModels : (Array.isArray(user.groups) ? user.groups : [])
    const opts = (this.data.models || []).map(g => typeof g === 'string' ? { name: g, desc: '' } : g)
    const err = this.error || this.data.error || ''
    return html`
${pageHeader({ eyebrow: 'USER', title, subtitle: isEdit ? `用户：${user.name || ''}` : '创建用户并分配用户组', actions: html`<a class="ui-btn" href="/admin/users">返回用户列表</a>` })}
${err ? notice(err, 'error') : ''}${this.data.success ? notice(this.data.success, 'success') : ''}
${panel('', '', html`<div class="form-card"><form @submit=${(e: Event) => this.submit(e)}>
  <div class="form-group"><label class="form-label" for="name">用户名</label><input class="form-input" id="name" name="name" value=${user.name || ''} ?readonly=${isEdit}></div>
  <div class="form-group"><label class="form-label" for="description">描述</label><input class="form-input" id="description" name="description" value=${user.description || ''}></div>
  <div class="form-group"><label class="form-label" for="apiKey">API Key</label><input class="form-input" id="apiKey" name="apiKey" value=${(user as any).apikey || user.apiKey || ''} placeholder="留空自动生成"></div>
  <div class="form-group"><label class="form-label">模型权限</label><div class="checkbox-list">${opts.map(g => html`<label class="checkbox-item"><input type="checkbox" name="allowedModels" value=${g.name} ?checked=${groups.includes(g.name)}> ${g.name} <span class="model-item-desc">${g.desc || ''}</span></label>`)}<span class="form-hint">不选择任何模型表示不限制</span></div></div>
  <div class="form-actions"><button class="btn btn-primary" type="submit">保存用户</button><a class="btn btn-secondary" href="/admin/users">取消</a></div>
</form></div>`)}
`
  }
}
if (!customElements.get('gw-user-form-page')) customElements.define('gw-user-form-page', GwUserFormPage)
