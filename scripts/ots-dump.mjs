import puppeteer from 'puppeteer'
import { readFileSync } from 'node:fs'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--enable-logging=stderr', '--v=1'],
})
const page = await browser.newPage()
const bytes = readFileSync(process.argv[2])
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
console.log('RESULT:', JSON.stringify(result))
await browser.close()
