# Astro Migration Plan — essenfont.github.io

Track at https://github.com/essenfont/essenfont.github.io

The current site is Vite + vite-ssg + Vue Router. It pre-renders ~160,500
routes (one per assigned Unicode 17 codepoint, plus per-block, per-plane,
and per-property-value pages) and ships ~210 WOFF2/WOFF subsets.

Astro gives us faster builds (incremental SSG + content collections),
first-class MDX for changelog/docs, native Islands for the few
interactive widgets (search, glyph comparison), and a smaller JS
footprint. The data layer (`src/lib/unicode/`) is already pure
TypeScript — it ports to Astro with minimal changes.

## Migration sequence

| #  | Task                                                   | Effort | Status |
|----|--------------------------------------------------------|--------|--------|
| 01 | [Project scaffold](01-project-scaffold.md)             | S      | pending |
| 02 | [Port the Unicode data layer](02-port-data-layer.md)   | S      | pending |
| 03 | [Migrate global styles + design tokens](03-styles-tokens.md) | S | pending |
| 04 | [Layouts: DefaultLayout + NavFooter](04-layouts.md)    | S      | pending |
| 05 | [Page: 404 NotFound](05-page-notfound.md)              | XS     | pending |
| 06 | [Page: Home](06-page-home.md)                          | S      | pending |
| 07 | [Page: Unicode index + Block + Char](07-unicode-pages.md) | L  | pending |
| 08 | [Page: Plane + Property](08-plane-and-property.md)     | M      | pending |
| 09 | [Page: Donors index + detail](09-donors.md)            | M      | pending |
| 10 | [Page: Download + License + Provenance](10-download-license.md) | S | pending |
| 11 | [Page: Changelog (MDX)](11-changelog-mdx.md)           | M      | pending |
| 12 | [Page: Search](12-search.md)                           | M      | pending |
| 13 | [Page: About + Subfonts + Docs index](13-about-subfonts-docs.md) | S | pending |
| 14 | [Composables → Astro utilities](14-composables.md)     | S      | pending |
| 15 | [SSG route generation (getStaticPaths)](15-ssg-routes.md) | M    | pending |
| 16 | [Dynamic stats from manifest + blocks JSON](16-dynamic-stats.md) | M | pending |
| 17 | [Engineering story page](17-engineering-story.md)      | S      | pending |
| 18 | [Build pipeline (gen-unicode stays; SSG via Astro)](18-build-pipeline.md) | M | pending |
| 19 | [WOFF2 subsets copy to dist](19-subsets-deploy.md)     | S      | pending |
| 20 | [GitHub Pages deploy config](20-deploy-config.md)      | S      | pending |
| 21 | [Decommission old Vue site](21-cleanup-vue.md)         | S      | pending |

Effort legend: XS (<1h), S (1–2h), M (half-day), L (full day+).

## Constraints

- **No font binaries in git.** Subsets stay in `public/fonts/`. Download
  URLs point at GitHub Releases.
- **All changes via PR.** Never commit to main, never push tags.
- **Per-block route count is non-negotiable.** ~160k pages must still
  pre-render; verify Astro's SSG handles that scale.
- **SEO continuity.** URL paths stay exactly the same (`/unicode/block/{slug}`,
  `/unicode/char/{hex}`, etc.) so existing inbound links don't break.
- **Memory file rules.** Update [[memory_browser_visitors_no_install]] and
  [[memory_verify_char_renders_before_featuring]] if the patterns shift.

## Reference

- Existing Vue site: `src/` (kept until step 21)
- Data layer (portable): `src/lib/unicode/`
- Generated JSON: `public/unicode-blocks.json`, `public/unicode/blocks/*.json`,
  `public/unicode/indexes/*`, `public/planes.json`
- WOFF2/WOFF subsets: `public/fonts/` (~210 files)
