// SSR-aware fetch. During vite-ssg build, reads files synchronously from
// disk; in the browser, uses regular fetch. Both return the same shape.
//
// `node:fs` and `node:path` are dynamically imported only when SSR is true,
// so the browser bundle never resolves them. Vite tree-shakes the
// conditional dynamic import away when isSSR=false.

const isSSR = import.meta.env.SSR

export async function fetchJson<T>(path: string): Promise<T> {
  if (isSSR) {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const fullPath = resolve(process.cwd(), 'public', path)
    const raw = readFileSync(fullPath, 'utf8')
    return JSON.parse(raw) as T
  }
  return fetch(`/${path}`).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status} for /${path}`))) as Promise<T>
}

export async function fetchText(path: string): Promise<string> {
  if (isSSR) {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const fullPath = resolve(process.cwd(), 'public', path)
    return readFileSync(fullPath, 'utf8')
  }
  return fetch(`/${path}`).then(r => r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status} for /${path}`)))
}

// Build-time-only data fetch. Reads from `data/` (NOT `public/`) during
// SSG so large reference data (e.g. Unihan, 80 MB across CJK blocks)
// doesn't get deployed. Returns null on the client in production —
// callers must handle that (typically by hiding the section).
//
// In dev mode, the vite `serve-data-dir` plugin exposes /data/* so the
// browser can fetch the same files for hot-reload iteration.
export async function fetchBuildData<T>(path: string): Promise<T | null> {
  if (isSSR) {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const fullPath = resolve(process.cwd(), 'data', path)
    try {
      const raw = readFileSync(fullPath, 'utf8')
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
  // Dev mode: fetch via the vite middleware. In production builds this
  // path doesn't exist (data/ isn't deployed) and we return null.
  if (import.meta.env.DEV) {
    try {
      const res = await fetch(`/data/${path}`)
      if (!res.ok) return null
      return (await res.json()) as T
    } catch {
      return null
    }
  }
  return null
}