// Lazy + cached JSON loader factory. Used for Unicode blocks/characters
// so each per-block file is fetched at most once per session.

import { fetchJson } from './ssr-fetch'

export interface JsonFetcher {
  <T>(path: string): Promise<T>
}

export function createLazyJsonLoader<T>(
  path: string,
  transform: (raw: any, path: string) => T | Promise<T>,
) {
  let cached: T | null = null
  let pending: Promise<T> | null = null
  return {
    async load(): Promise<T> {
      if (cached !== null) return cached
      if (pending) return pending
      pending = (async () => {
        const raw = await fetchJson<any>(path)
        const out = await transform(raw, path)
        cached = out
        return out
      })()
      return pending
    },
    clear() {
      cached = null
      pending = null
    },
  }
}

export function createKeyedJsonLoader<T>(
  pathFn: (key: string) => string,
  transform: (raw: any, key: string) => T | Promise<T>,
) {
  const cache = new Map<string, T>()
  return {
    async load(key: string): Promise<T> {
      const hit = cache.get(key)
      if (hit !== undefined) return hit
      const raw = await fetchJson<any>(pathFn(key))
      const out = await transform(raw, key)
      cache.set(key, out)
      return out
    },
    clear() {
      cache.clear()
    },
  }
}