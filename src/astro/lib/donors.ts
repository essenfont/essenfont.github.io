// Build-time data loaders for donor + release data.

import fs from 'node:fs';
import path from 'node:path';
import { loadAllBlocks } from './unicode';

const PUBLIC_DIR = path.resolve('./public');
const DONORS_DIR = path.join(PUBLIC_DIR, 'donors');

function readJsonSync<T>(relPath: string): T {
  const full = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
  return JSON.parse(fs.readFileSync(full, 'utf-8'));
}

export interface DonorSummary {
  family: string;
  slug: string;
  license: string;
  author: string;
  file_count: number;
  covers_count: number;
  first_cover: string;
  role: string;
  planes: string[];
  parsed_coverage_count: number;
  source_type: string;
  vendor: string;
}

export interface CoverageRow {
  block: string;
  plane: string;
  plane_index: number | null;
  plane_full: string;
  range: string;
  covered: number;
  total: number;
  pct: number;
  source?: string;
  file_label?: string;
}

export interface DonorFile {
  label: string;
  file: string;
  style?: string;
  version?: string;
  sha256?: string;
  enabled?: boolean;
  notes?: string;
  url?: string;
  url_mirror?: string;
  url_extract?: string;
  url_extract_member?: string;
  all_coverage?: Array<{
    block: string;
    covered?: number;
    total?: number;
    pct?: number;
    range?: string;
    plane?: string;
    plane_index?: number | null;
    plane_full?: string;
    source?: string;
  }>;
}

export interface CodeChartUrl {
  block: string;
  url: string;
  index_url?: string;
}

export interface DonorDetail {
  family: string;
  slug: string;
  license: string;
  author: string;
  url?: string;
  url_mirror?: string;
  web?: string;
  notes?: string;
  author_note?: string;
  file_count: number;
  covers?: string[];
  files: DonorFile[];
  source_type: string;
  vendor?: string;
  enabled?: boolean;
  license_category?: string;
  license_restriction?: string;
  license_summary?: string;
  license_statement?: string;
  covers_blocks?: string[];
  role: string;
  relationship?: { kind: string; primary: string };
  planes: string[];
  parsed_coverage?: unknown[];
  code_chart_urls?: CodeChartUrl[];
}

export interface Release {
  tag: string;
  name: string;
  date: string;
  url: string;
  ttc_url?: string;
  otc_url?: string;
  coverage_url?: string;
  npm_url?: string;
  isLatest?: boolean;
  notes?: string;
  stats?: {
    codepoints?: number;
    pct?: number;
    planes?: number;
  };
}

export function loadDonors(): DonorSummary[] {
  const data = readJsonSync<{ families: DonorSummary[] }>('donors.json');
  return data.families || [];
}

export function listDonorSlugs(): string[] {
  if (!fs.existsSync(DONORS_DIR)) return [];
  return fs.readdirSync(DONORS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

/**
 * Build a Map<blockId, donorSlug> by reading every per-donor JSON file's
 * `covers` array. blockId is the underscored form (e.g.
 * "CJK_Compatibility_Ideographs"); convert from a human-readable block
 * name via blockNameToId().
 */
let _blockToDonorCache: Map<string, string> | null = null;
export function blockToDonorSlug(): Map<string, string> {
  if (_blockToDonorCache) return _blockToDonorCache;
  const map = new Map<string, string>();
  if (!fs.existsSync(DONORS_DIR)) return map;
  for (const file of fs.readdirSync(DONORS_DIR)) {
    if (!file.endsWith('.json')) continue;
    const slug = file.replace(/\.json$/, '');
    const data = JSON.parse(fs.readFileSync(path.join(DONORS_DIR, file), 'utf-8')) as { covers?: string[] };
    for (const blockId of data.covers || []) {
      if (!map.has(blockId)) map.set(blockId, slug);
    }
  }
  _blockToDonorCache = map;
  return map;
}

/**
 * Convert a human-readable Unicode block name ("CJK Compatibility Ideographs")
 * to its underscored identifier form ("CJK_Compatibility_Ideographs") as used
 * in the donor manifest `covers` arrays.
 */
export function blockNameToId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function loadDonorDetail(slug: string): DonorDetail | null {
  const filePath = path.join(DONORS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DonorDetail;
}

export function loadReleases(): Release[] {
  return readJsonSync<Release[]>('releases.json');
}

export function loadDonorCoverage(donor: DonorDetail): CoverageRow[] {
  // Build a one-time block-name → plane index map so each coverage row
  // knows which plane it belongs to without the donor JSON having to
  // duplicate that data.
  const blocks = loadAllBlocks();
  const blockPlane = new Map<string, { plane: string; plane_index: number }>();
  for (const b of blocks) {
    const planeIndex = b.start >> 16;
    const planeLabel = planeLabelForIndex(planeIndex);
    blockPlane.set(b.name, { plane: planeLabel, plane_index: planeIndex });
  }

  const rows: CoverageRow[] = [];
  for (const f of donor.files || []) {
    for (const c of f.all_coverage || []) {
      if (typeof c.covered === 'number' && typeof c.total === 'number') {
        const meta = blockPlane.get(c.block) ?? { plane: '?', plane_index: 0 };
        rows.push({
          ...c,
          file_label: f.label,
          plane: meta.plane,
          plane_index: meta.plane_index,
        });
      }
    }
  }
  const byBlock = new Map<string, CoverageRow>();
  for (const r of rows) {
    const existing = byBlock.get(r.block);
    if (!existing || r.covered > existing.covered) {
      byBlock.set(r.block, r);
    }
  }
  return Array.from(byBlock.values()).sort((a, b) => b.covered - a.covered);
}

function planeLabelForIndex(idx: number): string {
  const labels: Record<number, string> = { 0: 'BMP', 1: 'SMP', 2: 'SIP', 3: 'TIP', 14: 'SSP' };
  return labels[idx] ?? `P${idx}`;
}

export interface DonorLogo {
  src: string;
  alt: string;
}

const VENDOR_LOGOS: readonly { match: string; logo: DonorLogo }[] = [
  { match: 'noto',     logo: { src: '/img/donor-logos/google-fonts.svg', alt: 'Google Fonts logo' } },
  { match: 'google',   logo: { src: '/img/donor-logos/google-fonts.svg', alt: 'Google Fonts logo' } },
  { match: 'sil',      logo: { src: '/img/donor-logos/sil.svg',          alt: 'SIL International logo' } },
  { match: 'synthetic',logo: { src: '/img/donor-logos/unicode-org.svg',  alt: 'Unicode Consortium logo' } },
];

export function donorLogo(family: string, vendor: string): DonorLogo | null {
  const hay = `${family} ${vendor}`.toLowerCase();
  return VENDOR_LOGOS.find((v) => hay.includes(v.match))?.logo ?? null;
}
