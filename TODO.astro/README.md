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

### Phase 1 — Scaffold + port static pages (01–22)

| #  | Task                                                   | Status |
|----|--------------------------------------------------------|--------|
| 01 | [Project scaffold](01-project-scaffold.md)             | done |
| 02 | [Port the Unicode data layer](02-port-data-layer.md)   | done |
| 03 | [Migrate global styles + design tokens](03-styles-tokens.md) | done |
| 04 | [Layouts: DefaultLayout + NavFooter](04-layouts.md)    | done |
| 05 | [Page: 404 NotFound](05-page-notfound.md)              | done |
| 06 | [Page: Home](06-page-home.md)                          | done |
| 07 | [Page: Unicode index + Block + Char](07-unicode-pages.md) | done |
| 08 | [Page: Plane + Property](08-plane-and-property.md)     | done |
| 09 | [Page: Donors index + detail](09-donors.md)            | done |
| 10 | [Page: Download + License + Provenance](10-download-license.md) | done |
| 11 | [Page: Changelog (MDX)](11-changelog-mdx.md)           | done |
| 12 | [Page: Search](12-search.md)                           | done (stub — TODO 29 fleshes it out) |
| 13 | [Page: About + Subfonts + Docs index](13-about-subfonts-docs.md) | partial — docs section in TODO 23 |
| 14 | [Composables → Astro utilities](14-composables.md)     | done (data layer); interactive utilities in TODO 26 |
| 15 | [SSG route generation (getStaticPaths)](15-ssg-routes.md) | done |
| 16 | [Dynamic stats from manifest + blocks JSON](16-dynamic-stats.md) | done |
| 17 | [Engineering story page](17-engineering-story.md)      | done |
| 18 | [Build pipeline (gen-unicode stays; SSG via Astro)](18-build-pipeline.md) | partial — TODO 32 wires subset regen |
| 19 | [WOFF2 subsets copy to dist](19-subsets-deploy.md)     | done |
| 20 | [GitHub Pages deploy config](20-deploy-config.md)      | done |
| 21 | [Decommission old Vue site](21-cleanup-vue.md)         | superseded by TODO 33 |
| 22 | [Frontend-design polish](22-frontend-design-polish.md) | done |

### Phase 2 — Full UX/UI reproduction (23–33)

| #  | Task                                                   | Effort | Status |
|----|--------------------------------------------------------|--------|--------|
| 23 | [Docs section (5 pages)](23-docs-section.md)           | M      | pending |
| 24 | [CoverageMap component (Astro island)](24-coverage-map.md) | L  | pending |
| 25 | [TypeTester component (Astro island)](25-type-tester.md) | S    | pending |
| 26 | [Composables → Astro utilities](26-composables-to-utilities.md) | S | pending |
| 27 | [Per-char page interactivity](27-per-char-interactivity.md) | M | pending |
| 28 | [Per-block page interactivity](28-per-block-interactivity.md) | M | pending |
| 29 | [SiteSearch as reusable component](29-site-search-component.md) | M | pending |
| 30 | [Vitest infrastructure + config](30-vitest-infrastructure.md) | S | pending |
| 31 | [Vitest coverage of the browser](31-vitest-coverage-of-browser.md) | L | pending |
| 32 | [Build pipeline integration](32-build-pipeline.md)     | S      | pending |
| 33 | [Decommission the Vue site](33-decommission-vue.md)    | S      | pending |

Effort legend: XS (<1h), S (1–2h), M (half-day), L (full day+).

## Constraints

- **No font binaries in git.** Subsets stay in `public/fonts/`. Download
  URLs point at GitHub Releases.
- **All changes via PR.** Never commit to main, never push tags.
- **Per-block route count is non-negotiable.** ~160k pages must still
  pre-render; verify Astro's SSG handles that scale.
- **SEO continuity.** URL paths stay exactly the same (`/unicode/block/{slug}`,
  `/unicode/char/{hex}`, etc.) so existing inbound links don't break.

## Reference

- Existing Vue site: `src/` (kept until TODO 33)
- Astro site: `src/astro/`
- Data layer (portable): `src/lib/unicode/` → mirrored to `src/astro/lib/unicode/`
- Generated JSON: `public/unicode-blocks.json`, `public/unicode/blocks/*.json`,
  `public/unicode/indexes/*`, `public/planes.json`
