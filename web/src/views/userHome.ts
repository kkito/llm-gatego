import { escapeHtml } from '../format.js'
import { panel, shell, userNav } from '../ui/shell.js'
export interface UserHomeView { models: string[]; modelGroups: string[]; announcement?: string; userName?: string }

export function userHomePage(p: UserHomeView): string {
  const cfg = JSON.stringify({ openai: { baseURL: location.origin + '/v1', apiKey: 'sk-your-api-key' } }, null, 2)
  const copy = (id: string) => `<button class="ui-btn ui-btn-sm copy-btn" data-copy="${id}">复制</button>`
  const body = `<div class="ui-page-head"><div><div class="ui-eyebrow">Getting started</div><h1 class="ui-title">🚀 LLM Gateway</h1><p class="ui-subtitle">统一的大模型 API 网关，兼容 OpenAI / Anthropic / Responses 格式</p></div>${p.userName ? `<div class="ui-row">欢迎，${escapeHtml(p.userName)}</div>` : ''}</div>
${p.announcement ? `<div class="ui-notice ui-notice-info">${p.announcement}</div>` : ''}
<div class="ui-grid ui-grid-2">
  ${panel('JSON 配置', '复制到你的 OpenAI 兼容客户端', `<pre class="ui-input ui-mono" id="json-config" style="white-space:pre-wrap;min-height:160px">${escapeHtml(cfg)}</pre><div style="height:10px"></div>${copy('json-config')}`)}
  ${panel('Base URL', '网关地址', `<div class="ui-mono" id="base-url">${location.origin}/v1</div><div style="height:10px"></div>${copy('base-url')}`)}
</div>
${panel('可用模型', `${p.models.length} 个模型 / ${p.modelGroups.length} 个模型组`, `<div class="ui-mono" id="model-value">${escapeHtml((p.modelGroups.length ? p.modelGroups : p.models)[0] || '')}</div><div style="height:10px"></div>${copy('model-value')}<div class="ui-row" style="margin-top:14px">${(p.modelGroups.length ? p.modelGroups : p.models).map(m => `<span class="ui-badge">${escapeHtml(m)}</span>`).join('')}</div>`)}
<script>document.querySelectorAll('.copy-btn').forEach(function(b){b.addEventListener('click',function(){var el=document.getElementById(this.getAttribute('data-copy'));if(el&&navigator.clipboard)navigator.clipboard.writeText(el.textContent||'');this.textContent='已复制';var btn=this;setTimeout(function(){btn.textContent='复制'},1500)})})</script>`
  return shell({ title: 'LLM Gateway', path: '/user/main', nav: userNav, body, width: 980 })
}
