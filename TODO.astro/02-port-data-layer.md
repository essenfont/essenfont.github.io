# 02 — Port the Unicode data layer

The `src/lib/unicode/` directory is already pure TypeScript with no Vue dependency. It ports to Astro with minimal change.

## Files

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/lib/unicode/types.ts` | `src/astro/lib/unicode/types.ts` | unchanged |
| `src/lib/unicode/constants.ts` | `src/astro/lib/unicode/constants.ts` | unchanged |
| `src/lib/unicode/data/loader.ts` | `src/astro/lib/unicode/data/loader.ts` | swap `src/lib/ssr-fetch` for Astro's `import.meta.glob` / fetch / node:fs |
| `src/lib/unicode/components/UnicodeBlockGrid.vue` | `src/astro/components/UnicodeBlockGrid.astro` | rewrite per step 07 |
| `src/lib/unicode/index.ts` (barrel) | `src/astro/lib/unicode/index.ts` | unchanged |

## SSR-aware data loading

The current code uses `src/lib/ssr-fetch.ts`'s `fetchJson<T>` helper which:
- During SSG: reads from `public/<path>` via `node:fs` (dynamically imported in SSR branch)
- In browser: regular `fetch`

Astro's SSG model: frontmatter (`---` block) runs at build time. We can use `node:fs` directly there. The rendered HTML doesn't need client-side fetch.

```ts
// src/astro/lib/unicode/data/loader.ts
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC = path.resolve('./public');

export function loadJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(PUBLIC, relPath), 'utf-8'));
}
```

Browser-side fetch still needed for:
- Site search (queries indexes from client)
- "Compare two glyphs" interactivity

Those use `fetch('/unicode/indexes/...')` which still works (same URLs).

## Acceptance

- `loadAllBlocks()`, `loadBlockCharacters(slug)`, `loadUnicodeVersion()`, `loadBlock(slug)` all importable from `@/astro/lib/unicode`
- Pure functions (`hexCp`, `safeChar`, `displayChar`, `planeForCodepoint`, `blockSlug`, `charRoute`, etc.) re-exported unchanged
- No Vue imports anywhere in this layer
