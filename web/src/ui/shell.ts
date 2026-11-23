import { escapeHtml } from '../format.js'

export type NavItem = { href: string; label: string; icon?: string }

export const userNav: NavItem[] = [
  { href: '/user/main', label: '控制台', icon: '◇' },
  { href: '/user/stats', label: '用量统计', icon: '▤' },
]

export const adminNav: NavItem[] = [
  { href: '/admin/models', label: '模型', icon: '◇' },
  { href: '/admin/model-groups', label: '分组', icon: '▦' },
  { href: '/admin/api-keys', label: '密钥', icon: '⌘' },
  { href: '/admin/users', label: '用户', icon: '◎' },
  { href: '/admin/stats', label: '统计', icon: '▤' },
  { href: '/admin/announcement', label: '公告', icon: '✎' },
  { href: '/admin/privacy', label: '隐私', icon: '◈' },
  { href: '/admin/password', label: '密码', icon: '⚿' },
]

export const formCSS = `
:root{--border-color:var(--ui-line);--bg-page:var(--ui-bg);--text-secondary:var(--ui-muted)}
.form-card,.limits-card{background:#fff;border:1px solid var(--ui-line);border-radius:var(--ui-radius);padding:18px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03)}
.form-title,.limits-title{margin:0 0 4px;font-size:18px;font-weight:800}.page-subtitle,.limits-subtitle{margin:0 0 16px;color:var(--ui-muted)}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.form-label{font-size:12px;font-weight:800;color:var(--ui-ink)}
.form-input,.form-select,.form-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.form-textarea{min-height:120px;resize:vertical}.form-hint{font-size:11px;color:var(--ui-muted)}
.form-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.btn,.btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.btn-primary,.btn-submit{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}.btn-secondary{background:#fff}.btn-danger{color:#DC2626;border-color:#FECACA}.btn-small{padding:5px 9px;min-height:30px;font-size:12px}.btn-icon{min-width:30px;padding:5px}
.error-banner,.alert-error{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:10px;padding:11px 14px;margin-bottom:16px}.success-banner,.alert-success{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;border-radius:10px;padding:11px 14px;margin-bottom:16px}
.section-title{font-size:14px;margin:18px 0 10px}.limits-table{width:100%;border-collapse:collapse}.limits-table th,.limits-table td{padding:10px 12px;border-bottom:1px solid var(--ui-line);text-align:left;font-size:13px}.limits-table th{color:var(--ui-muted);font-size:11px}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.model-selector{display:grid;grid-template-columns:1fr 1fr;gap:14px}.model-list{min-height:180px;border:1px solid var(--ui-line);border-radius:10px;padding:12px;background:#FAFCFF}.model-list-title{font-size:13px;margin:0 0 10px}.model-list-empty{color:var(--ui-muted);font-size:12px}.checkbox-list{display:grid;gap:8px}.checkbox-item,.model-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--ui-line);border-radius:8px;background:#fff;font-size:13px}.model-item-name{flex:1}.model-item-desc{color:var(--ui-muted)}.model-actions{display:flex;gap:5px}.selected-index{color:var(--ui-muted);font-family:ui-monospace,monospace}.apikey-display{margin-bottom:14px}.apikey-label{display:block;font-size:12px;font-weight:800;margin-bottom:6px}.apikey-code{display:block;padding:10px;background:#F8FAFC;border:1px solid var(--ui-line);border-radius:8px;word-break:break-all}.apikey-note{font-size:11px;color:var(--ui-muted)}
.heatmap-scroll{overflow-x:auto;padding-bottom:6px}.heatmap-grid{display:flex;gap:3px;min-width:660px}.heatmap-col{display:flex;flex-direction:column;gap:3px;flex:1 1 0;min-width:0}.heatmap-months{display:flex;gap:3px;min-width:660px}.heatmap-months>span{flex:1 1 0;min-width:0;overflow:hidden;white-space:nowrap;color:var(--ui-muted);font-size:11px}.heatmap-cell{display:block;width:100%;aspect-ratio:1/1;border-radius:2px;background:#ebedf0;min-width:0}.heatmap-legend{display:flex;align-items:center;gap:4px;margin-top:10px;color:var(--ui-muted);font-size:11px}.heatmap-legend .heatmap-cell{width:11px;height:11px;flex:none;aspect-ratio:auto}.heatmap-tip{position:fixed;z-index:9999;pointer-events:none;background:#101828;color:#fff;font-size:12px;padding:5px 8px;border-radius:6px;white-space:nowrap;display:none;box-shadow:0 6px 18px rgba(16,24,40,.22)}
@media(max-width:820px){.model-selector{grid-template-columns:1fr}.form-card,.limits-card{padding:14px}.form-actions .btn,.btn-submit{min-height:44px}}
`

export function shell(opts: {
  title: string
  path: string
  version?: string
  nav?: NavItem[]
  body: string
  scripts?: string
  width?: number
}): string {
  const width = opts.width ?? 1180
  const nav = opts.nav ?? adminNav
  const links = nav.map(n => {
    const active = opts.path === n.href || (n.href !== '/admin/models' && opts.path.startsWith(n.href + '/')) ||
      (n.href === '/admin/models' && opts.path.startsWith('/admin/models/'))
    return `<a href="${n.href}" class="ui-nav-link${active ? ' is-active' : ''}">${n.icon ? `<span class="ui-nav-icon">${n.icon}</span>` : ''}<span>${escapeHtml(n.label)}</span></a>`
  }).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)} · LLM Gateway</title><style>${uiCSS}${formCSS}</style></head><body>
<header class="ui-topbar"><div class="ui-topbar-inner" style="max-width:${width}px">
  <a href="/admin/models" class="ui-brand"><span class="ui-brand-mark">L</span><span>LLM Gateway</span></a>
  <nav class="ui-nav">${links}</nav>
  <div class="ui-topbar-end"><a href="/user/main" class="ui-link">用户端</a><span class="ui-version">v${escapeHtml(opts.version || '1.15.0')}</span></div>
</div></header>
<main class="ui-main" style="max-width:${width}px">${opts.body}</main>
<footer class="ui-footer" style="max-width:${width}px">LLM Gateway · Go rewrite</footer>
${opts.scripts || ''}
</body></html>`
}

export function pageHeader(opts: { title: string; subtitle?: string; eyebrow?: string; actions?: string }): string {
  return `<div class="ui-page-head"><div><div class="ui-eyebrow">${escapeHtml(opts.eyebrow || '控制台')}</div><h1 class="ui-title">${escapeHtml(opts.title)}</h1>${opts.subtitle ? `<p class="ui-subtitle">${escapeHtml(opts.subtitle)}</p>` : ''}</div>${opts.actions ? `<div class="ui-actions">${opts.actions}</div>` : ''}</div>`
}

export function panel(title?: string, subtitle?: string, content = '', actions = ''): string {
  return `<section class="ui-panel">${title || actions ? `<div class="ui-panel-head"><div>${title ? `<h2 class="ui-panel-title">${escapeHtml(title)}</h2>` : ''}${subtitle ? `<p class="ui-panel-sub">${escapeHtml(subtitle)}</p>` : ''}</div>${actions ? `<div class="ui-panel-actions">${actions}</div>` : ''}</div>` : ''}<div class="ui-panel-body">${content}</div></section>`
}

export function notice(message: string, kind: 'error' | 'success' | 'info' = 'info'): string {
  return `<div class="ui-notice ui-notice-${kind}">${escapeHtml(message)}</div>`
}

export function empty(title: string, hint: string, action = ''): string {
  return `<div class="ui-empty"><div class="ui-empty-mark">◇</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(hint)}</p>${action}</div>`
}

export function table(headers: string[], rows: string[]): string {
  return `<div class="ui-table-wrap"><table class="ui-table"><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
}

export function formField(label: string, input: string, hint = ''): string {
  return `<label class="ui-field"><span class="ui-field-label">${escapeHtml(label)}</span>${input}${hint ? `<span class="ui-field-hint">${escapeHtml(hint)}</span>` : ''}</label>`
}

export const uiCSS = `
:root{--ui-bg:#F6F8FB;--ui-panel:#fff;--ui-line:#E3E8EF;--ui-ink:#111827;--ui-muted:#64748B;--ui-accent:#2563EB;--ui-soft:#EFF4FF;--ui-radius:14px}
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:var(--ui-bg);color:var(--ui-ink);font:14px/1.55 Inter,"Noto Sans SC",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--ui-accent);text-decoration:none}a:hover{text-decoration:none}
.ui-topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--ui-line)}
.ui-topbar-inner{margin:0 auto;padding:0 20px;min-height:64px;display:flex;align-items:center;gap:20px}
.ui-brand{display:flex;align-items:center;gap:9px;font-weight:800;color:var(--ui-ink);font-size:15px;white-space:nowrap}
.ui-brand-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--ui-accent);color:#fff;font-size:13px}
.ui-nav{display:flex;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}.ui-nav::-webkit-scrollbar{display:none}
.ui-nav-link{display:flex;align-items:center;gap:6px;color:var(--ui-muted);padding:8px 11px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}
.ui-nav-link:hover{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-link.is-active{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-icon{font-size:12px;opacity:.8}
.ui-topbar-end{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-muted);white-space:nowrap}
.ui-version{font-family:ui-monospace,monospace;padding:2px 7px;border:1px solid var(--ui-line);border-radius:999px}
.ui-main{margin:0 auto;padding:26px 20px 60px;min-height:70vh}
.ui-footer{margin:0 auto;padding:0 20px 28px;color:var(--ui-muted);font-size:12px;text-align:center}
.ui-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--ui-line);flex-wrap:wrap}
.ui-eyebrow{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ui-accent);margin-bottom:4px}
.ui-title{font-size:25px;line-height:1.2;letter-spacing:-.02em;margin:0;font-weight:800}
.ui-subtitle{margin:5px 0 0;color:var(--ui-muted);font-size:13px}
.ui-actions{display:flex;gap:8px;flex-wrap:wrap}
.ui-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.ui-btn:hover{background:#F9FAFB;box-shadow:0 2px 8px rgba(16,24,40,.06)}
.ui-btn-primary{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}
.ui-btn-primary:hover{background:#1D4ED8}
.ui-btn-danger{color:#DC2626;border-color:#FECACA;background:#fff}
.ui-btn-sm{padding:5px 9px;min-height:30px;font-size:12px}
.ui-panel{background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03);overflow:hidden;margin-bottom:16px}
.ui-panel-head{padding:15px 18px;border-bottom:1px solid var(--ui-line);display:flex;align-items:center;justify-content:space-between;gap:12px}
.ui-panel-title{margin:0;font-size:15px;font-weight:800}
.ui-panel-sub{margin:2px 0 0;color:var(--ui-muted);font-size:12px}
.ui-panel-body{padding:18px}
.ui-grid{display:grid;gap:16px}.ui-grid-2{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}.ui-grid-auto{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.ui-notice{padding:11px 14px;border-radius:10px;margin-bottom:16px;font-size:13px;border:1px solid}
.ui-notice-error{background:#FEF2F2;border-color:#FECACA;color:#991B1B}.ui-notice-success{background:#ECFDF5;border-color:#A7F3D0;color:#065F46}.ui-notice-info{background:var(--ui-soft);border-color:#D7E3FF;color:#1E40AF}
.ui-empty{text-align:center;padding:42px 20px;border:1px dashed var(--ui-line);border-radius:var(--ui-radius);color:var(--ui-muted)}
.ui-empty-mark{font-size:24px;color:var(--ui-accent);margin-bottom:8px}.ui-empty h3{margin:0 0 4px;color:var(--ui-ink)}.ui-empty p{margin:0 0 14px}
.ui-table-wrap{overflow:auto;border:1px solid var(--ui-line);border-radius:var(--ui-radius);background:#fff}
.ui-table{width:100%;border-collapse:collapse;min-width:680px}
.ui-table th{text-align:left;padding:11px 14px;background:#F8FAFC;color:var(--ui-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--ui-line)}
.ui-table td{padding:12px 14px;border-bottom:1px solid var(--ui-line);vertical-align:middle;font-size:13px}
.ui-table tr:last-child td{border-bottom:0}.ui-table tbody tr:hover{background:#FAFCFF}
.ui-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.ui-field-label{font-size:12px;font-weight:800}.ui-field-hint{font-size:11px;color:var(--ui-muted)}
.ui-input,.ui-select,.ui-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.ui-input:focus,.ui-select:focus,.ui-textarea:focus{border-color:var(--ui-accent);box-shadow:0 0 0 3px rgba(37,99,235,.12);outline:none}
.ui-badge{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 7px;border-radius:8px;background:var(--ui-soft);color:var(--ui-accent);font-weight:800;font-size:12px}
.ui-mono{font-family:"IBM Plex Mono",ui-monospace,monospace}
.ui-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ui-spacer{flex:1}
@media(max-width:820px){.ui-topbar-inner{flex-wrap:wrap;padding:10px 14px;gap:8px}.ui-nav{order:3;width:100%;flex-basis:100%}.ui-topbar-end{margin-left:auto}.ui-main{padding:18px 14px 48px}.ui-grid-2{grid-template-columns:1fr}.ui-page-head{align-items:flex-start}.ui-btn{min-height:44px}}
`
