import { pageCSS } from '../styles/console_pages.js'
import { consoleCSS } from '../styles/console.js'
import { escapeHtml } from '../format.js'
import { css } from '../styles/user_home.js'
export interface UserHomeView { models: string[]; modelGroups: string[]; announcement?: string; userName?: string }
export function userHomePage(p: UserHomeView): string {
  const cfg = JSON.stringify({ openai: { baseURL: location.origin + '/v1', apiKey: 'sk-your-api-key' } }, null, 2)
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LLM Gateway - 配置信息</title><style>${css}</style><style>${consoleCSS}</style><style>${pageCSS}</style></head><body><div class="container-fluid"><div class="navbar"><a class="navbar-brand" href="/user/main">LLM Gateway</a><div class="navbar-menu"><a class="navbar-link" href="/user/stats">统计</a></div></div><div class="container"><div class="hero"><h1>🚀 LLM Gateway</h1><p class="hero-subtitle">统一的大模型 API 网关，兼容 OpenAI / Anthropic / Responses 格式</p><a href="/user/stats" style="color:var(--primary);text-decoration:none;margin-right:0.75rem;font-size:0.8rem">统计</a></div>
${p.announcement ? `<div class="announcement-banner">${p.announcement}</div>` : ''}
${p.userName ? `<p>欢迎，${escapeHtml(p.userName)}</p>` : ''}
<div class="card"><div class="card-header"><span class="card-icon">📋</span><h2>JSON 配置</h2></div><div class="input-wrapper"><pre class="input-value" id="json-config">${escapeHtml(cfg)}</pre><button id="copy-json" class="copy-btn">复制</button></div></div>
<div class="card"><div class="card-header"><span class="card-icon">🌐</span><h2>Base URL</h2></div><div class="input-wrapper"><span class="input-value" id="base-url">${location.origin}/v1</span><button id="copy-base-url" class="copy-btn">复制</button></div></div>
<div class="card"><div class="card-header"><span class="card-icon">🤖</span><h2>模型${p.modelGroups.length ? `<span class="model-count">（${p.models.length} 个模型 / ${p.modelGroups.length} 个模型组）</span>` : `<span class="model-count">（${p.models.length} 个可选）</span>`}</h2></div>
${p.modelGroups.length ? `<div class="model-group-toggle"><div class="toggle-option"><label for="toggle-group">模型组</label><input type="radio" id="toggle-group" name="toggle" checked></div><div class="toggle-option"><label for="toggle-model">模型</label><input type="radio" id="toggle-model" name="toggle"></div></div>` : ''}
<div class="input-wrapper model-inputs"><span class="input-value" id="model-value">${escapeHtml((p.modelGroups.length ? p.modelGroups : p.models)[0] || '')}</span><button id="copy-model" class="copy-btn">复制</button></div></div></div></div>
<script>document.querySelectorAll('.copy-btn').forEach(function(b){b.addEventListener('click',function(){var t=this.previousElementSibling;navigator.clipboard.writeText(t.textContent||'');this.textContent='已复制';setTimeout(function(){b.textContent='复制'},1500)})})</script></body></html>`
}
