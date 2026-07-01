import { fetchJson } from '../ssr-fetch'

export interface DonorFamilySummary {
  family: string
  slug: string
  license: string
  author: string
  file_count: number
  covers_count: number
  first_cover: string | null
  role: string
  planes: string[]
  parsed_coverage_count: number
}

export interface DonorsIndex {
  essenfont_version: string
  ucd_version: string
  generated_at: string
  license_policy: {
    ofl_compatible: string[]
    accepted_with_conditions: string[]
  }
  families: DonorFamilySummary[]
}

export interface DonorFile {
  label: string
  file: string
  style: string
  version: string
  sha256: string
  url: string
  url_extract?: string
  url_extract_member?: string
  url_mirror?: string
  covers: string[]
  notes: string
  path_local_only: boolean
  enabled: boolean
}

export interface DonorFamilyDetail {
  family: string
  slug: string
  license: string
  license_category: 'ofl_compatible' | 'accepted_with_conditions' | 'unknown'
  license_restriction?: string
  license_summary?: string
  license_statement?: string
  author: string
  url: string
  url_mirror?: string
  web: string
  notes: string
  author_note: string
  file_count: number
  covers: string[]
  covers_blocks: string[]
  files: DonorFile[]
}

let _indexCache: DonorsIndex | null = null

export async function loadDonorsIndex(): Promise<DonorsIndex> {
  if (_indexCache) return _indexCache
  _indexCache = await fetchJson<DonorsIndex>('donors.json')
  return _indexCache
}

const _detailCache = new Map<string, DonorFamilyDetail>()

export async function loadDonorDetail(slug: string): Promise<DonorFamilyDetail | null> {
  const hit = _detailCache.get(slug)
  if (hit) return hit
  try {
    const detail = await fetchJson<DonorFamilyDetail>(`donors/${slug}.json`)
    _detailCache.set(slug, detail)
    return detail
  } catch {
    return null
  }
}