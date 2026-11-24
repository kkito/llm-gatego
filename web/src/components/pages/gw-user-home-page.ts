import { LitElement, html, type TemplateResult } from 'lit'
import { panel, uiCSS } from '../ui.js'

export interface UserHomeView { models: string[]; modelGroups: string[]; announcement?: string; userName?: string }

export class GwUserHomePage extends LitElement {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true } }
  data: UserHomeView = { models: [], modelGroups: [] }
  error = ''
  private copiedId = ''

  private async copy(e: Event, id: string): Promise<void> {
    const el = this.shadowRoot!.querySelector('#' + id)
    if (el && navigator.clipboard) await navigator.clipboard.writeText((el as HTMLElement).textContent || '')
    const btn = (e.currentTarget as HTMLButtonElement)
    this.copiedId = id
    this.requestUpdate()
    setTimeout(() => { this.copiedId = ''; this.requestUpdate() }, 1500)
  }

  render(): TemplateResult {
    const p = this.data || { models: [], modelGroups: [] }
    const models = p.models || []
    const groups = p.modelGroups || []
    const cfg = JSON.stringify({ openai: { baseURL: location.origin + '/v1', apiKey: 'sk-your-api-key' } }, null, 2)
    const items = groups.length ? groups : models
    const copy = (id: string) => html`<button class="ui-btn ui-btn-sm copy-btn" data-copy=${id} @click=${(e: Event) => this.copy(e, id)}>${this.copiedId === id ? '已复制' : '复制'}</button>`
    return html`
<div class="ui-page-head"><div><div class="ui-eyebrow">Getting started</div><h1 class="ui-title">🚀 LLM Gateway</h1><p class="ui-subtitle">统一的大模型 API 网关，兼容 OpenAI / Anthropic / Responses 格式</p></div>${p.userName ? html`<div class="ui-row">欢迎，${p.userName}</div>` : ''}</div>
${p.announcement ? html`<div class="ui-notice ui-notice-info">${p.announcement}</div>` : ''}
<div class="ui-grid ui-grid-2">
  ${panel('JSON 配置', '复制到你的 OpenAI 兼容客户端', html`<pre class="ui-input ui-mono" id="json-config" style="white-space:pre-wrap;min-height:160px">${cfg}</pre><div style="height:10px"></div>${copy('json-config')}`)}
  ${panel('Base URL', '网关地址', html`<div class="ui-mono" id="base-url">${location.origin}/v1</div><div style="height:10px"></div>${copy('base-url')}`)}
</div>
${panel('可用模型', `${models.length} 个模型 / ${groups.length} 个模型组`, html`<div class="ui-mono" id="model-value">${items[0] || ''}</div><div style="height:10px"></div>${copy('model-value')}<div class="ui-row" style="margin-top:14px">${items.map(m => html`<span class="ui-badge">${m}</span>`)}</div>`)}
`
  }
}
if (!customElements.get('gw-user-home-page')) customElements.define('gw-user-home-page', GwUserHomePage)
