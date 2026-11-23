import { escapeHtml } from '../format.js'
export interface Model { customModel: string; realModel: string; provider: string; baseUrl: string; hidden?: boolean; desc?: string }
export function renderModels(models: Model[]): string {
  if (!models.length) return '<p class="empty">No models configured</p>'
  return `<gw-table><tr slot="head"><th>Model</th><th>Real model</th><th>Provider</th><th>Actions</th></tr>${models.map(m => `<tr data-model="${escapeHtml(m.customModel)}"><td>${escapeHtml(m.customModel)}${m.hidden ? ' <span class="badge">hidden</span>' : ''}</td><td>${escapeHtml(m.realModel)}</td><td>${escapeHtml(m.provider)}</td><td><button data-action="edit" data-model="${escapeHtml(m.customModel)}">Edit</button><button data-action="delete" data-model="${escapeHtml(m.customModel)}">Delete</button><button data-action="copy" data-model="${escapeHtml(m.customModel)}">Copy</button><button data-action="toggle-hidden" data-model="${escapeHtml(m.customModel)}">${m.hidden ? 'Show' : 'Hide'}</button><button data-action="move-up" data-model="${escapeHtml(m.customModel)}">↑</button><button data-action="move-down" data-model="${escapeHtml(m.customModel)}">↓</button></td></tr>`).join('')}</gw-table>`
}
export function renderModelForm(model?: Partial<Model>): string {
  const m = model || {}
  return `<form id="model-form"><label>Name <input name="customModel" value="${escapeHtml(m.customModel||'')}" required></label><label>Real model <input name="realModel" value="${escapeHtml(m.realModel||'')}"></label><label>Provider <select name="provider">${['openai','anthropic','response-api'].map(p => `<option value="${p}"${p===m.provider?' selected':''}>${p}</option>`).join('')}</select></label><label>Base URL <input name="baseUrl" value="${escapeHtml(m.baseUrl||'')}"></label><label>API Key <input name="apiKey" type="password"></label><label>Description <input name="desc" value="${escapeHtml(m.desc||'')}"></label><button type="submit">Save</button></form>`
}
