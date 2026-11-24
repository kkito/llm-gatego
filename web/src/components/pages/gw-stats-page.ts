import { LitElement, html, css, type TemplateResult } from 'lit'
import { formatNumber, formatDuration } from '../../format.js'
import { pageHeader, panel, table, uiCSS } from '../ui.js'

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

const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']

export class GwStatsPage extends LitElement {
  static styles = [uiCSS, css`.heatmap-tip{position:fixed;z-index:9999;pointer-events:none;background:#101828;color:#fff;font-size:12px;padding:5px 8px;border-radius:6px;white-space:nowrap;display:none;box-shadow:0 6px 18px rgba(16,24,40,.22)}`]
  static properties = { data: { state: true }, error: { state: true } }
  data: StatsView = {} as StatsView
  error = ''

  private tipText = ''
  private tipX = 0
  private tipY = 0
  private tipVisible = false

  private setDays(days: number): void {
    const sr = this.shadowRoot!
    const end = new Date()
    const start = new Date(end.getTime() - days * 86400000)
    ;(sr.querySelector('#start') as HTMLInputElement).value = start.toISOString().slice(0, 10)
    ;(sr.querySelector('#end') as HTMLInputElement).value = end.toISOString().slice(0, 10)
    ;(sr.querySelector('#stats-filter-form') as HTMLFormElement).submit()
  }

  private showTip(e: Event, text: string): void {
    this.tipText = text; this.tipVisible = true
    const me = e as MouseEvent; this.tipX = me.clientX; this.tipY = me.clientY
    this.requestUpdate()
  }
  private hideTip(): void { this.tipVisible = false; this.requestUpdate() }

  render(): TemplateResult {
    const s = this.data
    const pct = s.totalRequests ? (s.successfulRequests / s.totalRequests) * 100 : 0
    const cards: Array<[string, string, string]> = [
      ['总请求', formatNumber(s.totalRequests), s.dateRange || ''],
      ['成功请求', formatNumber(s.successfulRequests), `${pct.toFixed(1)}% 成功率`],
      ['失败请求', formatNumber(s.failedRequests), `${(100 - pct).toFixed(1)}% 失败率`],
      ['平均延迟', formatDuration(s.avgDuration), '所有请求'],
    ]
    const tokens: Array<[string, number]> = [['输入', s.totalInputTokens], ['缓存输入', s.totalCachedTokens], ['输出', s.totalOutputTokens], ['总计', s.totalTokens]]

    const days = Array.isArray(s.dailyHeatmap) ? s.dailyHeatmap : []
    const maxTokens = Math.max(1, ...days.map(d => d.totalTokens || 0))
    const levelOf = (t: number) => t <= 0 ? 0 : t < maxTokens * 0.25 ? 1 : t < maxTokens * 0.5 ? 2 : t < maxTokens * 0.75 ? 3 : 4
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
      if (m !== lastMonth) { lastMonth = m; monthLabels.push({ col, label: `${Number(first.date.slice(5, 7))}月` }) }
    })
    const totalHeatTokens = days.reduce((sum, d) => sum + (d.totalTokens || 0), 0)
    const rangeText = s.heatmapStart && s.heatmapEnd ? ` · ${s.heatmapStart} ~ ${s.heatmapEnd}` : ''

    const models = Object.entries(s.byModel || {}).map(([m, v]) => html`<div class="ui-row" style="padding:8px 0;border-bottom:1px solid var(--ui-line)"><strong>${m}</strong><span class="ui-spacer"></span><span class="ui-mono">${formatNumber(v.requests)} 请求</span><span class="ui-field-hint">${formatNumber(v.totalTokens)} tokens</span></div>`)
    const detailRows = (s.details || []).filter(r => r && r.timestamp).map(r => html`<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${r.userName || '-'}</td><td>${r.customModel}</td><td>${r.modelGroup || '—'}</td><td>${r.statusCode}</td><td>${formatDuration(r.durationMs)}</td><td>${r.ttftMs != null ? formatDuration(r.ttftMs) : '—'}</td><td>${r.tps != null ? r.tps.toFixed(1) : '—'}</td><td>${formatNumber(r.completionTokens)}</td></tr>`)

    return html`
${pageHeader({ eyebrow: 'Analytics', title: '统计 Dashboard', subtitle: `${s.dateRange || ''} · 平均延迟 ${formatDuration(s.avgDuration)}` })}
<form method="get" action="/admin/stats" class="ui-row" id="stats-filter-form"><input class="ui-input" style="width:auto" type="date" id="start" name="startDate" value=${s.startDate}><input class="ui-input" style="width:auto" type="date" id="end" name="endDate" value=${s.endDate}><input class="ui-input" style="width:150px" name="userName" placeholder="用户" value=${s.userName || ''}><input class="ui-input" style="width:180px" name="model" placeholder="模型" value=${s.model || ''}><button class="ui-btn ui-btn-primary">查询</button><button type="button" class="ui-btn" data-days="1" @click=${() => this.setDays(1)}>今天</button><button type="button" class="ui-btn" data-days="7" @click=${() => this.setDays(7)}>7天</button><button type="button" class="ui-btn" data-days="30" @click=${() => this.setDays(30)}>30天</button></form>
<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards.map(([label, value, sub]) => html`<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${label}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${value}</div><div class="ui-field-hint">${sub}</div></div>`)}</div><div style="height:16px"></div>
${panel('Token 用量', '', html`<div class="ui-grid ui-grid-auto">${tokens.map(([k, v]) => html`<div><div class="ui-field-hint">${k}</div><div class="ui-mono" style="font-size:18px;font-weight:700">${formatNumber(v || 0)}</div></div>`)}</div>`)}
${days.length ? html`<div class="stats-section-card"><h2 class="stats-section-title">🗓️ 每日 Token 消耗</h2><div style="font-size:12px;color:var(--ui-muted);margin-bottom:10px">过去 ${days.length} 天 · 共 ${formatNumber(totalHeatTokens)} tokens${rangeText}</div><div class="heatmap-scroll"><div class="heatmap-months">${weeks.map((_, col) => { const lbl = monthLabels.find(l => l.col === col); return html`<span>${lbl ? lbl.label : ''}</span>` })}</div><div class="heatmap-grid" data-heatmap-grid>${weeks.map(week => html`<div class="heatmap-col">${week.map(c => c.date ? html`<span class="heatmap-cell" data-tip=${`${c.date} · ${c.requests || 0} 次请求 · ${formatNumber(c.totalTokens || 0)} tokens`} style=${`background:${colors[levelOf(c.totalTokens || 0)]}`} @mouseenter=${(e: Event) => this.showTip(e, `${c.date} · ${c.requests || 0} 次请求 · ${formatNumber(c.totalTokens || 0)} tokens`)} @mousemove=${(e: Event) => this.showTip(e, `${c.date} · ${c.requests || 0} 次请求 · ${formatNumber(c.totalTokens || 0)} tokens`)} @mouseleave=${() => this.hideTip()}></span>` : html`<span class="heatmap-cell" style="visibility:hidden"></span>`)}</div>`)}</div><div class="heatmap-legend"><span>Less</span>${colors.map(c => html`<span class="heatmap-cell" style=${`background:${c}`}></span>`)}<span>More</span><span style="margin-left:8px">深浅按当日 token 量相对最大值划分</span></div></div></div>` : ''}
${panel('按模型统计', '', models.length ? models : '暂无数据')}
${(s.details || []).length ? html`<div class="pagination">${panel('最近请求', `${s.details!.length} 条`, table(['时间', '用户', '模型', '分组', '状态', '耗时', 'TTFT', 'TPS', '输出'], detailRows))}</div>` : ''}
<div class="heatmap-tip" style=${`display:${this.tipVisible ? 'block' : 'none'};left:${this.tipX + 12}px;top:${this.tipY + 12}px`}>${this.tipText}</div>
`
  }
}
if (!customElements.get('gw-stats-page')) customElements.define('gw-stats-page', GwStatsPage)
