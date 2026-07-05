<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Download — Essenfont',
  meta: [
    {
      name: 'description',
      content:
        'Download Essenfont — OpenType Collection (5 plane subfonts), per-plane TTFs, and per-plane WOFF2 for web embed. Every assigned Unicode 17 codepoint.',
    },
    { property: 'og:title', content: 'Download Essenfont' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/download' }],
})

// Two delivery modes for web fonts: Self-host (GH release URLs) or
// CDN (jsDelivr mirrors GH Releases for free, no setup).
const GH_LATEST = 'https://github.com/essenfont/essenfont/releases/latest'
const CDN_LATEST = 'https://cdn.jsdelivr.net/gh/essenfont/essenfont@latest'

type Delivery = 'self' | 'cdn'
const delivery = ref<Delivery>('self')

function assetUrl(name: string): string {
  return delivery.value === 'self'
    ? `${GH_LATEST}/download/${name}`
    : `${CDN_LATEST}/${name}`
}

// Backwards-compat alias — kept so existing references in this file work.
const ASSET = assetUrl

const RELEASES_LATEST = GH_LATEST

const otc = {
  canonical: `${GH_LATEST}/download/Essenfont-Regular.otc`,
  cff2: `${GH_LATEST}/download/Essenfont-CFF2-Regular.otc`,
}

type Plane = {
  code: string
  label: string
  full: string
  range: string
  cpEstimate: string
  sizeTtf: string
  sizeWoff2: string
  donorHint: string
}

const planes: Plane[] = [
  {
    code: '0',
    label: 'BMP',
    full: 'Basic Multilingual Plane',
    range: 'U+0000–U+FFFF',
    cpEstimate: '~62,000',
    sizeTtf: '~12 MB',
    sizeWoff2: '~6 MB',
    donorHint: 'noto · fsung_m · 428 more',
  },
  {
    code: '1',
    label: 'SMP',
    full: 'Supplementary Multilingual',
    range: 'U+10000–U+1FFFF',
    cpEstimate: '~9,000',
    sizeTtf: '~3 MB',
    sizeWoff2: '~1.5 MB',
    donorHint: 'noto_emoji · historical · music',
  },
  {
    code: '2',
    label: 'SIP',
    full: 'Supplementary Ideographic',
    range: 'U+20000–U+2FFFF',
    cpEstimate: '~60,000',
    sizeTtf: '~14 MB',
    sizeWoff2: '~7 MB',
    donorHint: 'fsung_2 · CJK Ext B/C/D/E/F/I',
  },
  {
    code: '3',
    label: 'TIP',
    full: 'Tertiary Ideographic',
    range: 'U+30000–U+3FFFF',
    cpEstimate: '~6,000',
    sizeTtf: '~2 MB',
    sizeWoff2: '~1 MB',
    donorHint: 'fsung_3 · tangut · khitan',
  },
  {
    code: 'E',
    label: 'SSP',
    full: 'Supplementary Special-purpose',
    range: 'U+E0000–U+EFFFF',
    cpEstimate: '~100',
    sizeTtf: '<1 MB',
    sizeWoff2: '<500 KB',
    donorHint: 'language tags',
  },
]

function planeAsset(p: Plane, ext: 'ttf' | 'woff2' | 'woff') {
  return ASSET(`Essenfont-${p.label}.${ext}`)
}

// ── Web embed snippet builder ──
type EmbedMode = 'plane' | 'block' | 'all'
const embedMode = ref<EmbedMode>('plane')
const chosenPlane = ref<Plane>(planes[2]) // SIP — the heaviest plane, most useful for CJK sites

const embedSnippet = computed(() => {
  if (embedMode.value === 'all') {
    return `@font-face {
  font-family: 'essenfont';
  src: url('${ASSET('Essenfont-BMP.woff2')}') format('woff2');
  unicode-range: U+0000-FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${ASSET('Essenfont-SMP.woff2')}') format('woff2');
  unicode-range: U+10000-1FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${ASSET('Essenfont-SIP.woff2')}') format('woff2');
  unicode-range: U+20000-2FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${ASSET('Essenfont-TIP.woff2')}') format('woff2');
  unicode-range: U+30000-3FFFF;
}
@font-face {
  font-family: 'essenfont';
  src: url('${ASSET('Essenfont-SSP.woff2')}') format('woff2');
  unicode-range: U+E0000-EFFFF;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif,
    'essenfont';
}`
  }
  if (embedMode.value === 'plane') {
    const p = chosenPlane.value
    const range = p.range.replace(/U\+([0-9A-F]+).+U\+([0-9A-F]+)/i, '$1-$2')
    return `@font-face {
  font-family: 'essenfont';
  src: url('${planeAsset(p, 'woff2')}') format('woff2');
  font-display: swap;
  unicode-range: U+${range};
}`
  }
  return `/* Per-block WOFF2s (~80 KB each) ship with this site.
   Browse them at /unicode — each block page exposes its own URL. */`
})

function copyEmbed() {
  navigator.clipboard?.writeText(embedSnippet.value)
}

// ── npm package snippet ──
const NPM_VERSION = '0.2.0'
const npmSnippet = `npm install essenfont            # or: pnpm add essenfont / yarn add essenfont

/* then in your app entry: */
@import 'essenfont/css/all.css';   /* CSS */
import 'essenfont/css/all.css'     /* JS */`

function copyNpm() {
  navigator.clipboard?.writeText(npmSnippet)
}
</script>

<template>
  <div class="catalog">
    <!-- Masthead -->
    <header class="catalog-masthead">
      <RouterLink to="/" class="back-mark">← Home</RouterLink>
      <div class="catalog-flag">
        <span class="flag-num">№ 03</span>
        <span class="flag-sep">·</span>
        <span class="flag-label">Distribution sheet</span>
      </div>
      <h1 class="catalog-title">The font, in every form you need.</h1>
      <p class="catalog-deck">
        Essenfont ships as a single OpenType Collection of five plane subfonts,
        with per-plane TTFs and WOFF2s for clients that cannot consume OTC,
        and an npm package for bundler-driven web embeds.
        Per-block WOFF2s drive the inline rendering on this site.
      </p>
    </header>

    <!-- I. The Collection (canonical) -->
    <section class="sheet sheet-primary">
      <div class="sheet-rule">
        <span class="rule-num">I</span>
        <span class="rule-name">OpenType Collection</span>
        <span class="rule-meta">canonical · desktop install</span>
      </div>

      <div class="sheet-body">
        <div class="primary-card">
          <div class="primary-head">
            <h2 class="primary-name">Essenfont-Regular<span class="primary-ext">.otc</span></h2>
            <div class="primary-tags">
              <span class="tag">5 subfonts</span>
              <span class="tag">~131k glyphs</span>
              <span class="tag">TrueType outlines</span>
              <span class="tag">~50 MB</span>
            </div>
          </div>

          <p class="primary-blurb">
            One file. Five faces — one per Unicode plane (BMP, SMP, SIP,
            TIP, SSP). macOS Font Book, Windows Font Settings, and
            <code>fontconfig</code> all expose the faces individually
            once installed.
          </p>

          <div class="primary-actions">
            <a :href="otc.canonical" class="primary-btn">
              <span class="primary-btn-label">Download OTC</span>
              <span class="primary-btn-meta">Essenfont-Regular.otc</span>
            </a>
            <a :href="otc.cff2" class="secondary-btn">
              <span class="secondary-btn-label">CFF2 variant</span>
              <span class="secondary-btn-meta">~35% smaller · modern</span>
            </a>
          </div>
        </div>

        <aside class="primary-aside">
          <div class="aside-row">
            <span class="aside-k">faces</span>
            <span class="aside-v">5 (one per plane)</span>
          </div>
          <div class="aside-row">
            <span class="aside-k">glyph cap</span>
            <span class="aside-v">65,535 / face</span>
          </div>
          <div class="aside-row">
            <span class="aside-k">outlines</span>
            <span class="aside-v">glyf + loca</span>
          </div>
          <div class="aside-row">
            <span class="aside-k">license</span>
            <span class="aside-v">OFL 1.1 + FSung-NC</span>
          </div>
          <RouterLink to="/about" class="aside-link">→ format spec</RouterLink>
        </aside>
      </div>
    </section>

    <!-- II. Per-plane TTF (legacy) -->
    <section class="sheet">
      <div class="sheet-rule">
        <span class="rule-num">II</span>
        <span class="rule-name">Per-plane TTFs</span>
        <span class="rule-meta">legacy clients · per-plane install</span>
      </div>

      <p class="sheet-lede">
        For font managers that don't enumerate OTC faces (older Linux
        fontconfig, some mobile platforms). Each TTF carries the same
        glyph set as the corresponding OTC face, in isolation.
      </p>

      <table class="plane-table">
        <thead>
          <tr>
            <th class="col-num">№</th>
            <th class="col-label">Plane</th>
            <th class="col-full">Name</th>
            <th class="col-range">Range</th>
            <th class="col-cps">Codepoints</th>
            <th class="col-size">TTF size</th>
            <th class="col-dl">Download</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in planes" :key="p.code" class="plane-row">
            <td class="col-num">{{ p.code }}</td>
            <td class="col-label">
              <span class="plane-glyph">{{ p.label }}</span>
            </td>
            <td class="col-full">{{ p.full }}</td>
            <td class="col-range"><code>{{ p.range }}</code></td>
            <td class="col-cps">{{ p.cpEstimate }}</td>
            <td class="col-size">{{ p.sizeTtf }}</td>
            <td class="col-dl">
              <a :href="planeAsset(p, 'ttf')" class="row-link">.ttf</a>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- III. Per-plane WOFF2 (web embed) -->
    <section class="sheet sheet-embedded">
      <div class="sheet-rule">
        <span class="rule-num">III</span>
        <span class="rule-name">Web embed</span>
        <span class="rule-meta">@font-face · per-plane WOFF2</span>
      </div>

      <p class="sheet-lede">
        WOFF2 is the only sensible web format for a font this size.
        OTC is not browser-embeddable; per-plane WOFF2s with
        <code>unicode-range</code> let you ship one CSS rule per plane
        and only the bytes the visitor actually needs.
      </p>

      <div class="embed-controls">
        <button
          v-for="opt in (['plane','all','block'] as EmbedMode[])"
          :key="opt"
          class="embed-toggle"
          :class="{ 'is-active': embedMode === opt }"
          @click="embedMode = opt"
        >
          <span class="toggle-label">{{ opt === 'plane' ? 'One plane' : opt === 'all' ? 'All 5 planes' : 'Per-block' }}</span>
        </button>

        <span class="embed-delivery">
          <span class="delivery-label">delivery</span>
          <button
            class="embed-toggle"
            :class="{ 'is-active': delivery === 'self' }"
            @click="delivery = 'self'"
          >Self-host</button>
          <button
            class="embed-toggle"
            :class="{ 'is-active': delivery === 'cdn' }"
            @click="delivery = 'cdn'"
          >CDN ↗</button>
        </span>
      </div>

      <p v-if="delivery === 'cdn'" class="embed-delivery-note">
        CDN URLs are served by <a href="https://www.jsdelivr.com/" target="_blank" rel="noopener">jsDelivr</a>
        from the GitHub Release mirror. Add <code>integrity</code> attributes from
        <a :href="assetUrl('sri.txt')" target="_blank" rel="noopener">sri.txt</a> for subresource
        integrity. Switch back to <em>Self-host</em> to bundle the WOFF2s in your own build.
      </p>

      <div v-if="embedMode === 'plane'" class="embed-plane-picker">
        <label
          v-for="p in planes"
          :key="p.code"
          class="plane-pick"
          :class="{ 'is-chosen': chosenPlane === p }"
        >
          <input
            type="radio"
            name="embed-plane"
            :value="p"
            v-model="chosenPlane"
          />
          <span class="pick-label">{{ p.label }}</span>
          <span class="pick-range">{{ p.range }}</span>
          <span class="pick-size">{{ p.sizeWoff2 }}</span>
        </label>
      </div>

      <div class="embed-code">
        <button class="embed-copy" @click="copyEmbed">copy</button>
        <pre><code>{{ embedSnippet }}</code></pre>
      </div>
    </section>

    <!-- IV. npm package -->
    <section class="sheet sheet-muted">
      <div class="sheet-rule">
        <span class="rule-num">IV</span>
        <span class="rule-name">npm package</span>
        <span class="rule-meta">essenfont@{{ NPM_VERSION }} · bundler install</span>
      </div>
      <p class="sheet-lede">
        Prefer a package manager? The same per-plane WOFF2s and
        <code>@font-face</code> CSS are published to npm as
        <a href="https://www.npmjs.com/package/essenfont" target="_blank" rel="noopener"><code>essenfont</code></a>
        (from v{{ NPM_VERSION }}). Install and import — no manual URL wiring,
        and the WOFF2s travel with your bundle.
      </p>
      <div class="embed-code">
        <button class="embed-copy" @click="copyNpm">copy</button>
        <pre><code>{{ npmSnippet }}</code></pre>
      </div>
    </section>

    <!-- V. Per-block WOFF2 (this site) -->
    <section class="sheet sheet-muted">
      <div class="sheet-rule">
        <span class="rule-num">V</span>
        <span class="rule-name">Per-block slices</span>
        <span class="rule-meta">214 files · ~80 KB ea · this site</span>
      </div>
      <p class="sheet-lede">
        The site you're reading renders every glyph via per-block
        WOFF2s — one per Unicode block, ~80 KB each. A visitor on a
        block page fetches only that block's slice. Browse them all at
        <RouterLink to="/unicode">/unicode</RouterLink>, or open
        <RouterLink to="/subfonts">/subfonts</RouterLink> to see the
        five-plane partition visualized.
      </p>
    </section>

    <!-- VI. Install + License -->
    <section class="sheet sheet-grid">
      <div class="grid-cell">
        <div class="sheet-rule">
          <span class="rule-num">VI</span>
          <span class="rule-name">Install</span>
        </div>
        <ol class="install-list">
          <li>
            <span class="install-os">macOS</span>
            <span class="install-step">Double-click <code>Essenfont-Regular.otc</code> → Font Book shows 5 faces → <em>Install All</em></span>
          </li>
          <li>
            <span class="install-os">Windows</span>
            <span class="install-step">Right-click <code>.otc</code> → <em>Install for all users</em>. Faces appear individually in app font menus.</span>
          </li>
          <li>
            <span class="install-os">Linux</span>
            <span class="install-step"><code>cp Essenfont-Regular.otc ~/.local/share/fonts/ &amp;&amp; fc-cache -fv</code></span>
          </li>
        </ol>
      </div>

      <div class="grid-cell">
        <div class="sheet-rule">
          <span class="rule-num">VII</span>
          <span class="rule-name">License &amp; attribution</span>
        </div>
        <p class="license-blurb">
          OFL 1.1 covers most glyphs. CJK glyphs derived from Full-Sung
          carry an additional non-commercial restriction from
          F.G. Wang. See <RouterLink to="/about">/about</RouterLink>
          for the per-donor breakdown and
          <a :href="RELEASES_LATEST" target="_blank" rel="noopener">the release notes</a>
          for the version manifest.
        </p>
      </div>
    </section>

    <!-- Footer rule -->
    <footer class="catalog-foot">
      <span class="foot-mark">❦</span>
      <span class="foot-text">
        Built with Ruby + fontisan · no AFDKO, no fonttools ·
        <a href="https://github.com/essenfont/essenfont" target="_blank" rel="noopener">source</a>
      </span>
    </footer>
  </div>
</template>

<style scoped>
.catalog {
  max-width: 1080px;
  margin: 0 auto;
  padding: 4rem 2rem 6rem;
  background: var(--vp-c-bg);
  color: var(--spec-ink);
}

/* ── Masthead ── */
.catalog-masthead { margin-bottom: 5rem; }

.back-mark {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--spec-rose);
  text-decoration: none;
  text-transform: uppercase;
}
.back-mark:hover { text-decoration: underline; }

.catalog-flag {
  display: flex;
  align-items: baseline;
  gap: 0.7rem;
  margin: 2rem 0 1.2rem;
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
}
.flag-num { color: var(--spec-rose); font-weight: 600; }
.flag-sep { opacity: 0.4; }

.catalog-title {
  font-family: var(--spec-font-display);
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 300;
  line-height: 1.04;
  letter-spacing: -0.025em;
  margin: 0 0 1.5rem;
  color: var(--spec-ink);
}
.catalog-title em {
  font-style: italic;
  color: var(--spec-rose);
}

.catalog-deck {
  font-family: var(--spec-font-display);
  font-size: 1.15rem;
  font-weight: 300;
  line-height: 1.55;
  color: var(--spec-ink-soft);
  max-width: 60ch;
  margin: 0;
}

/* ── Sheet (section) ── */
.sheet {
  margin: 0 0 5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--spec-rule);
}

.sheet-rule {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 1.5rem;
  margin: 0 0 2.5rem;
  font-family: var(--spec-font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.rule-num {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 2.4rem;
  font-weight: 300;
  color: var(--spec-rose);
  line-height: 1;
}
.rule-name {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--spec-ink);
}
.rule-meta {
  font-size: 0.7rem;
  color: var(--spec-ink-soft);
  opacity: 0.8;
}

.sheet-lede {
  font-family: var(--spec-font-display);
  font-size: 1.05rem;
  font-weight: 300;
  line-height: 1.6;
  max-width: 64ch;
  margin: 0 0 2.5rem;
  color: var(--spec-ink-soft);
}
.sheet-lede code, .sheet-lede a {
  font-family: var(--spec-font-mono);
  font-size: 0.88rem;
  background: rgba(184, 71, 95, 0.08);
  padding: 0.05em 0.4em;
  border-radius: 2px;
  color: var(--spec-rose);
  text-decoration: none;
}
.sheet-lede a:hover { text-decoration: underline; }

/* ── I. Primary (OTC) ── */
.sheet-primary .sheet-body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 3rem;
  align-items: start;
}
@media (max-width: 760px) {
  .sheet-primary .sheet-body { grid-template-columns: 1fr; }
}

.primary-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-left: 3px solid var(--spec-rose);
  padding: 2rem 2.2rem;
  border-radius: 2px;
}

.primary-head { margin-bottom: 1.5rem; }
.primary-name {
  font-family: var(--spec-font-display);
  font-size: 2rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin: 0 0 0.8rem;
  color: var(--spec-ink);
}
.primary-ext { color: var(--spec-rose); font-style: italic; }

.primary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tag {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--spec-rule);
  border-radius: 999px;
  color: var(--spec-ink-soft);
}

.primary-blurb {
  font-family: var(--spec-font-display);
  font-size: 1.02rem;
  font-weight: 300;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0 0 1.8rem;
}
.primary-blurb code {
  font-family: var(--spec-font-mono);
  font-size: 0.84rem;
  background: rgba(184, 71, 95, 0.08);
  padding: 0.1em 0.4em;
  border-radius: 2px;
  color: var(--spec-rose);
}

.primary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}
.primary-btn,
.secondary-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.9rem 1.4rem;
  text-decoration: none;
  border-radius: 2px;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}
.primary-btn {
  background: var(--spec-rose);
  color: #fff;
  border: 1px solid var(--spec-rose);
}
.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(184, 71, 95, 0.35);
}
.secondary-btn {
  background: transparent;
  color: var(--spec-ink);
  border: 1px solid var(--spec-rule-strong);
}
.secondary-btn:hover {
  border-color: var(--spec-rose);
  color: var(--spec-rose);
}
.primary-btn-label,
.secondary-btn-label {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.primary-btn-meta,
.secondary-btn-meta {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  opacity: 0.75;
  margin-top: 0.15rem;
}

.primary-aside {
  border-left: 1px solid var(--spec-rule);
  padding-left: 1.5rem;
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.aside-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.aside-k {
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}
.aside-v { color: var(--spec-ink); }
.aside-link {
  margin-top: 0.8rem;
  color: var(--spec-rose);
  text-decoration: none;
  font-size: 0.72rem;
}
.aside-link:hover { text-decoration: underline; }

/* ── II. Plane table ── */
.plane-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
}
.plane-table thead {
  border-bottom: 1px solid var(--spec-rule-strong);
}
.plane-table th {
  text-align: left;
  padding: 0.6rem 0.8rem;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--spec-ink-soft);
}
.plane-row {
  border-bottom: 1px solid var(--spec-rule);
  transition: background 0.15s;
}
.plane-row:hover { background: rgba(184, 71, 95, 0.04); }
.plane-table td {
  padding: 0.9rem 0.8rem;
  vertical-align: middle;
  color: var(--spec-ink);
}
.col-num {
  width: 2rem;
  font-family: var(--spec-font-display);
  font-style: italic;
  color: var(--spec-rose);
  font-size: 1rem;
}
.col-label { width: 4rem; }
.plane-glyph {
  font-family: var(--spec-font-mono);
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: var(--spec-rose);
  background: rgba(184, 71, 95, 0.08);
  padding: 0.15rem 0.5rem;
  border-radius: 2px;
}
.col-full {
  font-family: var(--spec-font-display);
  font-size: 0.95rem;
  color: var(--spec-ink);
}
.col-range code {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-ink-soft);
}
.col-cps, .col-size {
  color: var(--spec-ink-soft);
  opacity: 0.8;
}
.col-dl { text-align: right; }
.row-link {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--spec-rose);
  text-decoration: none;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--spec-rose);
  border-radius: 2px;
  transition: background 0.15s, color 0.15s;
}
.row-link:hover {
  background: var(--spec-rose);
  color: #fff;
}

/* ── III. Embed ── */
.embed-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.8rem;
  flex-wrap: wrap;
  align-items: center;
}
.embed-delivery {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
  padding-left: 1rem;
  border-left: 1px solid var(--spec-rule);
}
.delivery-label {
  font-family: var(--spec-font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}
.embed-delivery-note {
  font-family: var(--spec-font-display);
  font-size: 0.92rem;
  font-weight: 300;
  font-style: italic;
  line-height: 1.6;
  margin: 0 0 1.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(184, 71, 95, 0.05);
  border-left: 2px solid var(--spec-rose);
  color: var(--spec-ink-soft);
}
.embed-delivery-note a { color: var(--spec-rose); text-decoration: none; }
.embed-delivery-note a:hover { text-decoration: underline; }
.embed-delivery-note code {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  background: rgba(184, 71, 95, 0.1);
  padding: 0.05em 0.4em;
  border-radius: 2px;
  color: var(--spec-rose);
}
.embed-toggle {
  background: transparent;
  border: 1px solid var(--spec-rule);
  padding: 0.5rem 1rem;
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s;
}
.embed-toggle:hover { border-color: var(--spec-rose); color: var(--spec-rose); }
.embed-toggle.is-active {
  background: var(--spec-ink);
  color: var(--vp-c-bg);
  border-color: var(--spec-ink);
}

.embed-plane-picker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.6rem;
  margin-bottom: 1.8rem;
}
.plane-pick {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--spec-rule);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.plane-pick input { position: absolute; opacity: 0; }
.plane-pick:hover { border-color: var(--spec-rose); }
.plane-pick.is-chosen {
  border-color: var(--spec-rose);
  background: rgba(184, 71, 95, 0.05);
}
.pick-label {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--spec-rose);
}
.pick-range {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-ink-soft);
}
.pick-size {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}

.embed-code {
  position: relative;
  background: var(--spec-term-bg);
  color: var(--spec-term-ink);
  border-radius: 2px;
  padding: 1.4rem 1.6rem;
  overflow-x: auto;
  border-left: 3px solid var(--spec-rose-soft);
}
.embed-code pre {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  line-height: 1.7;
  margin: 0;
}
.embed-copy {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  background: rgba(236, 223, 208, 0.1);
  color: var(--spec-term-ink);
  border: 1px solid rgba(236, 223, 208, 0.2);
  border-radius: 2px;
  font-family: var(--spec-font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
}
.embed-copy:hover { background: rgba(236, 223, 208, 0.2); }

/* ── IV. Muted ── */
.sheet-muted { background: transparent; }
.sheet-muted .sheet-lede {
  border-left: 2px solid var(--spec-rule);
  padding-left: 1.5rem;
  margin-left: 0;
}

/* ── V/VI. Grid ── */
.sheet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}
@media (max-width: 760px) {
  .sheet-grid { grid-template-columns: 1fr; }
}

.install-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.install-list li {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 1rem;
  align-items: baseline;
}
.install-os {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--spec-rose);
}
.install-step {
  font-family: var(--spec-font-display);
  font-size: 0.98rem;
  font-weight: 300;
  line-height: 1.55;
  color: var(--spec-ink-soft);
}
.install-step code {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  background: rgba(184, 71, 95, 0.08);
  padding: 0.1em 0.4em;
  border-radius: 2px;
  color: var(--spec-rose);
}

.license-blurb {
  font-family: var(--spec-font-display);
  font-size: 0.98rem;
  font-weight: 300;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0;
}
.license-blurb a {
  color: var(--spec-rose);
  text-decoration: none;
}
.license-blurb a:hover { text-decoration: underline; }

/* ── Footer ── */
.catalog-foot {
  margin-top: 6rem;
  padding-top: 2rem;
  border-top: 1px solid var(--spec-rule);
  display: flex;
  align-items: baseline;
  gap: 1rem;
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
}
.foot-mark {
  font-family: var(--spec-font-display);
  font-size: 1.4rem;
  color: var(--spec-rose);
  line-height: 1;
}
.foot-text a {
  color: var(--spec-rose);
  text-decoration: none;
}
.foot-text a:hover { text-decoration: underline; }
</style>
