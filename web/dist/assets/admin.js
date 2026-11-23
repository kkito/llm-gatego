"use strict";
(() => {
  // web/src/api.ts
  async function api(path, opts) {
    const r = await fetch(path, opts);
    const j = await r.json();
    if (!j.ok) throw new Error(j.error?.message || "HTTP " + r.status);
    return j;
  }

  // web/src/format.ts
  function formatNumber(n) {
    return n.toLocaleString("en-US");
  }
  function formatDuration(ms) {
    if (ms < 1e3) return `${ms}ms`;
    if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
    return `${Math.floor(ms / 6e4)}m ${Math.floor(ms % 6e4 / 1e3)}s`;
  }
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // web/src/ui/shell.ts
  var userNav = [
    { href: "/user/main", label: "\u63A7\u5236\u53F0", icon: "\u25C7" },
    { href: "/user/stats", label: "\u7528\u91CF\u7EDF\u8BA1", icon: "\u25A4" }
  ];
  var adminNav = [
    { href: "/admin/models", label: "\u6A21\u578B", icon: "\u25C7" },
    { href: "/admin/model-groups", label: "\u5206\u7EC4", icon: "\u25A6" },
    { href: "/admin/api-keys", label: "\u5BC6\u94A5", icon: "\u2318" },
    { href: "/admin/users", label: "\u7528\u6237", icon: "\u25CE" },
    { href: "/admin/stats", label: "\u7EDF\u8BA1", icon: "\u25A4" },
    { href: "/admin/announcement", label: "\u516C\u544A", icon: "\u270E" },
    { href: "/admin/privacy", label: "\u9690\u79C1", icon: "\u25C8" },
    { href: "/admin/password", label: "\u5BC6\u7801", icon: "\u26BF" }
  ];
  function shell(opts) {
    const width = opts.width ?? 1180;
    const nav = opts.nav ?? adminNav;
    const links = nav.map((n) => {
      const active = opts.path === n.href || n.href !== "/admin/models" && opts.path.startsWith(n.href + "/") || n.href === "/admin/models" && opts.path.startsWith("/admin/models/");
      return `<a href="${n.href}" class="ui-nav-link${active ? " is-active" : ""}">${n.icon ? `<span class="ui-nav-icon">${n.icon}</span>` : ""}<span>${escapeHtml(n.label)}</span></a>`;
    }).join("");
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)} \xB7 LLM Gateway</title><style>${uiCSS}</style></head><body>
<header class="ui-topbar"><div class="ui-topbar-inner" style="max-width:${width}px">
  <a href="/admin/models" class="ui-brand"><span class="ui-brand-mark">L</span><span>LLM Gateway</span></a>
  <nav class="ui-nav">${links}</nav>
  <div class="ui-topbar-end"><a href="/user/main" class="ui-link">\u7528\u6237\u7AEF</a><span class="ui-version">v${escapeHtml(opts.version || "1.15.0")}</span></div>
</div></header>
<main class="ui-main" style="max-width:${width}px">${opts.body}</main>
<footer class="ui-footer" style="max-width:${width}px">LLM Gateway \xB7 Go rewrite</footer>
${opts.scripts || ""}
</body></html>`;
  }
  function pageHeader(opts) {
    return `<div class="ui-page-head"><div><div class="ui-eyebrow">${escapeHtml(opts.eyebrow || "\u63A7\u5236\u53F0")}</div><h1 class="ui-title">${escapeHtml(opts.title)}</h1>${opts.subtitle ? `<p class="ui-subtitle">${escapeHtml(opts.subtitle)}</p>` : ""}</div>${opts.actions ? `<div class="ui-actions">${opts.actions}</div>` : ""}</div>`;
  }
  function panel(title, subtitle, content = "", actions = "") {
    return `<section class="ui-panel">${title || actions ? `<div class="ui-panel-head"><div>${title ? `<h2 class="ui-panel-title">${escapeHtml(title)}</h2>` : ""}${subtitle ? `<p class="ui-panel-sub">${escapeHtml(subtitle)}</p>` : ""}</div>${actions ? `<div class="ui-panel-actions">${actions}</div>` : ""}</div>` : ""}<div class="ui-panel-body">${content}</div></section>`;
  }
  function notice(message, kind = "info") {
    return `<div class="ui-notice ui-notice-${kind}">${escapeHtml(message)}</div>`;
  }
  function empty(title, hint, action = "") {
    return `<div class="ui-empty"><div class="ui-empty-mark">\u25C7</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(hint)}</p>${action}</div>`;
  }
  function table(headers, rows) {
    return `<div class="ui-table-wrap"><table class="ui-table"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }
  function formField(label, input, hint = "") {
    return `<label class="ui-field"><span class="ui-field-label">${escapeHtml(label)}</span>${input}${hint ? `<span class="ui-field-hint">${escapeHtml(hint)}</span>` : ""}</label>`;
  }
  var uiCSS = `
:root{--ui-bg:#F6F8FB;--ui-panel:#fff;--ui-line:#E3E8EF;--ui-ink:#111827;--ui-muted:#64748B;--ui-accent:#2563EB;--ui-soft:#EFF4FF;--ui-radius:14px}
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:var(--ui-bg);color:var(--ui-ink);font:14px/1.55 Inter,"Noto Sans SC",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--ui-accent);text-decoration:none}a:hover{text-decoration:none}
.ui-topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--ui-line)}
.ui-topbar-inner{margin:0 auto;padding:0 20px;min-height:64px;display:flex;align-items:center;gap:20px}
.ui-brand{display:flex;align-items:center;gap:9px;font-weight:800;color:var(--ui-ink);font-size:15px;white-space:nowrap}
.ui-brand-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--ui-accent);color:#fff;font-size:13px}
.ui-nav{display:flex;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}.ui-nav::-webkit-scrollbar{display:none}
.ui-nav-link{display:flex;align-items:center;gap:6px;color:var(--ui-muted);padding:8px 11px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}
.ui-nav-link:hover{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-link.is-active{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-icon{font-size:12px;opacity:.8}
.ui-topbar-end{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-muted);white-space:nowrap}
.ui-version{font-family:ui-monospace,monospace;padding:2px 7px;border:1px solid var(--ui-line);border-radius:999px}
.ui-main{margin:0 auto;padding:26px 20px 60px;min-height:70vh}
.ui-footer{margin:0 auto;padding:0 20px 28px;color:var(--ui-muted);font-size:12px;text-align:center}
.ui-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--ui-line);flex-wrap:wrap}
.ui-eyebrow{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ui-accent);margin-bottom:4px}
.ui-title{font-size:25px;line-height:1.2;letter-spacing:-.02em;margin:0;font-weight:800}
.ui-subtitle{margin:5px 0 0;color:var(--ui-muted);font-size:13px}
.ui-actions{display:flex;gap:8px;flex-wrap:wrap}
.ui-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.ui-btn:hover{background:#F9FAFB;box-shadow:0 2px 8px rgba(16,24,40,.06)}
.ui-btn-primary{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}
.ui-btn-primary:hover{background:#1D4ED8}
.ui-btn-danger{color:#DC2626;border-color:#FECACA;background:#fff}
.ui-btn-sm{padding:5px 9px;min-height:30px;font-size:12px}
.ui-panel{background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03);overflow:hidden;margin-bottom:16px}
.ui-panel-head{padding:15px 18px;border-bottom:1px solid var(--ui-line);display:flex;align-items:center;justify-content:space-between;gap:12px}
.ui-panel-title{margin:0;font-size:15px;font-weight:800}
.ui-panel-sub{margin:2px 0 0;color:var(--ui-muted);font-size:12px}
.ui-panel-body{padding:18px}
.ui-grid{display:grid;gap:16px}.ui-grid-2{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}.ui-grid-auto{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.ui-notice{padding:11px 14px;border-radius:10px;margin-bottom:16px;font-size:13px;border:1px solid}
.ui-notice-error{background:#FEF2F2;border-color:#FECACA;color:#991B1B}.ui-notice-success{background:#ECFDF5;border-color:#A7F3D0;color:#065F46}.ui-notice-info{background:var(--ui-soft);border-color:#D7E3FF;color:#1E40AF}
.ui-empty{text-align:center;padding:42px 20px;border:1px dashed var(--ui-line);border-radius:var(--ui-radius);color:var(--ui-muted)}
.ui-empty-mark{font-size:24px;color:var(--ui-accent);margin-bottom:8px}.ui-empty h3{margin:0 0 4px;color:var(--ui-ink)}.ui-empty p{margin:0 0 14px}
.ui-table-wrap{overflow:auto;border:1px solid var(--ui-line);border-radius:var(--ui-radius);background:#fff}
.ui-table{width:100%;border-collapse:collapse;min-width:680px}
.ui-table th{text-align:left;padding:11px 14px;background:#F8FAFC;color:var(--ui-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--ui-line)}
.ui-table td{padding:12px 14px;border-bottom:1px solid var(--ui-line);vertical-align:middle;font-size:13px}
.ui-table tr:last-child td{border-bottom:0}.ui-table tbody tr:hover{background:#FAFCFF}
.ui-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.ui-field-label{font-size:12px;font-weight:800}.ui-field-hint{font-size:11px;color:var(--ui-muted)}
.ui-input,.ui-select,.ui-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.ui-input:focus,.ui-select:focus,.ui-textarea:focus{border-color:var(--ui-accent);box-shadow:0 0 0 3px rgba(37,99,235,.12);outline:none}
.ui-badge{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 7px;border-radius:8px;background:var(--ui-soft);color:var(--ui-accent);font-weight:800;font-size:12px}
.ui-mono{font-family:"IBM Plex Mono",ui-monospace,monospace}
.ui-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ui-spacer{flex:1}
@media(max-width:820px){.ui-topbar-inner{flex-wrap:wrap;padding:10px 14px;gap:8px}.ui-nav{order:3;width:100%;flex-basis:100%}.ui-topbar-end{margin-left:auto}.ui-main{padding:18px 14px 48px}.ui-grid-2{grid-template-columns:1fr}.ui-page-head{align-items:flex-start}.ui-btn{min-height:44px}}
`;

  // web/src/views/models.ts
  function modelsPage(models, error, version = "1.15.0") {
    const rows = models.map((m, i) => `<tr${m.hidden ? ' style="opacity:.55"' : ""}>
    <td><span class="ui-badge">${i + 1}</span></td>
    <td><strong>${escapeHtml(m.customModel)}</strong><div class="ui-field-hint ui-mono">\u2192 ${escapeHtml(m.realModel)}</div></td>
    <td>${escapeHtml(m.desc || "\u2014")}</td>
    <td><div class="ui-row">
      <button class="ui-btn ui-btn-sm" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="up" ${i === 0 ? "disabled" : ""}>\u2191</button>
      <button class="ui-btn ui-btn-sm" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="down" ${i === models.length - 1 ? "disabled" : ""}>\u2193</button>
      <button class="ui-btn ui-btn-sm" data-toggle-url="/admin/models/toggle-hidden/${encodeURIComponent(m.customModel)}">${m.hidden ? "\u663E\u793A" : "\u9690\u85CF"}</button>
      <button class="ui-btn ui-btn-sm" data-copy-url="/admin/models/copy/${encodeURIComponent(m.customModel)}">\u590D\u5236</button>
      <a class="ui-btn ui-btn-sm" href="/admin/models/edit/${encodeURIComponent(m.customModel)}">\u7F16\u8F91</a>
      <a class="ui-btn ui-btn-sm" href="/admin/models/${encodeURIComponent(m.customModel)}/limits">\u9650\u5236</a>
      <button class="ui-btn ui-btn-sm ui-btn-danger" data-delete-url="/admin/models/delete/${encodeURIComponent(m.customModel)}">\u5220\u9664</button>
    </div></td>
  </tr>`);
    const body = pageHeader({
      eyebrow: "Routing",
      title: "\u6A21\u578B\u7BA1\u7406",
      subtitle: "\u914D\u7F6E\u548C\u7BA1\u7406\u6240\u6709\u4E0A\u6E38\u6A21\u578B\u4FE1\u606F\uFF0C\u8C03\u6574\u987A\u5E8F\u53CA\u589E\u51CF\u6A21\u578B\u3002",
      actions: `<a class="ui-btn" href="/admin/model-groups">\u6A21\u578B\u5206\u7EC4</a><a class="ui-btn ui-btn-primary" href="/admin/models/new">+ \u65B0\u589E\u6A21\u578B</a>`
    }) + (error ? notice(error, "error") : "") + panel("\u6A21\u578B\u5217\u8868", `${models.length} \u4E2A\u6A21\u578B`, models.length ? table(["#", "\u6A21\u578B\u540D\u79F0", "\u63CF\u8FF0", "\u64CD\u4F5C"], rows) : empty("\u6682\u65E0\u6A21\u578B", "\u70B9\u51FB\u201C\u65B0\u589E\u6A21\u578B\u201D\u5F00\u59CB\u914D\u7F6E\u3002"));
    const script = `<script>(function(){document.querySelectorAll('button[data-delete-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-delete-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('\u786E\u5B9A\u8981\u5220\u9664\u6A21\u578B "'+n+'" \u5417\uFF1F')){var f=document.createElement('form');f.method='POST';f.action=url;document.body.appendChild(f);f.submit();}})});document.querySelectorAll('button[data-move-url]').forEach(function(btn){btn.addEventListener('click',function(){var f=document.createElement('form');f.method='POST';f.action=this.getAttribute('data-move-url')+'?direction='+this.getAttribute('data-direction');document.body.appendChild(f);f.submit();})});document.querySelectorAll('button[data-copy-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-copy-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('\u786E\u5B9A\u8981\u590D\u5236\u6A21\u578B "'+n+'" \u5417\uFF1F')){var f=document.createElement('form');f.method='POST';f.action=url;document.body.appendChild(f);f.submit();}})});document.querySelectorAll('button[data-toggle-url]').forEach(function(btn){btn.addEventListener('click',function(){var f=document.createElement('form');f.method='POST';f.action=this.getAttribute('data-toggle-url');document.body.appendChild(f);f.submit();})})})();<\/script>`;
    return shell({ title: "\u6A21\u578B\u7BA1\u7406", path: "/admin/models", version, body, scripts: script });
  }

  // web/src/views/groups.ts
  function groupsPage(groups, error, success, version = "1.15.0") {
    const cards = groups.map((g) => `<article class="ui-panel" style="margin:0">
    <div class="ui-panel-head"><div><h3 class="ui-panel-title">${escapeHtml(g.name)}</h3><p class="ui-panel-sub">${g.models.length} \u4E2A\u6A21\u578B</p></div><a class="ui-btn ui-btn-sm" href="/admin/model-groups/edit/${encodeURIComponent(g.name)}">\u7BA1\u7406\u6A21\u578B</a></div>
    <div class="ui-panel-body"><p class="ui-field-hint">${escapeHtml(g.desc || "\u2014")}</p><div class="ui-row" style="margin:10px 0 14px">${g.models.slice(0, 5).map((m) => `<a class="ui-badge" href="/admin/models/edit/${encodeURIComponent(m)}">${escapeHtml(m)}</a>`).join("")}${g.models.length > 5 ? `<span class="ui-field-hint">+${g.models.length - 5}</span>` : ""}</div>
    <form method="POST" action="/admin/model-groups/delete/${encodeURIComponent(g.name)}"><button class="ui-btn ui-btn-sm ui-btn-danger">\u5220\u9664\u5206\u7EC4</button></form></div></article>`).join("");
    const body = pageHeader({ eyebrow: "Routing", title: "\u6A21\u578B\u5206\u7EC4", subtitle: "\u7BA1\u7406\u6A21\u578B\u5206\u7EC4\u914D\u7F6E", actions: `<a class="ui-btn" href="/admin/models">\u8FD4\u56DE\u6A21\u578B</a><a class="ui-btn ui-btn-primary" href="/admin/model-groups/new">+ \u65B0\u5EFA\u5206\u7EC4</a>` }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + (groups.length ? `<div class="ui-grid ui-grid-auto">${cards}</div>` : panel("\u5206\u7EC4\u5217\u8868", "", empty("\u6682\u65E0\u5206\u7EC4", "\u521B\u5EFA\u5206\u7EC4\u540E\u53EF\u914D\u7F6E\u6A21\u578B\u56DE\u9000\u987A\u5E8F\u3002")));
    return shell({ title: "\u6A21\u578B\u5206\u7EC4", path: "/admin/model-groups", version, body });
  }

  // web/src/views/users.ts
  function usersPage(users, enabled = true, error, version = "1.15.0") {
    const cards = users.map((u) => `<article class="ui-panel" style="margin:0">
    <div class="ui-panel-head"><div><h3 class="ui-panel-title">${escapeHtml(u.name)}</h3><p class="ui-panel-sub">${escapeHtml(u.desc || "\u2014")}</p></div><a class="ui-btn ui-btn-sm" href="/admin/users/edit/${encodeURIComponent(u.name)}">\u7F16\u8F91</a></div>
    <div class="ui-panel-body">
      <div class="ui-field-hint ui-mono" style="margin-bottom:10px">${escapeHtml(u.apikey.slice(0, 8))}\u2026</div>
      <div class="ui-row">${!u.allowedModels || u.allowedModels.length === 0 ? '<span class="ui-badge">\u6240\u6709\u6A21\u578B</span>' : u.allowedModels.slice(0, 3).map((m) => `<span class="ui-badge">${escapeHtml(m)}</span>`).join("")}${(u.allowedModels?.length || 0) > 3 ? `<span class="ui-field-hint">\u7B49${u.allowedModels.length - 3}\u4E2A\u6A21\u578B</span>` : ""}</div>
      <div class="ui-row" style="margin-top:14px"><form method="POST" action="/api/admin/users/delete/${encodeURIComponent(u.name)}"><button class="ui-btn ui-btn-sm ui-btn-danger">\u5220\u9664</button></form></div>
    </div></article>`).join("");
    const toggle = `<form method="post" action="/api/admin/users/toggle"><input type="hidden" name="enabled" value="${enabled ? "false" : "true"}"><button class="ui-btn">${enabled ? "\u7981\u7528\u7528\u6237\u8BA4\u8BC1" : "\u542F\u7528\u7528\u6237\u8BA4\u8BC1"}</button></form>`;
    const body = pageHeader({ eyebrow: "Access", title: "\u7528\u6237\u7BA1\u7406", subtitle: "\u7BA1\u7406\u8BBF\u95EE API \u7684\u7528\u6237\u548C\u5BC6\u94A5", actions: `<a class="ui-btn ui-btn-primary" href="/admin/users/new">+ \u65B0\u589E\u7528\u6237</a>${toggle}` }) + (error ? notice(error, "error") : "") + (users.length ? `<div class="ui-grid ui-grid-auto">${cards}</div>` : panel("\u7528\u6237\u5217\u8868", "", empty("\u6682\u65E0\u7528\u6237", "\u6DFB\u52A0\u7528\u6237\u540E\u5373\u53EF\u6309\u5BC6\u94A5\u9650\u5236\u8BBF\u95EE\u3002")));
    return shell({ title: "\u7528\u6237\u7BA1\u7406", path: "/admin/users", version, body });
  }

  // web/src/views/apiKeys.ts
  function apiKeysPage(keys, error, success, version = "1.15.0", editing) {
    const rows = keys.map((k) => `<tr>
    <td><strong>${escapeHtml(k.name)}</strong><div class="ui-field-hint">${k.createdAt ? new Date(k.createdAt).toLocaleDateString("zh-CN") : ""}</div></td>
    <td class="ui-mono">${escapeHtml(k.keyHint || (k.key ? "*****" + k.key.slice(-4) : "*****"))}</td>
    <td><div class="ui-row">
      <a class="ui-btn ui-btn-sm" href="/admin/api-keys/edit/${encodeURIComponent(k.id)}">\u7F16\u8F91</a>
      <form method="POST" action="/admin/api-keys/delete/${encodeURIComponent(k.id)}" onsubmit="return confirm('\u786E\u5B9A\u5220\u9664 ${escapeHtml(k.name)}?')"><button class="ui-btn ui-btn-sm ui-btn-danger">\u5220\u9664</button></form>
    </div></td>
  </tr>`);
    const form = `<form method="POST" action="${editing ? "/admin/api-keys/edit/" + encodeURIComponent(editing.id) : "/admin/api-keys"}">
    ${formField("\u540D\u79F0", `<input class="ui-input" name="name" value="${editing ? escapeHtml(editing.name) : ""}" placeholder="\u4F8B\u5982\uFF1A\u4E3B\u7F51\u5173 Key" required>`)}
    ${formField("API Key", `<input class="ui-input" name="key" placeholder="${editing ? "\u7559\u7A7A\u8868\u793A\u4FDD\u6301\u5F53\u524D\u503C" : "sk-..."}" ${editing ? "" : "required"}>`, editing ? `\u5F53\u524D\u503C\uFF1A${escapeHtml(editing.keyHint)}` : "")}
    <div class="ui-row"><button class="ui-btn ui-btn-primary">${editing ? "\u4FDD\u5B58\u4FEE\u6539" : "\u6DFB\u52A0\u5BC6\u94A5"}</button><a class="ui-btn" href="/admin/api-keys">\u53D6\u6D88</a></div>
  </form>`;
    const body = pageHeader({
      eyebrow: "Credentials",
      title: "API Key \u7BA1\u7406",
      subtitle: "\u96C6\u4E2D\u7EF4\u62A4\u4E0A\u6E38\u8C03\u7528\u4F7F\u7528\u7684\u5BC6\u94A5\uFF0C\u6A21\u578B\u914D\u7F6E\u53EF\u901A\u8FC7 $$\u540D\u79F0$$ \u5F15\u7528\u3002",
      actions: `<a class="ui-btn ui-btn-primary" href="/admin/api-keys">+ \u65B0\u589E\u5BC6\u94A5</a>`
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + `<div class="ui-grid ui-grid-2">
      ${panel("\u5BC6\u94A5\u5217\u8868", `${keys.length} \u4E2A\u5DF2\u5B58\u50A8\u5BC6\u94A5`, keys.length ? table(["\u540D\u79F0", "Key", "\u64CD\u4F5C"], rows) : empty("\u6682\u65E0\u5BC6\u94A5", "\u6DFB\u52A0\u7B2C\u4E00\u4E2A API Key \u540E\u5373\u53EF\u5728\u6A21\u578B\u914D\u7F6E\u4E2D\u5F15\u7528\u3002"))}
      ${panel(editing ? "\u7F16\u8F91\u5BC6\u94A5" : "\u65B0\u589E\u5BC6\u94A5", "", form)}
    </div>`;
    return shell({ title: "API Key \u7BA1\u7406", path: "/admin/api-keys", version, body });
  }

  // web/src/styles/admin_password.ts
  var css = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .btn-danger {\n            background: #fef2f2;\n            color: #ef4444;\n            border: 1px solid #fecaca;\n          }\n\n          .btn-danger:hover {\n            background: #ef4444;\n            color: #fff;\n          }\n\n          .alert {\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          .alert-error {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n          }\n\n          .alert-success {\n            background: #f0fdf4;\n            border: 1px solid #bbf7d0;\n            color: #166534;\n          }\n\n          .alert-warning {\n            background: #fffbeb;\n            border: 1px solid #fde68a;\n            color: #92400e;\n          }\n\n          .alert-info {\n            background: #eff6ff;\n            border: 1px solid #bfdbfe;\n            color: #1e40af;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n          }\n        `}";

  // web/src/styles/console.ts
  var consoleCSS = `
:root{
  --gw-bg:#F5F7FA; --gw-card:#FFFFFF; --gw-line:#E4E7EC;
  --gw-ink:#101828; --gw-muted:#667085; --gw-accent:#2563EB;
  --gw-soft:#EFF4FF; --gw-success:#059669; --gw-warn:#D97706; --gw-danger:#DC2626;
  color-scheme:light;
}
html,body{margin:0;padding:0;background:var(--gw-bg)!important;color:var(--gw-ink)!important}
body{font-family:Inter,"Noto Sans SC",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.55}
*{box-sizing:border-box}
a{color:var(--gw-accent);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--gw-accent);outline-offset:2px}
button,a.btn,input,select,textarea{font-family:inherit}

.topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94)!important;backdrop-filter:blur(12px);border-bottom:1px solid var(--gw-line)!important}
.topbar-inner{max-width:1180px!important;margin:0 auto!important;min-height:60px;height:auto!important;padding:10px 20px!important;display:flex;align-items:center;justify-content:space-between;gap:16px}
.topbar-brand{font-family:Inter,"Noto Sans SC",system-ui,sans-serif!important;font-weight:800!important;font-size:1.05rem!important;letter-spacing:-.01em!important;color:var(--gw-ink)!important;background:none!important;-webkit-text-fill-color:var(--gw-ink)!important;display:flex;align-items:center;gap:9px;white-space:nowrap}
.topbar-brand::before{content:"\u25C6";color:var(--gw-accent);font-size:.9rem}
.topbar-nav{display:flex;gap:3px;list-style:none;margin:0;padding:0;overflow-x:auto;scrollbar-width:none}
.topbar-nav::-webkit-scrollbar{display:none}
.topbar-nav a{font-size:.82rem!important;font-weight:600!important;color:var(--gw-muted)!important;padding:7px 11px!important;border-radius:8px;white-space:nowrap;background:transparent!important;border:1px solid transparent!important}
.topbar-nav a:hover{background:var(--gw-soft)!important;color:var(--gw-accent)!important;text-decoration:none}
.topbar-nav a.active{background:var(--gw-soft)!important;color:var(--gw-accent)!important;border-color:#D7E3FF!important}

.main-content,.page{max-width:1180px!important;margin:0 auto!important;padding:28px 20px 56px!important}
.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--gw-line);flex-wrap:wrap}
.page-title,.stats-page-title{margin:0;font-size:1.55rem;font-weight:800;letter-spacing:-.02em;color:var(--gw-ink)!important}
.page-subtitle,.stats-page-subtitle{margin:4px 0 0;color:var(--gw-muted)!important;font-size:.88rem}
.btn-group{display:flex;gap:8px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 14px;border-radius:9px;border:1px solid var(--gw-line);background:#fff;color:var(--gw-ink);font-weight:600;font-size:.84rem;cursor:pointer;min-height:38px;line-height:1.2;text-decoration:none}
.btn:hover{background:#F9FAFB;text-decoration:none;box-shadow:0 2px 8px rgba(16,24,40,.06);transform:translateY(-1px)}
.btn-primary{background:var(--gw-accent)!important;border-color:var(--gw-accent)!important;color:#fff!important}
.btn-primary:hover{background:#1D4ED8!important}
.btn-secondary{background:#fff!important;color:var(--gw-ink)!important}
.btn-danger{background:#fff!important;border-color:#FECACA!important;color:var(--gw-danger)!important}
.btn-sm,.btn-small{padding:5px 9px!important;min-height:30px!important;font-size:.78rem!important}
.btn-icon{width:34px;padding:0!important}

.card,.form-card,.section-card,.stats-section-card,.request-list-card,.overview-card,.group-card,.user-card,.key-card,.token-card,.limits-card,.models-list,.model-item,.available-model-item,.selected-model-item{transition:box-shadow .15s ease,transform .15s ease}
  background:var(--gw-card)!important;border:1px solid var(--gw-line)!important;border-radius:12px!important;
  box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03)!important;
}
.card-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--gw-line)}
.card-icon,.group-icon,.key-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;background:var(--gw-soft);color:var(--gw-accent)}
.section-title,.stats-section-title,.limits-title,.keys-section-title{margin:0 0 12px;font-size:1rem;font-weight:700;color:var(--gw-ink)!important}
.form-title{margin:0 0 16px;font-size:1.15rem;font-weight:700}

.overview-grid,.token-grid,.stat-mini-cards,.users-grid,.groups-grid,.keys-list,.models-list{display:grid;gap:14px}
.overview-grid,.token-grid,.stat-mini-cards{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.users-grid,.groups-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.overview-card,.token-card,.stat-mini-card{padding:16px 18px;position:relative;overflow:hidden}
.overview-card::before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--gw-accent);opacity:.85}
.overview-card--green::before{background:var(--gw-success)}
.overview-card--orange::before{background:var(--gw-warn)}
.overview-card--red::before{background:var(--gw-danger)}
.overview-card--purple::before{background:#7C3AED}
.overview-card-label,.token-item-label,.stat-mini-name{margin:0;color:var(--gw-muted);font-size:.78rem;font-weight:600}
.overview-card-value,.token-item-value,.stat-mini-requests,.stat-mini-tokens{display:block;margin-top:4px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:1.45rem;font-weight:700;color:var(--gw-ink)}
.overview-card-sub{margin:2px 0 0;color:var(--gw-muted);font-size:.75rem}

.two-col,.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.form-label{font-size:.8rem;font-weight:700;color:var(--gw-ink)}
.form-input,.form-select,.form-textarea,input,select,textarea{background:#fff!important;border:1px solid #D0D5DD!important;border-radius:8px!important;color:var(--gw-ink)!important;padding:9px 11px!important;min-height:38px;font-size:.86rem}
input:focus,select:focus,textarea:focus{border-color:var(--gw-accent)!important;box-shadow:0 0 0 3px rgba(37,99,235,.12)!important;outline:none}
.form-hint{color:var(--gw-muted);font-size:.76rem}
.form-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}

.filter-bar,.filter-form,.filter-group,.filter-shortcuts{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.filter-form{margin-bottom:16px}
.filter-current{color:var(--gw-muted);font-size:.8rem}

.models-table-wrapper,.stats-table-wrapper{background:#fff;border:1px solid var(--gw-line);border-radius:14px;overflow:auto;box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03)}
table{border-collapse:collapse;width:100%}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--gw-line);font-size:.84rem;white-space:nowrap}
th{background:#F8FAFC;color:var(--gw-muted);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;position:sticky;top:0;z-index:1}
tr:last-child td{border-bottom:0}
tbody tr:hover{background:#FAFBFF}
.model-tag{display:inline-block;padding:2px 8px;border:1px solid var(--gw-line);border-radius:999px;background:#F9FAFB;color:var(--gw-muted);font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.72rem;margin:2px 4px 2px 0}
.index-badge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;background:var(--gw-soft);color:var(--gw-accent);font-weight:700;font-size:.75rem}
.hidden,.is-hidden{opacity:.55}
.pagination{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
.pagination-info{color:var(--gw-muted);font-size:.8rem;margin-right:auto}

.alert,.error-banner,.success-banner,.announcement-banner{padding:11px 14px;border-radius:9px;margin-bottom:14px;font-size:.85rem}
.error-banner,.alert-error{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B}
.success-banner,.alert-success{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46}
.alert-warning,.announcement-banner{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E}
.alert-info{background:var(--gw-soft);border:1px solid #D7E3FF;color:#1E40AF}

.empty-state{background:#fff;border:1px dashed #D0D5DD;border-radius:12px;padding:36px 20px;text-align:center;color:var(--gw-muted)}
.empty-state-icon{font-size:1.8rem;margin-bottom:8px}
.empty-state h3{margin:0 0 6px;color:var(--gw-ink)}

.heatmap-scroll{overflow-x:auto}
.heatmap-grid{display:flex;gap:2px;min-width:660px}
.heatmap-col{display:flex;flex-direction:column;gap:2px}
.heatmap-cell{width:10px;height:10px;border-radius:2px;background:#DBEAFE}
.heatmap-legend{display:flex;gap:6px;align-items:center;color:var(--gw-muted);font-size:.72rem;margin-top:8px}

.navbar{max-width:1180px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
.navbar-brand{font-weight:800;color:var(--gw-ink);font-size:1.05rem}
.navbar-menu{display:flex;gap:10px}
.navbar-link{font-weight:600;font-size:.85rem}
.container{max-width:1180px;margin:0 auto;padding:24px 20px 56px}
.hero{background:linear-gradient(135deg,#EFF4FF,#F5F7FA);border:1px solid var(--gw-line);border-radius:14px;padding:28px;margin-bottom:20px}
.hero h1{margin:0 0 6px;font-size:1.7rem;color:var(--gw-ink)}
.hero-subtitle{margin:0;color:var(--gw-muted)}
.toggle-option{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--gw-line);border-radius:10px;background:#fff;margin-bottom:8px}
.input-wrapper{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.input-value{font-family:"IBM Plex Mono",ui-monospace,monospace;background:#F9FAFB;border:1px solid var(--gw-line);border-radius:8px;padding:10px;word-break:break-all}
.model-count{color:var(--gw-muted);font-size:.8rem}

.login-card{background:#fff!important;border:1px solid var(--gw-line)!important;border-radius:14px!important;box-shadow:0 20px 50px rgba(16,24,40,.1)!important;margin:8vh auto!important;padding:30px!important;max-width:420px!important;width:calc(100% - 28px)!important}
.login-title{color:var(--gw-ink)!important;font-weight:800;text-align:center;margin-bottom:18px}

@media (max-width:768px){
  .topbar{position:relative}
  .topbar-inner{flex-direction:column;align-items:stretch;gap:8px;padding:10px 14px!important}
  .topbar-nav{width:100%;padding-bottom:2px}
  .topbar-nav a{padding:9px 12px!important}
  .main-content,.page,.container{padding:18px 14px 44px!important}
  .navbar{padding:12px 14px}
  .hero{padding:22px 16px}
  .page-header{align-items:flex-start}
  .two-col,.form-grid{grid-template-columns:1fr}
  .overview-grid,.token-grid,.stat-mini-cards{grid-template-columns:repeat(2,minmax(0,1fr))}
  .users-grid,.groups-grid{grid-template-columns:1fr}
  .btn,.btn-primary,.btn-secondary,.btn-danger{min-height:44px}
  th,td{padding:9px 10px!important}
  .models-table-wrapper,.stats-table-wrapper{margin:0 -14px;border-radius:0;border-left:0;border-right:0}
}
@media (max-width:420px){
  .overview-grid,.token-grid,.stat-mini-cards{grid-template-columns:1fr}
  .login-card{margin:4vh auto!important;padding:24px 18px!important}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
`;

  // web/src/styles/console_pages.ts
  var pageCSS = `
/* \u6A21\u578B\u7BA1\u7406 */
.models-table .model-name-cell{display:flex;flex-direction:column;gap:2px}
.models-table .model-custom-name{font-weight:700;color:var(--gw-ink)}
.models-table .model-real-name{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.72rem;color:var(--gw-muted)}
.models-table .model-desc-cell{max-width:240px;white-space:normal;color:var(--gw-muted)}
.actions-cell{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.order-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--gw-line);background:#fff;color:var(--gw-muted);cursor:pointer;font-weight:700}
.order-btn:hover:not(:disabled){border-color:var(--gw-accent);color:var(--gw-accent)}
.order-btn:disabled{opacity:.35;cursor:not-allowed}
.model-count{margin:0 0 12px;color:var(--gw-muted);font-size:.82rem}

/* \u7528\u6237\u7BA1\u7406 */
.user-card{padding:16px 18px}
.user-card-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.user-avatar{width:40px;height:40px;border-radius:10px;background:var(--gw-soft);color:var(--gw-accent);display:flex;align-items:center;justify-content:center;font-weight:800}
.user-name{margin:0;font-size:.98rem;font-weight:700}
.user-desc{margin:0;color:var(--gw-muted);font-size:.78rem}
.user-apikey-row{display:flex;align-items:center;gap:8px;padding:9px 10px;background:#F9FAFB;border:1px solid var(--gw-line);border-radius:8px;margin:8px 0}
.user-apikey-label{color:var(--gw-muted);font-size:.72rem}
.user-apikey-value{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.78rem;word-break:break-all}
.user-card-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.user-info{font-size:.8rem;color:var(--gw-muted)}

/* API Keys */
.two-col:has(.keys-section){grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}
.key-card{padding:16px 18px;border-left:3px solid var(--gw-accent)!important}
.key-header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.key-name{display:flex;align-items:center;gap:8px;font-weight:700}
.key-value{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.78rem;background:#F9FAFB;border:1px solid var(--gw-line);border-radius:7px;padding:8px 10px;word-break:break-all}
.key-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.key-date{color:var(--gw-muted);font-size:.74rem}
.apikey-note,.form-hint{color:var(--gw-muted);font-size:.78rem}

/* \u6A21\u578B\u7EC4 */
.group-card{padding:16px 18px}
.group-card-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.group-name{margin:0;font-size:.98rem;font-weight:700}
.group-models-count{color:var(--gw-muted);font-size:.75rem}
.group-desc{color:var(--gw-muted);font-size:.8rem;min-height:20px}
.group-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.model-selector{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.model-list-title{font-weight:700;font-size:.82rem;margin:0 0 8px}
.model-list{border:1px solid var(--gw-line);border-radius:9px;min-height:180px;max-height:320px;overflow:auto;padding:6px}
.model-item,.available-model-item,.selected-model-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:0;border-bottom:1px solid var(--gw-line);border-radius:0;box-shadow:none!important;background:transparent!important;font-size:.82rem}
.model-item:hover,.available-model-item:hover{background:#F9FAFB!important}
.model-item-name{font-weight:600}
.model-item-desc{color:var(--gw-muted);font-size:.72rem}
.selected{background:var(--gw-soft)!important}
.model-list-empty{padding:16px;text-align:center;color:var(--gw-muted);font-size:.8rem}
.model-filter-input{width:100%;margin-bottom:8px}

/* \u8868\u5355\u9875 */
.form-card{padding:20px 22px}
.form-card>.form-group,.form-card>.form-title{margin-left:0}
.form-card .btn-submit{min-width:120px}
.test-details{margin-top:16px;border:1px solid var(--gw-line);border-radius:10px;background:#fff}
.test-details summary{padding:12px 14px;cursor:pointer;font-weight:700;color:var(--gw-ink)}
.test-details[open] summary{border-bottom:1px solid var(--gw-line)}
.test-details>div{padding:14px}
.preview-content{background:#F9FAFB;border:1px solid var(--gw-line);border-radius:8px;padding:10px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.76rem;white-space:pre-wrap;word-break:break-all;max-height:220px;overflow:auto}

/* \u9650\u5236 */
.limits-card{padding:16px 18px}
.limits-subtitle{margin:0 0 12px;color:var(--gw-muted);font-size:.82rem}
.limits-table td,.limits-table th{vertical-align:middle}

/* \u7EDF\u8BA1 */
.overview-card--blue::before{background:#2563EB}
.stats-section-card,.request-list-card{padding:16px 18px;margin-bottom:16px}
.mini-bar-track{height:6px;background:#E9EEF7;border-radius:999px;overflow:hidden}
.mini-bar-fill{height:100%;background:var(--gw-accent);border-radius:999px}
.stat-mini-card{padding:12px 14px}
.filter-shortcuts .btn{padding:5px 10px;font-size:.76rem}

/* \u516C\u544A/\u5BC6\u7801/\u9690\u79C1 */
.whitelist-info,.toggle-row{background:#F9FAFB;border:1px solid var(--gw-line);border-radius:9px;padding:12px 14px;margin-bottom:10px}
.toggle-label{font-weight:700}
.toggle-desc{color:var(--gw-muted);font-size:.78rem}
.checkbox-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
.checkbox-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--gw-line);border-radius:8px;background:#fff}
.checkbox-label{font-size:.82rem}
.check-icon{color:var(--gw-success)}

@media (max-width:768px){
  .actions-cell{justify-content:flex-end}
  .model-selector{grid-template-columns:1fr}
  .form-card{padding:16px}
  .user-actions,.group-card-actions{justify-content:flex-start}
}
`;

  // web/src/views/layout.ts
  var MENU = [
    { href: "/admin/models", label: "\u6A21\u578B" },
    { href: "/admin/users", label: "\u7528\u6237" },
    { href: "/admin/api-keys", label: "API Keys" },
    { href: "/admin/model-groups", label: "\u6A21\u578B\u7EC4" },
    { href: "/admin/stats", label: "\u7EDF\u8BA1" },
    { href: "/admin/announcement", label: "\u516C\u544A\u7BA1\u7406" },
    { href: "/admin/password", label: "\u5BC6\u7801\u8BBE\u7F6E" },
    { href: "/admin/privacy", label: "\u9690\u79C1\u4FDD\u62A4" }
  ];
  function topbar(activePath) {
    return `<nav class="topbar"><div class="topbar-inner"><a href="/admin/models" class="topbar-brand">LLM Gateway</a><ul class="topbar-nav">${MENU.map((m) => `<li><a href="${m.href}" class="${activePath === m.href ? "active" : ""}">${m.label}</a></li>`).join("")}</ul></div></nav>`;
  }
  function adminPage(title, activePath, body, extraStyle, version = "1.15.0", script = "") {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)} - LLM Gateway</title><style>${extraStyle}</style><style>${consoleCSS}</style><style>${pageCSS}</style></head><body>${topbar(activePath)}<main class="main-content" style="padding: 2.5rem 2rem 4rem; max-width: 1280px; margin: 0 auto; animation: fadeUp 0.6s ease-out both;">${body}<div style="text-align:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border-color);font-size:0.75rem;color:var(--text-secondary)">v${version}</div></main>${script}</body></html>`;
  }

  // web/src/views/password.ts
  function passwordPage(hasPassword, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u5BC6\u7801\u8BBE\u7F6E</h1><p class="page-subtitle">\u8BBE\u7F6E\u6216\u4FEE\u6539\u7BA1\u7406\u540E\u53F0\u767B\u5F55\u5BC6\u7801</p></div></div>
${error ? `<div class="error-banner">${error}</div>` : ""}${success ? `<div class="success-banner">${success}</div>` : ""}
<div class="form-card"><form method="POST" action="/api/admin/password">${hasPassword ? '<div class="form-group"><label class="form-label" for="currentPassword">\u5F53\u524D\u5BC6\u7801</label><input class="form-input" type="password" id="currentPassword" name="currentPassword"></div>' : ""}<div class="form-group"><label class="form-label" for="newPassword">\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="newPassword" name="newPassword"></div><div class="form-group"><label class="form-label" for="confirmPassword">\u786E\u8BA4\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="confirmPassword" name="confirmPassword"></div><div class="form-actions"><button class="btn btn-primary" name="action" value="change">\u4FDD\u5B58\u5BC6\u7801</button>${hasPassword ? '<button class="btn btn-danger" name="action" value="delete">\u5220\u9664\u5BC6\u7801</button>' : ""}</div></form></div><script>document.querySelector('form').addEventListener('submit',async function(e){e.preventDefault();var f=e.target;var a=document.activeElement&&document.activeElement.value||'change';var body={action:a,currentPassword:f.currentPassword?f.currentPassword.value:'',newPassword:f.newPassword.value,confirmPassword:f.confirmPassword.value};var r=await fetch('/api/admin/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});var j=await r.json();if(j.ok){location.reload()}else{alert(j.error&&j.error.message||'\u64CD\u4F5C\u5931\u8D25')}})<\/script>`;
    return adminPage("\u5BC6\u7801\u8BBE\u7F6E", "/admin/password", body, css, version);
  }

  // web/src/styles/admin_privacy_settings.ts
  var css2 = '{`\n          :root { --bg-page: #f8f9fb; --bg-card: #ffffff; --text-primary: #1a1d26; --text-secondary: #646a7e; --accent-color: hsl(245 80% 58%); --border-color: #e5e7eb; }\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n          body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg-page); color: var(--text-primary); line-height: 1.6; }\n          .card { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 1rem; }\n          .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); }\n          .toggle-row:last-child { border-bottom: none; }\n          .toggle-label { font-weight: 500; }\n          .toggle-desc { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; }\n          .toggle-row input[type="checkbox"] { width: 1.25rem; height: 1.25rem; }\n          .toggle-row input[type="text"] { width: 12rem; padding: 0.35rem 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; }\n          .btn { display: inline-block; padding: 0.6rem 1.5rem; background: var(--accent-color); color: #fff; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }\n          .error-banner { background: #fef2f2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .success-banner { background: #f0fdf4; color: #166534; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .whitelist-info { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; }\n        `}';

  // web/src/views/privacy.ts
  function privacyPage(s, detailLogEnabled = false, cliDebug = false, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u9690\u79C1\u4FDD\u62A4</h1><p class="page-subtitle">\u63A7\u5236\u65E5\u5FD7\u4E2D\u7684\u654F\u611F\u4FE1\u606F\u5904\u7406</p></div></div>
${error ? `<div class="error-banner">${error}</div>` : ""}${success ? `<div class="success-banner">${success}</div>` : ""}
<div class="form-card"><form id="privacy-form">${[["enabled", "\u542F\u7528\u9690\u79C1\u4FDD\u62A4"], ["stripUserField", "\u62B9\u6389 user \u5B57\u6BB5"], ["sanitizeFilePaths", "\u6587\u4EF6\u8DEF\u5F84\u7528\u6237\u540D\u66FF\u6362"], ["whitelistFilter", "\u767D\u540D\u5355\u5B57\u6BB5\u8FC7\u6EE4"]].map(([k, label]) => `<div class="form-group"><label><input type="checkbox" name="${k}" ${s[k] ? "checked" : ""}> ${label}</label></div>`).join("")}<div class="form-group"><label class="form-label" for="pathPlaceholder">\u8DEF\u5F84\u5360\u4F4D\u7B26</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value="${s.pathPlaceholder || "USER"}"></div><div class="form-group"><label>\u65E5\u5FD7\u8BB0\u5F55</label><label><input type="checkbox" name="detailLogEnabled" ${detailLogEnabled ? "checked" : ""} ${cliDebug ? "disabled" : ""}> \u8BB0\u5F55\u5B8C\u6574\u8BF7\u6C42/\u54CD\u5E94\u65E5\u5FD7</label>${cliDebug ? "<p>\u547D\u4EE4\u884C\u542F\u52A8\u65F6\u4F7F\u7528\u4E86 --debug\uFF0C\u65E5\u5FD7\u8BB0\u5F55\u8BBE\u7F6E\u4E0D\u53EF\u4FEE\u6539</p>" : ""}</div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u8BBE\u7F6E</button></div></form></div>`;
    return adminPage("\u9690\u79C1\u4FDD\u62A4", "/admin/privacy", body, css2, version);
  }

  // web/src/styles/admin_announcement.ts
  var css3 = "{`\n          :root { --bg-page: #f8f9fb; --bg-card: #ffffff; --text-primary: #1a1d26; --text-secondary: #646a7e; --accent-color: hsl(245 80% 58%); --border-color: #e5e7eb; }\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n          body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg-page); color: var(--text-primary); line-height: 1.6; }\n          .card { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 1rem; }\n          .form-group { margin-bottom: 1rem; }\n          .form-group label { display: block; font-weight: 600; margin-bottom: 0.4rem; }\n          .form-group textarea { width: 100%; min-height: 220px; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; font-family: 'SF Mono', 'Monaco', monospace; font-size: 0.85rem; line-height: 1.5; resize: vertical; }\n          .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; }\n          .checkbox-label input[type=\"checkbox\"] { width: 1.25rem; height: 1.25rem; }\n          .btn { display: inline-block; padding: 0.6rem 1.5rem; background: var(--accent-color); color: #fff; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }\n          .error-banner { background: #fef2f2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .success-banner { background: #f0fdf4; color: #166534; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .preview-section { margin-top: 1rem; }\n          .preview-section h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-secondary); }\n          .preview-content { background: var(--bg-page); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; min-height: 60px; }\n          .preview-content h1, .preview-content h2, .preview-content h3 { margin-top: 0; }\n          .preview-content p { margin-bottom: 0.5rem; }\n          .preview-content code { background: rgba(0,0,0,0.05); padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.85rem; }\n          .preview-content pre { background: rgba(0,0,0,0.05); padding: 0.75rem; border-radius: 8px; overflow-x: auto; }\n          .preview-content pre code { background: none; padding: 0; }\n          .form-hint { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; }\n        `}";

  // web/src/views/announcement.ts
  function announcementPage(content, enabled = true, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u516C\u544A\u7BA1\u7406</h1><p class="page-subtitle">\u8BBE\u7F6E\u7528\u6237\u9875\u9762\u663E\u793A\u7684\u516C\u544A\uFF08\u652F\u6301 Markdown\uFF09</p></div></div>
${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ""}${success ? `<div class="success-banner">${escapeHtml(success)}</div>` : ""}
<div class="form-card"><form method="POST" action="/api/admin/announcement"><div class="form-group"><label class="form-label" for="content">\u516C\u544A\u5185\u5BB9</label><textarea class="form-textarea" id="content" name="content" rows="12">${escapeHtml(content)}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ${enabled ? "checked" : ""}> \u542F\u7528\u516C\u544A</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u516C\u544A</button></div></form></div>`;
    return adminPage("\u516C\u544A\u7BA1\u7406", "/admin/announcement", body, css3, version);
  }

  // web/src/styles/admin_model_form.ts
  var css4 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input,\n          .form-select,\n          .form-textarea {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus,\n          .form-select:focus,\n          .form-textarea:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-hint {\n            display: block;\n            font-size: 0.78rem;\n            color: var(--text-secondary);\n            margin-top: 0.35rem;\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .error-banner {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          .limits-section {\n            margin-top: 2rem;\n            padding-top: 1.5rem;\n            border-top: 1px solid var(--border-color);\n          }\n\n          .limits-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.25rem;\n            margin-bottom: 1rem;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n          }\n        `}";

  // web/src/views/jsonEditor.ts
  function jsonEditor(name, value = "") {
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const id = `je-${sanitized}-${Math.random().toString(36).slice(2, 8)}`;
    return `<div style="display:flex;gap:1rem;margin-bottom:0.5rem"><div style="flex:1"><textarea id="${id}-input" style="width:100%;min-height:180px;padding:0.75rem;font-family:monospace;font-size:0.85rem;border:1.5px solid var(--border-color);border-radius:8px;resize:vertical;background:var(--bg-page)" placeholder='{"temperature": 0.7, "max_tokens": 4096}' oninput="jsonEditorValidate('${id}')">${escapeHtml(value)}</textarea><div style="display:flex;gap:0.5rem;margin-top:0.5rem"><button type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;cursor:pointer" onclick="jsonEditorFormat('${id}')">\u683C\u5F0F\u5316</button><button type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;cursor:pointer" onclick="jsonEditorClear('${id}')">\u6E05\u7A7A</button></div></div><div style="flex:1"><pre id="${id}-preview" style="min-height:180px;padding:0.75rem;font-family:monospace;font-size:0.85rem;border:1.5px solid var(--border-color);border-radius:8px;background:#dcfce7;overflow:auto" data-valid="true">${escapeHtml(value ? JSON.stringify(JSON.parse(value || "{}"), null, 2) : "\u7B49\u5F85\u8F93\u5165...")}</pre></div></div><input type="hidden" id="${id}-hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}"><script>window.jsonEditorValidate=function(id){var t=document.getElementById(id+'-input'),p=document.getElementById(id+'-preview'),h=document.getElementById(id+'-hidden');try{var o=JSON.parse(t.value),f=JSON.stringify(o,null,2);p.textContent=f;p.setAttribute('data-valid','true');p.style.background='#dcfce7';h.value=f}catch(e){p.textContent='JSON \u683C\u5F0F\u9519\u8BEF\uFF1A'+e.message;p.setAttribute('data-valid','false');p.style.background='#fef2f2';h.value=t.value}};window.jsonEditorFormat=function(id){var t=document.getElementById(id+'-input');try{t.value=JSON.stringify(JSON.parse(t.value),null,2);window.jsonEditorValidate(id)}catch(e){alert('JSON \u683C\u5F0F\u9519\u8BEF\uFF1A'+e.message)}};window.jsonEditorClear=function(id){var t=document.getElementById(id+'-input'),p=document.getElementById(id+'-preview'),h=document.getElementById(id+'-hidden');t.value='';p.textContent='\u7B49\u5F85\u8F93\u5165...';p.setAttribute('data-valid','true');p.style.background='#dcfce7';h.value=''}<\/script>`;
  }

  // web/src/views/modelForm.ts
  function modelFormPage(model, apiKeyOptions, error, version = "1.15.0", selectedApiKeyRef) {
    const isEdit = !!model;
    const m = model || {};
    const v = (s) => escapeHtml(s || "");
    const opts = apiKeyOptions.map((k) => typeof k === "string" ? { id: k, name: k } : k);
    const refName = selectedApiKeyRef || (model?.apiKey?.startsWith("$$") && model.apiKey.endsWith("$$") ? model.apiKey.slice(2, -2) : "");
    const keyOptions = opts.map((k) => `<option value="${escapeHtml(k.id)}"${refName === k.name ? " selected" : ""}>${escapeHtml(k.name)}</option>`).join("");
    const testScript = `
<script>window.runTest = async function(){var b=document.getElementById('testBtn');b.disabled=true;document.getElementById('testLoading').style.display='block';try{var src=document.getElementById('apiKeySourceTest').value;var payload={provider:b.dataset.provider,baseUrl:b.dataset.base,realModel:b.dataset.real,message:document.getElementById('testMessage').value,defaultParams:JSON.parse(b.dataset.params||'{}'),proxy:document.getElementById('proxy')?document.getElementById('proxy').value:''};if(src!=='manual'){payload.apiKeyId=src}else{payload.apiKey=document.getElementById('apiKeyTest').value}var res=await fetch('/admin/models/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});var d=await res.json();if(d.success){document.getElementById('testResultModel').textContent=d.model||b.dataset.real;document.getElementById('testResultContent').textContent=d.content||'(\u65E0\u5185\u5BB9)';document.getElementById('testResultUsage').textContent=d.usage?('Tokens: \u8F93\u5165='+d.usage.prompt_tokens+', \u8F93\u51FA='+d.usage.completion_tokens):'';if(d.requestBody){document.getElementById('requestBodyContent').textContent=d.requestBody;document.getElementById('requestSection').style.display='block'}if(d.fullResponse){document.getElementById('responseBodyContent').textContent=d.fullResponse;document.getElementById('responseSection').style.display='block'}document.getElementById('testResult').style.display='block'}else{document.getElementById('testErrorMessage').textContent=d.message||'\u672A\u77E5\u9519\u8BEF';if(d.rawResponse){document.getElementById('testRawResponse').textContent=d.rawResponse;document.getElementById('rawResponseSection').style.display='block'}document.getElementById('testError').style.display='block'}}catch(e){document.getElementById('testErrorMessage').textContent='\u8BF7\u6C42\u5931\u8D25: '+e.message;document.getElementById('testError').style.display='block'}finally{b.disabled=false;document.getElementById('testLoading').style.display='none'}};window.toggleRawResponse = function(){var s=document.getElementById('rawResponseSection');s.style.display=s.style.display==='none'?'block':'none'}<\/script>`;
    const testHtml = isEdit ? `<details class="test-details"><summary>\u{1F9EA} \u6D4B\u8BD5\u6A21\u578B\u914D\u7F6E</summary><div class="form-card" style="margin-top:1rem"><div class="form-group"><label class="form-label" for="testMessage">\u6D4B\u8BD5\u6D88\u606F</label><textarea class="form-textarea" id="testMessage" placeholder="\u8BF7\u4ECB\u7ECD\u4E00\u4E0B\u4F60\u81EA\u5DF1">\u8BF7\u4ECB\u7ECD\u4E00\u4E0B\u4F60\u81EA\u5DF1</textarea></div><div class="form-group"><label class="form-label" for="apiKeySourceTest">API Key \u6765\u6E90</label><select id="apiKeySourceTest"><option value="manual">\u624B\u52A8\u8F93\u5165</option>${keyOptions}</select><input id="apiKeyTest" placeholder="\u7559\u7A7A\u5219\u4F7F\u7528\u6A21\u578B\u5DF2\u4FDD\u5B58\u7684 Key"></div><button type="button" class="btn btn-primary" id="testBtn" onclick="runTest()" data-provider="${v(m.provider)}" data-base="${v(m.baseUrl)}" data-real="${v(m.realModel)}" data-params="${escapeHtml(JSON.stringify(m.defaultParams || {}))}">\u53D1\u9001\u6D4B\u8BD5\u8BF7\u6C42</button><div id="testLoading" style="display:none;margin-top:0.75rem">\u53D1\u9001\u4E2D\u2026</div><div id="testResult" style="display:none;margin-top:1rem">\u6A21\u578B: <strong id="testResultModel"></strong><pre id="testResultContent"></pre><div id="testResultUsage"></div></div><div id="requestSection" style="display:none"><pre id="requestBodyContent"></pre></div><div id="responseSection" style="display:none"><pre id="responseBodyContent"></pre></div><div id="testError" style="display:none;margin-top:1rem;color:#dc2626"><span id="testErrorMessage"></span><div id="rawResponseSection" style="display:none"><pre id="testRawResponse"></pre></div></div></div></details>${testScript}` : "";
    const body = `<div class="form-card"><h1 class="form-title">${isEdit ? "\u7F16\u8F91\u6A21\u578B" : "\u65B0\u589E\u6A21\u578B"}</h1>${error ? `<div class="error-banner"><strong>\u9519\u8BEF\uFF1A</strong> ${escapeHtml(error)}</div>` : ""}<form method="post" action="${isEdit ? `/admin/models/edit/${encodeURIComponent(m.customModel)}` : "/admin/models"}">
<div class="form-group"><label class="form-label" for="customModel">\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="customModel" name="customModel" value="${v(m.customModel)}" placeholder="\u4F8B\u5982\uFF1Amy-gpt4" required><span class="form-hint">\u8C03\u7528 API \u65F6\u4F7F\u7528\u6B64\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="realModel">\u5B9E\u9645\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="realModel" name="realModel" value="${v(m.realModel)}" placeholder="\u4F8B\u5982\uFF1Agpt-4" required><span class="form-hint">\u4E0A\u6E38 API \u652F\u6301\u7684\u6A21\u578B\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" required><option value="">\u8BF7\u9009\u62E9...</option>${["openai", "response-api", "anthropic"].map((p) => `<option value="${p}" ${m.provider === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>
<div class="form-group"><label class="form-label" for="baseUrl">Base URL</label><input class="form-input" id="baseUrl" name="baseUrl" value="${v(m.baseUrl)}" placeholder="\u4F8B\u5982\uFF1Ahttps://api.openai.com" required><span class="form-hint">API \u63D0\u4F9B\u5546\u7684\u5730\u5740</span></div>
<div class="form-group"><label class="form-label" for="proxy">\u4EE3\u7406\uFF08\u53EF\u9009\uFF09</label><input class="form-input" id="proxy" name="proxy" value="${v(m.proxy)}" placeholder="http://user:pass@127.0.0.1:7890 \u6216 socks5://127.0.0.1:1080"><span class="form-hint">\u53D1\u5F80\u4E0A\u6E38\u7684\u8BF7\u6C42\u901A\u8FC7\u6B64\u4EE3\u7406\u8F6C\u53D1\uFF0C\u7559\u7A7A\u5219\u76F4\u8FDE\u3002\u652F\u6301 http://\u3001https://\u3001socks5://\uFF08\u53EF\u5E26 user:pass@ \u8BA4\u8BC1\uFF09\uFF1B\u4E0D\u652F\u6301 socks5h:// \u548C socks4://</span></div>
<div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource" onchange="var i=document.getElementById('apiKeyManual');i.disabled=this.value!=='manual';if(i.disabled)i.value=''"><option value="manual"${refName ? "" : " selected"}>\u624B\u52A8\u8F93\u5165</option>${keyOptions}</select><input class="form-input" id="apiKeyManual" name="apiKey" ${refName ? "disabled" : ""} placeholder="${refName ? `\u4F7F\u7528\u5F15\u7528\uFF1A$$${escapeHtml(refName)}$$` : isEdit ? "\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : "\u8BF7\u8F93\u5165 API Key"}"><span class="form-hint">${refName ? `\u5F15\u7528 API Key\u300C${escapeHtml(refName)}\u300D\uFF0C\u4FEE\u6539\u540E\u5C06\u5168\u5C40\u751F\u6548` : "\u53EF\u9009\u62E9\u5DF2\u4FDD\u5B58\u7684 API Key\uFF0C\u6216\u624B\u52A8\u8F93\u5165"}${isEdit ? "\uFF1B\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : ""}</span></div>
<div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><textarea class="form-textarea" id="desc" name="desc" placeholder="\u8BF7\u8F93\u5165\u6A21\u578B\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09">${v(m.desc)}</textarea><span class="form-hint">\u7528\u4E8E\u8BB0\u5F55\u6A21\u578B\u7684\u7528\u9014\u6216\u5907\u6CE8</span></div>
<div class="form-group"><label class="form-label" for="maxContextLength">\u6700\u5927\u4E0A\u4E0B\u6587\u957F\u5EA6</label><input class="form-input" id="maxContextLength" name="maxContextLength" type="number" value="${m.maxContextLength || ""}" placeholder="\u9ED8\u8BA4 200000"><span class="form-hint">\u6A21\u578B\u652F\u6301\u7684\u6700\u5927 token \u6570\uFF0C\u672A\u586B\u5199\u5219\u4F7F\u7528\u9ED8\u8BA4\u503C 200000</span></div>
<div class="form-group"><label class="form-label">\u9ED8\u8BA4\u53C2\u6570 (JSON)</label>${jsonEditor("defaultParams", "")}</div>
<div class="form-actions"><button type="submit" class="btn btn-primary">\u4FDD\u5B58\u6A21\u578B</button><a href="/admin/models" class="btn btn-secondary">\u53D6\u6D88</a></div></form></div>${testHtml}`;
    return adminPage(isEdit ? "\u7F16\u8F91\u6A21\u578B" : "\u65B0\u589E\u6A21\u578B", "/admin/models", body, css4, version);
  }

  // web/src/styles/admin_model_limits.ts
  var css5 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .limits-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .limits-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 0.5rem;\n            color: var(--text-primary);\n          }\n\n          .limits-subtitle {\n            color: var(--text-secondary);\n            margin-bottom: 1.5rem;\n          }\n\n          .alert {\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          .alert-error {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n          }\n\n          .alert-success {\n            background: #f0fdf4;\n            border: 1px solid #bbf7d0;\n            color: #166534;\n          }\n\n          .section-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.25rem;\n            margin: 1.5rem 0 1rem;\n            color: var(--text-primary);\n          }\n\n          table {\n            width: 100%;\n            border-collapse: collapse;\n            margin-bottom: 1.5rem;\n          }\n\n          th, td {\n            text-align: left;\n            padding: 0.75rem;\n            border-bottom: 1px solid var(--border-color);\n          }\n\n          th {\n            font-weight: 600;\n            color: var(--text-secondary);\n            font-size: 0.85rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.5rem 1rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.85rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .btn-danger {\n            background: #fef2f2;\n            color: #ef4444;\n            border: 1px solid #fecaca;\n            padding: 0.25rem 0.5rem;\n            font-size: 0.75rem;\n          }\n\n          .btn-danger:hover {\n            background: #ef4444;\n            color: #fff;\n          }\n\n          .form-grid {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 1rem;\n            max-width: 600px;\n          }\n\n          .form-group {\n            margin-bottom: 1rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input,\n          .form-select {\n            width: 100%;\n            padding: 0.6rem 0.8rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.9rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus,\n          .form-select:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n          }\n\n          .btn-submit {\n            margin-top: 1rem;\n            padding: 0.7rem 1.5rem;\n            background: var(--accent-gradient);\n            color: #fff;\n            border: none;\n            border-radius: var(--radius-sm);\n            font-weight: 600;\n            cursor: pointer;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .limits-card { padding: 1.5rem; }\n            .form-grid { grid-template-columns: 1fr; }\n          }\n        `}";

  // web/src/views/modelLimits.ts
  function modelLimitsPage(model, limits, error, success, version = "1.15.0") {
    const body = `<div class="limits-card"><h1 class="limits-title">\u9650\u5236\u89C4\u5219\u7BA1\u7406</h1><p class="limits-subtitle">\u6A21\u578B\uFF1A<strong>${escapeHtml(model)}</strong></p>
${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}${success ? `<div class="alert alert-success">${escapeHtml(success)}</div>` : ""}
<h2 class="section-title">\u73B0\u6709\u89C4\u5219</h2><table class="limits-table"><thead><tr><th>\u7C7B\u578B</th><th>\u5468\u671F</th><th>\u6570\u503C</th><th>\u4F7F\u7528\u60C5\u51B5</th><th>\u64CD\u4F5C</th></tr></thead><tbody>${limits.map((l, i) => `<tr><td>${escapeHtml(l.type)}</td><td>${escapeHtml(l.period)} ${l.periodValue || ""}</td><td>${l.max}</td><td>${escapeHtml(l.usage || "\u2014")}</td><td><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/delete/${i}"><button class="btn btn-danger">\u5220\u9664</button></form></td></tr>`).join("")}</tbody></table>
<h2 class="section-title">\u6DFB\u52A0\u89C4\u5219</h2><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/add"><div class="form-grid"><div class="form-group"><label class="form-label" for="type">\u7C7B\u578B</label><select class="form-select" id="type" name="type" required onchange="handleTypeChange(this)"><option value="">\u8BF7\u9009\u62E9...</option><option value="requests">\u6309\u8BF7\u6C42\u6B21\u6570</option><option value="input_tokens">\u6309 Token \u6570</option><option value="cost">\u6309\u91D1\u989D</option></select></div><div class="form-group" id="periodLabel" style="display:none"><label class="form-label" for="period">\u5468\u671F</label><select class="form-select" id="period" name="period" onchange="handlePeriodChange(this)"><option value="">\u8BF7\u9009\u62E9...</option><option value="hours">\u6309\u5C0F\u65F6</option><option value="day">\u6309\u5929</option><option value="week">\u6309\u5468</option><option value="month">\u6309\u6708</option></select></div><div class="form-group" id="periodValueLabel" style="display:none"><label class="form-label" for="periodValue">\u5468\u671F\u6570\u503C</label><input class="form-input" id="periodValue" name="periodValue" placeholder="\u4F8B\u5982\uFF1A4"></div><div class="form-group" id="maxLabel" style="display:none"><label class="form-label" for="maxInput">\u6570\u503C</label><input class="form-input" id="maxInput" name="max" placeholder="\u8BF7\u8F93\u5165\u6570\u503C"></div><div class="form-group" id="costMaxLabel" style="display:none"><label class="form-label" for="costMaxInput">\u91D1\u989D</label><input class="form-input" id="costMaxInput" name="costMax" placeholder="\u8BF7\u8F93\u5165\u91D1\u989D"></div></div><button type="submit" class="btn-submit">\u6DFB\u52A0\u89C4\u5219</button></form></div>
<script>function handleTypeChange(s){var t=s.value;document.getElementById('periodLabel').style.display=t==='cost'?'none':'block';document.getElementById('maxLabel').style.display=t==='cost'?'none':'block';document.getElementById('costMaxLabel').style.display=t==='cost'?'block':'none'}function handlePeriodChange(s){document.getElementById('periodValueLabel').style.display=s.value==='hours'?'block':'none'}<\/script>`;
    return adminPage(`\u9650\u5236\u89C4\u5219\u7BA1\u7406 - ${model}`, "/admin/models", body, css5, version);
  }

  // web/src/views/stats.ts
  function statsPage(s, version = "1.15.0") {
    const pct = s.totalRequests ? s.successfulRequests / s.totalRequests * 100 : 0;
    const cards = [
      ["\u603B\u8BF7\u6C42", formatNumber(s.totalRequests), s.dateRange],
      ["\u6210\u529F\u8BF7\u6C42", formatNumber(s.successfulRequests), `${pct.toFixed(1)}% \u6210\u529F\u7387`],
      ["\u5931\u8D25\u8BF7\u6C42", formatNumber(s.failedRequests), `${(100 - pct).toFixed(1)}% \u5931\u8D25\u7387`],
      ["\u5E73\u5747\u5EF6\u8FDF", formatDuration(s.avgDuration), "\u6240\u6709\u8BF7\u6C42"]
    ].map(([label, value, sub]) => `<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${label}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${value}</div><div class="ui-field-hint">${escapeHtml(sub)}</div></div>`).join("");
    const tokens = [["\u8F93\u5165", s.totalInputTokens], ["\u7F13\u5B58\u8F93\u5165", s.totalCachedTokens], ["\u8F93\u51FA", s.totalOutputTokens], ["\u603B\u8BA1", s.totalTokens]].map(([k, v]) => `<div><div class="ui-field-hint">${k}</div><div class="ui-mono" style="font-size:18px;font-weight:700">${formatNumber(v)}</div></div>`).join("");
    const heat = Object.entries(s.byDate).map(([d, n]) => `<span class="ui-badge" title="${d}: ${n}">${d.slice(5)} \xB7 ${n}</span>`).join("");
    const models = Object.entries(s.byModel).map(([m, v]) => `<div class="ui-row" style="padding:8px 0;border-bottom:1px solid var(--ui-line)"><strong>${escapeHtml(m)}</strong><span class="ui-spacer"></span><span class="ui-mono">${formatNumber(v.requests)} \u8BF7\u6C42</span><span class="ui-field-hint">${formatNumber(v.totalTokens)} tokens</span></div>`).join("");
    const detailRows = (s.details || []).map((r) => `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${escapeHtml(r.userName || "-")}</td><td>${escapeHtml(r.customModel)}</td><td>${escapeHtml(r.modelGroup || "\u2014")}</td><td>${r.statusCode}</td><td>${formatDuration(r.durationMs)}</td><td>${r.ttftMs != null ? formatDuration(r.ttftMs) : "\u2014"}</td><td>${r.tps != null ? r.tps.toFixed(1) : "\u2014"}</td><td>${formatNumber(r.completionTokens)}</td></tr>`);
    const filter = `<form method="get" action="/admin/stats" class="ui-row" id="stats-filter-form"><input class="ui-input" style="width:auto" type="date" id="start" name="startDate" value="${s.startDate}"><input class="ui-input" style="width:auto" type="date" id="end" name="endDate" value="${s.endDate}"><input class="ui-input" style="width:150px" name="userName" placeholder="\u7528\u6237" value="${escapeHtml(s.userName || "")}"><input class="ui-input" style="width:180px" name="model" placeholder="\u6A21\u578B" value="${escapeHtml(s.model || "")}"><button class="ui-btn ui-btn-primary">\u67E5\u8BE2</button><button type="button" class="ui-btn" data-days="1">\u4ECA\u5929</button><button type="button" class="ui-btn" data-days="7">7\u5929</button><button type="button" class="ui-btn" data-days="30">30\u5929</button></form>`;
    const body = pageHeader({ eyebrow: "Analytics", title: "\u7EDF\u8BA1 Dashboard", subtitle: `${escapeHtml(s.dateRange)} \xB7 \u5E73\u5747\u5EF6\u8FDF ${formatDuration(s.avgDuration)}` }) + filter + `<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards}</div><div style="height:16px"></div>` + panel("Token \u7528\u91CF", "", `<div class="ui-grid ui-grid-auto">${tokens}</div>`) + panel("\u6BCF\u65E5\u6D88\u8017", "", `<div class="ui-row heatmap-grid">${heat || "\u6682\u65E0\u6570\u636E"}</div>`) + panel("\u6309\u6A21\u578B\u7EDF\u8BA1", "", models || "\u6682\u65E0\u6570\u636E") + ((s.details || []).length ? `<div class="pagination">${panel("\u6700\u8FD1\u8BF7\u6C42", `${s.details.length} \u6761`, table(["\u65F6\u95F4", "\u7528\u6237", "\u6A21\u578B", "\u5206\u7EC4", "\u72B6\u6001", "\u8017\u65F6", "TTFT", "TPS", "\u8F93\u51FA"], detailRows))}</div>` : "");
    const script = `<script>document.querySelectorAll('[data-days]').forEach(function(b){b.addEventListener('click',function(){var d=parseInt(this.getAttribute('data-days'),10);var end=new Date();var start=new Date(end.getTime()-d*86400000);document.getElementById('start').value=start.toISOString().slice(0,10);document.getElementById('end').value=end.toISOString().slice(0,10);document.getElementById('stats-filter-form').submit()})})<\/script>`;
    return shell({ title: "\u7EDF\u8BA1 Dashboard", path: "/admin/stats", version, body, scripts: script });
  }

  // web/src/views/login.ts
  function loginShell(title, heading, body) {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${uiCSS}
.ui-login-wrap{min-height:100vh;display:grid;place-items:center;padding:24px}
.ui-login-card{width:min(100%,420px);background:#fff;border:1px solid var(--ui-line);border-radius:16px;box-shadow:0 24px 60px rgba(16,24,40,.10);padding:28px}
.ui-login-mark{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--ui-accent);color:#fff;font-weight:800;margin-bottom:16px}
.ui-login-title{font-size:22px;margin:0 0 6px}.ui-login-sub{margin:0 0 22px;color:var(--ui-muted);font-size:13px}
</style></head><body><div class="ui-login-wrap"><div class="ui-login-card"><div class="ui-login-mark">L</div><h1 class="ui-login-title">${heading}</h1>${body}</div></div></body></html>`;
  }
  function adminLoginPage(isSetup, error) {
    return loginShell(
      "\u7BA1\u7406\u5458\u767B\u5F55 \xB7 LLM Gateway",
      isSetup ? "\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801" : "\u7BA1\u7406\u5458\u767B\u5F55",
      `<p class="ui-login-sub">${isSetup ? "\u9996\u6B21\u4F7F\u7528\u8BF7\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801" : "\u767B\u5F55\u540E\u7BA1\u7406\u6A21\u578B\u3001\u5BC6\u94A5\u4E0E\u7EDF\u8BA1\u4FE1\u606F\u3002"}</p>` + (error ? `<div class="ui-notice ui-notice-error">${escapeHtml(error)}</div>` : "") + `<form method="POST" action="/api/admin/login"><label class="ui-field"><span class="ui-field-label">\u5BC6\u7801</span><input class="ui-input" type="password" name="password" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" required></label><button class="ui-btn ui-btn-primary" style="width:100%">${isSetup ? "\u8BBE\u7F6E\u5BC6\u7801" : "\u767B\u5F55"}</button></form>`
    );
  }
  function userLoginPage(error) {
    return loginShell(
      "\u7528\u6237\u767B\u5F55 \xB7 LLM Gateway",
      "\u7528\u6237\u767B\u5F55",
      `<p class="ui-login-sub">\u4F7F\u7528\u7528\u6237 API Key \u67E5\u770B\u53EF\u7528\u6A21\u578B\u4E0E\u7528\u91CF\u3002</p>` + (error ? `<div class="ui-notice ui-notice-error">${escapeHtml(error)}</div>` : "") + `<form method="POST" action="/api/user/login"><label class="ui-field"><span class="ui-field-label">API Key</span><input class="ui-input" type="password" name="apikey" placeholder="\u8BF7\u8F93\u5165 API Key" required></label><button class="ui-btn ui-btn-primary" style="width:100%">\u767B\u5F55</button></form>`
    );
  }

  // web/src/views/userHome.ts
  function userHomePage(p) {
    const cfg = JSON.stringify({ openai: { baseURL: location.origin + "/v1", apiKey: "sk-your-api-key" } }, null, 2);
    const copy = (id) => `<button class="ui-btn ui-btn-sm copy-btn" data-copy="${id}">\u590D\u5236</button>`;
    const body = `<div class="ui-page-head"><div><div class="ui-eyebrow">Getting started</div><h1 class="ui-title">\u{1F680} LLM Gateway</h1><p class="ui-subtitle">\u7EDF\u4E00\u7684\u5927\u6A21\u578B API \u7F51\u5173\uFF0C\u517C\u5BB9 OpenAI / Anthropic / Responses \u683C\u5F0F</p></div>${p.userName ? `<div class="ui-row">\u6B22\u8FCE\uFF0C${escapeHtml(p.userName)}</div>` : ""}</div>
${p.announcement ? `<div class="ui-notice ui-notice-info">${p.announcement}</div>` : ""}
<div class="ui-grid ui-grid-2">
  ${panel("JSON \u914D\u7F6E", "\u590D\u5236\u5230\u4F60\u7684 OpenAI \u517C\u5BB9\u5BA2\u6237\u7AEF", `<pre class="ui-input ui-mono" id="json-config" style="white-space:pre-wrap;min-height:160px">${escapeHtml(cfg)}</pre><div style="height:10px"></div>${copy("json-config")}`)}
  ${panel("Base URL", "\u7F51\u5173\u5730\u5740", `<div class="ui-mono" id="base-url">${location.origin}/v1</div><div style="height:10px"></div>${copy("base-url")}`)}
</div>
${panel("\u53EF\u7528\u6A21\u578B", `${p.models.length} \u4E2A\u6A21\u578B / ${p.modelGroups.length} \u4E2A\u6A21\u578B\u7EC4`, `<div class="ui-mono" id="model-value">${escapeHtml((p.modelGroups.length ? p.modelGroups : p.models)[0] || "")}</div><div style="height:10px"></div>${copy("model-value")}<div class="ui-row" style="margin-top:14px">${(p.modelGroups.length ? p.modelGroups : p.models).map((m) => `<span class="ui-badge">${escapeHtml(m)}</span>`).join("")}</div>`)}
<script>document.querySelectorAll('.copy-btn').forEach(function(b){b.addEventListener('click',function(){var el=document.getElementById(this.getAttribute('data-copy'));if(el&&navigator.clipboard)navigator.clipboard.writeText(el.textContent||'');this.textContent='\u5DF2\u590D\u5236';var btn=this;setTimeout(function(){btn.textContent='\u590D\u5236'},1500)})})<\/script>`;
    return shell({ title: "LLM Gateway", path: "/user/main", nav: userNav, body, width: 980 });
  }

  // web/src/views/userStats.ts
  function userStatsPage(s) {
    const pct = s.totalRequests ? s.successfulRequests / s.totalRequests * 100 : 0;
    const filter = `<form method="get" action="/user/stats" class="ui-row"><input class="ui-input" style="width:auto" type="date" name="startDate" value="${s.start}"><input class="ui-input" style="width:auto" type="date" name="endDate" value="${s.end}"><button class="ui-btn ui-btn-primary">\u67E5\u8BE2</button></form>`;
    if (!s.totalRequests) {
      return shell({
        title: "\u4F7F\u7528\u7EDF\u8BA1",
        path: "/user/stats",
        nav: userNav,
        width: 980,
        body: pageHeader({ eyebrow: "Analytics", title: `\u4F7F\u7528\u7EDF\u8BA1 \u2014 ${escapeHtml(s.userName)}`, subtitle: "\u67E5\u770B API \u4F7F\u7528\u60C5\u51B5\u4E0E\u7EDF\u8BA1\u6570\u636E" }) + filter + '<div style="height:16px"></div>' + panel("\u7EDF\u8BA1\u7ED3\u679C", "", empty("\u6682\u65E0\u7EDF\u8BA1\u6570\u636E", "\u53D1\u8D77\u4E00\u6B21\u8BF7\u6C42\u540E\u5373\u53EF\u770B\u5230\u7528\u91CF\u3002"))
      });
    }
    const cards = [["\u603B\u8BF7\u6C42", formatNumber(s.totalRequests)], ["\u6210\u529F\u7387", `${pct.toFixed(1)}%`], ["\u603B Token", formatNumber(s.totalTokens)], ["\u5E73\u5747\u5EF6\u8FDF", formatDuration(s.avgDuration)]].map(([k, v]) => `<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${k}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${v}</div></div>`).join("");
    const rows = Object.entries(s.byModel).map(([m, v]) => `<tr><td>${escapeHtml(m)}</td><td>${v.requests}</td><td>${formatNumber(v.totalTokens)}</td></tr>`);
    const body = pageHeader({ eyebrow: "Analytics", title: `\u4F7F\u7528\u7EDF\u8BA1 \u2014 ${escapeHtml(s.userName)}`, subtitle: `${s.start} \u81F3 ${s.end}` }) + filter + '<div style="height:14px"></div><div class="ui-grid ui-grid-auto">' + cards + '</div><div style="height:16px"></div>' + panel("Token \u7528\u91CF\u660E\u7EC6", "", table(["\u6A21\u578B", "\u8BF7\u6C42\u6570", "Token"], rows));
    return shell({ title: "\u4F7F\u7528\u7EDF\u8BA1", path: "/user/stats", nav: userNav, width: 980, body });
  }

  // web/src/styles/admin_model_group_form.ts
  var css6 = '{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input,\n          .form-textarea {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus,\n          .form-textarea:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-hint {\n            display: block;\n            font-size: 0.78rem;\n            color: var(--text-secondary);\n            margin-top: 0.35rem;\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .btn-small {\n            padding: 0.35rem 0.65rem;\n            font-size: 0.8rem;\n          }\n\n          .error-banner {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          /* \u6A21\u578B\u9009\u62E9\u5668\u6837\u5F0F */\n          .model-selector {\n            display: grid;\n            grid-template-columns: 1fr auto 1fr;\n            gap: 1rem;\n            margin-top: 0.5rem;\n          }\n\n          .model-list {\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            padding: 0.75rem;\n            max-height: 20rem;\n            overflow-y: auto;\n            background: var(--bg-page);\n          }\n          .model-filter-input {\n            margin-bottom: 0.75rem;\n          }\n\n          .model-list-title {\n            margin: 0 0 0.75rem 0;\n            font-size: 0.9rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n          }\n\n          .model-list-empty {\n            color: var(--text-secondary);\n            font-size: 0.85rem;\n          }\n\n          .model-item {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            padding: 0.5rem;\n            margin-bottom: 0.25rem;\n            border-radius: 6px;\n            background-color: var(--bg-card);\n          }\n\n          .model-item-name {\n            font-size: 0.85rem;\n          }\n\n          .model-item-name small {\n            color: var(--text-secondary);\n          }\n\n          .model-item-desc {\n            color: var(--text-secondary);\n          }\n\n          .model-list-hint {\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n            align-items: center;\n            gap: 0.5rem;\n            color: var(--text-secondary);\n            font-size: 0.85rem;\n          }\n\n          .model-list.selected {\n            background-color: #eef2ff;\n            border-color: #c7d2fe;\n          }\n\n          .model-item.selected {\n            background-color: var(--bg-card);\n            border: 1px solid #c7d2fe;\n          }\n\n          .selected-index {\n            color: var(--text-secondary);\n            font-size: 12px;\n            min-width: 20px;\n          }\n\n          .model-actions {\n            display: flex;\n            gap: 0.25rem;\n          }\n\n          .btn-icon {\n            padding: 2px 6px;\n            font-size: 12px;\n            min-width: 24px;\n          }\n\n          .btn-icon.disabled {\n            opacity: 0.5;\n            pointer-events: none;\n          }\n\n          /* \u590D\u9009\u6846\u6A21\u5F0F */\n          .checkbox-list {\n            display: flex;\n            flex-direction: column;\n            gap: 0.5rem;\n          }\n\n          .checkbox-item {\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n            padding: 0.5rem;\n            border-radius: 6px;\n            background-color: var(--bg-card);\n            cursor: pointer;\n          }\n\n          .checkbox-item:hover {\n            background-color: #f0f0f5;\n          }\n\n          .checkbox-item input[type="checkbox"] {\n            width: 16px;\n            height: 16px;\n            accent-color: var(--accent-color);\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n            .model-selector { grid-template-columns: 1fr; }\n            .model-list-hint { display: none; }\n          }\n        `}';

  // web/src/views/groupForm.ts
  function groupFormPage(group, models, error, version = "1.15.0") {
    const isEdit = !!group;
    const g = group || { models: [] };
    const selected = new Set(g.models);
    const body = `<div class="form-card"><h1 class="form-title">${isEdit ? "\u7F16\u8F91" : "\u65B0\u589E"} Model Group</h1>${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ""}<form method="post" action="${isEdit ? `/admin/model-groups/edit/${encodeURIComponent(g.name)}` : "/admin/model-groups"}">
<div class="form-group"><label class="form-label" for="name">\u540D\u79F0</label><input class="form-input" id="name" name="name" value="${escapeHtml(g.name)}" placeholder="\u4F8B\u5982\uFF1Agpt-4-pool" required><span class="form-hint">\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u3001\u4E2D\u5212\u7EBF</span></div>
<div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><textarea class="form-textarea" id="desc" name="desc" placeholder="\u63CF\u8FF0\u8FD9\u4E2A\u6A21\u578B\u7EC4\u7684\u7528\u9014\u6216\u5907\u6CE8...">${escapeHtml(g.desc)}</textarea><span class="form-hint">\u7528\u4E8E\u8BB0\u5F55\u6A21\u578B\u7EC4\u7684\u7528\u9014\u6216\u5907\u6CE8</span></div>
<div class="form-actions"><button type="submit" class="btn btn-primary">${isEdit ? "\u4FDD\u5B58\u4FEE\u6539" : "\u6DFB\u52A0 Model Group"}</button><a href="/admin/model-groups" class="btn btn-secondary">\u53D6\u6D88</a></div>
<div class="form-group" style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border-color)"><label class="form-label">\u7EC4\u5185\u6A21\u578B</label><div class="model-selector"><div class="model-list available-model-list"><h3 class="model-list-title">\u53EF\u7528\u6A21\u578B</h3><input class="form-input model-filter-input" placeholder="\u8FC7\u6EE4\u6A21\u578B\uFF08\u540D\u79F0 / \u63CF\u8FF0\uFF09...">${models.filter((m) => !selected.has(m.customModel)).map((m) => `<div class="model-item available-model-item" data-filter-text="${escapeHtml((m.customModel + " " + (m.desc || "")).toLowerCase())}"><span class="model-item-name">${escapeHtml(m.customModel)}${m.desc ? `<span class="model-item-desc"> (${escapeHtml(m.desc)})</span>` : ""}</span><a class="btn btn-secondary btn-small btn-icon" href="/admin/model-groups/edit/${encodeURIComponent(g.name || "")}/add-model?model=${encodeURIComponent(m.customModel)}" title="\u52A0\u5165">+</a></div>`).join("") || '<p class="model-list-empty">\u6682\u65E0\u53EF\u7528\u6A21\u578B</p>'}</div><div class="model-list selected selected-model-list"><h3 class="model-list-title">\u5DF2\u9009\u6A21\u578B\uFF08\u6309\u987A\u5E8F\uFF09</h3><input class="form-input model-filter-input" placeholder="\u8FC7\u6EE4\u5DF2\u9009\u6A21\u578B...">${g.models.map((name, i) => `<div class="model-item selected selected-model-item"><span class="selected-index">${i + 1}.</span><span class="model-item-name">${escapeHtml(name)}</span><div class="model-actions"><a class="btn btn-secondary btn-small btn-icon" href="/admin/model-groups/edit/${encodeURIComponent(g.name || "")}/move-model?model=${encodeURIComponent(name)}&delta=-1" title="\u4E0A\u79FB">\u2191</a><a class="btn btn-secondary btn-small btn-icon" href="/admin/model-groups/edit/${encodeURIComponent(g.name || "")}/move-model?model=${encodeURIComponent(name)}&delta=1" title="\u4E0B\u79FB">\u2193</a><a class="btn btn-secondary btn-small btn-icon" href="/admin/model-groups/edit/${encodeURIComponent(g.name || "")}/remove-model?model=${encodeURIComponent(name)}" title="\u79FB\u9664">\xD7</a></div></div>`).join("") || '<p class="model-list-empty">\u6682\u65E0\u5DF2\u9009\u6A21\u578B</p>'}</div></div><span class="form-hint">\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u6A21\u578B${isEdit ? "\uFF0C\u53EF\u6309\u9700\u8C03\u6574\u987A\u5E8F" : ""}</span></div></form></div>`;
    return adminPage(isEdit ? "\u7F16\u8F91 Model Group" : "\u65B0\u589E Model Group", "/admin/model-groups", body, css6, version);
  }

  // web/src/styles/admin_user_form.ts
  var css7 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-hint {\n            display: block;\n            font-size: 0.78rem;\n            color: var(--text-secondary);\n            margin-top: 0.35rem;\n          }\n\n          .apikey-display {\n            margin-bottom: 1rem;\n            padding: 0.75rem;\n            background: var(--bg-page);\n            border-radius: var(--radius-sm);\n          }\n\n          .apikey-label {\n            display: block;\n            margin-bottom: 0.5rem;\n            font-weight: 600;\n          }\n\n          .apikey-code {\n            font-size: 0.9rem;\n            color: var(--text-secondary);\n            font-family: 'DM Mono', monospace;\n          }\n\n          .apikey-note {\n            font-size: 0.8rem;\n            color: var(--text-secondary);\n            margin-top: 0.5rem;\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n          }\n        `}";

  // web/src/views/userForm.ts
  function userFormPage(user, models, error, version = "1.15.0") {
    const isEdit = !!user;
    const u = user || {};
    const title = isEdit ? "\u7F16\u8F91\u7528\u6237" : "\u65B0\u589E\u7528\u6237";
    const body = `<div class="form-card"><h1 class="form-title">${title}</h1>${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ""}<form method="post" action="${isEdit ? `/admin/users/edit/${encodeURIComponent(u.name)}` : "/admin/users/new"}">
<div class="form-group"><label class="form-label" for="name">\u7528\u6237\u540D\u79F0</label><input class="form-input" id="name" name="name" value="${escapeHtml(u.name)}" placeholder="\u8BF7\u8F93\u5165\u7528\u6237\u540D\u79F0" required></div>
<div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><input class="form-input" id="desc" name="desc" value="${escapeHtml(u.desc)}" placeholder="\u53EF\u9009\uFF0C\u63CF\u8FF0\u7528\u6237\u7528\u9014"></div>
${isEdit ? `<div class="apikey-display"><label class="apikey-label">API Key</label><code class="apikey-code">${escapeHtml(u.apikey)}</code><p class="apikey-note">\u8BF7\u59A5\u5584\u4FDD\u7BA1\u6B64 Key\uFF0C\u4E0D\u8981\u6CC4\u9732\u7ED9\u4ED6\u4EBA\u3002</p></div>` : ""}
<div class="form-group"><label class="form-label">\u6A21\u578B\u6743\u9650</label><label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;cursor:pointer"><input type="checkbox" name="allModels" ${!u.allowedModels?.length ? "checked" : ""}> \u6240\u6709\u6A21\u578B</label>${models.map((m) => `<label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;cursor:pointer"><input type="checkbox" name="allowedModels" value="${escapeHtml(m)}" ${u.allowedModels?.includes(m) ? "checked" : ""}> ${escapeHtml(m)}</label>`).join("")}<span class="form-hint">\u4E0D\u9009\u62E9\u4EFB\u4F55\u6A21\u578B\u8868\u793A\u4E0D\u9650\u5236</span></div>
<div class="form-actions"><button type="submit" class="btn btn-primary">${isEdit ? "\u4FDD\u5B58\u4FEE\u6539" : "\u6DFB\u52A0\u7528\u6237"}</button><a href="/admin/users" class="btn btn-secondary">\u53D6\u6D88</a></div></form></div>`;
    return adminPage(title, "/admin/users", body, css7, version);
  }

  // web/src/admin.ts
  var q = (name) => new URLSearchParams(location.search).get(name) || "";
  var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  var renderers = {
    "/admin/models": async () => modelsPage((await api("/api/admin/models")).data || []),
    "/admin/model-groups": async () => groupsPage((await api("/api/admin/model-groups")).data || []),
    "/admin/users": async () => usersPage((await api("/api/admin/users")).data || []),
    "/admin/api-keys": async () => apiKeysPage((await api("/api/admin/api-keys")).data || []),
    "/admin/password": () => passwordPage(true),
    "/admin/privacy": async () => privacyPage((await api("/api/admin/privacy")).data?.settings || { enabled: false, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: "USER" }),
    "/admin/announcement": async () => announcementPage((await api("/api/admin/announcement")).data?.content || ""),
    "/admin/models/new": async () => modelFormPage(void 0, (await api("/api/admin/api-keys")).data || []),
    "/admin/model-groups/new": async () => groupFormPage(void 0, (await api("/api/admin/models")).data || []),
    "/admin/users/new": async () => userFormPage(void 0, (await api("/api/admin/models")).data || []),
    "/admin/stats": async () => {
      const d = (await api("/api/admin/stats" + location.search)).data || {};
      return statsPage({
        startDate: q("startDate") || today(),
        endDate: q("endDate") || q("startDate") || today(),
        dateRange: d.dateRange || "",
        userName: q("userName"),
        model: q("model"),
        totalRequests: d.totalRequests || 0,
        successfulRequests: d.successfulRequests || 0,
        failedRequests: d.failedRequests || 0,
        totalInputTokens: d.totalInputTokens || 0,
        totalOutputTokens: d.totalOutputTokens || 0,
        totalTokens: d.totalTokens || 0,
        totalCachedTokens: d.totalCachedTokens || 0,
        avgDuration: d.avgDuration || 0,
        byModel: d.byModel || {},
        byDate: d.byDate || {},
        byHour: d.byHour || {},
        page: d.page,
        totalPages: d.totalPages,
        details: d.details || []
      });
    },
    "/admin/login": async () => adminLoginPage(!(await api("/api/admin/auth-status")).data?.passwordConfigured),
    "/user/login": () => userLoginPage(),
    "/user/main": async () => {
      const d = (await api("/api/user/config")).data || {};
      return userHomePage({ models: (d.models || []).map((m) => m.customModel), modelGroups: (d.modelGroups || []).map((g) => g.name), announcement: d.announcement, userName: q("userName") });
    },
    "/user/stats": async () => {
      const d = (await api("/api/user/stats" + location.search)).data || {};
      return userStatsPage({ userName: q("userName") || "User", start: q("startDate") || today(), end: q("endDate") || today(), totalRequests: d.total || 0, successfulRequests: d.successful || 0, totalTokens: d.totalTokens || 0, avgDuration: d.avgDuration || 0, byModel: d.byModel || {}, byDate: d.byDate || {} });
    }
  };
  async function renderAdmin(ctx) {
    let path = ctx.path;
    let m;
    if (m = path.match(/^\/admin\/models\/edit\/(.+)$/)) {
      const models = (await api("/api/admin/models")).data || [];
      const model = models.find((x) => x.customModel === decodeURIComponent(m[1]));
      const keys = (await api("/api/admin/api-keys")).data || [];
      const ref = model?.apiKey?.startsWith("$$") && model.apiKey.endsWith("$$") ? model.apiKey.slice(2, -2) : "";
      return modelFormPage(model, keys, void 0, "1.15.0", ref);
    }
    if (m = path.match(/^\/admin\/models\/([^/]+)\/limits$/)) return modelLimitsPage(decodeURIComponent(m[1]), (await api(`/api/admin/models/${m[1]}/limits`)).data || []);
    if (m = path.match(/^\/admin\/model-groups\/edit\/(.+)$/)) {
      const groups = (await api("/api/admin/model-groups")).data || [];
      const g = groups.find((x) => x.name === decodeURIComponent(m[1]));
      return groupFormPage(g, (await api("/api/admin/models")).data || []);
    }
    if (m = path.match(/^\/admin\/users\/edit\/(.+)$/)) {
      const users = (await api("/api/admin/users")).data || [];
      const u = users.find((x) => x.name === decodeURIComponent(m[1]));
      const models = (await api("/api/admin/models")).data || [];
      return userFormPage(u, models.map((x) => x.customModel));
    }
    if (m = path.match(/^\/admin\/api-keys\/edit\/(.+)$/)) {
      const all = (await api("/api/admin/api-keys")).data || [];
      const k = all.find((x) => x.id === decodeURIComponent(m[1]));
      if (!k) return apiKeysPage(all, "\u672A\u627E\u5230\u8BE5 API Key");
      return apiKeysPage(all, void 0, void 0, "1.15.0", { id: k.id, name: k.name, keyHint: k.keyHint || "*****" });
    }
    const fn = renderers[path];
    if (!fn) return modelsPage([], `Page not implemented: ${path}`, ctx.version);
    try {
      return await fn(ctx);
    } catch (e) {
      return modelsPage([], e.message, ctx.version);
    }
  }
  if (typeof document !== "undefined" && document.readyState !== "loading") {
    const root = document.getElementById("app");
    if (root) renderAdmin({ path: location.pathname, version: "1.15.0" }).then((html) => {
      document.open();
      document.write(html);
      document.close();
    });
  }
})();
