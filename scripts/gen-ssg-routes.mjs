#!/usr/bin/env node
// Generate the list of routes to pre-render with vite-ssg.
//
// Static routes (always present): home, about, download, unicode top,
// and the four property index pages.
//
// Dynamic routes (one per block / per plane / per character / per property value)
// are derived from the committed public/unicode* data so the build is
// hermetic — no network calls, no upstream dependencies.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')

const STATIC_ROUTES = [
  '/',
  '/about',
  '/donors',
  '/download',
  '/unicode',
  '/unicode/scripts',
  '/unicode/category',
  '/unicode/bidiclass',
  '/unicode/combining',
]

const PLANES = ['bmp', 'smp', 'sip', 'tip', 'ssp', 'pua-a', 'pua-b']

const blockToSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function propertyFileName(key) {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : blockToSlug(key) || 'empty'
}

// Build sitemap entries with titles so OG/sitemap are richer than bare URLs.
function buildEntries() {
  const entries = []

  for (const r of STATIC_ROUTES) {
    entries.push({ path: r, title: staticTitle(r) })
  }

  for (const p of PLANES) {
    entries.push({ path: `/unicode/plane/${p}`, title: `Unicode plane ${p}` })
  }

  // One route per donor family.
  const donors = readJson(resolve(pub, 'donors.json'), { families: [] })
  for (const fam of donors.families || []) {
    entries.push({ path: `/donors/${fam.slug}`, title: `Donor: ${fam.family}` })
  }

  // One route per block + one route per assigned codepoint.
  const blocks = readJson(resolve(pub, 'unicode-blocks.json'), [])
  const blockSlugs = new Set()
  for (const b of blocks) {
    const slug = blockToSlug(b.name)
    if (blockSlugs.has(slug)) continue
    blockSlugs.add(slug)
    entries.push({ path: `/unicode/block/${slug}`, title: `Block: ${b.name}` })
    const blockFile = readJson(resolve(pub, `unicode/blocks/${slug}.json`), { chars: [] })
    for (const c of blockFile.chars || []) {
      const hex = c.cp.toString(16).toUpperCase()
      entries.push({ path: `/unicode/char/${hex}`, title: `U+${hex} ${c.n || ''}` })
    }
  }

  // One route per property value (scripts / category / bidiclass / combining).
  for (const prop of ['scripts', 'category', 'bidiclass', 'combining']) {
    const indexFile = ({
      scripts: 'by-script.json',
      category: 'by-category.json',
      bidiclass: 'by-bidi.json',
      combining: 'by-combining.json',
    })[prop]
    const counts = readJson(resolve(pub, `unicode/indexes/${indexFile}`), {})
    for (const key of Object.keys(counts)) {
      entries.push({
        path: `/unicode/${prop}/${propertyFileName(key)}`,
        title: `${prop}: ${key}`,
      })
    }
  }

  return entries
}

function staticTitle(r) {
  switch (r) {
    case '/': return 'Essenfont — Universal Unicode 17 Font'
    case '/about': return 'About Essenfont'
    case '/download': return 'Download Essenfont'
    case '/unicode': return 'Unicode Browser — Essenfont'
    case '/unicode/scripts': return 'Unicode Scripts'
    case '/unicode/category': return 'Unicode Categories'
    case '/unicode/bidiclass': return 'Unicode Bidi Classes'
    case '/unicode/combining': return 'Unicode Combining Classes'
    default: return 'Essenfont'
  }
}

function main() {
  const entries = buildEntries()
  const paths = entries.map((e) => e.path)

  // ssg-routes.json — vite-ssg reads this from public/.
  writeFileSync(
    resolve(pub, 'ssg-routes.json'),
    JSON.stringify(paths, null, 2),
  )

  // sitemap.xml
  const today = new Date().toISOString().slice(0, 10)
  const urls = entries.map((e) =>
    `  <url>\n    <loc>https://essenfont.github.io${e.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${e.path === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${e.path === '/' ? '1.0' : '0.6'}</priority>\n  </url>`
  ).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  writeFileSync(resolve(pub, 'sitemap.xml'), xml)

  console.log(`gen-ssg-routes: ${paths.length} routes`)
}

main()