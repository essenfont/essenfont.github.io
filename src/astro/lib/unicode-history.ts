// Unicode version history model.
//
// `BLOCKS_BY_VERSION` aggregates blocks from public/unicode-blocks.json
// by their `unicode_version` field. `UNICODE_RELEASE_YEARS` is the only
// hard-coded data — every Unicode version's release year, from public
// Unicode Consortium history. Both are exposed as the single source of
// truth for any timeline-style visualization.

import { loadAllBlocks } from './unicode/data/loader';

export interface UnicodeReleaseYear {
  /** "17.0" — Unicode version string. */
  version: string;
  /** Public release year (CE). */
  year: number;
}

/** Hard-coded release years. Single source of truth for the timeline's
 *  time axis. Update when a new Unicode version ships. */
export const UNICODE_RELEASE_YEARS: readonly UnicodeReleaseYear[] = [
  { version: '1.1', year: 1993 },
  { version: '2.0', year: 1996 },
  { version: '2.1', year: 1998 },
  { version: '3.0', year: 2000 },
  { version: '3.1', year: 2001 },
  { version: '3.2', year: 2002 },
  { version: '4.0', year: 2003 },
  { version: '4.1', year: 2005 },
  { version: '5.0', year: 2006 },
  { version: '5.1', year: 2008 },
  { version: '5.2', year: 2009 },
  { version: '6.0', year: 2010 },
  { version: '6.1', year: 2012 },
  { version: '6.2', year: 2012 },
  { version: '6.3', year: 2013 },
  { version: '7.0', year: 2014 },
  { version: '8.0', year: 2015 },
  { version: '9.0', year: 2016 },
  { version: '10.0', year: 2017 },
  { version: '11.0', year: 2018 },
  { version: '12.0', year: 2019 },
  { version: '12.1', year: 2019 },
  { version: '13.0', year: 2020 },
  { version: '14.0', year: 2021 },
  { version: '15.0', year: 2022 },
  { version: '15.1', year: 2023 },
  { version: '16.0', year: 2024 },
  { version: '17.0', year: 2025 },
] as const;

export interface VersionSlice {
  version: string;
  year: number;
  /** Codepoints added in this version (sum of new blocks' ranges). */
  newCodepoints: number;
  /** Cumulative assigned codepoints through this version. */
  cumulative: number;
  /** Blocks introduced in this version. */
  newBlocks: Array<{ name: string; range: string; size: number }>;
}

let _cache: VersionSlice[] | null = null;

/** Aggregate blocks from public/unicode-blocks.json by unicode_version.
 *  Returns one VersionSlice per version present in the block data, in
 *  chronological order (oldest first). */
export function loadVersionTimeline(): VersionSlice[] {
  if (_cache) return _cache;

  const blocks = loadAllBlocks();
  const yearFor = new Map(UNICODE_RELEASE_YEARS.map((v) => [v.version, v.year]));

  // Group blocks by their declared unicode_version.
  const byVersion = new Map<string, typeof blocks>();
  for (const b of blocks) {
    const v = b.unicodeVersion;
    if (!byVersion.has(v)) byVersion.set(v, []);
    byVersion.get(v)!.push(b);
  }

  // Order versions chronologically using the release-year lookup.
  const ordered = Array.from(byVersion.keys()).sort((a, b) => {
    const ya = yearFor.get(a) ?? 0;
    const yb = yearFor.get(b) ?? 0;
    return ya - yb;
  });

  const out: VersionSlice[] = [];
  let cumulative = 0;
  for (const v of ordered) {
    const vBlocks = byVersion.get(v)!.map((b) => ({
      name: b.name,
      range: b.range,
      size: b.end - b.start + 1,
    }));
    const newCodepoints = vBlocks.reduce((s, b) => s + b.size, 0);
    cumulative += newCodepoints;
    out.push({
      version: v,
      year: yearFor.get(v) ?? 0,
      newCodepoints,
      cumulative,
      newBlocks: vBlocks,
    });
  }
  _cache = out;
  return out;
}
