# REQ: Release sync — keeping the site in sync with font releases

## Problem

The website (`essenfont.github.io`) depends on artifacts from the font
build (`essenfont/essenfont`):
- OTC / per-plane TTFs / WOFF2s (GitHub Release assets)
- cmap coverage data (for tofu highlighting + coverage map)

When a new font build is released, the site's coverage data must be
regenerated. Stale coverage data means the site claims wrong glyph
counts.

## Solution: `update-release.yml` workflow

`.github/workflows/update-release.yml` polls for new releases:

**Triggers:**
- `schedule: cron "0 */6 * * *"` — every 6 hours (catch-up)
- `workflow_dispatch` — manual
- `repository_dispatch: types: [essenfont-release]` — webhook from
  the font repo's release CI (push event, no polling delay)

**Steps:**
1. Fetch latest release manifest from `essenfont/essenfont/releases/latest`
2. Download the TTF asset
3. Run `gen-coverage-detail.rb` (requires Ruby + fontisan) to
   regenerate `public/coverage.json` + `public/coverage/*.json`
4. Run `gen-planes-data.mjs` to regenerate `public/planes.json`
5. Run `gen-donors-data.rb` to regenerate `public/donors.json`
6. Run `gen-fonts-css.rb` + `subset-fonts.rb --all` to regenerate
   per-block WOFF2 subsets + `fonts.css`
7. Commit to main with `github-actions[bot]` attribution
8. The existing `deploy.yml` picks up the commit and rebuilds the site

## Permissions

The workflow needs `contents: write` (to commit regenerated data to
main). It does NOT deploy directly — the commit triggers `deploy.yml`
which handles the 6-shard parallel build + Pages publish.

## Commit attribution

Automated commits use:
```
Author: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>
```

No AI attribution. The bot is the author, not a person.

## Race conditions

`update-release.yml` and `deploy.yml` both run on pushes to main.
`concurrency: cancel-in-progress: false` on `update-release.yml`
ensures it doesn't get cancelled by a concurrent deploy. The deploy
from the update-release commit runs after the data files are committed.