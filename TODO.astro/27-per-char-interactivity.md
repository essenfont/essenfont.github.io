# 27 — Per-char page interactivity

## Status
pending

## Why
`UnicodeCharPage.vue` (584 lines) has 3 interactive features the Astro
equivalent lacks:
1. **Glyph comparison toggle** — switch the rendered glyph between
   "Essenfont" and "system font" rendering, so users see what the font
   actually contributes
2. **Copy-to-clipboard** — copy the codepoint (`U+0041`), UTF-8 bytes
   (`\x41`), HTML entity (`&#x41;`), and the literal character (`A`)
3. **Adjacent-char navigation** — prev/next links to walk the block's
   codepoint range

Without these, the per-char page is a static reference card; the Vue
version is a useful tool.

## Source-of-truth
- `src/pages/UnicodeCharPage.vue` — full implementation
- Uses `useClipboard` + `useGlyphComparison` composables

## Deliverables

### Updated `src/astro/pages/unicode/char/[hex].astro`

#### Glyph comparison toggle
- Renders the glyph in a `<span class="glyph">` initially with
  `font-family: var(--font-glyph)` (Essenfont + fallback)
- Button "Compare with system" toggles to `font-family: var(--font-body)`
- Uses `attachGlyphComparison` from `src/astro/lib/glyph-comparison.ts`

#### Copy-to-clipboard row
4 buttons, each with a label + value:
- `U+0041` → copies `U+0041`
- `UTF-8` → copies the UTF-8 byte sequence as `\x41` (or multi-byte for non-BMP)
- `HTML` → copies `&#x41;` (decimal entity)
- `Char` → copies the literal character
Uses `attachClipboard` from `src/astro/lib/clipboard.ts`.

#### Prev/next navigation
- Compute prev/next codepoint within the same block (skip if at edge)
- Links to `/unicode/char/{hex}` for each
- Render as footer-of-page chevrons: `← U+0040  |  U+0042 →`

### Edge cases
- First codepoint in block: no prev link
- Last codepoint in block: no next link
- Codepoint that's reserved/unassigned: still navigable (display, but no glyph)

## Acceptance criteria
- [ ] Toggle button switches font-family on click
- [ ] All 4 copy buttons copy the correct value (verified via clipboard)
- [ ] Prev/next links go to the right codepoint
- [ ] Edge-of-block codepoints show only one direction
- [ ] Vitest spec covers all 3 features (see TODO 31)

## Effort
M (half-day — 3 small features but each needs careful DOM wiring)
