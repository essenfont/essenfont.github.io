# 09 — Donors index + detail

## Sources

- `src/pages/DonorsIndexPage.vue` — `/donors`
- `src/pages/DonorDetailPage.vue` — `/donors/:slug`

## Data

Donor data is currently committed as JSON under `public/donors/*.json` (or similar — verify). Index page lists donors; detail page shows role + coverage + license.

## Implementation

```astro
---
// src/astro/pages/donors/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { loadDonorIndex } from '../../lib/donors';

const donors = loadDonorIndex();
---
<BaseLayout title="Donors — Essenfont">
  <h1>Donor registry</h1>
  <p>{donors.length} donors contribute glyphs to Essenfont.</p>
  <!-- list -->
</BaseLayout>
```

```astro
---
// src/astro/pages/donors/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { loadDonor } from '../../lib/donors';

export async function getStaticPaths() {
  return (await loadDonorIndex()).map(d => ({ params: { slug: d.slug }, props: { donor: d } }));
}

const { donor } = Astro.props;
---
<BaseLayout title={`${donor.name} — Donor — Essenfont`}>
  ...
</BaseLayout>
```

## Acceptance

- `/donors` index page renders with current donor count
- Each `/donors/:slug` renders with role, coverage map, license
- Hover/click behaviors on coverage map preserved (or moved to a Vue island)
