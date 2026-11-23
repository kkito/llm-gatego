import { escapeHtml } from '../format.js'
export interface Group { name: string; models: string[] }
export function renderGroups(groups: Group[]): string {
  if (!groups.length) return '<p class="empty">No model groups</p>'
  return `<gw-table><tr slot="head"><th>Group</th><th>Models</th><th>Actions</th></tr>${groups.map(g => `<tr data-group="${escapeHtml(g.name)}"><td>${escapeHtml(g.name)}</td><td>${g.models.map(escapeHtml).join(', ')}</td><td><button data-action="add-model" data-group="${escapeHtml(g.name)}">Add model</button><button data-action="remove-group" data-group="${escapeHtml(g.name)}">Delete</button></td></tr>`).join('')}</gw-table>`
}
