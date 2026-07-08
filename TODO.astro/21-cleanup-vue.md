# 21 — Decommission old Vue site

Once the Astro site is live and stable, remove the Vue code.

## Steps

1. Delete `src/App.vue`, `src/main.ts`, `src/router.ts`, `src/pages/`, `src/components/`, `src/composables/`, `src/layouts/`
2. Move `src/astro/*` up to `src/*` (or keep nested — pick one)
3. Delete `vite.config.ts` and `vite-ssg` dependency
4. Update `.github/workflows/*.yml` to remove `build:legacy` references
5. Remove `build:legacy`, `dev:legacy` from `package.json` scripts
6. Remove `@vitejs/plugin-vue`, `vite-ssg`, `vue-router` from dependencies (keep `vue` if any islands remain)
7. Verify: `npm run build` produces a clean Astro-only `dist/`

## Acceptance

- Repo has no Vue-specific config
- Build succeeds with Astro-only deps
- Production site is unchanged to end users (URLs, content, behavior)
