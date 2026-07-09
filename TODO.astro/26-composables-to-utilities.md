# 26 — Composables → Astro utilities (4 helpers)

## Status
pending

## Why
The Vue site has 4 composables that encapsulate reusable client-side
behavior. The Astro site has none of them — features like glyph
comparison toggle and copy-to-clipboard need to be reinvented per-page
(or, worse, copy-pasted).

Centralizing them as plain TS modules keeps the rule in one place and
lets every Astro island import the same logic.

## Source-of-truth
- `src/composables/useBuildJson.ts` → already replaced by `src/astro/lib/ssr.ts` `fetchJson<T>`
- `src/composables/useClipboard.ts`
- `src/composables/useFontCoverage.ts`
- `src/composables/useGlyphComparison.ts`

## Deliverables

### `src/astro/lib/clipboard.ts`
Plain TS port of `useClipboard`. Exports a single function:
```ts
export function attachClipboard(
  button: HTMLButtonElement,
  getSourceText: () => string,
  onCopied?: () => void,
  timeout = 1200,
): () => void  // returns detach fn
```
- Uses `navigator.clipboard.writeText`
- Calls `onCopied` after success (caller manages visual feedback)
- Returns a cleanup function that removes the listener

### `src/astro/lib/glyph-comparison.ts`
Toggle between "essenfont" and "system" rendering on a target element.
```ts
export function attachGlyphComparison(
  toggleButton: HTMLButtonElement,
  target: HTMLElement,
  essenfontClass: string,
  systemClass: string,
): { mode: () => 'essenfont' | 'system'; detach: () => void }
```
- Clicking the button toggles the target's class
- Defaults to `essenfont` mode on init
- Returns current mode + cleanup

### `src/astro/lib/coverage.ts`
Loader for per-block coverage data (used by UnicodeBlockPage).
```ts
export interface BlockCoverageSummary {
  covered_count: number
  assigned_count: number
  uncovered_count: number
  unassigned_count: number
  total_range: number
  pct: number
  status: string
}

export async function loadBlockCoverage(slug: string): Promise<{
  covered: Set<number>
  summary: BlockCoverageSummary
} | null>
```
- Fetches `/coverage/{slug}.json` at runtime
- Returns null on fetch failure (caller shows fallback)
- Caller decides the rendering (tofu highlight, summary card, etc.)

### `src/astro/lib/coverage.ts` — global coverage
Also export a loader for `public/coverage.json` (the global block-by-block
report used by CoverageMap):
```ts
export async function loadCoverageIndex(): Promise<CoverageIndex | null>
```

### Composable docs
Each module gets a top-of-file docstring with usage example. No `ref()` /
`reactive()` — just plain functions that close over DOM elements.

## Acceptance criteria
- [ ] All 4 modules exist and export the documented API
- [ ] Each module has a vitest spec (see TODO 31)
- [ ] The old `src/composables/*.ts` files are untouched (decommissioned in TODO 33)

## Effort
S (1-2h — straightforward ports, no state management)
