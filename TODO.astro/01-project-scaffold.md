# 01 — Project scaffold

Create a new Astro project alongside the existing Vue site so we can migrate page-by-page without breaking production.

## Steps

1. Install Astro + integrations:
   ```sh
   npm install astro @astrojs/sitemap @astrojs/mdx @astrojs/vue
   ```
   - `@astrojs/vue` for incremental component porting
   - `@astrojs/mdx` for changelog + docs
   - `@astrojs/sitemap` (replaces hand-rolled sitemap.xml)

2. Create `astro.config.mjs`:
   ```js
   import { defineConfig } from 'astro/config';
   import sitemap from '@astrojs/sitemap';
   import mdx from '@astrojs/mdx';
   import vue from '@astrojs/vue';

   export default defineConfig({
     site: 'https://essenfont.github.io',
     base: '/',
     output: 'static',
     build: { format: 'directory' }, // /foo → /foo/index.html
     integrations: [sitemap(), mdx(), vue()],
   });
   ```

3. Create `src/` structure for Astro:
   ```
   src/
     astro/
       pages/        # .astro files (routes)
       components/   # .astro components
       layouts/      # BaseLayout.astro
     content/
       changelog/    # MDX posts
       docs/         # MDX docs
     lib/            # ported from existing src/lib/
     styles/
     islands/        # interactive Vue components (search, comparison)
   ```

4. Keep existing Vue site at `src/` (don't move it yet). New Astro pages live under `src/astro/` until cutover.

5. Add `package.json` scripts:
   ```json
   {
     "scripts": {
       "dev:astro": "astro dev",
       "build:astro": "node scripts/gen-ssg-routes.mjs && astro build",
       "preview:astro": "astro preview"
     }
   }
   ```

6. Add to `.gitignore`:
   ```
   .astro/
   dist-astro/
   ```

## Acceptance

- `npm run dev:astro` serves a working Astro dev site at localhost:4321
- Initial `index.astro` renders a hello world with the existing default CSS
- Existing Vue site + `npm run build` still work unchanged
