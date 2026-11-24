import { html, type TemplateResult } from 'lit'
import { formToObject, postAndNavigate } from '../../api.js'
import { GwPage } from '../gw-page.js'
import { loadData } from '../loaders.js'
import { pageHeader, panel, notice, uiCSS } from '../ui.js'
import '../gw-json-editor.js'

export interface ModelFormView {
  customModel?: string; realModel?: string; provider?: string; baseUrl?: string; proxy?: string; apiKey?: string; desc?: string; maxContextLength?: number; defaultParams?: Record<string, any>
}
export interface ApiKeyOption { id: string; name: string; keyHint?: string }

export class GwModelFormPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true } }
  data: { model?: ModelFormView; keys: Array<ApiKeyOption | string>; ref?: string; error?: string } = { keys: [] }
  error = ''

  private keyOptions(): Array<{ id: string; name: string }> {
    const keys = this.data.keys
    return (Array.isArray(keys) ? keys : []).map(k => typeof k === 'string' ? { id: k, name: k } : k)
  }

  private onApiKeySource(e: Event): void {
    const sel = e.target as HTMLSelectElement
    const input = this.shadowRoot!.querySelector('#apiKeyManual') as HTMLInputElement
    input.disabled = sel.value !== 'manual'
    if (input.disabled) input.value = ''
  }

  private async runTest(): Promise<void> {
    const sr = this.shadowRoot!
    const btn = sr.querySelector('#testBtn') as HTMLButtonElement
    btn.disabled = true
    ;(sr.querySelector('#testLoading') as HTMLElement).style.display = 'block'
    const show = (id: string, display = 'block') => { const el = sr.querySelector('#' + id) as HTMLElement; if (el) el.style.display = display }
    const text = (id: string, value: string) => { const el = sr.querySelector('#' + id); if (el) el.textContent = value }
    try {
      const src = (sr.querySelector('#apiKeySourceTest') as HTMLSelectElement).value
      const payload: Record<string, unknown> = {
        provider: btn.dataset.provider, baseUrl: btn.dataset.base, realModel: btn.dataset.real,
        message: (sr.querySelector('#testMessage') as HTMLTextAreaElement).value,
        defaultParams: JSON.parse(btn.dataset.params || '{}'),
        proxy: (sr.querySelector('#proxy') as HTMLInputElement | null)?.value || '',
      }
      if (src !== 'manual') payload.apiKeyId = src
      else payload.apiKey = (sr.querySelector('#apiKeyTest') as HTMLInputElement).value
      const res = await fetch('/admin/models/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (d.success) {
        text('testResultModel', d.model || btn.dataset.real || '')
        text('testResultContent', d.content || '(无内容)')
        text('testResultUsage', d.usage ? `Tokens: 输入=${d.usage.prompt_tokens}, 输出=${d.usage.completion_tokens}` : '')
        if (d.requestBody) { text('requestBodyContent', d.requestBody); show('requestSection') }
        if (d.fullResponse) { text('responseBodyContent', d.fullResponse); show('responseSection') }
        show('testResult')
      } else {
        text('testErrorMessage', d.message || '未知错误')
        if (d.rawResponse) { text('testRawResponse', d.rawResponse); show('rawResponseSection') }
        show('testError')
      }
    } catch (e) {
      const el = this.shadowRoot!.querySelector('#testErrorMessage')
      if (el) el.textContent = '请求失败: ' + (e as Error).message
      show('testError')
    } finally {
      btn.disabled = false
      ;(this.shadowRoot!.querySelector('#testLoading') as HTMLElement).style.display = 'none'
    }
  }

  private toggleRawResponse(): void {
    const s = this.shadowRoot!.querySelector('#rawResponseSection') as HTMLElement
    s.style.display = s.style.display === 'none' ? 'block' : 'none'
  }

  private async submit(e: Event): Promise<void> {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const payload = formToObject(form)
    const editor = this.shadowRoot!.querySelector('gw-json-editor') as any
    try { payload.defaultParams = JSON.parse(editor?.value || '{}') } catch { payload.defaultParams = {} }
    const isEdit = !!this.data.model?.customModel
    const url = isEdit ? `/api/admin/models/edit/${encodeURIComponent(this.data.model!.customModel!)}` : '/api/admin/models'
    try { await postAndNavigate(url, payload) } catch (err) { this.error = (err as Error).message }
  }

  protected load(): Promise<void> {
    return loadData(this.path).then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    const d = this.data || {}
    const model = d.model || {}
    const isEdit = !!d.model
    const refName = this.data.ref || (model.apiKey?.startsWith('$$') && model.apiKey.endsWith('$$') ? model.apiKey.slice(2, -2) : '')
    const opts = this.keyOptions()
    const keyOptions = opts.map(k => html`<option value=${k.id} ?selected=${refName === k.name}>${k.name}</option>`)
    const err = this.error || this.data.error || ''
    const title = isEdit ? '编辑模型' : '新增模型'
    const testHtml = isEdit ? html`<details class="test-details"><summary>🧪 测试模型配置</summary><div class="form-card" style="margin-top:1rem">
      <div class="form-group"><label class="form-label" for="testMessage">测试消息</label><textarea class="form-textarea" id="testMessage" placeholder="请介绍一下你自己">请介绍一下你自己</textarea></div>
      <div class="form-group"><label class="form-label" for="apiKeySourceTest">API Key 来源</label><select id="apiKeySourceTest"><option value="manual">手动输入</option>${keyOptions}</select><input id="apiKeyTest" placeholder="留空则使用模型已保存的 Key"></div>
      <button type="button" class="btn btn-primary" id="testBtn" @click=${() => this.runTest()} data-provider=${model.provider || ''} data-base=${model.baseUrl || ''} data-real=${model.realModel || ''} data-params=${JSON.stringify(model.defaultParams || {})}>发送测试请求</button>
      <div id="testLoading" style="display:none;margin-top:0.75rem">发送中…</div>
      <div id="testResult" style="display:none;margin-top:1rem">模型: <strong id="testResultModel"></strong><pre id="testResultContent"></pre><div id="testResultUsage"></div></div>
      <div id="requestSection" style="display:none"><pre id="requestBodyContent"></pre></div>
      <div id="responseSection" style="display:none"><pre id="responseBodyContent"></pre></div>
      <div id="testError" style="display:none;margin-top:1rem;color:#dc2626"><span id="testErrorMessage"></span><div id="rawResponseSection" style="display:none"><pre id="testRawResponse"></pre><button type="button" class="btn" @click=${() => this.toggleRawResponse()}>切换原始响应</button></div></div>
    </div></details>` : ''
    return html`
${pageHeader({ eyebrow: 'MODEL', title, subtitle: isEdit ? '修改模型配置与 API Key 引用' : '创建新的上游模型配置', actions: html`<a class="ui-btn" href="/admin/models">返回模型</a>` })}
${err ? notice(err, 'error') : ''}
${panel('模型配置', '', html`<div class="form-card"><form @submit=${(e: Event) => this.submit(e)}>
  <div class="form-group"><label class="form-label" for="customModel">模型名称</label><input class="form-input" id="customModel" name="customModel" value=${model.customModel || ''} placeholder="例如：my-gpt4" required><span class="form-hint">调用 API 时使用此名称</span></div>
  <div class="form-group"><label class="form-label" for="realModel">实际模型名称</label><input class="form-input" id="realModel" name="realModel" value=${model.realModel || ''} placeholder="例如：gpt-4" required><span class="form-hint">上游 API 支持的模型名称</span></div>
  <div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" required><option value="">请选择...</option>${['openai', 'response-api', 'anthropic'].map(p => html`<option value=${p} ?selected=${model.provider === p}>${p}</option>`)}</select></div>
  <div class="form-group"><label class="form-label" for="baseUrl">Base URL</label><input class="form-input" id="baseUrl" name="baseUrl" value=${model.baseUrl || ''} placeholder="例如：https://api.openai.com" required><span class="form-hint">API 提供商的地址</span></div>
  <div class="form-group"><label class="form-label" for="proxy">代理（可选）</label><input class="form-input" id="proxy" name="proxy" value=${model.proxy || ''} placeholder="http://user:pass@127.0.0.1:7890 或 socks5://127.0.0.1:1080"><span class="form-hint">发往上游的请求通过此代理转发，留空则直连。支持 http://、https://、socks5://（可带 user:pass@ 认证）；不支持 socks5h:// 和 socks4://</span></div>
  <div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource" @change=${(e: Event) => this.onApiKeySource(e)}><option value="manual" ?selected=${!refName}>手动输入</option>${keyOptions}</select><input class="form-input" id="apiKeyManual" name="apiKey" ?disabled=${!!refName} placeholder=${refName ? `使用引用：$$${refName}$$` : (isEdit ? '留空则保持原密钥不变' : '请输入 API Key')}><span class="form-hint">${refName ? `引用 API Key「${refName}」，修改后将全局生效` : '可选择已保存的 API Key，或手动输入'}${isEdit ? '；留空则保持原密钥不变' : ''}</span></div>
  <div class="form-group"><label class="form-label" for="desc">描述</label><textarea class="form-textarea" id="desc" name="desc" placeholder="请输入模型描述（可选）">${model.desc || ''}</textarea><span class="form-hint">用于记录模型的用途或备注</span></div>
  <div class="form-group"><label class="form-label" for="maxContextLength">最大上下文长度</label><input class="form-input" id="maxContextLength" name="maxContextLength" type="number" value=${model.maxContextLength || ''} placeholder="默认 200000"><span class="form-hint">模型支持的最大 token 数，未填写则使用默认值 200000</span></div>
  <div class="form-group"><label class="form-label">默认参数 (JSON)</label><gw-json-editor name="defaultParams" .value=${model.defaultParams ? JSON.stringify(model.defaultParams, null, 2) : ''}></gw-json-editor></div>
  <div class="form-actions"><button type="submit" class="btn btn-primary">保存模型</button><a href="/admin/models" class="btn btn-secondary">取消</a></div>
</form></div>`)}
${testHtml}
`
  }
}
if (!customElements.get('gw-model-form-page')) customElements.define('gw-model-form-page', GwModelFormPage)
