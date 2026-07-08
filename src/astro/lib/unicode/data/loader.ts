// Astro-compatible Unicode data loader.
//
// During SSG (Astro frontmatter), reads from filesystem via node:fs.
// Browser-side (islands), falls back to fetch().
//
// Ported from src/lib/unicode/data/loader.ts — the logic is identical,
// only the SSR detection changes (import.meta.env.SSR → static analysis).

import fs from 'node:fs';
import path from 'node:path';
import type { UnicodeBlock, UnicodeCharacter, UnicodeVersion } from '../types';

const PUBLIC_DIR = path.resolve('./public');

function readJsonSync<T>(relPath: string): T {
  const full = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
  return JSON.parse(fs.readFileSync(full, 'utf-8'));
}

export function loadAllBlocks(): UnicodeBlock[] {
  return readJsonSync<UnicodeBlock[]>('unicode-blocks.json');
}

export function loadUnicodeVersion(): UnicodeVersion {
  return readJsonSync<UnicodeVersion>('unicode-version.json');
}

export function loadBlockCharacters(blockSlug: string): UnicodeCharacter[] {
  // Block JSON files are stored as public/unicode/blocks/<slug>.json
  return readJsonSync<UnicodeCharacter[]>(`unicode/blocks/${blockSlug}.json`);
}

export function loadBlock(blockSlug: string): UnicodeBlock | null {
  const blocks = loadAllBlocks();
  return blocks.find(b => slugifyBlockName(b.name) === blockSlug) ?? null;
}

function slugifyBlockName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
