<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'CSS — Docs — Essenfont',
  meta: [
    { name: 'description', content: 'Embed Essenfont in a website: self-host, jsDelivr CDN, or npm. Per-plane @font-face with unicode-range.' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/docs/css' }],
})

type Mode = 'self' | 'cdn' | 'npm'
const mode = ref<Mode>('cdn')

const GH = 'https://github.com/essenfont/essenfont/releases/latest/download'
const CDN = 'https://cdn.jsdelivr.net/gh/essenfont/essenfont@latest'

const snippet = computed(() => {
  const u = (file: string) => mode.value === 'self' ? `${GH}/${file}` : `${CDN}/${file}`
  if (mode.value === 'npm') {
    return `# 1. Install
npm install essenfont

// 2. Import (any bundler: webpack, vite, rollup, esbuild)
import 'essenfont/css/all.css'

/* 3. Use essenfont as the fallback in your font stack */
body {
  font-family: -apple-system, system-ui, sans-serif, 'Essenfont';
}`
  }
  return `/* Per-plane @font-face with unicode-range — only fetches the planes a visitor needs */
@font-face {
  font-family: 'essenfont';
  src: url('${u('Essenfont-BMP.woff2')}') format('woff2');
  font-display: swap;
  unicode-range: U+0000-FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${u('Essenfont-SMP.woff2')}') format('woff2');
  font-display: swap;
  unicode-range: U+10000-1FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${u('Essenfont-SIP.woff2')}') format('woff2');
  font-display: swap;
  unicode-range: U+20000-2FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${u('Essenfont-TIP.woff2')}') format('woff2');
  font-display: swap;
  unicode-range: U+30000-3FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${u('Essenfont-SSP.woff2')}') format('woff2');
  font-display: swap;
  unicode-range: U+E0000-EFFFF;
}

/* Last entry in the stack — only used for codepoints not covered by the primary */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif, 'essenfont';
}`
})
</script>

<template>
  <div class="doc">
    <header class="doc-head">
      <RouterLink to="/" class="back">← Home</RouterLink>
      <span class="doc-flag">Docs · II</span>
      <h1>Embed in CSS</h1>
      <p class="lede">
        Three delivery paths. <strong>CDN</strong> for instant setup,
        <strong>self-host</strong> for production, <strong>npm</strong> for
        bundler-friendly builds. All three use the same per-plane WOFF2s
        with <code>unicode-range</code> so visitors only fetch what they need.
      </p>
    </header>

    <div class="mode-tabs">
      <button :class="{ active: mode === 'cdn' }" @click="mode = 'cdn'">CDN (jsDelivr)</button>
      <button :class="{ active: mode === 'self' }" @click="mode = 'self'">Self-host</button>
      <button :class="{ active: mode === 'npm' }" @click="mode = 'npm'">npm</button>
    </div>

    <pre class="code-block"><code>{{ snippet }}</code></pre>

    <section>
      <h2>Preload the BMP for faster first paint</h2>
      <p>If most of your text is Latin/Greek/Cyrillic (BMP), preload the BMP WOFF2:</p>
      <pre><code>&lt;link rel="preload" as="font" type="font/woff2"
      href="https://cdn.jsdelivr.net/gh/essenfont/essenfont@latest/Essenfont-BMP.woff2"
      crossorigin&gt;</code></pre>
    </section>

    <section>
      <h2>Subresource Integrity (SRI)</h2>
      <p>For CDN deployments, add <code>integrity</code> attributes from <a :href="`${GH}/sri.txt`" target="_blank" rel="noopener">sri.txt</a> to lock to a specific build:</p>
      <pre><code>&lt;link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/essenfont/essenfont@v0.2/essenfont.css"
      integrity="sha384-..." crossorigin="anonymous"&gt;</code></pre>
    </section>

    <section>
      <h2>Per-block subsetting</h2>
      <p>For ultra-fine delivery (~80 KB per block), the site's per-block WOFF2s are generated via fontisan's <code>subset</code> command. See <RouterLink to="/unicode">/unicode</RouterLink> for the 214 blocks.</p>
    </section>

    <section class="next">
      <h3>Next</h3>
      <ul>
        <li><RouterLink to="/docs/install">Per-OS install →</RouterLink></li>
        <li><RouterLink to="/docs/api">Drive via Ruby API →</RouterLink></li>
        <li><RouterLink to="/download">All download formats →</RouterLink></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.doc { max-width: 860px; margin: 0 auto; padding: 4rem 2rem 6rem; color: var(--spec-ink); }
.doc-head { margin-bottom: 3rem; }
.back {
  font-family: var(--spec-font-mono); font-size: 0.74rem; letter-spacing: 0.08em;
  color: var(--spec-rose); text-decoration: none; text-transform: uppercase;
}
.back:hover { text-decoration: underline; }
.doc-flag {
  display: inline-block; margin: 1.5rem 0 0.8rem;
  font-family: var(--spec-font-mono); font-size: 0.72rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--spec-ink-soft);
}
.doc h1 {
  font-family: var(--spec-font-display);
  font-size: clamp(2rem, 4vw, 3rem); font-weight: 300;
  letter-spacing: -0.025em; margin: 0 0 1rem;
}
.lede {
  font-family: var(--spec-font-display); font-size: 1.05rem; font-weight: 300;
  line-height: 1.6; color: var(--spec-ink-soft); margin: 0;
}
.lede strong { color: var(--spec-ink); font-weight: 500; }
.mode-tabs {
  display: flex; gap: 0.4rem; margin: 0 0 1.5rem;
  border-bottom: 1px solid var(--spec-rule); padding-bottom: 0.8rem;
}
.mode-tabs button {
  font-family: var(--spec-font-mono); font-size: 0.74rem;
  letter-spacing: 0.06em; padding: 0.4rem 0.9rem;
  background: transparent; border: 1px solid var(--spec-rule); border-radius: 2px;
  color: var(--spec-ink-soft); cursor: pointer; transition: all 0.15s;
}
.mode-tabs button:hover { border-color: var(--spec-rose); color: var(--spec-rose); }
.mode-tabs button.active {
  background: var(--spec-ink); color: var(--vp-c-bg); border-color: var(--spec-ink);
}
.code-block {
  background: var(--spec-term-bg); color: var(--spec-term-ink);
  padding: 1.4rem 1.6rem; border-radius: 4px; overflow-x: auto;
  font-family: var(--spec-font-mono); font-size: 0.82rem; line-height: 1.7;
  border-left: 3px solid var(--spec-rose-soft); margin: 0 0 3rem;
}
.doc section { margin-bottom: 3rem; }
.doc section h2 {
  font-family: var(--spec-font-mono); font-size: 0.86rem;
  font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--spec-rose); margin: 0 0 1rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--spec-rule);
}
.doc p, .doc li {
  font-family: var(--spec-font-display); font-size: 1rem; font-weight: 300;
  line-height: 1.65; color: var(--spec-ink-soft);
}
.doc a { color: var(--spec-rose); text-decoration: none; }
.doc a:hover { text-decoration: underline; }
.doc code {
  font-family: var(--spec-font-mono); font-size: 0.85rem;
  background: rgba(184, 71, 95, 0.08); padding: 0.05em 0.4em; border-radius: 2px;
  color: var(--spec-rose);
}
.doc pre {
  background: var(--spec-term-bg); color: var(--spec-term-ink);
  padding: 1rem 1.25rem; border-radius: 4px; overflow-x: auto;
  font-family: var(--spec-font-mono); font-size: 0.82rem; line-height: 1.6;
  border-left: 3px solid var(--spec-rose-soft);
}
.doc .next { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--spec-rule); }
.doc .next h3 {
  font-family: var(--spec-font-mono); font-size: 0.7rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--spec-ink-soft); margin: 0 0 1rem;
}
.doc .next ul { list-style: none; padding: 0; margin: 0; }
.doc .next li { margin-bottom: 0.4rem; }
</style>
