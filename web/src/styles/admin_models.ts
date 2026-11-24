// Fluent-style sample page tokens/layout for /admin/models.
// Component internals are styled by @fluentui/web-components; this file only
// owns page-level layout, typography, and the native table shell.
export const modelsCSS = `
:root{
  --f-bg:var(--neutralLayer2,#F5F5F5);
  --f-surface:var(--neutralLayer1,#FFFFFF);
  --f-text:var(--neutralForeground1,#242424);
  --f-muted:var(--neutralForeground3,#616161);
  --f-line:var(--neutralStroke2,#E0E0E0);
  --f-brand:var(--brandForeground1,#0F6CBD);
  --f-danger:var(--paletteRedForeground1,#B10E1C);
}
body{background:var(--f-bg);color:var(--f-text)}
.f-page{max-width:1180px;margin:0 auto;padding:28px 20px 56px}
.f-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:20px;flex-wrap:wrap}
.f-eyebrow{font-size:11px;letter-spacing:.14em;font-weight:700;color:var(--f-muted);text-transform:uppercase;margin-bottom:6px}
.f-title{font-size:28px;line-height:1.2;margin:0 0 6px;font-weight:600}
.f-subtitle{margin:0;color:var(--f-muted);font-size:13px}
.f-commandbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.f-card{background:var(--f-surface);border:1px solid var(--f-line);border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.04);overflow:hidden}
.f-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px 14px}
.f-card-title{margin:0;font-size:16px;font-weight:600}
.f-card-sub{margin:3px 0 0;font-size:12px;color:var(--f-muted)}
.f-table-wrap{overflow-x:auto}
.f-table{width:100%;border-collapse:collapse;font-size:13px}
.f-table th{text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--f-muted);font-weight:600;padding:10px 16px;background:rgba(0,0,0,.015);border-bottom:1px solid var(--f-line);white-space:nowrap}
.f-table td{padding:12px 16px;border-bottom:1px solid var(--f-line);vertical-align:middle}
.f-row:last-child td{border-bottom:0}
.f-row:hover td{background:rgba(0,0,0,.018)}
.f-row.is-hidden{opacity:.62}
.f-index{width:52px}
.f-model-name{font-weight:600;color:var(--f-text)}
.f-model-real{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--f-muted);margin-top:3px}
.f-desc{color:var(--f-muted);max-width:260px}
.f-state{width:96px}
.f-actions{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.f-actions fluent-button,.f-actions fluent-anchor-button{min-width:30px}
.f-danger{color:var(--f-danger)}
.f-empty{padding:64px 20px;text-align:center;color:var(--f-muted)}
.f-empty-mark{font-size:40px;color:var(--f-brand);line-height:1}
.f-empty h3{margin:12px 0 4px;color:var(--f-text);font-size:16px}
.f-empty p{margin:0 0 16px;font-size:13px}
fluent-message-bar{margin-bottom:16px;display:block}
@media(max-width:820px){.f-page{padding:18px 12px 40px}.f-title{font-size:23px}.f-head{align-items:flex-start}.f-table th,.f-table td{padding:10px}}
`
