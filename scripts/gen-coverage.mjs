#!/usr/bin/env node
// Generates public/coverage.json from the essenfont donor manifest.
//
// Coverage model: a block is "covered" if ANY donor in the manifest
// lists it in its `covers` array. All assigned codepoints in covered
// blocks are counted. This reflects the theoretical coverage of the
// donor registry — the actual rendered glyphs depend on the per-block
// WOFF2 subsets in public/fonts/.
//
// The manifest lives at ../essenfont/sources/manifest.yml (sibling repo).
// On CI where the sibling repo is unavailable, the existing committed
// coverage.json is preserved.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SIBLING = path.resolve(ROOT, '..', 'essenfont');
const MANIFEST = path.join(SIBLING, 'sources', 'manifest.yml');

if (!fs.existsSync(MANIFEST)) {
  console.warn(`Warning: manifest not found at ${MANIFEST} — keeping existing coverage.json.`);
  process.exit(0);
}

const manifestText = fs.readFileSync(MANIFEST, 'utf-8');

// Parse covers arrays from the manifest. Each donor entry has:
//   covers: [Block_Name_1, Block_Name_2, ...]
// We collect the set of all block names that at least one donor covers.
const coveredBlockNames = new Set();
const coversMatch = manifestText.matchAll(/^\s*covers:\s*\[([^\]]+)\]/gm);
for (const m of coversMatch) {
  const names = m[1].split(',').map(s => s.trim()).filter(Boolean);
  for (const n of names) coveredBlockNames.add(n);
}
console.log(`Manifest: ${coveredBlockNames.size} blocks covered by at least one donor`);

// Cross-reference with Unicode block data.
const blocksDir = path.join(PUBLIC, 'unicode', 'blocks');
const blockFiles = fs.readdirSync(blocksDir).filter(f => f.endsWith('.json'));

// Build a lookup: blockName → normalized key for matching against
// manifest covers. The manifest uses hyphens (e.g. "Arabic_Extended-A")
// while block names use spaces ("Arabic Extended-A"). Normalize both
// to a lowercase alphanumeric string for reliable matching.
function normKey(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Normalize manifest names too
const coveredBlockKeys = new Set();
for (const name of coveredBlockNames) {
  coveredBlockKeys.add(normKey(name));
}

const blocks = [];
let totalAssigned = 0;
let totalCovered = 0;

for (const f of blockFiles.sort()) {
  const block = JSON.parse(fs.readFileSync(path.join(blocksDir, f), 'utf-8'));
  const chars = block.chars || [];
  const total = chars.length;
  const blockKey = normKey(block.name);
  const isCovered = coveredBlockKeys.has(blockKey);
  const covered = isCovered ? total : 0;
  const pct = total > 0 ? (covered / total) * 100 : 0;

  let status;
  if (total === 0) status = 'EMPTY';
  else if (isCovered) status = 'COMPLETE';
  else status = 'EMPTY';

  blocks.push({
    id: block.name.replace(/ /g, '_'),
    name: block.name,
    range: block.range,
    first: block.start,
    last: block.end,
    covered,
    total,
    pct: Math.round(pct * 100) / 100,
    status,
  });

  totalAssigned += total;
  totalCovered += covered;
}

const coverage = {
  generated_at: new Date().toISOString(),
  unicode_version: '17.0.0',
  source: 'donor manifest (../essenfont/sources/manifest.yml)',
  manifest_blocks_covered: coveredBlockNames.size,
  overall: {
    covered: totalCovered,
    total: totalAssigned,
    pct: Math.round((totalCovered / totalAssigned) * 10000) / 100,
    block_count: blocks.length,
  },
  totals: {
    blocks: blocks.length,
    empty: blocks.filter(b => b.status === 'EMPTY').length,
    complete: blocks.filter(b => b.status === 'COMPLETE').length,
    covered: totalCovered,
    assigned: totalAssigned,
    pct: Math.round((totalCovered / totalAssigned) * 10000) / 100,
  },
  blocks,
};

const outPath = path.join(PUBLIC, 'coverage.json');
fs.writeFileSync(outPath, JSON.stringify(coverage, null, 2));
console.log(`wrote ${path.relative(ROOT, outPath)}`);
console.log(`  ${totalCovered}/${totalAssigned} codepoints (${(totalCovered/totalAssigned*100).toFixed(2)}%)`);
console.log(`  ${coverage.totals.complete} complete, ${coverage.totals.empty} empty`);
