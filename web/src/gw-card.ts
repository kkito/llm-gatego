export class GwCard extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `:host{display:block;background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);border-radius:12px;padding:20px;box-shadow:0 10px 30px -20px rgba(0,0,0,.6)}.card-title{font-weight:600;font-size:1.1rem}.card-eyebrow{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#6b7280)}`
    shadow.appendChild(style)
    const wrap = document.createElement('div')
    wrap.innerHTML = `<div class="card-eyebrow"><slot name="eyebrow"></slot></div><div class="card-title"><slot name="title"></slot></div><div class="body"><slot></slot></div>`
    shadow.appendChild(wrap)
  }
}
if (!customElements.get('gw-card')) customElements.define('gw-card', GwCard)
