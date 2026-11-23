import { escapeHtml, formatNumber, formatDuration } from '../format.js'
import { css } from '../styles/admin_stats.js'
import { adminPage } from './layout.js'
export interface StatsView {
  startDate: string; endDate: string; dateRange: string; userName?: string; model?: string
  totalRequests: number; successfulRequests: number; failedRequests: number
  totalInputTokens: number; totalOutputTokens: number; totalTokens: number; totalCachedTokens: number; avgDuration: number
  byModel: Record<string, { requests: number; successful: number; failed: number; totalTokens: number }>
  byDate: Record<string, number>; byHour: Record<string, number>
}
export function statsPage(s: StatsView, version = '1.15.0'): string {
  const successPct = s.totalRequests ? (s.successfulRequests / s.totalRequests) * 100 : 0
  const failPct = s.totalRequests ? (s.failedRequests / s.totalRequests) * 100 : 0
  const body = `<div class="page-header"><div><h1 class="page-title">统计 Dashboard</h1></div></div>
<div class="filter-bar"><form method="get" action="/admin/stats" class="filter-form" id="stats-filter-form"><div class="filter-group"><label for="start">开始日期</label><input type="date" id="start" name="startDate" value="${s.startDate}"></div><div class="filter-group"><label for="end">结束日期</label><input type="date" id="end" name="endDate" value="${s.endDate}"></div><div class="filter-group"><label for="user">用户</label><input id="user" name="userName" value="${escapeHtml(s.userName || '')}"></div><div class="filter-group"><label for="model">模型</label><input id="model" name="model" value="${escapeHtml(s.model || '')}"></div><button type="submit" class="filter-submit">查询</button></form><div class="filter-shortcuts" id="filter-shortcuts"><button data-days="1">今天</button><button data-days="7">近 7 天</button><button data-days="30">近 30 天</button></div><div class="filter-current">${escapeHtml(s.dateRange)} · 平均延迟 ${formatDuration(s.avgDuration)}</div></div>
<div class="overview-grid">
<div class="overview-card overview-card--blue"><div class="overview-card-label">总请求数</div><div class="overview-card-value">${formatNumber(s.totalRequests)}</div><div class="overview-card-sub">${escapeHtml(s.dateRange)}</div></div>
<div class="overview-card overview-card--green"><div class="overview-card-label">成功请求</div><div class="overview-card-value">${formatNumber(s.successfulRequests)}</div><div class="overview-card-sub">成功率 ${successPct.toFixed(1)}%</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${successPct}%;background:var(--green-gradient)"></div></div></div>
<div class="overview-card overview-card--red"><div class="overview-card-label">失败请求</div><div class="overview-card-value">${formatNumber(s.failedRequests)}</div><div class="overview-card-sub">失败率 ${failPct.toFixed(1)}%</div></div>
<div class="overview-card overview-card--purple"><div class="overview-card-label">成功率</div><div class="overview-card-value">${successPct.toFixed(1)}%</div><div class="overview-card-sub">${s.successfulRequests} / ${s.totalRequests}</div></div></div>
<div class="token-card"><h2 class="token-card-title">📈 Token 用量</h2><div class="token-grid"><div class="token-item"><div class="token-item-value">${formatNumber(s.totalInputTokens)}</div><div class="token-item-label">输入</div></div><div class="token-item"><div class="token-item-value">${formatNumber(s.totalCachedTokens)}</div><div class="token-item-label">输入缓存</div></div><div class="token-item"><div class="token-item-value">${formatNumber(s.totalOutputTokens)}</div><div class="token-item-label">输出</div></div><div class="token-item"><div class="token-item-value">${formatNumber(s.totalTokens)}</div><div class="token-item-label">总计</div></div></div></div>
<div class="stats-section-card"><h2 class="stats-section-title">🗓️ 每日 Token 消耗</h2><div class="heatmap-scroll" data-heatmap-scroll><div class="heatmap-grid" data-heatmap-grid>${Object.entries(s.byDate).map(([d, n]) => `<div class="heatmap-col" title="${d}: ${n}"><div class="heatmap-cell" style="opacity:${Math.min(1, n / Math.max(1, ...Object.values(s.byDate)))}"></div></div>`).join('')}</div></div></div>
<div class="stats-section-card"><h2 class="stats-section-title">🤖 按模型统计</h2><div class="stat-mini-cards">${Object.entries(s.byModel).map(([m, v]) => `<div class="stat-mini-card"><div class="stat-mini-name">${escapeHtml(m)}</div><div class="stat-mini-requests">${formatNumber(v.requests)}</div><div class="stat-mini-tokens">${formatNumber(v.totalTokens)} tokens</div></div>`).join('')}</div></div>`
  const script = `<script>document.querySelectorAll('#filter-shortcuts button').forEach(function(b){b.addEventListener('click',function(){var d=parseInt(this.getAttribute('data-days'),10);var end=new Date();var start=new Date(end.getTime()-d*86400000);document.getElementById('start').value=start.toISOString().slice(0,10);document.getElementById('end').value=end.toISOString().slice(0,10);document.getElementById('stats-filter-form').submit()})})</script>`
  return adminPage('统计 Dashboard', '/admin/stats', body, css, version, script)
}
