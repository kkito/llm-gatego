import { escapeHtml } from '../format.js'
import { shell } from '../ui/shell.js'
import { modelsCSS } from '../styles/admin_models.js'

export interface ModelView {
  customModel: string
  realModel: string
  desc?: string
  hidden?: boolean
}

/**
 * Fluent-style admin sample page.
 *
 * Layout follows Fluent's enterprise tooling language: compact command bar,
 * informational table, dense row actions. All URLs and POST semantics are
 * preserved from the original page.
 */
export function modelsPage(models: ModelView[], error?: string, version = '1.15.0'): string {
  const rows = models.map((m, i) => `<tr class="f-row${m.hidden ? ' is-hidden' : ''}">
    <td class="f-index"><fluent-badge appearance="neutral" size="small">${i + 1}</fluent-badge></td>
    <td>
      <div class="f-model-name">${escapeHtml(m.customModel)}</div>
      <div class="f-model-real">→ ${escapeHtml(m.realModel)}</div>
    </td>
    <td class="f-desc">${escapeHtml(m.desc || '—')}</td>
    <td class="f-state">${m.hidden ? '<fluent-badge appearance="neutral">已隐藏</fluent-badge>' : '<fluent-badge appearance="success">启用中</fluent-badge>'}</td>
    <td>
      <div class="f-actions">
        <fluent-button appearance="subtle" size="small" aria-label="上移" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="up" ${i === 0 ? 'disabled' : ''}>↑</fluent-button>
        <fluent-button appearance="subtle" size="small" aria-label="下移" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="down" ${i === models.length - 1 ? 'disabled' : ''}>↓</fluent-button>
        <fluent-button appearance="subtle" size="small" data-toggle-url="/admin/models/toggle-hidden/${encodeURIComponent(m.customModel)}">${m.hidden ? '显示' : '隐藏'}</fluent-button>
        <fluent-button appearance="subtle" size="small" data-copy-url="/admin/models/copy/${encodeURIComponent(m.customModel)}">复制</fluent-button>
        <fluent-anchor-button appearance="subtle" size="small" href="/admin/models/edit/${encodeURIComponent(m.customModel)}">编辑</fluent-anchor-button>
        <fluent-anchor-button appearance="subtle" size="small" href="/admin/models/${encodeURIComponent(m.customModel)}/limits">限制</fluent-anchor-button>
        <fluent-button appearance="subtle" size="small" class="f-danger" data-delete-url="/admin/models/delete/${encodeURIComponent(m.customModel)}">删除</fluent-button>
      </div>
    </td>
  </tr>`).join('')

  const content = `
<section class="f-page">
  <div class="f-head">
    <div>
      <div class="f-eyebrow">ROUTING</div>
      <h1 class="f-title">模型管理</h1>
      <p class="f-subtitle">配置和管理所有上游模型信息，调整顺序及增减模型。</p>
    </div>
    <div class="f-commandbar">
      <fluent-anchor-button appearance="secondary" href="/admin/model-groups">模型分组</fluent-anchor-button>
      <fluent-anchor-button appearance="primary" href="/admin/models/new">+ 新增模型</fluent-anchor-button>
    </div>
  </div>
  ${error ? `<fluent-message-bar severity="error">${escapeHtml(error)}</fluent-message-bar>` : ''}
  <section class="f-card">
    <header class="f-card-head">
      <div>
        <h2 class="f-card-title">模型列表</h2>
        <p class="f-card-sub">${models.length} 个模型</p>
      </div>
      <fluent-badge appearance="brand">${models.length}</fluent-badge>
    </header>
    <fluent-divider></fluent-divider>
    ${models.length ? `
    <div class="f-table-wrap">
      <table class="f-table">
        <thead><tr><th>#</th><th>模型名称</th><th>描述</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>` : `
    <div class="f-empty">
      <div class="f-empty-mark">◇</div>
      <h3>暂无模型</h3>
      <p>点击“新增模型”开始配置。</p>
      <fluent-anchor-button appearance="primary" href="/admin/models/new">新增模型</fluent-anchor-button>
    </div>`}
  </section>
</section>`

  const script = `<script>(function(){
function post(url){var f=document.createElement('form');f.method='post';f.action=url;document.body.appendChild(f);f.submit()}
document.querySelectorAll('[data-delete-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-delete-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('确定要删除模型 "'+n+'" 吗？')){post(url)}})});
document.querySelectorAll('[data-move-url]').forEach(function(btn){btn.addEventListener('click',function(){post(this.getAttribute('data-move-url')+'?direction='+this.getAttribute('data-direction'))})});
document.querySelectorAll('[data-copy-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-copy-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('确定要复制模型 "'+n+'" 吗？')){post(url)}})});
document.querySelectorAll('[data-toggle-url]').forEach(function(btn){btn.addEventListener('click',function(){post(this.getAttribute('data-toggle-url'))})});
})();</script>`

  return shell({ title: '模型管理', path: '/admin/models', version, body: content, scripts: script, extraCSS: modelsCSS })
}
