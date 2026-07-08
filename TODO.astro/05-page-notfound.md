# 05 — 404 NotFound

Smallest page. Validates the layout + data layer integration.

## Source

`src/pages/NotFound.vue`

## Implementation

```astro
---
// src/astro/pages/404.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Not found — Essenfont">
  <section class="prose">
    <h1>404</h1>
    <p>That page isn't here. Try the <a href="/">home page</a> or the <a href="/search">search</a>.</p>
  </section>
</BaseLayout>
```

Astro's `output: 'static'` emits `404.html` at the project root automatically.

## Acceptance

- Visiting `/nonexistent` returns the 404 page
- Status code is 404 in preview
