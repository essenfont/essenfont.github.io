# 22 — /frontend-design polish pass

Apply the `/frontend-design` skill to the fully-migrated Astro site. Goal: a distinctive editorial aesthetic that doesn't read as generic AI slop.

## Direction candidates

- **Editorial / magazine**: heavy display type, asymmetric grid, generous whitespace, oversized specimens of "Essenfont" rendered in the actual font
- **Brutalist / type-led**: monospace headlines, sharp 1px borders, no shadows, high contrast
- **Specimen-book / typographic**: serif body, dropcaps, footnotes, formal layout — fits a "font foundry" tone

Pick ONE direction. Commit to it. Don't blend.

## What to design

1. **Home hero**: the word "Essenfont" set huge in the actual font (when installed), with a subhead + 2-3 dynamic stat callouts
2. **Stat callouts**: large numerals (Spectral at 64–96px), tight captions
3. **Block grid**: not a table — a visual mosaic where each cell shows the block's name + a representative glyph at high contrast
4. **Per-char page**: glyph specimen at 200px+, then properties as a tight key-value list
5. **Engineering story**: long-form article styling, dropcap, pull-quotes for the commit SHAs
6. **Motion**: staggered reveals on initial page load (`animation-delay` per element), no micro-interactions for hover spam

## Constraints (from CLAUDE.md)

- Spectral (display), Inter (body), IBM Plex Mono (code) — already chosen
- `--ef-rose: #bf4e6a`, `--spec-paper` / `--spec-ink` light + dark
- Don't converge on Space Grotesk or similar overused AI defaults
- Commit to the chosen aesthetic; don't blend

## Acceptance

- New aesthetic is visibly distinct from the pre-migration site
- All pages render correctly in light + dark
- Lighthouse perf score ≥ 90 on home + a sample char page
- No regressions in route coverage or build time
