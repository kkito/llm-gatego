import { escapeHtml } from '../format.js'
import { empty, notice, pageHeader, panel, shell } from '../ui/shell.js'
export interface UserView { name: string; apikey: string; desc?: string; allowedModels?: string[] }

export function usersPage(users: UserView[], enabled = true, error?: string, version = '1.15.0'): string {
  const cards = users.map(u => `<article class="ui-panel" style="margin:0">
    <div class="ui-panel-head"><div><h3 class="ui-panel-title">${escapeHtml(u.name)}</h3><p class="ui-panel-sub">${escapeHtml(u.desc || '—')}</p></div><a class="ui-btn ui-btn-sm" href="/admin/users/edit/${encodeURIComponent(u.name)}">编辑</a></div>
    <div class="ui-panel-body">
      <div class="ui-field-hint ui-mono" style="margin-bottom:10px">${escapeHtml(u.apikey.slice(0, 8))}…</div>
      <div class="ui-row">${!u.allowedModels || u.allowedModels.length === 0 ? '<span class="ui-badge">所有模型</span>' : u.allowedModels.slice(0, 3).map(m => `<span class="ui-badge">${escapeHtml(m)}</span>`).join('')}${(u.allowedModels?.length || 0) > 3 ? `<span class="ui-field-hint">等${u.allowedModels!.length - 3}个模型</span>` : ''}</div>
      <div class="ui-row" style="margin-top:14px"><form method="POST" action="/api/admin/users/delete/${encodeURIComponent(u.name)}"><button class="ui-btn ui-btn-sm ui-btn-danger">删除</button></form></div>
    </div></article>`).join('')
  const toggle = `<form method="post" action="/api/admin/users/toggle"><input type="hidden" name="enabled" value="${enabled ? 'false' : 'true'}"><button class="ui-btn">${enabled ? '禁用用户认证' : '启用用户认证'}</button></form>`
  const body = pageHeader({ eyebrow: 'Access', title: '用户管理', subtitle: '管理访问 API 的用户和密钥', actions: `<a class="ui-btn ui-btn-primary" href="/admin/users/new">+ 新增用户</a>${toggle}` }) +
    (error ? notice(error, 'error') : '') +
    (users.length ? `<div class="ui-grid ui-grid-auto">${cards}</div>` : panel('用户列表', '', empty('暂无用户', '添加用户后即可按密钥限制访问。')))
  return shell({ title: '用户管理', path: '/admin/users', version, body })
}
