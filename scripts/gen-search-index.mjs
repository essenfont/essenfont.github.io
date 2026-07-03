#!/usr/bin/env node
// Generates public/search-index.json from the site's existing data files.
// Index entries: { t: 'cp'|'blk'|'don'|'scr', q: queryable, n: name, u: url }
//
// Sources:
//   public/unicode-blocks.json    → blocks
//   public/donors.json            → donor families
//   public/coverage/<slug>.json   → per-block codepoints (one file per block)
//
// Output: public/search-index.json (~13 MB uncompressed, ~3 MB gzipped)
// Loaded lazily by the SiteSearch component and /search page.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')

console.log('→ loading unicode-blocks.json')
const blocks = JSON.parse(readFileSync(resolve(pub, 'unicode-blocks.json'), 'utf8'))

console.log('→ loading donors.json')
const donors = JSON.parse(readFileSync(resolve(pub, 'donors.json'), 'utf8'))

const entries = []

// Blocks → blk entries
for (const b of blocks) {
  entries.push({
    t: 'blk',
    q: b.id,
    n: b.name || b.id.replace(/_/g, ' '),
    u: `/unicode/block/${b.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
  })
}

// Donors → don entries
for (const d of donors.families || []) {
  entries.push({
    t: 'don',
    q: d.slug || d.family,
    n: d.family,
    u: `/donors/${d.slug}`,
  })
}

// Codepoints → cp entries (from per-block coverage files)
const coverageDir = resolve(pub, 'coverage')
if (existsSync(coverageDir)) {
  const files = readdirSync(coverageDir).filter(f => f.endsWith('.json'))
  console.log(`→ scanning ${files.length} coverage/*.json files`)
  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(resolve(coverageDir, f), 'utf8'))
      // Coverage files have shape { codepoints: [{cp, name, ...}], ... }
      const cps = data.codepoints || data.characters || data.cps || []
      for (const c of cps) {
        const cp = typeof c === 'number' ? c : (c.cp || c.codepoint)
        const name = c.name || ''
        if (cp == null) continue
        const hex = typeof cp === 'number' ? cp.toString(16).toUpperCase() : String(cp).replace(/^U\+/i, '')
        entries.push({
          t: 'cp',
          q: hex,
          n: name,
          u: `/unicode/char/${hex.toLowerCase()}`,
        })
      }
    } catch {
      // skip malformed files
    }
  }
}

console.log(`✓ ${entries.length} entries`)

const json = JSON.stringify(entries)
writeFileSync(resolve(pub, 'search-index.json'), json)
writeFileSync(resolve(pub, 'search-index.json.gz'), gzipSync(Buffer.from(json)))

console.log(`  search-index.json (${(json.length / 1024 / 1024).toFixed(1)} MB)`)
console.log(`  search-index.json.gz (${(gzipSync(Buffer.from(json)).length / 1024 / 1024).toFixed(1)} MB)`)
