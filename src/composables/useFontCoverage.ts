import { ref, type Ref } from 'vue'
import { fetchJson } from '../lib/ssr-fetch'

// Load per-block font coverage data. Returns a Set of codepoints the
// font has glyphs for, plus summary counts. Used by UnicodeBlockPage
// (tofu highlighting) and any page that needs to check if a specific
// codepoint is covered.
//
// @example
//   const { coveredSet, summary, load } = useFontCoverage()
//   await load('cjk-unified-ideographs')
//   const isMissing = (cp: number) => coveredSet.value && !coveredSet.value.has(cp)

export interface CoverageSummary {
  covered_count: number
  assigned_count: number
  uncovered_count: number
  unassigned_count: number
  total_range: number
  pct: number
  status: string
}

export function useFontCoverage(): {
  coveredSet: Ref<Set<number> | null>
  summary: Ref<CoverageSummary | null>
  load: (slug: string) => Promise<void>
} {
  const coveredSet = ref<Set<number> | null>(null)
  const summary = ref<CoverageSummary | null>(null)

  async function load(slug: string): Promise<void> {
    try {
      const data = await fetchJson<{
        covered: number[]
        covered_count: number
        assigned_count: number
        uncovered_count: number
        unassigned_count: number
        total_range: number
        pct: number
        status: string
      }>(`coverage/${slug}.json`)
      coveredSet.value = new Set(data.covered)
      summary.value = {
        covered_count: data.covered_count,
        assigned_count: data.assigned_count,
        uncovered_count: data.uncovered_count,
        unassigned_count: data.unassigned_count,
        total_range: data.total_range,
        pct: data.pct,
        status: data.status,
      }
    } catch {
      coveredSet.value = null
      summary.value = null
    }
  }

  return { coveredSet, summary, load }
}