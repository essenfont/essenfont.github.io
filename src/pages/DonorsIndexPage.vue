<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadDonorsIndex } from '../lib/donors/loader'
import { blockSlug } from '../lib/unicode'
import type { DonorsIndex, DonorFamilySummary } from '../lib/donors/loader'

const index = ref<DonorsIndex | null>(null)
index.value = await loadDonorsIndex()

type FamilyWithRole = DonorFamilySummary & {
  role: string
  planes: string[]
  parsed_coverage_count: number
}

const families = computed<FamilyWithRole[]>(() => {
  if (!index.value) return []
  return ([...index.value.families] as FamilyWithRole[])
    .sort((a, b) => {
      // Primary donors first, then by family name
      if (a.role === 'primary' && b.role !== 'primary') return -1
      if (a.role !== 'primary' && b.role === 'primary') return 1
      return a.family.localeCompare(b.family)
    })
})

const primaryCount = computed(() => families.value.filter((f) => f.role === 'primary').length)
const secondaryCount = computed(() => families.value.filter((f) => f.role === 'secondary').length)

function licenseBadgeClass(license: string): string {
  if (!index.value) return ''
  if (index.value.license_policy.ofl_compatible.includes(license)) return 'license-ofl'
  if (index.value.license_policy.accepted_with_conditions.includes(license)) return 'license-conditional'
  return 'license-unknown'
}

function roleLabel(role: string): string {
  switch (role) {
    case 'primary': return 'Primary'
    case 'secondary': return 'Defense in depth'
    case 'redundant': return 'Redundant'
    default: return 'Donor'
  }
}
</script>

<template>
  <div class="container di">
    <header class="di-header">
      <RouterLink to="/" class="di-back">← Home</RouterLink>
      <h1>Donor fonts</h1>
      <p class="lede">
        Essenfont is <strong>donor-derived</strong> — every glyph is extracted
        from a canonical Tier&nbsp;1 donor font. No hand-designed UFO source.
        Corrections flow upstream to the donor, then back via the next
        version bump.
      </p>
    </header>

    <section v-if="index" class="di-stats">
      <div class="stat">
        <span class="stat-num">{{ families.length }}</span>
        <span class="stat-label">donor families</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ primaryCount }}</span>
        <span class="stat-label">primary</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ secondaryCount }}</span>
        <span class="stat-label">defense in depth</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ families.reduce((s, f) => s + f.file_count, 0) }}</span>
        <span class="stat-label">font files</span>
      </div>
    </section>

    <section class="di-flow">
      <h2>How donors become Essenfont</h2>
      <p class="di-flow-lede">
        Every glyph in Essenfont comes from one of two donor paths. The
        build pipeline rejects anything not on the OFL allowlist and
        partitions every codepoint into one of five plane subfonts.
      </p>
      <div class="di-flow-diagram">
        <div class="flow-col">
          <div class="flow-col-head">
            <span class="flow-roman">α</span>
            <span class="flow-col-title">manifest.yml</span>
          </div>
          <div class="flow-cell flow-cell--source">
            <span class="flow-cell-label">sources/</span>
            <span class="flow-cell-meta">138 declared donors · OFL allowlist</span>
          </div>
        </div>

        <div class="flow-arrow">→</div>

        <div class="flow-col">
          <div class="flow-col-head">
            <span class="flow-roman">β</span>
            <span class="flow-col-title">Two extraction paths</span>
          </div>
          <div class="flow-cell flow-cell--font">
            <span class="flow-tag">Tier I · font</span>
            <span class="flow-cell-body">Noto · Full-Sung · UniHieroglyphica · Lentariso · Kedebideri</span>
            <span class="flow-cell-meta">fontisan reads cmap + glyf</span>
          </div>
          <div class="flow-cell flow-cell--chart">
            <span class="flow-tag">Tier II · code chart</span>
            <span class="flow-cell-body">Gurung Khema · Khitan Small · Kirat Rai · Tulu Tigalari</span>
            <span class="flow-cell-meta">Unicode Consortium PDF → synthetic outlines</span>
          </div>
        </div>

        <div class="flow-arrow">→</div>

        <div class="flow-col">
          <div class="flow-col-head">
            <span class="flow-roman">γ</span>
            <span class="flow-col-title">Essenfont OTC</span>
          </div>
          <div class="flow-cell flow-cell--otc">
            <span class="flow-planes">
              <span class="flow-plane">BMP</span>
              <span class="flow-plane">SMP</span>
              <span class="flow-plane">SIP</span>
              <span class="flow-plane">TIP</span>
              <span class="flow-plane">SSP</span>
            </span>
            <span class="flow-cell-meta">5 plane subfonts · 65,535 glyphs each</span>
          </div>
        </div>
      </div>
      <p class="di-flow-foot">
        Corrections never land in Essenfont directly — they flow upstream
        to the donor, then back via the next version bump. See
        <RouterLink to="/docs/architecture">Architecture</RouterLink> for the
        build pipeline and <RouterLink to="/about">About</RouterLink> for the
        rationale.
      </p>
    </section>

    <section class="di-grid">
      <RouterLink
        v-for="fam in families"
        :key="fam.slug"
        :to="`/donors/${fam.slug}`"
        class="donor-card"
        :class="`card--${fam.role || 'unknown'}`"
      >
        <div class="donor-card-head">
          <span class="donor-family">{{ fam.family }}</span>
          <span class="donor-role-tag" :class="`tag--${fam.role || 'unknown'}`">
            {{ roleLabel(fam.role || 'unknown') }}
          </span>
        </div>
        <div class="donor-author">{{ fam.author }}</div>
        <div class="donor-meta">
          <span v-if="fam.planes?.length" class="donor-planes">
            {{ fam.planes.join(' · ') }}
          </span>
          <span v-if="fam.planes?.length" class="dot">·</span>
          <span>{{ fam.file_count }} {{ fam.file_count === 1 ? 'file' : 'files' }}</span>
          <span class="dot">·</span>
          <span>{{ fam.parsed_coverage_count || fam.covers_count }} {{ (fam.parsed_coverage_count || fam.covers_count) === 1 ? 'block' : 'blocks' }}</span>
        </div>
        <div class="donor-license-line">
          <span class="donor-license-badge" :class="licenseBadgeClass(fam.license)">
            {{ fam.license }}
          </span>
          <span class="donor-first" v-if="fam.first_cover">
            covers <code>{{ blockSlug(fam.first_cover) }}</code>
            <span v-if="(fam.parsed_coverage_count || fam.covers_count) > 1"> +</span>
          </span>
        </div>
      </RouterLink>
    </section>

    <section class="di-policy" v-if="index">
      <h2>License policy</h2>
      <p>
        The build refuses any donor whose license isn't on the allowlist.
        The assembled TTF is OFL 1.1; donor restrictions more stringent
        than OFL (currently only <code>FSung-NC</code>) propagate into the
        font's <code>name</code> table and into LICENSE-SOURCES.md.
      </p>
      <div class="policy-grid">
        <div class="policy-card policy-ofl">
          <h3>OFL-compatible ({{ index.license_policy.ofl_compatible.length }})</h3>
          <p>Redistributable under OFL without additional restrictions.</p>
          <ul>
            <li v-for="l in index.license_policy.ofl_compatible" :key="l"><code>{{ l }}</code></li>
          </ul>
        </div>
        <div class="policy-card policy-conditional">
          <h3>With conditions ({{ index.license_policy.accepted_with_conditions.length }})</h3>
          <p>Redistributable but imposes extra terms that survive into the output font.</p>
          <ul>
            <li v-for="l in index.license_policy.accepted_with_conditions" :key="l"><code>{{ l }}</code></li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.di { padding: 2rem 1.5rem 4rem; max-width: 1100px; }

.di-header { margin-bottom: 2rem; }
.di-back {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-rose);
  text-decoration: none;
}
.di-back:hover { text-decoration: underline; }
.di-header h1 {
  font-family: var(--spec-font-display);
  font-size: 2.4rem;
  font-weight: 500;
  margin: 0.3rem 0 0.5rem;
  color: var(--spec-ink);
  letter-spacing: -0.025em;
}
.lede {
  font-size: 1.02rem;
  line-height: 1.65;
  color: var(--spec-ink-soft);
  margin: 0;
  max-width: 720px;
}
.lede strong { color: var(--spec-ink); font-weight: 600; }

.di-stats {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
  padding: 1.25rem 0;
  margin-bottom: 2rem;
  border-top: 1px solid var(--spec-rule);
  border-bottom: 1px solid var(--spec-rule);
}
.stat { display: flex; flex-direction: column; gap: 0.1rem; }
.stat-num {
  font-family: var(--spec-font-display);
  font-size: 1.8rem;
  font-weight: 500;
  color: var(--spec-rose);
  letter-spacing: -0.02em;
  font-variant-numeric: oldstyle-nums;
  line-height: 1;
}
.stat-label {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--spec-mute);
}

.di-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
}
.donor-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.4rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-left: 3px solid var(--spec-rose);
  border-radius: 6px;
  text-decoration: none;
  transition: border-left-color 0.15s, transform 0.15s, box-shadow 0.15s;
}
.donor-card.card--secondary,
.donor-card.card--redundant {
  border-left-color: #6b7a3f;
  background: linear-gradient(
    to bottom right,
    rgba(107, 122, 63, 0.04),
    var(--vp-c-bg-soft)
  );
}
.donor-card:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  text-decoration: none;
}
.donor-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.donor-family {
  font-family: var(--spec-font-display);
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--spec-ink);
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.donor-role-tag {
  font-family: var(--spec-font-mono);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.18rem 0.4rem;
  border-radius: 2px;
  border: 1px solid;
  white-space: nowrap;
  flex-shrink: 0;
}
.tag--primary {
  color: var(--spec-rose);
  border-color: var(--spec-rose);
  background: var(--vp-c-brand-soft);
}
.tag--secondary,
.tag--redundant {
  color: #6b7a3f;
  border-color: #6b7a3f;
  background: rgba(107, 122, 63, 0.08);
}
.tag--unknown {
  color: var(--spec-mute);
  border-color: var(--spec-rule-strong);
}
.donor-author {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--spec-ink-soft);
  line-height: 1.4;
}
.donor-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-mute);
  flex-wrap: wrap;
}
.donor-meta .dot { opacity: 0.4; }
.donor-planes { color: var(--spec-rose); font-weight: 600; letter-spacing: 0.08em; }

.donor-license-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.4rem;
  border-top: 1px solid var(--spec-rule);
  flex-wrap: wrap;
}
.donor-license-badge {
  font-family: var(--spec-font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
  border: 1px solid;
}
.license-ofl {
  color: #2a7a3f;
  border-color: #2a7a3f;
  background: rgba(42,122,63,0.08);
}
.license-conditional {
  color: #b8475f;
  border-color: #b8475f;
  background: rgba(184,71,95,0.08);
}
.license-unknown {
  color: var(--spec-mute);
  border-color: var(--spec-rule-strong);
}
.donor-first {
  font-size: 0.74rem;
  color: var(--spec-mute);
}
.donor-first code {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  background: var(--vp-c-bg);
  padding: 0.05rem 0.3rem;
  border-radius: 2px;
  border: 1px solid var(--spec-rule);
}

/* ── Build flow diagram ── */
.di-flow {
  margin-bottom: 3rem;
  padding: 1.5rem 1.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 8px;
}
.di-flow h2 {
  font-family: var(--spec-font-display);
  font-size: 1.35rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: var(--spec-ink);
  letter-spacing: -0.015em;
}
.di-flow-lede {
  font-size: 0.94rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  max-width: 70ch;
  margin: 0 0 1.5rem;
}
.di-flow-diagram {
  display: grid;
  grid-template-columns: 1fr auto 1.4fr auto 1fr;
  align-items: stretch;
  gap: 0.6rem;
  margin: 1rem 0 0.5rem;
}
.flow-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}
.flow-col-head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--spec-rule);
  margin-bottom: 0.3rem;
}
.flow-roman {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 1.3rem;
  font-weight: 300;
  color: var(--spec-rose);
  line-height: 1;
}
.flow-col-title {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--spec-ink);
}
.flow-cell {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--spec-rule);
  background: var(--vp-c-bg);
  min-height: 90px;
}
.flow-cell--source {
  border-left: 3px solid var(--spec-rose);
}
.flow-cell--font {
  border-left: 3px solid #2a7a3f;
}
.flow-cell--chart {
  border-left: 3px solid #b8762a;
}
.flow-cell--otc {
  border-left: 3px solid var(--spec-rose);
  background: rgba(184, 71, 95, 0.04);
  flex: 1;
}
.flow-cell-label {
  font-family: var(--spec-font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--spec-ink);
}
.flow-tag {
  font-family: var(--spec-font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--spec-rose);
  padding: 0.15rem 0.4rem;
  border: 1px solid currentColor;
  border-radius: 2px;
  align-self: flex-start;
}
.flow-cell--font .flow-tag { color: #2a7a3f; }
.flow-cell--chart .flow-tag { color: #b8762a; }
.flow-cell-body {
  font-family: var(--spec-font-display);
  font-size: 0.84rem;
  line-height: 1.4;
  color: var(--spec-ink);
}
.flow-cell-meta {
  font-family: var(--spec-font-mono);
  font-size: 0.66rem;
  color: var(--spec-mute);
  line-height: 1.4;
}
.flow-planes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.2rem;
}
.flow-plane {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.45rem;
  border-radius: 2px;
  background: rgba(184, 71, 95, 0.12);
  color: var(--spec-rose);
  border: 1px solid rgba(184, 71, 95, 0.4);
}
.flow-arrow {
  display: flex;
  align-items: center;
  font-family: var(--spec-font-mono);
  font-size: 1.4rem;
  font-weight: 300;
  color: var(--spec-rose);
  opacity: 0.5;
  padding: 0 0.1rem;
}
.di-flow-foot {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 1rem 0 0;
  font-style: italic;
}
.di-flow-foot a {
  color: var(--spec-rose);
  text-decoration: none;
}
.di-flow-foot a:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .di-flow-diagram {
    grid-template-columns: 1fr;
  }
  .flow-arrow {
    transform: rotate(90deg);
    justify-self: center;
    padding: 0.4rem 0;
  }
}

.di-policy { margin-top: 2rem; }
.di-policy h2 {
  font-family: var(--spec-font-display);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--spec-ink);
  margin: 0 0 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--spec-rule);
  letter-spacing: -0.015em;
}
.di-policy > p {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0 0 1rem;
  max-width: 720px;
}
.di-policy code {
  font-family: var(--spec-font-mono);
  font-size: 0.84rem;
  background: var(--vp-c-bg-soft);
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  border: 1px solid var(--spec-rule);
}
.policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.policy-card {
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
}
.policy-card.policy-ofl { border-left: 3px solid #2a7a3f; }
.policy-card.policy-conditional { border-left: 3px solid var(--spec-rose); }
.policy-card h3 {
  font-family: var(--spec-font-display);
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.3rem;
  color: var(--spec-ink);
}
.policy-card p {
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--spec-ink-soft);
  margin: 0 0 0.5rem;
}
.policy-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.policy-card li code {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  background: var(--vp-c-bg);
  padding: 0.1rem 0.4rem;
  border-radius: 2px;
  border: 1px solid var(--spec-rule);
}

@media (max-width: 640px) {
  .donor-card { padding: 1rem; }
  .donor-family { font-size: 1rem; }
}
</style>