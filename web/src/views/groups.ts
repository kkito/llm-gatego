import { escapeHtml } from '../format.js'
import { empty, notice, pageHeader, panel, shell } from '../ui/shell.js'
export interface GroupView { name: string; desc?: string; models: string[] }

export function groupsPage(groups: GroupView[], error?: string, success?: string, version = '1.15.0'): string {
  const cards = groups.map(g => `<article class="ui-panel" style="margin:0">
    <div class="ui-panel-head"><div><h3 class="ui-panel-title">${escapeHtml(g.name)}</h3><p class="ui-panel-sub">${g.models.length} 个模型</p></div><a class="ui-btn ui-btn-sm" href="/admin/model-groups/edit/${encodeURIComponent(g.name)}">管理模型</a></div>
    <div class="ui-panel-body"><p class="ui-field-hint">${escapeHtml(g.desc || '—')}</p><div class="ui-row" style="margin:10px 0 14px">${g.models.slice(0, 5).map(m => `<a class="ui-badge" href="/admin/models/edit/${encodeURIComponent(m)}">${escapeHtml(m)}</a>`).join('')}${g.models.length > 5 ? `<span class="ui-field-hint">+${g.models.length - 5}</span>` : ''}</div>
    <form method="POST" action="/admin/model-groups/delete/${encodeURIComponent(g.name)}"><button class="ui-btn ui-btn-sm ui-btn-danger">删除分组</button></form></div></article>`).join('')
  const body = pageHeader({ eyebrow: 'Routing', title: '模型分组', subtitle: '管理模型分组配置', actions: `<a class="ui-btn" href="/admin/models">返回模型</a><a class="ui-btn ui-btn-primary" href="/admin/model-groups/new">+ 新建分组</a>` }) +
    (error ? notice(error, 'error') : '') + (success ? notice(success, 'success') : '') +
    (groups.length ? `<div class="ui-grid ui-grid-auto">${cards}</div>` : panel('分组列表', '', empty('暂无分组', '创建分组后可配置模型回退顺序。')))
  return shell({ title: '模型分组', path: '/admin/model-groups', version, body })
}
