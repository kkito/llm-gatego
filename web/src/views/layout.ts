import { escapeHtml } from '../format.js'
import { css as topbarCSS } from '../styles/admin_topbar.js'
import { consoleCSS } from '../styles/console.js'

export const MENU = [
  { href: '/admin/models', label: '模型' },
  { href: '/admin/users', label: '用户' },
  { href: '/admin/api-keys', label: 'API Keys' },
  { href: '/admin/model-groups', label: '模型组' },
  { href: '/admin/stats', label: '统计' },
  { href: '/admin/announcement', label: '公告管理' },
  { href: '/admin/password', label: '密码设置' },
  { href: '/admin/privacy', label: '隐私保护' },
]

export function topbar(activePath: string): string {
  return `<nav class="topbar"><div class="topbar-inner"><a href="/admin/models" class="topbar-brand">LLM Gateway</a><ul class="topbar-nav">${MENU.map(m => `<li><a href="${m.href}" class="${activePath === m.href ? 'active' : ''}">${m.label}</a></li>`).join('')}</ul></div></nav>`
}

export function adminPage(title: string, activePath: string, body: string, extraStyle: string, version = '1.15.0', script = ''): string {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)} - LLM Gateway</title><style>${topbarCSS}</style><style>${extraStyle}</style><style>${consoleCSS}</style></head><body>${topbar(activePath)}<main class="main-content" style="padding: 2.5rem 2rem 4rem; max-width: 1280px; margin: 0 auto; animation: fadeUp 0.6s ease-out both;">${body}<div style="text-align:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border-color);font-size:0.75rem;color:var(--text-secondary)">v${version}</div></main>${script}</body></html>`
}
