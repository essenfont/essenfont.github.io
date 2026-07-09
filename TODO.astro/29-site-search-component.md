# 29 — SiteSearch as reusable component

## Status
pending

## Why
`SiteSearch.vue` (262 lines) is a search widget: type-ahead over
blocks, characters, and donors, with keyboard navigation (up/down/enter).
Currently the Astro `/search` page has inline JS that implements only the
basics — no keyboard nav, no donor results, not reusable.

Make it a proper component so it can also be embedded in the nav as a
"⌘K" command palette.

## Source-of-truth
- `src/components/SiteSearch.vue` — full implementation
- `public/search-index.json` — pre-built search index (already exists)

## Deliverables

### `src/astro/components/SiteSearch.astro`
Props:
- `embed?: 'page' | 'overlay'` — default `'page'` (renders inline)
- `placeholder?: string` — default `'Block name, hex codepoint, or character name...'`

Markup:
- `<input>` with `aria-label`, `autocomplete="off"`, `spellcheck="false"`
- `<ul role="listbox">` of results, each `<li role="option">`
- Result types: `block`, `char`, `donor` — each with its own icon/color

Script island:
- Debounced input handler (150 ms)
- Loads `/search-index.json` lazily (first keystroke)
- Matches on: block name, codepoint hex (`U+0041` or `0041` or `41`),
  codepoint decimal, character literal (single-char input), donor family name
- Keyboard: `↑`/`↓` to move active option, `Enter` to navigate, `Esc` to clear
- Mouse: hover sets active option, click navigates
- `aria-activedescendant` on input + `id` on each option for screen readers

### Page integration
- `src/astro/pages/search.astro` — replace inline JS with `<SiteSearch embed="page" />`
- Optional: add a "Search" button to the masthead that opens `<SiteSearch embed="overlay" />`
  via ⌘K / Ctrl+K (deferred — not blocking)

### Search index
- `public/search-index.json` already exists; if it's stale, regenerate via
  `node scripts/gen-search-index.mjs` (create this script if missing)

## Acceptance criteria
- [ ] Typing "Latin" shows the Latin blocks at the top
- [ ] Typing "U+0041" or "0041" or "41" finds the Latin A codepoint
- [ ] Typing "Noto" finds the Noto donor families
- [ ] ↑/↓ moves the highlighted option; Enter navigates
- [ ] Esc clears the input
- [ ] Screen reader announces the active option
- [ ] Vitest spec covers search + keyboard nav (see TODO 31)

## Effort
M (half-day — keyboard nav + ARIA is fiddly)
