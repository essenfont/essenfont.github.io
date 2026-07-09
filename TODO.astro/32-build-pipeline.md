# 32 — Build pipeline integration

## Status
pending

## Why
The current Astro build pipeline runs `gen-site-stats.mjs` then `astro build`.
It does NOT regenerate the WOFF2 subsets when the source TTC changes, nor
run vitest. Production deploys can ship with stale fonts or untested code.

## Deliverables

### `package.json` script wiring
- `build` = `run-s build:subsets build:astro test`
  - `build:subsets` runs `scripts/subset-fonts.rb --all` only when
    `Essenfont-Regular.ttc` is newer than `public/fonts/*.woff2`
    (use a Makefile-style timestamp check or always run if env
    `FORCE_SUBSET=1`)
  - `build:astro` runs `node scripts/gen-site-stats.mjs && astro build`
  - `test` runs `vitest run`

### Subset regeneration guard
- New `scripts/ensure-subsets.sh` checks if any subset is older than
  the TTC; if so, runs the Ruby subsetter
- Otherwise skips (subsets are expensive — 5+ minutes)

### CI pipeline updates (`.github/workflows/ci.yml`)
- Job `test`: `npm ci && npm test` — fast, runs in parallel
- Job `build`: `npm ci && npm run build` — produces `dist/` artifact
- Job `lint`: optional, runs rubocop on Ruby scripts + eslint on TS
- All three jobs must pass for PR merge

### Release pipeline updates (`.github/workflows/release.yml`)
- On tag push: runs full build (with subset regeneration)
- Uploads `Essenfont-Regular.ttc` as a release asset
- Deploys `dist/` to GitHub Pages

## Acceptance criteria
- [ ] `npm run build` produces fresh stats + pages + subsets
- [ ] CI runs vitest + build on every PR
- [ ] Subset regeneration is idempotent (no-op if up-to-date)
- [ ] Release workflow produces a complete artifact set

## Effort
S (1-2h — wiring existing scripts)
