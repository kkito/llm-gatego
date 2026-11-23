export class GwModal extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `:host{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.4);z-index:50}:host([open]){display:flex}.dialog{background:#fff;border-radius:12px;padding:24px;min-width:320px;max-width:90vw}`
    shadow.appendChild(style)
    const dialog = document.createElement('div')
    dialog.className = 'dialog'
    dialog.innerHTML = `<div class="head"><slot name="title"></slot></div><div class="body"><slot></slot></div><div class="actions"><slot name="actions"></slot></div>`
    shadow.appendChild(dialog)
  }
  open() { this.setAttribute('open', '') }
  close() { this.removeAttribute('open') }
}
if (!customElements.get('gw-modal')) customElements.define('gw-modal', GwModal)
