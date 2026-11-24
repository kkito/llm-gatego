import { LitElement, html, type TemplateResult } from 'lit'
import { formatNumber, formatDuration } from '../../format.js'
import { empty, pageHeader, panel, table, uiCSS } from '../ui.js'

export interface UserStatsView { userName: string; start: string; end: string; totalRequests: number; successfulRequests: number; totalTokens: number; avgDuration: number; byModel: Record<string, { requests: number; totalTokens: number }>; byDate: Record<string, number> }

export class GwUserStatsPage extends LitElement {
  static styles = [uiCSS]
  static properties = { data: { state: true }, error: { state: true } }
  data: UserStatsView = {} as UserStatsView
  error = ''

  render(): TemplateResult {
    const s = this.data
    const pct = s.totalRequests ? (s.successfulRequests / s.totalRequests) * 100 : 0
    const filter = html`<form method="get" action="/user/stats" class="ui-row"><input class="ui-input" style="width:auto" type="date" name="startDate" value=${s.start}><input class="ui-input" style="width:auto" type="date" name="endDate" value=${s.end}><button class="ui-btn ui-btn-primary">查询</button></form>`
    if (!s.totalRequests) {
      return html`
${pageHeader({ eyebrow: 'Analytics', title: `使用统计 — ${s.userName || ''}`, subtitle: '查看 API 使用情况与统计数据' })}
${filter}<div style="height:16px"></div>
${panel('统计结果', '', empty('暂无统计数据', '发起一次请求后即可看到用量。'))}
`
    }
    const cards: Array<[string, string]> = [['总请求', formatNumber(s.totalRequests)], ['成功率', `${pct.toFixed(1)}%`], ['总 Token', formatNumber(s.totalTokens)], ['平均延迟', formatDuration(s.avgDuration)]]
    const rows = Object.entries(s.byModel || {}).map(([m, v]) => html`<tr><td>${m}</td><td>${v.requests}</td><td>${formatNumber(v.totalTokens)}</td></tr>`)
    return html`
${pageHeader({ eyebrow: 'Analytics', title: `使用统计 — ${s.userName || ''}`, subtitle: `${s.start} 至 ${s.end}` })}
${filter}<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards.map(([k, v]) => html`<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${k}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${v}</div></div>`)}</div><div style="height:16px"></div>
${panel('Token 用量明细', '', table(['模型', '请求数', 'Token'], rows))}
`
  }
}
if (!customElements.get('gw-user-stats-page')) customElements.define('gw-user-stats-page', GwUserStatsPage)
