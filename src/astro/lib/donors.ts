// Build-time data loaders for donor + release data.

import fs from 'node:fs';
import path from 'node:path';

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
  otc_url?: string;
  coverage_url?: string;
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

export function loadDonorDetail(slug: string): DonorDetail | null {
  const filePath = path.join(DONORS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DonorDetail;
}

export function loadReleases(): Release[] {
  return readJsonSync<Release[]>('releases.json');
}

export function loadDonorCoverage(donor: DonorDetail): CoverageRow[] {
  const rows: CoverageRow[] = [];
  for (const f of donor.files || []) {
    for (const c of f.all_coverage || []) {
      if (typeof c.covered === 'number' && typeof c.total === 'number') {
        rows.push({ ...c, file_label: f.label });
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
