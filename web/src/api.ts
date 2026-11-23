export interface ApiEnvelope<T = unknown> { ok: boolean; data?: T; error?: { code?: string; message?: string } }
export async function api<T = unknown>(path: string, opts?: RequestInit): Promise<ApiEnvelope<T>> {
  const r = await fetch(path, opts)
  const j = await r.json() as ApiEnvelope<T>
  if (!j.ok) throw new Error(j.error?.message || 'HTTP ' + r.status)
  return j
}
export function post<T = unknown>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  return api<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
