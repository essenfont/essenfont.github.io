# 24 — CoverageMap component (Astro island)

## Status
pending

## Why
`CoverageMap.vue` (825 lines) is the site's signature visualization: every
Unicode 17 block drawn as a rectangle sized by codepoint range, color-coded
by coverage %, with plane/status filters and a cursor-following tooltip.
Currently the Astro home page has no equivalent — visitors lose the most
memorable piece of UX.

## Source-of-truth
- `src/components/CoverageMap.vue` — the full implementation
- `public/coverage.json` — the data (regenerated in PR #25)

## Design constraints

Astro islands should be **vanilla JS** (no Preact/React) to keep the
bundle minimal. The component is stateful (filters + hover) but the
state graph is small enough for plain DOM.

## Deliverables

### Component file
- `src/astro/components/CoverageMap.astro` — server-rendered shell
  + `<script>` island that:
  - Loads `/coverage.json` at runtime (or inlines it at build time)
  - Renders one `<a class="block-cell">` per block, sized via CSS
    `grid-template-columns` / `flex-basis` proportional to the block's
    codepoint range
  - Applies a 5-stop color scale: EMPTY → PARTIAL → MOSTLY → FULL → COMPLETE
  - Marks PUA/Surrogates/Specials as RESERVED (separate visual, excluded
    from totals)
  - Maintains `planeFilter` and `statusFilter` state, re-renders on change
  - Cursor-following tooltip via `position: fixed` + viewport-edge collision

### Behavior parity (from Vue version)
- Hover a block → tooltip shows: block name, U+range, covered/total, pct, status
- Click a block → navigate to `/unicode/block/{slug}`
- Plane filter → show only blocks in the selected plane (BMP/SMP/SIP/TIP/SSP/SPUA-A/SPUA-B)
- Status filter → show only blocks with matching status
- Click "Reset filters" → clear both filters
- Reserved blocks: visible but visually muted, never counted in headline %

### Tests (see TODO 31)
- Renders N blocks (where N = total in coverage.json)
- Plane filter reduces visible blocks to that plane's count
- Status filter reduces visible blocks to that status's count
- Tooltip appears on mouseenter, disappears on mouseleave
- Click navigates to the right URL

## Acceptance criteria
- [ ] Component renders 346 blocks from `public/coverage.json`
- [ ] Plane + status filters work identically to Vue
- [ ] Hover tooltip shows all 5 data fields
- [ ] Click takes user to the correct `/unicode/block/{slug}` URL
- [ ] Visual regression: side-by-side screenshot matches Vue within 5%
- [ ] Vitest spec passes (see TODO 31)

## Effort
L (full day+ — porting 825 lines of Vue reactivity to vanilla DOM)
