# 30 — Vitest infrastructure + config

## Status
pending

## Why
The Astro project has zero tests. Every interactive feature we port
(TypeTester, SiteSearch, CoverageMap, clipboard, glyph comparison,
coverage overlay) needs automated coverage so refactors don't silently
regress behavior. The user explicitly asked for "full vitest coverage
of our browser".

## Deliverables

### Dependencies
```
npm install -D vitest @vitest/coverage-v8 happy-dom @testing-library/dom
```

### Config — `vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/astro/lib/**/*.ts', 'src/astro/components/**/*/script.ts'],
    },
  },
})
```

### `test/setup.ts`
- Polyfills `navigator.clipboard` (jsdom stub)
- Polyfills `fetch` (uses local `public/` files via fs)
- Resets DOM between tests

### `package.json` scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Conventions
- Test files live in `test/{lib,components}/*.spec.ts`
- Each spec covers ONE module/component
- Use `happy-dom`'s `window` for DOM APIs
- Mock `fetch` with a fixture loader that reads from `public/`
- Snapshot tests for rendered HTML (per component)

### CI integration
- `.github/workflows/ci.yml` adds a `test` job that runs `npm ci && npm test`
- Test job runs in parallel with the build job
- Test failures block merge

## Acceptance criteria
- [ ] `npm install` succeeds with new dev deps
- [ ] `npm test` runs (even with 0 specs, exits 0)
- [ ] `npm run test:coverage` reports V8 coverage
- [ ] CI runs tests on every PR
- [ ] A trivial "smoke" spec (`test/smoke.spec.ts`) passes — sanity check

## Effort
S (1-2h — config + smoke test; the actual specs come from TODO 31)
