<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadUnicodeVersion } from '../lib/unicode'

const unicodeInfo = ref<{ version: string; charCount: number; blockCount: number } | null>(null)

try {
  unicodeInfo.value = await loadUnicodeVersion()
} catch {}

// ── Latest release strip ──
type Release = {
  tag: string
  name: string
  date: string
  url: string
  otc_url?: string
  coverage_url?: string
}
const releases = ref<Release[]>([])
const latest = computed<Release | null>(() => releases.value[0] ?? null)

try {
  if (import.meta.env.SSR) {
    const { fetchBuildData } = await import('../lib/ssr-fetch')
    releases.value = (await fetchBuildData<Release[]>('releases.json')) ?? []
  } else {
    const res = await fetch(`${import.meta.env.BASE_URL}releases.json`)
    releases.value = await res.json()
  }
} catch {
  // silent — releases.json may not exist yet on first deploy
  releases.value = []
}

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

// ── Multi-mode type tester ──
const DEFAULT_SAMPLE = 'The quick brown fox 快速的棕色狐狸 📚⚛🌱'
const testText = ref(DEFAULT_SAMPLE)

type Mode = 'plain' | 'code' | 'math' | 'multi'
const modes: { key: Mode; label: string; sample: string }[] = [
  { key: 'plain', label: 'Plain',  sample: 'Pack my box with five dozen liquor jugs. 快速的棕色狐狸。' },
  { key: 'code',  label: 'Code',
    sample: 'const π = 3.14159\nconst sum = (xs) => xs.reduce((a, b) => a + b, 0)\nconsole.log(`Σ = ${sum([1,2,3])}`)' },
  { key: 'math',  label: 'Math',   sample: '∀x∈ℝ: ∫√(2π)·e^(-x²/2) dx = √(2π)    ∀ε>0 ∃δ>0' },
  { key: 'multi', label: 'Scripts',
    sample: 'Hello 世界 — 𓀀 𒁲 𐤀 𑱐 — Здравствуйте — مرحبا — こんにちは — 안녕하세요' },
]
const mode = ref<Mode>('plain')

function setMode(m: Mode) {
  mode.value = m
  const found = modes.find(x => x.key === m)
  if (found) testText.value = found.sample
}

const displayText = computed(() => testText.value || DEFAULT_SAMPLE)

// ── Tofu before/after demo ──
// All-rare-script text: nearly every system font tofus this.
const TOFU_DEMO_TEXT = '𓀀 𒁲 𐤀 𑱐 𑿁 𑣿 𰀀 𱁬 𐎀 𑠀 🯐'

// ── Glyph spotlight (rare-script carousel) ──
type Spotlight = {
  glyph: string
  hex: string
  name: string
  donor: string
  block: string
}
const SPOTLIGHTS: Spotlight[] = [
  { glyph: '𓀀', hex: '13000', name: 'Egyptian Hieroglyph A001', donor: 'UniHieroglyphica', block: 'Egyptian Hieroglyphs' },
  { glyph: '𒁲', hex: '12132', name: 'Cuneiform Sign Di', donor: 'Noto Sans Cuneiform', block: 'Cuneiform' },
  { glyph: '𐤀', hex: '10900', name: 'Phoenician Letter Alaph', donor: 'Lentariso', block: 'Phoenician' },
  { glyph: '𑱐', hex: '11450', name: 'Tolong Siki Digit Zero', donor: 'Noto Sans Tolong Siki', block: 'Tolong Siki' },
  { glyph: '𝕏', hex: '1D54F', name: 'Mathematical Double-Struck X', donor: 'Noto Sans Math', block: 'Mathematical Alphanumeric' },
  { glyph: '𰀀', hex: '30000', name: 'CJK Unified Ideograph Ext C-1', donor: 'FSung-3', block: 'CJK Ext C (TIP)' },
  { glyph: '𑠀', hex: '11600', name: 'Modi Letter A', donor: 'Noto Sans Modi', block: 'Modi' },
  { glyph: '🯐', hex: '1EEF0', name: 'Ottoman Siyaq Number One', donor: 'Noto Sans Ottoman Siyaq', block: 'Ottoman Siyaq Numbers' },
]
const spotlightIndex = ref(0)
let spotlightTimer: ReturnType<typeof setInterval> | null = null
const currentSpotlight = computed(() => SPOTLIGHTS[spotlightIndex.value])

function setSpotlight(i: number) {
  spotlightIndex.value = i
  if (spotlightTimer) { clearInterval(spotlightTimer); spotlightTimer = null }
  startSpotlight()
}
function startSpotlight() {
  spotlightTimer = setInterval(() => {
    spotlightIndex.value = (spotlightIndex.value + 1) % SPOTLIGHTS.length
  }, 4500)
}
onMounted(() => startSpotlight())
onUnmounted(() => { if (spotlightTimer) clearInterval(spotlightTimer) })

// ── Donor showcase ──
type Donor = {
  slug: string
  name: string
  covers: string
  sample: string
  license: 'OFL' | 'OFL + FSung-NC' | 'CC-BY' | 'Custom'
  note: string
}
const DONORS: Donor[] = [
  { slug: 'noto-sans', name: 'Noto Sans',
    covers: 'Latin, Cyrillic, Greek, common symbols',
    sample: 'A Б Ψ Ω ∑ ∂',
    license: 'OFL', note: 'Google + Monotype + Adobe' },
  { slug: 'fsung', name: 'Full-Sung (FSung)',
    covers: 'CJK Unified Ideographs — all extensions incl. Unicode 17 Ext J',
    sample: '全  宋  體  漢  字',
    license: 'OFL + FSung-NC', note: 'F.G. Wang / Taiwan MOE' },
  { slug: 'lentariso', name: 'Lentariso',
    covers: 'Sidetic, Imperial Aramaic, Phoenician',
    sample: '𐤀 𐎁 𐎒',
    license: 'OFL', note: 'Bry10022' },
  { slug: 'kedebideri', name: 'Kedebideri',
    covers: 'Beria Erfe',
    sample: '𐦚 𐦛 𐦜',
    license: 'OFL', note: 'SIL International' },
  { slug: 'unihieroglyphica', name: 'UniHieroglyphica',
    covers: 'Egyptian Hieroglyphs + Extended-A/B',
    sample: '𓀀 𓀁 𓀂',
    license: 'OFL', note: 'Michel Suignard' },
  { slug: 'babelstone', name: 'BabelStone',
    covers: 'Symbols for Legacy Computing Supplement',
    sample: '🬀 🬁 🬂',
    license: 'OFL', note: 'Andrew West' },
]

// ── CFF2 vs glyf size comparison ──
const SIZE_GLYF_TTC_KB = 47_500  // estimated full-scale
const SIZE_CFF2_OTC_KB = 31_000
const SIZE_REDUCTION_PCT = Math.round((1 - SIZE_CFF2_OTC_KB / SIZE_GLYF_TTC_KB) * 100)

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
    title: 'OTC, 5 subfonts',
    body: 'Distributed as an OpenType Collection: one file, five faces — one per Unicode plane (BMP, SMP, SIP, TIP, SSP). Each subfont stays under the 65,535-glyph cap while the collection covers all 131,000+ glyphs.',
  },
]

const pipelineStages = [
  { num: 'α', label: 'Donor fonts',     sub: 'Noto · Full-Sung · 138 more' },
  { num: 'β', label: 'Build',           sub: 'Ruby + fontisan' },
  { num: 'γ', label: 'Partition',       sub: '5 planes · per-gid cap' },
  { num: 'δ', label: 'OTC',             sub: '~50 MB · 5 faces' },
  { num: 'ε', label: 'Subsets',         sub: '~214 WOFF2 · ~80 KB ea.' },
]

const steps = [
  { num: '01', title: 'Donor registry',     body: 'sources/manifest.yml declares which OFL-licensed font covers each Unicode block — Noto for Latin, Full-Sung for CJK, UniHieroglyphica for Egyptian Hieroglyphs, and ~138 more.' },
  { num: '02', title: 'Glyph extraction',   body: 'A pure-Ruby build script reads each donor via fontisan and pulls the relevant glyph outlines. No hand-designed UFO source — corrections flow upstream to the donor, then back via the next version bump.' },
  { num: '03', title: 'Plane partition + OTC assembly', body: 'Codepoints are partitioned across the 5 Unicode planes (BMP / SMP / SIP / TIP / SSP). Each plane becomes one subfont in Essenfont-Regular.otc, kept under the 65,535-glyph TrueType cap. The result is a single ~50 MB collection covering every assigned codepoint.' },
  { num: '04', title: 'Per-block slices for the web',    body: 'For browser delivery, each block is re-subsetted into its own ~80 KB WOFF2. This site loads each slice via @font-face + unicode-range, so a visitor only fetches the blocks they\'re actually viewing.' },
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
              Download OTC
            </RouterLink>
            <RouterLink to="/unicode" class="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Browse Unicode
            </RouterLink>
          </div>
          <div class="hero-meta ef-animate-in ef-delay-4" v-if="unicodeInfo">
            <span class="badge">Unicode {{ unicodeInfo.version }}</span>
            <span class="badge">OTC · 5 subfonts</span>
            <span class="badge">{{ unicodeInfo.charCount.toLocaleString() }} glyphs</span>
            <span class="badge">OFL 1.1</span>
          </div>
        </div>

        <!-- ── Type tester — the interactive showpiece ── -->
        <div class="type-tester ef-animate-up ef-delay-4">
          <div class="tt-head">
            <span class="tt-label">Type tester</span>
            <div class="tt-modes" role="tablist">
              <button
                v-for="m in modes"
                :key="m.key"
                class="tt-mode-btn"
                :class="{ active: mode === m.key }"
                @click="setMode(m.key)"
              >{{ m.label }}</button>
            </div>
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
          <span class="tt-hint">renders in essenfont — tofu = not covered</span>
        </div>
      </div>
    </section>

    <!-- ── Tofu before/after ── -->
    <section class="tofu-section container">
      <div class="section-rule">
        <span class="rule-roman">i</span>
        <span class="rule-title">Tofu, no more</span>
        <span class="rule-meta">same text · two fonts</span>
      </div>
      <p class="tofu-lede">
        Every missing glyph in your font becomes a rectangle — typographers
        call it <em>tofu</em>. Same string below: the system default shows
        boxes where rare scripts live; essenfont shows the real outlines.
      </p>
      <div class="tofu-grid">
        <div class="tofu-card tofu-system">
          <span class="tofu-card-label">Without essenfont</span>
          <div class="tofu-card-glyph system-font">{{ TOFU_DEMO_TEXT }}</div>
          <span class="tofu-card-foot">-apple-system · system-ui · default</span>
        </div>
        <div class="tofu-card tofu-essenfont">
          <span class="tofu-card-label">With essenfont</span>
          <div class="tofu-card-glyph essenfont-font">{{ TOFU_DEMO_TEXT }}</div>
          <span class="tofu-card-foot">Essenfont-Regular · OTC</span>
        </div>
      </div>
    </section>

    <!-- ── Glyph spotlight carousel ── -->
    <section class="spotlight-section">
      <div class="container">
        <div class="section-rule">
          <span class="rule-roman">ii</span>
          <span class="rule-title">Every assigned character</span>
          <span class="rule-meta">8 of {{ unicodeInfo?.charCount.toLocaleString() ?? '131,000+' }} →</span>
        </div>
      </div>
      <div class="spotlight-stage">
        <RouterLink
          v-for="(s, i) in SPOTLIGHTS"
          :key="s.hex"
          :to="`/unicode/char/${s.hex}`"
          class="spotlight-card"
          :class="{ active: i === spotlightIndex }"
          @mouseenter="setSpotlight(i)"
        >
          <span class="spotlight-glyph">{{ s.glyph }}</span>
          <span class="spotlight-name">{{ s.name }}</span>
          <span class="spotlight-meta">
            <code>U+{{ s.hex }}</code>
            <span class="spotlight-donor">{{ s.donor }}</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- ── Multi-script type tester (continuation of hero tester) ── -->
    <section class="container section size-comparison">
      <div class="size-rule">
        <span class="rule-roman">iii</span>
        <span class="rule-title">CFF2 cuts the download in half</span>
      </div>
      <div class="size-grid">
        <div class="size-card size-glyf">
          <span class="size-label">Glyf (TTC)</span>
          <span class="size-value">~{{ (SIZE_GLYF_TTC_KB / 1000).toFixed(0) }} MB</span>
          <span class="size-bar-glyf"></span>
          <span class="size-foot">universal compatibility</span>
        </div>
        <div class="size-card size-cff2">
          <span class="size-label">CFF2 (OTC)</span>
          <span class="size-value">~{{ (SIZE_CFF2_OTC_KB / 1000).toFixed(0) }} MB</span>
          <span class="size-bar-cff2"></span>
          <span class="size-foot">modern · {{ SIZE_REDUCTION_PCT }}% smaller</span>
        </div>
      </div>
    </section>

    <!-- ── Donor showcase ── -->
    <section class="container section">
      <div class="section-rule">
        <span class="rule-roman">iv</span>
        <span class="rule-title">Built from the best</span>
        <span class="rule-meta">138 donor families · OFL wherever possible</span>
      </div>
      <div class="donor-grid">
        <RouterLink
          v-for="d in DONORS"
          :key="d.slug"
          :to="`/donors/${d.slug}`"
          class="donor-card"
        >
          <span class="donor-sample">{{ d.sample }}</span>
          <span class="donor-name">{{ d.name }}</span>
          <span class="donor-covers">{{ d.covers }}</span>
          <span class="donor-meta">
            <span class="donor-license" :class="`lic-${d.license.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`">{{ d.license }}</span>
            <span class="donor-note">{{ d.note }}</span>
          </span>
        </RouterLink>
      </div>
      <p class="donor-more">
        <RouterLink to="/donors">See all 138 donors →</RouterLink>
      </p>
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

    <!-- ── Latest release strip ── -->
    <section v-if="latest" class="release-strip">
      <div class="container rs-inner">
        <span class="rs-label">Latest release</span>
        <span class="rs-tag">{{ latest.tag }}</span>
        <span class="rs-date">{{ latest.date }}</span>
        <a class="rs-link" :href="latest.url" target="_blank" rel="noopener">changelog ↗</a>
      </div>
    </section>

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

/* ── Section rules (shared) ── */
.section-rule {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 1.5rem;
  margin: 0 0 2.5rem;
  font-family: var(--spec-font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.rule-roman {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 2.4rem;
  font-weight: 300;
  color: var(--spec-rose);
  line-height: 1;
}
.rule-title {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--spec-ink);
}
.rule-meta {
  font-size: 0.7rem;
  color: var(--spec-ink-soft);
  opacity: 0.8;
}

/* ── Tofu before/after ── */
.tofu-section { padding: 4rem 0; border-top: 1px solid var(--spec-rule); }
.tofu-lede {
  font-family: var(--spec-font-display);
  font-size: 1.05rem;
  font-weight: 300;
  line-height: 1.6;
  max-width: 64ch;
  margin: 0 0 2.5rem;
  color: var(--spec-ink-soft);
}
.tofu-lede em { color: var(--spec-rose); font-style: italic; }

.tofu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
@media (max-width: 720px) { .tofu-grid { grid-template-columns: 1fr; } }

.tofu-card {
  padding: 1.5rem 1.8rem 1.2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.tofu-essenfont {
  border-left: 3px solid var(--spec-rose);
  background: rgba(184, 71, 95, 0.04);
}
.tofu-card-label {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}
.tofu-essenfont .tofu-card-label { color: var(--spec-rose); opacity: 1; }
.tofu-card-glyph {
  font-size: clamp(1.4rem, 4vw, 2.4rem);
  line-height: 1.5;
  letter-spacing: 0.08em;
  word-break: break-all;
  min-height: 4em;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3em;
}
.tofu-card-glyph.system-font { font-family: -apple-system, system-ui, sans-serif; }
.tofu-card-glyph.essenfont-font { font-family: 'Essenfont', -apple-system, sans-serif; }
.tofu-card-foot {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: var(--spec-ink-soft);
  opacity: 0.6;
}

/* ── Spotlight carousel ── */
.spotlight-section { padding: 4rem 0; border-top: 1px solid var(--spec-rule); }
.spotlight-stage {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem 2rem 2rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}
.spotlight-card {
  flex: 0 0 200px;
  scroll-snap-align: start;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  padding: 1.5rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-decoration: none;
  transition: all 0.2s;
  opacity: 0.55;
}
.spotlight-card:hover { transform: translateY(-3px); border-color: var(--spec-rose); }
.spotlight-card.active {
  opacity: 1;
  border-color: var(--spec-rose);
  box-shadow: 0 4px 16px rgba(184, 71, 95, 0.18);
  background: rgba(184, 71, 95, 0.05);
}
.spotlight-glyph {
  font-family: 'Essenfont', var(--spec-font-display);
  font-size: 5rem;
  line-height: 1;
  color: var(--spec-ink);
  text-align: center;
  margin: 0.5rem 0;
}
.spotlight-name {
  font-family: var(--spec-font-display);
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--spec-ink);
  line-height: 1.3;
}
.spotlight-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: auto;
}
.spotlight-meta code {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  color: var(--spec-rose);
  background: rgba(184, 71, 95, 0.08);
  padding: 0.1em 0.4em;
  border-radius: 2px;
  align-self: flex-start;
}
.spotlight-donor {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-ink-soft);
  opacity: 0.8;
}

/* ── Type tester mode tabs ── */
.tt-modes { display: flex; gap: 0.3rem; }
.tt-mode-btn {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  padding: 0.3rem 0.7rem;
  background: transparent;
  border: 1px solid var(--spec-rule);
  border-radius: 2px;
  color: var(--spec-ink-soft);
  cursor: pointer;
  transition: all 0.15s;
}
.tt-mode-btn:hover { border-color: var(--spec-rose); color: var(--spec-rose); }
.tt-mode-btn.active {
  background: var(--spec-ink);
  color: var(--vp-c-bg);
  border-color: var(--spec-ink);
}

/* ── Size comparison ── */
.size-comparison { padding: 3rem 0 0; }
.size-rule {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.size-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 720px) { .size-grid { grid-template-columns: 1fr; } }
.size-card {
  padding: 1.5rem 1.8rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.size-cff2 { border-left: 3px solid var(--spec-rose); background: rgba(184, 71, 95, 0.04); }
.size-label {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
}
.size-value {
  font-family: var(--spec-font-display);
  font-size: 2.2rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--spec-ink);
}
.size-cff2 .size-value { color: var(--spec-rose); }
.size-bar-glyf, .size-bar-cff2 {
  height: 6px;
  border-radius: 1px;
  margin: 0.4rem 0;
}
.size-bar-glyf { background: var(--spec-ink-soft); opacity: 0.4; width: 100%; }
.size-bar-cff2 { background: var(--spec-rose); width: 65%; }
.size-foot {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-ink-soft);
  opacity: 0.8;
}

/* ── Donor showcase ── */
.donor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.donor-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.4rem 1.5rem 1.2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.15s;
}
.donor-card:hover {
  transform: translateY(-2px);
  border-color: var(--spec-rose);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.donor-sample {
  font-family: 'Essenfont', var(--spec-font-display);
  font-size: 1.8rem;
  letter-spacing: 0.1em;
  color: var(--spec-ink);
  line-height: 1;
}
.donor-name {
  font-family: var(--spec-font-display);
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--spec-ink);
  margin-top: 0.5rem;
}
.donor-covers {
  font-family: var(--spec-font-display);
  font-size: 0.88rem;
  font-weight: 300;
  line-height: 1.4;
  color: var(--spec-ink-soft);
}
.donor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: baseline;
  margin-top: 0.4rem;
}
.donor-license {
  font-family: var(--spec-font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(28, 26, 24, 0.06);
  color: var(--spec-ink-soft);
}
.donor-license.lic-ofl { background: rgba(94, 124, 78, 0.12); color: #5e7c4e; }
.donor-license.lic-ofl-fsung-nc { background: rgba(184, 71, 95, 0.12); color: var(--spec-rose); }
.donor-note {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}
.donor-more {
  margin-top: 1.5rem;
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
}
.donor-more a {
  color: var(--spec-rose);
  text-decoration: none;
}
.donor-more a:hover { text-decoration: underline; }

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

/* ── Release strip ── */
.release-strip {
  padding: 1.5rem 0;
  border-top: 1px solid var(--spec-rule);
  border-bottom: 1px solid var(--spec-rule);
  background: var(--vp-c-bg-soft);
}
.rs-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 1rem;
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-ink-soft);
}
.rs-label {
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.6;
}
.rs-tag {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--spec-rose);
}
.rs-date { color: var(--spec-ink-soft); opacity: 0.8; }
.rs-link {
  margin-left: auto;
  color: var(--spec-rose);
  text-decoration: none;
}
.rs-link:hover { text-decoration: underline; }

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