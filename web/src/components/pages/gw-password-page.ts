import { api, formToObject } from '../../api.js'
import { html, type TemplateResult } from 'lit'
import { GwPage } from '../gw-page.js'
import { pageHeader, panel, notice, uiCSS } from '../ui.js'

async function loadPasswordState(): Promise<undefined> { return undefined }

export class GwPasswordPage extends GwPage {
  static styles = [uiCSS]
  static properties = { error: { state: true }, success: { state: true }, hasPassword: { state: true } }
  hasPassword = true
  error = ''
  success = ''

  private async submit(e: Event): Promise<void> {
    e.preventDefault()
    const f = e.currentTarget as HTMLFormElement
    const body = {
      action: (document.activeElement as HTMLButtonElement)?.value || 'change',
      ...formToObject(f),
    }
    const r = await fetch('/api/admin/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json()
    if (j.ok) location.reload()
    else alert(j.error?.message || '操作失败')
  }

  protected load(): Promise<void> {
    return loadPasswordState().then(d => { this.hasPassword = !!d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    return html`
${pageHeader({ eyebrow: 'SECURITY', title: '密码设置', subtitle: '设置或修改管理后台登录密码' })}
${this.error ? notice(this.error, 'error') : ''}${this.success ? notice(this.success, 'success') : ''}
${panel('', '', html`<div class="form-card"><form @submit=${this.submit}>
  ${this.hasPassword ? html`<div class="form-group"><label class="form-label" for="currentPassword">当前密码</label><input class="form-input" type="password" id="currentPassword" name="currentPassword"></div>` : ''}
  <div class="form-group"><label class="form-label" for="newPassword">新密码</label><input class="form-input" type="password" id="newPassword" name="newPassword"></div>
  <div class="form-group"><label class="form-label" for="confirmPassword">确认新密码</label><input class="form-input" type="password" id="confirmPassword" name="confirmPassword"></div>
  <div class="form-actions"><button class="btn btn-primary" name="action" value="change">保存密码</button>${this.hasPassword ? html`<button class="btn btn-danger" name="action" value="delete">删除密码</button>` : ''}</div>
</form></div>`)}
`
  }
}
if (!customElements.get('gw-password-page')) customElements.define('gw-password-page', GwPasswordPage)
