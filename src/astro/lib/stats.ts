// Build-time stats for the Essenfont site.
//
// Ported from scripts/gen-site-stats.mjs output. The JSON is regenerated
// at build time (see package.json "build" script) so these numbers are
// always current with the committed data + sibling essenfont repo.

import { loadJson } from './ssr';

export interface LatestRelease {
  tag: string;
  name: string;
  date: string;
  url: string;
  ttc_url?: string | null;
  npm_url?: string;
  coverage_url?: string;
  stats?: { codepoints?: number; pct?: number; planes?: number } | null;
  notes?: string | null;
}

export interface CoverageBlockSummary {
  id: string;
  name: string;
  range: string;
  first: number;
  last: number;
  covered: number;
  total: number;
  pct: number;
  status: string;
}

export interface CoverageStats {
  generated_at: string;
  unicode_version: string;
  source: string;
  overall: {
    covered: number;
    total: number;
    pct: number;
    block_count: number;
    cmap_union: number;
  };
  totals: {
    blocks: number;
    assigned_blocks: number;
    reserved_blocks: number;
    empty: number;
    complete: number;
    covered: number;
    assigned: number;
    pct: number;
  };
  blocks: CoverageBlockSummary[];
}

export interface SiteStats {
  generatedAt: string;
  unicode: {
    version: string;
    blockCount: number;
    assignedCodepointCount: number;
  };
  donorCount: number;
  fontBinaries: {
    otcSizeBytes: number | null;
    ttcSizeBytes: number | null;
    otfSizeBytes: number | null;
  };
  websiteSubsets: {
    woff2Count: number;
    woff2TotalBytes: number;
    woff1Count: number;
    woff1TotalBytes: number;
    perPlaneWoff2: Record<string, { file: string; size: number }>;
  };
  release: LatestRelease | null;
  coverage: CoverageStats | null;
}

export function loadStats(): SiteStats {
  return loadJson<SiteStats>('site-stats.json');
}
