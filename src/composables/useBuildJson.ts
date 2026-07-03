// useBuildJson<T>: SSR-aware data loader for build-time JSON files.
//
// Replaces the 5 inline SSR-vs-client fetch dances across pages.
// One composable, one error contract, one place to add retry / cache / etc.
//
// During SSG: reads from filesystem via fetchBuildData (server-side).
// During client navigation: fetches from BASE_URL + path.
// On failure: returns null (caller renders empty state).

import { ref, type Ref } from 'vue'
import { fetchBuildData } from '../lib/ssr-fetch'

export async function useBuildJson<T>(path: string): Promise<Ref<T | null>> {
  const data = ref<T | null>(null) as Ref<T | null>

  try {
    if (import.meta.env.SSR) {
      data.value = await fetchBuildData<T>(path)
    } else {
      const res = await fetch(`${import.meta.env.BASE_URL}${path}`)
      data.value = (await res.json()) as T
    }
  } catch (e) {
    console.warn(`useBuildJson: failed to load ${path}`, e)
    data.value = null
  }

  return data
}

// Search-index variant: only client-side, lazy-loaded. Used by SiteSearch
// + SearchPage which don't bake search results into SSG output.
export async function useLazyJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}${path}`)
    return (await res.json()) as T
  } catch {
    return null
  }
}
