# 06 — Home page

The home page is the most-visible surface. It's where the **dynamic stats + engineering story** will live.

## Source

`src/pages/HomePage.vue`

## New content (from this migration)

The home page should communicate:

1. **Hero**: Essenfont is the universal Unicode 17 font. Single OTC, every assigned codepoint, donor-derived, OFL.
2. **Live stats** (computed from `public/unicode-blocks.json` + sibling `essenfont/manifest.yml`):
   - Codepoints covered: ~137K (sum across blocks)
   - Donor glyphs assembled: ~131K (maxp.numGlyphs sum)
   - Donor count: 38 (manifest entry count)
   - OTC size: ~110 MB (from sibling `essenfont/Essenfont-Regular.otc`)
   - Website subsets: ~209 WOFF2 files, ~150 MB total
3. **Coverage meter**: percentage of assigned Unicode 17 codepoints with real outlines
4. **Engineering story** (link to `/engineering`): how we got Chrome's OTS to accept our WOFF2; how the OTC carries CFF+CBDT+glyf in one file
5. **Download CTA** → `/download`
6. **Browse** → `/unicode`

## Dynamic stat calculation

Astro frontmatter computes stats at build time. Stats come from:
- `public/unicode-blocks.json` (block list)
- `public/planes.json` (plane metadata)
- `references/manifest.yml` (donor registry from sibling essenfont repo)
- File sizes via `fs.statSync`

```ts
// src/astro/lib/stats.ts
import fs from 'node:fs';
import path from 'node:path';

export function loadStats() {
  const blocks = JSON.parse(fs.readFileSync('public/unicode-blocks.json', 'utf-8'));
  const codepointCount = blocks.reduce((n, b) => n + (b.end - b.start + 1), 0);
  // ... donor count, file sizes, etc.
  return { codepointCount, donorCount, otcSizeBytes, ... };
}
```

## Frontend-design direction

After migration, apply /frontend-design for the polish pass. Direction candidate: editorial/magazine — heavy display type, generous whitespace, asymmetric grid for the stat callouts, a hero specimen of the word "Essenfont" rendered in the actual font when installed locally.

## Acceptance

- `/` renders home page with all stats computed at build time
- Stats appear in the rendered HTML (not client-side computed)
- Hero specimen renders correctly with `var(--spec-font-glyph)` family
