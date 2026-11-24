import { html, css, type TemplateResult } from 'lit'
import { api, postAndNavigate } from '../../api.js'
import { currentPath } from '../../router.js'
import { GwPage } from '../gw-page.js'
import { pageHeader, panel, notice, empty, table, uiCSS } from '../ui.js'

export interface ModelView { customModel: string; realModel: string; desc?: string; hidden?: boolean }

async function loadModels(): Promise<any[]> { return (await api<any[]>('/api/admin/models')).data || [] }

export class GwModelsPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true } }
  data: ModelView[] = []
  error = ''

  private async run(url: string): Promise<void> {
    try {
      await postAndNavigate(url, {}, currentPath())
      this.error = ''
      await this.load()
    } catch (e) { this.error = (e as Error).message }
  }
  private move(model: ModelView, dir: 'up' | 'down'): void {
    void this.run(`/api/admin/models/move/${encodeURIComponent(model.customModel)}?direction=${dir}`)
  }
  private toggle(model: ModelView): void {
    void this.run(`/api/admin/models/toggle-hidden/${encodeURIComponent(model.customModel)}`)
  }
  private copy(model: ModelView): void {
    if (confirm(`确定要复制模型 "${model.customModel}" 吗？`)) void this.run(`/api/admin/models/copy/${encodeURIComponent(model.customModel)}`)
  }
  private deleteModel(model: ModelView): void {
    if (confirm(`确定要删除模型 "${model.customModel}" 吗？`)) void this.run(`/api/admin/models/delete/${encodeURIComponent(model.customModel)}`)
  }

  protected load(): Promise<void> {
    return loadModels().then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    const rows = this.data.map((m, i) => html`<tr style=${m.hidden ? 'opacity:.55' : ''}>
      <td><span class="ui-badge">${i + 1}</span></td>
      <td><strong>${m.customModel}</strong><div class="ui-field-hint ui-mono">→ ${m.realModel}</div></td>
      <td>${m.desc || '—'}</td>
      <td><div class="ui-row">
        <button class="ui-btn ui-btn-sm" data-move-url=${`/admin/models/move/${encodeURIComponent(m.customModel)}`} data-direction="up" ?disabled=${i === 0} @click=${() => this.move(m, 'up')}>↑</button>
        <button class="ui-btn ui-btn-sm" data-move-url=${`/admin/models/move/${encodeURIComponent(m.customModel)}`} data-direction="down" ?disabled=${i === this.data.length - 1} @click=${() => this.move(m, 'down')}>↓</button>
        <button class="ui-btn ui-btn-sm" data-toggle-url=${`/admin/models/toggle-hidden/${encodeURIComponent(m.customModel)}`} @click=${() => this.toggle(m)}>${m.hidden ? '显示' : '隐藏'}</button>
        <button class="ui-btn ui-btn-sm" data-copy-url=${`/admin/models/copy/${encodeURIComponent(m.customModel)}`} @click=${() => this.copy(m)}>复制</button>
        <a class="ui-btn ui-btn-sm" href=${`/admin/models/edit/${encodeURIComponent(m.customModel)}`}>编辑</a>
        <a class="ui-btn ui-btn-sm" href=${`/admin/models/${encodeURIComponent(m.customModel)}/limits`}>限制</a>
        <button class="ui-btn ui-btn-sm ui-btn-danger" data-delete-url=${`/admin/models/delete/${encodeURIComponent(m.customModel)}`} @click=${() => this.deleteModel(m)}>删除</button>
      </div></td>
    </tr>`)
    return html`
${pageHeader({ eyebrow: 'Routing', title: '模型管理', subtitle: '配置和管理所有上游模型信息，调整顺序及增减模型。',
  actions: html`<a class="ui-btn" href="/admin/model-groups">模型分组</a><a class="ui-btn ui-btn-primary" href="/admin/models/new">+ 新增模型</a>` })}
${this.error ? notice(this.error, 'error') : ''}
${panel('模型列表', `${this.data.length} 个模型`, this.data.length ? table(['#', '模型名称', '描述', '操作'], rows) : empty('暂无模型', '点击“新增模型”开始配置。'))}
`
  }
}
if (!customElements.get('gw-models-page')) customElements.define('gw-models-page', GwModelsPage)
