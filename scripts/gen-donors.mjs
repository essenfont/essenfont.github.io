#!/usr/bin/env node
// Generates per-donor JSON files in public/donors/ from the essenfont
// build repo's sources/manifest.yml.
//
// Reads the sibling repo at ../essenfont/sources/manifest.yml, parses
// each donor entry, and writes public/donors/{slug}.json. Existing
// hand-curated files are NOT overwritten (they may have richer notes,
// vendor info, or license details than the manifest provides).
//
// Also generates public/donors.json — the index file consumed by
// loadDonors() in lib/donors.ts.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DONORS_DIR = path.join(PUBLIC, 'donors');
const SIBLING = path.resolve(ROOT, '..', 'essenfont');
const MANIFEST = path.join(SIBLING, 'sources', 'manifest.yml');

if (!fs.existsSync(MANIFEST)) {
  console.warn(`Warning: manifest not found at ${MANIFEST} — skipping donor generation.`);
  console.warn('Falling back to existing public/donors/ files.');
  process.exit(0);
}

function parseManifest(text) {
  // Minimal YAML parser for the donor section. Each entry starts with
  // "- label:" at 2-space indent. We extract key: value pairs until
  // the next "- label:" or a dedent to column 0.
  const lines = text.split('\n');
  const donorsStart = lines.findIndex(l => /^donors:\s*$/.test(l));
  if (donorsStart < 0) return [];
  const body = lines.slice(donorsStart + 1);

  const donors = [];
  let current = null;
  let inList = false;

  for (const line of body) {
    if (/^[a-z_]+:/.test(line)) break; // next top-level key

    const entryMatch = line.match(/^  -\s+label:\s*(.+)$/);
    if (entryMatch) {
      if (current) donors.push(current);
      current = { label: entryMatch[1].trim() };
      inList = false;
      continue;
    }

    if (!current) continue;

    const kv = line.match(/^    (\w+):\s*(.*)$/);
    if (kv) {
      const [, key, rawVal] = kv;
      let val = rawVal.trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      // covers is a YAML inline list: [A, B, C]
      if (key === 'covers') {
        val = val.replace(/^\[/, '').replace(/\]$/, '').split(',').map(s => s.trim()).filter(Boolean);
      } else if (val === '') {
        // Multi-line value — skip for now (rare in manifest donor entries)
        val = null;
      }
      current[key] = val;
      inList = false;
      continue;
    }
  }
  if (current) donors.push(current);
  return donors;
}

function slugify(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function inferVendor(family, label) {
  const hay = `${family} ${label}`.toLowerCase();
  if (/noto/.test(hay)) return 'Google';
  if (/sil|graphite/.test(hay)) return 'SIL International';
  if (/synthetic|code-chart|auto-generated/.test(hay)) return 'Synthetic';
  if (/full-sung|fsung/.test(hay)) return 'F.G. Wang';
  return 'Community';
}

function inferSourceType(family, label) {
  const hay = `${family} ${label}`.toLowerCase();
  if (/noto/.test(hay)) return 'noto';
  if (/synthetic|code-chart|auto-generated/.test(hay)) return 'synthetic';
  if (/fsung|full-sung/.test(hay)) return 'fsung';
  return 'other';
}

const manifestText = fs.readFileSync(MANIFEST, 'utf-8');
const donors = parseManifest(manifestText);

let created = 0;
let skipped = 0;
const summaries = [];

for (const d of donors) {
  if (!d.label) continue;
  const slug = slugify(d.label);
  const outPath = path.join(DONORS_DIR, `${slug}.json`);

  // Don't overwrite hand-curated files — they have richer data.
  if (fs.existsSync(outPath)) {
    skipped++;
    try {
      const existing = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
      summaries.push({
        family: existing.family || d.family || d.label,
        slug,
        license: existing.license || d.license || 'OFL',
        author: existing.author || d.author || '',
        file_count: existing.file_count || (d.file ? 1 : 0),
        covers_count: (existing.covers || d.covers || []).length,
        first_cover: (existing.covers || d.covers || [])[0] || '',
        role: existing.role || '',
        planes: existing.planes || [],
        parsed_coverage_count: 0,
        source_type: existing.source_type || inferSourceType(d.family, d.label),
        vendor: existing.vendor || inferVendor(d.family, d.label),
      });
    } catch { /* skip unreadable */ }
    continue;
  }

  const covers = d.covers || [];
  const detail = {
    family: d.family || d.label,
    slug,
    license: d.license || 'OFL',
    author: d.author || '',
    url: d.url || null,
    url_mirror: null,
    web: null,
    notes: '',
    author_note: null,
    file_count: 1,
    covers,
    files: [{
      label: d.label,
      file: d.file || '',
      style: d.style || 'Regular',
      version: d.version || '',
      sha256: d.sha256 || '',
      url: d.url || '',
      covers,
    }],
    source_type: inferSourceType(d.family, d.label),
    vendor: inferVendor(d.family, d.label),
    role: '',
    planes: [],
    parsed_coverage: [],
  };

  fs.writeFileSync(outPath, JSON.stringify(detail, null, 2) + '\n');
  created++;

  summaries.push({
    family: detail.family,
    slug,
    license: detail.license,
    author: detail.author,
    file_count: 1,
    covers_count: covers.length,
    first_cover: covers[0] || '',
    role: '',
    planes: [],
    parsed_coverage_count: 0,
    source_type: detail.source_type,
    vendor: detail.vendor,
  });
}

// Generate donors.json index
const indexPath = path.join(PUBLIC, 'donors.json');
fs.writeFileSync(indexPath, JSON.stringify({ families: summaries }, null, 2) + '\n');

console.log(`wrote ${summaries.length} donors (${created} new, ${skipped} existing) → public/donors/`);
