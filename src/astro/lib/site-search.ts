// SiteSearch island logic. Extracted so it's testable.
//
// The search() function filters /search-index.json in-memory. Matches on:
//   - block name (case-insensitive substring)
//   - codepoint hex ("U+0041", "0041", "41" — any prefix form)
//   - codepoint decimal (numeric input matches the decimal value)
//   - single-char literal input (matches the codepoint)
//   - donor family name (case-insensitive substring)
//
// Keyboard nav and mouse interaction are handled by the SiteSearch.vue island.

export type ResultKind = 'block' | 'char' | 'donor';

export interface SearchResult {
  kind: ResultKind;
  label: string;
  href: string;
  detail?: string;
}

export interface SearchIndex {
  blocks: Array<{ name: string; slug: string; start: number; end: number }>;
  chars: Array<{ cp: number; name: string }>;
  donors: Array<{ family: string; slug: string; vendor: string }>;
}

const HEX_RE = /^(?:U\+)?([0-9A-Fa-f]{1,6})$/;
const DEC_RE = /^\d{1,8}$/;

export function search(index: SearchIndex, query: string, limit = 12): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const lower = q.toLowerCase();
  const out: SearchResult[] = [];

  // Codepoint hex/decimal / single-char lookups.
  const hexMatch = q.match(HEX_RE);
  const decMatch = q.match(DEC_RE);
  const singleChar = [...q].length === 1 ? q.codePointAt(0) : undefined;

  // Donor matches.
  for (const d of index.donors) {
    if (out.length >= limit) break;
    if (d.family.toLowerCase().includes(lower)) {
      out.push({ kind: 'donor', label: d.family, href: `/donors/${d.slug}`, detail: d.vendor });
    }
  }

  // Block matches.
  for (const b of index.blocks) {
    if (out.length >= limit) break;
    if (b.name.toLowerCase().includes(lower)) {
      out.push({
        kind: 'block',
        label: b.name,
        href: `/unicode/block/${b.slug}`,
        detail: `U+${b.start.toString(16).toUpperCase()}–U+${b.end.toString(16).toUpperCase()}`,
      });
    }
  }

  // Char matches by name.
  if (out.length < limit) {
    for (const c of index.chars) {
      if (out.length >= limit) break;
      if (c.name && c.name.toLowerCase().includes(lower)) {
        out.push({
          kind: 'char',
          label: c.name,
          href: `/unicode/char/${c.cp.toString(16).toUpperCase().padStart(4, '0')}`,
          detail: `U+${c.cp.toString(16).toUpperCase()}`,
        });
      }
    }
  }

  // Direct codepoint lookup (hex).
  if (hexMatch && out.length < limit) {
    const cp = parseInt(hexMatch[1], 16);
    out.unshift({
      kind: 'char',
      label: `U+${cp.toString(16).toUpperCase()}`,
      href: `/unicode/char/${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      detail: cp <= 0x10FFFF ? String.fromCodePoint(cp) : undefined,
    });
  }

  // Direct codepoint lookup (decimal).
  if (decMatch && out.length < limit) {
    const cp = parseInt(decMatch[0], 10);
    if (cp <= 0x10FFFF) {
      out.unshift({
        kind: 'char',
        label: `U+${cp.toString(16).toUpperCase()} (${cp})`,
        href: `/unicode/char/${cp.toString(16).toUpperCase().padStart(4, '0')}`,
        detail: String.fromCodePoint(cp),
      });
    }
  }

  // Direct codepoint lookup (single-character literal).
  if (singleChar !== undefined && out.length < limit) {
    out.unshift({
      kind: 'char',
      label: `U+${singleChar.toString(16).toUpperCase()}`,
      href: `/unicode/char/${singleChar.toString(16).toUpperCase().padStart(4, '0')}`,
      detail: String.fromCodePoint(singleChar),
    });
  }

  return out.slice(0, limit);
}

