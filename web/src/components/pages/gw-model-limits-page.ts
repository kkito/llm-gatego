import { html, type TemplateResult } from 'lit'
import { postAndNavigate, submitAndNavigate, formToObject } from '../../api.js'
import { currentPath } from '../../router.js'
import { GwPage } from '../gw-page.js'
import { loadData } from '../loaders.js'
import { pageHeader, panel, empty, uiCSS } from '../ui.js'

export interface LimitView {
  type: 'rpm' | 'tpm' | 'cost'; period: 'minute' | 'hour' | 'day'; periodValue: number
  max: number; costMax: number; groupName: string; enabled: boolean; models?: string[]; desc?: string; responseText?: string
}

export class GwModelLimitsPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true }, success: { state: true }, model: { state: true } }
  model = ''
  data: LimitView[] = []
  error = ''
  success = ''
  private isCost = false

  firstUpdated(): void { this.handleTypeChange() }

  private handleTypeChange(): void {
    const t = (this.shadowRoot!.querySelector('#type') as HTMLSelectElement)?.value || 'rpm'
    this.isCost = t === 'cost'
    this.requestUpdate()
  }

  private editLimit(i: number): void {
    const l = this.data[i]
    const sr = this.shadowRoot!
    ;(sr.querySelector('#editIndex') as HTMLInputElement).value = String(i)
    ;(sr.querySelector('#editType') as HTMLSelectElement).value = l.type
    ;(sr.querySelector('#editPeriod') as HTMLSelectElement).value = l.period
    ;(sr.querySelector('#editPeriodValue') as HTMLInputElement).value = String(l.periodValue)
    ;(sr.querySelector('#editMax') as HTMLInputElement).value = String(l.max)
    ;(sr.querySelector('#editCostMax') as HTMLInputElement).value = String(l.costMax)
    ;(sr.querySelector('#editGroupName') as HTMLInputElement).value = l.groupName
  }

  private async refreshAfterWrite(): Promise<void> {
    this.success = '保存成功'
    await this.load()
  }
  private async add(e: Event): Promise<void> {
    e.preventDefault()
    try { await submitAndNavigate(e.currentTarget as HTMLFormElement, `/api/admin/models/${encodeURIComponent(this.model)}/limits/add`, currentPath()); await this.refreshAfterWrite() } catch (err) { this.error = (err as Error).message }
  }
  private async edit(e: Event): Promise<void> {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const index = formToObject(form).index
    try { await submitAndNavigate(form, `/api/admin/models/${encodeURIComponent(this.model)}/limits/edit/${index}`, currentPath()); await this.refreshAfterWrite() } catch (err) { this.error = (err as Error).message }
  }
  private async deleteItem(i: number): Promise<void> {
    if (!confirm('确定删除该规则？')) return
    try { await postAndNavigate(`/api/admin/models/${encodeURIComponent(this.model)}/limits/delete/${i}`, {}, currentPath()); await this.refreshAfterWrite() } catch (e) { this.error = (e as Error).message }
  }

  protected load(): Promise<void> {
    return loadData(this.path).then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    const m = this.model
    const rows = this.data.map((l, i) => html`<tr><td>${l.type}</td><td>${l.period}</td><td>${l.periodValue}</td><td>${l.type === 'cost' ? l.costMax : l.max}</td><td>${l.groupName || ''}</td><td>${l.enabled ? '启用' : '禁用'}</td><td><div class="actions-cell"><button class="btn btn-small" type="button" @click=${() => this.editLimit(i)}>编辑</button><button class="btn btn-small btn-danger" type="button" @click=${() => this.deleteItem(i)}>删除</button></div></td></tr>`)
    return html`
${pageHeader({ eyebrow: 'MODEL LIMITS', title: `限制规则管理 - ${m}`, subtitle: '设置每分钟/每小时请求数、token 数或费用限制', actions: html`<a class="ui-btn" href="/admin/models">返回模型</a>` })}
${this.error ? html`<div class="error-banner">${this.error}</div>` : ''}${this.success ? html`<div class="success-banner">${this.success}</div>` : ''}
${panel('限制规则', '', html`<div class="limits-card"><h2 class="limits-title">限制规则管理</h2>${this.data.length ? html`<table class="limits-table"><thead><tr><th>类型</th><th>周期</th><th>周期值</th><th>上限</th><th>用户组</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table>` : empty('暂无限制规则', '')}
<h3 class="section-title">新增规则</h3><form @submit=${(e: Event) => this.add(e)}><input type="hidden" name="model" value=${m}><div class="form-grid">
  <div class="form-group"><label class="form-label" for="type">类型</label><select class="form-select" id="type" name="type" @change=${() => this.handleTypeChange()}><option value="rpm">请求数/分钟</option><option value="tpm">Token/分钟</option><option value="cost">费用</option></select></div>
  <div class="form-group"><label class="form-label" for="period">周期</label><select class="form-select" id="period" name="period"><option value="minute">分钟</option><option value="hour">小时</option><option value="day">天</option></select></div>
  <div class="form-group"><label class="form-label" for="periodValue">周期值</label><input class="form-input" id="periodValue" name="periodValue" type="number" value="1"></div>
  <div class="form-group" id="maxField" style=${this.isCost ? 'display:none' : ''}><label class="form-label" for="max">上限</label><input class="form-input" id="max" name="max" type="number"></div>
  <div class="form-group" id="costMaxField" style=${this.isCost ? '' : 'display:none'}><label class="form-label" for="costMax">费用上限</label><input class="form-input" id="costMax" name="costMax" type="number" step="0.01"></div>
  <div class="form-group"><label class="form-label" for="groupName">用户组</label><input class="form-input" id="groupName" name="groupName" value="default"></div>
  <div class="form-group"><label><input type="checkbox" id="enabled" name="enabled" value="true" checked> 启用</label></div>
</div><div class="form-actions"><button class="btn btn-primary" type="submit">添加规则</button></div></form>
<h3 class="section-title">修改规则</h3><form id="editForm" @submit=${(e: Event) => this.edit(e)}><div class="form-grid">
  <div class="form-group"><label class="form-label">索引</label><input class="form-input" id="editIndex" name="index" type="number" readonly></div>
  <div class="form-group"><label class="form-label">类型</label><select class="form-select" id="editType" name="type"><option value="rpm">rpm</option><option value="tpm">tpm</option><option value="cost">cost</option></select></div>
  <div class="form-group"><label class="form-label">周期</label><select class="form-select" id="editPeriod" name="period"><option value="minute">minute</option><option value="hour">hour</option><option value="day">day</option></select></div>
  <div class="form-group"><label class="form-label">周期值</label><input class="form-input" id="editPeriodValue" name="periodValue" type="number"></div>
  <div class="form-group"><label class="form-label">上限</label><input class="form-input" id="editMax" name="max" type="number"></div>
  <div class="form-group"><label class="form-label">费用上限</label><input class="form-input" id="editCostMax" name="costMax" type="number" step="0.01"></div>
  <div class="form-group"><label class="form-label">用户组</label><input class="form-input" id="editGroupName" name="groupName"></div>
</div><div class="form-actions"><button class="btn btn-primary" type="submit">保存修改</button></div></form></div>`)}
`
  }
}
if (!customElements.get('gw-model-limits-page')) customElements.define('gw-model-limits-page', GwModelLimitsPage)
