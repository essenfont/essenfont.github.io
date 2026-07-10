#!/usr/bin/env node
// Generates public/face-table.json — per-face metadata from the Essenfont TTC.
//
// Reads the TTC from the sibling build repo (or the locally downloaded copy),
// extracts head/hhea/OS-2/maxp/cmap per face via Python fontTools subprocess,
// writes the aggregated JSON to public/face-table.json.
//
// This is the single source of truth for the /engineering/specification page's
// face table and the TTCAnatomy SVG component.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// Locate the TTC: sibling build repo first, then website's own public/.
function findTtc() {
  const candidates = [
    path.resolve(ROOT, '..', 'essenfont', 'Essenfont-Regular.ttc'),
    path.join(PUBLIC, 'Essenfont-Regular.ttc'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const ttcPath = findTtc();
if (!ttcPath) {
  console.warn('face-table: TTC not found, skipping (expected before first build)');
  process.exit(0);
}

// Use Python fontTools to parse the TTC. fontTools is the most reliable
// cross-platform TTC parser. We shell out once per build — no runtime cost.
const script = `
import json, sys
from fontTools.ttLib import TTCollection, TTFont

ttc = TTCollection(sys.argv[1])
faces = []
for i, font in enumerate(ttc.fonts):
    head = font['head']
    hhea = font['hhea']
    os2 = font['OS/2']
    maxp = font['maxp']
    cmap = font.getBestCmap()

    # Determine plane from cmap codepoint range
    cps = list(cmap.keys()) if cmap else []
    if not cps:
        plane = 'UNKNOWN'
    else:
        max_cp = max(cps)
        plane = {0: 'BMP', 1: 'SMP', 2: 'SIP', 3: 'TIP', 14: 'SSP'}.get(max_cp >> 16, f'Plane{max_cp >> 16}')

    faces.append({
        'index': i,
        'plane': plane,
        'planeIndex': (max(cps) >> 16) if cps else 0,
        'glyphCount': maxp.numGlyphs,
        'cmapEntries': len(cmap),
        'upm': head.unitsPerEm,
        'head': {
            'xMin': head.xMin,
            'yMin': head.yMin,
            'xMax': head.xMax,
            'yMax': head.yMax,
        },
        'hhea': {
            'ascent': hhea.ascent,
            'descent': hhea.descent,
            'lineGap': hhea.lineGap,
        },
        'os2': {
            'sTypoAscender': os2.sTypoAscender,
            'sTypoDescender': os2.sTypoDescender,
            'sTypoLineGap': os2.sTypoLineGap,
            'usWinAscent': os2.usWinAscent,
            'usWinDescent': os2.usWinDescent,
        },
    })
print(json.dumps({'faces': faces, 'source': sys.argv[1]}))
`;

try {
  const output = execSync(`python3 -c '${script.replace(/'/g, "'\\''")}' "${ttcPath}"`, {
    encoding: 'utf-8',
    timeout: 30000,
  });
  const data = JSON.parse(output.trim());
  data.generatedAt = new Date().toISOString();
  data.sourceSha256 = execSync(`sha256sum "${ttcPath}" | cut -d' ' -f1`, { encoding: 'utf-8' }).trim();

  const outPath = path.join(PUBLIC, 'face-table.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`face-table: wrote ${path.relative(ROOT, outPath)} (${data.faces.length} faces)`);
} catch (err) {
  console.warn(`face-table: failed to parse TTC: ${err.message}`);
  console.warn('  (install fonttools: pip3 install fonttools)');
  process.exit(0); // non-fatal — website still builds without this
}
