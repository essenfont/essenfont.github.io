# 07 — Browser color-rendering smoke test

A Puppeteer smoke test verifying that the website's emoji WOFF2
subset renders COLOR pixels (not just monochrome outlines) in Chrome.
This is the final acceptance criterion for emoji fix B.

## Dependencies

- Task 06 (profile enablement) — the subset pipeline must be producing
  CBDT/CBLC in the output before this test can pass.

## Test

`scripts/test-emoji-color.mjs` (Node.js / Puppeteer)

## Algorithm

1. Load `public/fonts/emoticons.woff2` as a data URL
2. Mount a probe: `<span style="font-family:'T'">😀</span>`
3. Render via `page.evaluate`
4. Rasterize via `element.screenshot({ encoding: 'png' })`
5. Decode the PNG and check that the glyph bounding box contains
   multiple distinct colors (color bitmap present). Monochrome fallback
   would be a single color across all pixels (glyf outline only —
   emoji fix A state).

```javascript
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const woff2 = readFileSync('public/fonts/emoticons.woff2', 'base64');
const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.setContent(`
  <style>
    @font-face {
      font-family: 'T';
      src: url(data:font/woff2;base64,${woff2});
    }
    .probe { font-family: 'T'; font-size: 64px; }
  </style>
  <span class="probe">😀</span>
`);

// Wait for font to load
await page.evaluate(() => document.fonts.ready);

const element = await page.$('.probe');
const png = await element.screenshot({ encoding: 'png' });

// Analyze PNG: count distinct colors in the bounding box
const colors = await analyzeColors(png);
await browser.close();

if (colors.size < 3) {
  console.error(`FAIL: only ${colors.size} colors found — monochrome fallback`);
  process.exit(1);
}

console.log(`PASS: ${colors.size} distinct colors — color bitmap rendered`);
```

## Spec coverage

This is a script, not an RSpec. It runs in the essenfont CI pipeline
(GitHub Actions) and gates website PRs that touch the emoji subset.

| File | Check |
|------|-------|
| `scripts/test-emoji-color.mjs` | (1) font loads without error, (2) glyph bounding box has > 3 distinct colors |

## Risk

- **Puppeteer not available in CI**: install via `npm ci` in the
  essenfont repo. The test should skip if Puppeteer isn't available
  (not fail) — similar to the `:python` tag pattern in fontisan specs.

- **Chrome version differences**: different Chrome versions may render
  CBDT differently. The test should assert > 3 colors (clearly color,
  not monochrome), not a specific color count (which varies).

- **Data URL size**: a WOFF2 with CBDT can be several hundred KB as a
  base64 data URL. This may exceed Chrome's URL length limit. If so,
  use `page.route` to intercept the font request and serve the file
  from disk instead.

- **Font loading race**: the probe might render before `@font-face`
  finishes loading. `await document.fonts.ready` mitigates this, but
  flaky on slow CI runners. Add a retry with a 2-second timeout.

## References

- Task 06's profile enablement — the precondition
- `public/fonts/emoticons.woff2` — the font under test (essenfont repo)
- [Puppeteer element.screenshot docs](https://pptr.dev/api/puppeteer.element.screenshot)

## Acceptance

- Test passes when CBDT data is preserved (after emoji fix B lands)
- Test fails with a clear diff message when only glyf outlines are
  present (current state — emoji fix A only)
- CI runs this test; failures block the website PR
