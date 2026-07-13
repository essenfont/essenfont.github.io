#!/usr/bin/env node
// Generates public/releases.json by fetching release data from the
// essenfont/essenfont GitHub Releases API.
//
// Basic fields (tag, name, date, URLs) come from the API.
// Curated names, notes, and stats come from public/release-notes.json
// overrides. Releases without overrides fall back to the git commit
// subjects between this tag and the previous one.
//
// If the API call fails (e.g. rate limit, network), the existing
// public/releases.json is preserved.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const REPO = 'essenfont/essenfont';
const SIBLING = path.resolve(ROOT, '..', 'essenfont');
const API = `https://api.github.com/repos/${REPO}/releases?per_page=100`;

const overridesPath = path.join(PUBLIC, 'release-notes.json');
const overrides = fs.existsSync(overridesPath)
  ? JSON.parse(fs.readFileSync(overridesPath, 'utf-8'))
  : {};

let releases;
try {
  const res = await fetch(API, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(process.env.GH_TOKEN && { Authorization: `Bearer ${process.env.GH_TOKEN}` }),
    },
  });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  releases = await res.json();
} catch (e) {
  console.warn(`Warning: could not fetch releases from GitHub API: ${e.message}`);
  console.warn('Keeping existing public/releases.json.');
  process.exit(0);
}

const tags = releases.map(r => r.tag_name).filter(Boolean);
const prevTag = (tag) => {
  const i = tags.indexOf(tag);
  return i >= 0 && i < tags.length - 1 ? tags[i + 1] : null;
};

function commitNotes(tag) {
  const prev = prevTag(tag);
  if (!prev) return '';
  const cwd = fs.existsSync(SIBLING) ? SIBLING : ROOT;
  try {
    return execSync(`git log ${prev}..${tag} --oneline --format="%s"`, {
      encoding: 'utf-8',
      cwd,
    }).trim().split('\n').filter(Boolean).join('; ');
  } catch {
    return '';
  }
}

function assetURL(tag, name) {
  return `https://github.com/${REPO}/releases/download/${tag}/${name}`;
}

const out = [];
for (let i = 0; i < releases.length; i++) {
  const rel = releases[i];
  const tag = rel.tag_name;
  if (!tag) continue;
  const ov = overrides[tag] || {};

  const entry = {
    tag,
    name: ov.name || rel.name || tag,
    date: (rel.published_at || '').slice(0, 10),
    url: `https://github.com/${REPO}/releases/tag/${tag}`,
    otc_url: assetURL(tag, 'Essenfont-Regular.otc'),
    coverage_url: assetURL(tag, 'coverage.json'),
    npm_url: `https://www.npmjs.com/package/essenfont/v/${tag.replace(/^v/, '')}`,
    notes: ov.notes || commitNotes(tag) || '',
  };

  if (i === 0) entry.isLatest = true;
  if (ov.broken) entry.broken = true;
  if (ov.stats) entry.stats = ov.stats;

  out.push(entry);
}

const outPath = path.join(PUBLIC, 'releases.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${path.relative(ROOT, outPath)} (${out.length} releases, latest: ${out[0]?.tag})`);
