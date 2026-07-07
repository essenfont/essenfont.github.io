import puppeteer from 'puppeteer'
import { readFileSync } from 'node:fs'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})
const page = await browser.newPage()

for (const slug of ['emoticons', 'tags', 'tangut']) {
  for (const path of [`public/fonts/${slug}.woff2`, `/tmp/${slug}-ft.woff2`]) {
    const bytes = readFileSync(path)
    const dataUrl = `data:font/woff2;base64,${bytes.toString('base64')}`
    const r = await page.evaluate(async (u) => {
      try { const f = new FontFace('T', `url("${u}")`); await f.load(); return 'ok' }
      catch (e) { return String(e?.message || e) }
    }, dataUrl)
    console.log(path, '->', r)
  }
}

await browser.close()
