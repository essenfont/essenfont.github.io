# 17 — Engineering story page

A dedicated `/engineering` page narrating how we made Chrome's OTS accept the website's WOFF2 subsets and how we built the canonical OTC. Marketing-y, but anchored in real commits.

## Outline

1. **The problem** — 199 of 211 WOFF2 subsets were rejected by Chrome's OTS as "network error". Tofu everywhere.
2. **The fixes** — a series of small, named patches across three repos:
   - `head.modified` set to actual current time (not `created + 1 second`) — Chrome's OTS rejects sub-hour deltas.
   - WOFF2 file padded to 4-byte boundary — Chrome rejects odd-length files.
   - 255UInt16 encoding single source of truth — three copies had inverted code-byte mappings.
   - Brotli `mode: :font` actually plumbed through — was silently defaulting to generic.
   - Glyph padding aligned to 4-byte boundary per glyph — matching fontTools' `_normaliseGlyfAndLoca(padding=4)`.
   - CFF2 IndexBuilder 3-byte offset pack — `pack("C3")` on a single Integer raised ArgumentError.
   - Stitcher outline-first — empty CBDT placeholders were winning the cmap slot via first-wins.
   - CpMap excludes CBDT-only donors — their cmap was polluting every face's outline slots.
   - UFO compiler enforces `.notdef` at GID 0 — OpenType requirement; was silently dropping the alphabetically-first glyph.
3. **The result** — 209/209 (or N/M with current numbers) subsets now load in Chrome. The canonical OTC carries every Unicode 17 codepoint in CFF2 outlines with CBDT color emoji baked in.
4. **The numbers** — call `loadStats()` and surface the same dynamic stats as the home page.

## Implementation

Single `.astro` file. Inline the commit SHAs as a `<ul>` of links to fontist/fontisan and essenfont/essenfont PRs.

## Acceptance

- `/engineering` renders with the story above
- Links to GitHub PRs/commits work
- Stats panel uses the same `loadStats()` as home page
