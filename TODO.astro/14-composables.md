# 14 — Composables → Astro utilities

Vue composables → plain TypeScript modules. Astro doesn't have a reactivity system by default; composables that returned reactive refs get rewritten as:

- **Pure functions** if the composable just computed a value
- **Client-side event handlers** if it managed UI state (clipboard, comparison)
- **Vue islands** if it needs reactive UI (mount a small Vue component via `client:load`)

## Sources

- `src/composables/useBuildJson.ts` → pure function `loadBuildJson()` (build-time)
- `src/composables/useClipboard.ts` → client-side `copyToClipboard(text)` util + event listener
- `src/composables/useFontCoverage.ts` → pure function `computeCoverage(blocks, donor)` (build-time)
- `src/composables/useGlyphComparison.ts` → Vue island (interactive compare UI)

## Acceptance

- Build-time utilities callable from `.astro` frontmatter
- Client utilities callable from `<script>` tags
- Vue islands mount only where interactivity is genuinely needed
