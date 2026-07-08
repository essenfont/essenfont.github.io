# 10 — Download + License + Provenance

## Sources

- `src/pages/DownloadPage.vue` — `/download`
- `src/pages/LicensePage.vue` — `/license`
- `src/pages/ProvenancePage.vue` — `/provenance`

## Implementation

Static pages. Astro converts each to a single `.astro` file.

- Download page links to GitHub Releases URLs (current pattern preserved).
- License page enumerates the OFL + per-donor licenses from `public/license-pack/` artifacts.
- Provenance page shows `cp_map.json`-derived attribution (or whatever the current page consumes).

## Acceptance

- All three pages render
- Download URLs point at GitHub Releases (not committed font binaries)
