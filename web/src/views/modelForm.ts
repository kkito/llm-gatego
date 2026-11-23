import { escapeHtml } from '../format.js'
import { css } from '../styles/admin_model_form.js'
import { adminPage } from './layout.js'
export interface ModelFormView {
  customModel?: string; realModel?: string; provider?: string; baseUrl?: string; proxy?: string; apiKey?: string; desc?: string; maxContextLength?: number
}
export function modelFormPage(model: ModelFormView | undefined, apiKeyOptions: string[], error?: string, version = '1.15.0'): string {
  const isEdit = !!model
  const m = model || {}
  const v = (s: string | undefined) => escapeHtml(s || '')
  const body = `<div class="form-card"><h1 class="form-title">${isEdit ? '编辑模型' : '新增模型'}</h1>${error ? `<div class="error-banner"><strong>错误：</strong> ${escapeHtml(error)}</div>` : ''}<form method="post" action="${isEdit ? `/admin/models/edit/${encodeURIComponent(m.customModel!)}` : '/admin/models'}">
<div class="form-group"><label class="form-label" for="customModel">模型名称</label><input class="form-input" id="customModel" name="customModel" value="${v(m.customModel)}" placeholder="例如：my-gpt4" required><span class="form-hint">调用 API 时使用此名称</span></div>
<div class="form-group"><label class="form-label" for="realModel">实际模型名称</label><input class="form-input" id="realModel" name="realModel" value="${v(m.realModel)}" placeholder="例如：gpt-4" required><span class="form-hint">上游 API 支持的模型名称</span></div>
<div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" required><option value="">请选择...</option>${['openai', 'response-api', 'anthropic'].map(p => `<option value="${p}" ${m.provider === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
<div class="form-group"><label class="form-label" for="baseUrl">Base URL</label><input class="form-input" id="baseUrl" name="baseUrl" value="${v(m.baseUrl)}" placeholder="例如：https://api.openai.com" required><span class="form-hint">API 提供商的地址</span></div>
<div class="form-group"><label class="form-label" for="proxy">代理（可选）</label><input class="form-input" id="proxy" name="proxy" value="${v(m.proxy)}" placeholder="http://user:pass@127.0.0.1:7890 或 socks5://127.0.0.1:1080"><span class="form-hint">发往上游的请求通过此代理转发，留空则直连。支持 http://、https://、socks5://（可带 user:pass@ 认证）；不支持 socks5h:// 和 socks4://</span></div>
<div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource"><option value="">请选择...</option>${apiKeyOptions.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('')}</select><input class="form-input" name="apiKey" placeholder="${isEdit ? '留空则保持原密钥不变' : '请输入 API Key'}"><span class="form-hint">可选择已存储的引用或直接输入</span></div>
<div class="form-group"><label class="form-label" for="desc">描述</label><textarea class="form-textarea" id="desc" name="desc" placeholder="请输入模型描述（可选）">${v(m.desc)}</textarea><span class="form-hint">用于记录模型的用途或备注</span></div>
<div class="form-group"><label class="form-label" for="maxContextLength">最大上下文长度</label><input class="form-input" id="maxContextLength" name="maxContextLength" type="number" value="${m.maxContextLength || ''}" placeholder="默认 200000"><span class="form-hint">模型支持的最大 token 数，未填写则使用默认值 200000</span></div>
<div class="form-actions"><button type="submit" class="btn btn-primary">保存模型</button><a href="/admin/models" class="btn btn-secondary">取消</a></div></form></div>`
  return adminPage(isEdit ? '编辑模型' : '新增模型', '/admin/models', body, css, version)
}
