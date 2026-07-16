#!/usr/bin/env node
// Generates public/coverage.json by counting codepoints in each
// per-block WOFF2 subset (the actual fonts the website serves),
// cross-referenced with the Unicode block data.
//
// This is the ground truth — not cp_map (which misses compound glyph
// references) and not the source TTC (which may differ from the
// deployed WOFF2 subsets).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// Step 1: Extract cmaps from all per-block WOFF2 files using fonttools.
// Falls back to existing coverage.json when fonttools isn't available (CI).
const scriptPath = path.join(__dirname, 'count-woff2-cmap.py');
let woff2Cmaps;
try {
  console.log('Extracting cmaps from WOFF2 subsets...');
  woff2Cmaps = JSON.parse(execSync(`python3 ${scriptPath}`, {
    encoding: 'utf-8',
    maxBuffer: 100 * 1024 * 1024,
  }));
  console.log(`  ${Object.keys(woff2Cmaps).length} WOFF2 files processed`);
} catch (e) {
  const coveragePath = path.join(PUBLIC, 'coverage.json');
  if (fs.existsSync(coveragePath)) {
    console.warn('Warning: fonttools not available — keeping existing coverage.json.');
    process.exit(0);
  }
  console.error('fonttools not available and no existing coverage.json to fall back on.');
  process.exit(1);
}

// Build a global set of covered codepoints
const coveredCPs = new Set();
for (const cps of Object.values(woff2Cmaps)) {
  for (const cp of cps) coveredCPs.add(cp);
}
console.log(`  ${coveredCPs.size} unique codepoints across all WOFF2`);

// Step 2: Cross-reference with Unicode block data.
const blocksDir = path.join(PUBLIC, 'unicode', 'blocks');
const blockFiles = fs.readdirSync(blocksDir).filter(f => f.endsWith('.json'));

const blocks = [];
let totalAssigned = 0;
let totalCovered = 0;

for (const f of blockFiles.sort()) {
  const block = JSON.parse(fs.readFileSync(path.join(blocksDir, f), 'utf-8'));
  const chars = block.chars || [];
  const total = chars.length;
  const covered = chars.filter(c => coveredCPs.has(c.cp)).length;
  const pct = total > 0 ? (covered / total) * 100 : 0;

  let status;
  if (total === 0) status = 'EMPTY';
  else if (pct >= 99.5) status = 'COMPLETE';
  else if (pct >= 75) status = 'MOSTLY';
  else if (pct > 0) status = 'PARTIAL';
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
  source: 'per-block WOFF2 subsets in public/fonts/',
  woff2_files: Object.keys(woff2Cmaps).length,
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
console.log(`  ${totalCovered}/${totalAssigned} codepoints (${(totalCovered/totalAssigned*100).toFixed(1)}%)`);
console.log(`  ${coverage.totals.complete} complete, ${coverage.totals.empty} empty`);
