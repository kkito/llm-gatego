export class GwTable extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `:host{display:block;overflow-x:auto}.head{display:flex;font-weight:600;border-bottom:1px solid var(--line,#e5e7eb)}.body{display:block}`
    shadow.appendChild(style)
    const head = document.createElement('div')
    head.className = 'head'
    head.innerHTML = '<slot name="head"></slot>'
    shadow.appendChild(head)
    const body = document.createElement('div')
    body.className = 'body'
    body.innerHTML = '<slot></slot>'
    shadow.appendChild(body)
  }
}
if (!customElements.get('gw-table')) customElements.define('gw-table', GwTable)
