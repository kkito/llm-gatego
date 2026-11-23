export function formatNumber(n: number): string { return n.toLocaleString('en-US') }
export function formatDuration(ms: number): string { if (ms < 1000) return `${ms}ms`; if (ms < 60000) return `${(ms/1000).toFixed(1)}s`; return `${Math.floor(ms/60000)}m ${Math.floor((ms%60000)/1000)}s` }
export function formatPct(n: number): string { return `${(n*100).toFixed(1)}%` }
export function escapeHtml(s: unknown): string { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)) }
