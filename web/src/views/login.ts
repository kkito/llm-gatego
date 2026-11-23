import { css } from '../styles/user_login.js'
import { adminLoginCSS } from './loginStyles.js'
export function adminLoginPage(isSetup: boolean, error?: string): string {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>管理员登录 - LLM Gateway</title><style>${adminLoginCSS}</style></head><body><div class="login-card"><h1 class="login-title">${isSetup ? '🔐 设置管理员密码' : '🔐 管理员登录'}</h1>${error ? `<div class="alert alert-error">${error}</div>` : ''}${isSetup ? '<div class="alert alert-warning">首次使用请设置管理员密码</div>' : ''}<form method="POST" action="/api/admin/login"><div class="form-group"><label class="form-label" for="password">密码</label><input class="form-input" type="password" id="password" name="password" placeholder="请输入密码" required></div><button type="submit" class="btn btn-primary">${isSetup ? '设置密码' : '登录'}</button></form></div></body></html>`
}
export function userLoginPage(error?: string): string {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>用户登录 - LLM Gateway</title><style>${css}</style></head><body><div class="login-card"><h1>用户登录</h1>${error ? `<div class="alert alert-error">${error}</div>` : ''}<form method="POST" action="/api/user/login"><div class="form-group"><label for="apikey">API Key</label><input type="password" id="apikey" name="apikey" placeholder="请输入 API Key" required></div><button type="submit" class="btn btn-primary">登录</button></form></div></body></html>`
}
