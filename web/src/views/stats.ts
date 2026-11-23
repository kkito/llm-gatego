import { escapeHtml, formatNumber, formatDuration } from '../format.js'
import { panel, pageHeader, shell, table } from '../ui/shell.js'
export interface StatsView {
  startDate: string; endDate: string; dateRange: string; userName?: string; model?: string
  totalRequests: number; successfulRequests: number; failedRequests: number
  totalInputTokens: number; totalOutputTokens: number; totalTokens: number; totalCachedTokens: number; avgDuration: number
  byModel: Record<string, { requests: number; successful: number; failed: number; totalTokens: number }>
  byDate: Record<string, number>; byHour: Record<string, number>
  page?: number; totalPages?: number
  details?: Array<{ timestamp: string; userName: string; customModel: string; modelGroup: string; statusCode: number; durationMs: number; ttftMs?: number|null; tps?: number|null; completionTokens: number; promptTokens: number; cachedTokens: number }>
}
export function statsPage(s: StatsView, version = '1.15.0'): string {
  const pct = s.totalRequests ? (s.successfulRequests / s.totalRequests) * 100 : 0
  const cards = [
    ['总请求', formatNumber(s.totalRequests), s.dateRange],
    ['成功请求', formatNumber(s.successfulRequests), `${pct.toFixed(1)}% 成功率`],
    ['失败请求', formatNumber(s.failedRequests), `${(100 - pct).toFixed(1)}% 失败率`],
    ['平均延迟', formatDuration(s.avgDuration), '所有请求'],
  ].map(([label, value, sub]) => `<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${label}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${value}</div><div class="ui-field-hint">${escapeHtml(sub)}</div></div>`).join('')
  const tokens = [['输入', s.totalInputTokens], ['缓存输入', s.totalCachedTokens], ['输出', s.totalOutputTokens], ['总计', s.totalTokens]].map(([k, v]) => `<div><div class="ui-field-hint">${k}</div><div class="ui-mono" style="font-size:18px;font-weight:700">${formatNumber(v as number)}</div></div>`).join('')
  const heat = Object.entries(s.byDate).map(([d, n]) => `<span class="ui-badge" title="${d}: ${n}">${d.slice(5)} · ${n}</span>`).join('')
  const models = Object.entries(s.byModel).map(([m, v]) => `<div class="ui-row" style="padding:8px 0;border-bottom:1px solid var(--ui-line)"><strong>${escapeHtml(m)}</strong><span class="ui-spacer"></span><span class="ui-mono">${formatNumber(v.requests)} 请求</span><span class="ui-field-hint">${formatNumber(v.totalTokens)} tokens</span></div>`).join('')
  const detailRows = (s.details || []).map(r => `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${escapeHtml(r.userName || '-')}</td><td>${escapeHtml(r.customModel)}</td><td>${escapeHtml(r.modelGroup || '—')}</td><td>${r.statusCode}</td><td>${formatDuration(r.durationMs)}</td><td>${r.ttftMs != null ? formatDuration(r.ttftMs) : '—'}</td><td>${r.tps != null ? r.tps.toFixed(1) : '—'}</td><td>${formatNumber(r.completionTokens)}</td></tr>`)
  const filter = `<form method="get" action="/admin/stats" class="ui-row" id="stats-filter-form"><input class="ui-input" style="width:auto" type="date" id="start" name="startDate" value="${s.startDate}"><input class="ui-input" style="width:auto" type="date" id="end" name="endDate" value="${s.endDate}"><input class="ui-input" style="width:150px" name="userName" placeholder="用户" value="${escapeHtml(s.userName || '')}"><input class="ui-input" style="width:180px" name="model" placeholder="模型" value="${escapeHtml(s.model || '')}"><button class="ui-btn ui-btn-primary">查询</button><button type="button" class="ui-btn" data-days="1">今天</button><button type="button" class="ui-btn" data-days="7">7天</button><button type="button" class="ui-btn" data-days="30">30天</button></form>`
  const body = pageHeader({ eyebrow: 'Analytics', title: '统计 Dashboard', subtitle: `${escapeHtml(s.dateRange)} · 平均延迟 ${formatDuration(s.avgDuration)}` }) +
    filter + `<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards}</div><div style="height:16px"></div>` +
    panel('Token 用量', '', `<div class="ui-grid ui-grid-auto">${tokens}</div>`) +
    panel('每日消耗', '', `<div class="ui-row heatmap-grid">${heat || '暂无数据'}</div>`) +
    panel('按模型统计', '', models || '暂无数据') +
    ((s.details || []).length ? `<div class="pagination">${panel('最近请求', `${s.details!.length} 条`, table(['时间', '用户', '模型', '分组', '状态', '耗时', 'TTFT', 'TPS', '输出'], detailRows))}</div>` : '')
  const script = `<script>document.querySelectorAll('[data-days]').forEach(function(b){b.addEventListener('click',function(){var d=parseInt(this.getAttribute('data-days'),10);var end=new Date();var start=new Date(end.getTime()-d*86400000);document.getElementById('start').value=start.toISOString().slice(0,10);document.getElementById('end').value=end.toISOString().slice(0,10);document.getElementById('stats-filter-form').submit()})})</script>`
  return shell({ title: '统计 Dashboard', path: '/admin/stats', version, body, scripts: script })
}
