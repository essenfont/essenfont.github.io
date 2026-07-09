// Coverage-data loaders for Astro islands.
//
// Two flavors:
//   loadBlockCoverage(slug) — per-block covered-codepoint set + summary.
//     Powers the per-block page's tofu-highlight toggle.
//   loadCoverageIndex() — full block-by-block report from
//     public/coverage.json. Powers the CoverageMap component.

export interface BlockCoverageSummary {
  covered_count: number;
  assigned_count: number;
  uncovered_count: number;
  unassigned_count: number;
  total_range: number;
  pct: number;
  status: string;
}

export interface BlockCoverage {
  covered: Set<number>;
  summary: BlockCoverageSummary;
}

export interface CoverageIndexBlock {
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

export interface CoverageIndex {
  generated_at: string;
  unicode_version?: string;
  source?: string;
  overall?: {
    covered: number;
    total: number;
    pct: number;
    block_count: number;
    cmap_union?: number;
  };
  totals?: {
    blocks: number;
    assigned_blocks: number;
    reserved_blocks: number;
    empty: number;
    complete: number;
    covered: number;
    assigned: number;
    pct: number;
  };
  blocks: CoverageIndexBlock[];
}

interface BlockCoverageJson {
  covered: number[];
  covered_count: number;
  assigned_count: number;
  uncovered_count: number;
  unassigned_count: number;
  total_range: number;
  pct: number;
  status: string;
}

/**
 * Load per-block coverage from `/coverage/{slug}.json`.
 * Returns null on fetch failure so the caller can render a fallback.
 */
export async function loadBlockCoverage(slug: string): Promise<BlockCoverage | null> {
  try {
    const res = await fetch(`/coverage/${slug}.json`);
    if (!res.ok) return null;
    const data = (await res.json()) as BlockCoverageJson;
    return {
      covered: new Set(data.covered),
      summary: {
        covered_count: data.covered_count,
        assigned_count: data.assigned_count,
        uncovered_count: data.uncovered_count,
        unassigned_count: data.unassigned_count,
        total_range: data.total_range,
        pct: data.pct,
        status: data.status,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Load the full coverage index from `/coverage.json`.
 * Returns null on fetch failure.
 */
export async function loadCoverageIndex(): Promise<CoverageIndex | null> {
  try {
    const res = await fetch('/coverage.json');
    if (!res.ok) return null;
    return (await res.json()) as CoverageIndex;
  } catch {
    return null;
  }
}

/**
 * Whether a block is "reserved" by Unicode design — PUA, Surrogates,
 * Specials. Essenfont intentionally doesn't cover these; they're not
 * a coverage gap, just an empty-by-design region. The CoverageMap
 * renders them muted and excludes them from the headline percentage.
 */
export function isReservedBlock(block: CoverageIndexBlock): boolean {
  return /Private.Use|Surrogates|Specials/i.test(block.id);
}
