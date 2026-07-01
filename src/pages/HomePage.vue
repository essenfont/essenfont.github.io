<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadUnicodeVersion } from '../lib/unicode'
import CoverageMap from '../components/CoverageMap.vue'

const unicodeInfo = ref<{ version: string; charCount: number; blockCount: number } | null>(null)

try {
  unicodeInfo.value = await loadUnicodeVersion()
} catch {}

useHead({
  title: 'Essenfont — Universal Unicode 17 Font',
  meta: [
    {
      name: 'description',
      content: 'One font, every Unicode 17 codepoint. Real outlines for ~160,000 assigned characters, drawn from canonical OFL-licensed donor fonts. Install once, render everything.',
    },
    { property: 'og:title', content: 'Essenfont — Universal Unicode 17 Font' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/' }],
})

const specimens = [
  { cp: 0x1F4DA, label: '📚 Books' },
  { cp: 0x1F600, label: '😀 Face' },
  { cp: 0x269B, label: '⚛ Atom' },
  { cp: 0x211D, label: 'ℝ Real' },
  { cp: 0x4E00, label: '一 One' },
  { cp: 0x0623, label: 'أ Hamza' },
  { cp: 0x0939, label: 'ह Ha' },
  { cp: 0x3042, label: 'あ A' },
  { cp: 0x13000 | 0x1A, label: '𓀚 Glyph' },
  { cp: 0x1E6C0 | 0x10, label: '𛇐 Tai Yo' },
  { cp: 0x2FF0, label: '⿰ IDC' },
  { cp: 0x1F340, label: '🌱 Four-leaf' },
]

function charOf(cp: number): string {
  try { return String.fromCodePoint(cp) } catch { return '' }
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="label-text">One font · every Unicode 17 codepoint</span>
          <h1 class="hero-title">
            Essenfont renders<br />
            <span class="hero-accent">every assigned character.</span>
          </h1>
          <p class="hero-lede">
            A single redistributable OpenType font built from canonical OFL-licensed
            donor fonts — Noto, Full-Sung, UniHieroglyphica, and more. Install once and
            never see tofu again.
          </p>
          <div class="hero-cta">
            <RouterLink to="/download" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Download TTF
            </RouterLink>
            <RouterLink to="/unicode" class="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Browse Unicode
            </RouterLink>
          </div>
          <div class="hero-meta" v-if="unicodeInfo">
            <span class="badge">Unicode {{ unicodeInfo.version }}</span>
            <span class="badge">{{ unicodeInfo.blockCount }} blocks</span>
            <span class="badge">{{ unicodeInfo.charCount.toLocaleString() }} glyphs</span>
            <span class="badge">OFL 1.1</span>
          </div>
        </div>

        <div class="hero-specimen" aria-hidden="true">
          <div class="specimen-grid">
            <div v-for="(s, i) in specimens" :key="i" class="specimen-cell">
              <span class="specimen-char">{{ charOf(s.cp) }}</span>
              <span class="specimen-label">{{ s.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why -->
    <section class="container section">
      <h2 class="section-heading">Why essenfont</h2>
      <div class="features">
        <div class="feature">
          <div class="feature-num">01</div>
          <h3>Unicode 17 fallback</h3>
          <p>
            Install once, get Unicode 17 rendering everywhere. Every assigned codepoint,
            every plane, every block — from Basic Latin through Unicode 17 newcomers
            like Tolong Siki, Sidetic, and Beria Erfe.
          </p>
        </div>
        <div class="feature">
          <div class="feature-num">02</div>
          <h3>No more tofu</h3>
          <p>
            Rare and historic scripts — Tai Yo, Sidetic, Egyptian Hieroglyphs Extended-B,
            Sunuwar — render as real outlines, not blank boxes. The Last Resort font,
            but with actual glyphs.
          </p>
        </div>
        <div class="feature">
          <div class="feature-num">03</div>
          <h3>Donor-derived</h3>
          <p>
            Every glyph is extracted from a canonical Tier 1 donor font (Noto, Full-Sung,
            Lentariso, Kedebideri, UniHieroglyphica). No hand-designed UFO source.
            Fixes flow upstream.
          </p>
        </div>
        <div class="feature">
          <div class="feature-num">04</div>
          <h3>OFL, single file</h3>
          <p>
            One TTF, redistributable under the SIL Open Font License 1.1. Embed in PDFs,
            bundle with software, ship as a browser <code>@font-face</code> fallback.
            Replaces 10+ script-specific fonts.
          </p>
        </div>
      </div>
    </section>

    <!-- How -->
    <section class="container section">
      <h2 class="section-heading">How it works</h2>

      <!-- Pipeline overview: donor fonts → browser, at a glance -->
      <div class="pipeline" aria-hidden="true">
        <div class="pipeline-stage">
          <span class="pipeline-num">α</span>
          <span class="pipeline-label">Donor fonts</span>
          <span class="pipeline-sub">Noto · Full-Sung · 17 more</span>
        </div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-stage">
          <span class="pipeline-num">β</span>
          <span class="pipeline-label">Build</span>
          <span class="pipeline-sub">Ruby + fontisan</span>
        </div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-stage">
          <span class="pipeline-num">γ</span>
          <span class="pipeline-label">TTF</span>
          <span class="pipeline-sub">~45 MB · 300k glyphs</span>
        </div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-stage">
          <span class="pipeline-num">δ</span>
          <span class="pipeline-label">Subsets</span>
          <span class="pipeline-sub">~340 WOFF2 · ~80 KB ea.</span>
        </div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-stage pipeline-stage--final">
          <span class="pipeline-num">ε</span>
          <span class="pipeline-label">Browser</span>
          <span class="pipeline-sub">you · no install</span>
        </div>
      </div>

      <!-- Detailed steps -->
      <ol class="how">
        <li class="how-step">
          <div class="how-num">01</div>
          <div class="how-content">
            <h3 class="how-title">Donor registry</h3>
            <p class="how-body">
              <code>sources/manifest.yml</code> declares which OFL-licensed font
              covers each Unicode block — Noto for Latin, Full-Sung for CJK,
              UniHieroglyphica for Egyptian Hieroglyphs, and ~17 more.
            </p>
          </div>
        </li>
        <li class="how-step">
          <div class="how-num">02</div>
          <div class="how-content">
            <h3 class="how-title">Glyph extraction</h3>
            <p class="how-body">
              A pure-Ruby build script reads each donor via
              <code>fontisan</code> and pulls the relevant glyph outlines.
              No hand-designed UFO source — corrections flow upstream to the
              donor, then back via the next version bump.
            </p>
          </div>
        </li>
        <li class="how-step">
          <div class="how-num">03</div>
          <div class="how-content">
            <h3 class="how-title">Assembly + subsetting</h3>
            <p class="how-body">
              Glyphs are stitched into <code>Essenfont-Regular.ttf</code>
              (~45 MB, ~300k glyphs), then re-subsetted into per-block WOFF2
              files (~80 KB each) for web delivery. One TTF becomes ~340
              browser-friendly slices.
            </p>
          </div>
        </li>
        <li class="how-step">
          <div class="how-num">04</div>
          <div class="how-content">
            <h3 class="how-title">In your browser</h3>
            <p class="how-body">
              This site loads each slice via <code>@font-face</code> +
              <code>unicode-range</code>. Your browser fetches only the block
              you're viewing — so every codepoint renders here without you
              installing anything.
            </p>
          </div>
        </li>
      </ol>
      <p class="how-cta">
        <RouterLink to="/about">Read the full story →</RouterLink>
      </p>
    </section>

    <!-- Footer CTA -->
    <section class="cta">
      <div class="container cta-inner">
        <h2 class="cta-heading">Stop shipping tofu.</h2>
        <p class="cta-lede">Install Essenfont on your system or embed it as a CSS fallback.</p>
        <div class="cta-buttons">
          <RouterLink to="/download" class="btn-primary">Download</RouterLink>
          <RouterLink to="/unicode" class="btn-ghost">Browse the font</RouterLink>
        </div>
      </div>
    </section>

    <!-- Coverage Map (auto-generated from build/coverage_report.rb) -->
    <CoverageMap />
  </div>
</template>

<style scoped>
.home { padding-bottom: 0; }

/* Hero */
.hero {
  padding: 3rem 0 4rem;
  border-bottom: 1px solid var(--spec-rule);
}
.hero-inner {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: center;
}
.hero-copy { max-width: 560px; }
.hero-copy .label-text { display: block; margin-bottom: 0.75rem; }
.hero-title {
  font-family: var(--spec-font-display);
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--spec-ink);
  margin: 0 0 1rem;
}
.hero-accent {
  color: var(--spec-rose);
  font-style: italic;
}
.hero-lede {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0 0 1.5rem;
}
.hero-cta {
  display: flex; gap: 0.75rem; flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.hero-meta {
  display: flex; gap: 0.5rem; flex-wrap: wrap;
}

.hero-specimen {
  display: flex; justify-content: center;
}
.specimen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 12px;
}
.specimen-cell {
  display: flex; flex-direction: column;
  align-items: center; gap: 0.3rem;
  padding: 0.75rem 0.5rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--spec-rule);
  min-width: 80px;
}
.specimen-char {
  font-family: var(--spec-font-glyph);
  font-size: 1.8rem;
  line-height: 1;
  color: var(--spec-ink);
}
.specimen-label {
  font-family: var(--spec-font-mono);
  font-size: 0.65rem;
  color: var(--spec-mute);
  letter-spacing: 0.04em;
}

/* Sections */
.section {
  padding: 3.5rem 1.5rem;
}
.section-heading {
  font-family: var(--spec-font-display);
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--spec-ink);
  margin: 0 0 1.5rem;
  letter-spacing: -0.01em;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--spec-rose);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}
.feature {
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--spec-rule);
}
.feature-num {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--spec-rose);
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}
.feature h3 {
  font-family: var(--spec-font-display);
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: var(--spec-ink);
}
.feature p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0;
}
.feature code {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  background: var(--vp-c-bg);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  border: 1px solid var(--spec-rule);
}

.how {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.how-step {
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: 1.5rem;
  align-items: start;
  padding: 1.5rem 1.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-left: 3px solid var(--spec-rose);
  border-radius: 10px;
  transition: border-left-color 0.15s, transform 0.15s, box-shadow 0.15s;
}
.how-step:hover {
  border-left-color: var(--spec-ink);
  transform: translateX(2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}
.how-num {
  font-family: var(--spec-font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--spec-rose);
  letter-spacing: 0.02em;
  line-height: 1;
  padding-top: 0.2rem;
}
.how-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}
.how-title {
  font-family: var(--spec-font-display);
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--spec-ink);
  letter-spacing: -0.01em;
  margin: 0;
}
.how-body {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--spec-ink-soft);
  margin: 0;
}
.how-body code {
  font-family: var(--spec-font-mono);
  font-size: 0.84rem;
  background: var(--vp-c-bg);
  padding: 0.05rem 0.35rem;
  border-radius: 3px;
  border: 1px solid var(--spec-rule);
}
.how-cta {
  margin-top: 1.5rem;
  font-family: var(--spec-font-mono);
  font-size: 0.9rem;
}
.how-cta a {
  color: var(--spec-rose);
  text-decoration: none;
}
.how-cta a:hover { text-decoration: underline; }

/* Pipeline overview — horizontal flow at the top of the section */
.pipeline {
  display: flex;
  align-items: stretch;
  gap: 0.4rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 10px;
}
.pipeline-stage {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.85rem 0.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  text-align: center;
}
.pipeline-stage--final {
  border-color: var(--spec-rose);
  background: var(--vp-c-brand-soft);
}
.pipeline-num {
  font-family: var(--spec-font-display);
  font-size: 1.1rem;
  font-style: italic;
  font-weight: 500;
  color: var(--spec-rose);
  line-height: 1;
}
.pipeline-label {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--spec-ink);
  letter-spacing: 0.02em;
}
.pipeline-sub {
  font-family: var(--spec-font-mono);
  font-size: 0.65rem;
  color: var(--spec-mute);
  line-height: 1.3;
}
.pipeline-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--spec-font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--spec-rose);
  opacity: 0.6;
  padding: 0 0.1rem;
}

@media (max-width: 900px) {
  .pipeline {
    flex-direction: column;
    gap: 0.25rem;
  }
  .pipeline-arrow {
    transform: rotate(90deg);
    padding: 0.15rem 0;
  }
  .pipeline-stage {
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.75rem;
    text-align: left;
    padding: 0.6rem 0.85rem;
  }
  .pipeline-num { font-size: 0.95rem; }
  .pipeline-label { font-size: 0.72rem; }
  .pipeline-sub { font-size: 0.6rem; }
}

@media (max-width: 640px) {
  .how-step {
    grid-template-columns: 1fr;
    gap: 0.4rem;
    padding: 1.25rem 1.25rem;
  }
  .how-num { font-size: 1.1rem; padding-top: 0; }
  .how-title { font-size: 1.05rem; }
}

/* CTA */
.cta {
  padding: 4rem 0;
  margin-top: 2rem;
  background: var(--spec-paper-deep);
  border-top: 1px solid var(--spec-rule);
  border-bottom: 1px solid var(--spec-rule);
}
.cta-inner { text-align: center; }
.cta-heading {
  font-family: var(--spec-font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: var(--spec-ink);
  letter-spacing: -0.02em;
}
.cta-lede {
  font-size: 1rem;
  color: var(--spec-ink-soft);
  margin: 0 0 1.5rem;
}
.cta-buttons {
  display: inline-flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero-specimen { order: -1; }
  .specimen-grid { width: 100%; max-width: 360px; }
}
@media (max-width: 480px) {
  .specimen-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>