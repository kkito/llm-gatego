import { GwApp } from './components/gw-app.js'
import { startRouter } from './router.js'

if (!customElements.get('gw-app')) customElements.define('gw-app', GwApp)

export function startWhenReady(doc: Document, start: () => void): void {
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
}

export function bootstrap(): void {
  startRouter()
  // <gw-app> is already in index.html; defining it above is enough.
  if (!document.querySelector('gw-app')) {
    document.body.appendChild(document.createElement('gw-app'))
  }
}

if (typeof document !== 'undefined') startWhenReady(document, bootstrap)
