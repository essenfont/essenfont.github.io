<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadAllBlocks, PLANES, hexCp, blockSlug } from '../lib/unicode'
import type { UnicodeBlock } from '../lib/unicode'

const route = useRoute()
const planeId = computed(() => route.params.planeId as string)

const allBlocks = ref<UnicodeBlock[]>([])

const plane = computed(() =>
  PLANES.find(p => p.key === planeId.value || p.shortName.toLowerCase() === planeId.value.toLowerCase())
)

const blocks = computed(() =>
  allBlocks.value
    .filter(b => b.plane === plane.value?.key)
    .sort((a, b) => a.start - b.start)
)

const versionGroups = computed(() => {
  const groups: { version: string; blocks: UnicodeBlock[] }[] = []
  for (const b of blocks.value) {
    const v = b.unicodeVersion || 'unknown'
    let g = groups.find(g => g.version === v)
    if (!g) {
      g = { version: v, blocks: [] }
      groups.push(g)
    }
    g.blocks.push(b)
  }
  groups.sort((a, b) => parseFloat(a.version) - parseFloat(b.version))
  return groups
})

const totalCodepoints = computed(() => {
  if (!plane.value) return 0
  return plane.value.end - plane.value.start + 1
})

allBlocks.value = await loadAllBlocks()

useHead(() => ({
  title: plane.value
    ? `${plane.value.shortName} — Unicode Plane — Essenfont`
    : 'Unicode Plane — Essenfont',
  meta: [
    { property: 'og:title', content: plane.value?.shortName || 'Unicode Plane' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: `https://essenfont.github.io/unicode/plane/${planeId.value}` }],
}))

function chartUrl(block: UnicodeBlock): string {
  const hex = block.start.toString(16).toUpperCase().padStart(4, '0')
  return `https://www.unicode.org/charts/PDF/U${hex}.html`
}
</script>

<template>
  <div class="container plane" v-if="plane">
    <header class="plane-header">
      <RouterLink to="/unicode" class="plane-back">← Unicode Browser</RouterLink>
      <div class="plane-title-block">
        <span class="plane-short">{{ plane.shortName }}</span>
        <h1 class="plane-name">{{ plane.name }}</h1>
      </div>
      <div class="plane-meta">
        <span class="plane-range">{{ plane.range }}</span>
        <span class="plane-sep">·</span>
        <span class="plane-cp-count">{{ totalCodepoints.toLocaleString() }} codepoints</span>
        <span class="plane-sep">·</span>
        <span class="plane-block-count">{{ blocks.length }} blocks</span>
      </div>
    </header>

    <section
      v-for="group in versionGroups"
      :key="group.version"
      class="version-section"
    >
      <div class="version-header">
        <span class="version-badge">v{{ group.version }}</span>
        <span class="version-block-count">{{ group.blocks.length }} blocks</span>
      </div>

      <div class="block-list">
        <div
          v-for="block in group.blocks"
          :key="block.name"
          class="block-row"
        >
          <RouterLink
            :to="`/unicode/block/${blockSlug(block.name)}`"
            class="block-info"
          >
            <span class="block-code">{{ hexCp(block.start) }}</span>
            <span class="block-code-dash">–</span>
            <span class="block-code">{{ hexCp(block.end) }}</span>
            <span class="block-name">{{ block.displayName || block.name }}</span>
          </RouterLink>
          <span class="block-size">{{ (block.end - block.start + 1).toLocaleString() }} cp</span>
          <a
            :href="chartUrl(block)"
            class="block-chart"
            target="_blank"
            rel="noopener"
            title="Unicode code chart (PDF)"
          >chart ↗</a>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="container plane-loading">Plane "{{ planeId }}" not found.</div>
</template>

<style scoped>
.plane { padding: 2rem 1.5rem 5rem; max-width: 880px; }

.plane-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px double var(--spec-ink);
}
.plane-back {
  display: inline-block;
  font-family: var(--spec-font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--spec-rose);
  text-decoration: none;
  margin-bottom: 0.75rem;
}
.plane-back:hover { text-decoration: underline; }
.plane-title-block {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}
.plane-short {
  font-family: var(--spec-font-mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--spec-rose);
}
.plane-name {
  font-family: var(--spec-font-display);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 500;
  margin: 0;
  color: var(--spec-ink);
  letter-spacing: -0.01em;
}
.plane-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--spec-mute);
  font-family: var(--spec-font-mono);
  flex-wrap: wrap;
}
.plane-sep { opacity: 0.4; }

.version-section { margin-bottom: 1.5rem; }
.version-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--spec-rule);
}
.version-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  background: var(--spec-rose);
}
.version-block-count {
  margin-left: auto;
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-mute);
}

.block-list { display: flex; flex-direction: column; }
.block-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.5rem 0 0.5rem 1rem;
  border-bottom: 1px solid var(--spec-rule);
  transition: background 0.08s;
}
.block-row:hover { background: var(--vp-c-bg-soft); }
.block-row:last-child { border-bottom: none; }

.block-info {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex: 1;
  text-decoration: none;
  min-width: 0;
  flex-wrap: wrap;
}
.block-code {
  font-family: var(--spec-font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--spec-rose);
  white-space: nowrap;
}
.block-code-dash {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-mute);
}
.block-name {
  flex: 1;
  font-size: 0.88rem;
  color: var(--spec-ink);
  transition: color 0.1s;
}
.block-row:hover .block-name { color: var(--spec-rose); }

.block-size {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  color: var(--spec-mute);
  white-space: nowrap;
}
.block-chart {
  font-size: 0.7rem;
  color: var(--spec-mute);
  text-decoration: none;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.1s, color 0.1s;
}
.block-row:hover .block-chart { opacity: 1; }
.block-chart:hover { color: var(--spec-rose); }

.plane-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--spec-mute);
}

@media (max-width: 640px) {
  .block-chart { opacity: 1; }
  .block-row { padding-left: 0.5rem; gap: 0.4rem; }
}
</style>