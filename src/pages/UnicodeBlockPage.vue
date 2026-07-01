<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import {
  loadAllBlocks, loadBlockCharacters, blockDisplayName, hexCp, scriptGroup, charRoute,
} from '../lib/unicode'
import type { UnicodeBlock } from '../lib/unicode'
import { fetchJson } from '../lib/ssr-fetch'
import UnicodeBlockGrid from '../lib/unicode/components/UnicodeBlockGrid.vue'

const route = useRoute()
const router = useRouter()
const blockSlugParam = computed(() => route.params.blockSlug as string)

const block = ref<UnicodeBlock | null>(null)
const characters = ref<any[]>([])
const coveredSet = ref<Set<number> | null>(null)
const coverageSummary = ref<{
  covered_count: number
  assigned_count: number
  uncovered_count: number
  unassigned_count: number
  total_range: number
  pct: number
  status: string
} | null>(null)
const showOnlyMissing = ref(false)

const blockWithChars = computed(() => {
  if (!block.value) return null
  let chars = characters.value
  if (showOnlyMissing.value && coveredSet.value) {
    chars = chars.filter((c: any) => !coveredSet.value!.has(c.cp))
  }
  return { ...block.value, characters: chars, assignedCount: characters.value.length }
})

const isPrivateUse = computed(() =>
  block.value?.name.toLowerCase().includes('private use') ?? false
)
const isReserved = computed(() => {
  if (!block.value) return false
  const name = block.value.name.toLowerCase()
  return name.includes('private use') ||
    name.includes('specials') ||
    name.includes('surrogates') ||
    name.includes('variation selectors supplement')
})

const missingCount = computed(() => {
  // REAL gaps = assigned by Unicode but not in the font.
  // Unassigned codepoints are NOT gaps — they're empty slots Unicode
  // left for future expansion.
  return coverageSummary.value?.uncovered_count ?? 0
})

async function loadData() {
  const allBlocks = await loadAllBlocks()
  const found = allBlocks.find(b => {
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return slug === blockSlugParam.value
  })
  if (found) {
    block.value = found
    characters.value = await loadBlockCharacters(found.name)
    try {
      const slug = blockSlugParam.value
      const data = await fetchJson<{
        covered: number[]
        covered_count: number
        assigned_count: number
        uncovered_count: number
        unassigned_count: number
        total_range: number
        pct: number
        status: string
      }>(`coverage/${slug}.json`)
      coveredSet.value = new Set(data.covered)
      coverageSummary.value = {
        covered_count: data.covered_count,
        assigned_count: data.assigned_count,
        uncovered_count: data.uncovered_count,
        unassigned_count: data.unassigned_count,
        total_range: data.total_range,
        pct: data.pct,
        status: data.status,
      }
    } catch {
      coveredSet.value = null
      coverageSummary.value = null
    }
  } else {
    block.value = null
  }
}

await loadData()
watch(blockSlugParam, loadData)

useHead(() => ({
  title: block.value
    ? `${blockDisplayName(block.value.name)} — Unicode Block — Essenfont`
    : 'Unicode Block — Essenfont',
  meta: [
    { property: 'og:title', content: block.value ? blockDisplayName(block.value.name) : 'Unicode Block' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: `https://essenfont.github.io/unicode/block/${blockSlugParam.value}` }],
}))

function goToChar(cp: number) {
  router.push(charRoute(cp))
}
</script>

<template>
  <div class="container ubp" v-if="block">
    <header class="ubp-head">
      <RouterLink to="/unicode" class="ubp-back">← Unicode Browser</RouterLink>
      <h1>{{ blockDisplayName(block.name) }}</h1>
      <span class="ubp-meta">{{ hexCp(block.start) }}–{{ hexCp(block.end) }} · {{ characters.length }} assigned characters</span>
    </header>

    <div class="ubp-script">{{ scriptGroup(block.name) }}</div>

    <div class="ubp-script">{{ scriptGroup(block.name) }}</div>

    <!-- Coverage summary — three-way classification -->
    <div class="ubp-coverage" v-if="coverageSummary && !isReserved">
      <div class="ubp-cov-bar">
        <div class="ubp-cov-num">
          <span class="ubp-cov-covered">{{ coverageSummary.covered_count.toLocaleString() }}</span>
          <span class="ubp-cov-sep">/</span>
          <span class="ubp-cov-assigned">{{ coverageSummary.assigned_count.toLocaleString() }}</span>
          <span class="ubp-cov-label">assigned codepoints covered</span>
        </div>
        <div class="ubp-cov-meter">
          <div class="ubp-cov-fill" :style="{ width: Math.max(coverageSummary.pct, 0.5) + '%' }"></div>
        </div>
        <div class="ubp-cov-pct">{{ coverageSummary.pct.toFixed(1) }}%</div>
        <button
          v-if="missingCount > 0"
          class="ubp-cov-filter"
          :class="{ active: showOnlyMissing }"
          @click="showOnlyMissing = !showOnlyMissing"
        >
          {{ showOnlyMissing ? '✓ ' : '' }}{{ missingCount }} real gap{{ missingCount === 1 ? '' : 's' }}
        </button>
      </div>

      <!-- Three-way breakdown -->
      <div class="ubp-cov-breakdown">
        <div class="ubp-cb-item ubp-cb-covered">
          <span class="ubp-cb-mark">✓</span>
          <span class="ubp-cb-num">{{ coverageSummary.covered_count.toLocaleString() }}</span>
          <span class="ubp-cb-label">covered<br /><small>Unicode assigned + essenfont has glyph</small></span>
        </div>
        <div class="ubp-cb-item ubp-cb-gap" :class="{ 'ubp-cb-zero': coverageSummary.uncovered_count === 0 }">
          <span class="ubp-cb-mark">✗</span>
          <span class="ubp-cb-num">{{ coverageSummary.uncovered_count.toLocaleString() }}</span>
          <span class="ubp-cb-label">real gap{{ coverageSummary.uncovered_count === 1 ? '' : 's' }}<br /><small>assigned + essenfont <strong>missing</strong> — needs donor</small></span>
        </div>
        <div class="ubp-cb-item ubp-cb-unassigned" :class="{ 'ubp-cb-zero': coverageSummary.unassigned_count === 0 }">
          <span class="ubp-cb-mark">—</span>
          <span class="ubp-cb-num">{{ coverageSummary.unassigned_count.toLocaleString() }}</span>
          <span class="ubp-cb-label">unassigned<br /><small>Unicode hasn't assigned — <strong>not a gap</strong></small></span>
        </div>
      </div>
    </div>

    <div class="ubp-reserved-notice" v-if="isReserved">
      <span class="ubp-reserved-tag">Reserved by Unicode</span>
      <h2>{{ block.name }}</h2>
      <p>
        Codepoints in this range are <strong>not assigned</strong> by the
        Unicode Standard. This block is reserved by design — for private
        use (PUA), format controls (Specials), encoding mechanics
        (Surrogates), or similar non-character purposes.
      </p>
      <p>
        Essenfont <strong>intentionally does not cover</strong> reserved
        blocks. They are not gaps in coverage; they are empty by
        specification. No tofu here — there is simply nothing to render.
      </p>
    </div>

    <div class="ubp-pua-notice" v-else-if="isPrivateUse && characters.length === 0">
      <h2>Private Use Area — No Assigned Characters</h2>
      <p>
        Codepoints in this range are <strong>not assigned</strong> by the Unicode Standard.
        They are reserved for private, corporate, or application-specific use.
      </p>
      <p>
        Font developers and organizations may define their own glyphs here, but these
        assignments are not portable across systems.
      </p>
    </div>

    <UnicodeBlockGrid
      v-else-if="blockWithChars"
      :block="blockWithChars"
      :covered-set="coveredSet"
      :max-chars="2000"
      @select="goToChar"
    />
  </div>

  <div v-else class="container ubp-loading">Block "{{ blockSlugParam }}" not found.</div>
</template>

<style scoped>
.ubp { padding: 1.5rem 1.5rem 4rem; max-width: 1200px; }
.ubp-head {
  display: flex; align-items: baseline; gap: 1rem; flex-wrap: wrap;
  margin-bottom: 0.5rem; padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--spec-rose);
}
.ubp-back {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-rose);
  text-decoration: none;
}
.ubp-back:hover { text-decoration: underline; }
.ubp-head h1 {
  font-family: var(--spec-font-display);
  font-size: 1.6rem; font-weight: 500; margin: 0;
  color: var(--spec-ink);
  letter-spacing: -0.01em;
}
.ubp-meta {
  font-size: 0.78rem;
  font-family: var(--spec-font-mono);
  color: var(--spec-mute);
  margin-left: auto;
}
.ubp-script {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--spec-rose);
  margin-bottom: 1rem;
}

/* Coverage summary — three-way classification */
.ubp-coverage {
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
}
.ubp-cov-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.ubp-cov-num {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  font-family: var(--spec-font-mono);
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
}
.ubp-cov-covered { font-weight: 700; color: var(--spec-rose); }
.ubp-cov-sep { color: var(--spec-mute); }
.ubp-cov-assigned { color: var(--spec-mute); }
.ubp-cov-label {
  margin-left: 0.4rem;
  font-family: var(--spec-font-body);
  font-size: 0.8rem;
  color: var(--spec-ink-soft);
}
.ubp-cov-meter {
  flex: 1;
  min-width: 100px;
  height: 5px;
  background: var(--spec-rule);
  border-radius: 3px;
  overflow: hidden;
}
.ubp-cov-fill {
  height: 100%;
  background: var(--spec-rose);
  transition: width 0.3s;
}
.ubp-cov-pct {
  font-family: var(--spec-font-mono);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--spec-ink);
  font-variant-numeric: tabular-nums;
  min-width: 3.5rem;
  text-align: right;
}
.ubp-cov-filter {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  background: var(--vp-c-bg);
  color: var(--spec-rose);
  border: 1px solid var(--spec-rose);
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.ubp-cov-filter:hover { background: var(--vp-c-brand-soft); }
.ubp-cov-filter.active { background: var(--spec-rose); color: #fff; }

/* Three-way breakdown row */
.ubp-cov-breakdown {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--spec-rule);
}
.ubp-cb-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
}
.ubp-cb-covered { background: rgba(184, 71, 95, 0.04); }
.ubp-cb-gap { background: rgba(184, 71, 95, 0.10); }
.ubp-cb-unassigned { background: rgba(170, 166, 160, 0.08); }
.ubp-cb-zero { opacity: 0.4; }
.ubp-cb-mark {
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1;
}
.ubp-cb-covered .ubp-cb-mark { color: var(--spec-rose); }
.ubp-cb-gap .ubp-cb-mark { color: var(--spec-rose); }
.ubp-cb-unassigned .ubp-cb-mark { color: var(--spec-mute); }
.ubp-cb-num {
  font-family: var(--spec-font-mono);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--spec-ink);
  font-variant-numeric: tabular-nums;
}
.ubp-cb-label {
  font-family: var(--spec-font-body);
  font-size: 0.78rem;
  color: var(--spec-ink-soft);
  line-height: 1.25;
}
.ubp-cb-label small {
  display: block;
  font-size: 0.65rem;
  color: var(--spec-mute);
  margin-top: 0.1rem;
  line-height: 1.3;
}
.ubp-cb-label small strong { color: var(--spec-ink-soft); }

@media (max-width: 640px) {
  .ubp-cov-breakdown { grid-template-columns: 1fr; }
}
.ubp-loading {
  display: flex; align-items: center; justify-content: center;
  height: 60vh; color: var(--spec-mute);
}

.ubp-pua-notice {
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-left: 4px solid var(--spec-rose);
  border-radius: 8px;
}
.ubp-pua-notice h2 {
  font-family: var(--spec-font-display);
  font-size: 1.2rem; font-weight: 500;
  margin: 0 0 0.75rem;
  color: var(--spec-ink);
}
.ubp-pua-notice p {
  font-size: 0.9rem; line-height: 1.6;
  color: var(--spec-ink-soft);
  margin: 0 0 0.5rem;
}

.ubp-reserved-notice {
  padding: 2rem 2.25rem;
  background: linear-gradient(
    to bottom right,
    rgba(107, 122, 63, 0.06),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--spec-rule);
  border-left: 4px solid #6b7a3f;
  border-radius: 8px;
}
.ubp-reserved-tag {
  display: inline-block;
  font-family: var(--spec-font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7a3f;
  padding: 0.2rem 0.5rem;
  border: 1px solid #6b7a3f;
  border-radius: 2px;
  margin-bottom: 0.75rem;
}
.ubp-reserved-notice h2 {
  font-family: var(--spec-font-display);
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0 0 0.75rem;
  color: var(--spec-ink);
  letter-spacing: -0.01em;
}
.ubp-reserved-notice p {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--spec-ink-soft);
  margin: 0 0 0.6rem;
  max-width: 640px;
}
.ubp-reserved-notice strong { color: var(--spec-ink); font-weight: 600; }
</style>