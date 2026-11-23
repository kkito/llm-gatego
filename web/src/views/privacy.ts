import { notice, pageHeader, panel, shell } from '../ui/shell.js'

export interface PrivacyView {
  enabled: boolean
  stripUserField: boolean
  sanitizeFilePaths: boolean
  pathPlaceholder: string
  whitelistFilter: boolean
}
export function privacyPage(s: PrivacyView, detailLogEnabled = false, cliDebug = false, error?: string, success?: string, version = '1.15.0'): string {
  const body = pageHeader({
    eyebrow: 'PRIVACY',
    title: '隐私保护',
    subtitle: '控制日志中的敏感信息处理',
  })
    + (error ? notice(error, 'error') : '')
    + (success ? notice(success, 'success') : '')
    + panel('', '', `<div class="form-card"><form id="privacy-form" method="POST" action="/admin/privacy">${([['enabled', '启用隐私保护'], ['stripUserField', '抹掉 user 字段'], ['sanitizeFilePaths', '文件路径用户名替换'], ['whitelistFilter', '白名单字段过滤']] as Array<[keyof PrivacyView, string]>).map(([k, label]) => `<div class="form-group"><label><input type="checkbox" name="${k}" ${s[k] ? 'checked' : ''}> ${label}</label></div>`).join('')}<div class="form-group"><label class="form-label" for="pathPlaceholder">路径占位符</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value="${s.pathPlaceholder || 'USER'}"></div><div class="form-group"><label class="form-label">日志记录</label><label><input type="checkbox" name="detailLogEnabled" ${detailLogEnabled ? 'checked' : ''} ${cliDebug ? 'disabled' : ''}> 记录完整请求/响应日志</label>${cliDebug ? '<p class="form-hint">命令行启动时使用了 --debug，日志记录设置不可修改</p>' : ''}</div><div class="form-group"><label class="form-label">命令行调试参数</label><code>--debug</code></div><div class="form-actions"><button class="btn btn-primary" type="submit">保存设置</button></div></form></div>`)
  return shell({ title: '隐私保护', path: '/admin/privacy', body, version })
}
