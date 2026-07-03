# REQ: Distribution formats

## Four ways to consume essenfont

| Format | Files | Use case |
|--------|-------|----------|
| **OTC** (canonical) | 1 `.otc` (5 faces) | Desktop install (macOS/Windows/Linux). One file, all planes. |
| **Per-plane TTF** | 5 `.ttf` | Legacy apps that can't read OTC. One face per file. |
| **Per-plane WOFF2** | 5 `.woff2` | External web embed via `@font-face` + `unicode-range`. Larger than per-block but fewer files. |
| **Per-block WOFF2** | ~214 `.woff2` (~80 KB each) | This site's inline rendering. Browser fetches only the block it needs. Most granular. |

## Asset naming

```
Essenfont-Regular.otc              — OTC (5 faces)
Essenfont-BMP.ttf / .woff2         — per-plane
Essenfont-SMP.ttf / .woff2
Essenfont-SIP.ttf / .woff2
Essenfont-TIP.ttf / .woff2
Essenfont-SSP.ttf / .woff2
Essenfont-CFF2-Regular.otc         — CFF2 variant (~35% smaller)
```

All assets are attached to the GitHub Release at
`essenfont/essenfont/releases/latest`.

## Web embed (`@font-face`)

Per-plane (external sites):

```css
@font-face {
  font-family: 'essenfont';
  src: url('https://github.com/essenfont/essenfont/releases/latest/download/Essenfont-SIP.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+20000-2FFFF;
}
```

Per-block (this site): see `public/fonts.css` — 214 `@font-face`
rules, one per block, each with a `unicode-range` scoped to the
block's codepoints.

## Single source of truth

Plane metadata (labels, colors, glyph counts, donor lists) comes from
`public/planes.json`. The DownloadPage and SubfontsPage load this file;
they do not hardcode estimates.