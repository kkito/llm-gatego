import { escapeHtml } from '../format.js'
import { empty, notice, pageHeader, panel, shell, table } from '../ui/shell.js'

export interface ModelView {
  customModel: string
  realModel: string
  desc?: string
  hidden?: boolean
}

export function modelsPage(models: ModelView[], error?: string, version = '1.15.0'): string {
  const rows = models.map((m, i) => `<tr${m.hidden ? ' style="opacity:.55"' : ''}>
    <td><span class="ui-badge">${i + 1}</span></td>
    <td><strong>${escapeHtml(m.customModel)}</strong><div class="ui-field-hint ui-mono">→ ${escapeHtml(m.realModel)}</div></td>
    <td>${escapeHtml(m.desc || '—')}</td>
    <td><div class="ui-row">
      <button class="ui-btn ui-btn-sm" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="up" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="ui-btn ui-btn-sm" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="down" ${i === models.length - 1 ? 'disabled' : ''}>↓</button>
      <button class="ui-btn ui-btn-sm" data-toggle-url="/admin/models/toggle-hidden/${encodeURIComponent(m.customModel)}">${m.hidden ? '显示' : '隐藏'}</button>
      <button class="ui-btn ui-btn-sm" data-copy-url="/admin/models/copy/${encodeURIComponent(m.customModel)}">复制</button>
      <a class="ui-btn ui-btn-sm" href="/admin/models/edit/${encodeURIComponent(m.customModel)}">编辑</a>
      <a class="ui-btn ui-btn-sm" href="/admin/models/${encodeURIComponent(m.customModel)}/limits">限制</a>
      <button class="ui-btn ui-btn-sm ui-btn-danger" data-delete-url="/admin/models/delete/${encodeURIComponent(m.customModel)}">删除</button>
    </div></td>
  </tr>`)
  const body = pageHeader({
    eyebrow: 'Routing', title: '模型管理', subtitle: '配置和管理所有上游模型信息，调整顺序及增减模型。',
    actions: `<a class="ui-btn" href="/admin/model-groups">模型分组</a><a class="ui-btn ui-btn-primary" href="/admin/models/new">+ 新增模型</a>`,
  }) + (error ? notice(error, 'error') : '') +
    panel('模型列表', `${models.length} 个模型`, models.length ? table(['#', '模型名称', '描述', '操作'], rows) : empty('暂无模型', '点击“新增模型”开始配置。'))
  const script = `<script>(function(){document.querySelectorAll('button[data-delete-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-delete-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('确定要删除模型 "'+n+'" 吗？')){var f=document.createElement('form');f.method='POST';f.action=url;document.body.appendChild(f);f.submit();}})});document.querySelectorAll('button[data-move-url]').forEach(function(btn){btn.addEventListener('click',function(){var f=document.createElement('form');f.method='POST';f.action=this.getAttribute('data-move-url')+'?direction='+this.getAttribute('data-direction');document.body.appendChild(f);f.submit();})});document.querySelectorAll('button[data-copy-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-copy-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('确定要复制模型 "'+n+'" 吗？')){var f=document.createElement('form');f.method='POST';f.action=url;document.body.appendChild(f);f.submit();}})});document.querySelectorAll('button[data-toggle-url]').forEach(function(btn){btn.addEventListener('click',function(){var f=document.createElement('form');f.method='POST';f.action=this.getAttribute('data-toggle-url');document.body.appendChild(f);f.submit();})})})();</script>`
  return shell({ title: '模型管理', path: '/admin/models', version, body, scripts: script })
}
