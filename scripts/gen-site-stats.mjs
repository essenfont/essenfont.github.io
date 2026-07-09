#!/usr/bin/env node
// Generates public/site-stats.json with build-time stats computed from
// the committed data files + sibling essenfont repo's font binaries.
//
// Stats are surfaced on the home page and /engineering story. If a
// sibling file is missing (e.g. working in isolation without the font
// repo), the corresponding size field is null and the UI shows '—'.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SIBLING = path.resolve(ROOT, '..', 'essenfont');

function statOrNil(p) {
  try { return fs.statSync(p).size; } catch { return null; }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function readYamlFrontmatterOnly(p) {
  // Minimal YAML reader for the manifest's "donors:" list — we only
  // need to count active `- label:` entries. Avoids a yaml dependency.
  // Each donor entry starts with two leading spaces + "- label:".
  const text = fs.readFileSync(p, 'utf-8');
  // Find the donors section. Stop at the next top-level key (a line
  // starting at column 0 that is not "donors:" or a comment).
  const startIdx = text.indexOf('\ndonors:\n');
  if (startIdx < 0) return [];
  const afterDonors = text.slice(startIdx + '\ndonors:\n'.length);
  // Find next top-level key (column 0, word_char+, ':')
  const endMatch = afterDonors.match(/\n[a-z_]+:\s*\n/);
  const body = endMatch ? afterDonors.slice(0, endMatch.index) : afterDonors;
  return body
    .split('\n')
    .filter(line => /^  -\s+label:/.test(line))
    .map(line => line.match(/label:\s*(\S+)/)?.[1])
    .filter(Boolean);
}

const stats = (() => {
  const unicodeVersion = readJson(path.join(PUBLIC, 'unicode-version.json'));
  const out = {
    generatedAt: new Date().toISOString(),
    unicode: {
      version: unicodeVersion.version,
      blockCount: unicodeVersion.blockCount,
      assignedCodepointCount: unicodeVersion.charCount,
    },
    donorCount: 0,
    fontBinaries: {
      otcSizeBytes: null,
      ttcSizeBytes: null,
      otfSizeBytes: null,
    },
    websiteSubsets: {
      woff2Count: 0,
      woff2TotalBytes: 0,
      woff1Count: 0,
      woff1TotalBytes: 0,
      perPlaneWoff2: {},
    },
    release: null,
    coverage: null,
  };

  // Latest release info from public/releases.json
  const releasesPath = path.join(PUBLIC, 'releases.json');
  if (fs.existsSync(releasesPath)) {
    const releases = readJson(releasesPath);
    const latest = (releases || []).find(r => r.isLatest) || (releases || [])[0];
    if (latest) {
      out.release = {
        tag: latest.tag,
        name: latest.name,
        date: latest.date,
        url: latest.url,
        ttc_url: latest.ttc_url,
        npm_url: latest.npm_url,
        coverage_url: latest.coverage_url,
        stats: latest.stats || null,
        notes: latest.notes || null,
      };
    }
  }

  // Donor count from sibling essenfont/sources/manifest.yml
  const manifestPath = path.join(SIBLING, 'sources', 'manifest.yml');
  if (fs.existsSync(manifestPath)) {
    out.donorCount = readYamlFrontmatterOnly(manifestPath).length;
  }

  // Font binary sizes from sibling essenfont/
  out.fontBinaries.otcSizeBytes = statOrNil(path.join(SIBLING, 'Essenfont-Regular.otc'));
  out.fontBinaries.ttcSizeBytes = statOrNil(path.join(SIBLING, 'Essenfont-Regular.ttc'));
  out.fontBinaries.otfSizeBytes = statOrNil(path.join(SIBLING, 'Essenfont-Regular.otf'));

  // Website subsets from public/fonts/
  const fontsDir = path.join(PUBLIC, 'fonts');
  if (fs.existsSync(fontsDir)) {
    for (const f of fs.readdirSync(fontsDir)) {
      const size = fs.statSync(path.join(fontsDir, f)).size;
      if (f.endsWith('.woff2')) {
        out.websiteSubsets.woff2Count++;
        out.websiteSubsets.woff2TotalBytes += size;
        // Per-plane WOFF2 files (Essenfont-BMP.woff2 etc.) come from
        // the npm package release. They're tracked separately.
        const planeMatch = f.match(/^Essenfont-(BMP|SMP|SIP|TIP|SSP)\.woff2$/i);
        if (planeMatch) {
          out.websiteSubsets.perPlaneWoff2[planeMatch[1].toUpperCase()] = {
            file: f,
            size,
          };
        }
      } else if (f.endsWith('.woff')) {
        out.websiteSubsets.woff1Count++;
        out.websiteSubsets.woff1TotalBytes += size;
      }
    }
  }

  // Coverage from public/coverage.json (if present)
  const coveragePath = path.join(PUBLIC, 'coverage.json');
  if (fs.existsSync(coveragePath)) {
    out.coverage = readJson(coveragePath);
  }

  return out;
})();

const outPath = path.join(PUBLIC, 'site-stats.json');
fs.writeFileSync(outPath, JSON.stringify(stats, null, 2) + '\n');
console.log(`wrote ${path.relative(ROOT, outPath)} (${stats.unicode.blockCount} blocks, ${stats.donorCount} donors, ${stats.websiteSubsets.woff2Count} woff2 subsets)`);
