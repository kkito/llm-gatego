import { escapeHtml, formatNumber, formatDuration } from '../format.js'
export interface Summary { totalRequests: number; totalTokens: number; avgTtft: number; avgTps: number; avgDuration: number }
export interface Stats { summary: Summary; byModel: { model: string; requests: number; tokens: number }[] }
export function renderStats(stats: Stats): string {
  const s = stats.summary
  return `<div class="stats-grid"><gw-stat><span slot="value">${formatNumber(s.totalRequests)}</span><span slot="label">Requests</span></gw-stat><gw-stat><span slot="value">${formatNumber(s.totalTokens)}</span><span slot="label">Tokens</span></gw-stat><gw-stat><span slot="value">${formatDuration(s.avgTtft)}</span><span slot="label">Avg TTFT</span></gw-stat><gw-stat><span slot="value">${s.avgTps.toFixed(1)}</span><span slot="label">Avg TPS</span></gw-stat></div><gw-table><tr slot="head"><th>Model</th><th>Requests</th><th>Tokens</th></tr>${stats.byModel.map(m => `<tr><td>${escapeHtml(m.model)}</td><td>${m.requests}</td><td>${m.tokens}</td></tr>`).join('')}</gw-table>`
}
