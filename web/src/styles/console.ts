// Bright console shell shared by every page. Page renderers own the markup;
// this layer owns the visual system: spacing, cards, tables, forms, nav,
// responsive behavior. No pixel chasing — functional, readable, deliberate.
export const consoleCSS = `
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
.topbar-brand::before{content:"◆";color:var(--gw-accent);font-size:.9rem}
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
`
