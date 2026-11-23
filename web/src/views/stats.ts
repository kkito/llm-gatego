import { escapeHtml, formatNumber, formatDuration } from '../format.js'
import { panel, pageHeader, shell, table } from '../ui/shell.js'
export interface StatsView {
  startDate: string; endDate: string; dateRange: string; userName?: string; model?: string
  totalRequests: number; successfulRequests: number; failedRequests: number
  totalInputTokens: number; totalOutputTokens: number; totalTokens: number; totalCachedTokens: number; avgDuration: number
  byModel: Record<string, { requests: number; successful: number; failed: number; totalTokens: number }>
  byDate: Record<string, number>; byHour: Record<string, number>
  dailyHeatmap?: Array<{ date: string; requests: number; totalTokens: number }>
  heatmapStart?: string; heatmapEnd?: string
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

  const days = Array.isArray(s.dailyHeatmap) ? s.dailyHeatmap : []
  const maxTokens = Math.max(1, ...days.map(d => d.totalTokens || 0))
  const levelOf = (t: number) => t <= 0 ? 0 : t < maxTokens * 0.25 ? 1 : t < maxTokens * 0.5 ? 2 : t < maxTokens * 0.75 ? 3 : 4
  const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
  const start = new Date(`${days[0]?.date || s.heatmapStart || s.startDate}T00:00:00`)
  const leadBlanks = Number.isFinite(start.getTime()) ? start.getDay() : 0
  const cells: Array<{ key: string; date?: string; requests?: number; totalTokens?: number }> = []
  for (let i = 0; i < leadBlanks; i++) cells.push({ key: `blank-${i}` })
  days.forEach(d => cells.push({ key: d.date, date: d.date, requests: d.requests, totalTokens: d.totalTokens }))
  const weeks: Array<typeof cells> = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const monthLabels: Array<{ col: number; label: string }> = []
  let lastMonth = ''
  weeks.forEach((week, col) => {
    const first = week.find(c => c.date)
    if (!first?.date) return
    const m = first.date.slice(0, 7)
    if (m !== lastMonth) {
      lastMonth = m
      monthLabels.push({ col, label: `${Number(first.date.slice(5, 7))}月` })
    }
  })
  const totalHeatTokens = days.reduce((sum, d) => sum + (d.totalTokens || 0), 0)
  const rangeText = s.heatmapStart && s.heatmapEnd ? ` · ${s.heatmapStart} ~ ${s.heatmapEnd}` : ''
  const heatmapHtml = days.length ? `<div class="stats-section-card"><h2 class="stats-section-title">🗓️ 每日 Token 消耗</h2><div style="font-size:12px;color:var(--ui-muted);margin-bottom:10px">过去 ${days.length} 天 · 共 ${formatNumber(totalHeatTokens)} tokens${rangeText}</div><div class="heatmap-scroll"><div class="heatmap-months">${weeks.map((_, col) => { const lbl = monthLabels.find(l => l.col === col); return `<span>${lbl ? lbl.label : ''}</span>` }).join('')}</div><div class="heatmap-grid" data-heatmap-grid>${weeks.map(week => `<div class="heatmap-col">${week.map(c => c.date ? `<span class="heatmap-cell" data-tip="${escapeHtml(`${c.date} · ${c.requests || 0} 次请求 · ${formatNumber(c.totalTokens || 0)} tokens`)}" style="background:${colors[levelOf(c.totalTokens || 0)]}"></span>` : '<span class="heatmap-cell" style="visibility:hidden"></span>').join('')}</div>`).join('')}</div><div class="heatmap-legend"><span>Less</span>${colors.map(c => `<span class="heatmap-cell" style="background:${c}"></span>`).join('')}<span>More</span><span style="margin-left:8px">深浅按当日 token 量相对最大值划分</span></div></div></div>` : ''

  const models = Object.entries(s.byModel).map(([m, v]) => `<div class="ui-row" style="padding:8px 0;border-bottom:1px solid var(--ui-line)"><strong>${escapeHtml(m)}</strong><span class="ui-spacer"></span><span class="ui-mono">${formatNumber(v.requests)} 请求</span><span class="ui-field-hint">${formatNumber(v.totalTokens)} tokens</span></div>`).join('')
  const detailRows = (s.details || []).map(r => `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${escapeHtml(r.userName || '-')}</td><td>${escapeHtml(r.customModel)}</td><td>${escapeHtml(r.modelGroup || '—')}</td><td>${r.statusCode}</td><td>${formatDuration(r.durationMs)}</td><td>${r.ttftMs != null ? formatDuration(r.ttftMs) : '—'}</td><td>${r.tps != null ? r.tps.toFixed(1) : '—'}</td><td>${formatNumber(r.completionTokens)}</td></tr>`)
  const filter = `<form method="get" action="/admin/stats" class="ui-row" id="stats-filter-form"><input class="ui-input" style="width:auto" type="date" id="start" name="startDate" value="${s.startDate}"><input class="ui-input" style="width:auto" type="date" id="end" name="endDate" value="${s.endDate}"><input class="ui-input" style="width:150px" name="userName" placeholder="用户" value="${escapeHtml(s.userName || '')}"><input class="ui-input" style="width:180px" name="model" placeholder="模型" value="${escapeHtml(s.model || '')}"><button class="ui-btn ui-btn-primary">查询</button><button type="button" class="ui-btn" data-days="1">今天</button><button type="button" class="ui-btn" data-days="7">7天</button><button type="button" class="ui-btn" data-days="30">30天</button></form>`
  const body = pageHeader({ eyebrow: 'Analytics', title: '统计 Dashboard', subtitle: `${escapeHtml(s.dateRange)} · 平均延迟 ${formatDuration(s.avgDuration)}` }) +
    filter + `<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards}</div><div style="height:16px"></div>` +
    panel('Token 用量', '', `<div class="ui-grid ui-grid-auto">${tokens}</div>`) +
    heatmapHtml +
    panel('按模型统计', '', models || '暂无数据') +
    ((s.details || []).length ? `<div class="pagination">${panel('最近请求', `${s.details!.length} 条`, table(['时间', '用户', '模型', '分组', '状态', '耗时', 'TTFT', 'TPS', '输出'], detailRows))}</div>` : '')
  const script = `<script>document.querySelectorAll('[data-days]').forEach(function(b){b.addEventListener('click',function(){var d=parseInt(this.getAttribute('data-days'),10);var end=new Date();var start=new Date(end.getTime()-d*86400000);document.getElementById('start').value=start.toISOString().slice(0,10);document.getElementById('end').value=end.toISOString().slice(0,10);document.getElementById('stats-filter-form').submit()})});(function(){var tip=document.createElement('div');tip.className='heatmap-tip';document.body.appendChild(tip);document.querySelectorAll('[data-heatmap-grid] .heatmap-cell[data-tip]').forEach(function(c){c.addEventListener('mouseenter',function(){tip.textContent=c.getAttribute('data-tip')||'';tip.style.display='block'});c.addEventListener('mousemove',function(e){tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY+12)+'px'});c.addEventListener('mouseleave',function(){tip.style.display='none'})})})()</script>`
  return shell({ title: '统计 Dashboard', path: '/admin/stats', version, body, scripts: script })
}
