# REQ: Plane partition — OTC subfont strategy

## Problem

TrueType's `maxp.num_glyphs` is a uint16 — cap 65,535 per font.
Essenfont has ~154,000 assigned codepoints (~160,000 with .notdef
and control glyphs). A single TTF cannot hold them all.

## Solution: partition by Unicode plane

Every assigned codepoint lives in exactly one Unicode plane. We
partition the font across the 5 planes that carry assigned characters:

| Plane | Key   | Range              | Subfont face    |
|-------|-------|--------------------|-----------------|
| BMP   | `bmp` | U+0000–U+FFFF      | `Essenfont-BMP` |
| SMP   | `smp` | U+10000–U+1FFFF    | `Essenfont-SMP` |
| SIP   | `sip` | U+20000–U+2FFFF    | `Essenfont-SIP` |
| TIP   | `tip` | U+30000–U+3FFFF    | `Essenfont-TIP` |
| SSP   | `ssp` | U+E0000–U+EFFFF    | `Essenfont-SSP` |

PUA-A (plane 15) and PUA-B (plane 16) are reserved — no subfonts.

The 5 faces are packaged as a single OpenType Collection (OTC).

## Why planes (not blocks, not scripts)?

1. **MECE** — planes tile the codepoint space without overlap or gaps.
2. **Stable** — a codepoint's plane is invariant across Unicode versions.
3. **O(1) lookup** — `cp >> 16` gives the plane number. No codebook.
4. **Semantically meaningful** — BMP = world scripts, SIP/TIP = CJK.
5. **Capacity** — each plane has ≤65,535 assigned codepoints today
   (BMP is the heaviest at ~56k). The 65,535 glyph cap leaves
   headroom for future Unicode versions.

## Overflow safety net

If a future Unicode version balloons a single plane past 65,484 glyphs
(cap minus .notdef minus 50-glyph safety margin), the partitioner
sub-splits by Unicode block. Each sub-partition gets a stable suffix:
`plane_0_a`, `plane_0_b`, etc. No block is ever split across two
subfonts.

Today, all 5 planes fit with at least 3,000 glyphs of headroom.

## Single source of truth

Plane metadata lives in `src/lib/unicode/constants.ts` (the `PLANES`
array) and is propagated to `public/planes.json` by
`scripts/gen-planes-data.mjs`. Pages consume the `PlaneInfo` type
from `src/lib/unicode/types.ts`. No page may define its own plane
metadata.

## Affected files

- `src/lib/unicode/constants.ts` — `PLANES` constant (static metadata)
- `src/lib/unicode/types.ts` — `PlaneInfo` interface
- `scripts/gen-planes-data.mjs` — generates `public/planes.json`
- `src/lib/unicode/data/loader.ts` — `loadPlanes()`
- `src/pages/SubfontsPage.vue` — plane atlas
- `src/pages/DownloadPage.vue` — per-plane download cards
- `src/components/CoverageMap.vue` — "color by subfont" mode