// Astro-compatible Unicode data loader.
//
// During SSG (Astro frontmatter), reads from filesystem via node:fs.
// Browser-side (islands), falls back to fetch().
//
// Ported from src/lib/unicode/data/loader.ts — the logic is identical,
// only the SSR detection changes (import.meta.env.SSR → static analysis).

import fs from 'node:fs';
import path from 'node:path';
import type { UnicodeBlock, UnicodeCharacter, UnicodeVersion, UnicodePlane } from '../types';
import { PLANES, planeForCodepoint } from '../constants';
import type { PlaneKey } from '../types';

const PUBLIC_DIR = path.resolve('./public');

function readJsonSync<T>(relPath: string): T {
  const full = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
  return JSON.parse(fs.readFileSync(full, 'utf-8'));
}

// Raw JSON shape from unicode-blocks.json (minimal — just what UCD emits).
interface RawBlock {
  name: string;
  start: number;
  end: number;
  unicode_version: string;
}

function enrichBlock(raw: RawBlock): UnicodeBlock {
  const plane = planeForCodepoint(raw.start);
  return {
    name: raw.name,
    start: raw.start,
    end: raw.end,
    range: `U+${raw.start.toString(16).toUpperCase()}–U+${raw.end.toString(16).toUpperCase()}`,
    plane,
    displayName: raw.name,
    scriptGroup: 'Other',
    unicodeVersion: raw.unicode_version,
    characters: [],
    assignedCount: raw.end - raw.start + 1,
  };
}

export function loadAllBlocks(): UnicodeBlock[] {
  const raw = readJsonSync<RawBlock[]>('unicode-blocks.json');
  return raw.map(enrichBlock);
}

export function loadUnicodeVersion(): UnicodeVersion {
  return readJsonSync<UnicodeVersion>('unicode-version.json');
}

// Raw character shape from per-block JSON (short field names from UCD XML extraction).
interface RawCharacter {
  cp: number;
  n?: string;
  c?: string;
  s?: string;
  cc?: number;
  bc?: string | null;
  mir?: boolean;
  up?: string | null;
  lo?: string | null;
  ti?: string | null;
  dm?: string | null;
}

function hexCp(cp: number): string {
  return cp.toString(16).toUpperCase().padStart(4, '0');
}

function safeChar(cp: number): string {
  try { return String.fromCodePoint(cp); } catch { return ''; }
}

function enrichChar(raw: RawCharacter): UnicodeCharacter {
  const cp = raw.cp;
  let name = raw.n ?? '';
  if (!name) {
    if (cp >= 0x3400 && cp <= 0x9FFF || cp >= 0x20000 && cp <= 0x2FFFF) {
      name = `CJK UNIFIED IDEOGRAPH-${cp.toString(16).toUpperCase().padStart(5, '0')}`;
    } else {
      name = `<control-${cp.toString(16).toUpperCase()}>`;
    }
  }
  return {
    cp,
    hex: hexCp(cp),
    char: safeChar(cp),
    name,
    category: raw.c ?? '',
    script: raw.s ?? '',
    combiningClass: raw.cc ?? 0,
    bidiClass: raw.bc ?? null,
    mirrored: raw.mir ?? false,
    simpleUppercase: raw.up ?? null,
    simpleLowercase: raw.lo ?? null,
    simpleTitlecase: raw.ti ?? null,
    decomposition: raw.dm ?? null,
  };
}

export function loadBlockCharacters(blockSlug: string): UnicodeCharacter[] {
  try {
    const data = readJsonSync<{ chars: RawCharacter[] }>(`unicode/blocks/${blockSlug}.json`);
    return (data.chars || []).map(enrichChar);
  } catch {
    return [];
  }
}

export function loadBlock(blockSlug: string): UnicodeBlock | null {
  const blocks = loadAllBlocks();
  return blocks.find(b => slugifyBlockName(b.name) === blockSlug) ?? null;
}

export function slugifyBlockName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getPlanes(blocks: UnicodeBlock[]): UnicodePlane[] {
  return PLANES.map(p => ({
    key: p.key,
    name: p.name,
    shortName: p.shortName,
    range: p.range,
    start: p.start,
    end: p.end,
    blocks: blocks.filter(b => b.plane === p.key),
  }));
}

export function getBlocksByPlane(blocks: UnicodeBlock[], key: PlaneKey): UnicodeBlock[] {
  return blocks.filter(b => b.plane === key);
}
