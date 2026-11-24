import { html, type TemplateResult } from 'lit'
import { GwPage } from '../gw-page.js'
import { loadData } from '../loaders.js'
import { pageHeader, panel, notice, uiCSS } from '../ui.js'

export class GwAnnouncementPage extends GwPage {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true }, success: { state: true }, enabled: { state: true } }
  data = ''
  enabled = true
  error = ''
  success = ''

  protected load(): Promise<void> {
    return loadData(this.path).then(d => { this.data = d }).catch((e: Error) => { this.error = e.message })
  }

  protected renderPage(): TemplateResult {
    return html`
${pageHeader({ eyebrow: 'ANNOUNCEMENT', title: '公告管理', subtitle: '设置用户页面显示的公告（支持 Markdown）' })}
${this.error ? notice(this.error, 'error') : ''}${this.success ? notice(this.success, 'success') : ''}
${panel('', '', html`<div class="form-card"><form method="post" action="/admin/announcement"><div class="form-group"><label class="form-label" for="content">公告内容</label><textarea class="form-textarea" id="content" name="content" rows="12">${this.data}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ?checked=${this.enabled}> 启用公告</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">保存公告</button></div></form></div>`)}
`
  }
}
if (!customElements.get('gw-announcement-page')) customElements.define('gw-announcement-page', GwAnnouncementPage)
