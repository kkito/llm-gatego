export type RouteListener = (path: string) => void

const listeners = new Set<RouteListener>()
let started = false
let cleanup: (() => void) | undefined

function emit(): void {
  const path = currentPath()
  for (const listener of listeners) listener(path)
}

export function currentPath(): string {
  return location.pathname + location.search + location.hash
}

export function navigate(path: string, options: { replace?: boolean } = {}): void {
  if (path === currentPath()) return
  if (options.replace) history.replaceState({}, '', path)
  else history.pushState({}, '', path)
  emit()
}

export function subscribe(listener: RouteListener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function onClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const target = event.target as Element | null
  const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.rel.split(' ').includes('external')) return
  const url = new URL(anchor.href, location.href)
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return
  event.preventDefault()
  navigate(url.pathname + url.search + url.hash)
}

export function startRouter(doc: Document = document, win: Window = window): () => void {
  if (started) return () => {}
  started = true
  const onPop = () => emit()
  win.addEventListener('popstate', onPop)
  doc.addEventListener('click', onClick as EventListener)
  cleanup = () => {
    win.removeEventListener('popstate', onPop)
    doc.removeEventListener('click', onClick as EventListener)
    listeners.clear()
    started = false
    cleanup = undefined
  }
  return cleanup
}

export function stopRouter(): void { cleanup?.() }
