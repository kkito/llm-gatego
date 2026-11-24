import { LitElement, html, css, type TemplateResult } from 'lit'

export class GwJsonEditor extends LitElement {
  static styles = css`
  .form-input,.form-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
  .form-textarea{min-height:120px;resize:vertical}
  .form-hint{font-size:11px;color:var(--ui-muted)}
  .json-preview{background:#F8FAFC;border:1px solid var(--ui-line);border-radius:8px;padding:10px;font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;word-break:break-all;margin-top:8px}
  .json-preview.valid{background:#ECFDF5;border-color:#A7F3D0;color:#065F46}
  .json-preview.invalid{background:#FEF2F2;border-color:#FECACA;color:#991B1B}
  .form-actions{display:flex;gap:8px;margin-top:8px}
  .btn{padding:5px 9px;min-height:30px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:12px;cursor:pointer}
  `

  static properties = {
    name: { type: String },
    value: { state: true },
    previewText: { state: true },
    valid: { state: true },
  }

  name = 'defaultParams'
  value = ''
  previewText = ''
  valid = true

  firstUpdated(): void { this.validate() }

  private emit(): void {
    this.dispatchEvent(new CustomEvent('value-changed', { detail: this.value, bubbles: true, composed: true }))
  }

  private validate(): void {
    try {
      const parsed = JSON.parse(this.value)
      this.previewText = JSON.stringify(parsed, null, 2)
      this.valid = true
    } catch (e) {
      this.previewText = 'JSON 格式错误：' + (e as Error).message
      this.valid = false
    }
    this.emit()
  }

  private format(): void {
    try { this.value = JSON.stringify(JSON.parse(this.value), null, 2) } catch { /* keep as-is */ }
    this.validate()
  }

  private clear(): void {
    this.value = ''
    this.validate()
  }

  render(): TemplateResult {
    return html`
<textarea class="form-textarea" .value=${this.value} placeholder='{"temperature":0.7}' @input=${(e: Event) => { this.value = (e.target as HTMLTextAreaElement).value; this.validate() }}></textarea>
<input type="hidden" name=${this.name} .value=${this.value}>
<pre class=${'json-preview ' + (this.valid ? 'valid' : 'invalid')}>${this.previewText}</pre>
<div class="form-actions"><button type="button" class="btn" @click=${() => this.format()}>格式化</button><button type="button" class="btn" @click=${() => this.clear()}>清空</button></div>
`
  }
}
if (!customElements.get('gw-json-editor')) customElements.define('gw-json-editor', GwJsonEditor)
