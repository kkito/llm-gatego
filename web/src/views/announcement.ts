import { escapeHtml } from '../format.js'
import { notice, pageHeader, panel, shell } from '../ui/shell.js'

export function announcementPage(content: string, enabled = true, error?: string, success?: string, version = '1.15.0'): string {
  const body = pageHeader({
    eyebrow: 'ANNOUNCEMENT',
    title: '公告管理',
    subtitle: '设置用户页面显示的公告（支持 Markdown）',
  })
    + (error ? notice(error, 'error') : '')
    + (success ? notice(success, 'success') : '')
    + panel('', '', `<div class="form-card"><form method="POST" action="/admin/announcement"><div class="form-group"><label class="form-label" for="content">公告内容</label><textarea class="form-textarea" id="content" name="content" rows="12">${escapeHtml(content)}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ${enabled ? 'checked' : ''}> 启用公告</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">保存公告</button></div></form></div>`)
  return shell({ title: '公告管理', path: '/admin/announcement', body, version })
}
