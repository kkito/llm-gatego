import { css } from '../styles/admin_privacy_settings.js'
import { adminPage } from './layout.js'
export interface PrivacyView { enabled: boolean; stripUserField: boolean; sanitizeFilePaths: boolean; pathPlaceholder: string; whitelistFilter: boolean }
export function privacyPage(s: PrivacyView, detailLogEnabled = false, cliDebug = false, error?: string, success?: string, version = '1.15.0'): string {
  const body = `<div class="page-header"><div><h1 class="page-title">隐私保护</h1><p class="page-subtitle">控制日志中的敏感信息处理</p></div></div>
${error ? `<div class="error-banner">${error}</div>` : ''}${success ? `<div class="success-banner">${success}</div>` : ''}
<div class="form-card"><form id="privacy-form">${(['enabled', 'stripUserField', 'sanitizeFilePaths', 'whitelistFilter'] as const).map(k => `<div class="form-group"><label><input type="checkbox" name="${k}" ${s[k] ? 'checked' : ''}> ${k}</label></div>`).join('')}<div class="form-group"><label class="form-label" for="pathPlaceholder">路径占位符</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value="${s.pathPlaceholder || 'USER'}"></div><div class="form-group"><label><input type="checkbox" name="detailLogEnabled" ${detailLogEnabled ? 'checked' : ''}> 详细日志</label></div>${cliDebug ? '<p>CLI Debug 已启用</p>' : ''}<div class="form-actions"><button class="btn btn-primary" type="submit">保存设置</button></div></form></div>`
  return adminPage('隐私保护', '/admin/privacy', body, css, version)
}
