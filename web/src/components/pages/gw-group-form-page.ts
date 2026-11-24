import { html, type TemplateResult } from 'lit'
import { pathSegments, queryParam, searchOf, today } from '../page-utils.js'
import { api, postAndNavigate, submitAndNavigate } from '../../api.js'
import { GwPage } from '../gw-page.js'
import { pageHeader, panel, notice, uiCSS } from '../ui.js'

export interface GroupFormData { name?: string; desc?: string; models?: string[] }
export interface ModelOption { customModel: string; desc?: string }

async function loadGroupForm(path: string): Promise<any> { const raw = pathSegments(path)[3] || ''; const groups = (await api<any[]>('/api/admin/model-groups')).data || []; const g = raw ? groups.find(x => x.name === decodeURIComponent(raw)) : undefined; return { group: g, models: (await api<any[]>('/api/admin/models')).data || [] } }

export class GwGroupFormPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true }, selected: { state: true }, filter: { state: true } }
  data: { group?: GroupFormData; models: Array<ModelOption | string>; error?: string; success?: string } = { models: [] }
  error = ''
  selected: string[] = []
  filter = ''

  willUpdate(): void {
    const selected = this.data.group?.models
    if (selected && this.selected.length === 0) this.selected = [...selected]
  }

  private options(): ModelOption[] {
    return (this.data.models || []).map(m => typeof m === 'string' ? { customModel: m } : m)
  }

  private toggleModel(name: string, checked: boolean): void {
    const picked = new Set(this.selected)
    if (checked) picked.add(name)
    else picked.delete(name)
    this.selected = this.options().map(m => m.customModel).filter(n => picked.has(n))
  }

  private removeModel(i: number): void {
    this.selected = this.selected.filter((_, idx) => idx !== i)
  }

  private async submit(e: Event): Promise<void> {
    e.preventDefault()
    const isEdit = !!this.data.group?.name
    const url = isEdit ? `/api/admin/model-groups/edit/${encodeURIComponent(this.data.group!.name!)}` : '/api/admin/model-groups'
    try { await submitAndNavigate(e.currentTarget as HTMLFormElement, url) } catch (err) { this.error = (err as Error).message }
  }
  private async removeFirst(): Promise<void> {
    const name = this.data.group?.name
    if (!name || !this.selected.length) return
    try {
      await postAndNavigate(`/api/admin/model-groups/edit/${encodeURIComponent(name)}/remove-model`, { model: this.selected[0] })
      await this.load()
    } catch (err) { this.error = (err as Error).message }
  }

  protected load(): Promise<void> {
    return loadGroupForm(this.path).then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    const group = this.data.group || {}
    const isEdit = !!group.name
    const title = isEdit ? `编辑 Model Group - ${group.name}` : '新增 Model Group'
    const opts = (this.data.models || []).map(m => typeof m === 'string' ? { customModel: m } : m)
    const err = this.error || this.data.error || ''
    const filtered = opts.filter(m => m.customModel.toLowerCase().includes(this.filter.toLowerCase()))
    return html`
${pageHeader({ eyebrow: 'MODEL GROUP', title, subtitle: '模型组可作为 API model 使用，按顺序选择多个模型实现 fallback', actions: html`<a class="ui-btn" href="/admin/model-groups">返回模型组</a>` })}
${err ? notice(err, 'error') : ''}${this.data.success ? notice(this.data.success, 'success') : ''}
${panel('', '', html`<div class="form-card"><form @submit=${(e: Event) => this.submit(e)}>
  <input type="hidden" name="originalName" value=${group.name || ''}>
  <div class="form-group"><label class="form-label" for="name">组名</label><input class="form-input" id="name" name="name" value=${group.name || ''} placeholder="例如：my-group" required></div>
  <div class="form-group"><label class="form-label" for="desc">描述</label><input class="form-input" id="desc" name="desc" value=${group.desc || ''} placeholder="可选"></div>
  <div class="form-group"><label class="form-label" for="new-model-filter">筛选模型</label><input class="form-input" id="new-model-filter" placeholder="输入模型名过滤" @input=${(e: Event) => { this.filter = (e.target as HTMLInputElement).value }}></div>
  <div class="model-selector"><div><h3 class="model-list-title">可用模型</h3><div class="model-list" id="all-models">${filtered.map(m => html`<label class="model-item" data-name=${m.customModel}><input type="checkbox" name="modelCheckbox" value=${m.customModel} ?checked=${this.selected.includes(m.customModel)} @change=${(e: Event) => this.toggleModel(m.customModel, (e.target as HTMLInputElement).checked)}> <span class="model-item-name">${m.customModel}</span><span class="model-item-desc">${m.desc || ''}</span></label>`)}</div></div>
  <div><h3 class="model-list-title">已选模型（按顺序）</h3><div class="model-list" id="selected-models">${this.selected.length ? this.selected.map((n, i) => html`<div class="model-item"><span class="selected-index">${i + 1}</span><span class="model-item-name">${n}</span><button type="button" class="btn btn-small btn-danger" @click=${() => this.removeModel(i)}>移除</button></div>`) : html`<p class="model-list-empty">尚未选择模型</p>`}</div>${isEdit ? html`<div class="model-actions"><button type="button" class="btn btn-small" @click=${() => this.removeFirst()}>移除首个模型</button></div>` : ''}</div></div>
  <input name="models" type="hidden" .value=${JSON.stringify(this.selected)}>
  <div class="form-actions"><button class="btn btn-primary" type="submit">保存模型组</button><a class="btn btn-secondary" href="/admin/model-groups">取消</a></div>
</form></div>`)}
`
  }
}
if (!customElements.get('gw-group-form-page')) customElements.define('gw-group-form-page', GwGroupFormPage)
