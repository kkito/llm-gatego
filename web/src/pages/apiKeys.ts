import { escapeHtml } from '../format.js'
export interface ApiKey { id: string; name: string; key: string }
export function renderApiKeys(keys: ApiKey[]): string {
  return `<gw-table><tr slot="head"><th>Name</th><th>Key</th><th>Actions</th></tr>${keys.map(k => `<tr data-id="${escapeHtml(k.id)}"><td>${escapeHtml(k.name)}</td><td>${escapeHtml(k.key)}</td><td><button data-action="delete-key" data-id="${escapeHtml(k.id)}">Delete</button></td></tr>`).join('')}</gw-table>`
}
