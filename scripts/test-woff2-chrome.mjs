// Verify all rebuilt WOFF2 subsets load successfully in Chrome via FontFace API.
// OTS rejections surface as FontFace load() promise rejection.
//
// Usage:
//   node scripts/test-woff2-chrome.mjs                 # test all
//   node scripts/test-woff2-chrome.mjs basic-latin     # test specific slugs
import puppeteer from 'puppeteer'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const FONTS_DIR = resolve('public/fonts')
const allSlugs = readdirSync(FONTS_DIR)
  .filter(f => f.endsWith('.woff2'))
  .map(f => f.slice(0, -6))
const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : allSlugs

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})
const page = await browser.newPage()

const failed = []
let ok = 0
let tested = 0

for (const slug of slugs) {
  const path = join(FONTS_DIR, `${slug}.woff2`)
  let bytes
  try { bytes = readFileSync(path) } catch {
    failed.push({ slug, reason: 'file-missing' }); continue
  }
  tested++
  const dataUrl = `data:font/woff2;base64,${bytes.toString('base64')}`
  const result = await page.evaluate(async (dataUrl) => {
    try {
      const face = new FontFace('T', `url("${dataUrl}")`)
      await face.load()
      return { ok: true }
    } catch (e) {
      return { ok: false, error: String(e?.message || e) }
    }
  }, dataUrl)
  if (result.ok) ok++
  else failed.push({ slug, ...result })
}

await browser.close()

console.log(`OK:   ${ok}/${tested}`)
console.log(`FAIL: ${failed.length}/${tested}`)
if (failed.length) {
  console.log('\nFailures (first 20):')
  for (const f of failed.slice(0, 20)) console.log(`  - ${f.slug}: ${JSON.stringify(f)}`)
  process.exit(1)
}
