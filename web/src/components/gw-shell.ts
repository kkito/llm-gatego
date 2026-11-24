import { LitElement, css, html, type TemplateResult } from 'lit'
import { globalCSS } from '../styles/tokens-lit.js'

export interface NavItem { href: string; label: string; icon?: string }

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

export const userNav: NavItem[] = [
  { href: '/user/main', label: '控制台', icon: '◇' },
  { href: '/user/stats', label: '用量统计', icon: '▤' },
]

export class GwShell extends LitElement {
  static styles = [globalCSS, css`
  :host{display:block}
  .ui-topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--ui-line)}
  .ui-topbar-inner{margin:0 auto;padding:0 20px;min-height:64px;display:flex;align-items:center;gap:20px}
  .ui-brand{display:flex;align-items:center;gap:9px;font-weight:800;color:var(--ui-ink);font-size:15px;white-space:nowrap}
  .ui-brand-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--ui-accent);color:#fff;font-size:13px}
  .ui-nav{display:flex;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}
  .ui-nav::-webkit-scrollbar{display:none}
  .ui-nav-link{display:flex;align-items:center;gap:6px;color:var(--ui-muted);padding:8px 11px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}
  .ui-nav-link:hover{background:var(--ui-soft);color:var(--ui-accent)}
  .ui-nav-link.is-active{background:var(--ui-soft);color:var(--ui-accent)}
  .ui-nav-icon{font-size:12px;opacity:.8}
  .ui-topbar-end{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-muted);white-space:nowrap}
  .ui-version{font-family:ui-monospace,monospace;padding:2px 7px;border:1px solid var(--ui-line);border-radius:999px}
  .ui-main{margin:0 auto;padding:26px 20px 60px;min-height:70vh}
  .ui-footer{margin:0 auto;padding:0 20px 28px;color:var(--ui-muted);font-size:12px;text-align:center}
  @media(max-width:820px){.ui-topbar-inner{flex-wrap:wrap;padding:10px 14px;gap:8px}.ui-nav{order:3;width:100%;flex-basis:100%}.ui-topbar-end{margin-left:auto}.ui-main{padding:18px 14px 48px}}
  `]

  title = ''
  path = ''
  version = '1.15.0'
  nav: NavItem[] = adminNav
  width = 1180

  render(): TemplateResult {
    const links = this.nav.map(n => {
      const active = this.path === n.href || (n.href !== '/admin/models' && this.path.startsWith(n.href + '/')) ||
        (n.href === '/admin/models' && this.path.startsWith('/admin/models/'))
      return html`<a href=${n.href} class=${'ui-nav-link' + (active ? ' is-active' : '')}>${n.icon ? html`<span class="ui-nav-icon">${n.icon}</span>` : ''}<span>${n.label}</span></a>`
    })
    return html`
<header class="ui-topbar"><div class="ui-topbar-inner" style=${`max-width:${this.width}px`}>
  <a href="/admin/models" class="ui-brand"><span class="ui-brand-mark">L</span><span>LLM Gateway</span></a>
  <nav class="ui-nav">${links}</nav>
  <div class="ui-topbar-end"><a href="/user/main" class="ui-link">用户端</a><span class="ui-version">v${this.version}</span></div>
</div></header>
<main class="ui-main" style=${`max-width:${this.width}px`}><slot></slot></main>
<footer class="ui-footer" style=${`max-width:${this.width}px`}>LLM Gateway · Go rewrite</footer>
`
  }
}

if (!customElements.get('gw-shell')) customElements.define('gw-shell', GwShell)
