<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadPlanes, PLANES } from '../lib/unicode'
import type { PlaneInfo } from '../lib/unicode'

useHead({
  title: 'Subfonts — Essenfont',
  meta: [
    {
      name: 'description',
      content:
        'Essenfont is partitioned across the 5 Unicode planes that carry assigned characters: BMP, SMP, SIP, TIP, SSP. Each plane becomes one subfont in the OTC.',
    },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/subfonts' }],
})

// Single source of truth — loaded from public/planes.json.
// No hardcoded estimates; every number is derived from real coverage data.
const planes = ref<PlaneInfo[]>([])
planes.value = (await loadPlanes()).filter(p => !p.isReserved)

const totalGlyphs = computed(() => planes.value.reduce((sum, p) => sum + p.glyphCount, 0))
</script>

<template>
  <div class="subfonts-page">
    <!-- Masthead -->
    <header class="page-head">
      <div class="container">
        <RouterLink to="/" class="back-mark">← Home</RouterLink>
        <div class="page-flag">
          <span class="flag-num">№ 04</span>
          <span class="flag-sep">·</span>
          <span class="flag-label">Subfont atlas</span>
        </div>
        <h1 class="page-title">Five planes. <em>Five faces.</em></h1>
        <p class="page-deck">
          The TrueType <code>maxp.num_glyphs</code> field is a uint16 —
          cap 65,535. Essenfont has ~131,000 glyphs. We partition across
          the 5 Unicode planes that carry assigned characters; each plane
          becomes one subfont in the OTC. Every codepoint ends up in
          exactly one face.
        </p>
      </div>
    </header>

    <!-- Summary strip -->
    <section class="container summary">
      <div class="summary-cell">
        <span class="summary-num">{{ planes.length }}</span>
        <span class="summary-label">subfonts</span>
      </div>
      <div class="summary-cell">
        <span class="summary-num">{{ totalGlyphs.toLocaleString() }}</span>
        <span class="summary-label">glyphs covered</span>
      </div>
      <div class="summary-cell">
        <span class="summary-num">65,535</span>
        <span class="summary-label">cap / subfont</span>
      </div>
      <div class="summary-cell">
        <span class="summary-num">~50 MB</span>
        <span class="summary-label">OTC size</span>
      </div>
    </section>

    <!-- Plane atlas -->
    <section class="container atlas">
      <article
        v-for="p in planes"
        :key="p.code"
        class="atlas-row"
        :style="{ '--plane-color': p.color } as Record<string, string>"
      >
        <!-- left: plane identity -->
        <div class="atlas-identity">
          <div class="identity-code">{{ p.code }}</div>
          <div class="identity-stack">
            <span class="identity-label">{{ p.label }}</span>
            <span class="identity-full">{{ p.full }}</span>
          </div>
          <div class="identity-range">
            <code>U+{{ p.start.toString(16).toUpperCase().padStart(4, '0') }}</code>
            <span class="range-dash">–</span>
            <code>U+{{ p.end.toString(16).toUpperCase().padStart(4, '0') }}</code>
          </div>
        </div>

        <!-- middle: stats + bar -->
        <div class="atlas-stats">
          <div class="stats-bar-wrap">
            <div class="stats-bar-fill" :style="{ width: Math.min(100, (p.glyphCount / 65535) * 100) + '%' }" />
            <div class="stats-bar-ghost" />
          </div>
          <div class="stats-row">
            <span class="stat-k">glyphs</span>
            <span class="stat-v">{{ p.glyphCount.toLocaleString() }}</span>
            <span class="stat-meta">/ 65,535</span>
          </div>
          <div class="stats-row">
            <span class="stat-k">codepoints</span>
            <span class="stat-v">{{ p.assignedCount.toLocaleString() }}</span>
            <span class="stat-meta">assigned</span>
          </div>
          <div class="stats-row">
            <span class="stat-k">blocks</span>
            <span class="stat-v">{{ p.blockCount }}</span>
          </div>
        </div>

        <!-- right: notable + donors -->
        <div class="atlas-detail">
          <p class="detail-highlight">{{ p.full }}</p>
          <ul class="detail-notable">
            <li v-for="n in p.notable" :key="n">{{ n }}</li>
          </ul>
          <div class="detail-donors">
            <span class="donors-k">donors</span>
            <span v-for="d in p.donors" :key="d" class="donors-v">{{ d }}</span>
          </div>
        </div>

        <!-- far right: browse -->
        <div class="atlas-action">
          <RouterLink :to="`/unicode/plane/${p.key}`" class="atlas-link">
            browse →
          </RouterLink>
        </div>
      </article>
    </section>

    <!-- Why partition by plane? -->
    <section class="container why">
      <div class="why-rule">
        <span class="why-num">i</span>
        <span class="why-title">Why partition by plane?</span>
      </div>
      <div class="why-grid">
        <div class="why-cell">
          <h3>MECE</h3>
          <p>
            Every codepoint lives in exactly one plane; planes tile the
            codepoint space without overlap or gaps. No codepoint can
            land in two subfonts; no assigned codepoint is missing from
            the union.
          </p>
        </div>
        <div class="why-cell">
          <h3>Stable</h3>
          <p>
            A codepoint's plane is invariant across Unicode versions.
            New codepoints in Unicode 18, 19, … land in their plane's
            subfont without reshuffling existing assignments.
          </p>
        </div>
        <div class="why-cell">
          <h3>Discoverable</h3>
          <p>
            <code>cp &gt;&gt; 16</code> gives the plane number in O(1).
            No codebook lookup, no per-cp table. The partitioner is a
            single shift.
          </p>
        </div>
        <div class="why-cell">
          <h3>Semantically meaningful</h3>
          <p>
            BMP = world scripts. SMP = historical + emoji. SIP/TIP =
            CJK ideographs. SSP = tags. A user looking for "the CJK
            face" knows immediately it's <code>plane_2</code>.
          </p>
        </div>
      </div>
    </section>

    <!-- Sub-split safety net -->
    <section class="container safety">
      <div class="why-rule">
        <span class="why-num">ii</span>
        <span class="why-title">What if a plane overflows?</span>
      </div>
      <p class="safety-blurb">
        If a future Unicode version balloons a single plane past 65,484
        glyphs (cap minus <code>.notdef</code> minus 50-glyph safety
        margin), the partitioner sub-splits by Unicode block. Each
        sub-partition gets a stable suffix: <code>plane_0_a</code>,
        <code>plane_0_b</code>, etc. No block is ever split across two
        subfonts. Today, all 5 planes fit with at least 3,000 glyphs of
        headroom.
      </p>
    </section>

    <!-- Footer -->
    <section class="container cta">
      <RouterLink to="/download" class="btn-primary">Download the OTC →</RouterLink>
      <RouterLink to="/unicode" class="btn-ghost">Browse Unicode →</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.subfonts-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 0 4rem;
  background: var(--vp-c-bg);
  color: var(--spec-ink);
}

/* ── Masthead ── */
.page-head { padding: 4rem 0 3rem; border-bottom: 1px solid var(--spec-rule); }

.back-mark {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--spec-rose);
  text-decoration: none;
  text-transform: uppercase;
}
.back-mark:hover { text-decoration: underline; }

.page-flag {
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

.page-title {
  font-family: var(--spec-font-display);
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 300;
  line-height: 1.04;
  letter-spacing: -0.025em;
  margin: 0 0 1.5rem;
  color: var(--spec-ink);
}
.page-title em {
  font-style: italic;
  color: var(--spec-rose);
}

.page-deck {
  font-family: var(--spec-font-display);
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1.55;
  max-width: 64ch;
  margin: 0;
  color: var(--spec-ink-soft);
}
.page-deck code {
  font-family: var(--spec-font-mono);
  font-size: 0.86rem;
  background: rgba(184, 71, 95, 0.08);
  padding: 0.05em 0.4em;
  border-radius: 2px;
  color: var(--spec-rose);
}

/* ── Summary strip ── */
.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--spec-rule);
}
@media (max-width: 720px) {
  .summary { grid-template-columns: repeat(2, 1fr); }
}
.summary-cell {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.summary-num {
  font-family: var(--spec-font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--spec-ink);
  line-height: 1;
}
.summary-label {
  font-family: var(--spec-font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.8;
}

/* ── Atlas ── */
.atlas {
  padding-top: 3rem;
  display: flex;
  flex-direction: column;
}

.atlas-row {
  display: grid;
  grid-template-columns: 180px 1.4fr 2fr 100px;
  gap: 2rem;
  align-items: start;
  padding: 2.5rem 0;
  border-bottom: 1px solid var(--spec-rule);
  position: relative;
}
.atlas-row::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--plane-color);
  opacity: 0;
  transition: opacity 0.2s;
}
.atlas-row:hover::before { opacity: 1; }

@media (max-width: 880px) {
  .atlas-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.atlas-identity {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.identity-code {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 3rem;
  font-weight: 300;
  color: var(--plane-color);
  line-height: 0.9;
  letter-spacing: -0.04em;
}
.identity-stack {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.identity-label {
  font-family: var(--spec-font-mono);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--spec-ink);
}
.identity-full {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 0.86rem;
  color: var(--spec-ink-soft);
}
.identity-range {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--spec-ink-soft);
}
.identity-range code {
  background: rgba(28, 26, 24, 0.05);
  padding: 0.1em 0.4em;
  border-radius: 2px;
  font-size: 0.7rem;
}
.range-dash { opacity: 0.4; }

.atlas-stats {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.stats-bar-wrap {
  position: relative;
  height: 6px;
  margin-bottom: 0.6rem;
  border-radius: 1px;
  overflow: hidden;
}
.stats-bar-ghost {
  position: absolute;
  inset: 0;
  background: rgba(28, 26, 24, 0.08);
}
.stats-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--plane-color);
  transition: width 0.4s;
}

.stats-row {
  display: grid;
  grid-template-columns: 90px 1fr auto;
  align-items: baseline;
  gap: 0.6rem;
  font-family: var(--spec-font-mono);
}
.stat-k {
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}
.stat-v {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--spec-ink);
}
.stat-meta {
  font-size: 0.7rem;
  color: var(--spec-ink-soft);
  opacity: 0.6;
}

.atlas-detail { display: flex; flex-direction: column; gap: 0.8rem; }
.detail-highlight {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.5;
  margin: 0;
  color: var(--spec-ink);
}
.detail-notable {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.detail-notable li {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  padding: 0.18rem 0.55rem;
  border: 1px solid var(--spec-rule);
  border-radius: 999px;
  color: var(--spec-ink-soft);
  background: rgba(28, 26, 24, 0.02);
}
.detail-donors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: baseline;
}
.donors-k {
  font-family: var(--spec-font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.6;
  margin-right: 0.3rem;
}
.donors-v {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--plane-color);
}

.atlas-action { display: flex; align-items: flex-start; justify-content: flex-end; }
.atlas-link {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--spec-rose);
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--spec-rose);
  border-radius: 2px;
  transition: background 0.15s, color 0.15s;
}
.atlas-link:hover { background: var(--spec-rose); color: #fff; }

/* ── Why ── */
.why, .safety { padding-top: 5rem; }
.why-rule {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.why-num {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 2.4rem;
  font-weight: 300;
  color: var(--spec-rose);
  line-height: 1;
}
.why-title {
  font-family: var(--spec-font-display);
  font-size: 1.6rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--spec-ink);
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}
@media (max-width: 720px) {
  .why-grid { grid-template-columns: 1fr; }
}
.why-cell h3 {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-rose);
  margin: 0 0 0.7rem;
}
.why-cell p {
  font-family: var(--spec-font-display);
  font-size: 0.98rem;
  font-weight: 300;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0;
}
.why-cell code {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  background: rgba(184, 71, 95, 0.08);
  padding: 0.05em 0.4em;
  border-radius: 2px;
  color: var(--spec-rose);
}

.safety-blurb {
  font-family: var(--spec-font-display);
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  max-width: 64ch;
  margin: 0;
  border-left: 2px solid var(--spec-rule);
  padding-left: 1.5rem;
}
.safety-blurb code {
  font-family: var(--spec-font-mono);
  font-size: 0.84rem;
  background: rgba(184, 71, 95, 0.08);
  padding: 0.05em 0.4em;
  border-radius: 2px;
  color: var(--spec-rose);
}

/* ── CTA ── */
.cta {
  margin-top: 5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--spec-rule);
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}
.btn-primary, .btn-ghost {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.7rem 1.2rem;
  border-radius: 2px;
  text-decoration: none;
  transition: all 0.15s;
}
.btn-primary {
  background: var(--spec-rose);
  color: #fff;
  border: 1px solid var(--spec-rose);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(184, 71, 95, 0.35); }
.btn-ghost {
  background: transparent;
  color: var(--spec-ink);
  border: 1px solid var(--spec-rule-strong);
}
.btn-ghost:hover { border-color: var(--spec-rose); color: var(--spec-rose); }
</style>
