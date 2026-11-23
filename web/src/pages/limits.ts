import { escapeHtml } from '../format.js'
export interface Limit { type: string; period: string; periodValue: number; limit: number; modelName?: string }
export function renderLimits(limits: Limit[], model: string): string {
  return `<gw-card><span slot="title">Limits for ${escapeHtml(model)}</span><gw-table><tr slot="head"><th>Type</th><th>Period</th><th>Limit</th><th></th></tr>${limits.map((l,i) => `<tr><td>${escapeHtml(l.type)}</td><td>${escapeHtml(l.period)} ${l.periodValue}</td><td>${l.limit}</td><td><button data-action="delete-limit" data-index="${i}">Delete</button></td></tr>`).join('')}</gw-table><button data-action="add-limit">Add limit</button></gw-card>`
}
