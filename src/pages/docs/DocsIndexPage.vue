<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Docs — Essenfont',
  meta: [
    { name: 'description', content: 'How to install, embed, and use Essenfont — the universal Unicode 17 font.' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/docs' }],
})

const cards = [
  {
    num: 'I',
    slug: 'install',
    title: 'Install',
    desc: 'macOS, Windows, Linux, iOS, Android. OTC + per-plane TTFs.',
    icon: '⬇',
  },
  {
    num: 'II',
    slug: 'css',
    title: 'Embed in CSS',
    desc: 'Self-host, CDN, or npm. Per-plane @font-face with unicode-range.',
    icon: '⌘',
  },
  {
    num: 'III',
    slug: 'architecture',
    title: 'Architecture',
    desc: 'Why no single TTF. How the OTC works. Build pipeline. Format guide.',
    icon: '⚙',
  },
]
</script>

<template>
  <div class="docs-index">
    <header class="di-head">
      <RouterLink to="/" class="back">← Home</RouterLink>
      <h1>Documentation</h1>
      <p class="di-lede">
        Essenfont covers every assigned Unicode 17 codepoint — ~154,000 glyphs
        across 5 Unicode planes. Here's how to install it, embed it, and
        understand the architecture.
      </p>
    </header>

    <section class="di-quick">
      <h2 class="di-section-title">Easiest way: 3 lines of CSS</h2>
      <pre class="di-code"><code>body &#123;
  font-family: -apple-system, sans-serif, 'essenfont';
&#125;</code></pre>
      <p class="di-quick-note">
        Add an <code>@font-face</code> rule pointing at the CDN for any plane
        your page needs. The browser fetches only those planes. See
        <RouterLink to="/docs/css">CSS embedding</RouterLink> for details.
      </p>
    </section>

    <section class="di-grid">
      <RouterLink
        v-for="c in cards"
        :key="c.slug"
        :to="`/docs/${c.slug}`"
        class="di-card"
      >
        <span class="di-card-num">{{ c.num }}</span>
        <span class="di-card-icon">{{ c.icon }}</span>
        <h3 class="di-card-title">{{ c.title }}</h3>
        <p class="di-card-desc">{{ c.desc }}</p>
        <span class="di-card-arrow">→</span>
      </RouterLink>
    </section>

    <section class="di-what">
      <h2 class="di-section-title">What is Essenfont?</h2>
      <div class="di-what-grid">
        <div class="di-what-cell">
          <h3>For developers</h3>
          <p>
            Add <code>essenfont</code> as the last entry in your
            <code>font-family</code> stack. Any codepoint your main font
            doesn't cover renders via essenfont. No more tofu for rare
            scripts, CJK extensions, or historic writing systems.
          </p>
        </div>
        <div class="di-what-cell">
          <h3>For linguists & historians</h3>
          <p>
            Read texts in Tai Yo, Sidetic, Beria Erfe, Egyptian Hieroglyphs
            Extended-B, Tangut, Khitan Small Script — all without installing
            a dozen specialist fonts. One font, every script.
          </p>
        </div>
        <div class="di-what-cell">
          <h3>For server-side rendering</h3>
          <p>
            Install on your PDF generation server, headless browser farm,
            or image-rendering worker. Generated documents render every
            Unicode character without per-document font hunting.
          </p>
        </div>
        <div class="di-what-cell">
          <h3>For localization QA</h3>
          <p>
            Run a single font across every locale's test corpus.
            Missing-glyph rendering is uniform and consistent across
            CI screenshots.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.docs-index { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

.di-head { margin-bottom: 2.5rem; }
.back { font-family: var(--spec-font-mono); font-size: 0.78rem; color: var(--ef-accent); text-decoration: none; }
.back:hover { text-decoration: underline; }
.di-head h1 {
  font-family: var(--spec-font-display);
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 500;
  margin: 0.3rem 0 0.6rem;
  letter-spacing: -0.02em;
}
.di-lede {
  font-size: 1.02rem;
  line-height: 1.6;
  color: var(--ef-text-2);
  max-width: 640px;
}

.di-quick {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: var(--ef-surface);
  border: 1px solid var(--ef-rule);
  border-radius: var(--ef-radius);
}
.di-section-title {
  font-family: var(--spec-font-display);
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 0.75rem;
  color: var(--ef-text);
}
.di-code {
  background: var(--ef-text);
  color: var(--ef-bg);
  padding: 1rem 1.25rem;
  border-radius: var(--ef-radius-sm);
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0 0 0.75rem;
}
.di-quick-note { font-size: 0.88rem; color: var(--ef-text-2); margin: 0; }
.di-quick-note a { color: var(--ef-accent); }
.di-quick-note code {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  background: var(--ef-raised);
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
}

.di-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}
.di-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1.5rem;
  background: var(--ef-surface);
  border: 1px solid var(--ef-rule);
  border-radius: var(--ef-radius);
  text-decoration: none;
  transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s;
  position: relative;
}
.di-card:hover {
  border-color: var(--ef-accent);
  transform: translateY(-2px);
  box-shadow: var(--ef-shadow-md);
  text-decoration: none;
}
.di-card-num {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--ef-text-3);
}
.di-card-icon { font-size: 1.4rem; margin-bottom: 0.3rem; }
.di-card-title {
  font-family: var(--spec-font-display);
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  color: var(--ef-text);
}
.di-card-desc {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--ef-text-2);
  margin: 0;
}
.di-card-arrow {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-family: var(--spec-font-mono);
  color: var(--ef-text-3);
  transition: color 0.15s;
}
.di-card:hover .di-card-arrow { color: var(--ef-accent); }

.di-what-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.di-what-cell {
  padding: 1.25rem;
  background: var(--ef-surface);
  border: 1px solid var(--ef-rule);
  border-radius: var(--ef-radius-sm);
}
.di-what-cell h3 {
  font-family: var(--spec-font-display);
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.4rem;
  color: var(--ef-accent);
}
.di-what-cell p {
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--ef-text-2);
  margin: 0;
}
.di-what-cell code {
  font-family: var(--spec-font-mono);
  font-size: 0.8rem;
  background: var(--ef-raised);
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
}
</style>