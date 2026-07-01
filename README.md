# Essenfont website

Public website for [Essenfont](https://github.com/essenfont/essenfont) —
the universal Unicode 17 font. One font, every assigned codepoint.

Live site: <https://essenfont.github.io>

## What's here

- **Home, Download, About** — marketing + docs.
- **Unicode browser** — every Unicode 17 plane, block, and assigned
  codepoint as a pre-rendered HTML page. Each character renders using
  the Essenfont (if installed locally) or the browser's fallback.
- **Per-property indexes** — browse by script, category, bidi class,
  combining class.

## Stack

Vite + vite-ssg + Vue Router. Pre-renders ~160,500 routes at build time
into static HTML, deployed via GitHub Pages.

## Build

```bash
npm install
npm run build       # → dist/
npm run preview     # serve dist/ locally
```

The build pipeline:

1. `scripts/gen-ssg-routes.mjs` walks the committed Unicode data files
   and emits `public/ssg-routes.json` (one entry per route) plus
   `public/sitemap.xml`.
2. `vite-ssg build` renders every route in `ssg-routes.json` to a static
   HTML file under `dist/`.

The build takes ~10 minutes due to the route count (160k+ pages).

## Unicode data

The committed data under `public/unicode*` is reproducible from upstream
UCD XML. To regenerate (e.g. when Unicode 18 ships):

```bash
npm run gen-unicode                                   # Unicode 17.0.0
npm run gen-unicode -- --unicode-version=18.0.0       # pin a version
```

Pipeline: `scripts/gen-unicode-data.mjs` → `scripts/lib/ucd-xml.ts`
(vendored from `fontist/fontist.org`). Downloads ~30 MB of UCD XML to
`vendor/ucd/` (gitignored).

## Essenfont binaries

The actual `Essenfont-Regular.ttf` / `.otf` / `.woff2` files are
distributed via GitHub Releases at
<https://github.com/essenfont/essenfont/releases>. They are never
committed to this repo. The website links to the release URLs.

## License

Site code: MIT-style — see contributors.

Essenfont font: SIL OFL 1.1 (see the
[font repo](https://github.com/essenfont/essenfont)).

## Related

- [`essenfont/essenfont`](https://github.com/essenfont/essenfont) — the font.
- [`fontist/fontist`](https://github.com/fontist/fontist) — package manager.
- [`fontist/fontist.org`](https://github.com/fontist/fontist.org) — sister
  site whose Unicode browser inspired this one.