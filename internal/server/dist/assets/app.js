"use strict";
var GwWeb = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // web/src/app.ts
  var app_exports = {};
  __export(app_exports, {
    bindEvents: () => bindEvents,
    loadPage: () => loadPage,
    mount: () => mount,
    pageForHash: () => pageForHash,
    post: () => post,
    renderLogin: () => renderLogin,
    renderModelForm: () => renderModelForm
  });

  // web/src/api.ts
  async function api(path, opts) {
    const r = await fetch(path, opts);
    const j = await r.json();
    if (!j.ok) throw new Error(j.error?.message || "HTTP " + r.status);
    return j;
  }
  function post(path, body) {
    return api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  // web/src/gw-card.ts
  var GwCard = class extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `:host{display:block;background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);border-radius:12px;padding:20px;box-shadow:0 10px 30px -20px rgba(0,0,0,.6)}.card-title{font-weight:600;font-size:1.1rem}.card-eyebrow{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#6b7280)}`;
      shadow.appendChild(style);
      const wrap = document.createElement("div");
      wrap.innerHTML = `<div class="card-eyebrow"><slot name="eyebrow"></slot></div><div class="card-title"><slot name="title"></slot></div><div class="body"><slot></slot></div>`;
      shadow.appendChild(wrap);
    }
  };
  if (!customElements.get("gw-card")) customElements.define("gw-card", GwCard);

  // web/src/gw-modal.ts
  var GwModal = class extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `:host{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.4);z-index:50}:host([open]){display:flex}.dialog{background:#fff;border-radius:12px;padding:24px;min-width:320px;max-width:90vw}`;
      shadow.appendChild(style);
      const dialog = document.createElement("div");
      dialog.className = "dialog";
      dialog.innerHTML = `<div class="head"><slot name="title"></slot></div><div class="body"><slot></slot></div><div class="actions"><slot name="actions"></slot></div>`;
      shadow.appendChild(dialog);
    }
    open() {
      this.setAttribute("open", "");
    }
    close() {
      this.removeAttribute("open");
    }
  };
  if (!customElements.get("gw-modal")) customElements.define("gw-modal", GwModal);

  // web/src/gw-stat.ts
  var GwStat = class extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `:host{display:inline-block;min-width:140px;padding:14px 18px;border:1px solid var(--line,#e5e7eb);border-radius:10px}.value{font-size:1.8rem;font-weight:700}.label{font-size:.78rem;color:var(--muted,#6b7280)}`;
      shadow.appendChild(style);
      const wrap = document.createElement("div");
      wrap.innerHTML = `<div class="value"><slot name="value"></slot></div><div class="label"><slot name="label"></slot></div>`;
      shadow.appendChild(wrap);
    }
  };
  if (!customElements.get("gw-stat")) customElements.define("gw-stat", GwStat);

  // web/src/gw-table.ts
  var GwTable = class extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `:host{display:block;overflow-x:auto}.head{display:flex;font-weight:600;border-bottom:1px solid var(--line,#e5e7eb)}.body{display:block}`;
      shadow.appendChild(style);
      const head = document.createElement("div");
      head.className = "head";
      head.innerHTML = '<slot name="head"></slot>';
      shadow.appendChild(head);
      const body = document.createElement("div");
      body.className = "body";
      body.innerHTML = "<slot></slot>";
      shadow.appendChild(body);
    }
  };
  if (!customElements.get("gw-table")) customElements.define("gw-table", GwTable);

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

  // web/src/pages/models.ts
  function renderModels(models) {
    if (!models.length) return '<p class="empty">No models configured</p>';
    return `<gw-table><tr slot="head"><th>Model</th><th>Real model</th><th>Provider</th><th>Actions</th></tr>${models.map((m) => `<tr data-model="${escapeHtml(m.customModel)}"><td>${escapeHtml(m.customModel)}${m.hidden ? ' <span class="badge">hidden</span>' : ""}</td><td>${escapeHtml(m.realModel)}</td><td>${escapeHtml(m.provider)}</td><td><button data-action="edit" data-model="${escapeHtml(m.customModel)}">Edit</button><button data-action="delete" data-model="${escapeHtml(m.customModel)}">Delete</button><button data-action="copy" data-model="${escapeHtml(m.customModel)}">Copy</button><button data-action="toggle-hidden" data-model="${escapeHtml(m.customModel)}">${m.hidden ? "Show" : "Hide"}</button><button data-action="move-up" data-model="${escapeHtml(m.customModel)}">\u2191</button><button data-action="move-down" data-model="${escapeHtml(m.customModel)}">\u2193</button></td></tr>`).join("")}</gw-table>`;
  }
  function renderModelForm(model) {
    const m = model || {};
    return `<form id="model-form"><label>Name <input name="customModel" value="${escapeHtml(m.customModel || "")}" required></label><label>Real model <input name="realModel" value="${escapeHtml(m.realModel || "")}"></label><label>Provider <select name="provider">${["openai", "anthropic", "response-api"].map((p) => `<option value="${p}"${p === m.provider ? " selected" : ""}>${p}</option>`).join("")}</select></label><label>Base URL <input name="baseUrl" value="${escapeHtml(m.baseUrl || "")}"></label><label>API Key <input name="apiKey" type="password"></label><label>Description <input name="desc" value="${escapeHtml(m.desc || "")}"></label><button type="submit">Save</button></form>`;
  }

  // web/src/pages/groups.ts
  function renderGroups(groups) {
    if (!groups.length) return '<p class="empty">No model groups</p>';
    return `<gw-table><tr slot="head"><th>Group</th><th>Models</th><th>Actions</th></tr>${groups.map((g) => `<tr data-group="${escapeHtml(g.name)}"><td>${escapeHtml(g.name)}</td><td>${g.models.map(escapeHtml).join(", ")}</td><td><button data-action="add-model" data-group="${escapeHtml(g.name)}">Add model</button><button data-action="remove-group" data-group="${escapeHtml(g.name)}">Delete</button></td></tr>`).join("")}</gw-table>`;
  }

  // web/src/pages/users.ts
  function renderUsers(users) {
    if (!users.length) return '<p class="empty">No users configured</p>';
    return `<gw-table><tr slot="head"><th>Name</th><th>Allowed models</th><th>Actions</th></tr>${users.map((u) => `<tr data-user="${escapeHtml(u.name)}"><td>${escapeHtml(u.name)}</td><td>${(u.allowedModels || []).map(escapeHtml).join(", ")}</td><td><button data-action="edit-user" data-user="${escapeHtml(u.name)}">Edit</button><button data-action="toggle-user" data-user="${escapeHtml(u.name)}">Toggle</button><button data-action="delete-user" data-user="${escapeHtml(u.name)}">Delete</button></td></tr>`).join("")}</gw-table>`;
  }

  // web/src/pages/apiKeys.ts
  function renderApiKeys(keys) {
    return `<gw-table><tr slot="head"><th>Name</th><th>Key</th><th>Actions</th></tr>${keys.map((k) => `<tr data-id="${escapeHtml(k.id)}"><td>${escapeHtml(k.name)}</td><td>${escapeHtml(k.key)}</td><td><button data-action="delete-key" data-id="${escapeHtml(k.id)}">Delete</button></td></tr>`).join("")}</gw-table>`;
  }

  // web/src/pages/stats.ts
  function renderStats(stats) {
    const s = stats.summary;
    return `<div class="stats-grid"><gw-stat><span slot="value">${formatNumber(s.totalRequests)}</span><span slot="label">Requests</span></gw-stat><gw-stat><span slot="value">${formatNumber(s.totalTokens)}</span><span slot="label">Tokens</span></gw-stat><gw-stat><span slot="value">${formatDuration(s.avgTtft)}</span><span slot="label">Avg TTFT</span></gw-stat><gw-stat><span slot="value">${s.avgTps.toFixed(1)}</span><span slot="label">Avg TPS</span></gw-stat></div><gw-table><tr slot="head"><th>Model</th><th>Requests</th><th>Tokens</th></tr>${stats.byModel.map((m) => `<tr><td>${escapeHtml(m.model)}</td><td>${m.requests}</td><td>${m.tokens}</td></tr>`).join("")}</gw-table>`;
  }

  // web/src/pages/privacy.ts
  function renderPrivacy(p) {
    return `<form id="privacy-form">${["enabled", "stripUserField", "sanitizeFilePaths", "whitelistFilter"].map((k) => `<label><input type="checkbox" name="${k}"${p[k] ? " checked" : ""}> ${k}</label>`).join("")}<label>Placeholder <input name="pathPlaceholder" value="${p.pathPlaceholder || "USER"}"></label><button type="submit">Save</button></form>`;
  }

  // web/src/pages/home.ts
  function renderHome(groups) {
    if (!groups.length) return '<p class="empty">No model groups available</p>';
    return groups.map((g) => `<gw-card><span slot="title">${escapeHtml(g.name)}</span><ul>${g.models.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul></gw-card>`).join("");
  }

  // web/src/pages/login.ts
  function renderLogin(user = false) {
    return `<form id="login-form"><h1>${user ? "User login" : "Admin login"}</h1><label>${user ? "API Key" : "Password"} <input name="${user ? "apikey" : "password"}" type="password" required></label><button type="submit">Login</button></form>`;
  }

  // web/src/app.ts
  function pageForHash(hash) {
    const path = hash.replace(/^#\/?/, "").split("/")[0];
    return path || "home";
  }
  function bindEvents(root, handlers) {
    root.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (el && handlers[el.dataset.action || ""]) handlers[el.dataset.action || ""](el);
    });
  }
  async function loadPage(page) {
    try {
      if (page === "models") return renderModels((await api("/api/admin/models")).data || []);
      if (page === "groups") return renderGroups((await api("/api/admin/model-groups")).data || []);
      if (page === "users") return renderUsers((await api("/api/admin/users")).data || []);
      if (page === "api-keys") return renderApiKeys((await api("/api/admin/api-keys")).data || []);
      if (page === "stats") return renderStats((await api("/api/stats")).data || { summary: { totalRequests: 0, totalTokens: 0, avgTtft: 0, avgTps: 0, avgDuration: 0 }, byModel: [] });
      if (page === "privacy") return renderPrivacy((await api("/api/admin/privacy")).data || { enabled: false, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: "USER" });
      if (page === "home") return renderHome((await api("/api/admin/model-groups")).data || []);
      if (page === "login") return renderLogin();
    } catch (e) {
      return `<p class="error">${e.message}</p>`;
    }
    return '<p class="empty">Not found</p>';
  }
  async function mount(root) {
    const render = async () => {
      root.innerHTML = await loadPage(pageForHash(location.hash));
    };
    window.addEventListener("hashchange", render);
    await render();
  }
  return __toCommonJS(app_exports);
})();
