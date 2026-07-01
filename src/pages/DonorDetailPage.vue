<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadDonorDetail } from '../lib/donors/loader'
import { blockSlug } from '../lib/unicode'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const donor = ref(await loadDonorDetail(slug.value))

useHead(() => ({
  title: donor.value
    ? `${donor.value.family} — Donor — Essenfont`
    : 'Donor — Essenfont',
  meta: [
    { property: 'og:title', content: donor.value?.family || 'Donor' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: `https://essenfont.github.io/donors/${slug.value}` }],
}))

interface CoverageRow {
  block: string
  plane: string
  plane_index: number | null
  plane_full: string
  range: string
  covered: number
  total: number
  pct: number
  source?: string
}

// Pull every coverage entry — from per-file all_coverage or family parsed_coverage.
const coverageRows = computed<CoverageRow[]>(() => {
  if (!donor.value) return []
  const rows: CoverageRow[] = []
  for (const f of donor.value.files) {
    for (const c of (f as any).all_coverage || []) {
      rows.push({ ...(c as CoverageRow), file_label: f.label })
    }
  }
  // Deduplicate by block (keep highest coverage)
  const byBlock = new Map<string, CoverageRow & { file_label?: string }>()
  for (const r of rows) {
    const existing = byBlock.get(r.block)
    if (!existing || r.covered > existing.covered) byBlock.set(r.block, r as any)
  }
  return Array.from(byBlock.values()).sort((a, b) => b.covered - a.covered)
})

function romanPlane(n: number | null): string {
  if (n === null) return '—'
  return ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'][n] || String(n)
}

function roleLabel(role: string): string {
  switch (role) {
    case 'primary': return 'Primary donor'
    case 'secondary': return 'Defense in depth'
    case 'redundant': return 'Redundant'
    default: return 'Donor'
  }
}

function relationshipLabel(rel: { kind: string; primary: string } | undefined): string {
  if (!rel) return null
  switch (rel.kind) {
    case 'redundant': return `Redundant with ${rel.primary} (primary)`
    case 'subsumed': return `Subsumed by ${rel.primary} (primary)`
    case 'secondary': return `Secondary to ${rel.primary} (primary)`
    default: return null
  }
}
</script>

<template>
  <div class="dd" v-if="donor">
    <!-- Accession banner: museum-label style header strip -->
    <div class="accession" :class="`accession--${donor.role}`">
      <div class="accession-inner">
        <span class="accession-mark">№</span>
        <span class="accession-role">{{ roleLabel(donor.role) }}</span>
        <span class="accession-sep">·</span>
        <span class="accession-planes" v-if="donor.planes?.length">
          {{ donor.planes.join(' · ') }}
        </span>
        <span class="accession-sep" v-if="donor.planes?.length">·</span>
        <span class="accession-license">{{ donor.license }}</span>
        <span class="accession-spacer"></span>
        <span class="accession-files" v-if="donor.files.length > 1">
          {{ donor.files.length }} files
        </span>
      </div>
    </div>

    <div class="dd-body">
      <nav class="dd-crumbs">
        <RouterLink to="/donors">Donors</RouterLink>
        <span class="dd-crumb-sep">/</span>
        <span class="dd-crumb-current">{{ donor.family }}</span>
      </nav>

      <!-- Title block -->
      <header class="dd-title">
        <h1>{{ donor.family }}</h1>
        <p class="dd-author" v-if="donor.author">{{ donor.author }}</p>
        <p class="dd-relationship" v-if="relationshipLabel(donor.relationship)">
          {{ relationshipLabel(donor.relationship) }}
        </p>
      </header>

      <!-- Coverage — the editorial specimen tray -->
      <section class="dd-section dd-coverage" v-if="coverageRows.length">
        <div class="dd-section-head">
          <span class="dd-section-num">I.</span>
          <h2>Coverage</h2>
          <span class="dd-section-meta">{{ coverageRows.length }} {{ coverageRows.length === 1 ? 'block' : 'blocks' }}</span>
        </div>

        <p class="dd-section-lede" v-if="donor.role === 'secondary'">
          This donor provides <strong>defense-in-depth</strong> coverage — it
          ships the same blocks as a primary donor (or a subset thereof).
          Listed for completeness and source provenance.
        </p>
        <p class="dd-section-lede" v-else>
          Each row below shows what fraction of the block this donor
          contributes. Click a block to see its characters rendered.
        </p>

        <ol class="coverage-list">
          <li
            v-for="row in coverageRows"
            :key="row.block"
            class="coverage-row"
            :class="{ 'coverage-row--zero': row.covered === 0 }"
          >
            <div class="coverage-block">
              <RouterLink :to="`/unicode/block/${blockSlug(row.block)}`" class="coverage-block-name">
                {{ row.block }}
              </RouterLink>
              <span class="coverage-plane">
                <span class="coverage-plane-code">{{ row.plane }}</span>
                <span class="coverage-plane-roman">{{ romanPlane(row.plane_index) }}</span>
              </span>
            </div>

            <div class="coverage-range">{{ row.range }}</div>

            <div class="coverage-bar-wrap">
              <div class="coverage-bar">
                <div
                  class="coverage-bar-fill"
                  :class="`fill--${donor.role}`"
                  :style="{ width: Math.max(row.pct, row.covered > 0 ? 2 : 0) + '%' }"
                ></div>
              </div>
              <div class="coverage-count">
                <span class="coverage-count-covered">{{ row.covered.toLocaleString() }}</span>
                <span class="coverage-count-sep">/</span>
                <span class="coverage-count-total">{{ row.total.toLocaleString() }}</span>
              </div>
              <div class="coverage-pct">{{ row.pct }}%</div>
            </div>
          </li>
        </ol>
      </section>

      <!-- Why we chose this donor -->
      <section class="dd-section" v-if="donor.notes || donor.author_note">
        <div class="dd-section-head">
          <span class="dd-section-num">II.</span>
          <h2>Why this donor</h2>
        </div>
        <p v-if="donor.notes" class="dd-prose">{{ donor.notes }}</p>
        <p v-if="donor.author_note" class="dd-prose dd-prose-note">{{ donor.author_note }}</p>
      </section>

      <!-- License conditions -->
      <section class="dd-section dd-license-section" v-if="donor.license_category === 'accepted_with_conditions'">
        <div class="dd-section-head">
          <span class="dd-section-num">III.</span>
          <h2>License conditions</h2>
          <span class="dd-section-meta dd-meta-warn">restrictive</span>
        </div>
        <p v-if="donor.license_summary" class="dd-prose">{{ donor.license_summary }}</p>
        <figure v-if="donor.license_statement" class="dd-statement">
          <figcaption>Full statement</figcaption>
          <pre>{{ donor.license_statement }}</pre>
        </figure>
      </section>

      <!-- Files -->
      <section class="dd-section">
        <div class="dd-section-head">
          <span class="dd-section-num" v-if="donor.license_category !== 'accepted_with_conditions'">III.</span>
          <span class="dd-section-num" v-else>IV.</span>
          <h2>Font files</h2>
          <span class="dd-section-meta">{{ donor.files.length }} {{ donor.files.length === 1 ? 'file' : 'files' }}</span>
        </div>
        <p class="dd-section-lede" v-if="donor.files.length > 1">
          This donor ships as multiple files — each covering a Unicode
          plane or extension.
        </p>
        <div class="dd-files">
          <article
            v-for="f in donor.files"
            :key="f.label"
            class="dd-file"
            :class="{ 'dd-file--disabled': !f.enabled }"
          >
            <header class="dd-file-head">
              <code class="dd-file-label">{{ f.label }}</code>
              <span class="dd-file-style" v-if="f.style">{{ f.style }}</span>
              <span class="dd-file-version" v-if="f.version">v{{ f.version }}</span>
              <span class="dd-file-disabled-tag" v-if="!f.enabled">disabled</span>
            </header>
            <dl class="dd-file-meta">
              <dt>path</dt>
              <dd><code>{{ f.file }}</code></dd>
              <dt>sha-256</dt>
              <dd><code class="dd-sha">{{ f.sha256 }}</code></dd>
            </dl>
            <p class="dd-file-notes" v-if="f.notes">{{ f.notes }}</p>
            <div class="dd-file-links">
              <a v-if="f.url" :href="f.url" target="_blank" rel="noopener">download ↗</a>
              <a v-if="f.url_mirror" :href="f.url_mirror" target="_blank" rel="noopener">mirror ↗</a>
            </div>
          </article>
        </div>
      </section>

      <!-- Upstream -->
      <section class="dd-section dd-upstream" v-if="donor.web || donor.url || donor.url_mirror">
        <div class="dd-section-head">
          <span class="dd-section-num">V.</span>
          <h2>Upstream</h2>
        </div>
        <ul class="dd-upstream-list">
          <li v-if="donor.web">
            <span class="dd-upstream-label">project</span>
            <a :href="donor.web" target="_blank" rel="noopener">{{ donor.web }}</a>
          </li>
          <li v-if="donor.url">
            <span class="dd-upstream-label">download</span>
            <a :href="donor.url" target="_blank" rel="noopener">{{ donor.url }}</a>
          </li>
          <li v-if="donor.url_mirror">
            <span class="dd-upstream-label">mirror</span>
            <a :href="donor.url_mirror" target="_blank" rel="noopener">{{ donor.url_mirror }}</a>
          </li>
        </ul>
      </section>
    </div>
  </div>

  <div v-else class="container dd-empty">
    <p>Donor "{{ slug }}" not found.</p>
    <RouterLink to="/donors">← All donors</RouterLink>
  </div>
</template>

<style scoped>
.dd {
  max-width: 880px;
  margin: 0 auto;
  padding: 0 0 4rem;
}

/* ── Accession banner ── */
.accession {
  border-bottom: 1px solid var(--spec-rule);
  background: var(--vp-c-bg-soft);
}
.accession--secondary,
.accession--redundant {
  background: linear-gradient(
    to right,
    rgba(107, 122, 63, 0.08),
    rgba(107, 122, 63, 0.02)
  );
  border-bottom-color: rgba(107, 122, 63, 0.3);
}
.accession-inner {
  max-width: 880px;
  margin: 0 auto;
  padding: 0.65rem 1.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-mute);
}
.accession-mark {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--spec-rose);
  letter-spacing: 0;
  text-transform: none;
}
.accession-role {
  color: var(--spec-ink);
}
.accession--secondary .accession-role,
.accession--redundant .accession-role {
  color: #6b7a3f;
}
.accession-sep { opacity: 0.4; }
.accession-spacer { flex: 1; }
.accession-files { color: var(--spec-mute); }

/* ── Body ── */
.dd-body { padding: 0 1.5rem; }

.dd-crumbs {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute);
  padding-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.dd-crumbs a { color: var(--spec-rose); text-decoration: none; }
.dd-crumbs a:hover { text-decoration: underline; }
.dd-crumb-sep { opacity: 0.5; }
.dd-crumb-current { color: var(--spec-ink); }

/* ── Title ── */
.dd-title {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--spec-rose);
}
.dd-title h1 {
  font-family: var(--spec-font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0 0 0.4rem;
  color: var(--spec-ink);
  font-variant-numeric: oldstyle-nums;
}
.dd-author {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--spec-ink-soft);
  margin: 0;
  line-height: 1.4;
}
.dd-relationship {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: #6b7a3f;
  margin: 0.5rem 0 0;
  letter-spacing: 0.02em;
}

/* ── Section heads ── */
.dd-section { margin-bottom: 2.5rem; }
.dd-section-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--spec-rule);
}
.dd-section-num {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 1rem;
  font-weight: 500;
  color: var(--spec-rose);
  letter-spacing: 0;
  min-width: 1.5rem;
}
.dd-section-head h2 {
  font-family: var(--spec-font-display);
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--spec-ink);
  margin: 0;
  letter-spacing: -0.01em;
  flex: 1;
}
.dd-section-meta {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--spec-mute);
}
.dd-meta-warn {
  color: #b8475f;
}
.dd-section-lede {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--spec-ink-soft);
  margin: 0 0 1.25rem;
  max-width: 640px;
}
.dd-section-lede strong { color: var(--spec-ink); font-weight: 600; }

/* ── Coverage list ── */
.coverage-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.coverage-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) auto minmax(200px, 1.6fr);
  gap: 1.25rem;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--spec-rule);
}
.coverage-row:last-child { border-bottom: none; }
.coverage-row--zero { opacity: 0.45; }

.coverage-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}
.coverage-block-name {
  font-family: var(--spec-font-display);
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--spec-ink);
  text-decoration: none;
  letter-spacing: -0.005em;
  line-height: 1.2;
}
.coverage-block-name:hover { color: var(--spec-rose); text-decoration: underline; }
.coverage-plane {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  font-family: var(--spec-font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spec-mute);
}
.coverage-plane-code { font-weight: 600; color: var(--spec-rose); }
.coverage-plane-roman {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 0.78rem;
  letter-spacing: 0;
  text-transform: none;
  color: var(--spec-mute);
}

.coverage-range {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-ink-soft);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.coverage-bar-wrap {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
}
.coverage-bar {
  height: 4px;
  background: var(--spec-rule);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}
.coverage-bar-fill {
  height: 100%;
  background: var(--spec-rose);
  transition: width 0.3s ease;
}
.fill--secondary,
.fill--redundant {
  background: #6b7a3f;
}
.coverage-count {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.coverage-count-covered { font-weight: 600; }
.coverage-count-sep { color: var(--spec-mute); margin: 0 0.1rem; }
.coverage-count-total { color: var(--spec-mute); }
.coverage-pct {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute);
  font-variant-numeric: tabular-nums;
  min-width: 3.5rem;
  text-align: right;
}

/* ── Prose ── */
.dd-prose {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--spec-ink-soft);
  margin: 0 0 0.8rem;
  max-width: 640px;
}
.dd-prose strong { color: var(--spec-ink); font-weight: 600; }
.dd-prose-note {
  font-style: italic;
  color: var(--spec-mute);
}

.dd-statement {
  margin: 1rem 0 0;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border-left: 3px solid var(--spec-rose);
  border-radius: 4px;
}
.dd-statement figcaption {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--spec-mute);
  margin-bottom: 0.5rem;
}
.dd-statement pre {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  color: var(--spec-ink);
}

/* ── Files ── */
.dd-files { display: flex; flex-direction: column; gap: 0.75rem; }
.dd-file {
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
}
.dd-file--disabled {
  opacity: 0.6;
  border-left: 3px solid var(--spec-mute);
}
.dd-file-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}
.dd-file-label {
  font-family: var(--spec-font-mono);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--spec-rose);
}
.dd-file-style,
.dd-file-version {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute);
}
.dd-file-disabled-tag {
  font-family: var(--spec-font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  background: var(--spec-mute);
  color: #fff;
}
.dd-file-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.3rem 0.75rem;
  margin: 0.5rem 0;
  font-size: 0.8rem;
}
.dd-file-meta dt {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--spec-mute);
  align-self: baseline;
}
.dd-file-meta dd { margin: 0; }
.dd-file-meta dd code {
  font-family: var(--spec-font-mono);
  font-size: 0.76rem;
  color: var(--spec-ink-soft);
  word-break: break-all;
}
.dd-sha { font-size: 0.72rem; color: var(--spec-mute); }
.dd-file-notes {
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--spec-ink-soft);
  margin: 0.6rem 0 0.5rem;
}
.dd-file-links {
  display: flex;
  gap: 1rem;
  margin-top: 0.4rem;
}
.dd-file-links a {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  color: var(--spec-rose);
  text-decoration: none;
  text-transform: lowercase;
}
.dd-file-links a:hover { text-decoration: underline; }

/* ── Upstream ── */
.dd-upstream-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.dd-upstream-list li {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--spec-rule);
  align-items: baseline;
}
.dd-upstream-list li:last-child { border-bottom: none; }
.dd-upstream-label {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--spec-mute);
}
.dd-upstream-list a {
  font-family: var(--spec-font-mono);
  font-size: 0.8rem;
  color: var(--spec-rose);
  text-decoration: none;
  word-break: break-all;
}
.dd-upstream-list a:hover { text-decoration: underline; }

/* ── Empty state ── */
.dd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 0.5rem;
  color: var(--spec-mute);
}

/* ── Responsive ── */
@media (max-width: 720px) {
  .coverage-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.75rem 0;
  }
  .coverage-bar-wrap {
    grid-template-columns: 1fr auto;
  }
  .coverage-pct { display: none; }
  .accession-inner { flex-wrap: wrap; }
}
</style>