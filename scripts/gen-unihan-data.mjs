#!/usr/bin/env node
// Download Unicode Unihan.zip and emit per-block Unihan JSON for CJK blocks.
//
// The Unihan database is ~100k CJK ideographs with 30+ fields each.
// Per-codepoint JSON would be 100k files; we emit per-block JSON
// (~13 files) under data/unihan/ (gitignored, build-time only).
//
// The char page reads from data/ during SSG (baked into HTML) and
// skips Unihan on client-side nav (returns null).
//
// Reads:  https://www.unicode.org/Public/<version>/ucd/Unihan.zip
// Writes: data/unihan/<block-slug>.json
//         data/unihan-version.json
//
// Usage:
//   node scripts/gen-unihan-data.mjs
//   node scripts/gen-unihan-data.mjs --unicode-version=16.0.0
//   node scripts/gen-unihan-data.mjs --force

import { spawnSync } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')
const dataDir = resolve(root, 'data')
const vendorDir = resolve(root, 'vendor/ucd')
const unihanDir = resolve(dataDir, 'unihan')
const blocksPath = resolve(pub, 'unicode-blocks.json')

const DEFAULT_VERSION = '17.0.0'

const FILE_TO_CATEGORY = {
  'Unihan_DictionaryIndices.txt': 'dictionary_indices',
  'Unihan_DictionaryLikeData.txt': 'dictionary_like_data',
  'Unihan_IRGSources.txt': 'irg_sources',
  'Unihan_NumericValues.txt': 'numeric_values',
  'Unihan_OtherMappings.txt': 'other_mappings',
  'Unihan_RadicalStrokeCounts.txt': 'radical_stroke_counts',
  'Unihan_Readings.txt': 'readings',
  'Unihan_Variants.txt': 'variants',
}

function parseArgs(argv) {
  const opts = { version: DEFAULT_VERSION, force: false, clean: true }
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--unicode-version=')) opts.version = arg.slice(18)
    else if (arg === '--force') opts.force = true
    else if (arg === '--no-clean') opts.clean = false
    else if (arg === '-h' || arg === '--help') {
      console.log(`Usage: gen-unihan-data.mjs [--unicode-version=X.Y.Z] [--force] [--no-clean]`)
      process.exit(0)
    }
  }
  return opts
}

function log(msg) {
  process.stdout.write(`\x1b[1;34munihan:\x1b[0m ${msg}\n`)
}

function blockSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function downloadZip(url, destPath) {
  log(`downloading ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  mkdirSync(dirname(destPath), { recursive: true })
  const tmp = `${destPath}.tmp`
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp))
  renameSync(tmp, destPath)
}

function extractZip(zipPath, destDir) {
  log(`extracting ${zipPath}`)
  mkdirSync(destDir, { recursive: true })
  const r = spawnSync('unzip', ['-o', zipPath, '-d', destDir], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (r.status !== 0) {
    throw new Error(`unzip failed: ${r.stderr?.toString()}`)
  }
}

// Parse Unihan_*.txt. Each line is `U+XXXX\tfield\tvalue`. Comments start with #.
function parseUnihanFile(filePath, category, accumulator) {
  const text = readFileSync(filePath, 'utf8')
  const lines = text.split('\n')
  let count = 0
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const parts = line.split('\t')
    if (parts.length < 3) continue
    const cpStr = parts[0]
    const field = parts[1]
    const value = parts[2]
    const m = cpStr.match(/^U\+([0-9A-Fa-f]+)$/)
    if (!m) continue
    const cp = parseInt(m[1], 16)
    if (!accumulator.has(cp)) accumulator.set(cp, {})
    const entry = accumulator.get(cp)
    if (!entry[category]) entry[category] = []
    // Merge values for the same field name within a category.
    let fieldEntry = entry[category].find((f) => f.name === field)
    if (!fieldEntry) {
      fieldEntry = { name: field, values: [] }
      entry[category].push(fieldEntry)
    }
    fieldEntry.values.push(value)
    count++
  }
  return count
}

// Find which CJK block a codepoint belongs to. Returns null if none.
function findBlock(cp, blocks) {
  for (const b of blocks) {
    if (cp >= b.start && cp <= b.end) return b
  }
  return null
}

function main() {
  const opts = parseArgs(process.argv)
  const { version } = opts

  const url = `https://www.unicode.org/Public/${version}/ucd/Unihan.zip`
  const zipPath = resolve(vendorDir, `Unihan-${version}.zip`)
  const extractDir = resolve(vendorDir, `Unihan-${version}`)

  mkdirSync(vendorDir, { recursive: true })

  if (!existsSync(zipPath) || opts.force) {
    downloadZip(url, zipPath).then(() => run(version, extractDir, opts))
  } else {
    log(`using cached ${zipPath}`)
    run(version, extractDir, opts)
  }
}

async function run(version, extractDir, opts) {
  if (!existsSync(extractDir) || opts.force) {
    extractZip(resolve(vendorDir, `Unihan-${version}.zip`), extractDir)
  }

  const blocks = JSON.parse(readFileSync(blocksPath, 'utf8'))

  log('parsing Unihan files')
  const byCp = new Map()
  let total = 0
  for (const [filename, category] of Object.entries(FILE_TO_CATEGORY)) {
    const filePath = resolve(extractDir, filename)
    if (!existsSync(filePath)) {
      log(`  missing: ${filename}`)
      continue
    }
    const count = parseUnihanFile(filePath, category, byCp)
    total += count
    log(`  ${filename}: ${count} entries`)
  }

  log(`grouped ${byCp.size} codepoints, ${total} field entries`)

  // Group by block
  const byBlock = new Map()
  for (const [cp, fields] of byCp) {
    const block = findBlock(cp, blocks)
    if (!block) continue
    const slug = blockSlug(block.name)
    if (!byBlock.has(slug)) {
      byBlock.set(slug, {
        block: block.name,
        range: `U+${block.start.toString(16).toUpperCase().padStart(4, '0')}-U+${block.end.toString(16).toUpperCase().padStart(4, '0')}`,
        start: block.start,
        end: block.end,
        entries: {},
      })
    }
    byBlock.get(slug).entries[String(cp)] = fields
  }

  // Clean stale per-block unihan files
  mkdirSync(unihanDir, { recursive: true })
  if (opts.clean) {
    for (const fn of (await import('node:fs')).readdirSync(unihanDir)) {
      if (!fn.endsWith('.json')) continue
      const slug = fn.slice(0, -5)
      if (!byBlock.has(slug)) {
        rmSync(resolve(unihanDir, fn))
        log(`removed stale: ${fn}`)
      }
    }
  }

  // Write per-block JSON
  let totalEntries = 0
  for (const [slug, blockData] of byBlock) {
    const path = resolve(unihanDir, `${slug}.json`)
    const tmp = `${path}.tmp`
    writeFileSync(tmp, JSON.stringify(blockData))
    renameSync(tmp, path)
    totalEntries += Object.keys(blockData.entries).length
  }

  // Manifest
  const manifest = {
    version,
    generatedAt: new Date().toISOString(),
    blockCount: byBlock.size,
    entryCount: totalEntries,
  }
  writeFileSync(resolve(dataDir, 'unihan-version.json'), JSON.stringify(manifest, null, 2))

  log(`wrote ${byBlock.size} block files → data/unihan/`)
  log(`wrote manifest → data/unihan-version.json`)
}

main()