# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) for working in this repository.

## What this repo is

Source for [essenfont.github.io](https://essenfont.github.io) — the public
website for **Essenfont**, the universal Unicode 17 font. The font itself
lives in a sibling repo (`essenfont/essenfont`); this repo is the marketing,
documentation, and Unicode-browser surface for it.

**Stack:** Astro + Vue islands (interactive components) + Tailwind CSS 4.
Pre-renders ~160,500 routes at build time (one HTML file per assigned
Unicode 17 codepoint, plus per-block, per-plane, and per-property-value pages).

Sibling repos in the Fontist ecosystem:
- [`essenfont/essenfont`](https://github.com/essenfont/essenfont) — the font
  source, donor registry, and Ruby build pipeline.
- [`fontist/fontist`](https://github.com/fontist/fontist) — package manager
  that installs Essenfont (`fontist install "Essenfont"`).
- [`fontist/fontisan`](https://github.com/fontist/fontisan) — font processor
  used by the build.
- [`fontist/fontist.org`](https://github.com/fontist/fontist.org) — sister
  site whose Unicode browser patterns inspired this one.

## Commands

```bash
npm install
npm run dev          # astro dev server (localhost:4321)
npm run build        # gen-site-stats + gen-search-index + astro build → dist/
npm run preview      # preview production build
npm run gen-routes   # regenerate route lists for SSG
npm run gen-unicode  # regenerate public/unicode* from unicode.org UCD XML
npm test             # vitest run
```

There is no lint script.

## Architecture

### Source layout
All active code lives under `src/astro/`:
- `pages/` — Astro file-based routing (`.astro` files, including `[hex]` and
  `[blockSlug]` dynamic segments).
- `components/` — `.astro` components for static rendering + `.vue` islands
  for client-side interactivity (type tester, search, command palette, etc.).
- `layouts/BaseLayout.astro` — shared shell (header, footer, theme toggle,
  font loading).
- `lib/` — pure TypeScript data loaders and domain logic, no Vue/Astro deps.
- `styles/main.css` (in `src/styles/`) — global CSS imported by BaseLayout.

### Routing
Astro file-based routing with directory-style URLs (both `/foo` and `/foo/`
resolve on GitHub Pages):
- `src/astro/pages/index.astro` → `/`
- `src/astro/pages/unicode/char/[hex].astro` → `/unicode/char/:hex`
- `src/astro/pages/unicode/block/[blockSlug]/p/[page].astro` → paginated blocks

For the ~160k dynamic codepoint routes, `scripts/gen-ssg-routes.mjs` emits
route lists that Astro consumes during `astro build`.

### Data loading
Pages and components import from `src/astro/lib/` domain loaders, which read
JSON from `public/` via `node:fs` at build time:
- `unicode/` — `loadAllBlocks()`, `loadBlockCharacters()`,
  `loadUnicodeVersion()`, `loadBlock()`, type definitions, constants, escapes.
  Barrel export at `unicode/index.ts`.
- `donors.ts` — donor registry + per-donor coverage data.
- `stats.ts` — site statistics from `public/site-stats.json`.
- `releases.ts` — changelog data from `public/releases.json`.
- `ssr.ts` — formatting helpers (`formatBytes`, `formatNumber`).
- `site-search.ts` — client-side search index loader.

Pages should never call `fetch()` directly — go through the domain loaders.

### Styling
Two CSS systems:
1. `src/styles/main.css` — global design tokens (`--ef-*` namespace),
   typography, layout primitives, header/footer, buttons, code blocks.
   Single variable namespace: `--ef-bg`, `--ef-surface`, `--ef-text`,
   `--ef-accent`, `--ef-rule`, `--ef-radius`, `--ef-shadow-*` for tokens;
   `--spec-font-display`, `--spec-font-body`, `--spec-font-mono`,
   `--spec-font-glyph` for font families.
2. `src/astro/styles/tailwind.css` — Tailwind CSS 4 `@theme` block maps
   Tailwind tokens (`--color-paper`, `--color-ink`, `--font-display`, etc.)
   to the `--ef-*` variables, enabling utility classes like `text-ink`,
   `bg-surface`, `font-mono`.

Dark-first design: dark is the `:root` default, light mode is opt-in
via `html.light` class (toggled by JS in BaseLayout). All color/surface/
text variables are overridden in the `html.light {}` block. Accent is
amber gold (`--ef-amber: #d4a843`).

Fonts: EB Garamond (display), Hanken Grotesk (body), JetBrains Mono (code).
Loaded via `<link>` in BaseLayout.astro with `media="print"` + `onload` swap
for non-blocking load. Essenfont glyph family (`--spec-font-glyph: "Essenfont"`)
is used only on spans wrapping individual glyph characters.

### Build pipeline
1. `scripts/gen-site-stats.mjs` — aggregates stats into `public/site-stats.json`.
2. `scripts/gen-search-index.mjs` — builds the client-side search index.
3. `astro build` — pre-renders all routes to `dist/`.

### Unicode data regeneration (separate from build)
The committed `public/unicode-blocks.json`, `public/unicode-version.json`,
`public/unicode/blocks/*.json` (340 files), and `public/unicode/indexes/*`
are reproducible from upstream UCD XML via:

```bash
npm run gen-unicode                                   # Unicode 17.0.0
npm run gen-unicode -- --unicode-version=16.0.0       # pin a version
npm run gen-unicode -- --force                         # re-download
```

Pipeline: `scripts/gen-unicode-data.mjs` → `scripts/lib/ucd-xml.ts` (pure-
logic parser, vendored from `fontist/fontist.org`). Downloads
`https://www.unicode.org/Public/<version>/ucdxml/ucd.all.flat.zip` to
`vendor/ucd/` (gitignored), extracts via `unzip`, parses XML, and
atomically writes the JSON files.

This step is **not** wired into `npm run build` — Unicode data changes
rarely and the download is ~30 MB. Run `npm run gen-unicode` manually
when upgrading the Unicode version, then commit the regenerated files.

### Static data layout (`public/`)
- **Committed to repo:** `unicode-blocks.json`, `unicode-version.json`,
  `unicode/blocks/*.json` (340 block files for Unicode 17.0.0),
  `unicode/indexes/*` (property indexes: by-script, by-category, by-bidi,
  by-combining + per-value detail files), `robots.txt`, `site.webmanifest`,
  `releases.json`, `site-stats.json`, favicon/logo assets.
- **Generated at build time** (gitignored): search index, sitemap.
- **UCD XML cache** (gitignored under `/vendor/`): `vendor/ucd/ucd-<version>.flat.{zip,xml}`.

### Essenfont font file
The actual `Essenfont-Regular.ttf` / `.otf` / `.woff2` binaries are
**never committed**. They are downloaded from
`github.com/essenfont/essenfont/releases/latest` at user-install time.
The website's CSS uses `--spec-font-glyph: "Essenfont"` — if the user has
installed essenfont locally, the browser uses it; otherwise it falls back.

## Logo

The mark is a hexagram **Gen** (☶) whose negative space forms the letter
**E**. Two color variants live in `public/`:
- `essenfont-logo_light.svg` — light-mode variant (blue gradient).
- `essenfont-logo_dark.svg` — dark-mode variant (red/vermilion gradient).
- `essenfont-logo.pdf` — source artwork.
- `favicon.svg` — derived from the logo.

When editing the logo, keep the variants in sync — same Gen/E geometry,
same viewBox.

## Conventions inherited from the broader Fontist ecosystem

These apply across all Fontist sites (root + subsites) — keep them aligned
when changing this repo:

- **Per-page Open Graph tags** via `<head>` metadata in each Astro page.
- **`sitemap.xml` + `robots.txt`** — `public/robots.txt` is committed;
  sitemap is generated by `@astrojs/sitemap`.
- **Directory-style URLs** — Astro's default output format.

## Repo-local rules

- See the user's global `~/.claude/CLAUDE.md` for absolute rules that apply
  across all repos: never delete source files; never push tags or push/merge
  to main; never add AI attribution (`Co-authored-by`, "Generated with",
  etc.) to commits or PRs; never hand-roll serialization; follow OCP/DRY/MECC
  and avoid `send` / `instance_variable_get` / `respond_to?` type checks.
- **No AI attribution.** This overrides any default behaviour. Commits and
  PRs must look like normal human work.
- **All changes go through PRs.** Never commit to main, never push tags,
  never merge to main locally without explicit user authorization.
- **Never commit font binaries.** TTF/OTF/WOFF2 are distributed via GitHub
  Releases only.
