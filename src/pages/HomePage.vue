<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadUnicodeVersion } from '../lib/unicode'

const unicodeInfo = ref<{ version: string; charCount: number; blockCount: number } | null>(null)

try {
  unicodeInfo.value = await loadUnicodeVersion()
} catch {}

useHead({
  title: 'Essenfont — Universal Unicode 17 Font',
  meta: [
    {
      name: 'description',
      content: 'One font, every Unicode 17 codepoint. Real outlines for ~160,000 assigned characters, drawn from canonical OFL-licensed donor fonts.',
    },
    { property: 'og:title', content: 'Essenfont — Universal Unicode 17 Font' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/' }],
})

// ── Interactive type tester ──
const DEFAULT_SAMPLE = 'The quick brown fox 快速的棕色狐狸 📚⚛🌱'
const testText = ref(DEFAULT_SAMPLE)

const SAMPLES = [
  { label: 'Latin',     text: 'Pack my box with five dozen liquor jugs.' },
  { label: 'CJK',       text: '人人生而自由，在尊嚴和權利上一律平等。' },
  { label: 'Korean',    text: '모든 인간은 태어날 때부터 자유로우며' },
  { label: 'Arabic',    text: 'كل البشر يولدون أحراراً ومتساوون' },
  { label: 'Hieroglyph', text: '𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇' },
  { label: 'Math',      text: '∀x∈ℝ: ∑∂ƒ(x) = ∫√π dθ' },
  { label: 'Emoji',     text: '😀📚⚛🌱🎓🎵𓂀' },
] as const

function setSample(s: string) {
  testText.value = s
}

const displayText = computed(() => testText.value || DEFAULT_SAMPLE)

const features = [
  {
    num: '01',
    title: 'Unicode 17 fallback',
    body: 'Install once, get Unicode 17 rendering everywhere. Every assigned codepoint, every plane, every block — from Basic Latin through Unicode 17 newcomers like Tolong Siki, Sidetic, and Beria Erfe.',
  },
  {
    num: '02',
    title: 'No more tofu',
    body: 'Rare and historic scripts — Tai Yo, Sidetic, Egyptian Hieroglyphs Extended-B, Sunuwar — render as real outlines, not blank boxes. The Last Resort font, but with actual glyphs.',
  },
  {
    num: '03',
    title: 'Donor-derived',
    body: 'Every glyph is extracted from a canonical Tier 1 donor font (Noto, Full-Sung, Lentariso, Kedebideri, UniHieroglyphica). No hand-designed UFO source. Fixes flow upstream.',
  },
  {
    num: '04',
    title: 'OFL, single file',
    body: 'One TTF, redistributable under the SIL Open Font License 1.1. Embed in PDFs, bundle with software, ship as a browser @font-face fallback. Replaces 10+ script-specific fonts.',
  },
]

const pipelineStages = [
  { num: 'α', label: 'Donor fonts',     sub: 'Noto · Full-Sung · 138 more' },
  { num: 'β', label: 'Build',           sub: 'Ruby + fontisan' },
  { num: 'γ', label: 'TTF',             sub: '~46 MB · 154k glyphs' },
  { num: 'δ', label: 'Subsets',         sub: '~214 WOFF2 · ~80 KB ea.' },
  { num: 'ε', label: 'Browser',         sub: 'you · no install' },
]

const steps = [
  { num: '01', title: 'Donor registry',     body: 'sources/manifest.yml declares which OFL-licensed font covers each Unicode block — Noto for Latin, Full-Sung for CJK, UniHieroglyphica for Egyptian Hieroglyphs, and ~138 more.' },
  { num: '02', title: 'Glyph extraction',   body: 'A pure-Ruby build script reads each donor via fontisan and pulls the relevant glyph outlines. No hand-designed UFO source — corrections flow upstream to the donor, then back via the next version bump.' },
  { num: '03', title: 'Assembly + subsetting', body: 'Glyphs are stitched into Essenfont-Regular.ttf (~46 MB, ~154k glyphs), then re-subsetted into per-block WOFF2 files (~80 KB each) for web delivery.' },
  { num: '04', title: 'In your browser',    body: 'This site loads each slice via @font-face + unicode-range. Your browser fetches only the block you\'re viewing — so every codepoint renders here without you installing anything.' },
]
</script>

<template>
  <div class="home">
    <!-- ── Hero ── -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="label-text ef-animate-up">One font · every Unicode 17 codepoint</span>
          <h1 class="hero-title ef-animate-up ef-delay-1">
            Essenfont renders<br />
            <span class="hero-accent">every assigned character.</span>
          </h1>
          <p class="hero-lede ef-animate-up ef-delay-2">
            A single redistributable OpenType font built from canonical OFL-licensed
            donor fonts — Noto, Full-Sung, UniHieroglyphica, and 138 more.
            Install once and never see tofu again.
          </p>
          <div class="hero-cta ef-animate-up ef-delay-3">
            <RouterLink to="/download" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Download TTF
            </RouterLink>
            <RouterLink to="/unicode" class="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Browse Unicode
            </RouterLink>
          </div>
          <div class="hero-meta ef-animate-in ef-delay-4" v-if="unicodeInfo">
            <span class="badge">Unicode {{ unicodeInfo.version }}</span>
            <span class="badge">{{ unicodeInfo.blockCount }} blocks</span>
            <span class="badge">{{ unicodeInfo.charCount.toLocaleString() }} glyphs</span>
            <span class="badge">OFL 1.1</span>
          </div>
        </div>

        <!-- ── Type tester — the interactive showpiece ── -->
        <div class="type-tester ef-animate-up ef-delay-4">
          <div class="tt-head">
            <span class="tt-label">Type tester</span>
            <span class="tt-hint">renders in essenfont — tofu = not covered</span>
          </div>
          <input
            class="tt-input"
            type="text"
            v-model="testText"
            placeholder="Type anything…"
            spellcheck="false"
            autocomplete="off"
          />
          <div class="tt-output">
            <span class="tt-text">{{ displayText }}</span>
          </div>
          <div class="tt-samples">
            <button
              v-for="s in SAMPLES"
              :key="s.label"
              class="tt-sample-btn"
              :class="{ active: testText === s.text }"
              @click="setSample(s.text)"
            >{{ s.label }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Features ── -->
    <section class="container section">
      <h2 class="section-heading ef-animate-up">Why essenfont</h2>
      <div class="features">
        <div
          v-for="(f, i) in features"
          :key="f.num"
          class="feature ef-animate-up"
          :style="{ animationDelay: (0.1 + i * 0.08) + 's' }"
        >
          <div class="feature-num">{{ f.num }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.body }}</p>
        </div>
      </div>
    </section>

    <!-- ── How it works ── -->
    <section class="container section">
      <h2 class="section-heading ef-animate-up">How it works</h2>

      <div class="pipeline ef-animate-up" aria-hidden="true">
        <div class="pipeline-stage" v-for="(s, i) in pipelineStages" :key="s.label">
          <span class="pipeline-num">{{ s.num }}</span>
          <span class="pipeline-label">{{ s.label }}</span>
          <span class="pipeline-sub">{{ s.sub }}</span>
          <span class="pipeline-arrow" v-if="i < pipelineStages.length - 1">→</span>
        </div>
      </div>

      <ol class="how">
        <li
          v-for="(step, i) in steps"
          :key="step.num"
          class="how-step ef-animate-up"
          :style="{ animationDelay: (0.15 + i * 0.1) + 's' }"
        >
          <div class="how-num">{{ step.num }}</div>
          <div class="how-content">
            <h3 class="how-title">{{ step.title }}</h3>
            <p class="how-body" v-html="step.body"></p>
          </div>
        </li>
      </ol>
      <p class="how-cta">
        <RouterLink to="/about">Read the full story →</RouterLink>
      </p>
    </section>

    <!-- ── Coverage map ── -->
    <CoverageMap />

    <!-- ── CTA ── -->
    <section class="cta">
      <div class="container cta-inner">
        <h2 class="cta-heading ef-animate-up">Stop shipping tofu.</h2>
        <p class="cta-lede ef-animate-up ef-delay-1">Install Essenfont on your system or embed it as a CSS fallback.</p>
        <div class="cta-buttons ef-animate-up ef-delay-2">
          <RouterLink to="/download" class="btn-primary">Download</RouterLink>
          <RouterLink to="/unicode" class="btn-ghost">Browse the font</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import CoverageMap from '../components/CoverageMap.vue'
export default { components: { CoverageMap } }
</script>

<style scoped>
.home { padding-bottom: 0; }

/* ── Hero ── */
.hero {
  padding: 3rem 0 4rem;
  border-bottom: 1px solid var(--spec-rule);
}
.hero-inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.hero-copy { max-width: 560px; }
.hero-copy .label-text { display: block; margin-bottom: 0.75rem; }
.hero-title {
  font-family: var(--spec-font-display);
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--spec-ink);
  margin: 0 0 1rem;
  font-feature-settings: "kern" 1, "liga" 1, "onum" 1, "salt" 1;
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

/* ── Type tester ── */
.type-tester {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 14px rgba(0, 0, 0, 0.06);
}
.tt-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}
.tt-label {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--spec-rose);
}
.tt-hint {
  font-family: var(--spec-font-mono);
  font-size: 0.62rem;
  color: var(--spec-mute);
}
.tt-input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
  color: var(--spec-ink);
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.tt-input:focus {
  border-color: var(--spec-rose);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}
.tt-input::placeholder { color: var(--spec-mute); }
.tt-output {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 1.25rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule);
  border-radius: 8px;
  overflow: hidden;
}
.tt-text {
  font-family: var(--spec-font-glyph);
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  line-height: 1.3;
  color: var(--spec-ink);
  text-align: center;
  word-break: break-word;
  transition: opacity 0.1s;
}
.tt-samples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.tt-sample-btn {
  padding: 0.3rem 0.6rem;
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--spec-ink-soft);
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.tt-sample-btn:hover {
  border-color: var(--spec-rose);
  color: var(--spec-rose);
}
.tt-sample-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--spec-rose);
  color: var(--spec-rose);
}

/* ── Sections ── */
.section { padding: 3.5rem 1.5rem; }
.section-heading {
  font-family: var(--spec-font-display);
  font-size: 1.7rem;
  font-weight: 500;
  color: var(--spec-ink);
  margin: 0 0 1.5rem;
  letter-spacing: -0.015em;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--spec-rose);
  font-feature-settings: "kern" 1, "liga" 1, "onum" 1;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: transform 0.15s, box-shadow 0.15s;
}
.feature:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
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
  font-size: 1.15rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: var(--spec-ink);
  letter-spacing: -0.005em;
}
.feature p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0;
}

/* ── Pipeline ── */
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
  position: relative;
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
}
.pipeline-sub {
  font-family: var(--spec-font-mono);
  font-size: 0.62rem;
  color: var(--spec-mute);
  line-height: 1.3;
}
.pipeline-arrow {
  display: flex;
  align-items: center;
  font-family: var(--spec-font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--spec-rose);
  opacity: 0.6;
  padding: 0 0.1rem;
}

/* ── Steps ── */
.how {
  list-style: none;
  counter-reset: how-counter;
  padding: 0;
  display: grid;
  gap: 1rem;
}
.how-step {
  counter-increment: how-counter;
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: 1.5rem;
  align-items: start;
  padding: 1.5rem 1.75rem;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  border: 1px solid var(--spec-rule);
  border-left: 3px solid var(--spec-rose);
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
.how-body :deep(code) {
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
.how-cta a { color: var(--spec-rose); text-decoration: none; }
.how-cta a:hover { text-decoration: underline; }

/* ── CTA ── */
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
  letter-spacing: -0.025em;
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
  .type-tester { order: -1; }
}
@media (max-width: 640px) {
  .pipeline { flex-direction: column; gap: 0.25rem; }
  .pipeline-arrow { transform: rotate(90deg); }
  .how-step { grid-template-columns: 1fr; gap: 0.4rem; }
}
</style>