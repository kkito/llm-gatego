/** Small URL helpers for page-local data loading. */
export function pathSegments(path: string): string[] {
  return path.split('?')[0].split('#')[0].split('/').filter(Boolean)
}

export function searchOf(path: string): string {
  const i = path.indexOf('?')
  if (i < 0) return ''
  const hash = path.indexOf('#', i)
  return hash < 0 ? path.slice(i) : path.slice(i, hash)
}

export function queryParam(path: string, name: string): string {
  return new URLSearchParams(searchOf(path)).get(name) || ''
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
