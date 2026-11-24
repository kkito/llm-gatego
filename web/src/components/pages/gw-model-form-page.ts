import { html, type TemplateResult } from 'lit'
import { pathSegments } from '../page-utils.js'
import { api, postAndNavigate } from '../../api.js'
import { GwPage } from '../gw-page.js'
import { pageHeader, panel, notice, uiCSS } from '../ui.js'
import '../gw-json-editor.js'

export interface ModelFormView {
  customModel?: string; realModel?: string; provider?: string; baseUrl?: string; proxy?: string; apiKey?: string; desc?: string; maxContextLength?: number; defaultParams?: Record<string, any>
}
export interface ApiKeyOption { id: string; name: string; keyHint?: string }

interface TestResult {
  model: string
  content: string
  usage: string
  requestBody?: string
  fullResponse?: string
}

async function loadModelForm(path: string): Promise<any> {
  const parts = pathSegments(path)
  const raw = parts[2] === 'edit' ? (parts[3] || '') : ''
  const models = (await api<any[]>('/api/admin/models')).data || []
  const model = raw ? models.find(x => x.customModel === decodeURIComponent(raw)) : undefined
  const keys = (await api<any[]>('/api/admin/api-keys')).data || []
  const ref = model?.apiKey?.startsWith('$$') && model.apiKey.endsWith('$$') ? model.apiKey.slice(2, -2) : ''
  return { model, keys, version: '1.15.0', ref }
}

export class GwModelFormPage extends GwPage {
  static styles = [uiCSS]
  static properties = {
    data: { state: true }, error: { state: true }, draft: { state: true }, paramsText: { state: true },
    apiKeySource: { state: true }, testApiKeySource: { state: true }, testMessage: { state: true },
    testApiKey: { state: true }, testing: { state: true }, testResult: { state: true },
    testError: { state: true }, testRawResponse: { state: true }, showRaw: { state: true },
  }
  data: { model?: ModelFormView; keys: Array<ApiKeyOption | string>; ref?: string; error?: string } = { keys: [] }
  error = ''
  draft: Record<string, any> = {}
  paramsText = '{}'
  apiKeySource = 'manual'
  testApiKeySource = 'manual'
  testMessage = '请介绍一下你自己'
  testApiKey = ''
  testing = false
  testResult: TestResult | null = null
  testError = ''
  testRawResponse = ''
  showRaw = false

  private keyOptions(): Array<{ id: string; name: string }> {
    const keys = this.data.keys
    return (Array.isArray(keys) ? keys : []).map(k => typeof k === 'string' ? { id: k, name: k } : k)
  }

  private setDraft(name: string, value: unknown): void {
    this.draft = { ...this.draft, [name]: value }
  }

  private onApiKeySource(e: Event): void {
    this.apiKeySource = (e.target as HTMLSelectElement).value
    if (this.apiKeySource !== 'manual') this.setDraft('apiKey', '')
  }

  private async runTest(): Promise<void> {
    this.testing = true
    this.testResult = null
    this.testError = ''
    this.testRawResponse = ''
    this.showRaw = false
    try {
      let params: Record<string, unknown> = {}
      try { params = JSON.parse(this.paramsText || '{}') } catch { params = {} }
      const payload: Record<string, unknown> = {
        provider: this.draft.provider,
        baseUrl: this.draft.baseUrl,
        realModel: this.draft.realModel,
        message: this.testMessage,
        defaultParams: params,
        proxy: this.draft.proxy || '',
      }
      if (this.testApiKeySource !== 'manual') payload.apiKeyId = this.testApiKeySource
      else payload.apiKey = this.testApiKey
      const res = await fetch('/admin/models/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (d.success) {
        this.testResult = {
          model: d.model || this.draft.realModel || '',
          content: d.content || '(无内容)',
          usage: d.usage ? `Tokens: 输入=${d.usage.prompt_tokens}, 输出=${d.usage.completion_tokens}` : '',
          requestBody: d.requestBody || undefined,
          fullResponse: d.fullResponse || undefined,
        }
      } else {
        this.testError = d.message || '未知错误'
        this.testRawResponse = d.rawResponse || ''
      }
    } catch (e) {
      this.testError = '请求失败: ' + (e as Error).message
    } finally {
      this.testing = false
    }
  }

  private async submit(e: Event): Promise<void> {
    e.preventDefault()
    let defaultParams: Record<string, unknown> = {}
    try { defaultParams = JSON.parse(this.paramsText || '{}') } catch { defaultParams = {} }
    const payload = { ...this.draft, defaultParams }
    const isEdit = !!this.data.model?.customModel
    const url = isEdit ? `/api/admin/models/edit/${encodeURIComponent(this.data.model!.customModel!)}` : '/api/admin/models'
    try { await postAndNavigate(url, payload) } catch (err) { this.error = (err as Error).message }
  }

  protected load(): Promise<void> {
    return loadModelForm(this.path).then(d => {
      this.data = d
      const model = d.model || {}
      this.draft = { ...model }
      this.paramsText = model.defaultParams ? JSON.stringify(model.defaultParams, null, 2) : '{}'
      const refId = this.keyOptions().find(k => k.name === d.ref)?.id
      this.apiKeySource = refId || 'manual'
      this.testApiKeySource = refId || 'manual'
      this.testMessage = '请介绍一下你自己'
      this.testApiKey = ''
      this.testResult = null
      this.testError = ''
    }).catch((e: Error) => { this.error = e.message })
  }

  private input(name: string, cls = 'form-input', type = 'text'): TemplateResult {
    return html`<input class=${cls} id=${name} name=${name} type=${type} .value=${this.draft[name] ?? ''} @input=${(e: Event) => { const raw = (e.target as HTMLInputElement).value; this.setDraft(name, type === 'number' ? (raw === '' ? null : Number(raw)) : raw) }}>`
  }

  protected renderPage(): TemplateResult {
    const d = this.data || {}
    const model = d.model || {}
    const isEdit = !!d.model
    const refName = this.data.ref || (model.apiKey?.startsWith('$$') && model.apiKey.endsWith('$$') ? model.apiKey.slice(2, -2) : '')
    const keyOptions = this.keyOptions().map(k => html`<option value=${k.id}>${k.name}</option>`)
    const err = this.error || this.data.error || ''
    const title = isEdit ? '编辑模型' : '新增模型'
    const testHtml = isEdit ? html`<details class="test-details"><summary>🧪 测试模型配置</summary><div class="form-card" style="margin-top:1rem">
      <div class="form-group"><label class="form-label" for="testMessage">测试消息</label><textarea class="form-textarea" id="testMessage" .value=${this.testMessage} @input=${(e: Event) => { this.testMessage = (e.target as HTMLTextAreaElement).value }}></textarea></div>
      <div class="form-group"><label class="form-label" for="apiKeySourceTest">API Key 来源</label><select id="apiKeySourceTest" .value=${this.testApiKeySource} @change=${(e: Event) => { this.testApiKeySource = (e.target as HTMLSelectElement).value }}><option value="manual">手动输入</option>${keyOptions}</select><input id="apiKeyTest" placeholder="留空则使用模型已保存的 Key" .value=${this.testApiKey} @input=${(e: Event) => { this.testApiKey = (e.target as HTMLInputElement).value }}></div>
      <button type="button" class="btn btn-primary" id="testBtn" ?disabled=${this.testing} @click=${() => this.runTest()}>发送测试请求</button>
      ${this.testing ? html`<div style="margin-top:0.75rem">发送中…</div>` : ''}
      ${this.testResult ? html`<div style="margin-top:1rem">模型: <strong>${this.testResult.model}</strong><pre>${this.testResult.content}</pre><div>${this.testResult.usage}</div></div>
        ${this.testResult.requestBody ? html`<div><pre>${this.testResult.requestBody}</pre></div>` : ''}
        ${this.testResult.fullResponse ? html`<div><pre>${this.testResult.fullResponse}</pre></div>` : ''}` : ''}
      ${this.testError ? html`<div style="margin-top:1rem;color:#dc2626"><span>${this.testError}</span>${this.testRawResponse ? html`<div><pre>${this.testRawResponse}</pre><button type="button" class="btn" @click=${() => { this.showRaw = !this.showRaw }}>切换原始响应</button></div>${this.showRaw ? html`<pre>${this.testRawResponse}</pre>` : ''}` : ''}</div>` : ''}
    </div></details>` : ''
    return html`
${pageHeader({ eyebrow: 'MODEL', title, subtitle: isEdit ? '修改模型配置与 API Key 引用' : '创建新的上游模型配置', actions: html`<a class="ui-btn" href="/admin/models">返回模型</a>` })}
${err ? notice(err, 'error') : ''}
${panel('模型配置', '', html`<div class="form-card"><form @submit=${(e: Event) => this.submit(e)}>
  <div class="form-group"><label class="form-label" for="customModel">模型名称</label>${this.input('customModel')}<span class="form-hint">调用 API 时使用此名称</span></div>
  <div class="form-group"><label class="form-label" for="realModel">实际模型名称</label>${this.input('realModel')}<span class="form-hint">上游 API 支持的模型名称</span></div>
  <div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" .value=${this.draft.provider || ''} @change=${(e: Event) => this.setDraft('provider', (e.target as HTMLSelectElement).value)}><option value="">请选择...</option>${['openai', 'response-api', 'anthropic'].map(p => html`<option value=${p}>${p}</option>`)}</select></div>
  <div class="form-group"><label class="form-label" for="baseUrl">Base URL</label>${this.input('baseUrl')}<span class="form-hint">API 提供商的地址</span></div>
  <div class="form-group"><label class="form-label" for="proxy">代理（可选）</label>${this.input('proxy')}<span class="form-hint">发往上游的请求通过此代理转发，留空则直连。支持 http://、https://、socks5://（可带 user:pass@ 认证）；不支持 socks5h:// 和 socks4://</span></div>
  <div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource" .value=${this.apiKeySource} @change=${(e: Event) => this.onApiKeySource(e)}><option value="manual">手动输入</option>${keyOptions}</select><input class="form-input" id="apiKey" name="apiKey" .value=${this.draft.apiKey || ''} ?disabled=${this.apiKeySource !== 'manual'} @input=${(e: Event) => this.setDraft('apiKey', (e.target as HTMLInputElement).value)}><span class="form-hint">${refName ? `引用 API Key「${refName}」，修改后将全局生效` : '可选择已保存的 API Key，或手动输入'}${isEdit ? '；留空则保持原密钥不变' : ''}</span></div>
  <div class="form-group"><label class="form-label" for="desc">描述</label><textarea class="form-textarea" id="desc" name="desc" .value=${this.draft.desc || ''} @input=${(e: Event) => this.setDraft('desc', (e.target as HTMLTextAreaElement).value)}></textarea><span class="form-hint">用于记录模型的用途或备注</span></div>
  <div class="form-group"><label class="form-label" for="maxContextLength">最大上下文长度</label>${this.input('maxContextLength', 'form-input', 'number')}<span class="form-hint">模型支持的最大 token 数，未填写则使用默认值 200000</span></div>
  <div class="form-group"><label class="form-label">默认参数 (JSON)</label><gw-json-editor name="defaultParams" .value=${this.paramsText} @value-changed=${(e: CustomEvent<string>) => { this.paramsText = e.detail }}></gw-json-editor></div>
  <div class="form-actions"><button type="submit" class="btn btn-primary">保存模型</button><a href="/admin/models" class="btn btn-secondary">取消</a></div>
</form></div>`)}
${testHtml}
`
  }
}
if (!customElements.get('gw-model-form-page')) customElements.define('gw-model-form-page', GwModelFormPage)
