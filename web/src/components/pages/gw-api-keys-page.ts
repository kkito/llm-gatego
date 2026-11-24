import { html, type TemplateResult } from 'lit'
import { api, postAndNavigate, submitAndNavigate } from '../../api.js'
import { currentPath } from '../../router.js'
import { GwPage } from '../gw-page.js'
import { pageHeader, panel, notice, empty, table, formField, uiCSS } from '../ui.js'

export interface KeyView { id: string; name: string; key?: string; keyHint?: string; createdAt?: number }
export interface EditingKeyView { id: string; name: string; keyHint: string }

async function loadKeys(): Promise<KeyView[]> { return (await api<any[]>('/api/admin/api-keys')).data || [] }

export class GwApiKeysPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true }, success: { state: true }, editing: { state: true } }
  data: KeyView[] = []
  error = ''
  success = ''
  editing?: EditingKeyView

  private async deleteItem(k: KeyView): Promise<void> {
    if (!k || !confirm(`确定删除 ${k.name}?`)) return
    try {
      await postAndNavigate(`/api/admin/api-keys/delete/${encodeURIComponent(k.id)}`, {}, currentPath())
      await this.load()
    } catch (e) { this.error = (e as Error).message }
  }
  private async submit(e: Event): Promise<void> {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const url = this.editing ? `/api/admin/api-keys/edit/${encodeURIComponent(this.editing.id)}` : '/api/admin/api-keys'
    try {
      await submitAndNavigate(form, url, currentPath())
      this.editing = undefined
      this.success = '保存成功'
      await this.load()
    } catch (err) { this.error = (err as Error).message }
  }

  protected load(): Promise<void> {
    return loadKeys().then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    const rows = this.data.map(k => html`<tr>
      <td><strong>${k.name}</strong><div class="ui-field-hint">${k.createdAt ? new Date(k.createdAt).toLocaleDateString('zh-CN') : ''}</div></td>
      <td class="ui-mono">${k.keyHint || (k.key ? '*****' + k.key.slice(-4) : '*****')}</td>
      <td><div class="ui-row">
        <a class="ui-btn ui-btn-sm" href=${`/admin/api-keys/edit/${encodeURIComponent(k.id)}`}>编辑</a>
        <button class="ui-btn ui-btn-sm ui-btn-danger" @click=${() => this.deleteItem(k)}>删除</button>
      </div></td>
    </tr>`)
    const form = html`<form @submit=${(e: Event) => this.submit(e)}>
      ${formField('名称', html`<input class="ui-input" name="name" value=${this.editing ? this.editing.name : ''} placeholder="例如：主网关 Key" required>`)}
      ${formField('API Key', html`<input class="ui-input" name="key" placeholder=${this.editing ? '留空表示保持当前值' : 'sk-...'} ?required=${!this.editing}>`, this.editing ? `当前值：${this.editing.keyHint}` : '')}
      <div class="ui-row"><button class="ui-btn ui-btn-primary">${this.editing ? '保存修改' : '添加密钥'}</button><a class="ui-btn" href="/admin/api-keys">取消</a></div>
    </form>`
    return html`
${pageHeader({ eyebrow: 'Credentials', title: 'API Key 管理', subtitle: '集中维护上游调用使用的密钥，模型配置可通过 $$名称$$ 引用。', actions: html`<a class="ui-btn ui-btn-primary" href="/admin/api-keys">+ 新增密钥</a>` })}
${this.error ? notice(this.error, 'error') : ''}${this.success ? notice(this.success, 'success') : ''}
<div class="ui-grid ui-grid-2">
  ${panel('密钥列表', `${this.data.length} 个已存储密钥`, this.data.length ? table(['名称', 'Key', '操作'], rows) : empty('暂无密钥', '添加第一个 API Key 后即可在模型配置中引用。'))}
  ${panel(this.editing ? '编辑密钥' : '新增密钥', '', form)}
</div>
`
  }
}
if (!customElements.get('gw-api-keys-page')) customElements.define('gw-api-keys-page', GwApiKeysPage)
