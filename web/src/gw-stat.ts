export class GwStat extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `:host{display:inline-block;min-width:140px;padding:14px 18px;border:1px solid var(--line,#e5e7eb);border-radius:10px}.value{font-size:1.8rem;font-weight:700}.label{font-size:.78rem;color:var(--muted,#6b7280)}`
    shadow.appendChild(style)
    const wrap = document.createElement('div')
    wrap.innerHTML = `<div class="value"><slot name="value"></slot></div><div class="label"><slot name="label"></slot></div>`
    shadow.appendChild(wrap)
  }
}
if (!customElements.get('gw-stat')) customElements.define('gw-stat', GwStat)
