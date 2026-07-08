# 16 — Dynamic stats from manifest + blocks JSON

The headline numbers on the home page must come from real data, not hand-typed.

## Stat sources

| Stat | Source | Computation |
|------|--------|-------------|
| Codepoints covered | `public/unicode-blocks.json` | `Σ(b.end - b.start + 1)` |
| Donor count | sibling `essenfont/sources/manifest.yml` | count of active entries |
| Donor glyphs assembled | sibling `essenfont/Essenfont-Regular.otc` | `Σ numGlyphs across faces` (fontTools) |
| OTC size (MB) | sibling `essenfont/Essenfont-Regular.otc` | `fs.statSync(path).size` |
| TTC size (MB) | sibling `essenfont/Essenfont-Regular.ttc` | same |
| Website subsets | `public/fonts/*.woff2` | file count |
| Website subset total size | `public/fonts/*.woff2` | byte sum |
| Coverage % (real glyphs) | per-face `loca.size_of(gid)` > 0 scan | experimental — see step 17 |

## Implementation

```ts
// src/astro/lib/stats.ts
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface SiteStats {
  codepointCount: number;
  blockCount: number;
  donorCount: number;
  otcSizeBytes: number | null;
  ttcSizeBytes: number | null;
  subsetCount: number;
  subsetTotalBytes: number;
}

const SIBLING = path.resolve('../essenfont');

export function loadStats(): SiteStats {
  const blocks = JSON.parse(fs.readFileSync('public/unicode-blocks.json', 'utf-8'));
  const codepointCount = blocks.reduce((n, b) => n + (b.end - b.start + 1), 0);

  const manifestPath = path.join(SIBLING, 'sources/manifest.yml');
  const donorCount = fs.existsSync(manifestPath)
    ? (yaml.load(fs.readFileSync(manifestPath, 'utf-8')) as any).donors.filter(d => !d.path_local_only || fs.existsSync(path.join(SIBLING, d.file))).length
    : 0;

  const stat = (p: string) => fs.existsSync(p) ? fs.statSync(p).size : null;
  const otcSizeBytes = stat(path.join(SIBLING, 'Essenfont-Regular.otc'));
  const ttcSizeBytes = stat(path.join(SIBLING, 'Essenfont-Regular.ttc'));

  const subsetFiles = fs.existsSync('public/fonts')
    ? fs.readdirSync('public/fonts').filter(f => f.endsWith('.woff2'))
    : [];
  const subsetTotalBytes = subsetFiles.reduce((n, f) => n + fs.statSync(path.join('public/fonts', f)).size, 0);

  return {
    codepointCount,
    blockCount: blocks.length,
    donorCount,
    otcSizeBytes,
    ttcSizeBytes,
    subsetCount: subsetFiles.length,
    subsetTotalBytes,
  };
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
```

## Usage

```astro
---
import { loadStats, formatBytes, formatNumber } from '../lib/stats';
const stats = loadStats();
---
<dl class="stats">
  <div>
    <dt>Codepoints</dt>
    <dd>{formatNumber(stats.codepointCount)}</dd>
  </div>
  <div>
    <dt>Donors</dt>
    <dd>{stats.donorCount}</dd>
  </div>
  <div>
    <dt>OTC size</dt>
    <dd>{formatBytes(stats.otcSizeBytes)}</dd>
  </div>
</dl>
```

## Acceptance

- Home page (and `/about`, `/engineering`) call `loadStats()` from frontmatter
- Stats reflect the actual rebuilt sibling font + committed JSON
- A test (`tests/stats.test.mjs`) asserts the numbers don't go backwards
