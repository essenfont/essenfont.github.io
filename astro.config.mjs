// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

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
    plugins: [tailwindcss()],
  },
});
