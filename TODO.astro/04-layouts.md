# 04 — Layouts: DefaultLayout + NavFooter

Astro's layout model is simpler than Vue's. One `BaseLayout.astro` handles the HTML shell, navbar, footer, and slot.

## Source

- `src/layouts/DefaultLayout.vue` (HTML shell)
- `src/components/` — find NavFooter-like component(s) and inline them
- `src/App.vue` — has `<RouterView />`; the wrapper around it goes into BaseLayout

## Implementation

```astro
---
// src/astro/layouts/BaseLayout.astro
import '../styles/main.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}
const { title, description = 'Universal Unicode 17 font', canonical, ogImage } = Astro.props;
const site = Astro.site ?? 'https://essenfont.github.io';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    {canonical && <link rel="canonical" href={new URL(canonical, site)} />}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {ogImage && <meta property="og:image" content={new URL(ogImage, site)} />}
    <link rel="icon" href="/favicon.svg" />
  </head>
  <body>
    <Nav />
    <main class="container">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

## Theme toggle

Dark-mode toggle is a tiny island. Either keep as Vue island or convert to vanilla JS in a `<script>` tag. The latter is simpler.

## Acceptance

- All pages render with consistent shell
- Per-page `<title>`, description, canonical, OG tags work
- Theme toggle persists in `localStorage`
