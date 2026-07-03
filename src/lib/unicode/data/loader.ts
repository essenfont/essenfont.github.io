import type { UnicodeBlock, UnicodeCharacter, PlaneKey, UnicodePlane, CodepointUnihan, PlaneInfo } from '../types'
import { PLANES, planeForCodepoint, blockDisplayName, scriptGroup, hexCp, safeChar, blockSlug } from '../constants'
import { fetchJson, fetchBuildData } from '../../ssr-fetch'

interface RawBlockCharacter {
  cp: number
  n?: string
  c?: string
  s?: string
  cc?: number
  bc?: string
  mir?: boolean
  up?: string
  lo?: string
  ti?: string
  dm?: string
}

interface RawBlockFile {
  chars?: RawBlockCharacter[]
}

export function mapRawCharacter(raw: RawBlockCharacter): UnicodeCharacter {
  // UCD XML stores names as `#` for many CJK Extension B/C/D codepoints.
  // The official name is `CJK UNIFIED IDEOGRAPH-{CP_HEX}` (5 hex digits,
  // zero-padded uppercase) — synthesize it so the page doesn't show `#`.
  let name = raw.n || ''
  if (name === '#' || /^(CJK UNIFIED IDEOGRAPH-|<reserved|.*CJK UNIFIED IDEOGRAPH-#)/i.test(name)) {
    const hex = raw.cp.toString(16).toUpperCase().padStart(5, '0')
    name = `CJK UNIFIED IDEOGRAPH-${hex}`
  }
  return {
    cp: raw.cp,
    hex: hexCp(raw.cp),
    char: safeChar(raw.cp),
    name,
    category: raw.c || '',
    script: raw.s || '',
    combiningClass: raw.cc ?? 0,
    bidiClass: raw.bc ?? null,
    mirrored: raw.mir ?? false,
    simpleUppercase: raw.up ?? null,
    simpleLowercase: raw.lo ?? null,
    simpleTitlecase: raw.ti ?? null,
    decomposition: raw.dm ?? null,
  }
}

interface RawBlockIndexEntry {
  start: number
  end: number
  name: string
  unicode_version?: string
}

let _allBlocksCache: UnicodeBlock[] | null = null

export async function loadAllBlocks(): Promise<UnicodeBlock[]> {
  if (_allBlocksCache) return _allBlocksCache
  const raw = await fetchJson<RawBlockIndexEntry[]>('unicode-blocks.json')
  _allBlocksCache = raw.map(b => ({
    name: b.name,
    start: b.start,
    end: b.end,
    range: hexCp(b.start) + '–' + hexCp(b.end),
    plane: planeForCodepoint(b.start),
    displayName: blockDisplayName(b.name),
    scriptGroup: scriptGroup(b.name),
    unicodeVersion: b.unicode_version || '1.1',
    characters: [],
    assignedCount: 0,
  }))
  return _allBlocksCache
}

export function clearAllBlocksCache(): void {
  _allBlocksCache = null
}

const _blockCharCache = new Map<string, UnicodeCharacter[]>()

export async function loadBlockCharacters(blockName: string): Promise<UnicodeCharacter[]> {
  const slug = blockSlug(blockName)
  const hit = _blockCharCache.get(slug)
  if (hit) return hit
  try {
    const data = await fetchJson<RawBlockFile>(`unicode/blocks/${slug}.json`)
    const chars = (data.chars || []).map(mapRawCharacter)
    _blockCharCache.set(slug, chars)
    return chars
  } catch {
    return []
  }
}

export async function loadBlock(blockName: string): Promise<UnicodeBlock | null> {
  const blocks = await loadAllBlocks()
  const block = blocks.find(b => b.name === blockName || b.displayName === blockName)
  if (!block) return null
  const chars = await loadBlockCharacters(block.name)
  return { ...block, characters: chars, assignedCount: chars.length }
}

export function getPlanes(blocks: UnicodeBlock[]): UnicodePlane[] {
  return PLANES.map(p => ({
    ...p,
    blocks: blocks.filter(b => b.plane === p.key),
  }))
}

export function getBlocksByPlane(blocks: UnicodeBlock[], key: PlaneKey): UnicodeBlock[] {
  return blocks.filter(b => b.plane === key)
}

export function getBlocksByScriptGroup(blocks: UnicodeBlock[]): { group: string; blocks: UnicodeBlock[] }[] {
  const groups: Record<string, UnicodeBlock[]> = {}
  for (const b of blocks) {
    const g = b.scriptGroup
    if (!groups[g]) groups[g] = []
    groups[g].push(b)
  }
  return Object.entries(groups).map(([group, blocks]) => ({ group, blocks }))
}

export async function loadUnicodeVersion(): Promise<{ version: string; charCount: number; blockCount: number }> {
  return fetchJson('unicode-version.json')
}

// ── Unihan ───────────────────────────────────────────────────────
// Per-block Unihan JSON lives in data/unihan/ (gitignored, ~80 MB
// total across CJK blocks). It is NOT deployed — only read during SSG
// to bake the relevant slice into each char page's HTML. On the client
// the loader returns null, so client-side nav just hides the sections.

interface RawUnihanBlock {
  block: string
  range: string
  start: number
  end: number
  entries: Record<string, CodepointUnihan>
}

const _unihanBlockCache = new Map<string, RawUnihanBlock | null>()

async function loadUnihanBlock(slug: string): Promise<RawUnihanBlock | null> {
  if (_unihanBlockCache.has(slug)) return _unihanBlockCache.get(slug) ?? null
  const data = await fetchBuildData<RawUnihanBlock>(`unihan/${slug}.json`)
  _unihanBlockCache.set(slug, data)
  return data
}

export async function loadUnihanForCodepoint(blockSlug: string, cp: number): Promise<CodepointUnihan | null> {
  const block = await loadUnihanBlock(blockSlug)
  if (!block) return null
  return block.entries[String(cp)] ?? null
}

// ── Plane info (from public/planes.json) ──
// The single source of truth for plane metadata across the entire site.
// SubfontsPage, DownloadPage, and CoverageMap all load from this.
export async function loadPlanes(): Promise<PlaneInfo[]> {
  const data = await fetchJson<{ planes: PlaneInfo[] }>('planes.json')
  return data.planes
}