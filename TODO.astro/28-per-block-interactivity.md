# 28 — Per-block page interactivity

## Status
pending

## Why
`UnicodeBlockPage.vue` (431 lines) has 2 interactive features the Astro
equivalent lacks:
1. **Coverage overlay** — highlight uncovered codepoints as tofu (□)
   when the user enables the "show missing" toggle. Without this, the
   block grid looks like every codepoint is covered even when it isn't.
2. **Pagination** — large blocks (CJK Unified Ideographs = 20,992 cp,
   Hangul Syllables = 11,184 cp) need pagination, not a single huge grid.

## Source-of-truth
- `src/pages/UnicodeBlockPage.vue`
- Uses `useFontCoverage` composable

## Deliverables

### Updated `src/astro/pages/unicode/block/[blockSlug].astro`

#### Coverage overlay
- Loads `public/coverage/{slug}.json` via `loadBlockCoverage` (see TODO 26)
- Each grid cell is a `<a class="char-cell">` with `data-cp` attribute
- Toggle button "Highlight missing" adds `.uncovered` class to cells
  whose `data-cp` is not in the covered Set
- `.uncovered` cells render as `□` (tofu) with a muted color
- Coverage summary card shows: covered / assigned / pct / status

#### Pagination
- For blocks with > 1024 codepoints, paginate at 1024 per page
- Page 1 starts at the block's first codepoint
- URL param: `?page=2` (client-side; SSG renders page 1, JS swaps content)
- Prev/next buttons + page indicator (`Page 2 of 21`)
- Keyboard: `←` / `→` to navigate pages when the grid is focused

#### Donor attribution row
- Below the grid, show "Glyphs drawn by: {donor name}" with a link to
  `/donors/{slug}` (data already in `public/donors.json`)

### Edge cases
- Block with 0 codepoints: don't render the grid
- Block fully covered: toggle still works but visually inert
- Block with no donor attribution: skip the row

## Acceptance criteria
- [ ] "Highlight missing" toggle visually distinguishes covered vs uncovered
- [ ] Large blocks paginate without jank
- [ ] URL `?page=N` restores the right view on page reload
- [ ] Donor row appears for blocks with attribution
- [ ] Vitest spec covers toggle + pagination logic (see TODO 31)

## Effort
M (half-day — pagination needs careful state management in vanilla JS)
