import { escapeHtml } from '../format.js'
export interface User { name: string; desc?: string; allowedModels?: string[] }
export function renderUsers(users: User[]): string {
  if (!users.length) return '<p class="empty">No users configured</p>'
  return `<gw-table><tr slot="head"><th>Name</th><th>Allowed models</th><th>Actions</th></tr>${users.map(u => `<tr data-user="${escapeHtml(u.name)}"><td>${escapeHtml(u.name)}</td><td>${(u.allowedModels||[]).map(escapeHtml).join(', ')}</td><td><button data-action="edit-user" data-user="${escapeHtml(u.name)}">Edit</button><button data-action="toggle-user" data-user="${escapeHtml(u.name)}">Toggle</button><button data-action="delete-user" data-user="${escapeHtml(u.name)}">Delete</button></td></tr>`).join('')}</gw-table>`
}
