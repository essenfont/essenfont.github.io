# 31 — Vitest coverage of the browser (all interactive features)

## Status
pending

## Why
TODO 30 sets up vitest. This TODO specifies every spec we owe the
"browser" (the interactive Unicode browsing surface) so the migration
to vanilla JS islands doesn't silently drop behavior.

## Specs to write

### `test/lib/clipboard.spec.ts`
- `attachClipboard` calls `navigator.clipboard.writeText` with the
  source getter's return value on button click
- `onCopied` callback fires after success
- Detach function removes the click listener
- Handles writeText rejection gracefully (no uncaught throw)

### `test/lib/glyph-comparison.spec.ts`
- Defaults to `essenfont` mode
- Clicking the toggle button flips the target's class to `systemClass`
- Clicking again flips back
- Detach removes the click listener

### `test/lib/coverage.spec.ts`
- `loadBlockCoverage('cjk-unified-ideographs')` returns a Set of covered cps
- `loadBlockCoverage('nonexistent')` returns null (fetch failure)
- `loadCoverageIndex()` returns the full coverage.json shape

### `test/components/TypeTester.spec.ts`
- Typing into the textarea updates the output's textContent
- Counter shows `[...text].length` (codepoints) and `text.length` (UTF-16)
- Moving the size slider updates `output.style.fontSize`
- Empty input shows placeholder state

### `test/components/SiteSearch.spec.ts`
- Typing "Latin" returns at least the Basic Latin block
- Typing "U+0041" / "0041" / "41" all find U+0041
- ↑/↓ keystrokes move the active option
- Enter navigates to the active option's URL (window.location)
- Esc clears the input and results
- Mouse hover changes the active option
- Mouse click navigates

### `test/components/CoverageMap.spec.ts`
- Renders one cell per block in coverage.json
- Plane filter reduces visible cells to that plane
- Status filter reduces visible cells to that status
- Both filters together intersect correctly
- Mouseenter on a cell shows the tooltip with all 5 data fields
- Mouseleave hides the tooltip
- Click on a cell calls `window.location.assign` with the block URL
- RESERVED blocks (PUA/Surrogates/Specials) get a muted style

### `test/components/CoverageOverlay.spec.ts` (per-block page)
- Toggle button starts in "off" state (no `.uncovered` class)
- Clicking the toggle adds `.uncovered` to cells not in the covered Set
- Clicking again removes the `.uncovered` class
- Summary card shows correct pct

### `test/components/Pagination.spec.ts` (per-block page)
- Page 1 renders the first 1024 codepoints
- Next button advances to page 2
- URL `?page=2` initializes to page 2
- Prev/next arrows on keyboard move pages
- Page indicator text updates ("Page 2 of 21")

## Coverage target
- 90%+ line coverage on `src/astro/lib/*.ts`
- 80%+ line coverage on `src/astro/components/*/script.ts`
- All keyboard interactions tested
- All fetch failure paths tested

## Acceptance criteria
- [ ] All 8 spec files exist and pass
- [ ] `npm run test:coverage` reports ≥ 90% on lib/, ≥ 80% on components/
- [ ] No `console.error` in test output
- [ ] CI runs all specs on every PR

## Effort
L (full day+ — comprehensive coverage of 8 modules)
