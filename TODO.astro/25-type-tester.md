# 25 — TypeTester component (Astro island)

## Status
pending

## Why
The home page's killer feature: type any text, see it render in Essenfont
at adjustable size, with a live codepoint/char counter. Currently absent
from the Astro site. Was prototyped in PR #24 but that PR wasn't merged.

## Source-of-truth
- PR #24 (closed) `src/astro/pages/index.astro` had a working prototype
- `public/fonts.css` provides per-block `@font-face` declarations with
  `unicode-range` so the browser only fetches subsets the page actually uses

## Design constraints

The tester must:
- Render in Essenfont where the font covers the codepoint
- Fall back to Noto Sans (or system) where it doesn't — no tofu
- Update character + code-unit counts as the user types
- Let the user adjust the rendered font-size via a slider

Vanilla JS — no framework. Bundle stays under 2 KB.

## Deliverables

### Component file
- `src/astro/components/TypeTester.astro` — server-rendered shell
  (`<textarea>`, output `<div>`, size `<input type="range">`, counter
  `<span>`) + `<script>` island that:
  - Reads `#tester-input`, mirrors `.value` into `#tester-output` on `input`
  - Computes `[...text].length` (codepoints) + `text.length` (UTF-16 code
    units) for the counter
  - Updates `#tester-output.style.fontSize` from the range input
  - All wired with `addEventListener` — no Vue, no React

### Home page integration
- `src/astro/pages/index.astro` imports `<TypeTester />` and places it
  in the hero section (or a dedicated "Try it" section)

### Default text
- Show multilingual placeholder: `"The quick brown fox 你好世界 𓂀 𒀭 ∑∫ 🪬"`
- This exercises Latin, CJK, Egyptian, Cuneiform, math, and emoji ranges

### Acceptance criteria
- [ ] Typing updates the output within 1 frame (no debounce needed)
- [ ] Char counter shows `[...text].length`; code-unit counter shows `text.length`
- [ ] Size slider scales the output from 24px to 160px
- [ ] Falls back to system font silently when Essenfont doesn't cover a cp
- [ ] Vitest spec passes (see TODO 31)

## Effort
S (1-2h — the prototype already exists, just needs to land as a component)
