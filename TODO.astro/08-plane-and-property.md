# 08 — Plane + Property pages

## Sources

- `src/pages/UnicodePlanePage.vue` — `/unicode/plane/:hex` (~17 planes)
- `src/pages/PropertyListPage.vue` — reused for 4 properties (`/scripts`, `/category`, `/bidi`, `/combining`)
- `src/pages/PropertyDetailPage.vue` — per-property value (`/scripts/:value`, etc.)

## Routes

```
/unicode/plane/:hex            → UnicodePlanePage
/scripts                       → PropertyListPage (props: scripts)
/category                      → PropertyListPage (props: category)
/bidi                          → PropertyListPage (props: bidi)
/combining                     → PropertyListPage (props: combining)
/scripts/:value                → PropertyDetailPage
/category/:value               → PropertyDetailPage
/bidi/:value                   → PropertyDetailPage
/combining/:value              → PropertyDetailPage
```

## Implementation

Astro doesn't have Vue Router's `props: true` shortcut. Either:
- (a) Hardcode each property as a separate file: `/scripts/index.astro`, `/category/index.astro`, etc. — simplest
- (b) Use a `[property].astro` slug + getStaticPaths validating against `{scripts, category, bidi, combining}` — fewer files, cleaner

Prefer (b) for DRY.

```astro
---
// src/astro/pages/[property]/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { loadPropertyValues } from '../../lib/unicode';

export async function getStaticPaths() {
  const props = ['scripts', 'category', 'bidi', 'combining'];
  return props.map(p => ({ params: { property: p }, props: { property: p } }));
}

const { property } = Astro.props;
const values = loadPropertyValues(property);
---
<BaseLayout title={`${property} — Essenfont`}>
  ...
</BaseLayout>
```

## Acceptance

- All 4 property index pages render
- All value detail pages render (counts match `public/unicode/indexes/<property>-by-value/*.json`)
- Plane pages render for all 17 planes
