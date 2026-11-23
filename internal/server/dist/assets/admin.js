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

  // web/src/styles/admin_models.ts
  var css = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --danger-color: #ef4444;\n            --danger-bg: #fef2f2;\n            --success-color: #10b981;\n            --success-bg: #f0fdf4;\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);\n            --shadow-lg: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          /* Header */\n          .page-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 2rem;\n            flex-wrap: wrap;\n            gap: 1rem;\n          }\n          .page-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.85rem;\n            letter-spacing: -0.03em;\n            color: var(--text-primary);\n          }\n          .page-subtitle {\n            color: var(--text-secondary);\n            font-size: 0.95rem;\n            margin-top: 0.3rem;\n          }\n          .btn-group {\n            display: flex;\n            gap: 0.75rem;\n            flex-wrap: wrap;\n          }\n\n          /* Buttons */\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n            letter-spacing: -0.01em;\n          }\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n          .btn-secondary:hover {\n            transform: translateY(-2px);\n            box-shadow: var(--shadow-md);\n          }\n          .btn-icon {\n            width: 32px;\n            height: 32px;\n            padding: 0;\n            justify-content: center;\n            border-radius: 50%;\n            font-size: 0.85rem;\n          }\n          .btn-sm {\n            padding: 0.4rem 0.75rem;\n            font-size: 0.8rem;\n            font-weight: 500;\n          }\n          .btn-danger {\n            background: var(--danger-bg);\n            color: var(--danger-color);\n            border: 1px solid #fecaca;\n          }\n          .btn-danger:hover {\n            background: var(--danger-color);\n            color: #fff;\n            border-color: var(--danger-color);\n          }\n\n          /* Error banner */\n          .error-banner {\n            background: var(--danger-bg);\n            border: 1px solid #fecaca;\n            color: var(--danger-color);\n            padding: 1rem 1.25rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n\n          /* Empty state */\n          .empty-state {\n            text-align: center;\n            padding: 4rem 2rem;\n            background: var(--bg-card);\n            border-radius: var(--radius);\n            border: 1px dashed var(--border-color);\n          }\n          .empty-state-icon {\n            width: 72px;\n            height: 72px;\n            margin: 0 auto 1.5rem;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 1.8rem;\n            color: var(--accent-color);\n          }\n          .empty-state h3 {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-size: 1.2rem;\n            margin-bottom: 0.5rem;\n          }\n          .empty-state p {\n            color: var(--text-secondary);\n            margin-bottom: 1.5rem;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u5217\u8868\u8868\u683C \u2500\u2500\u2500\u2500\u2500 */\n          .models-table-wrapper {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            overflow: hidden;\n            animation: fadeUp 0.6s ease-out both;\n          }\n\n          .models-table {\n            width: 100%;\n            border-collapse: collapse;\n          }\n\n          .models-table thead {\n            background: #fafbfc;\n            border-bottom: 1px solid var(--border-color);\n          }\n\n          .models-table th {\n            padding: 0.75rem 1rem;\n            font-size: 0.78rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n            text-align: left;\n            text-transform: uppercase;\n            letter-spacing: 0.04em;\n            white-space: nowrap;\n          }\n\n          .models-table td {\n            padding: 0.85rem 1rem;\n            font-size: 0.88rem;\n            border-bottom: 1px solid #f3f4f6;\n            vertical-align: middle;\n          }\n\n          .models-table tbody tr:last-child td {\n            border-bottom: none;\n          }\n\n          .models-table tbody tr {\n            transition: background 0.2s ease;\n          }\n\n          .models-table tbody tr:hover {\n            background: #fafbfc;\n          }\n\n          .model-name-cell {\n            display: flex;\n            flex-direction: column;\n            gap: 0.15rem;\n          }\n\n          .model-custom-name {\n            font-weight: 600;\n            font-family: system-ui, -apple-system, sans-serif;\n            color: var(--text-primary);\n            font-size: 0.92rem;\n          }\n\n          .model-real-name {\n            font-size: 0.8rem;\n            color: var(--text-secondary);\n          }\n\n          .model-desc-cell {\n            max-width: 280px;\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n            color: var(--text-secondary);\n            font-size: 0.84rem;\n          }\n\n          .actions-cell {\n            display: flex;\n            gap: 0.4rem;\n            align-items: center;\n            flex-wrap: nowrap;\n          }\n\n          .order-btn {\n            min-width: 26px;\n            height: 26px;\n            padding: 0 4px;\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            border: 1px solid var(--border-color);\n            border-radius: 5px;\n            background: var(--bg-card);\n            color: var(--text-secondary);\n            cursor: pointer;\n            font-size: 0.75rem;\n            font-weight: 600;\n            transition: all 0.2s;\n            flex-shrink: 0;\n          }\n\n          .order-btn:hover:not(:disabled) {\n            border-color: var(--accent-color);\n            color: var(--accent-color);\n          }\n\n          .order-btn.is-hidden {\n            background: #fef3c7;\n            border-color: #f59e0b;\n            color: #d97706;\n          }\n          .order-btn.is-hidden:hover {\n            background: #f59e0b;\n            color: #fff;\n          }\n\n          .order-btn:disabled {\n            opacity: 0.3;\n            cursor: not-allowed;\n          }\n\n          .index-badge {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            width: 24px;\n            height: 24px;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            color: var(--accent-color);\n            font-size: 0.75rem;\n            font-weight: 600;\n            flex-shrink: 0;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 Animations \u2500\u2500\u2500\u2500\u2500 */\n          @keyframes fadeUp {\n            from { opacity: 0; transform: translateY(20px); }\n            to { opacity: 1; transform: translateY(0); }\n          }\n          @keyframes slideDown {\n            from { opacity: 0; transform: translateY(-10px); }\n            to { opacity: 1; transform: translateY(0); }\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 Responsive \u2500\u2500\u2500\u2500\u2500 */\n          @media (max-width: 768px) {\n            .main-content {\n              padding: 1.5rem 1rem 3rem !important;\n            }\n            .page-header {\n              flex-direction: column;\n              align-items: flex-start;\n            }\n            .page-title {\n              font-size: 1.5rem;\n            }\n            .models-table-wrapper {\n              overflow-x: auto;\n            }\n            .models-table {\n              min-width: 700px;\n            }\n          }\n        `}";

  // web/src/styles/admin_topbar.ts
  var css2 = "\n        :root {\n          --bg-page: #f8f9fb;\n          --bg-card: #ffffff;\n          --text-primary: #1a1d26;\n          --text-secondary: #646a7e;\n          --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n          --accent-color: hsl(245 80% 58%);\n          --border-color: #e5e7eb;\n          --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n        }\n\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n\n        body {\n          font-family: system-ui, -apple-system, sans-serif;\n          background: var(--bg-page);\n          color: var(--text-primary);\n          line-height: 1.6;\n          min-height: 100vh;\n        }\n\n        /* \u2500\u2500\u2500\u2500\u2500 \u9876\u90E8\u5BFC\u822A \u2500\u2500\u2500\u2500\u2500 */\n        .topbar {\n          background: var(--bg-card);\n          border-bottom: 1px solid var(--border-color);\n          position: sticky;\n          top: 0;\n          z-index: 100;\n          backdrop-filter: blur(12px);\n          background: rgba(255,255,255,0.88);\n        }\n        .topbar-inner {\n          max-width: 1280px;\n          margin: 0 auto;\n          padding: 0 2rem;\n          display: flex;\n          align-items: center;\n          justify-content: space-between;\n          height: 64px;\n        }\n        .topbar-brand {\n          font-family: system-ui, -apple-system, sans-serif;\n          font-weight: 700;\n          font-size: 1.2rem;\n          background: var(--accent-gradient);\n          -webkit-background-clip: text;\n          -webkit-text-fill-color: transparent;\n          text-decoration: none;\n          letter-spacing: -0.02em;\n        }\n        .topbar-nav {\n          display: flex;\n          gap: 0.25rem;\n          list-style: none;\n        }\n        .topbar-nav a {\n          text-decoration: none;\n          color: var(--text-secondary);\n          font-weight: 500;\n          font-size: 0.9rem;\n          padding: 0.5rem 0.85rem;\n          border-radius: 8px;\n        }\n        .topbar-nav a:hover {\n          color: var(--accent-color);\n          background: hsl(245 80% 96%);\n        }\n        .topbar-nav a.active {\n          color: var(--accent-color);\n          background: hsl(245 80% 94%);\n        }\n\n        @keyframes fadeUp {\n          from { opacity: 0; transform: translateY(20px); }\n          to { opacity: 1; transform: translateY(0); }\n        }\n\n        @media (max-width: 768px) {\n          .topbar-inner {\n            flex-direction: column;\n            height: auto;\n            padding: 0.75rem 1rem;\n            gap: 0.5rem;\n          }\n          .topbar-nav {\n            flex-wrap: wrap;\n            justify-content: center;\n          }\n          .main-content {\n            padding: 1.5rem 1rem 3rem !important;\n          }\n        }\n      ";

  // web/src/styles/console.ts
  var consoleCSS = `
:root{
  --gw-bg:#0B0F14; --gw-panel:#111821; --gw-line:#1F2A37;
  --gw-ink:#E6EDF3; --gw-muted:#7D8DA1; --gw-signal:#2DD4BF; --gw-warn:#F59E0B;
  color-scheme:dark;
}
html,body{margin:0;padding:0;background:var(--gw-bg)!important;color:var(--gw-ink)!important}
body{font-family:Inter,"Noto Sans SC",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--gw-signal)}
:focus-visible{outline:2px solid var(--gw-signal);outline-offset:3px}

.topbar{
  position:sticky;top:0;z-index:100;background:rgba(11,15,20,.92)!important;
  border-bottom:1px solid var(--gw-line)!important;backdrop-filter:blur(14px);
}
.topbar-inner{
  max-width:1180px!important;margin:0 auto!important;height:auto!important;
  min-height:64px;padding:12px 20px!important;gap:16px;
  display:flex;align-items:center;justify-content:space-between;
}
.topbar-brand{
  font-family:"IBM Plex Mono",ui-monospace,monospace!important;
  font-size:1rem!important;letter-spacing:-.02em!important;color:var(--gw-ink)!important;
  background:none!important;-webkit-text-fill-color:var(--gw-ink)!important;
  display:flex;align-items:center;gap:10px;white-space:nowrap;
}
.topbar-brand::before{content:"\u25C8";color:var(--gw-signal);font-size:1.25rem}
.topbar-nav{
  display:flex;gap:4px;list-style:none;margin:0;padding:0;
  overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;
}
.topbar-nav::-webkit-scrollbar{display:none}
.topbar-nav a{
  font-family:Inter,"Noto Sans SC",system-ui,sans-serif!important;
  font-size:.82rem!important;font-weight:600!important;color:var(--gw-muted)!important;
  padding:8px 12px!important;border-radius:8px;white-space:nowrap;
  background:transparent!important;border:1px solid transparent!important;
}
.topbar-nav a:hover{color:var(--gw-ink)!important;background:#151E29!important}
.topbar-nav a.active{
  color:var(--gw-signal)!important;background:rgba(45,212,191,.08)!important;
  border-color:rgba(45,212,191,.28)!important;
}

.main-content{
  max-width:1180px!important;margin:0 auto!important;
  padding:32px 20px 64px!important;
}
.main-content>*:first-child{margin-top:0}
.main-content h1,.main-content h2,.main-content h3{color:var(--gw-ink)!important;letter-spacing:-.01em}
.main-content .stat-card,.main-content .stats-card,.main-content .stat-mini,
.main-content .section-card,.main-content .card,.main-content .form-card{
  background:var(--gw-panel)!important;border:1px solid var(--gw-line)!important;
  border-radius:12px!important;box-shadow:0 12px 30px rgba(0,0,0,.18)!important;
}
.main-content table{
  border-collapse:separate!important;border-spacing:0!important;width:100%;
  display:block;overflow-x:auto;white-space:nowrap;
}
.main-content table th,.main-content table td{
  border-bottom:1px solid var(--gw-line)!important;color:var(--gw-ink)!important;
  font-size:.85rem!important;padding:10px 12px!important;
}
.main-content table th{
  background:#151E29!important;color:var(--gw-muted)!important;
  font-family:"IBM Plex Mono",ui-monospace,monospace!important;
  font-weight:600!important;text-transform:uppercase;letter-spacing:.06em;
}
.main-content input,.main-content select,.main-content textarea{
  background:#0E151E!important;border:1px solid var(--gw-line)!important;
  color:var(--gw-ink)!important;border-radius:8px!important;
}
.main-content input:focus,.main-content select:focus,.main-content textarea:focus{
  border-color:var(--gw-signal)!important;outline:none;
}
.main-content button,.main-content .btn{
  font-family:Inter,"Noto Sans SC",system-ui,sans-serif!important;
  min-height:36px;
}
.main-content .btn-primary{
  background:var(--gw-signal)!important;color:#06231F!important;border-color:var(--gw-signal)!important;
  font-weight:700!important;
}
.main-content .model-tag,.main-content .badge{
  font-family:"IBM Plex Mono",ui-monospace,monospace!important;
  border:1px solid var(--gw-line)!important;background:#151E29!important;color:var(--gw-muted)!important;
}

.login-card{
  background:var(--gw-panel)!important;border:1px solid var(--gw-line)!important;
  border-radius:14px!important;box-shadow:0 20px 50px rgba(0,0,0,.35)!important;
  color:var(--gw-ink)!important;margin:8vh auto!important;padding:32px!important;
  max-width:420px!important;width:calc(100% - 28px)!important;
}
.login-card h1,.login-title{color:var(--gw-ink)!important;font-family:"IBM Plex Mono",ui-monospace,monospace!important}
.login-card .form-input,.login-card input[type=password]{
  background:#0E151E!important;border:1px solid var(--gw-line)!important;color:var(--gw-ink)!important;
  border-radius:8px!important;padding:10px 12px!important;min-height:44px;
}
.login-card .btn-primary{background:var(--gw-signal)!important;color:#06231F!important;border:0!important;font-weight:700!important;min-height:44px}

/* Signature: one quiet oscilloscope rail on metric cards. */
.main-content .stat-card,.main-content .stats-card,.main-content .stat-mini{position:relative;overflow:hidden}
.main-content .stat-card::before,.main-content .stats-card::before,.main-content .stat-mini::before{
  content:"";position:absolute;left:0;top:0;bottom:0;width:2px;
  background:linear-gradient(180deg,transparent,var(--gw-signal),transparent);
  opacity:.8;
}

@media (max-width:768px){
  .topbar{position:relative}
  .topbar-inner{flex-direction:column;align-items:stretch;gap:8px;padding:10px 14px!important}
  .topbar-nav{width:100%;padding-bottom:2px}
  .topbar-nav li{flex:0 0 auto}
  .topbar-nav a{padding:9px 12px!important;font-size:.8rem!important}
  .main-content{padding:20px 14px 48px!important}
  .main-content [class*="grid"],.main-content .stats-grid{
    display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;
  }
  .main-content form{max-width:100%!important}
  .main-content button,.main-content .btn{min-height:44px}
  .main-content table th,.main-content table td{padding:9px 10px!important}
  .main-content table th:first-child,.main-content table td:first-child{
    position:sticky;left:0;background:var(--gw-panel)!important;z-index:2;
  }
  .main-content table th:first-child{background:#151E29!important}
}
@media (max-width:420px){
  .main-content [class*="grid"],.main-content .stats-grid{grid-template-columns:1fr!important}
  .login-card{margin:4vh auto!important;padding:24px 18px!important}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
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
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)} - LLM Gateway</title><style>${css2}</style><style>${extraStyle}</style><style>${consoleCSS}</style></head><body>${topbar(activePath)}<main class="main-content" style="padding: 2.5rem 2rem 4rem; max-width: 1280px; margin: 0 auto; animation: fadeUp 0.6s ease-out both;">${body}<div style="text-align:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border-color);font-size:0.75rem;color:var(--text-secondary)">v${version}</div></main>${script}</body></html>`;
  }

  // web/src/views/models.ts
  function modelsPage(models, error, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u6A21\u578B\u7BA1\u7406</h1><p class="page-subtitle">\u914D\u7F6E\u548C\u7BA1\u7406\u6240\u6709\u4E0A\u6E38\u6A21\u578B\u4FE1\u606F\uFF0C\u8C03\u6574\u987A\u5E8F\u53CA\u589E\u51CF\u6A21\u578B\u3002</p></div><div class="btn-group"><a href="/admin/model-groups" class="btn btn-secondary">Model Groups</a><a href="/admin/models/new" class="btn btn-primary">+ \u65B0\u589E\u6A21\u578B</a></div></div>
${error ? `<div class="error-banner"><strong>\u9519\u8BEF\uFF1A</strong> ${escapeHtml(error)}</div>` : ""}
${models.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">\u2699</div><h3>\u6682\u65E0\u6A21\u578B\u914D\u7F6E</h3><p>\u70B9\u51FB "\u65B0\u589E\u6A21\u578B" \u6DFB\u52A0\u4F60\u7684\u7B2C\u4E00\u4E2A\u6A21\u578B\u3002</p><a href="/admin/models/new" class="btn btn-primary">\u65B0\u589E\u6A21\u578B</a></div>` : `<div class="models-table-wrapper"><table class="models-table"><thead><tr><th style="width: 50px;">#</th><th>\u6A21\u578B\u540D\u79F0</th><th>\u63CF\u8FF0</th><th style="min-width: 280px;">\u64CD\u4F5C</th></tr></thead><tbody>${models.map((m, i) => `<tr style="${m.hidden ? "opacity:0.5;background:#f9fafb" : ""}"><td><span class="index-badge">${i + 1}</span></td><td><div class="model-name-cell"><span class="model-custom-name">${escapeHtml(m.customModel)}</span><span class="model-real-name">\u2192 ${escapeHtml(m.realModel)}</span></div></td><td class="model-desc-cell">${escapeHtml(m.desc || "\u2014")}</td><td><div class="actions-cell"><button type="button" class="order-btn" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="up" ${i === 0 ? "disabled" : ""} title="\u4E0A\u79FB">\u2191</button><button type="button" class="order-btn" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="down" ${i === models.length - 1 ? "disabled" : ""} title="\u4E0B\u79FB">\u2193</button><button type="button" class="order-btn ${m.hidden ? "is-hidden" : ""}" data-toggle-url="/admin/models/toggle-hidden/${encodeURIComponent(m.customModel)}" title="${m.hidden ? "\u663E\u793A" : "\u9690\u85CF"}">${m.hidden ? "\u663E\u793A" : "\u9690\u85CF"}</button><button type="button" class="btn btn-secondary btn-sm" data-copy-url="/admin/models/copy/${encodeURIComponent(m.customModel)}" title="\u590D\u5236">\u590D\u5236</button><a href="/admin/models/edit/${encodeURIComponent(m.customModel)}" class="btn btn-secondary btn-sm" title="\u7F16\u8F91">\u7F16\u8F91</a><a href="/admin/models/${encodeURIComponent(m.customModel)}/limits" class="btn btn-secondary btn-sm" title="\u7BA1\u7406\u9650\u5236">\u9650\u5236</a><button type="button" class="btn btn-sm btn-danger" data-delete-url="/admin/models/delete/${encodeURIComponent(m.customModel)}" title="\u5220\u9664">\xD7</button></div></td></tr>`).join("")}</tbody></table></div>`}`;
    const script = `<script>(function(){document.querySelectorAll('button[data-delete-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-delete-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('\u786E\u5B9A\u8981\u5220\u9664\u6A21\u578B "'+n+'" \u5417\uFF1F')){var f=document.createElement('form');f.method='POST';f.action=url;document.body.appendChild(f);f.submit();}})});document.querySelectorAll('button[data-move-url]').forEach(function(btn){btn.addEventListener('click',function(){var f=document.createElement('form');f.method='POST';f.action=this.getAttribute('data-move-url')+'?direction='+this.getAttribute('data-direction');document.body.appendChild(f);f.submit();})});document.querySelectorAll('button[data-copy-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-copy-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('\u786E\u5B9A\u8981\u590D\u5236\u6A21\u578B "'+n+'" \u5417\uFF1F\\n\u590D\u5236\u540E\u540D\u79F0\u5C06\u6DFB\u52A0\u65F6\u95F4\u6233\u540E\u7F00\u3002')){var f=document.createElement('form');f.method='POST';f.action=url;document.body.appendChild(f);f.submit();}})});document.querySelectorAll('button[data-toggle-url]').forEach(function(btn){btn.addEventListener('click',function(){var f=document.createElement('form');f.method='POST';f.action=this.getAttribute('data-toggle-url');document.body.appendChild(f);f.submit();})})})();<\/script>`;
    return adminPage("\u6A21\u578B\u7BA1\u7406", "/admin/models", body, css, version, script);
  }

  // web/src/styles/admin_model_groups.ts
  var css3 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --danger-color: #ef4444;\n            --danger-bg: #fef2f2;\n            --success-color: #10b981;\n            --success-bg: #f0fdf4;\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);\n            --shadow-lg: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          /* Header */\n          .page-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 2rem;\n            flex-wrap: wrap;\n            gap: 1rem;\n          }\n          .page-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.85rem;\n            letter-spacing: -0.03em;\n            color: var(--text-primary);\n          }\n          .page-subtitle {\n            color: var(--text-secondary);\n            font-size: 0.95rem;\n            margin-top: 0.3rem;\n          }\n          .btn-group {\n            display: flex;\n            gap: 0.75rem;\n            flex-wrap: wrap;\n          }\n\n          /* Buttons */\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n            letter-spacing: -0.01em;\n          }\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n          .btn-sm {\n            padding: 0.45rem 0.85rem;\n            font-size: 0.82rem;\n          }\n          .btn-icon {\n            width: 32px;\n            height: 32px;\n            padding: 0;\n            justify-content: center;\n            border-radius: 50%;\n            font-size: 0.85rem;\n          }\n\n          /* Banner */\n          .success-banner {\n            background: var(--success-bg);\n            border: 1px solid #bbf7d0;\n            color: #166534;\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n          .error-banner {\n            background: var(--danger-bg);\n            border: 1px solid #fecaca;\n            color: var(--danger-color);\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n\n          /* Empty state */\n          .empty-state {\n            text-align: center;\n            padding: 4rem 2rem;\n            background: var(--bg-card);\n            border-radius: var(--radius);\n            border: 1px dashed var(--border-color);\n          }\n          .empty-state-icon {\n            width: 72px;\n            height: 72px;\n            margin: 0 auto 1.5rem;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 1.8rem;\n            color: var(--accent-color);\n          }\n          .empty-state h3 {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-size: 1.2rem;\n            margin-bottom: 0.5rem;\n          }\n          .empty-state p {\n            color: var(--text-secondary);\n            margin-bottom: 1.5rem;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u5361\u7247\u7F51\u683C \u2500\u2500\u2500\u2500\u2500 */\n          .groups-grid {\n            display: grid;\n            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));\n            gap: 1.25rem;\n          }\n\n          @media (max-width: 480px) {\n            .groups-grid {\n              grid-template-columns: 1fr;\n            }\n          }\n\n          .group-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 1.75rem;\n            position: relative;\n            overflow: hidden;\n          }\n          .group-card::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            height: 3px;\n            background: var(--accent-gradient);\n          }\n          .group-card:hover {\n            box-shadow: var(--shadow-lg);\n            border-color: transparent;\n          }\n          .group-card:hover::before {\n            opacity: 1;\n          }\n\n          /* Card header */\n          .group-card-header {\n            display: flex;\n            align-items: flex-start;\n            justify-content: space-between;\n            gap: 1rem;\n            margin-bottom: 1rem;\n          }\n          .group-info {\n            flex: 1;\n          }\n          .group-icon {\n            width: 40px;\n            height: 40px;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 1.1rem;\n            color: var(--accent-color);\n            flex-shrink: 0;\n          }\n          .group-name {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 600;\n            font-size: 1.15rem;\n            color: var(--text-primary);\n            letter-spacing: -0.02em;\n          }\n          .group-models-count {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.35rem;\n            background: var(--success-bg);\n            color: var(--success-color);\n            padding: 0.3rem 0.7rem;\n            border-radius: 6px;\n            font-size: 0.78rem;\n            font-weight: 600;\n            margin-top: 0.5rem;\n          }\n          .group-actions {\n            display: flex;\n            gap: 0.4rem;\n            flex-shrink: 0;\n          }\n\n          /* Description */\n          .group-desc {\n            margin-top: 0.85rem;\n            font-size: 0.85rem;\n            color: var(--text-secondary);\n            line-height: 1.5;\n            padding-top: 0.85rem;\n            border-top: 1px solid var(--border-color);\n          }\n\n          /* Action buttons row */\n          .group-card-actions {\n            display: flex;\n            gap: 0.5rem;\n            margin-top: 1rem;\n            padding-top: 1rem;\n            border-top: 1px solid var(--border-color);\n          }\n          .group-card-actions .btn {\n            flex: 1;\n            justify-content: center;\n          }\n          .btn-delete {\n            background: var(--danger-bg);\n            color: var(--danger-color);\n          }\n          .btn-delete:hover {\n            background: var(--danger-color);\n            color: #fff;\n          }\n\n          /* Models list in card */\n          .models-list {\n            margin-top: 0.85rem;\n            display: flex;\n            flex-wrap: wrap;\n            gap: 0.4rem;\n          }\n          .model-tag {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.35rem;\n            background: var(--bg-page);\n            border: 1px solid var(--border-color);\n            color: var(--text-secondary);\n            padding: 0.25rem 0.6rem;\n            border-radius: 5px;\n            font-size: 0.75rem;\n            text-decoration: none;\n            font-weight: 500;\n          }\n\n          @media (max-width: 768px) {\n            .page-title { font-size: 1.5rem; }\n            .page-header { flex-direction: column; align-items: flex-start; }\n          }\n        `}";

  // web/src/views/groups.ts
  function groupsPage(groups, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">Model Groups</h1><p class="page-subtitle">\u7BA1\u7406\u6A21\u578B\u5206\u7EC4\u914D\u7F6E</p></div><div class="btn-group"><a href="/admin/models" class="btn btn-secondary">\u2190 \u8FD4\u56DE\u6A21\u578B\u5217\u8868</a><a href="/admin/model-groups/new" class="btn btn-primary">+ \u65B0\u5EFA\u5206\u7EC4</a></div></div>
${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ""}${success ? `<div class="success-banner">${escapeHtml(success)}</div>` : ""}
${groups.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">\u{1F4E6}</div><h3>\u6682\u65E0 Model Group</h3><a href="/admin/model-groups/new" class="btn btn-primary">\u65B0\u5EFA\u5206\u7EC4</a></div>` : `<div class="groups-grid">${groups.map((g) => `<div class="group-card"><div class="group-card-header"><div class="group-info"><div class="group-icon">\u{1F4E6}</div><div><div class="group-name">${escapeHtml(g.name)}</div><div class="group-models-count">${g.models.length} \u4E2A\u6A21\u578B</div></div></div><div class="group-actions"><a href="/admin/model-groups/edit/${encodeURIComponent(g.name)}" class="btn btn-icon btn-secondary" title="\u7F16\u8F91">\u270F\uFE0F</a></div></div>${g.desc ? `<div class="group-desc">${escapeHtml(g.desc)}</div>` : ""}<div class="models-list">${g.models.slice(0, 5).map((m) => `<a class="model-tag" href="/admin/models/edit/${encodeURIComponent(m)}" title="\u7F16\u8F91\u6A21\u578B">${escapeHtml(m)}</a>`).join("")}${g.models.length > 5 ? `<span class="model-tag">+${g.models.length - 5}</span>` : ""}</div><div class="group-card-actions"><a href="/admin/model-groups/edit/${encodeURIComponent(g.name)}" class="btn btn-secondary btn-sm">\u7BA1\u7406\u6A21\u578B</a><form method="POST" action="/admin/model-groups/delete/${encodeURIComponent(g.name)}" style="display:inline"><button type="submit" class="btn btn-sm btn-delete">\u5220\u9664</button></form></div></div>`).join("")}</div>`}`;
    return adminPage("Model Groups", "/admin/model-groups", body, css3, version);
  }

  // web/src/styles/admin_users.ts
  var css4 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --danger-color: #ef4444;\n            --danger-bg: #fef2f2;\n            --success-color: #10b981;\n            --success-bg: #f0fdf4;\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);\n            --shadow-lg: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          /* Header */\n          .page-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 2rem;\n            flex-wrap: wrap;\n            gap: 1rem;\n          }\n          .page-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.85rem;\n            letter-spacing: -0.03em;\n            color: var(--text-primary);\n          }\n          .page-subtitle {\n            color: var(--text-secondary);\n            font-size: 0.95rem;\n            margin-top: 0.3rem;\n          }\n          .btn-group {\n            display: flex;\n            gap: 0.75rem;\n            flex-wrap: wrap;\n          }\n\n          /* Buttons */\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n            letter-spacing: -0.01em;\n          }\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n          .btn-sm {\n            padding: 0.45rem 0.85rem;\n            font-size: 0.82rem;\n          }\n          .btn-icon {\n            width: 32px;\n            height: 32px;\n            padding: 0;\n            justify-content: center;\n            border-radius: 50%;\n            font-size: 0.85rem;\n          }\n          .btn-danger {\n            background: var(--danger-color);\n            color: #fff;\n          }\n          .btn-danger:hover {\n            background: #dc2626;\n          }\n\n          /* Error banner */\n          .error-banner {\n            background: var(--danger-bg);\n            border: 1px solid #fecaca;\n            color: var(--danger-color);\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n\n          /* Auth status banner */\n          .auth-banner {\n            background: var(--success-bg);\n            border: 1px solid #bbf7d0;\n            color: #166534;\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n          .auth-banner--disabled {\n            background: var(--danger-bg);\n            border-color: #fecaca;\n            color: var(--danger-color);\n          }\n\n          /* Empty state */\n          .empty-state {\n            text-align: center;\n            padding: 4rem 2rem;\n            background: var(--bg-card);\n            border-radius: var(--radius);\n            border: 1px dashed var(--border-color);\n          }\n          .empty-state-icon {\n            width: 72px;\n            height: 72px;\n            margin: 0 auto 1.5rem;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 1.8rem;\n            color: var(--accent-color);\n          }\n          .empty-state h3 {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-size: 1.2rem;\n            margin-bottom: 0.5rem;\n          }\n          .empty-state p {\n            color: var(--text-secondary);\n            margin-bottom: 1.5rem;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u5361\u7247\u7F51\u683C \u2500\u2500\u2500\u2500\u2500 */\n          .users-grid {\n            display: grid;\n            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));\n            gap: 1.25rem;\n          }\n\n          @media (max-width: 480px) {\n            .users-grid {\n              grid-template-columns: 1fr;\n            }\n          }\n\n          .user-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 1.75rem;\n            position: relative;\n            overflow: hidden;\n          }\n          .user-card::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            height: 3px;\n            background: var(--accent-gradient);\n          }\n          .user-card:hover {\n            box-shadow: var(--shadow-lg);\n            border-color: transparent;\n          }\n          .user-card:hover::before {\n            opacity: 1;\n          }\n\n          /* Card header */\n          .user-card-header {\n            display: flex;\n            align-items: flex-start;\n            justify-content: space-between;\n            gap: 1rem;\n            margin-bottom: 1.25rem;\n          }\n          .user-info {\n            flex: 1;\n          }\n          .user-avatar {\n            width: 40px;\n            height: 40px;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 1.1rem;\n            color: var(--accent-color);\n            flex-shrink: 0;\n          }\n          .user-name {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 600;\n            font-size: 1.15rem;\n            color: var(--text-primary);\n            letter-spacing: -0.02em;\n          }\n          .user-actions {\n            display: flex;\n            gap: 0.4rem;\n            flex-shrink: 0;\n          }\n\n          /* API Key row */\n          .user-apikey-row {\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n            background: var(--bg-page);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            padding: 0.65rem 0.85rem;\n            position: relative;\n          }\n          .user-apikey-label {\n            font-size: 0.78rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n            flex-shrink: 0;\n          }\n          .user-apikey-value {\n            flex: 1;\n            font-family: 'DM Mono', 'Fira Code', monospace;\n            font-size: 0.82rem;\n            color: var(--text-primary);\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n          }\n          .user-apikey-copy {\n            width: 24px;\n            height: 24px;\n            padding: 0;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            border: none;\n            background: transparent;\n            color: var(--text-secondary);\n            cursor: pointer;\n            border-radius: 4px;\n            font-size: 0.75rem;\n          }\n          .user-apikey-copy:hover {\n            background: var(--border-color);\n            color: var(--accent-color);\n          }\n\n          /* Description */\n          .user-desc {\n            margin-top: 0.85rem;\n            font-size: 0.85rem;\n            color: var(--text-secondary);\n            line-height: 1.5;\n          }\n\n          /* Action buttons row */\n          .user-card-actions {\n            display: flex;\n            gap: 0.5rem;\n            margin-top: 1rem;\n            padding-top: 1rem;\n            border-top: 1px solid var(--border-color);\n          }\n          .user-card-actions .btn {\n            flex: 1;\n            justify-content: center;\n          }\n\n          /* Toggle form inline */\n          .toggle-form-inline {\n            display: inline;\n          }\n          .toggle-form-inline button {\n            transition: all 0.25s ease;\n          }\n\n          /* Hint text */\n          .hint-text {\n            color: var(--text-secondary);\n            font-size: 0.82rem;\n            margin-top: 0.5rem;\n          }\n\n          /* Model tags */\n          .model-tags {\n            display: flex;\n            flex-wrap: wrap;\n            gap: 0.4rem;\n            margin-top: 0.85rem;\n          }\n          .model-tag {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.3rem;\n            padding: 0.3rem 0.6rem;\n            background: hsl(245 80% 96%);\n            color: hsl(245 80% 50%);\n            border-radius: 6px;\n            font-size: 0.78rem;\n            font-weight: 500;\n          }\n          .model-tag-more {\n            background: var(--bg-page);\n            color: var(--text-secondary);\n          }\n          .model-tags-label {\n            font-size: 0.78rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n            margin-top: 0.85rem;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .page-title { font-size: 1.5rem; }\n            .page-header { flex-direction: column; align-items: flex-start; }\n          }\n        `}";

  // web/src/views/users.ts
  function usersPage(users, enabled = true, error, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u7528\u6237\u7BA1\u7406</h1><p class="page-subtitle">\u7BA1\u7406\u8BBF\u95EE API \u7684\u7528\u6237\u548C\u5BC6\u94A5</p></div><div class="btn-group"><a href="/admin/users/new" class="btn btn-primary">+ \u65B0\u589E\u7528\u6237</a><form method="post" action="/api/admin/users/toggle" class="toggle-form-inline"><input type="hidden" name="enabled" value="${enabled ? "false" : "true"}"><button class="btn btn-secondary">${enabled ? "\u7981\u7528\u7528\u6237\u8BA4\u8BC1" : "\u542F\u7528\u7528\u6237\u8BA4\u8BC1"}</button></form></div></div>
${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ""}
${users.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">\u{1F464}</div><h3>\u6682\u65E0\u7528\u6237</h3><a href="/admin/users/new" class="btn btn-primary">\u65B0\u589E\u7528\u6237</a></div>` : `<div class="users-grid">${users.map((u) => `<div class="user-card"><div class="user-card-header"><div class="user-info"><div class="user-avatar">\u{1F464}</div><div><div class="user-name">${escapeHtml(u.name)}</div></div></div><div class="user-actions"><a href="/admin/users/edit/${encodeURIComponent(u.name)}" class="btn btn-icon btn-secondary" title="\u7F16\u8F91">\u270F\uFE0F</a></div></div><div class="user-apikey-row"><span class="user-apikey-label">Key</span><code class="user-apikey-value" title="${escapeHtml(u.apikey)}">${escapeHtml(u.apikey.slice(0, 8))}\u2026</code><button class="user-apikey-copy" data-key="${escapeHtml(u.apikey)}" title="\u590D\u5236 Key">\u{1F4CB}</button></div><div class="user-desc">${escapeHtml(u.desc || "\u2014")}</div><div class="model-tags-label">\u53EF\u7528\u6A21\u578B</div><div class="model-tags">${!u.allowedModels || u.allowedModels.length === 0 ? '<span class="model-tag">\u6240\u6709\u6A21\u578B</span>' : u.allowedModels.slice(0, 3).map((m) => `<span class="model-tag">${escapeHtml(m)}</span>`).join("")}${(u.allowedModels?.length || 0) > 3 ? `<span class="model-tag model-tag-more">\u7B49${u.allowedModels.length - 3}\u4E2A\u6A21\u578B</span>` : ""}</div><div class="user-card-actions"><a href="/admin/users/edit/${encodeURIComponent(u.name)}" class="btn btn-secondary btn-sm">\u7F16\u8F91</a><form method="POST" action="/api/admin/users/delete/${encodeURIComponent(u.name)}" style="display:inline"><button class="btn btn-sm">\u5220\u9664</button></form></div></div>`).join("")}</div>`}`;
    return adminPage("\u7528\u6237\u7BA1\u7406", "/admin/users", body, css4, version);
  }

  // web/src/styles/admin_api_keys.ts
  var css5 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --danger-color: #ef4444;\n            --danger-bg: #fef2f2;\n            --success-color: #10b981;\n            --success-bg: #f0fdf4;\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);\n            --shadow-lg: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          /* Header */\n          .page-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 2rem;\n            flex-wrap: wrap;\n            gap: 1rem;\n          }\n          .page-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.85rem;\n            letter-spacing: -0.03em;\n            color: var(--text-primary);\n          }\n          .page-subtitle {\n            color: var(--text-secondary);\n            font-size: 0.95rem;\n            margin-top: 0.3rem;\n          }\n\n          /* Buttons */\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n            letter-spacing: -0.01em;\n          }\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n          .btn-sm {\n            padding: 0.45rem 0.85rem;\n            font-size: 0.82rem;\n          }\n          .btn-icon {\n            width: 36px;\n            height: 36px;\n            padding: 0;\n            justify-content: center;\n            border-radius: 50%;\n            font-size: 0.85rem;\n          }\n\n          /* Banner */\n          .success-banner {\n            background: var(--success-bg);\n            border: 1px solid #bbf7d0;\n            color: #166534;\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n          .error-banner {\n            background: var(--danger-bg);\n            border: 1px solid #fecaca;\n            color: var(--danger-color);\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n\n          /* Empty state */\n          .empty-state {\n            text-align: center;\n            padding: 4rem 2rem;\n            background: var(--bg-card);\n            border-radius: var(--radius);\n            border: 1px dashed var(--border-color);\n            margin-bottom: 2rem;\n          }\n          .empty-state-icon {\n            width: 72px;\n            height: 72px;\n            margin: 0 auto 1.5rem;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 1.8rem;\n            color: var(--accent-color);\n          }\n          .empty-state h3 {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-size: 1.2rem;\n            margin-bottom: 0.5rem;\n          }\n          .empty-state p {\n            color: var(--text-secondary);\n            margin-bottom: 1.5rem;\n          }\n\n          /* Two Column Layout */\n          .two-col {\n            display: grid;\n            grid-template-columns: 1fr 380px;\n            gap: 2rem;\n          }\n\n          @media (max-width: 900px) {\n            .two-col {\n              grid-template-columns: 1fr;\n            }\n          }\n\n          /* Keys List */\n          .keys-section {\n          }\n          .keys-section-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.15rem;\n            margin-bottom: 1.25rem;\n            color: var(--text-primary);\n          }\n          .keys-list {\n            display: flex;\n            flex-direction: column;\n            gap: 1rem;\n          }\n          .key-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 1.5rem;\n            position: relative;\n            overflow: hidden;\n          }\n          .key-card::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            height: 3px;\n            background: var(--accent-gradient);\n          }\n          .key-card:hover {\n            box-shadow: var(--shadow-lg);\n            border-color: transparent;\n          }\n          .key-card:hover::before {\n            opacity: 1;\n          }\n\n          .key-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 0.75rem;\n          }\n          .key-icon {\n            width: 40px;\n            height: 40px;\n            border-radius: 50%;\n            background: hsl(245 80% 94%);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 1.1rem;\n            color: var(--accent-color);\n            flex-shrink: 0;\n          }\n          .key-name-block {\n            flex: 1;\n            margin-left: 0.85rem;\n          }\n          .key-name {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 600;\n            font-size: 1.05rem;\n            color: var(--text-primary);\n          }\n          .key-date {\n            font-size: 0.82rem;\n            color: var(--text-secondary);\n            margin-top: 0.15rem;\n          }\n          .key-actions {\n            display: flex;\n            gap: 0.4rem;\n          }\n          .key-delete-form {\n            display: inline;\n          }\n          .key-delete-btn {\n            width: 36px;\n            height: 36px;\n            padding: 0;\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            border-radius: 50%;\n            background: var(--danger-bg);\n            color: var(--danger-color);\n            border: none;\n            cursor: pointer;\n            font-size: 0.85rem;\n          }\n          .key-delete-btn:hover {\n            background: var(--danger-color);\n            color: #fff;\n          }\n\n          /* Form Card */\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.25rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n          .form-input {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            transition: all 0.2s ease;\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n          .form-input:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n          .form-input::placeholder {\n            color: #a0a4b8;\n          }\n          .form-hint {\n            display: block;\n            font-size: 0.78rem;\n            color: var(--text-secondary);\n            margin-top: 0.35rem;\n          }\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 0.5rem;\n          }\n          .form-actions .btn {\n            flex: 1;\n            justify-content: center;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .page-title { font-size: 1.5rem; }\n            .page-header { flex-direction: column; align-items: flex-start; }\n          }\n        `}";

  // web/src/views/apiKeys.ts
  function apiKeysPage(keys, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">API Key \u7BA1\u7406</h1><p class="page-subtitle">\u7BA1\u7406\u5916\u90E8\u8C03\u7528\u4F7F\u7528\u7684 API Key</p></div></div>
${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ""}${success ? `<div class="success-banner">${escapeHtml(success)}</div>` : ""}
<div class="two-col"><div class="keys-section"><h2 class="keys-section-title">\u{1F511} \u5DF2\u5B58\u50A8\u7684 API Key</h2>${keys.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">\u{1F511}</div><h3>\u6682\u65E0 API Key</h3></div>' : `<div class="keys-list">${keys.map((k) => `<div class="key-card"><div class="key-header"><div class="key-icon">\u{1F511}</div><div class="key-name-block"><div class="key-name">${escapeHtml(k.name)}</div><div class="key-value" style="font-family:ui-monospace,monospace;font-size:0.85rem;color:var(--text-secondary);margin-top:0.25rem">${escapeHtml(k.key.slice(-4))}</div>${k.createdAt ? `<div class="key-date">\u521B\u5EFA\u4E8E ${new Date(k.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })}</div>` : ""}</div><div class="key-actions"><a href="/admin/api-keys/edit/${encodeURIComponent(k.id)}" class="btn btn-icon btn-secondary" title="\u7F16\u8F91">\u270F\uFE0F</a><form method="POST" action="/api/admin/api-keys/delete/${encodeURIComponent(k.id)}" class="key-delete-form"><button class="key-delete-btn" title="\u5220\u9664">\xD7</button></form></div></div></div>`).join("")}</div>`}</div>
<div class="form-card"><h2 class="form-title">\u2795 \u65B0\u589E API Key</h2><form method="POST" action="/api/admin/api-keys"><div class="form-group"><label class="form-label" for="name">\u540D\u79F0</label><input class="form-input" id="name" name="name" placeholder="\u4F8B\u5982\uFF1A\u6211\u7684 API Key" required><span class="form-hint">\u7528\u4E8E\u8BC6\u522B\u6B64 API Key</span></div><div class="form-group"><label class="form-label" for="key">API Key</label><input class="form-input" id="key" name="key" placeholder="\u8BF7\u8F93\u5165 API Key" required></div><div class="form-actions"><button type="submit" class="btn btn-primary">\u6DFB\u52A0</button><a href="/admin/api-keys" class="btn btn-secondary">\u53D6\u6D88</a></div></form></div></div>`;
    return adminPage("API Key \u7BA1\u7406", "/admin/api-keys", body, css5, version);
  }

  // web/src/styles/admin_password.ts
  var css6 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .btn-danger {\n            background: #fef2f2;\n            color: #ef4444;\n            border: 1px solid #fecaca;\n          }\n\n          .btn-danger:hover {\n            background: #ef4444;\n            color: #fff;\n          }\n\n          .alert {\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          .alert-error {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n          }\n\n          .alert-success {\n            background: #f0fdf4;\n            border: 1px solid #bbf7d0;\n            color: #166534;\n          }\n\n          .alert-warning {\n            background: #fffbeb;\n            border: 1px solid #fde68a;\n            color: #92400e;\n          }\n\n          .alert-info {\n            background: #eff6ff;\n            border: 1px solid #bfdbfe;\n            color: #1e40af;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n          }\n        `}";

  // web/src/views/password.ts
  function passwordPage(hasPassword, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u5BC6\u7801\u8BBE\u7F6E</h1><p class="page-subtitle">\u8BBE\u7F6E\u6216\u4FEE\u6539\u7BA1\u7406\u540E\u53F0\u767B\u5F55\u5BC6\u7801</p></div></div>
${error ? `<div class="error-banner">${error}</div>` : ""}${success ? `<div class="success-banner">${success}</div>` : ""}
<div class="form-card"><form method="POST" action="/api/admin/password">${hasPassword ? '<div class="form-group"><label class="form-label" for="currentPassword">\u5F53\u524D\u5BC6\u7801</label><input class="form-input" type="password" id="currentPassword" name="currentPassword"></div>' : ""}<div class="form-group"><label class="form-label" for="newPassword">\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="newPassword" name="newPassword"></div><div class="form-group"><label class="form-label" for="confirmPassword">\u786E\u8BA4\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="confirmPassword" name="confirmPassword"></div><div class="form-actions"><button class="btn btn-primary" name="action" value="change">\u4FDD\u5B58\u5BC6\u7801</button>${hasPassword ? '<button class="btn btn-danger" name="action" value="delete">\u5220\u9664\u5BC6\u7801</button>' : ""}</div></form></div><script>document.querySelector('form').addEventListener('submit',async function(e){e.preventDefault();var f=e.target;var a=document.activeElement&&document.activeElement.value||'change';var body={action:a,currentPassword:f.currentPassword?f.currentPassword.value:'',newPassword:f.newPassword.value,confirmPassword:f.confirmPassword.value};var r=await fetch('/api/admin/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});var j=await r.json();if(j.ok){location.reload()}else{alert(j.error&&j.error.message||'\u64CD\u4F5C\u5931\u8D25')}})<\/script>`;
    return adminPage("\u5BC6\u7801\u8BBE\u7F6E", "/admin/password", body, css6, version);
  }

  // web/src/styles/admin_privacy_settings.ts
  var css7 = '{`\n          :root { --bg-page: #f8f9fb; --bg-card: #ffffff; --text-primary: #1a1d26; --text-secondary: #646a7e; --accent-color: hsl(245 80% 58%); --border-color: #e5e7eb; }\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n          body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg-page); color: var(--text-primary); line-height: 1.6; }\n          .card { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 1rem; }\n          .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); }\n          .toggle-row:last-child { border-bottom: none; }\n          .toggle-label { font-weight: 500; }\n          .toggle-desc { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; }\n          .toggle-row input[type="checkbox"] { width: 1.25rem; height: 1.25rem; }\n          .toggle-row input[type="text"] { width: 12rem; padding: 0.35rem 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; }\n          .btn { display: inline-block; padding: 0.6rem 1.5rem; background: var(--accent-color); color: #fff; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }\n          .error-banner { background: #fef2f2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .success-banner { background: #f0fdf4; color: #166534; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .whitelist-info { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; }\n        `}';

  // web/src/views/privacy.ts
  function privacyPage(s, detailLogEnabled = false, cliDebug = false, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u9690\u79C1\u4FDD\u62A4</h1><p class="page-subtitle">\u63A7\u5236\u65E5\u5FD7\u4E2D\u7684\u654F\u611F\u4FE1\u606F\u5904\u7406</p></div></div>
${error ? `<div class="error-banner">${error}</div>` : ""}${success ? `<div class="success-banner">${success}</div>` : ""}
<div class="form-card"><form id="privacy-form">${[["enabled", "\u542F\u7528\u9690\u79C1\u4FDD\u62A4"], ["stripUserField", "\u62B9\u6389 user \u5B57\u6BB5"], ["sanitizeFilePaths", "\u6587\u4EF6\u8DEF\u5F84\u7528\u6237\u540D\u66FF\u6362"], ["whitelistFilter", "\u767D\u540D\u5355\u5B57\u6BB5\u8FC7\u6EE4"]].map(([k, label]) => `<div class="form-group"><label><input type="checkbox" name="${k}" ${s[k] ? "checked" : ""}> ${label}</label></div>`).join("")}<div class="form-group"><label class="form-label" for="pathPlaceholder">\u8DEF\u5F84\u5360\u4F4D\u7B26</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value="${s.pathPlaceholder || "USER"}"></div><div class="form-group"><label>\u65E5\u5FD7\u8BB0\u5F55</label><label><input type="checkbox" name="detailLogEnabled" ${detailLogEnabled ? "checked" : ""} ${cliDebug ? "disabled" : ""}> \u8BB0\u5F55\u5B8C\u6574\u8BF7\u6C42/\u54CD\u5E94\u65E5\u5FD7</label>${cliDebug ? "<p>\u547D\u4EE4\u884C\u542F\u52A8\u65F6\u4F7F\u7528\u4E86 --debug\uFF0C\u65E5\u5FD7\u8BB0\u5F55\u8BBE\u7F6E\u4E0D\u53EF\u4FEE\u6539</p>" : ""}</div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u8BBE\u7F6E</button></div></form></div>`;
    return adminPage("\u9690\u79C1\u4FDD\u62A4", "/admin/privacy", body, css7, version);
  }

  // web/src/styles/admin_announcement.ts
  var css8 = "{`\n          :root { --bg-page: #f8f9fb; --bg-card: #ffffff; --text-primary: #1a1d26; --text-secondary: #646a7e; --accent-color: hsl(245 80% 58%); --border-color: #e5e7eb; }\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n          body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg-page); color: var(--text-primary); line-height: 1.6; }\n          .card { background: var(--bg-card); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 1rem; }\n          .form-group { margin-bottom: 1rem; }\n          .form-group label { display: block; font-weight: 600; margin-bottom: 0.4rem; }\n          .form-group textarea { width: 100%; min-height: 220px; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; font-family: 'SF Mono', 'Monaco', monospace; font-size: 0.85rem; line-height: 1.5; resize: vertical; }\n          .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; }\n          .checkbox-label input[type=\"checkbox\"] { width: 1.25rem; height: 1.25rem; }\n          .btn { display: inline-block; padding: 0.6rem 1.5rem; background: var(--accent-color); color: #fff; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }\n          .error-banner { background: #fef2f2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .success-banner { background: #f0fdf4; color: #166534; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }\n          .preview-section { margin-top: 1rem; }\n          .preview-section h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-secondary); }\n          .preview-content { background: var(--bg-page); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; min-height: 60px; }\n          .preview-content h1, .preview-content h2, .preview-content h3 { margin-top: 0; }\n          .preview-content p { margin-bottom: 0.5rem; }\n          .preview-content code { background: rgba(0,0,0,0.05); padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.85rem; }\n          .preview-content pre { background: rgba(0,0,0,0.05); padding: 0.75rem; border-radius: 8px; overflow-x: auto; }\n          .preview-content pre code { background: none; padding: 0; }\n          .form-hint { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; }\n        `}";

  // web/src/views/announcement.ts
  function announcementPage(content, enabled = true, error, success, version = "1.15.0") {
    const body = `<div class="page-header"><div><h1 class="page-title">\u516C\u544A\u7BA1\u7406</h1><p class="page-subtitle">\u8BBE\u7F6E\u7528\u6237\u9875\u9762\u663E\u793A\u7684\u516C\u544A\uFF08\u652F\u6301 Markdown\uFF09</p></div></div>
${error ? `<div class="error-banner">${escapeHtml(error)}</div>` : ""}${success ? `<div class="success-banner">${escapeHtml(success)}</div>` : ""}
<div class="form-card"><form method="POST" action="/api/admin/announcement"><div class="form-group"><label class="form-label" for="content">\u516C\u544A\u5185\u5BB9</label><textarea class="form-textarea" id="content" name="content" rows="12">${escapeHtml(content)}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ${enabled ? "checked" : ""}> \u542F\u7528\u516C\u544A</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u516C\u544A</button></div></form></div>`;
    return adminPage("\u516C\u544A\u7BA1\u7406", "/admin/announcement", body, css8, version);
  }

  // web/src/styles/admin_model_form.ts
  var css9 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input,\n          .form-select,\n          .form-textarea {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus,\n          .form-select:focus,\n          .form-textarea:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-hint {\n            display: block;\n            font-size: 0.78rem;\n            color: var(--text-secondary);\n            margin-top: 0.35rem;\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .error-banner {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          .limits-section {\n            margin-top: 2rem;\n            padding-top: 1.5rem;\n            border-top: 1px solid var(--border-color);\n          }\n\n          .limits-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.25rem;\n            margin-bottom: 1rem;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n          }\n        `}";

  // web/src/views/jsonEditor.ts
  function jsonEditor(name, value = "") {
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const id = `je-${sanitized}-${Math.random().toString(36).slice(2, 8)}`;
    return `<div style="display:flex;gap:1rem;margin-bottom:0.5rem"><div style="flex:1"><textarea id="${id}-input" style="width:100%;min-height:180px;padding:0.75rem;font-family:monospace;font-size:0.85rem;border:1.5px solid var(--border-color);border-radius:8px;resize:vertical;background:var(--bg-page)" placeholder='{"temperature": 0.7, "max_tokens": 4096}' oninput="jsonEditorValidate('${id}')">${escapeHtml(value)}</textarea><div style="display:flex;gap:0.5rem;margin-top:0.5rem"><button type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;cursor:pointer" onclick="jsonEditorFormat('${id}')">\u683C\u5F0F\u5316</button><button type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;cursor:pointer" onclick="jsonEditorClear('${id}')">\u6E05\u7A7A</button></div></div><div style="flex:1"><pre id="${id}-preview" style="min-height:180px;padding:0.75rem;font-family:monospace;font-size:0.85rem;border:1.5px solid var(--border-color);border-radius:8px;background:#dcfce7;overflow:auto" data-valid="true">${escapeHtml(value ? JSON.stringify(JSON.parse(value || "{}"), null, 2) : "\u7B49\u5F85\u8F93\u5165...")}</pre></div></div><input type="hidden" id="${id}-hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}"><script>window.jsonEditorValidate=function(id){var t=document.getElementById(id+'-input'),p=document.getElementById(id+'-preview'),h=document.getElementById(id+'-hidden');try{var o=JSON.parse(t.value),f=JSON.stringify(o,null,2);p.textContent=f;p.setAttribute('data-valid','true');p.style.background='#dcfce7';h.value=f}catch(e){p.textContent='JSON \u683C\u5F0F\u9519\u8BEF\uFF1A'+e.message;p.setAttribute('data-valid','false');p.style.background='#fef2f2';h.value=t.value}};window.jsonEditorFormat=function(id){var t=document.getElementById(id+'-input');try{t.value=JSON.stringify(JSON.parse(t.value),null,2);window.jsonEditorValidate(id)}catch(e){alert('JSON \u683C\u5F0F\u9519\u8BEF\uFF1A'+e.message)}};window.jsonEditorClear=function(id){var t=document.getElementById(id+'-input'),p=document.getElementById(id+'-preview'),h=document.getElementById(id+'-hidden');t.value='';p.textContent='\u7B49\u5F85\u8F93\u5165...';p.setAttribute('data-valid','true');p.style.background='#dcfce7';h.value=''}<\/script>`;
  }

  // web/src/views/modelForm.ts
  function modelFormPage(model, apiKeyOptions, error, version = "1.15.0") {
    const isEdit = !!model;
    const m = model || {};
    const v = (s) => escapeHtml(s || "");
    const keyOptions = apiKeyOptions.map((k) => `<option value="$$${escapeHtml(k)}$$">${escapeHtml(k)}</option>`).join("");
    const testScript = `
<script>window.runTest = async function(){var b=document.getElementById('testBtn');b.disabled=true;document.getElementById('testLoading').style.display='block';try{var src=document.getElementById('apiKeySourceTest').value;var payload={provider:b.dataset.provider,baseUrl:b.dataset.base,realModel:b.dataset.real,message:document.getElementById('testMessage').value,defaultParams:{}};if(src!=='manual'){payload.apiKeyId=src}else{payload.apiKey=document.getElementById('apiKeyTest').value}var res=await fetch('/admin/models/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});var d=await res.json();if(d.success){document.getElementById('testResultModel').textContent=d.model||b.dataset.real;document.getElementById('testResultContent').textContent=d.content||'(\u65E0\u5185\u5BB9)';document.getElementById('testResultUsage').textContent=d.usage?('Tokens: \u8F93\u5165='+d.usage.prompt_tokens+', \u8F93\u51FA='+d.usage.completion_tokens):'';if(d.requestBody){document.getElementById('requestBodyContent').textContent=d.requestBody;document.getElementById('requestSection').style.display='block'}if(d.fullResponse){document.getElementById('responseBodyContent').textContent=d.fullResponse;document.getElementById('responseSection').style.display='block'}document.getElementById('testResult').style.display='block'}else{document.getElementById('testErrorMessage').textContent=d.message||'\u672A\u77E5\u9519\u8BEF';if(d.rawResponse){document.getElementById('testRawResponse').textContent=d.rawResponse;document.getElementById('rawResponseSection').style.display='block'}document.getElementById('testError').style.display='block'}}catch(e){document.getElementById('testErrorMessage').textContent='\u8BF7\u6C42\u5931\u8D25: '+e.message;document.getElementById('testError').style.display='block'}finally{b.disabled=false;document.getElementById('testLoading').style.display='none'}};window.toggleRawResponse = function(){var s=document.getElementById('rawResponseSection');s.style.display=s.style.display==='none'?'block':'none'}<\/script>`;
    const testHtml = isEdit ? `<details class="test-details"><summary>\u{1F9EA} \u6D4B\u8BD5\u6A21\u578B\u914D\u7F6E</summary><div class="form-card" style="margin-top:1rem"><div class="form-group"><label class="form-label" for="testMessage">\u6D4B\u8BD5\u6D88\u606F</label><textarea class="form-textarea" id="testMessage" placeholder="\u8BF7\u4ECB\u7ECD\u4E00\u4E0B\u4F60\u81EA\u5DF1">\u8BF7\u4ECB\u7ECD\u4E00\u4E0B\u4F60\u81EA\u5DF1</textarea></div><div class="form-group"><label class="form-label" for="apiKeySourceTest">API Key \u6765\u6E90</label><select id="apiKeySourceTest"><option value="manual">\u624B\u52A8\u8F93\u5165</option>${keyOptions}</select><input id="apiKeyTest" placeholder="\u8BF7\u8F93\u5165 API Key"></div><button type="button" class="btn btn-primary" id="testBtn" onclick="runTest()" data-provider="${v(m.provider)}" data-base="${v(m.baseUrl)}" data-real="${v(m.realModel)}">\u53D1\u9001\u6D4B\u8BD5\u8BF7\u6C42</button><div id="testLoading" style="display:none;margin-top:0.75rem">\u53D1\u9001\u4E2D\u2026</div><div id="testResult" style="display:none;margin-top:1rem">\u6A21\u578B: <strong id="testResultModel"></strong><pre id="testResultContent"></pre><div id="testResultUsage"></div></div><div id="requestSection" style="display:none"><pre id="requestBodyContent"></pre></div><div id="responseSection" style="display:none"><pre id="responseBodyContent"></pre></div><div id="testError" style="display:none;margin-top:1rem;color:#dc2626"><span id="testErrorMessage"></span><div id="rawResponseSection" style="display:none"><pre id="testRawResponse"></pre></div></div></div></details>${testScript}` : "";
    const body = `<div class="form-card"><h1 class="form-title">${isEdit ? "\u7F16\u8F91\u6A21\u578B" : "\u65B0\u589E\u6A21\u578B"}</h1>${error ? `<div class="error-banner"><strong>\u9519\u8BEF\uFF1A</strong> ${escapeHtml(error)}</div>` : ""}<form method="post" action="${isEdit ? `/admin/models/edit/${encodeURIComponent(m.customModel)}` : "/admin/models"}">
<div class="form-group"><label class="form-label" for="customModel">\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="customModel" name="customModel" value="${v(m.customModel)}" placeholder="\u4F8B\u5982\uFF1Amy-gpt4" required><span class="form-hint">\u8C03\u7528 API \u65F6\u4F7F\u7528\u6B64\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="realModel">\u5B9E\u9645\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="realModel" name="realModel" value="${v(m.realModel)}" placeholder="\u4F8B\u5982\uFF1Agpt-4" required><span class="form-hint">\u4E0A\u6E38 API \u652F\u6301\u7684\u6A21\u578B\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" required><option value="">\u8BF7\u9009\u62E9...</option>${["openai", "response-api", "anthropic"].map((p) => `<option value="${p}" ${m.provider === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>
<div class="form-group"><label class="form-label" for="baseUrl">Base URL</label><input class="form-input" id="baseUrl" name="baseUrl" value="${v(m.baseUrl)}" placeholder="\u4F8B\u5982\uFF1Ahttps://api.openai.com" required><span class="form-hint">API \u63D0\u4F9B\u5546\u7684\u5730\u5740</span></div>
<div class="form-group"><label class="form-label" for="proxy">\u4EE3\u7406\uFF08\u53EF\u9009\uFF09</label><input class="form-input" id="proxy" name="proxy" value="${v(m.proxy)}" placeholder="http://user:pass@127.0.0.1:7890 \u6216 socks5://127.0.0.1:1080"><span class="form-hint">\u53D1\u5F80\u4E0A\u6E38\u7684\u8BF7\u6C42\u901A\u8FC7\u6B64\u4EE3\u7406\u8F6C\u53D1\uFF0C\u7559\u7A7A\u5219\u76F4\u8FDE\u3002\u652F\u6301 http://\u3001https://\u3001socks5://\uFF08\u53EF\u5E26 user:pass@ \u8BA4\u8BC1\uFF09\uFF1B\u4E0D\u652F\u6301 socks5h:// \u548C socks4://</span></div>
<div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource"><option value="">\u8BF7\u9009\u62E9...</option>${apiKeyOptions.map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join("")}</select><input class="form-input" name="apiKey" placeholder="${isEdit ? "\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : "\u8BF7\u8F93\u5165 API Key"}"><span class="form-hint">\u53EF\u9009\u62E9\u5DF2\u5B58\u50A8\u7684\u5F15\u7528\u6216\u76F4\u63A5\u8F93\u5165</span></div>
<div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><textarea class="form-textarea" id="desc" name="desc" placeholder="\u8BF7\u8F93\u5165\u6A21\u578B\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09">${v(m.desc)}</textarea><span class="form-hint">\u7528\u4E8E\u8BB0\u5F55\u6A21\u578B\u7684\u7528\u9014\u6216\u5907\u6CE8</span></div>
<div class="form-group"><label class="form-label" for="maxContextLength">\u6700\u5927\u4E0A\u4E0B\u6587\u957F\u5EA6</label><input class="form-input" id="maxContextLength" name="maxContextLength" type="number" value="${m.maxContextLength || ""}" placeholder="\u9ED8\u8BA4 200000"><span class="form-hint">\u6A21\u578B\u652F\u6301\u7684\u6700\u5927 token \u6570\uFF0C\u672A\u586B\u5199\u5219\u4F7F\u7528\u9ED8\u8BA4\u503C 200000</span></div>
<div class="form-group"><label class="form-label">\u9ED8\u8BA4\u53C2\u6570 (JSON)</label>${jsonEditor("defaultParams", "")}</div>
<div class="form-actions"><button type="submit" class="btn btn-primary">\u4FDD\u5B58\u6A21\u578B</button><a href="/admin/models" class="btn btn-secondary">\u53D6\u6D88</a></div></form></div>${testHtml}`;
    return adminPage(isEdit ? "\u7F16\u8F91\u6A21\u578B" : "\u65B0\u589E\u6A21\u578B", "/admin/models", body, css9, version);
  }

  // web/src/styles/admin_model_limits.ts
  var css10 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .limits-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .limits-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 0.5rem;\n            color: var(--text-primary);\n          }\n\n          .limits-subtitle {\n            color: var(--text-secondary);\n            margin-bottom: 1.5rem;\n          }\n\n          .alert {\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          .alert-error {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n          }\n\n          .alert-success {\n            background: #f0fdf4;\n            border: 1px solid #bbf7d0;\n            color: #166534;\n          }\n\n          .section-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.25rem;\n            margin: 1.5rem 0 1rem;\n            color: var(--text-primary);\n          }\n\n          table {\n            width: 100%;\n            border-collapse: collapse;\n            margin-bottom: 1.5rem;\n          }\n\n          th, td {\n            text-align: left;\n            padding: 0.75rem;\n            border-bottom: 1px solid var(--border-color);\n          }\n\n          th {\n            font-weight: 600;\n            color: var(--text-secondary);\n            font-size: 0.85rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.5rem 1rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.85rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .btn-danger {\n            background: #fef2f2;\n            color: #ef4444;\n            border: 1px solid #fecaca;\n            padding: 0.25rem 0.5rem;\n            font-size: 0.75rem;\n          }\n\n          .btn-danger:hover {\n            background: #ef4444;\n            color: #fff;\n          }\n\n          .form-grid {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 1rem;\n            max-width: 600px;\n          }\n\n          .form-group {\n            margin-bottom: 1rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input,\n          .form-select {\n            width: 100%;\n            padding: 0.6rem 0.8rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.9rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus,\n          .form-select:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n          }\n\n          .btn-submit {\n            margin-top: 1rem;\n            padding: 0.7rem 1.5rem;\n            background: var(--accent-gradient);\n            color: #fff;\n            border: none;\n            border-radius: var(--radius-sm);\n            font-weight: 600;\n            cursor: pointer;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .limits-card { padding: 1.5rem; }\n            .form-grid { grid-template-columns: 1fr; }\n          }\n        `}";

  // web/src/views/modelLimits.ts
  function modelLimitsPage(model, limits, error, success, version = "1.15.0") {
    const body = `<div class="limits-card"><h1 class="limits-title">\u9650\u5236\u89C4\u5219\u7BA1\u7406</h1><p class="limits-subtitle">\u6A21\u578B\uFF1A<strong>${escapeHtml(model)}</strong></p>
${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}${success ? `<div class="alert alert-success">${escapeHtml(success)}</div>` : ""}
<h2 class="section-title">\u73B0\u6709\u89C4\u5219</h2><table class="limits-table"><thead><tr><th>\u7C7B\u578B</th><th>\u5468\u671F</th><th>\u6570\u503C</th><th>\u4F7F\u7528\u60C5\u51B5</th><th>\u64CD\u4F5C</th></tr></thead><tbody>${limits.map((l, i) => `<tr><td>${escapeHtml(l.type)}</td><td>${escapeHtml(l.period)} ${l.periodValue || ""}</td><td>${l.max}</td><td>${escapeHtml(l.usage || "\u2014")}</td><td><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/delete/${i}"><button class="btn btn-danger">\u5220\u9664</button></form></td></tr>`).join("")}</tbody></table>
<h2 class="section-title">\u6DFB\u52A0\u89C4\u5219</h2><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/add"><div class="form-grid"><div class="form-group"><label class="form-label" for="type">\u7C7B\u578B</label><select class="form-select" id="type" name="type" required onchange="handleTypeChange(this)"><option value="">\u8BF7\u9009\u62E9...</option><option value="requests">\u6309\u8BF7\u6C42\u6B21\u6570</option><option value="input_tokens">\u6309 Token \u6570</option><option value="cost">\u6309\u91D1\u989D</option></select></div><div class="form-group" id="periodLabel" style="display:none"><label class="form-label" for="period">\u5468\u671F</label><select class="form-select" id="period" name="period" onchange="handlePeriodChange(this)"><option value="">\u8BF7\u9009\u62E9...</option><option value="hours">\u6309\u5C0F\u65F6</option><option value="day">\u6309\u5929</option><option value="week">\u6309\u5468</option><option value="month">\u6309\u6708</option></select></div><div class="form-group" id="periodValueLabel" style="display:none"><label class="form-label" for="periodValue">\u5468\u671F\u6570\u503C</label><input class="form-input" id="periodValue" name="periodValue" placeholder="\u4F8B\u5982\uFF1A4"></div><div class="form-group" id="maxLabel" style="display:none"><label class="form-label" for="maxInput">\u6570\u503C</label><input class="form-input" id="maxInput" name="max" placeholder="\u8BF7\u8F93\u5165\u6570\u503C"></div><div class="form-group" id="costMaxLabel" style="display:none"><label class="form-label" for="costMaxInput">\u91D1\u989D</label><input class="form-input" id="costMaxInput" name="costMax" placeholder="\u8BF7\u8F93\u5165\u91D1\u989D"></div></div><button type="submit" class="btn-submit">\u6DFB\u52A0\u89C4\u5219</button></form></div>
<script>function handleTypeChange(s){var t=s.value;document.getElementById('periodLabel').style.display=t==='cost'?'none':'block';document.getElementById('maxLabel').style.display=t==='cost'?'none':'block';document.getElementById('costMaxLabel').style.display=t==='cost'?'block':'none'}function handlePeriodChange(s){document.getElementById('periodValueLabel').style.display=s.value==='hours'?'block':'none'}<\/script>`;
    return adminPage(`\u9650\u5236\u89C4\u5219\u7BA1\u7406 - ${model}`, "/admin/models", body, css10, version);
  }

  // web/src/styles/admin_stats.ts
  var css11 = '{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --blue-gradient: linear-gradient(135deg, #3b82f6, #2563eb);\n            --blue-bg: #eff6ff;\n            --green-gradient: linear-gradient(135deg, #10b981, #059669);\n            --green-bg: #f0fdf4;\n            --red-gradient: linear-gradient(135deg, #ef4444, #dc2626);\n            --red-bg: #fef2f2;\n            --purple-gradient: linear-gradient(135deg, #8b5cf6, #7c3aed);\n            --purple-bg: #f5f3ff;\n            --orange-bg: #fff7ed;\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);\n            --shadow-lg: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u4E3B\u5185\u5BB9\u533A \u2500\u2500\u2500\u2500\u2500 */\n          .main-content {\n            max-width: 1280px;\n            margin: 0 auto;\n            padding: 2.5rem 2rem 4rem;\n          }\n\n          /* Header */\n          .page-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 2rem;\n            flex-wrap: wrap;\n            gap: 1rem;\n          }\n          .page-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 2rem;\n            letter-spacing: -0.03em;\n            color: var(--text-primary);\n          }\n          .page-subtitle {\n            color: var(--text-secondary);\n            font-size: 0.95rem;\n            margin-top: 0.3rem;\n          }\n\n          /* Buttons */\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n            letter-spacing: -0.01em;\n          }\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u65E5\u671F\u7B5B\u9009\u680F \u2500\u2500\u2500\u2500\u2500 */\n          .filter-bar {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 1.25rem 1.5rem;\n            margin-bottom: 1.5rem;\n            box-shadow: var(--shadow-sm);\n          }\n          .filter-form {\n            display: flex;\n            align-items: flex-end;\n            gap: 1rem;\n            flex-wrap: wrap;\n          }\n          .filter-group {\n            display: flex;\n            flex-direction: column;\n            gap: 0.3rem;\n          }\n          .filter-group label {\n            font-size: 0.8rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n          }\n          .filter-group input[type="date"] {\n            padding: 0.5rem 0.75rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            outline: none;\n            transition: border-color 0.2s;\n          }\n          .filter-group input[type="date"]:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n          }\n          .filter-submit {\n            padding: 0.5rem 1.25rem;\n            background: var(--accent-gradient);\n            color: #fff;\n            border: none;\n            border-radius: var(--radius-sm);\n            font-weight: 600;\n            font-size: 0.88rem;\n            cursor: pointer;\n          }\n          .filter-submit:hover {\n            opacity: 0.9;\n          }\n          .filter-shortcuts {\n            display: flex;\n            gap: 0.4rem;\n            flex-wrap: wrap;\n            margin-top: 0.75rem;\n          }\n          .filter-shortcuts a {\n            padding: 0.35rem 0.75rem;\n            background: var(--bg-page);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.8rem;\n            font-weight: 500;\n            color: var(--text-secondary);\n            text-decoration: none;\n            transition: all 0.2s;\n          }\n          .filter-shortcuts a:hover {\n            border-color: var(--accent-color);\n            color: var(--accent-color);\n            background: hsl(245 80% 96%);\n          }\n          .filter-current {\n            font-size: 0.8rem;\n            color: var(--text-secondary);\n            margin-top: 0.6rem;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u6982\u89C8\u5361\u7247 \u2500\u2500\u2500\u2500\u2500 */\n          .overview-grid {\n            display: grid;\n            grid-template-columns: repeat(4, 1fr);\n            gap: 1.25rem;\n            margin-bottom: 2rem;\n          }\n          @media (max-width: 900px) {\n            .overview-grid { grid-template-columns: repeat(2, 1fr); }\n          }\n          @media (max-width: 480px) {\n            .overview-grid { grid-template-columns: 1fr; }\n          }\n\n          .overview-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 1.75rem;\n            position: relative;\n            overflow: hidden;\n            transition: all 0.3s ease;\n            box-shadow: var(--shadow-sm);\n          }\n          .overview-card::before {\n            content: \'\';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            height: 3px;\n            opacity: 1;\n            transition: height 0.3s ease;\n          }\n          .overview-card--blue::before { background: var(--blue-gradient); }\n          .overview-card--green::before { background: var(--green-gradient); }\n          .overview-card--red::before { background: var(--red-gradient); }\n          .overview-card--purple::before { background: var(--purple-gradient); }\n          .overview-card--blue { background: var(--blue-bg); }\n          .overview-card--green { background: var(--green-bg); }\n          .overview-card--red { background: var(--red-bg); }\n          .overview-card--purple { background: var(--purple-bg); }\n\n          .overview-card:hover {\n            transform: translateY(-4px);\n            box-shadow: var(--shadow-lg);\n          }\n          .overview-card:hover::before {\n            height: 4px;\n          }\n\n          .overview-card-label {\n            font-size: 0.85rem;\n            font-weight: 600;\n            margin-bottom: 0.5rem;\n          }\n          .overview-card--blue .overview-card-label { color: #2563eb; }\n          .overview-card--green .overview-card-label { color: #059669; }\n          .overview-card--red .overview-card-label { color: #dc2626; }\n          .overview-card--purple .overview-card-label { color: #7c3aed; }\n\n          .overview-card-value {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-size: 2.25rem;\n            font-weight: 700;\n            line-height: 1.1;\n          }\n          .overview-card--blue .overview-card-value { color: #1e40af; }\n          .overview-card--green .overview-card-value { color: #047857; }\n          .overview-card--red .overview-card-value { color: #b91c1c; }\n          .overview-card--purple .overview-card-value { color: #5b21b6; }\n\n          .overview-card-sub {\n            font-size: 0.8rem;\n            color: var(--text-secondary);\n            margin-top: 0.4rem;\n          }\n\n          /* Mini bar inside overview */\n          .mini-bar-track {\n            height: 6px;\n            background: var(--border-color);\n            border-radius: 3px;\n            margin-top: 0.75rem;\n            overflow: hidden;\n          }\n          .mini-bar-fill {\n            height: 100%;\n            border-radius: 3px;\n            transition: width 0.8s ease;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 Token \u7528\u91CF\u5361\u7247 \u2500\u2500\u2500\u2500\u2500 */\n          .token-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            margin-bottom: 1.5rem;\n            box-shadow: var(--shadow-sm);\n            transition: all 0.3s ease;\n          }\n          .token-card:hover {\n            transform: translateY(-3px);\n            box-shadow: var(--shadow-md);\n          }\n          .token-card-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.25rem;\n            margin-bottom: 1.25rem;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n          .token-grid {\n            display: grid;\n            grid-template-columns: repeat(4, 1fr);\n            gap: 1.25rem;\n          }\n          @media (max-width: 600px) {\n            .token-grid { grid-template-columns: repeat(2, 1fr); }\n          }\n          .token-item-value {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-size: 1.4rem;\n            font-weight: 700;\n            color: var(--accent-color);\n          }\n          .token-item-label {\n            font-size: 0.8rem;\n            color: var(--text-secondary);\n            margin-top: 0.15rem;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u6BCF\u65E5\u70ED\u529B\u56FE \u2500\u2500\u2500\u2500\u2500 */\n          .heatmap-scroll { overflow-x: auto; padding-bottom: 0.5rem; }\n          .heatmap-grid { display: flex; gap: 3px; width: 100%; }\n          .heatmap-col { display: flex; flex-direction: column; gap: 3px; flex: 1 1 0; min-width: 0; }\n          .heatmap-months { display: flex; gap: 3px; width: 100%; }\n          .heatmap-months > span { flex: 1 1 0; min-width: 0; overflow: hidden; white-space: nowrap; }\n          .heatmap-cell {\n            width: 100%; aspect-ratio: 1 / 1; border-radius: 2px;\n            background: #ebedf0;\n            min-width: 0; display: block;\n          }\n          .heatmap-legend {\n            display: flex; align-items: center; gap: 4px;\n            font-size: 0.75rem; color: var(--text-secondary);\n            margin-top: 0.75rem;\n          }\n          .heatmap-legend .heatmap-cell { width: 11px; height: 11px; flex: none; aspect-ratio: auto; }\n          .heatmap-tip {\n            position: fixed; z-index: 9999; pointer-events: none;\n            background: #1a1d26; color: #fff;\n            font-size: 0.75rem; font-weight: 500; line-height: 1.5;\n            padding: 0.35rem 0.6rem; border-radius: 6px;\n            white-space: nowrap; display: none;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.25);\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u7EDF\u8BA1\u8868\u683C\u5361\u7247 \u2500\u2500\u2500\u2500\u2500 */\n          .stats-section-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            margin-bottom: 1.5rem;\n            box-shadow: var(--shadow-sm);\n            transition: all 0.3s ease;\n            overflow: hidden;\n          }\n          .stats-section-card:hover {\n            transform: translateY(-3px);\n            box-shadow: var(--shadow-md);\n          }\n          .stats-section-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.1rem;\n            margin-bottom: 1.25rem;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n            color: var(--text-primary);\n          }\n          .stats-table-wrapper {\n            overflow-x: auto;\n          }\n          .stats-table {\n            width: 100%;\n            border-collapse: collapse;\n            font-size: 0.9rem;\n          }\n          .stats-table th {\n            text-align: left;\n            padding: 0.75rem 0.5rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n            font-size: 0.82rem;\n            border-bottom: 2px solid var(--border-color);\n            white-space: nowrap;\n          }\n          .stats-table td {\n            padding: 0.75rem 0.5rem;\n            border-bottom: 1px solid #f3f4f6;\n          }\n          .stats-table tr:hover td {\n            background: var(--bg-page);\n          }\n          .stats-table .model-name {\n            font-weight: 600;\n            color: var(--text-primary);\n          }\n          .stat-green { color: #059669; font-weight: 600; }\n          .stat-red { color: #dc2626; font-weight: 600; }\n\n          /* \u6A21\u578B/Provider \u5C0F\u5361\u7247 */\n          .stat-mini-cards {\n            display: grid;\n            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\n            gap: 1rem;\n            margin-top: 1rem;\n          }\n          .stat-mini-card {\n            background: var(--bg-page);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            padding: 1.25rem;\n            transition: all 0.25s ease;\n          }\n          .stat-mini-card:hover {\n            transform: translateY(-2px);\n            box-shadow: var(--shadow-sm);\n          }\n          .stat-mini-name {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 600;\n            font-size: 1rem;\n            margin-bottom: 0.5rem;\n            color: var(--text-primary);\n          }\n          .stat-mini-requests {\n            font-size: 1.5rem;\n            font-weight: 700;\n            color: var(--accent-color);\n            font-family: system-ui, -apple-system, sans-serif;\n          }\n          .stat-mini-meta {\n            display: flex;\n            gap: 1rem;\n            font-size: 0.8rem;\n            margin-top: 0.5rem;\n          }\n          .stat-mini-success { color: #059669; }\n          .stat-mini-failed { color: #dc2626; }\n\n          /* Empty state */\n          .empty-in-section {\n            color: var(--text-secondary);\n            font-size: 0.95rem;\n            padding: 1rem 0;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u5C0F\u65F6\u5206\u5E03 \u2500\u2500\u2500\u2500\u2500 */\n          .hour-chart-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            margin-bottom: 1.5rem;\n            box-shadow: var(--shadow-sm);\n          }\n          .hour-chart-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.1rem;\n            margin-bottom: 1.5rem;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n          .hour-item {\n            display: flex;\n            align-items: center;\n            gap: 0.75rem;\n            margin-bottom: 0.5rem;\n          }\n          .hour-label {\n            width: 130px;\n            font-size: 0.8rem;\n            font-weight: 500;\n            color: var(--text-secondary);\n            flex-shrink: 0;\n          }\n          .hour-bar-bg {\n            flex: 1;\n            height: 20px;\n            background: var(--bg-page);\n            border-radius: 4px;\n            position: relative;\n            overflow: hidden;\n          }\n          .hour-bar-fill {\n            height: 100%;\n            border-radius: 4px;\n            transition: width 0.4s ease;\n          }\n          .hour-bar-value {\n            position: absolute;\n            left: 0.5rem;\n            top: 50%;\n            transform: translateY(-50%);\n            font-size: 0.8rem;\n            font-weight: 600;\n            white-space: nowrap;\n          }\n          .hour-meta {\n            width: 280px;\n            font-size: 0.75rem;\n            color: var(--text-secondary);\n            flex-shrink: 0;\n            text-align: right;\n            white-space: nowrap;\n          }\n\n          /* Refresh button */\n          .refresh-wrapper {\n            text-align: center;\n            margin-top: 2rem;\n          }\n          .refresh-btn {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.5rem;\n            padding: 0.7rem 1.5rem;\n            background: var(--bg-card);\n            color: var(--text-secondary);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            text-decoration: none;\n            font-weight: 600;\n            font-size: 0.88rem;\n            transition: all 0.25s ease;\n            box-shadow: var(--shadow-sm);\n          }\n          .refresh-btn:hover {\n            color: var(--accent-color);\n            border-color: var(--accent-color);\n            box-shadow: var(--shadow-md);\n            transform: translateY(-2px);\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u6A21\u578B\u7B5B\u9009\u6309\u94AE \u2500\u2500\u2500\u2500\u2500 */\n          .model-filter-bar {\n            display: flex;\n            gap: 0.5rem;\n            flex-wrap: wrap;\n            margin-bottom: 1.5rem;\n          }\n          .model-filter-btn {\n            padding: 0.45rem 0.9rem;\n            border: 1px solid var(--border-color);\n            border-radius: 20px;\n            font-size: 0.82rem;\n            font-weight: 500;\n            cursor: pointer;\n            text-decoration: none;\n            color: var(--text-secondary);\n            background: var(--bg-card);\n            transition: all 0.2s;\n          }\n          .model-filter-btn:hover {\n            border-color: var(--accent-color);\n            color: var(--accent-color);\n          }\n          .model-filter-btn.active {\n            background: var(--accent-gradient);\n            color: #fff;\n            border-color: transparent;\n          }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u8BF7\u6C42\u5217\u8868 \u2500\u2500\u2500\u2500\u2500 */\n          .request-list-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            margin-bottom: 1.5rem;\n            box-shadow: var(--shadow-sm);\n            overflow: hidden;\n          }\n          .request-list-title {\n            font-weight: 700;\n            font-size: 1.1rem;\n            margin-bottom: 1rem;\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n          }\n          .request-list-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            gap: 1rem;\n            flex-wrap: wrap;\n            margin-bottom: 1rem;\n          }\n          .request-list-header .request-list-title {\n            margin-bottom: 0;\n          }\n          .avg-metrics {\n            display: flex;\n            gap: 0.5rem;\n            flex-wrap: wrap;\n            font-size: 0.78rem;\n          }\n          .avg-pill {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.35rem;\n            padding: 0.3rem 0.7rem;\n            border-radius: 999px;\n            font-weight: 500;\n            border: 1px solid transparent;\n            white-space: nowrap;\n          }\n          .avg-pill--ttft {\n            background: var(--purple-bg);\n            color: #6d28d9;\n            border-color: #ede9fe;\n          }\n          .avg-pill--tps {\n            background: var(--green-bg);\n            color: #047857;\n            border-color: #d1fae5;\n          }\n          .avg-pill--empty {\n            background: var(--bg-page);\n            color: var(--text-secondary);\n            border-color: var(--border-color);\n          }\n          .avg-pill-label {\n            font-size: 0.72rem;\n            opacity: 0.85;\n          }\n          .avg-pill-value {\n            font-weight: 700;\n            font-family: system-ui, -apple-system, sans-serif;\n          }\n          .request-table {\n            width: 100%;\n            border-collapse: collapse;\n            font-size: 0.82rem;\n          }\n          .request-table th {\n            text-align: left;\n            padding: 0.6rem 0.5rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n            font-size: 0.78rem;\n            border-bottom: 2px solid var(--border-color);\n            white-space: nowrap;\n          }\n          .request-table td {\n            padding: 0.55rem 0.5rem;\n            border-bottom: 1px solid #f3f4f6;\n            max-width: 200px;\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n          }\n          .request-table tr:hover td {\n            background: var(--bg-page);\n          }\n          .status-badge {\n            display: inline-block;\n            padding: 0.15rem 0.5rem;\n            border-radius: 10px;\n            font-size: 0.75rem;\n            font-weight: 600;\n          }\n          .status-ok { background: #dcfce7; color: #166534; }\n          .status-err { background: #fee2e2; color: #991b1b; }\n\n          /* \u2500\u2500\u2500\u2500\u2500 \u5206\u9875 \u2500\u2500\u2500\u2500\u2500 */\n          .pagination {\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            gap: 0.5rem;\n            margin-top: 1.5rem;\n          }\n          .pagination a, .pagination span {\n            padding: 0.4rem 0.75rem;\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            text-decoration: none;\n            font-size: 0.85rem;\n            font-weight: 500;\n            color: var(--text-secondary);\n            background: var(--bg-card);\n            transition: all 0.2s;\n          }\n          .pagination a:hover {\n            border-color: var(--accent-color);\n            color: var(--accent-color);\n          }\n          .pagination .active {\n            background: var(--accent-gradient);\n            color: #fff;\n            border-color: transparent;\n          }\n          .pagination .disabled {\n            opacity: 0.4;\n            pointer-events: none;\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem; }\n            .page-title { font-size: 1.5rem; }\n            .date-grid { grid-template-columns: 1fr; }\n            .stat-meta { font-size: 0.75rem; }\n            .filter-bar { flex-direction: column; }\n            .request-table { font-size: 0.75rem; }\n          }\n        `}';

  // web/src/views/stats.ts
  function statsPage(s, version = "1.15.0") {
    const successPct = s.totalRequests ? s.successfulRequests / s.totalRequests * 100 : 0;
    const failPct = s.totalRequests ? s.failedRequests / s.totalRequests * 100 : 0;
    const body = `<div class="page-header"><div><h1 class="page-title">\u7EDF\u8BA1 Dashboard</h1></div></div>
<div class="filter-bar"><form method="get" action="/admin/stats" class="filter-form" id="stats-filter-form"><div class="filter-group"><label for="start">\u5F00\u59CB\u65E5\u671F</label><input type="date" id="start" name="startDate" value="${s.startDate}"></div><div class="filter-group"><label for="end">\u7ED3\u675F\u65E5\u671F</label><input type="date" id="end" name="endDate" value="${s.endDate}"></div><div class="filter-group"><label for="user">\u7528\u6237</label><input id="user" name="userName" value="${escapeHtml(s.userName || "")}"></div><div class="filter-group"><label for="model">\u6A21\u578B</label><input id="model" name="model" value="${escapeHtml(s.model || "")}"></div><button type="submit" class="filter-submit">\u67E5\u8BE2</button></form><div class="model-filter-bar"></div><div class="filter-shortcuts" id="filter-shortcuts"><button data-days="1">\u4ECA\u5929</button><button data-days="7">\u8FD1 7 \u5929</button><button data-days="30">\u8FD1 30 \u5929</button></div><div class="filter-current">${escapeHtml(s.dateRange)} \xB7 \u5E73\u5747\u5EF6\u8FDF ${formatDuration(s.avgDuration)}</div></div>
<div class="overview-grid">
<div class="overview-card overview-card--blue"><div class="overview-card-label">\u603B\u8BF7\u6C42\u6570</div><div class="overview-card-value">${formatNumber(s.totalRequests)}</div><div class="overview-card-sub">${escapeHtml(s.dateRange)}</div></div>
<div class="overview-card overview-card--green"><div class="overview-card-label">\u6210\u529F\u8BF7\u6C42</div><div class="overview-card-value">${formatNumber(s.successfulRequests)}</div><div class="overview-card-sub">\u6210\u529F\u7387 ${successPct.toFixed(1)}%</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${successPct}%;background:var(--green-gradient)"></div></div></div>
<div class="overview-card overview-card--red"><div class="overview-card-label">\u5931\u8D25\u8BF7\u6C42</div><div class="overview-card-value">${formatNumber(s.failedRequests)}</div><div class="overview-card-sub">\u5931\u8D25\u7387 ${failPct.toFixed(1)}%</div></div>
<div class="overview-card overview-card--purple"><div class="overview-card-label">\u6210\u529F\u7387</div><div class="overview-card-value">${successPct.toFixed(1)}%</div><div class="overview-card-sub">${s.successfulRequests} / ${s.totalRequests}</div></div></div>
<div class="token-card"><h2 class="token-card-title">\u{1F4C8} Token \u7528\u91CF</h2><div class="token-grid"><div class="token-item"><div class="token-item-value">${formatNumber(s.totalInputTokens)}</div><div class="token-item-label">\u8F93\u5165</div></div><div class="token-item"><div class="token-item-value">${formatNumber(s.totalCachedTokens)}</div><div class="token-item-label">\u8F93\u5165\u7F13\u5B58</div></div><div class="token-item"><div class="token-item-value">${formatNumber(s.totalOutputTokens)}</div><div class="token-item-label">\u8F93\u51FA</div></div><div class="token-item"><div class="token-item-value">${formatNumber(s.totalTokens)}</div><div class="token-item-label">\u603B\u8BA1</div></div></div></div>
<div class="stats-section-card"><h2 class="stats-section-title">\u{1F5D3}\uFE0F \u6BCF\u65E5 Token \u6D88\u8017</h2><div class="heatmap-months"></div><div class="heatmap-scroll" data-heatmap-scroll><div class="heatmap-grid" data-heatmap-grid>${Object.entries(s.byDate).map(([d, n]) => `<div class="heatmap-col" title="${d}: ${n}"><div class="heatmap-cell" style="opacity:${Math.min(1, n / Math.max(1, ...Object.values(s.byDate)))}"></div></div>`).join("")}</div></div></div>
<div class="stats-section-card"><h2 class="stats-section-title">\u{1F916} \u6309\u6A21\u578B\u7EDF\u8BA1</h2><div class="stat-mini-cards">${Object.entries(s.byModel).map(([m, v]) => `<div class="stat-mini-card"><div class="stat-mini-name">${escapeHtml(m)}</div><div class="stat-mini-requests">${formatNumber(v.requests)}</div><div class="stat-mini-tokens">${formatNumber(v.totalTokens)} tokens</div></div>`).join("")}</div></div>
${(s.details || []).length ? `<div class="stats-section-card"><h2 class="stats-section-title">\u{1F4CB} \u6700\u8FD1\u8BF7\u6C42</h2><div class="request-list-card"><div class="request-list-header"><h2 class="request-list-title">\u8BF7\u6C42\u5217\u8868</h2></div><div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>\u65F6\u95F4</th><th>\u7528\u6237</th><th>\u6A21\u578B</th><th>\u6A21\u578B\u7EC4</th><th>\u72B6\u6001</th><th>\u8017\u65F6</th><th>TTFT</th><th>TPS</th><th>\u8F93\u51FA</th><th>\u7F13\u5B58/\u8F93\u5165 (\u5360\u6BD4)</th></tr></thead><tbody>${s.details.map((r) => `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${escapeHtml(r.userName || "-")}</td><td title="${escapeHtml(r.customModel)}">${escapeHtml(r.customModel)}</td><td>${escapeHtml(r.modelGroup || "\u2014")}</td><td>${r.statusCode}</td><td>${formatDuration(r.durationMs)}</td><td>${r.ttftMs != null ? formatDuration(r.ttftMs) : "\u2014"}</td><td>${r.tps != null ? r.tps.toFixed(1) + " tok/s" : "\u2014"}</td><td>${formatNumber(r.completionTokens)}</td><td>${formatNumber(r.cachedTokens)}/${formatNumber(r.promptTokens)}</td></tr>`).join("")}</tbody></table></div><div class="pagination-info"></div><div class="pagination">${Array.from({ length: s.totalPages || 1 }, (_, i) => `<a href="?startDate=${s.startDate}&endDate=${s.endDate}&page=${i + 1}" class="${i + 1 === (s.page || 1) ? "active" : ""}">${i + 1}</a>`).join("")}</div></div></div>` : ""}`;
    const script = `<script>document.querySelectorAll('#filter-shortcuts button').forEach(function(b){b.addEventListener('click',function(){var d=parseInt(this.getAttribute('data-days'),10);var end=new Date();var start=new Date(end.getTime()-d*86400000);document.getElementById('start').value=start.toISOString().slice(0,10);document.getElementById('end').value=end.toISOString().slice(0,10);document.getElementById('stats-filter-form').submit()})})<\/script>`;
    return adminPage("\u7EDF\u8BA1 Dashboard", "/admin/stats", body, css11, version, script);
  }

  // web/src/styles/user_login.ts
  var css12 = `body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      margin-top: 0;
      color: #333;
      font-size: 1.5rem;
      text-align: center;
    }
    .error {
      background: #fee;
      color: #c00;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #fcc;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }
    button[type="submit"] {
      width: 100%;
      padding: 0.75rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 500;
    }
    button[type="submit"]:hover {
      background: #0056b3;
    }`;

  // web/src/views/loginStyles.ts
  var adminLoginCSS = "\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 1rem;\n          }\n\n          .login-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2.5rem;\n            box-shadow: var(--shadow-sm);\n            width: 100%;\n            max-width: 400px;\n          }\n\n          .login-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n            text-align: center;\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n            transition: border-color 0.2s, box-shadow 0.2s;\n          }\n\n          .form-input:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n            width: 100%;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-primary:hover {\n            box-shadow: 0 6px 20px hsl(245 75% 58% / 0.45);\n          }\n\n          .alert {\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          .alert-error {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n          }\n\n          .alert-warning {\n            background: #fffbeb;\n            border: 1px solid #fde68a;\n            color: #92400e;\n          }\n\n          @media (max-width: 480px) {\n            .login-card {\n              padding: 1.5rem;\n            }\n          }\n        ";

  // web/src/views/login.ts
  function adminLoginPage(isSetup, error) {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>\u7BA1\u7406\u5458\u767B\u5F55 - LLM Gateway</title><style>${adminLoginCSS}</style><style>${consoleCSS}</style></head><body><div class="login-card"><h1 class="login-title">${isSetup ? "\u{1F510} \u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801" : "\u{1F510} \u7BA1\u7406\u5458\u767B\u5F55"}</h1>${error ? `<div class="alert alert-error">${error}</div>` : ""}${isSetup ? '<div class="alert alert-warning">\u9996\u6B21\u4F7F\u7528\u8BF7\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801</div>' : ""}<form method="POST" action="/api/admin/login"><div class="form-group"><label class="form-label" for="password">\u5BC6\u7801</label><input class="form-input" type="password" id="password" name="password" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" required></div><button type="submit" class="btn btn-primary">${isSetup ? "\u8BBE\u7F6E\u5BC6\u7801" : "\u767B\u5F55"}</button></form></div></body></html>`;
  }
  function userLoginPage(error) {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>\u7528\u6237\u767B\u5F55 - LLM Gateway</title><style>${css12}</style><style>${consoleCSS}</style></head><body><div class="login-card"><h1>\u7528\u6237\u767B\u5F55</h1>${error ? `<div class="alert alert-error">${error}</div>` : ""}<form method="POST" action="/api/user/login"><div class="form-group"><label for="apikey">API Key</label><input type="password" id="apikey" name="apikey" placeholder="\u8BF7\u8F93\u5165 API Key" required></div><button type="submit" class="btn btn-primary">\u767B\u5F55</button></form></div></body></html>`;
  }

  // web/src/styles/user_home.ts
  var css13 = `:root {
              --primary: #6366f1;
              --primary-hover: #4f46e5;
              --success: #10b981;
              --success-bg: #d1fae5;
              --warning-bg: #fef3c7;
              --card-bg: #ffffff;
              --text-primary: #1f2937;
              --text-secondary: #6b7280;
              --border: #e5e7eb;
              --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              --radius: 12px;
              --radius-sm: 8px;
            }

            * {
              box-sizing: border-box;
            }

            body {
              background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
              min-height: 100vh;
              padding-bottom: 1.5rem;
            }

            .container {
              max-width: 650px;
              margin: 0 auto;
              padding: 0.75rem;
            }

            .announcement-banner {
              margin-bottom: 0.75rem;
              font-size: 0.8rem;
            }
            .announcement-banner h1, .announcement-banner h2, .announcement-banner h3 {
              margin-top: 0;
            }
            .announcement-banner p {
              margin-bottom: 0.5rem;
            }
            .announcement-banner code {
              background: rgba(99, 102, 241, 0.08);
              padding: 0.1rem 0.3rem;
              border-radius: 4px;
              font-size: 0.75rem;
            }
            .announcement-banner pre {
              background: rgba(99, 102, 241, 0.05);
              padding: 0.5rem 0.75rem;
              border-radius: var(--radius-sm);
              overflow-x: auto;
            }
            .announcement-banner pre code {
              background: none;
              padding: 0;
            }

            /* Hero \u533A\u57DF */
            .hero {
              text-align: center;
              padding: 0.75rem 0 0.5rem;
              margin-bottom: 0.75rem;
            }

            .hero h1 {
              font-size: 1.25rem;
              font-weight: 700;
              color: var(--text-primary);
              margin: 0 0 0.35rem 0;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }

            .hero-subtitle {
              font-size: 0.8rem;
              color: var(--text-secondary);
              margin: 0;
              line-height: 1.4;
            }

            .hero-notice {
              display: inline-block;
              margin-top: 0.5rem;
              padding: 0.3rem 0.6rem;
              background: var(--warning-bg);
              border-radius: var(--radius-sm);
              font-size: 0.7rem;
              color: #92400e;
            }

            .hero-notice strong {
              color: #dc2626;
            }

            /* \u5361\u7247\u6837\u5F0F */
            .card {
              background: var(--card-bg);
              border-radius: var(--radius);
              box-shadow: var(--shadow);
              padding: 0.6rem 0.85rem;
              margin-bottom: 0.5rem;
              border: 1px solid var(--border);
            }

            .card:hover {
              box-shadow: var(--shadow-lg);
            }

            .card-header {
              display: flex;
              align-items: center;
              gap: 0.4rem;
              margin-bottom: 0.5rem;
            }

            .card-header h2 {
              font-size: 0.85rem;
              font-weight: 600;
              color: var(--text-primary);
              margin: 0;
            }

            .card-icon {
              font-size: 1.1rem;
            }

            .model-count {
              font-size: 0.75rem;
              color: var(--text-secondary);
              font-weight: 400;
            }

            /* \u8F93\u5165\u6846\u548C\u9009\u62E9\u5668 */
            .input-wrapper {
              display: flex;
              align-items: center;
              gap: 0.4rem;
              background: #f9fafb;
              border: 1px solid var(--border);
              border-radius: var(--radius-sm);
              padding: 0.25rem;
            }

            .input-wrapper:focus-within {
              border-color: var(--primary);
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .input-value {
              flex: 1;
              font-size: 0.8rem;
              color: var(--text-primary);
              padding: 0.3rem 0.4rem;
              background: transparent;
              border: none;
              outline: none;
              font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
            }

            .input-value[readonly] {
              cursor: default;
            }

            select.input-value {
              cursor: pointer;
              font-family: inherit;
            }

            select.input-value option {
              font-family: inherit;
            }

            /* \u590D\u5236\u6309\u94AE */
            .copy-btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.3rem;
              padding: 0.3rem 0.5rem;
              font-size: 0.75rem;
              font-weight: 500;
              color: white;
              background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
              border: none;
              border-radius: var(--radius-sm);
              cursor: pointer;
              white-space: nowrap;
            }

            .copy-btn svg {
              width: 12px;
              height: 12px;
            }

            /* \u6A21\u578B\u63CF\u8FF0 */
            .model-desc {
              margin-top: 0.35rem;
              padding: 0.35rem 0.6rem;
              background: #f8fafc;
              border-left: 2px solid var(--primary);
              border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
              font-size: 0.75rem;
              color: var(--text-secondary);
              line-height: 1.4;
              display: none;
            }

            .model-desc.visible {
              display: block;
            }

            /* Model Group \u5207\u6362 */
            .model-group-toggle {
              display: flex;
              gap: 1rem;
              margin-bottom: 0.5rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid var(--border);
            }

            .toggle-option {
              display: flex;
              align-items: center;
              gap: 0.3rem;
              cursor: pointer;
            }

            .toggle-option input[type="radio"] {
              accent-color: var(--primary);
              cursor: pointer;
            }

            .toggle-option label {
              font-size: 0.8rem;
              color: var(--text-primary);
              cursor: pointer;
            }

            .model-inputs {
              flex-wrap: wrap;
            }

            .model-inputs select.input-value {
              min-width: 120px;
            }

            /* API Key \u6210\u529F\u63D0\u793A */
            .api-key-success {
              display: flex;
              align-items: center;
              gap: 0.4rem;
              padding: 0.5rem 0.75rem;
              background: var(--success-bg);
              border-radius: var(--radius-sm);
              font-size: 0.8rem;
              color: #065f46;
              font-weight: 500;
            }

            .api-key-success .check-icon {
              font-size: 1rem;
            }

            /* \u53C2\u8003\u4FE1\u606F\u533A\u57DF */
            .reference-section {
              margin-top: 1rem;
              padding-top: 0.75rem;
              border-top: 1px solid var(--border);
            }

            .reference-title {
              font-size: 0.8rem;
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: 0.5rem;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            }

            .reference-card {
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              border-radius: var(--radius);
              padding: 0.75rem;
              border: 1px solid var(--border);
            }

            /* \u6A21\u578B\u5217\u8868\u8868\u683C */
            .model-list-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.75rem;
            }
            .model-list-table thead tr {
              border-bottom: 1px solid var(--border);
            }
            .model-list-table th {
              text-align: left;
              padding: 0.4rem 0.6rem;
              color: var(--text-secondary);
              font-weight: 600;
            }
            .model-list-table tbody tr {
              border-bottom: 1px solid var(--border);
            }
            .model-list-table tbody tr:last-child {
              border-bottom: none;
            }
            .model-list-table td {
              padding: 0.35rem 0.6rem;
            }
            .model-list-table td:first-child {
              font-weight: 600;
            }
            .model-list-table td:not(:first-child) {
              color: var(--text-secondary);
            }

            .reference-item {
              font-size: 0.75rem;
              color: var(--text-secondary);
              line-height: 1.6;
              margin: 0.3rem 0;
            }

            .reference-item strong {
              color: var(--text-primary);
            }

            .reference-item code {
              display: inline-block;
              background: #eef2ff;
              color: var(--primary);
              padding: 0.15rem 0.3rem;
              border-radius: 4px;
              font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
              font-size: 0.7rem;
              margin: 0.15rem 0;
              word-break: break-all;
            }

            .reference-link {
              color: var(--primary);
              text-decoration: none;
              border-bottom: 1px solid transparent;
            }

            .reference-link:hover {
              border-bottom-color: var(--primary);
            }

            /* Toast \u63D0\u793A */
            .toast {
              position: fixed;
              top: 0.75rem;
              left: 50%;
              background: #1f2937;
              color: white;
              padding: 0.5rem 1rem;
              border-radius: var(--radius-sm);
              font-size: 0.75rem;
              font-weight: 500;
              box-shadow: var(--shadow-lg);
              opacity: 0;
              z-index: 9999;
            }

            .toast.show {
              opacity: 1;
            }

            .toast.success {
              background: var(--success);
            }

            .toast.error {
              background: #dc2626;
            }

            /* \u54CD\u5E94\u5F0F */
            @media (max-width: 640px) {
              .container {
                padding: 0.5rem;
              }

              .hero h1 {
                font-size: 1.1rem;
              }

              .hero-subtitle {
                font-size: 0.75rem;
              }

              .hero-notice {
                font-size: 0.65rem;
                padding: 0.25rem 0.5rem;
              }

              .input-wrapper {
                flex-wrap: wrap;
              }

              .input-value {
                width: 100%;
                min-width: 0;
              }

              .copy-btn {
                width: 100%;
                justify-content: center;
              }
            }`;

  // web/src/views/userHome.ts
  function userHomePage(p) {
    const cfg = JSON.stringify({ openai: { baseURL: location.origin + "/v1", apiKey: "sk-your-api-key" } }, null, 2);
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LLM Gateway - \u914D\u7F6E\u4FE1\u606F</title><style>${css13}</style><style>${consoleCSS}</style></head><body><div class="container-fluid"><div class="navbar"><a class="navbar-brand" href="/user/main">LLM Gateway</a><div class="navbar-menu"><a class="navbar-link" href="/user/stats">\u7EDF\u8BA1</a></div></div><div class="container"><div class="hero"><h1>\u{1F680} LLM Gateway</h1><p class="hero-subtitle">\u7EDF\u4E00\u7684\u5927\u6A21\u578B API \u7F51\u5173\uFF0C\u517C\u5BB9 OpenAI / Anthropic / Responses \u683C\u5F0F</p><a href="/user/stats" style="color:var(--primary);text-decoration:none;margin-right:0.75rem;font-size:0.8rem">\u7EDF\u8BA1</a></div>
${p.announcement ? `<div class="announcement-banner">${p.announcement}</div>` : ""}
${p.userName ? `<p>\u6B22\u8FCE\uFF0C${escapeHtml(p.userName)}</p>` : ""}
<div class="card"><div class="card-header"><span class="card-icon">\u{1F4CB}</span><h2>JSON \u914D\u7F6E</h2></div><div class="input-wrapper"><pre class="input-value" id="json-config">${escapeHtml(cfg)}</pre><button id="copy-json" class="copy-btn">\u590D\u5236</button></div></div>
<div class="card"><div class="card-header"><span class="card-icon">\u{1F310}</span><h2>Base URL</h2></div><div class="input-wrapper"><span class="input-value" id="base-url">${location.origin}/v1</span><button id="copy-base-url" class="copy-btn">\u590D\u5236</button></div></div>
<div class="card"><div class="card-header"><span class="card-icon">\u{1F916}</span><h2>\u6A21\u578B${p.modelGroups.length ? `<span class="model-count">\uFF08${p.models.length} \u4E2A\u6A21\u578B / ${p.modelGroups.length} \u4E2A\u6A21\u578B\u7EC4\uFF09</span>` : `<span class="model-count">\uFF08${p.models.length} \u4E2A\u53EF\u9009\uFF09</span>`}</h2></div>
${p.modelGroups.length ? `<div class="model-group-toggle"><div class="toggle-option"><label for="toggle-group">\u6A21\u578B\u7EC4</label><input type="radio" id="toggle-group" name="toggle" checked></div><div class="toggle-option"><label for="toggle-model">\u6A21\u578B</label><input type="radio" id="toggle-model" name="toggle"></div></div>` : ""}
<div class="input-wrapper model-inputs"><span class="input-value" id="model-value">${escapeHtml((p.modelGroups.length ? p.modelGroups : p.models)[0] || "")}</span><button id="copy-model" class="copy-btn">\u590D\u5236</button></div></div></div></div>
<script>document.querySelectorAll('.copy-btn').forEach(function(b){b.addEventListener('click',function(){var t=this.previousElementSibling;navigator.clipboard.writeText(t.textContent||'');this.textContent='\u5DF2\u590D\u5236';setTimeout(function(){b.textContent='\u590D\u5236'},1500)})})<\/script></body></html>`;
  }

  // web/src/views/userStats.ts
  function userStatsPage(s) {
    const successPct = s.totalRequests ? s.successfulRequests / s.totalRequests * 100 : 0;
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>\u4F7F\u7528\u7EDF\u8BA1 - LLM Gateway</title><style>:root{--primary:#6366f1;--green-gradient:linear-gradient(135deg,#10b981,#059669);--border:#e5e7eb}body{font-family:system-ui,sans-serif;background:#f8fafc;padding:2rem;color:#1f2937}.stats-page-title{font-size:1.6rem}.stats-page-subtitle{color:#6b7280}.filter-bar{display:flex;gap:1rem;margin:1.5rem 0}.filter-group{display:flex;flex-direction:column;gap:.25rem}.overview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}.overview-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.2rem}.overview-card--blue{border-top:3px solid #3b82f6}.overview-card--green{border-top:3px solid #10b981}.overview-card--orange{border-top:3px solid #f59e0b}.overview-card--purple{border-top:3px solid #8b5cf6}.overview-card-value{font-size:1.6rem;font-weight:700}</style><style>${consoleCSS}</style></head><body><h1 class="stats-page-title">\u{1F4CA} \u4F7F\u7528\u7EDF\u8BA1 \u2014 ${escapeHtml(s.userName)}</h1><p class="stats-page-subtitle">\u67E5\u770B API \u4F7F\u7528\u60C5\u51B5\u4E0E\u7EDF\u8BA1\u6570\u636E</p><div class="filter-bar"><form method="get" action="/user/stats" class="filter-form"><div class="filter-group"><label for="start">\u5F00\u59CB\u65E5\u671F</label><input type="date" id="start" name="startDate" value="${s.start}"></div><div class="filter-group"><label for="end">\u7ED3\u675F\u65E5\u671F</label><input type="date" id="end" name="endDate" value="${s.end}"></div><button type="submit" class="filter-submit">\u67E5\u8BE2</button></form></div>
${s.totalRequests ? `<div class="overview-grid"><div class="overview-card overview-card--blue"><div class="overview-card-label">\u603B\u8BF7\u6C42\u6570</div><div class="overview-card-value">${formatNumber(s.totalRequests)}</div><div class="overview-card-sub">\u6240\u6709 API \u8BF7\u6C42</div></div><div class="overview-card overview-card--green"><div class="overview-card-label">\u6210\u529F\u7387</div><div class="overview-card-value">${successPct.toFixed(1)}%</div><div class="overview-card-sub">${formatNumber(s.successfulRequests)} / ${formatNumber(s.totalRequests)}</div></div><div class="overview-card overview-card--orange"><div class="overview-card-label">\u603B Token</div><div class="overview-card-value">${formatNumber(s.totalTokens)}</div><div class="overview-card-sub">\u8F93\u5165 + \u8F93\u51FA</div></div><div class="overview-card overview-card--purple"><div class="overview-card-label">\u5E73\u5747\u5EF6\u8FDF</div><div class="overview-card-value">${formatDuration(s.avgDuration)}</div><div class="overview-card-sub">\u6BCF\u6B21\u8BF7\u6C42\u8017\u65F6</div></div></div><div class="token-card"><h2 class="token-card-title">\u{1F4C8} Token \u7528\u91CF\u660E\u7EC6</h2><table><thead><tr><th>\u6A21\u578B</th><th>\u8BF7\u6C42\u6570</th><th>Token</th></tr></thead><tbody>${Object.entries(s.byModel).map(([m, v]) => `<tr><td>${escapeHtml(m)}</td><td>${v.requests}</td><td>${formatNumber(v.totalTokens)}</td></tr>`).join("")}</tbody></table></div>` : '<div class="empty-state"><div class="empty-state-icon">\u{1F4ED}</div><div class="empty-state-text">\u6682\u65E0\u7EDF\u8BA1\u6570\u636E</div></div>'}</body></html>`;
  }

  // web/src/styles/admin_model_group_form.ts
  var css14 = '{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input,\n          .form-textarea {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus,\n          .form-textarea:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-hint {\n            display: block;\n            font-size: 0.78rem;\n            color: var(--text-secondary);\n            margin-top: 0.35rem;\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          .btn-small {\n            padding: 0.35rem 0.65rem;\n            font-size: 0.8rem;\n          }\n\n          .error-banner {\n            background: #fef2f2;\n            border: 1px solid #fecaca;\n            color: #ef4444;\n            padding: 0.85rem 1.15rem;\n            border-radius: var(--radius-sm);\n            margin-bottom: 1.5rem;\n            font-weight: 500;\n          }\n\n          /* \u6A21\u578B\u9009\u62E9\u5668\u6837\u5F0F */\n          .model-selector {\n            display: grid;\n            grid-template-columns: 1fr auto 1fr;\n            gap: 1rem;\n            margin-top: 0.5rem;\n          }\n\n          .model-list {\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            padding: 0.75rem;\n            max-height: 20rem;\n            overflow-y: auto;\n            background: var(--bg-page);\n          }\n          .model-filter-input {\n            margin-bottom: 0.75rem;\n          }\n\n          .model-list-title {\n            margin: 0 0 0.75rem 0;\n            font-size: 0.9rem;\n            font-weight: 600;\n            color: var(--text-secondary);\n          }\n\n          .model-list-empty {\n            color: var(--text-secondary);\n            font-size: 0.85rem;\n          }\n\n          .model-item {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            padding: 0.5rem;\n            margin-bottom: 0.25rem;\n            border-radius: 6px;\n            background-color: var(--bg-card);\n          }\n\n          .model-item-name {\n            font-size: 0.85rem;\n          }\n\n          .model-item-name small {\n            color: var(--text-secondary);\n          }\n\n          .model-item-desc {\n            color: var(--text-secondary);\n          }\n\n          .model-list-hint {\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n            align-items: center;\n            gap: 0.5rem;\n            color: var(--text-secondary);\n            font-size: 0.85rem;\n          }\n\n          .model-list.selected {\n            background-color: #eef2ff;\n            border-color: #c7d2fe;\n          }\n\n          .model-item.selected {\n            background-color: var(--bg-card);\n            border: 1px solid #c7d2fe;\n          }\n\n          .selected-index {\n            color: var(--text-secondary);\n            font-size: 12px;\n            min-width: 20px;\n          }\n\n          .model-actions {\n            display: flex;\n            gap: 0.25rem;\n          }\n\n          .btn-icon {\n            padding: 2px 6px;\n            font-size: 12px;\n            min-width: 24px;\n          }\n\n          .btn-icon.disabled {\n            opacity: 0.5;\n            pointer-events: none;\n          }\n\n          /* \u590D\u9009\u6846\u6A21\u5F0F */\n          .checkbox-list {\n            display: flex;\n            flex-direction: column;\n            gap: 0.5rem;\n          }\n\n          .checkbox-item {\n            display: flex;\n            align-items: center;\n            gap: 0.5rem;\n            padding: 0.5rem;\n            border-radius: 6px;\n            background-color: var(--bg-card);\n            cursor: pointer;\n          }\n\n          .checkbox-item:hover {\n            background-color: #f0f0f5;\n          }\n\n          .checkbox-item input[type="checkbox"] {\n            width: 16px;\n            height: 16px;\n            accent-color: var(--accent-color);\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n            .model-selector { grid-template-columns: 1fr; }\n            .model-list-hint { display: none; }\n          }\n        `}';

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
    return adminPage(isEdit ? "\u7F16\u8F91 Model Group" : "\u65B0\u589E Model Group", "/admin/model-groups", body, css14, version);
  }

  // web/src/styles/admin_user_form.ts
  var css15 = "{`\n          :root {\n            --bg-page: #f8f9fb;\n            --bg-card: #ffffff;\n            --text-primary: #1a1d26;\n            --text-secondary: #646a7e;\n            --accent-gradient: linear-gradient(135deg, hsl(245 80% 58%) 0%, hsl(268 75% 58%) 100%);\n            --accent-color: hsl(245 80% 58%);\n            --border-color: #e5e7eb;\n            --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);\n            --radius: 14px;\n            --radius-sm: 8px;\n          }\n\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n\n          body {\n            font-family: system-ui, -apple-system, sans-serif;\n            background: var(--bg-page);\n            color: var(--text-primary);\n            line-height: 1.6;\n            min-height: 100vh;\n          }\n\n          .form-card {\n            background: var(--bg-card);\n            border: 1px solid var(--border-color);\n            border-radius: var(--radius);\n            padding: 2rem;\n            box-shadow: var(--shadow-sm);\n          }\n\n          .form-title {\n            font-family: system-ui, -apple-system, sans-serif;\n            font-weight: 700;\n            font-size: 1.5rem;\n            margin-bottom: 1.5rem;\n            color: var(--text-primary);\n          }\n\n          .form-group {\n            margin-bottom: 1.25rem;\n          }\n\n          .form-label {\n            display: block;\n            font-size: 0.85rem;\n            font-weight: 600;\n            color: var(--text-primary);\n            margin-bottom: 0.4rem;\n          }\n\n          .form-input {\n            width: 100%;\n            padding: 0.7rem 0.9rem;\n            border: 1.5px solid var(--border-color);\n            border-radius: var(--radius-sm);\n            font-size: 0.92rem;\n            background: var(--bg-page);\n            font-family: inherit;\n            outline: none;\n          }\n\n          .form-input:focus {\n            border-color: var(--accent-color);\n            box-shadow: 0 0 0 3px hsl(245 80% 58% / 0.12);\n            background: var(--bg-card);\n          }\n\n          .form-hint {\n            display: block;\n            font-size: 0.78rem;\n            color: var(--text-secondary);\n            margin-top: 0.35rem;\n          }\n\n          .apikey-display {\n            margin-bottom: 1rem;\n            padding: 0.75rem;\n            background: var(--bg-page);\n            border-radius: var(--radius-sm);\n          }\n\n          .apikey-label {\n            display: block;\n            margin-bottom: 0.5rem;\n            font-weight: 600;\n          }\n\n          .apikey-code {\n            font-size: 0.9rem;\n            color: var(--text-secondary);\n            font-family: 'DM Mono', monospace;\n          }\n\n          .apikey-note {\n            font-size: 0.8rem;\n            color: var(--text-secondary);\n            margin-top: 0.5rem;\n          }\n\n          .form-actions {\n            display: flex;\n            gap: 0.75rem;\n            margin-top: 1.5rem;\n          }\n\n          .btn {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            gap: 0.4rem;\n            padding: 0.7rem 1.3rem;\n            border-radius: var(--radius-sm);\n            font-size: 0.88rem;\n            font-weight: 600;\n            text-decoration: none;\n            cursor: pointer;\n            border: none;\n          }\n\n          .btn-primary {\n            background: var(--accent-gradient);\n            color: #fff;\n            box-shadow: 0 4px 14px hsl(245 75% 58% / 0.35);\n          }\n\n          .btn-secondary {\n            background: var(--bg-card);\n            color: var(--text-primary);\n            box-shadow: var(--shadow-sm);\n            border: 1px solid var(--border-color);\n          }\n\n          @media (max-width: 768px) {\n            .main-content { padding: 1.5rem 1rem 3rem !important; }\n            .form-card { padding: 1.5rem; }\n          }\n        `}";

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
    return adminPage(title, "/admin/users", body, css15, version);
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
    "/admin/models/new": () => modelFormPage(void 0, []),
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
      return modelFormPage(models.find((x) => x.customModel === decodeURIComponent(m[1])), []);
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
