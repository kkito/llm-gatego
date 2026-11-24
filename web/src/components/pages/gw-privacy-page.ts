import { LitElement, html, type TemplateResult } from 'lit'
import { pageHeader, panel, notice, uiCSS } from '../ui.js'

export interface PrivacyView {
  enabled: boolean; stripUserField: boolean; sanitizeFilePaths: boolean
  pathPlaceholder: string; whitelistFilter: boolean
}

export class GwPrivacyPage extends LitElement {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true }, success: { state: true }, enabled: { state: true }, detailLogEnabled: { state: true }, cliDebug: { state: true } }
  data: PrivacyView = { enabled: false, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: 'USER', whitelistFilter: false }
  detailLogEnabled = false
  cliDebug = false
  error = ''
  success = ''

  render(): TemplateResult {
    const s = this.data
    const checks: Array<[keyof PrivacyView, string]> = [
      ['enabled', '启用隐私保护'], ['stripUserField', '抹掉 user 字段'],
      ['sanitizeFilePaths', '文件路径用户名替换'], ['whitelistFilter', '白名单字段过滤'],
    ]
    return html`
${pageHeader({ eyebrow: 'PRIVACY', title: '隐私保护', subtitle: '控制日志中的敏感信息处理' })}
${this.error ? notice(this.error, 'error') : ''}${this.success ? notice(this.success, 'success') : ''}
${panel('', '', html`<div class="form-card"><form id="privacy-form" method="POST" action="/admin/privacy">
  ${checks.map(([k, label]) => html`<div class="form-group"><label><input type="checkbox" name=${k} ?checked=${!!s[k]}> ${label}</label></div>`)}
  <div class="form-group"><label class="form-label" for="pathPlaceholder">路径占位符</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value=${s.pathPlaceholder || 'USER'}></div>
  <div class="form-group"><label class="form-label">日志记录</label><label><input type="checkbox" name="detailLogEnabled" ?checked=${this.detailLogEnabled} ?disabled=${this.cliDebug}> 记录完整请求/响应日志</label>${this.cliDebug ? html`<p class="form-hint">命令行启动时使用了 --debug，日志记录设置不可修改</p>` : ''}</div>
  <div class="form-group"><label class="form-label">命令行调试参数</label><code>--debug</code></div>
  <div class="form-actions"><button class="btn btn-primary" type="submit">保存设置</button></div>
</form></div>`)}
`
  }
}
if (!customElements.get('gw-privacy-page')) customElements.define('gw-privacy-page', GwPrivacyPage)
