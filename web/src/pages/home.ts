import { escapeHtml } from '../format.js'
export function renderHome(groups: {name:string;models:string[]}[]): string {
  if (!groups.length) return '<p class="empty">No model groups available</p>'
  return groups.map(g => `<gw-card><span slot="title">${escapeHtml(g.name)}</span><ul>${g.models.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul></gw-card>`).join('')
}
