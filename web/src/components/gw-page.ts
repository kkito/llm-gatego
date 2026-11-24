import { LitElement, html, css, type TemplateResult } from 'lit'
import { globalCSS } from '../styles/tokens-lit.js'
import { adminNav, userNav, type NavItem } from './gw-shell.js'
import { uiCSS } from './ui.js'

/**
 * Base class for routed pages.
 *
 * - Handles shell wrapping so `gw-app` only chooses which page to mount.
 * - Owns its own data loading. Page components call `this.load()` from
 *   `connectedCallback()` and render via `renderPage()`.
 * - Defines route metadata (title/path/nav/width) as reactive properties so
 *   `<gw-shell>` stays declarative.
 */
export class GwPage extends LitElement {
  static styles = [globalCSS, uiCSS, css`
    :host{display:block}
    .gw-loading{padding:24px;color:var(--ui-muted)}
  `]
  static properties: Record<string, any> = {
    title: { state: true }, path: { state: true }, nav: { state: true },
    width: { state: true }, loading: { state: true }, error: { state: true },
  }

  title = ''
  path = location.pathname
  nav: NavItem[] = adminNav
  width = 1180
  loading = false
  error = ''

  private lastPath = ''

  protected load(): Promise<unknown> | void { return undefined }
  protected renderPage(): TemplateResult { return html`` }

  connectedCallback(): void {
    super.connectedCallback()
    this.lastPath = this.path
    void this.load()
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('path')) {
      if (this.lastPath && this.path !== this.lastPath) {
        this.lastPath = this.path
        void this.load()
      }
      this.nav = this.path.startsWith('/user/') ? userNav : adminNav
      this.width = this.path.startsWith('/user/') ? 980 : 1180
    }
  }

  render(): TemplateResult {
    return html`
      <gw-shell .title=${this.title} .path=${this.path} .nav=${this.nav} .width=${this.width}>
        ${this.loading ? html`<div class="gw-loading">加载中...</div>` : this.error ? html`<div class="ui-notice ui-notice-error">${this.error}</div>` : this.renderPage()}
      </gw-shell>
    `
  }
}
