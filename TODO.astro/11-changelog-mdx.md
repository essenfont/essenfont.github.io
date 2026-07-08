# 11 — Changelog (MDX)

Migrate the changelog from JSON-driven Vue pages to Astro content collections with MDX. MDX gives us rich-text changelog entries (headings, code, lists, embeds).

## Sources

- `src/pages/ChangelogIndexPage.vue` — `/changelog`
- `src/pages/ChangelogDetailPage.vue` — `/changelog/:slug`
- `public/changelog/*.json` (or wherever entries are committed)

## Target structure

```
src/astro/content/changelog/
  config.ts           # content collection schema (zod)
  0-1-0.mdx
  0-2-0.mdx
  ...
```

```ts
// src/astro/content/changelog/config.ts
import { defineCollection, z } from 'astro:content';

const changelog = defineCollection({
  type: 'content',
  schema: z.object({
    version: z.string(),
    date: z.coerce.date(),
    title: z.string(),
    summary: z.string(),
  }),
});

export const collections = { changelog };
```

## Pages

```astro
---
// src/astro/pages/changelog/index.astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const entries = (await getCollection('changelog')).sort((a, b) => b.data.date - a.data.date);
---
<BaseLayout title="Changelog — Essenfont">
  <h1>Changelog</h1>
  <ul>
    {entries.map(e => (
      <li>
        <a href={`/changelog/${e.slug}`}>{e.data.version} — {e.data.title}</a>
        <time>{e.data.date.toISOString().split('T')[0]}</time>
      </li>
    ))}
  </ul>
</BaseLayout>
```

```astro
---
// src/astro/pages/changelog/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('changelog');
  return entries.map(e => ({ params: { slug: e.slug }, props: { entry: e } }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---
<BaseLayout title={`${entry.data.version} — Essenfont`}>
  <article class="prose">
    <h1>{entry.data.title}</h1>
    <time>{entry.data.date.toISOString().split('T')[0]}</time>
    <Content />
  </article>
</BaseLayout>
```

## Acceptance

- `/changelog` index renders all MDX entries sorted by date desc
- Each entry has its own `/changelog/:slug` page rendered from MDX
- Code blocks in MDX render with syntax highlighting (shiki — Astro default)
