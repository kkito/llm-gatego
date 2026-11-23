import { escapeHtml } from '../format.js'
import { css } from '../styles/admin_announcement.js'
import { adminPage } from './layout.js'
export function announcementPage(content: string, enabled = true, error?: string, success?: string, version = '1.15.0'): string {
  const body = `<div class="page-header"><div><h1 class="page-title">公告管理</h1><p class="page-subtitle">设置用户页面显示的公告（支持 Markdown）</p></div></div>
${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ''}${success ? `<div class="success-banner">${escapeHtml(success)}</div>` : ''}
<div class="form-card"><form method="POST" action="/api/admin/announcement"><div class="form-group"><label class="form-label" for="content">公告内容</label><textarea class="form-textarea" id="content" name="content" rows="12">${escapeHtml(content)}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ${enabled ? 'checked' : ''}> 启用公告</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">保存公告</button></div></form></div>`
  return adminPage('公告管理', '/admin/announcement', body, css, version)
}
