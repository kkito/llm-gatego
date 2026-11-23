// v1.15.0 console shell — operator-first dark UI, centered on desktop,
// single-column + scrollable nav on mobile. Kept in one layer so page-level
// styles keep owning their component markup; this file only owns the shell.
export const consoleCSS = `
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
.topbar-brand::before{content:"◈";color:var(--gw-signal);font-size:1.25rem}
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
`
