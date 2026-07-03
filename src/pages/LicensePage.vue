<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'License — Essenfont',
  meta: [
    { name: 'description', content: 'Essenfont license: OFL-1.1 for most glyphs, OFL-1.1 + FSung-NC for CJK glyphs derived from Full-Sung. How to comply, how to strip FSung-NC codepoints.' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/license' }],
})

const GH = 'https://github.com/essenfont/essenfont/releases/latest/download'
</script>

<template>
  <div class="doc">
    <header class="doc-head">
      <RouterLink to="/" class="back">← Home</RouterLink>
      <span class="doc-flag">License</span>
      <h1>Two licenses, one font.</h1>
      <p class="lede">
        Most glyphs are OFL-1.1 (commercial-use friendly). CJK glyphs
        derived from <a href="https://fgwang.blogspot.com/" target="_blank" rel="noopener">Full-Sung</a>
        carry an additional non-commercial restriction from F.G. Wang.
        Both are documented per-codepoint in the
        <a :href="`${GH}/license-pack.zip`">license attribution pack</a>.
      </p>
    </header>

    <section>
      <h2>The split</h2>
      <div class="split-grid">
        <div class="split-card split-ofl">
          <span class="split-label">OFL-1.1</span>
          <span class="split-pct">~50%</span>
          <span class="split-glyphs">~65,000 codepoints</span>
          <p>Noto family, Lentariso, Kedebideri, UniHieroglyphica, BabelStone, Symbola, Last Resort, and 130+ more donors.</p>
          <p>Standard OFL terms. Commercial use OK.</p>
        </div>
        <div class="split-card split-nc">
          <span class="split-label">OFL-1.1 + FSung-NC</span>
          <span class="split-pct">~50%</span>
          <span class="split-glyphs">~65,000 codepoints</span>
          <p>CJK Unified Ideographs (all extensions), sourced from Full-Sung (Taiwan 全宋體) by F.G. Wang.</p>
          <p><strong>Non-commercial restriction.</strong> Academic research, educational work, and personal reading OK. Commercial use prohibited.</p>
        </div>
      </div>
    </section>

    <section>
      <h2>How to comply (commercial users)</h2>
      <ol>
        <li>
          Download the <a :href="`${GH}/fsung-nc-filter.txt`">fsung-nc-filter.txt</a>
          file — one codepoint per line, all cps subject to the NC restriction.
        </li>
        <li>Find which codepoints your project actually needs that are FSung-NC:</li>
        <pre><code>comm -12 &lt;(sort needed-cps.txt) &lt;(sort fsung-nc-filter.txt)</code></pre>
        <li>
          Either (a) <a href="https://fgwang.blogspot.com/" target="_blank" rel="noopener">contact F.G. Wang</a>
          for commercial-use permission on those cps, or (b) build a subset
          that excludes them:
        </li>
        <li>
          The <a :href="`${GH}/license-overview.csv`">license-overview.csv</a> has
          machine-readable donor × license × count for downstream tooling.
        </li>
      </ol>
    </section>

    <section>
      <h2>License pack per release</h2>
      <p>Every release ships a <a :href="`${GH}/license-pack.zip`">license-pack.zip</a> containing:</p>
      <ul>
        <li><code>LICENSE-SOURCES.md</code> — human-readable per-donor attribution with codepoint counts</li>
        <li><code>license-overview.csv</code> — machine-readable donor × license × count</li>
        <li><code>fsung-nc-filter.txt</code> — codepoints subject to FSung-NC, one per line</li>
        <li><code>LICENSE.md</code> — concatenated OFL texts from every donor</li>
      </ul>
    </section>

    <section>
      <h2>Requesting commercial permission for FSung glyphs</h2>
      <p>
        The Full-Sung font is a custom non-commercial share + use grant from
        F.G. Wang. Contact him via
        <a href="https://fgwang.blogspot.com/" target="_blank" rel="noopener">fgwang.blogspot.com</a>
        for commercial-use permission on the FSung-derived portion.
      </p>
      <p>
        The rest of essenfont (OFL glyphs) is unrestricted under standard OFL terms.
      </p>
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
.lede a { color: var(--spec-rose); text-decoration: none; }
.lede a:hover { text-decoration: underline; }
.doc section { margin-bottom: 3rem; }
.doc section h2 {
  font-family: var(--spec-font-mono); font-size: 0.86rem;
  font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--spec-rose); margin: 0 0 1.2rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--spec-rule);
}
.doc p, .doc li {
  font-family: var(--spec-font-display); font-size: 1rem; font-weight: 300;
  line-height: 1.65; color: var(--spec-ink-soft); margin: 0.5rem 0;
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
.doc strong { color: var(--spec-ink); font-weight: 500; }

.split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 720px) { .split-grid { grid-template-columns: 1fr; } }
.split-card {
  padding: 1.5rem 1.8rem; background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule); border-radius: 4px;
  display: flex; flex-direction: column; gap: 0.4rem;
}
.split-ofl { border-left: 3px solid #5e7c4e; background: rgba(94, 124, 78, 0.05); }
.split-nc  { border-left: 3px solid var(--spec-rose); background: rgba(184, 71, 95, 0.05); }
.split-label {
  font-family: var(--spec-font-mono); font-size: 0.7rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--spec-ink-soft);
}
.split-ofl .split-label { color: #5e7c4e; }
.split-nc .split-label  { color: var(--spec-rose); }
.split-pct {
  font-family: var(--spec-font-display); font-size: 2.4rem; font-weight: 300;
  letter-spacing: -0.025em; color: var(--spec-ink); line-height: 1;
}
.split-glyphs {
  font-family: var(--spec-font-mono); font-size: 0.82rem; color: var(--spec-ink-soft);
}
.split-card p { font-size: 0.92rem; margin-top: 0.8rem; }
</style>
