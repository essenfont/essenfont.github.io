# 08 — Browser color-rendering smoke test

A Puppeteer smoke test verifying that the website's emoji WOFF2
subset renders COLOR pixels (not just monochrome outlines) in Chrome.

## Test

`scripts/test-emoji-color.mjs`

## Algorithm

1. Load `public/fonts/emoticons.woff2` as a data URL
2. Mount a `<span style="font-family:'T'">😀</span>` probe
3. Render via `page.evaluate` and rasterize via
   `element.screenshot({ encoding: 'png' })`
4. Decode the PNG and check that the glyph bounding box contains
   multiple distinct colors (color bitmap); monochrome fallback would
   be a single color across all pixels

## Acceptance

- Test passes when CBDT data is preserved (after emoji fix B lands)
- Test fails with a clear diff message when only glyf outlines are
  present (current state, emoji fix A)
- CI runs this test; failures block the website PR
