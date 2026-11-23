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
  var formCSS = `
:root{--border-color:var(--ui-line);--bg-page:var(--ui-bg);--text-secondary:var(--ui-muted)}
.form-card,.limits-card{background:#fff;border:1px solid var(--ui-line);border-radius:var(--ui-radius);padding:18px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03)}
.form-title,.limits-title{margin:0 0 4px;font-size:18px;font-weight:800}.page-subtitle,.limits-subtitle{margin:0 0 16px;color:var(--ui-muted)}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.form-label{font-size:12px;font-weight:800;color:var(--ui-ink)}
.form-input,.form-select,.form-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.form-textarea{min-height:120px;resize:vertical}.form-hint{font-size:11px;color:var(--ui-muted)}
.form-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.btn,.btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.btn-primary,.btn-submit{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}.btn-secondary{background:#fff}.btn-danger{color:#DC2626;border-color:#FECACA}.btn-small{padding:5px 9px;min-height:30px;font-size:12px}.btn-icon{min-width:30px;padding:5px}
.error-banner,.alert-error{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:10px;padding:11px 14px;margin-bottom:16px}.success-banner,.alert-success{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;border-radius:10px;padding:11px 14px;margin-bottom:16px}
.section-title{font-size:14px;margin:18px 0 10px}.limits-table{width:100%;border-collapse:collapse}.limits-table th,.limits-table td{padding:10px 12px;border-bottom:1px solid var(--ui-line);text-align:left;font-size:13px}.limits-table th{color:var(--ui-muted);font-size:11px}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.model-selector{display:grid;grid-template-columns:1fr 1fr;gap:14px}.model-list{min-height:180px;border:1px solid var(--ui-line);border-radius:10px;padding:12px;background:#FAFCFF}.model-list-title{font-size:13px;margin:0 0 10px}.model-list-empty{color:var(--ui-muted);font-size:12px}.checkbox-list{display:grid;gap:8px}.checkbox-item,.model-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--ui-line);border-radius:8px;background:#fff;font-size:13px}.model-item-name{flex:1}.model-item-desc{color:var(--ui-muted)}.model-actions{display:flex;gap:5px}.selected-index{color:var(--ui-muted);font-family:ui-monospace,monospace}.apikey-display{margin-bottom:14px}.apikey-label{display:block;font-size:12px;font-weight:800;margin-bottom:6px}.apikey-code{display:block;padding:10px;background:#F8FAFC;border:1px solid var(--ui-line);border-radius:8px;word-break:break-all}.apikey-note{font-size:11px;color:var(--ui-muted)}
.heatmap-scroll{overflow-x:auto;padding-bottom:6px}.heatmap-grid{display:flex;gap:3px;min-width:660px}.heatmap-col{display:flex;flex-direction:column;gap:3px;flex:1 1 0;min-width:0}.heatmap-months{display:flex;gap:3px;min-width:660px}.heatmap-months>span{flex:1 1 0;min-width:0;overflow:hidden;white-space:nowrap;color:var(--ui-muted);font-size:11px}.heatmap-cell{display:block;width:100%;aspect-ratio:1/1;border-radius:2px;background:#ebedf0;min-width:0}.heatmap-legend{display:flex;align-items:center;gap:4px;margin-top:10px;color:var(--ui-muted);font-size:11px}.heatmap-legend .heatmap-cell{width:11px;height:11px;flex:none;aspect-ratio:auto}.heatmap-tip{position:fixed;z-index:9999;pointer-events:none;background:#101828;color:#fff;font-size:12px;padding:5px 8px;border-radius:6px;white-space:nowrap;display:none;box-shadow:0 6px 18px rgba(16,24,40,.22)}
@media(max-width:820px){.model-selector{grid-template-columns:1fr}.form-card,.limits-card{padding:14px}.form-actions .btn,.btn-submit{min-height:44px}}
`;
  function shell(opts) {
    const width = opts.width ?? 1180;
    const nav = opts.nav ?? adminNav;
    const links = nav.map((n) => {
      const active = opts.path === n.href || n.href !== "/admin/models" && opts.path.startsWith(n.href + "/") || n.href === "/admin/models" && opts.path.startsWith("/admin/models/");
      return `<a href="${n.href}" class="ui-nav-link${active ? " is-active" : ""}">${n.icon ? `<span class="ui-nav-icon">${n.icon}</span>` : ""}<span>${escapeHtml(n.label)}</span></a>`;
    }).join("");
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)} \xB7 LLM Gateway</title><style>${uiCSS}${formCSS}</style></head><body>
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
    const toggle = `<form method="post" action="/admin/users/toggle"><input type="hidden" name="enabled" value="${enabled ? "false" : "true"}"><button class="ui-btn">${enabled ? "\u7981\u7528\u7528\u6237\u8BA4\u8BC1" : "\u542F\u7528\u7528\u6237\u8BA4\u8BC1"}</button></form>`;
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

  // web/src/views/password.ts
  function passwordPage(hasPassword, error, success, version = "1.15.0") {
    const body = pageHeader({
      eyebrow: "SECURITY",
      title: "\u5BC6\u7801\u8BBE\u7F6E",
      subtitle: "\u8BBE\u7F6E\u6216\u4FEE\u6539\u7BA1\u7406\u540E\u53F0\u767B\u5F55\u5BC6\u7801"
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="/api/admin/password">${hasPassword ? '<div class="form-group"><label class="form-label" for="currentPassword">\u5F53\u524D\u5BC6\u7801</label><input class="form-input" type="password" id="currentPassword" name="currentPassword"></div>' : ""}<div class="form-group"><label class="form-label" for="newPassword">\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="newPassword" name="newPassword"></div><div class="form-group"><label class="form-label" for="confirmPassword">\u786E\u8BA4\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="confirmPassword" name="confirmPassword"></div><div class="form-actions"><button class="btn btn-primary" name="action" value="change">\u4FDD\u5B58\u5BC6\u7801</button>${hasPassword ? '<button class="btn btn-danger" name="action" value="delete">\u5220\u9664\u5BC6\u7801</button>' : ""}</div></form></div><script>document.querySelector('form').addEventListener('submit',async function(e){e.preventDefault();var f=e.target;var a=document.activeElement&&document.activeElement.value||'change';var body={action:a,currentPassword:f.currentPassword?f.currentPassword.value:'',newPassword:f.newPassword.value,confirmPassword:f.confirmPassword.value};var r=await fetch('/api/admin/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});var j=await r.json();if(j.ok){location.reload()}else{alert(j.error&&j.error.message||'\u64CD\u4F5C\u5931\u8D25')}})<\/script>`);
    return shell({ title: "\u5BC6\u7801\u8BBE\u7F6E", path: "/admin/password", body, version });
  }

  // web/src/views/privacy.ts
  function privacyPage(s, detailLogEnabled = false, cliDebug = false, error, success, version = "1.15.0") {
    const body = pageHeader({
      eyebrow: "PRIVACY",
      title: "\u9690\u79C1\u4FDD\u62A4",
      subtitle: "\u63A7\u5236\u65E5\u5FD7\u4E2D\u7684\u654F\u611F\u4FE1\u606F\u5904\u7406"
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form id="privacy-form" method="POST" action="/admin/privacy">${[["enabled", "\u542F\u7528\u9690\u79C1\u4FDD\u62A4"], ["stripUserField", "\u62B9\u6389 user \u5B57\u6BB5"], ["sanitizeFilePaths", "\u6587\u4EF6\u8DEF\u5F84\u7528\u6237\u540D\u66FF\u6362"], ["whitelistFilter", "\u767D\u540D\u5355\u5B57\u6BB5\u8FC7\u6EE4"]].map(([k, label]) => `<div class="form-group"><label><input type="checkbox" name="${k}" ${s[k] ? "checked" : ""}> ${label}</label></div>`).join("")}<div class="form-group"><label class="form-label" for="pathPlaceholder">\u8DEF\u5F84\u5360\u4F4D\u7B26</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value="${s.pathPlaceholder || "USER"}"></div><div class="form-group"><label class="form-label">\u65E5\u5FD7\u8BB0\u5F55</label><label><input type="checkbox" name="detailLogEnabled" ${detailLogEnabled ? "checked" : ""} ${cliDebug ? "disabled" : ""}> \u8BB0\u5F55\u5B8C\u6574\u8BF7\u6C42/\u54CD\u5E94\u65E5\u5FD7</label>${cliDebug ? '<p class="form-hint">\u547D\u4EE4\u884C\u542F\u52A8\u65F6\u4F7F\u7528\u4E86 --debug\uFF0C\u65E5\u5FD7\u8BB0\u5F55\u8BBE\u7F6E\u4E0D\u53EF\u4FEE\u6539</p>' : ""}</div><div class="form-group"><label class="form-label">\u547D\u4EE4\u884C\u8C03\u8BD5\u53C2\u6570</label><code>--debug</code></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u8BBE\u7F6E</button></div></form></div>`);
    return shell({ title: "\u9690\u79C1\u4FDD\u62A4", path: "/admin/privacy", body, version });
  }

  // web/src/views/announcement.ts
  function announcementPage(content, enabled = true, error, success, version = "1.15.0") {
    const body = pageHeader({
      eyebrow: "ANNOUNCEMENT",
      title: "\u516C\u544A\u7BA1\u7406",
      subtitle: "\u8BBE\u7F6E\u7528\u6237\u9875\u9762\u663E\u793A\u7684\u516C\u544A\uFF08\u652F\u6301 Markdown\uFF09"
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="/admin/announcement"><div class="form-group"><label class="form-label" for="content">\u516C\u544A\u5185\u5BB9</label><textarea class="form-textarea" id="content" name="content" rows="12">${escapeHtml(content)}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ${enabled ? "checked" : ""}> \u542F\u7528\u516C\u544A</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u516C\u544A</button></div></form></div>`);
    return shell({ title: "\u516C\u544A\u7BA1\u7406", path: "/admin/announcement", body, version });
  }

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
    const title = isEdit ? "\u7F16\u8F91\u6A21\u578B" : "\u65B0\u589E\u6A21\u578B";
    const form = `<div class="form-card"><form method="post" action="${isEdit ? `/admin/models/edit/${encodeURIComponent(m.customModel)}` : "/admin/models"}">
<div class="form-group"><label class="form-label" for="customModel">\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="customModel" name="customModel" value="${v(m.customModel)}" placeholder="\u4F8B\u5982\uFF1Amy-gpt4" required><span class="form-hint">\u8C03\u7528 API \u65F6\u4F7F\u7528\u6B64\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="realModel">\u5B9E\u9645\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="realModel" name="realModel" value="${v(m.realModel)}" placeholder="\u4F8B\u5982\uFF1Agpt-4" required><span class="form-hint">\u4E0A\u6E38 API \u652F\u6301\u7684\u6A21\u578B\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" required><option value="">\u8BF7\u9009\u62E9...</option>${["openai", "response-api", "anthropic"].map((p) => `<option value="${p}" ${m.provider === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>
<div class="form-group"><label class="form-label" for="baseUrl">Base URL</label><input class="form-input" id="baseUrl" name="baseUrl" value="${v(m.baseUrl)}" placeholder="\u4F8B\u5982\uFF1Ahttps://api.openai.com" required><span class="form-hint">API \u63D0\u4F9B\u5546\u7684\u5730\u5740</span></div>
<div class="form-group"><label class="form-label" for="proxy">\u4EE3\u7406\uFF08\u53EF\u9009\uFF09</label><input class="form-input" id="proxy" name="proxy" value="${v(m.proxy)}" placeholder="http://user:pass@127.0.0.1:7890 \u6216 socks5://127.0.0.1:1080"><span class="form-hint">\u53D1\u5F80\u4E0A\u6E38\u7684\u8BF7\u6C42\u901A\u8FC7\u6B64\u4EE3\u7406\u8F6C\u53D1\uFF0C\u7559\u7A7A\u5219\u76F4\u8FDE\u3002\u652F\u6301 http://\u3001https://\u3001socks5://\uFF08\u53EF\u5E26 user:pass@ \u8BA4\u8BC1\uFF09\uFF1B\u4E0D\u652F\u6301 socks5h:// \u548C socks4://</span></div>
<div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource" onchange="var i=document.getElementById('apiKeyManual');i.disabled=this.value!=='manual';if(i.disabled)i.value=''"><option value="manual"${refName ? "" : " selected"}>\u624B\u52A8\u8F93\u5165</option>${keyOptions}</select><input class="form-input" id="apiKeyManual" name="apiKey" ${refName ? "disabled" : ""} placeholder="${refName ? `\u4F7F\u7528\u5F15\u7528\uFF1A$$${escapeHtml(refName)}$$` : isEdit ? "\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : "\u8BF7\u8F93\u5165 API Key"}"><span class="form-hint">${refName ? `\u5F15\u7528 API Key\u300C${escapeHtml(refName)}\u300D\uFF0C\u4FEE\u6539\u540E\u5C06\u5168\u5C40\u751F\u6548` : "\u53EF\u9009\u62E9\u5DF2\u4FDD\u5B58\u7684 API Key\uFF0C\u6216\u624B\u52A8\u8F93\u5165"}${isEdit ? "\uFF1B\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : ""}</span></div>
<div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><textarea class="form-textarea" id="desc" name="desc" placeholder="\u8BF7\u8F93\u5165\u6A21\u578B\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09">${v(m.desc)}</textarea><span class="form-hint">\u7528\u4E8E\u8BB0\u5F55\u6A21\u578B\u7684\u7528\u9014\u6216\u5907\u6CE8</span></div>
<div class="form-group"><label class="form-label" for="maxContextLength">\u6700\u5927\u4E0A\u4E0B\u6587\u957F\u5EA6</label><input class="form-input" id="maxContextLength" name="maxContextLength" type="number" value="${m.maxContextLength || ""}" placeholder="\u9ED8\u8BA4 200000"><span class="form-hint">\u6A21\u578B\u652F\u6301\u7684\u6700\u5927 token \u6570\uFF0C\u672A\u586B\u5199\u5219\u4F7F\u7528\u9ED8\u8BA4\u503C 200000</span></div>
<div class="form-group"><label class="form-label">\u9ED8\u8BA4\u53C2\u6570 (JSON)</label>${jsonEditor("defaultParams", m.defaultParams ? JSON.stringify(m.defaultParams, null, 2) : "")}</div>
<div class="form-actions"><button type="submit" class="btn btn-primary">\u4FDD\u5B58\u6A21\u578B</button><a href="/admin/models" class="btn btn-secondary">\u53D6\u6D88</a></div></form></div>`;
    const body = pageHeader({ eyebrow: "MODEL", title, subtitle: isEdit ? "\u4FEE\u6539\u6A21\u578B\u914D\u7F6E\u4E0E API Key \u5F15\u7528" : "\u521B\u5EFA\u65B0\u7684\u4E0A\u6E38\u6A21\u578B\u914D\u7F6E", actions: '<a class="ui-btn" href="/admin/models">\u8FD4\u56DE\u6A21\u578B</a>' }) + (error ? notice(error, "error") : "") + panel("\u6A21\u578B\u914D\u7F6E", "", form) + testHtml;
    return shell({ title, path: "/admin/models", body, version });
  }

  // web/src/views/modelLimits.ts
  function modelLimitsPage(model, limits, error, success, version = "1.15.0") {
    const rows = limits.map((l, i) => `<tr><td>${escapeHtml(l.type)}</td><td>${escapeHtml(l.period)}</td><td>${l.periodValue}</td><td>${l.type === "cost" ? l.costMax : l.max}</td><td>${escapeHtml(l.groupName || "")}</td><td>${l.enabled ? "\u542F\u7528" : "\u7981\u7528"}</td><td><div class="actions-cell"><button class="btn btn-small" type="button" onclick="editLimit(${i})">\u7F16\u8F91</button><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/delete/${i}" style="display:inline"><button class="btn btn-small btn-danger" type="submit">\u5220\u9664</button></form></div></td></tr>`).join("");
    const body = pageHeader({
      eyebrow: "MODEL LIMITS",
      title: `\u9650\u5236\u89C4\u5219\u7BA1\u7406 - ${model}`,
      subtitle: "\u8BBE\u7F6E\u6BCF\u5206\u949F/\u6BCF\u5C0F\u65F6\u8BF7\u6C42\u6570\u3001token \u6570\u6216\u8D39\u7528\u9650\u5236",
      actions: '<a class="ui-btn" href="/admin/models">\u8FD4\u56DE\u6A21\u578B</a>'
    }) + (error ? `<div class="error-banner">${escapeHtml(error)}</div>` : "") + (success ? `<div class="success-banner">${escapeHtml(success)}</div>` : "") + panel("\u9650\u5236\u89C4\u5219", "", `<div class="limits-card"><h2 class="limits-title">\u9650\u5236\u89C4\u5219\u7BA1\u7406</h2>${limits.length ? `<table class="limits-table"><thead><tr><th>\u7C7B\u578B</th><th>\u5468\u671F</th><th>\u5468\u671F\u503C</th><th>\u4E0A\u9650</th><th>\u7528\u6237\u7EC4</th><th>\u72B6\u6001</th><th>\u64CD\u4F5C</th></tr></thead><tbody>${rows}</tbody></table>` : empty("\u6682\u65E0\u9650\u5236\u89C4\u5219")}<h3 class="section-title">\u65B0\u589E\u89C4\u5219</h3><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/add"><input type="hidden" name="model" value="${escapeHtml(model)}"><div class="form-grid"><div class="form-group"><label class="form-label" for="type">\u7C7B\u578B</label><select class="form-select" id="type" name="type" onchange="handleTypeChange()"><option value="rpm">\u8BF7\u6C42\u6570/\u5206\u949F</option><option value="tpm">Token/\u5206\u949F</option><option value="cost">\u8D39\u7528</option></select></div><div class="form-group"><label class="form-label" for="period">\u5468\u671F</label><select class="form-select" id="period" name="period" onchange="handlePeriodChange()"><option value="minute">\u5206\u949F</option><option value="hour">\u5C0F\u65F6</option><option value="day">\u5929</option></select></div><div class="form-group"><label class="form-label" for="periodValue">\u5468\u671F\u503C</label><input class="form-input" id="periodValue" name="periodValue" type="number" value="1"></div><div class="form-group" id="maxField"><label class="form-label" for="max">\u4E0A\u9650</label><input class="form-input" id="max" name="max" type="number"></div><div class="form-group" id="costMaxField" style="display:none"><label class="form-label" for="costMax">\u8D39\u7528\u4E0A\u9650</label><input class="form-input" id="costMax" name="costMax" type="number" step="0.01"></div><div class="form-group"><label class="form-label" for="groupName">\u7528\u6237\u7EC4</label><input class="form-input" id="groupName" name="groupName" value="default"></div><div class="form-group"><label><input type="checkbox" id="enabled" name="enabled" value="true" checked> \u542F\u7528</label></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u6DFB\u52A0\u89C4\u5219</button></div></form><h3 class="section-title">\u4FEE\u6539\u89C4\u5219</h3><form id="editForm" method="POST" action=""><div class="form-grid"><div class="form-group"><label class="form-label">\u7D22\u5F15</label><input class="form-input" id="editIndex" name="index" type="number" readonly></div><div class="form-group"><label class="form-label">\u7C7B\u578B</label><select class="form-select" id="editType" name="type"><option value="rpm">rpm</option><option value="tpm">tpm</option><option value="cost">cost</option></select></div><div class="form-group"><label class="form-label">\u5468\u671F</label><select class="form-select" id="editPeriod" name="period"><option value="minute">minute</option><option value="hour">hour</option><option value="day">day</option></select></div><div class="form-group"><label class="form-label">\u5468\u671F\u503C</label><input class="form-input" id="editPeriodValue" name="periodValue" type="number"></div><div class="form-group"><label class="form-label">\u4E0A\u9650</label><input class="form-input" id="editMax" name="max" type="number"></div><div class="form-group"><label class="form-label">\u8D39\u7528\u4E0A\u9650</label><input class="form-input" id="editCostMax" name="costMax" type="number" step="0.01"></div><div class="form-group"><label class="form-label">\u7528\u6237\u7EC4</label><input class="form-input" id="editGroupName" name="groupName"></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u4FEE\u6539</button></div></form></div><script>window.limits=${JSON.stringify(limits).replace(/</g, "\\u003c")};window.handleTypeChange=function(){var t=document.getElementById('type').value;document.getElementById('maxField').style.display=t==='cost'?'none':'block';document.getElementById('costMaxField').style.display=t==='cost'?'block':'none'};window.handlePeriodChange=function(){};window.editLimit=function(i){var l=window.limits[i];document.getElementById('editForm').action='/api/admin/models/${encodeURIComponent(model)}/limits/edit/'+i;document.getElementById('editIndex').value=i;document.getElementById('editType').value=l.type;document.getElementById('editPeriod').value=l.period;document.getElementById('editPeriodValue').value=l.periodValue;document.getElementById('editMax').value=l.max;document.getElementById('editCostMax').value=l.costMax;document.getElementById('editGroupName').value=l.groupName};window.handleTypeChange()<\/script>`);
    return shell({ title: `\u9650\u5236\u89C4\u5219\u7BA1\u7406 - ${model}`, path: "/admin/models", body, version });
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
    const days = Array.isArray(s.dailyHeatmap) ? s.dailyHeatmap : [];
    const maxTokens = Math.max(1, ...days.map((d) => d.totalTokens || 0));
    const levelOf = (t) => t <= 0 ? 0 : t < maxTokens * 0.25 ? 1 : t < maxTokens * 0.5 ? 2 : t < maxTokens * 0.75 ? 3 : 4;
    const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
    const start = /* @__PURE__ */ new Date(`${days[0]?.date || s.heatmapStart || s.startDate}T00:00:00`);
    const leadBlanks = Number.isFinite(start.getTime()) ? start.getDay() : 0;
    const cells = [];
    for (let i = 0; i < leadBlanks; i++) cells.push({ key: `blank-${i}` });
    days.forEach((d) => cells.push({ key: d.date, date: d.date, requests: d.requests, totalTokens: d.totalTokens }));
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const monthLabels = [];
    let lastMonth = "";
    weeks.forEach((week, col) => {
      const first = week.find((c) => c.date);
      if (!first?.date) return;
      const m = first.date.slice(0, 7);
      if (m !== lastMonth) {
        lastMonth = m;
        monthLabels.push({ col, label: `${Number(first.date.slice(5, 7))}\u6708` });
      }
    });
    const totalHeatTokens = days.reduce((sum, d) => sum + (d.totalTokens || 0), 0);
    const rangeText = s.heatmapStart && s.heatmapEnd ? ` \xB7 ${s.heatmapStart} ~ ${s.heatmapEnd}` : "";
    const heatmapHtml = days.length ? `<div class="stats-section-card"><h2 class="stats-section-title">\u{1F5D3}\uFE0F \u6BCF\u65E5 Token \u6D88\u8017</h2><div style="font-size:12px;color:var(--ui-muted);margin-bottom:10px">\u8FC7\u53BB ${days.length} \u5929 \xB7 \u5171 ${formatNumber(totalHeatTokens)} tokens${rangeText}</div><div class="heatmap-scroll"><div class="heatmap-months">${weeks.map((_, col) => {
      const lbl = monthLabels.find((l) => l.col === col);
      return `<span>${lbl ? lbl.label : ""}</span>`;
    }).join("")}</div><div class="heatmap-grid" data-heatmap-grid>${weeks.map((week) => `<div class="heatmap-col">${week.map((c) => c.date ? `<span class="heatmap-cell" data-tip="${escapeHtml(`${c.date} \xB7 ${c.requests || 0} \u6B21\u8BF7\u6C42 \xB7 ${formatNumber(c.totalTokens || 0)} tokens`)}" style="background:${colors[levelOf(c.totalTokens || 0)]}"></span>` : '<span class="heatmap-cell" style="visibility:hidden"></span>').join("")}</div>`).join("")}</div><div class="heatmap-legend"><span>Less</span>${colors.map((c) => `<span class="heatmap-cell" style="background:${c}"></span>`).join("")}<span>More</span><span style="margin-left:8px">\u6DF1\u6D45\u6309\u5F53\u65E5 token \u91CF\u76F8\u5BF9\u6700\u5927\u503C\u5212\u5206</span></div></div></div>` : "";
    const models = Object.entries(s.byModel).map(([m, v]) => `<div class="ui-row" style="padding:8px 0;border-bottom:1px solid var(--ui-line)"><strong>${escapeHtml(m)}</strong><span class="ui-spacer"></span><span class="ui-mono">${formatNumber(v.requests)} \u8BF7\u6C42</span><span class="ui-field-hint">${formatNumber(v.totalTokens)} tokens</span></div>`).join("");
    const detailRows = (s.details || []).map((r) => `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${escapeHtml(r.userName || "-")}</td><td>${escapeHtml(r.customModel)}</td><td>${escapeHtml(r.modelGroup || "\u2014")}</td><td>${r.statusCode}</td><td>${formatDuration(r.durationMs)}</td><td>${r.ttftMs != null ? formatDuration(r.ttftMs) : "\u2014"}</td><td>${r.tps != null ? r.tps.toFixed(1) : "\u2014"}</td><td>${formatNumber(r.completionTokens)}</td></tr>`);
    const filter = `<form method="get" action="/admin/stats" class="ui-row" id="stats-filter-form"><input class="ui-input" style="width:auto" type="date" id="start" name="startDate" value="${s.startDate}"><input class="ui-input" style="width:auto" type="date" id="end" name="endDate" value="${s.endDate}"><input class="ui-input" style="width:150px" name="userName" placeholder="\u7528\u6237" value="${escapeHtml(s.userName || "")}"><input class="ui-input" style="width:180px" name="model" placeholder="\u6A21\u578B" value="${escapeHtml(s.model || "")}"><button class="ui-btn ui-btn-primary">\u67E5\u8BE2</button><button type="button" class="ui-btn" data-days="1">\u4ECA\u5929</button><button type="button" class="ui-btn" data-days="7">7\u5929</button><button type="button" class="ui-btn" data-days="30">30\u5929</button></form>`;
    const body = pageHeader({ eyebrow: "Analytics", title: "\u7EDF\u8BA1 Dashboard", subtitle: `${escapeHtml(s.dateRange)} \xB7 \u5E73\u5747\u5EF6\u8FDF ${formatDuration(s.avgDuration)}` }) + filter + `<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards}</div><div style="height:16px"></div>` + panel("Token \u7528\u91CF", "", `<div class="ui-grid ui-grid-auto">${tokens}</div>`) + heatmapHtml + panel("\u6309\u6A21\u578B\u7EDF\u8BA1", "", models || "\u6682\u65E0\u6570\u636E") + ((s.details || []).length ? `<div class="pagination">${panel("\u6700\u8FD1\u8BF7\u6C42", `${s.details.length} \u6761`, table(["\u65F6\u95F4", "\u7528\u6237", "\u6A21\u578B", "\u5206\u7EC4", "\u72B6\u6001", "\u8017\u65F6", "TTFT", "TPS", "\u8F93\u51FA"], detailRows))}</div>` : "");
    const script = `<script>document.querySelectorAll('[data-days]').forEach(function(b){b.addEventListener('click',function(){var d=parseInt(this.getAttribute('data-days'),10);var end=new Date();var start=new Date(end.getTime()-d*86400000);document.getElementById('start').value=start.toISOString().slice(0,10);document.getElementById('end').value=end.toISOString().slice(0,10);document.getElementById('stats-filter-form').submit()})});(function(){var tip=document.createElement('div');tip.className='heatmap-tip';document.body.appendChild(tip);document.querySelectorAll('[data-heatmap-grid] .heatmap-cell[data-tip]').forEach(function(c){c.addEventListener('mouseenter',function(){tip.textContent=c.getAttribute('data-tip')||'';tip.style.display='block'});c.addEventListener('mousemove',function(e){tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY+12)+'px'});c.addEventListener('mouseleave',function(){tip.style.display='none'})})})()<\/script>`;
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

  // web/src/views/groupForm.ts
  function groupFormPage(group, models, error, success, version = "1.15.0") {
    const isEdit = !!group?.name;
    const title = isEdit ? `\u7F16\u8F91 Model Group - ${group.name}` : "\u65B0\u589E Model Group";
    const selected = Array.isArray(group?.models) ? group.models : [];
    const modelOptions = models.map((m) => typeof m === "string" ? { customModel: m } : m);
    const body = pageHeader({ eyebrow: "MODEL GROUP", title, subtitle: "\u6A21\u578B\u7EC4\u53EF\u4F5C\u4E3A API model \u4F7F\u7528\uFF0C\u6309\u987A\u5E8F\u9009\u62E9\u591A\u4E2A\u6A21\u578B\u5B9E\u73B0 fallback", actions: '<a class="ui-btn" href="/admin/model-groups">\u8FD4\u56DE\u6A21\u578B\u7EC4</a>' }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="${isEdit ? `/admin/model-groups/edit/${encodeURIComponent(group.name)}` : "/admin/model-groups/add"}"><input type="hidden" name="originalName" value="${escapeHtml(group?.name || "")}"><div class="form-group"><label class="form-label" for="name">\u7EC4\u540D</label><input class="form-input" id="name" name="name" value="${escapeHtml(group?.name || "")}" placeholder="\u4F8B\u5982\uFF1Amy-group" required></div><div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><input class="form-input" id="desc" name="desc" value="${escapeHtml(group?.desc || "")}" placeholder="\u53EF\u9009"></div><div class="form-group"><label class="form-label" for="new-model-filter">\u7B5B\u9009\u6A21\u578B</label><input class="form-input" id="new-model-filter" placeholder="\u8F93\u5165\u6A21\u578B\u540D\u8FC7\u6EE4" oninput="filterModels()"></div><div class="model-selector"><div><h3 class="model-list-title">\u53EF\u7528\u6A21\u578B</h3><div class="model-list" id="all-models">${modelOptions.map((m) => `<label class="model-item" data-name="${escapeHtml(m.customModel)}"><input type="checkbox" name="modelCheckbox" value="${escapeHtml(m.customModel)}" onchange="sync()"> <span class="model-item-name">${escapeHtml(m.customModel)}</span><span class="model-item-desc">${escapeHtml(m.desc || "")}</span></label>`).join("")}</div></div><div><h3 class="model-list-title">\u5DF2\u9009\u6A21\u578B\uFF08\u6309\u987A\u5E8F\uFF09</h3><div class="model-list" id="selected-models"></div>${isEdit ? `<div class="model-actions"><a class="btn btn-small" href="/admin/model-groups/edit/${encodeURIComponent(group.name)}/remove-model?model=${encodeURIComponent(selected[0] || "")}">\u79FB\u9664\u9996\u4E2A\u6A21\u578B</a></div>` : ""}</div></div><input name="models" type="hidden" value='${JSON.stringify(selected)}'><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u6A21\u578B\u7EC4</button><a class="btn btn-secondary" href="/admin/model-groups">\u53D6\u6D88</a></div></form></div><script>window.groupModels=${JSON.stringify(selected).replace(/</g, "\\u003c")};window.sync=function(){var selected=Array.prototype.slice.call(document.querySelectorAll('input[name="modelCheckbox"]')).filter(function(i){return i.checked}).map(function(i){return i.value});document.querySelector('input[name="models"]').value=JSON.stringify(selected);window.groupModels=selected;renderSelected()};window.renderSelected=function(){var box=document.getElementById('selected-models');if(!box)return;box.innerHTML=window.groupModels.map(function(n,i){return '<div class="model-item"><span class="selected-index">'+(i+1)+'</span><span class="model-item-name">'+n+'</span><button type="button" class="btn btn-small btn-danger" onclick="removeModel('+i+')">\u79FB\u9664</button></div>'}).join('')||'<p class="model-list-empty">\u5C1A\u672A\u9009\u62E9\u6A21\u578B</p>'};window.removeModel=function(i){window.groupModels.splice(i,1);Array.prototype.slice.call(document.querySelectorAll('input[name="modelCheckbox"]')).forEach(function(c){c.checked=window.groupModels.indexOf(c.value)!==-1});window.sync()};window.filterModels=function(){var q=(document.getElementById('new-model-filter').value||'').toLowerCase();Array.prototype.slice.call(document.querySelectorAll('#all-models .model-item')).forEach(function(el){el.style.display=el.dataset.name.toLowerCase().indexOf(q)!==-1?'':'none'})};window.renderSelected()<\/script>`);
    return shell({ title, path: "/admin/model-groups", body, version });
  }

  // web/src/views/userForm.ts
  function userFormPage(user, allModels, error, success, version = "1.15.0") {
    const isEdit = !!user?.name;
    const title = isEdit ? "\u7F16\u8F91\u7528\u6237" : "\u65B0\u589E\u7528\u6237";
    const groups = Array.isArray(user?.allowedModels) ? user.allowedModels : Array.isArray(user?.groups) ? user.groups : [];
    const modelOptions = allModels.map((g) => typeof g === "string" ? { name: g, desc: "" } : g);
    const body = pageHeader({ eyebrow: "USER", title, subtitle: isEdit ? `\u7528\u6237\uFF1A${user?.name || ""}` : "\u521B\u5EFA\u7528\u6237\u5E76\u5206\u914D\u7528\u6237\u7EC4", actions: '<a class="ui-btn" href="/admin/users">\u8FD4\u56DE\u7528\u6237\u5217\u8868</a>' }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="${isEdit ? `/admin/users/edit/${encodeURIComponent(user.name)}` : "/admin/users/add"}"><div class="form-group"><label class="form-label" for="name">\u7528\u6237\u540D</label><input class="form-input" id="name" name="name" value="${escapeHtml(user?.name || "")}" ${isEdit ? "readonly" : ""}></div><div class="form-group"><label class="form-label" for="description">\u63CF\u8FF0</label><input class="form-input" id="description" name="description" value="${escapeHtml(user?.description || "")}"></div><div class="form-group"><label class="form-label" for="apiKey">API Key</label><input class="form-input" id="apiKey" name="apiKey" value="${escapeHtml(user?.apikey || user?.apiKey || "")}" placeholder="\u7559\u7A7A\u81EA\u52A8\u751F\u6210"></div><div class="form-group"><label class="form-label">\u6A21\u578B\u6743\u9650</label><div class="checkbox-list">${modelOptions.map((g) => `<label class="checkbox-item"><input type="checkbox" name="allowedModels" value="${escapeHtml(g.name)}" ${groups.includes(g.name) ? "checked" : ""}> ${escapeHtml(g.name)} <span class="model-item-desc">${escapeHtml(g.desc || "")}</span></label>`).join("")}<span class="form-hint">\u4E0D\u9009\u62E9\u4EFB\u4F55\u6A21\u578B\u8868\u793A\u4E0D\u9650\u5236</span></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u7528\u6237</button><a class="btn btn-secondary" href="/admin/users">\u53D6\u6D88</a></div></form></div>`);
    return shell({ title, path: "/admin/users", body, version });
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
        dailyHeatmap: d.dailyHeatmap || [],
        heatmapStart: d.heatmapStart || "",
        heatmapEnd: d.heatmapEnd || "",
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
