// Per-page refinements on top of the shared console system. Each block maps
// to one original llm-gateway page and keeps its interactions intact.
export const pageCSS = `
/* 模型管理 */
.models-table .model-name-cell{display:flex;flex-direction:column;gap:2px}
.models-table .model-custom-name{font-weight:700;color:var(--gw-ink)}
.models-table .model-real-name{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.72rem;color:var(--gw-muted)}
.models-table .model-desc-cell{max-width:240px;white-space:normal;color:var(--gw-muted)}
.actions-cell{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.order-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--gw-line);background:#fff;color:var(--gw-muted);cursor:pointer;font-weight:700}
.order-btn:hover:not(:disabled){border-color:var(--gw-accent);color:var(--gw-accent)}
.order-btn:disabled{opacity:.35;cursor:not-allowed}
.model-count{margin:0 0 12px;color:var(--gw-muted);font-size:.82rem}

/* 用户管理 */
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

/* 模型组 */
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

/* 表单页 */
.form-card{padding:20px 22px}
.form-card>.form-group,.form-card>.form-title{margin-left:0}
.form-card .btn-submit{min-width:120px}
.test-details{margin-top:16px;border:1px solid var(--gw-line);border-radius:10px;background:#fff}
.test-details summary{padding:12px 14px;cursor:pointer;font-weight:700;color:var(--gw-ink)}
.test-details[open] summary{border-bottom:1px solid var(--gw-line)}
.test-details>div{padding:14px}
.preview-content{background:#F9FAFB;border:1px solid var(--gw-line);border-radius:8px;padding:10px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.76rem;white-space:pre-wrap;word-break:break-all;max-height:220px;overflow:auto}

/* 限制 */
.limits-card{padding:16px 18px}
.limits-subtitle{margin:0 0 12px;color:var(--gw-muted);font-size:.82rem}
.limits-table td,.limits-table th{vertical-align:middle}

/* 统计 */
.overview-card--blue::before{background:#2563EB}
.stats-section-card,.request-list-card{padding:16px 18px;margin-bottom:16px}
.mini-bar-track{height:6px;background:#E9EEF7;border-radius:999px;overflow:hidden}
.mini-bar-fill{height:100%;background:var(--gw-accent);border-radius:999px}
.stat-mini-card{padding:12px 14px}
.filter-shortcuts .btn{padding:5px 10px;font-size:.76rem}

/* 公告/密码/隐私 */
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
`
