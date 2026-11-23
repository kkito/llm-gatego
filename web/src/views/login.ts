import { escapeHtml } from '../format.js'
import { uiCSS } from '../ui/shell.js'

function loginShell(title: string, heading: string, body: string): string {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${uiCSS}
.ui-login-wrap{min-height:100vh;display:grid;place-items:center;padding:24px}
.ui-login-card{width:min(100%,420px);background:#fff;border:1px solid var(--ui-line);border-radius:16px;box-shadow:0 24px 60px rgba(16,24,40,.10);padding:28px}
.ui-login-mark{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--ui-accent);color:#fff;font-weight:800;margin-bottom:16px}
.ui-login-title{font-size:22px;margin:0 0 6px}.ui-login-sub{margin:0 0 22px;color:var(--ui-muted);font-size:13px}
</style></head><body><div class="ui-login-wrap"><div class="ui-login-card"><div class="ui-login-mark">L</div><h1 class="ui-login-title">${heading}</h1>${body}</div></div></body></html>`
}

export function adminLoginPage(isSetup: boolean, error?: string): string {
  return loginShell('管理员登录 · LLM Gateway', isSetup ? '设置管理员密码' : '管理员登录',
    `<p class="ui-login-sub">${isSetup ? '首次使用请设置管理员密码' : '登录后管理模型、密钥与统计信息。'}</p>` +
    (error ? `<div class="ui-notice ui-notice-error">${escapeHtml(error)}</div>` : '') +
    `<form method="POST" action="/api/admin/login"><label class="ui-field"><span class="ui-field-label">密码</span><input class="ui-input" type="password" name="password" placeholder="请输入密码" required></label><button class="ui-btn ui-btn-primary" style="width:100%">${isSetup ? '设置密码' : '登录'}</button></form>`)
}

export function userLoginPage(error?: string): string {
  return loginShell('用户登录 · LLM Gateway', '用户登录',
    `<p class="ui-login-sub">使用用户 API Key 查看可用模型与用量。</p>` +
    (error ? `<div class="ui-notice ui-notice-error">${escapeHtml(error)}</div>` : '') +
    `<form method="POST" action="/api/user/login"><label class="ui-field"><span class="ui-field-label">API Key</span><input class="ui-input" type="password" name="apikey" placeholder="请输入 API Key" required></label><button class="ui-btn ui-btn-primary" style="width:100%">登录</button></form>`)
}
