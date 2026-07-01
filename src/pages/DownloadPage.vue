<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Download — Essenfont',
  meta: [
    { name: 'description', content: 'Download Essenfont TTF and WOFF2. Install on macOS, Windows, Linux, or embed in web pages.' },
    { property: 'og:title', content: 'Download Essenfont' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/download' }],
})

const RELEASES_URL = 'https://github.com/essenfont/essenfont/releases/latest'
const TTF_URL = 'https://github.com/essenfont/essenfont/releases/latest/download/Essenfont-Regular.ttf'
const OTF_URL = 'https://github.com/essenfont/essenfont/releases/latest/download/Essenfont-Regular.otf'
const WOFF2_URL = 'https://github.com/essenfont/essenfont/releases/latest/download/Essenfont-Regular.woff2'

const cssSnippet = ref(`@font-face {
  font-family: 'Essenfont';
  src: url('${WOFF2_URL}') format('woff2');
  font-display: swap;
  unicode-range: U+0-10FFFF;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif, 'Essenfont';
}`)

function copyCss() {
  navigator.clipboard?.writeText(cssSnippet.value)
}
</script>

<template>
  <div class="container download">
    <header class="dl-header">
      <RouterLink to="/" class="dl-back">← Home</RouterLink>
      <h1>Download Essenfont</h1>
      <p>One redistributable TTF — every Unicode 17 codepoint. OFL 1.1.</p>
    </header>

    <!-- Direct download cards -->
    <section class="dl-formats">
      <a :href="TTF_URL" class="format-card format-primary">
        <div class="format-name">TTF</div>
        <div class="format-desc">TrueType · recommended for desktop install</div>
        <div class="format-action">Download →</div>
      </a>
      <a :href="OTF_URL" class="format-card">
        <div class="format-name">OTF</div>
        <div class="format-desc">OpenType · PostScript outlines</div>
        <div class="format-action">Download →</div>
      </a>
      <a :href="WOFF2_URL" class="format-card">
        <div class="format-name">WOFF2</div>
        <div class="format-desc">Web font · ~70% smaller</div>
        <div class="format-action">Download →</div>
      </a>
    </section>

    <p class="dl-all">
      <a :href="RELEASES_URL" target="_blank" rel="noopener">
        All releases →
      </a>
    </p>

    <!-- Install per OS -->
    <section class="section">
      <h2 class="section-heading">Install</h2>

      <div class="install-grid">
        <div class="install-card">
          <h3>macOS</h3>
          <ol>
            <li>Download <code>Essenfont-Regular.ttf</code></li>
            <li>Double-click the file → <em>Install Font</em></li>
            <li>Or copy to <code>~/Library/Fonts/</code></li>
          </ol>
        </div>
        <div class="install-card">
          <h3>Windows</h3>
          <ol>
            <li>Download <code>Essenfont-Regular.ttf</code></li>
            <li>Right-click → <em>Install for all users</em></li>
            <li>Or copy to <code>C:\Windows\Fonts\</code></li>
          </ol>
        </div>
        <div class="install-card">
          <h3>Linux</h3>
          <ol>
            <li>Copy to <code>~/.local/share/fonts/</code></li>
            <li>Run <code>fc-cache -fv</code></li>
            <li>Verify: <code>fc-list | grep -i essenfont</code></li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Web usage -->
    <section class="section">
      <h2 class="section-heading">Use on the web</h2>
      <p class="section-lede">
        Load the WOFF2 from the GitHub release, or self-host. Use as the
        <em>last</em> entry in your font stack so every codepoint has a fallback.
      </p>

      <div class="code-block">
        <button class="copy-btn" @click="copyCss">copy</button>
        <pre><code>{{ cssSnippet }}</code></pre>
      </div>
    </section>

    <!-- Programmatic -->
    <section class="section">
      <h2 class="section-heading">Programmatic install</h2>
      <p class="section-lede">
        If you use <a href="https://github.com/fontist/fontist" target="_blank" rel="noopener">Fontist</a>:
      </p>
      <div class="code-block">
        <pre><code>fontist install "Essenfont"</code></pre>
      </div>
    </section>

    <!-- Footer note -->
    <section class="section dl-note">
      <h2 class="section-heading">License &amp; attribution</h2>
      <p>
        Essenfont is licensed under the
        <a href="https://scripts.sil.org/OFL" target="_blank" rel="noopener">SIL Open Font License 1.1</a>.
        The assembled font includes glyphs from many OFL-licensed donor fonts.
        See <RouterLink to="/about">the about page</RouterLink> for the full
        donor registry and attribution.
      </p>
    </section>
  </div>
</template>

<style scoped>
.download { padding: 2rem 1.5rem 4rem; max-width: 920px; }

.dl-header { margin-bottom: 2rem; }
.dl-back {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-rose);
  text-decoration: none;
}
.dl-back:hover { text-decoration: underline; }
.dl-header h1 {
  font-family: var(--spec-font-display);
  font-size: 2.2rem; font-weight: 500;
  margin: 0.3rem 0 0.3rem;
  color: var(--spec-ink);
  letter-spacing: -0.02em;
}
.dl-header p {
  font-size: 0.95rem;
  color: var(--spec-ink-soft);
  margin: 0;
}

.dl-formats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.format-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s;
}
.format-card:hover {
  border-color: var(--spec-rose);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  text-decoration: none;
}
.format-primary {
  background: var(--spec-rose);
  border-color: var(--spec-rose);
}
.format-primary .format-name,
.format-primary .format-desc,
.format-primary .format-action {
  color: #fff;
}
.format-primary .format-desc { opacity: 0.9; }
.format-name {
  font-family: var(--spec-font-mono);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--spec-rose);
  letter-spacing: 0.05em;
}
.format-desc {
  font-size: 0.85rem;
  color: var(--spec-ink-soft);
}
.format-action {
  margin-top: 0.5rem;
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--spec-rose);
  letter-spacing: 0.05em;
}

.dl-all {
  text-align: center;
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
  margin: 1rem 0 2rem;
}
.dl-all a {
  color: var(--spec-rose);
  text-decoration: none;
}
.dl-all a:hover { text-decoration: underline; }

.section { margin-top: 2.5rem; }
.section-heading {
  font-family: var(--spec-font-display);
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--spec-ink);
  margin: 0 0 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--spec-rose);
  letter-spacing: -0.01em;
}
.section-lede {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0 0 1rem;
}
.section-lede code, .install-card code {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  background: var(--vp-c-bg-soft);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  border: 1px solid var(--spec-rule);
}

.install-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
.install-card {
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 8px;
}
.install-card h3 {
  font-family: var(--spec-font-display);
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: var(--spec-rose);
}
.install-card ol {
  padding-left: 1.25rem;
  margin: 0;
}
.install-card li {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin-bottom: 0.3rem;
}

.code-block {
  position: relative;
  background: var(--spec-term-bg);
  color: var(--spec-term-ink);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  overflow-x: auto;
}
.code-block pre {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  line-height: 1.6;
  margin: 0;
}
.code-block code { color: inherit; }
.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(255,255,255,0.1);
  color: var(--spec-term-ink);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
}
.copy-btn:hover { background: rgba(255,255,255,0.2); }

.dl-note p {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
}
.dl-note a {
  color: var(--spec-rose);
  text-decoration: none;
}
.dl-note a:hover { text-decoration: underline; }
</style>