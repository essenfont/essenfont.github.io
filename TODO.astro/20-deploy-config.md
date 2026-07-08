# 20 — GitHub Pages deploy config

The site is published to `www.essenfont.org` via GitHub Pages. The workflow needs to build with Astro.

## Update `.github/workflows/*.yml`

Change the build step from `npm run build` (which after step 18 will be Astro) — but verify the workflow still installs the right deps.

```yaml
- name: Build site
  run: |
    npm ci
    npm run gen-unicode    # ensure Unicode data is fresh
    npm run build          # astro build
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: dist
```

## CNAME

`public/CNAME` (or repo settings) keeps `www.essenfont.org` and `essenfont.github.io` pointing at the Pages site.

## Acceptance

- CI workflow builds via Astro
- Pages deploy succeeds
- `www.essenfont.org` serves the new Astro-built site
