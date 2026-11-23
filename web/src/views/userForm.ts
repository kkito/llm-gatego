import { escapeHtml } from '../format.js'
import { notice, pageHeader, panel, shell } from '../ui/shell.js'

export interface UserGroupView { name: string; desc?: string }
export interface UserFormData { name?: string; description?: string; apiKey?: string; groups?: string[]; [k: string]: unknown }
export function userFormPage(user: UserFormData | undefined, allModels: Array<UserGroupView | string>, error?: string, success?: string, version = '1.15.0'): string {
  const isEdit = !!user?.name
  const title = isEdit ? '编辑用户' : '新增用户'
  const groups = Array.isArray(user?.allowedModels) ? user.allowedModels as string[] : (Array.isArray(user?.groups) ? user.groups : [])
  const modelOptions = allModels.map(g => typeof g === 'string' ? { name: g, desc: '' } : g)
  const body = pageHeader({ eyebrow: 'USER', title, subtitle: isEdit ? `用户：${user?.name || ''}` : '创建用户并分配用户组', actions: '<a class="ui-btn" href="/admin/users">返回用户列表</a>' })
    + (error ? notice(error, 'error') : '')
    + (success ? notice(success, 'success') : '')
    + panel('', '', `<div class="form-card"><form method="POST" action="${isEdit ? `/admin/users/edit/${encodeURIComponent(user!.name!)}` : '/admin/users/add'}"><div class="form-group"><label class="form-label" for="name">用户名</label><input class="form-input" id="name" name="name" value="${escapeHtml(user?.name || '')}" ${isEdit ? 'readonly' : ''}></div><div class="form-group"><label class="form-label" for="description">描述</label><input class="form-input" id="description" name="description" value="${escapeHtml(user?.description || '')}"></div><div class="form-group"><label class="form-label" for="apiKey">API Key</label><input class="form-input" id="apiKey" name="apiKey" value="${escapeHtml((user as any)?.apikey || user?.apiKey || '')}" placeholder="留空自动生成"></div><div class="form-group"><label class="form-label">模型权限</label><div class="checkbox-list">${modelOptions.map(g => `<label class="checkbox-item"><input type="checkbox" name="allowedModels" value="${escapeHtml(g.name)}" ${groups.includes(g.name) ? 'checked' : ''}> ${escapeHtml(g.name)} <span class="model-item-desc">${escapeHtml(g.desc || '')}</span></label>`).join('')}<span class="form-hint">不选择任何模型表示不限制</span></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">保存用户</button><a class="btn btn-secondary" href="/admin/users">取消</a></div></form></div>`)
  return shell({ title, path: '/admin/users', body, version })
}
