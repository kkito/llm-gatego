import { navigate } from './router.js'

export interface ApiEnvelope<T = unknown> {
  ok: boolean
  data?: T
  error?: { code?: string; message?: string }
  redirect?: string
}

export async function api<T = unknown>(path: string, opts?: RequestInit): Promise<ApiEnvelope<T>> {
  const r = await fetch(path, opts)
  const j = await r.json() as ApiEnvelope<T>
  if (!j.ok) throw new Error(j.error?.message || 'HTTP ' + r.status)
  return j
}

export function post<T = unknown>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  return api<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

/** Serialize a form into the JSON shape expected by /api/admin endpoints. */
export function formToObject(form: HTMLFormElement): Record<string, any> {
  const out: Record<string, any> = {}
  for (const el of Array.from(form.elements) as any[]) {
    const name: string = el.name
    if (!name || el.disabled) continue
    if (el.type === 'checkbox') out[name] = !!el.checked
    else if (el.type === 'radio') { if (el.checked) out[name] = el.value }
    else if (el.multiple) {
      const values: string[] = []
      for (const opt of Array.from(el.options) as HTMLOptionElement[]) if (opt.selected) values.push(opt.value)
      out[name] = values
    } else if (el.type === 'number') out[name] = el.value === '' ? null : Number(el.value)
    else out[name] = el.value
  }
  return out
}

/** Choose the navigation target after a successful write. */
export function afterWrite(res: ApiEnvelope<unknown>, fallback?: string): string | undefined {
  return res.redirect || fallback
}

export async function postAndNavigate<T = unknown>(path: string, body: unknown, fallback?: string): Promise<ApiEnvelope<T>> {
  const res = await post<T>(path, body)
  const target = afterWrite(res, fallback)
  if (target) navigate(target)
  return res
}

export function submitAndNavigate<T = unknown>(form: HTMLFormElement, path: string, fallback?: string): Promise<ApiEnvelope<T>> {
  return postAndNavigate<T>(path, formToObject(form), fallback)
}
