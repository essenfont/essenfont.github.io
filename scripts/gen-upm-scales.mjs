#!/usr/bin/env node
// Generates public/upm-scales.json — per-donor native UPM + scale factor.
//
// Reads each donor's head.unitsPerEm from the sibling build repo's
// references/input-fonts/, computes the scale factor (target / native),
// writes the aggregated JSON.
//
// Single source of truth for the UPMNormalization SVG component and the
// /engineering/specification page's UPM strategy table.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const TARGET_UPM = 1000;

// Locate donor fonts in the sibling build repo.
const DONOR_DIR = path.resolve(ROOT, '..', 'essenfont', 'references', 'input-fonts');
if (!fs.existsSync(DONOR_DIR)) {
  console.warn('upm-scales: donor dir not found, skipping');
  process.exit(0);
}

// Read unitsPerEm from a font file's head table.
// head table offset 18: uint16 unitsPerEm.
function readUpm(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(12);
    fs.readSync(fd, header, 0, 12, 0);

    let sfntOffset = 0;
    if (header.subarray(0, 4).toString('ascii') === 'ttcf') {
      // TTC: first face offset at byte 12
      const ttcHeader = Buffer.alloc(16);
      fs.readSync(fd, ttcHeader, 0, 16, 0);
      sfntOffset = ttcHeader.readUInt32BE(12);
    }

    const sfntHeader = Buffer.alloc(12);
    fs.readSync(fd, sfntHeader, 0, 12, sfntOffset);
    const numTables = sfntHeader.readUInt16BE(4);

    let headOffset = null;
    for (let i = 0; i < numTables; i++) {
      const rec = Buffer.alloc(16);
      fs.readSync(fd, rec, 0, 16, sfntOffset + 12 + i * 16);
      const tag = rec.subarray(0, 4).toString('ascii');
      if (tag === 'head') {
        headOffset = rec.readUInt32BE(8);
        break;
      }
    }

    if (headOffset === null) return null;

    const upmBuf = Buffer.alloc(2);
    fs.readSync(fd, upmBuf, 0, 2, headOffset + 18);
    fs.closeSync(fd);
    return upmBuf.readUInt16BE(0);
  } catch {
    return null;
  }
}

// Scan all donor files
const donors = [];
const files = fs.readdirSync(DONOR_DIR).filter(f =>
  f.endsWith('.ttf') || f.endsWith('.otf')
);

for (const file of files) {
  const fullPath = path.join(DONOR_DIR, file);
  if (fs.statSync(fullPath).isDirectory()) continue;

  const upm = readUpm(fullPath);
  if (!upm || upm === 0) continue;

  const scaleFactor = TARGET_UPM / upm;
  donors.push({
    file,
    nativeUpm: upm,
    scaleFactor: Math.round(scaleFactor * 10000) / 10000,
    scaled: scaleFactor !== 1.0,
  });
}

// Group by UPM for summary
const byUpm = {};
for (const d of donors) {
  if (!byUpm[d.nativeUpm]) byUpm[d.nativeUpm] = [];
  byUpm[d.nativeUpm].push(d.file);
}

const data = {
  generatedAt: new Date().toISOString(),
  targetUpm: TARGET_UPM,
  donorCount: donors.length,
  summary: Object.entries(byUpm)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([upm, files]) => ({
      nativeUpm: parseInt(upm),
      count: files.length,
      scaleFactor: Math.round((TARGET_UPM / parseInt(upm)) * 10000) / 10000,
      files,
    })),
  donors: donors.sort((a, b) => a.nativeUpm - b.nativeUpm),
};

const outPath = path.join(PUBLIC, 'upm-scales.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
console.log(`upm-scales: wrote ${path.relative(ROOT, outPath)} (${donors.length} donors)`);
