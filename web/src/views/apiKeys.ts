import { escapeHtml } from '../format.js'
import { empty, formField, notice, pageHeader, panel, shell, table } from '../ui/shell.js'

export interface KeyView { id: string; name: string; key?: string; keyHint?: string; createdAt?: number }
export interface EditingKeyView { id: string; name: string; keyHint: string }

export function apiKeysPage(keys: KeyView[], error?: string, success?: string, version = '1.15.0', editing?: EditingKeyView): string {
  const rows = keys.map(k => `<tr>
    <td><strong>${escapeHtml(k.name)}</strong><div class="ui-field-hint">${k.createdAt ? new Date(k.createdAt).toLocaleDateString('zh-CN') : ''}</div></td>
    <td class="ui-mono">${escapeHtml(k.keyHint || (k.key ? '*****' + k.key.slice(-4) : '*****'))}</td>
    <td><div class="ui-row">
      <a class="ui-btn ui-btn-sm" href="/admin/api-keys/edit/${encodeURIComponent(k.id)}">编辑</a>
      <form method="POST" action="/admin/api-keys/delete/${encodeURIComponent(k.id)}" onsubmit="return confirm('确定删除 ${escapeHtml(k.name)}?')"><button class="ui-btn ui-btn-sm ui-btn-danger">删除</button></form>
    </div></td>
  </tr>`)
  const form = `<form method="POST" action="${editing ? '/admin/api-keys/edit/' + encodeURIComponent(editing.id) : '/admin/api-keys'}">
    ${formField('名称', `<input class="ui-input" name="name" value="${editing ? escapeHtml(editing.name) : ''}" placeholder="例如：主网关 Key" required>`)}
    ${formField('API Key', `<input class="ui-input" name="key" placeholder="${editing ? '留空表示保持当前值' : 'sk-...'}" ${editing ? '' : 'required'}>`, editing ? `当前值：${escapeHtml(editing.keyHint)}` : '')}
    <div class="ui-row"><button class="ui-btn ui-btn-primary">${editing ? '保存修改' : '添加密钥'}</button><a class="ui-btn" href="/admin/api-keys">取消</a></div>
  </form>`
  const body = pageHeader({
    eyebrow: 'Credentials', title: 'API Key 管理', subtitle: '集中维护上游调用使用的密钥，模型配置可通过 $$名称$$ 引用。',
    actions: `<a class="ui-btn ui-btn-primary" href="/admin/api-keys">+ 新增密钥</a>`,
  }) + (error ? notice(error, 'error') : '') + (success ? notice(success, 'success') : '') +
    `<div class="ui-grid ui-grid-2">
      ${panel('密钥列表', `${keys.length} 个已存储密钥`, keys.length ? table(['名称', 'Key', '操作'], rows) : empty('暂无密钥', '添加第一个 API Key 后即可在模型配置中引用。'))}
      ${panel(editing ? '编辑密钥' : '新增密钥', '', form)}
    </div>`
  return shell({ title: 'API Key 管理', path: '/admin/api-keys', version, body })
}
