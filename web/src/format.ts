export function formatNumber(n: number): string { return Number(n || 0).toLocaleString('en-US') }
export function formatDuration(ms: number): string { const v = Number(ms || 0); if (v < 1000) return `${v}ms`; if (v < 60000) return `${(v/1000).toFixed(1)}s`; return `${Math.floor(v/60000)}m ${Math.floor((v%60000)/1000)}s` }
export function formatPct(n: number): string { return `${(n*100).toFixed(1)}%` }
export function escapeHtml(s: unknown): string { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)) }
