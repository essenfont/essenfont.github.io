// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue';

// Essenfont site — Astro config.
//
// Canonical: https://essenfont.github.io
// Output: static SSG into dist/ (matches the legacy Vue site's output)
//
// The old Vue site lives at src/ until TODO.astro/21 (decommission).
// New Astro content lives at src/astro/ during migration.

export default defineConfig({
  site: 'https://essenfont.github.io',
  base: '/',
  output: 'static',
  srcDir: 'src/astro',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap(),
    mdx(),
    vue(),
  ],
  vite: {
    // Preserve the existing CSS variable stack during migration.
    css: {
      preprocessorOptions: {},
    },
  },
});
