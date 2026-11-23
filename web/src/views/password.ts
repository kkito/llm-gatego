import { css } from '../styles/admin_password.js'
import { adminPage } from './layout.js'
export function passwordPage(hasPassword: boolean, error?: string, success?: string, version = '1.15.0'): string {
  const body = `<div class="page-header"><div><h1 class="page-title">密码设置</h1><p class="page-subtitle">设置或修改管理后台登录密码</p></div></div>
${error ? `<div class="error-banner">${error}</div>` : ''}${success ? `<div class="success-banner">${success}</div>` : ''}
<div class="form-card"><form method="POST" action="/api/admin/password">${hasPassword ? '<div class="form-group"><label class="form-label" for="currentPassword">当前密码</label><input class="form-input" type="password" id="currentPassword" name="currentPassword"></div>' : ''}<div class="form-group"><label class="form-label" for="newPassword">新密码</label><input class="form-input" type="password" id="newPassword" name="newPassword"></div><div class="form-group"><label class="form-label" for="confirmPassword">确认新密码</label><input class="form-input" type="password" id="confirmPassword" name="confirmPassword"></div><div class="form-actions"><button class="btn btn-primary" name="action" value="set">保存密码</button>${hasPassword ? '<button class="btn btn-danger" name="action" value="delete">删除密码</button>' : ''}</div></form></div>`
  return adminPage('密码设置', '/admin/password', body, css, version)
}
