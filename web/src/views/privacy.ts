import { css } from '../styles/admin_privacy_settings.js'
import { adminPage } from './layout.js'
export interface PrivacyView { enabled: boolean; stripUserField: boolean; sanitizeFilePaths: boolean; pathPlaceholder: string; whitelistFilter: boolean }
export function privacyPage(s: PrivacyView, detailLogEnabled = false, cliDebug = false, error?: string, success?: string, version = '1.15.0'): string {
  const body = `<div class="page-header"><div><h1 class="page-title">隐私保护</h1><p class="page-subtitle">控制日志中的敏感信息处理</p></div></div>
${error ? `<div class="error-banner">${error}</div>` : ''}${success ? `<div class="success-banner">${success}</div>` : ''}
<div class="form-card"><form id="privacy-form">${[['enabled', '启用隐私保护'], ['stripUserField', '抹掉 user 字段'], ['sanitizeFilePaths', '文件路径用户名替换'], ['whitelistFilter', '白名单字段过滤']].map(([k, label]) => `<div class="form-group"><label><input type="checkbox" name="${k}" ${s[k as keyof PrivacyView] ? 'checked' : ''}> ${label}</label></div>`).join('')}<div class="form-group"><label class="form-label" for="pathPlaceholder">路径占位符</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value="${s.pathPlaceholder || 'USER'}"></div><div class="form-group"><label>日志记录</label><label><input type="checkbox" name="detailLogEnabled" ${detailLogEnabled ? 'checked' : ''} ${cliDebug ? 'disabled' : ''}> 记录完整请求/响应日志</label>${cliDebug ? '<p>命令行启动时使用了 --debug，日志记录设置不可修改</p>' : ''}</div><div class="form-actions"><button class="btn btn-primary" type="submit">保存设置</button></div></form></div>`
  return adminPage('隐私保护', '/admin/privacy', body, css, version)
}
