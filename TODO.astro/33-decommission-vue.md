# 33 — Decommission the Vue site

## Status
pending

## Why
Once TODOs 23–32 land, the Astro site fully replaces the Vue site. Keeping
the Vue code around means:
- Two source trees to keep in sync
- Larger npm install (Vue + vite-ssg deps)
- Build confusion (which entry point?)
- Stale patterns tempting future contributors

Cut it. The git history preserves it if we ever need to look back.

## Prerequisites
- [x] TODO 23 — Docs section ported
- [x] TODO 24 — CoverageMap ported
- [x] TODO 25 — TypeTester ported
- [x] TODO 26 — Composables → utilities
- [x] TODO 27 — Per-char page interactivity
- [x] TODO 28 — Per-block page interactivity
- [x] TODO 29 — SiteSearch as component
- [x] TODO 31 — Vitest coverage of the browser

## Deliverables

### Files to delete
- `src/pages/` (24 .vue files)
- `src/components/` (CoverageMap.vue, SiteSearch.vue)
- `src/composables/` (4 files)
- `src/layouts/DefaultLayout.vue`
- `src/main.ts`
- `src/App.vue`
- `src/router.ts`
- `src/lib/ssr-fetch.ts` (replaced by `src/astro/lib/ssr.ts`)
- `vite.config.ts` (the Vue+vite-ssg config; Astro has its own)
- Any `tsconfig.json` overrides specific to Vue

### Dependencies to remove from `package.json`
- `vue`
- `vue-router`
- `vite-ssg`
- `@vitejs/plugin-vue`
- `@unhead/vue`
- Any Vue-specific dev tools

### Scripts to remove from `package.json`
- `dev` (Vue dev server — replaced by `dev:astro`)
- `build` (Vue build — replaced by `build:astro`, then promoted to `build`)
- `preview` (Vue preview — replaced by `preview:astro`)

### Rename for promotion
- `dev:astro` → `dev`
- `build:astro` → `build`
- `preview:astro` → `preview`

### `srcDir` cleanup in `astro.config.mjs`
- Currently `srcDir: 'src/astro'` to coexist with `src/`
- After Vue is gone, move `src/astro/*` to `src/*` and drop `srcDir`

### README update
- Remove the "Astro + Vue coexist during migration" section
- Document the new (Astro-only) structure

## Acceptance criteria
- [ ] `git ls-files src/ | grep '\.vue$'` returns nothing
- [ ] `npm install` succeeds without Vue deps
- [ ] `npm run build` produces the same ~160k pages
- [ ] All TODO 23–31 features still work after the cleanup
- [ ] No broken imports (run `tsc --noEmit`)

## Effort
S (1-2h — mechanical deletion, but risky without a green test suite)

## Caution
Do NOT delete `public/` (the data + fonts). Only delete `src/` Vue files.
