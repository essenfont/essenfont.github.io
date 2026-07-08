# 12 — Search

## Source

`src/pages/SearchPage.vue` + `src/components/SiteSearch.vue`

## Pattern

Search is one of the few pages that needs client-side JS. Astro handles this via "islands" — Vue components embedded in an otherwise-static page.

Two options:
- (a) Use `@astrojs/vue`'s `<Client:load>` directive on a ported Vue component
- (b) Rewrite as vanilla TypeScript with a small fuzzy matcher (Fuse.js or similar)

Prefer (b) for smaller JS footprint, unless the existing component is complex. If (b), precompute a search index at build time:

```ts
// scripts/gen-search-index.mjs
import fs from 'node:fs';
import path from 'node:path';

const blocks = JSON.parse(fs.readFileSync('public/unicode-blocks.json', 'utf-8'));
const index = []; // {type: 'block'|'char'|'plane'|'donor', name, url, codepoint?}
// ... populate
fs.writeFileSync('public/search-index.json', JSON.stringify(index));
```

Client-side island loads `search-index.json` and filters on input.

## Acceptance

- `/search` renders an input field that filters results as you type
- Search index covers blocks, planes, characters (by name + codepoint hex), donors
- Mobile-friendly (no required JS interaction)
