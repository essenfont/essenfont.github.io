# 07 — Unicode index + Block + Char pages

The bulk of the SSG output. ~160k routes total. Astro's `getStaticPaths` handles this natively.

## Sources

- `src/pages/UnicodePage.vue` — block index (`/unicode`)
- `src/pages/UnicodeBlockPage.vue` — per-block grid (`/unicode/block/:blockSlug`)
- `src/pages/UnicodeCharPage.vue` — per-char detail (`/unicode/char/:hex`)
- `src/lib/unicode/components/UnicodeBlockGrid.vue` — the grid component

## Routes to reproduce

```
/unicode                                 → UnicodePage
/unicode/block/:blockSlug               → UnicodeBlockPage   (340 paths)
/unicode/char/:hex                      → UnicodeCharPage    (~160k paths)
```

All paths must stay byte-identical to current URLs.

## Implementation sketch — block index

```astro
---
// src/astro/pages/unicode/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { loadAllBlocks } from '../../lib/unicode';

const blocks = loadAllBlocks();
---
<BaseLayout title="Unicode blocks — Essenfont">
  <h1>Unicode 17 blocks</h1>
  <p>{blocks.length} blocks covering {blocks.reduce((n, b) => n + (b.end - b.start + 1), 0).toLocaleString()} codepoints.</p>
  <ul>
    {blocks.map(b => (
      <li><a href={`/unicode/block/${blockSlug(b.name)}`}>{b.name}</a></li>
    ))}
  </ul>
</BaseLayout>
```

## Per-char page via getStaticPaths

```astro
---
// src/astro/pages/unicode/char/[hex].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { loadAllBlocks, loadBlockCharacters } from '../../lib/unicode';

export async function getStaticPaths() {
  const blocks = loadAllBlocks();
  const paths = [];
  for (const block of blocks) {
    const chars = loadBlockCharacters(block.slug);
    for (const ch of chars) {
      paths.push({ params: { hex: ch.codepoint.toString(16).toUpperCase() }, props: { ch, block } });
    }
  }
  return paths;
}

const { ch, block } = Astro.props;
---
<BaseLayout title={`U+${ch.codepoint.toString(16).toUpperCase()} — ${ch.name}`}>
  <!-- glyph specimen, name, properties, etc. -->
</BaseLayout>
```

## Performance

The `getStaticPaths` for ~160k routes is the biggest risk. Astro builds pages concurrently; with a high-end machine this completes in ~10 min for the current site. Verify parity after migration.

If Astro's default concurrency is too slow, set `build.concurrency` in astro.config.mjs.

## Acceptance

- All three URL families render
- Char page count matches: `wc -l public/unicode/char/*` should be unchanged
- Per-char head tags (title, OG) match Vue site output
- Subfont CSS for the block's WOFF2 is linked in the head
