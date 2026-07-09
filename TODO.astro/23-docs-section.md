# 23 — Docs section (5 pages)

## Status
pending

## Why
The Vue site ships a `/docs` section with 5 pages (index, api, architecture,
css, install) that document the font's API, architecture, CSS integration,
and install paths. The Astro site currently has **zero** docs pages. Users
who follow inbound links to `/docs/*` will hit 404s once Vue is
decommissioned.

## Source-of-truth
- `src/pages/docs/DocsIndexPage.vue` → `/docs`
- `src/pages/docs/ApiPage.vue` → `/docs/api`
- `src/pages/docs/ArchitecturePage.vue` → `/docs/architecture`
- `src/pages/docs/CssPage.vue` → `/docs/css`
- `src/pages/docs/InstallPage.vue` → `/docs/install`

## Deliverables

### Routes (one Astro page per Vue page)
- `src/astro/pages/docs/index.astro` — section landing, links to children
- `src/astro/pages/docs/api.astro` — `@essenfont/essenfont` npm package API
- `src/astro/pages/docs/architecture.astro` — TTC/OTC/TTC + donor pipeline diagram (inline SVG)
- `src/astro/pages/docs/css.astro` — `@font-face` snippets, `font-family` best practice, CDN URL
- `src/astro/pages/docs/install.astro` — Fontist / npm / CDN / direct download

### Content fidelity
- Copy every section, code snippet, and link from the Vue version verbatim.
- Keep the URL paths identical so inbound links don't break.
- Add `<link rel="canonical">` pointing at the same path.

### Layout
- Use the standard `BaseLayout` shell.
- Add a sub-nav (left sidebar or top tabs) on docs pages so visitors can
  move between the 5 docs without going back to `/docs`.

## Acceptance criteria
- [ ] `npm run build:astro` produces all 5 `/docs/*` pages.
- [ ] Each docs page contains the same prose + code snippets as its Vue
      counterpart (diff-verified).
- [ ] Internal links between docs pages work.
- [ ] No inbound `/docs/*` URL 404s after Vue decommission.

## Effort
M (half-day — mostly mechanical content port)
