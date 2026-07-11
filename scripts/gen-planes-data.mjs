#!/usr/bin/env node
// Generate public/planes.json — the single source of truth for plane
// metadata across the entire site.
//
// Aggregates:
//   - Static metadata (label, color, roman, notable) from constants
//   - Per-plane coverage (glyphCount, assignedCount, blockCount, pct)
//     from public/coverage.json
//   - Per-plane donor lists from public/donors.json
//
// No hardcoded estimates — every number is derived from real data.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')

// Static plane metadata — MUST match src/astro/lib/unicode/constants.ts PLANES.
// This is the only place plane colors/romans/labels are defined for the
// build pipeline (the TS file is the only place for the runtime).
const PLANES_META = [
  { key: 'bmp', name: 'Basic Multilingual Plane', shortName: 'BMP', range: 'U+0000–U+FFFF', start: 0x0000, end: 0xFFFF,
    index: 0, code: '0', roman: 'I', color: '#b8475f', isReserved: false,
    notable: ['Latin', 'Greek', 'Cyrillic', 'Arabic', 'Hebrew', 'Devanagari', 'CJK Unified Ideographs', 'Egyptian Hieroglyphs'] },
  { key: 'smp', name: 'Supplementary Multilingual Plane', shortName: 'SMP', range: 'U+10000–U+1FFFF', start: 0x10000, end: 0x1FFFF,
    index: 1, code: '1', roman: 'II', color: '#3d8b8b', isReserved: false,
    notable: ['Linear B', 'Ogham', 'Braille', 'Musical Symbols', 'Mathematical Alphanumeric', 'Emoji', 'Tolong Siki', 'Tai Yo'] },
  { key: 'sip', name: 'Supplementary Ideographic Plane', shortName: 'SIP', range: 'U+20000–U+2FFFF', start: 0x20000, end: 0x2FFFF,
    index: 2, code: '2', roman: 'III', color: '#7d4ea6', isReserved: false,
    notable: ['CJK Extension B', 'CJK Extension C', 'CJK Extension D', 'CJK Extension E', 'CJK Extension F', 'CJK Extension I'] },
  { key: 'tip', name: 'Tertiary Ideographic Plane', shortName: 'TIP', range: 'U+30000–U+3FFFF', start: 0x30000, end: 0x3FFFF,
    index: 3, code: '3', roman: 'IV', color: '#d97757', isReserved: false,
    notable: ['CJK Extension G', 'CJK Extension H', 'CJK Extension J', 'Tangut', 'Khitan Small Script', 'Nushu'] },
  { key: 'ssp', name: 'Special-purpose Plane', shortName: 'SSP', range: 'U+E0000–U+EFFFF', start: 0xE0000, end: 0xEFFFF,
    index: 14, code: 'E', roman: 'XIV', color: '#c19a3e', isReserved: false,
    notable: ['Tags', 'Variation Selectors Supplement'] },
  { key: 'pua-a', name: 'Supplementary Private Use Area-A', shortName: 'PUA-A', range: 'U+F0000–U+FFFFF', start: 0xF0000, end: 0xFFFFF,
    index: 15, code: 'F', roman: 'XV', color: '#a8a8a8', isReserved: true, notable: [] },
  { key: 'pua-b', name: 'Supplementary Private Use Area-B', shortName: 'PUA-B', range: 'U+100000–U+10FFFF', start: 0x100000, end: 0x10FFFF,
    index: 16, code: '10', roman: 'XVI', color: '#a8a8a8', isReserved: true, notable: [] },
]

function planeForCodepoint(cp) {
  for (const p of PLANES_META) {
    if (cp >= p.start && cp <= p.end) return p.key
  }
  return 'bmp'
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function main() {
  const blocks = readJson(resolve(pub, 'unicode-blocks.json'), [])
  const coverage = readJson(resolve(pub, 'coverage.json'), { blocks: [] })
  const donors = readJson(resolve(pub, 'donors.json'), { families: [] })

  // Build block→plane lookup from unicode-blocks.json
  const blockPlaneMap = new Map()
  for (const b of blocks) {
    blockPlaneMap.set(b.name, planeForCodepoint(b.start))
  }

  // Build coverage lookup: block name → { covered, total, status }
  const coverageMap = new Map()
  for (const b of (coverage.blocks || [])) {
    const name = b.id.replace(/_/g, ' ')
    coverageMap.set(name, b)
  }

  // Build donor→plane lookup: which donors cover which planes
  const donorPlanes = new Map() // plane key → Set<donor slug>
  for (const fam of (donors.families || [])) {
    const detailPath = resolve(pub, 'donors', `${fam.slug}.json`)
    const detail = readJson(detailPath, {})
    const coveredBlocks = detail.covers_blocks || detail.parsed_coverage?.map(c => c.block) || []
    for (const blockName of coveredBlocks) {
      const pk = blockPlaneMap.get(blockName)
      if (pk) {
        if (!donorPlanes.has(pk)) donorPlanes.set(pk, new Set())
        donorPlanes.get(pk).add(fam.slug)
      }
    }
  }

  // Aggregate per-plane stats from coverage data
  const planesData = PLANES_META.map(meta => {
    let glyphCount = 0
    let assignedCount = 0
    let blockCount = 0

    for (const [blockName, pk] of blockPlaneMap) {
      if (pk !== meta.key) continue
      blockCount++
      const cov = coverageMap.get(blockName)
      if (cov) {
        glyphCount += cov.covered || 0
        assignedCount += cov.total || 0
      }
    }

    const coveredPct = assignedCount > 0
      ? Math.round((glyphCount / assignedCount) * 1000) / 10
      : 0

    const donorList = Array.from(donorPlanes.get(meta.key) || []).sort()

    return {
      key: meta.key,
      index: meta.index,
      code: meta.code,
      label: meta.shortName,
      full: meta.name,
      range: meta.range,
      start: meta.start,
      end: meta.end,
      roman: meta.roman,
      color: meta.color,
      isReserved: meta.isReserved,
      notable: meta.notable,
      glyphCount,
      assignedCount,
      blockCount,
      coveredPct,
      donors: donorList,
    }
  })

  const output = {
    generatedAt: new Date().toISOString(),
    planes: planesData,
  }

  writeFileSync(resolve(pub, 'planes.json'), JSON.stringify(output, null, 2))
  console.log(`gen-planes-data: wrote ${planesData.length} planes → public/planes.json`)
  for (const p of planesData.filter(p => !p.isReserved)) {
    console.log(`  ${p.shortName}: ${p.glyphCount.toLocaleString()} / ${p.assignedCount.toLocaleString()} glyphs (${p.coveredPct}%), ${p.blockCount} blocks, ${p.donors.length} donors`)
  }
}

main()