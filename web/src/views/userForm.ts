import { escapeHtml } from '../format.js'
import { css } from '../styles/admin_user_form.js'
import { adminPage } from './layout.js'
export interface UserFormView { name?: string; desc?: string; apikey?: string; allowedModels?: string[] }
export function userFormPage(user: UserFormView | undefined, models: string[], error?: string, version = '1.15.0'): string {
  const isEdit = !!user
  const u = user || {}
  const title = isEdit ? '编辑用户' : '新增用户'
  const body = `<div class="form-card"><h1 class="form-title">${title}</h1>${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ''}<form method="post" action="${isEdit ? `/admin/users/edit/${encodeURIComponent(u.name!)}` : '/admin/users/new'}">
<div class="form-group"><label class="form-label" for="name">用户名称</label><input class="form-input" id="name" name="name" value="${escapeHtml(u.name)}" placeholder="请输入用户名称" required></div>
<div class="form-group"><label class="form-label" for="desc">描述</label><input class="form-input" id="desc" name="desc" value="${escapeHtml(u.desc)}" placeholder="可选，描述用户用途"></div>
${isEdit ? `<div class="apikey-display"><label class="apikey-label">API Key</label><code class="apikey-code">${escapeHtml(u.apikey)}</code><p class="apikey-note">请妥善保管此 Key，不要泄露给他人。</p></div>` : ''}
<div class="form-group"><label class="form-label">模型权限</label><label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;cursor:pointer"><input type="checkbox" name="allModels" ${!u.allowedModels?.length ? 'checked' : ''}> 所有模型</label>${models.map(m => `<label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;cursor:pointer"><input type="checkbox" name="allowedModels" value="${escapeHtml(m)}" ${u.allowedModels?.includes(m) ? 'checked' : ''}> ${escapeHtml(m)}</label>`).join('')}<span class="form-hint">不选择任何模型表示不限制</span></div>
<div class="form-actions"><button type="submit" class="btn btn-primary">${isEdit ? '保存修改' : '添加用户'}</button><a href="/admin/users" class="btn btn-secondary">取消</a></div></form></div>`
  return adminPage(title, '/admin/users', body, css, version)
}
