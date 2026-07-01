<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { loadAllBlocks, getPlanes } from '../lib/unicode'
import type { UnicodeBlock } from '../lib/unicode'

const allBlocks = ref<UnicodeBlock[]>([])
const planes = computed(() => getPlanes(allBlocks.value))

allBlocks.value = await loadAllBlocks()

const totalAssigned = computed(() => planes.value.reduce((sum, p) => sum + p.blocks.length, 0))

useHead({
  title: 'Unicode Browser — Essenfont',
  meta: [
    { name: 'description', content: 'Explore every Unicode 17 plane, block, and codepoint. Real glyphs rendered from the Essenfont.' },
    { property: 'og:title', content: 'Unicode Browser — Essenfont' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/unicode' }],
})
</script>

<template>
  <div class="container uc">
    <header class="uc-header">
      <h1>Unicode Browser</h1>
      <p>Every Unicode 17 plane, every block, every assigned codepoint.</p>
      <p class="uc-sub">All glyphs render with the Essenfont — install it locally for the same view everywhere.</p>
    </header>

    <div class="uc-stats">
      <div class="uc-stat">
        <span class="uc-stat-num">{{ planes.length }}</span>
        <span class="uc-stat-label">planes</span>
      </div>
      <div class="uc-stat">
        <span class="uc-stat-num">{{ totalAssigned.toLocaleString() }}</span>
        <span class="uc-stat-label">blocks</span>
      </div>
      <div class="uc-stat">
        <span class="uc-stat-num">159k+</span>
        <span class="uc-stat-label">assigned codepoints</span>
      </div>
    </div>

    <div class="uc-planes">
      <RouterLink
        v-for="plane in planes"
        :key="plane.key"
        :to="`/unicode/plane/${plane.key}`"
        class="uc-plane-card"
      >
        <span class="uc-plane-short">{{ plane.shortName }}</span>
        <span class="uc-plane-name">{{ plane.name }}</span>
        <span class="uc-plane-range">{{ plane.range }}</span>
        <span class="uc-plane-blocks">{{ plane.blocks.length }} {{ plane.blocks.length === 1 ? 'block' : 'blocks' }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.uc { padding: 2rem 1.5rem 4rem; }
.uc-header { margin-bottom: 2rem; }
.uc-header h1 {
  font-family: var(--spec-font-display);
  font-size: 2.2rem;
  font-weight: 500;
  margin: 0 0 0.3rem;
  color: var(--spec-ink);
  letter-spacing: -0.02em;
}
.uc-header p {
  font-size: 0.95rem;
  color: var(--spec-ink-soft);
  margin: 0;
}
.uc-sub { margin-top: 0.3rem !important; font-size: 0.85rem !important; color: var(--spec-mute) !important; }

.uc-stats {
  display: flex; gap: 2rem; flex-wrap: wrap;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-top: 1px solid var(--spec-rule);
  border-bottom: 1px solid var(--spec-rule);
}
.uc-stat { display: flex; flex-direction: column; gap: 0.1rem; }
.uc-stat-num {
  font-family: var(--spec-font-display);
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--spec-rose);
}
.uc-stat-label {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-mute);
}

.uc-planes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.uc-plane-card {
  display: flex; flex-direction: column; gap: 0.3rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}
.uc-plane-card:hover {
  border-color: var(--spec-rose);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  text-decoration: none;
}
.uc-plane-short {
  font-family: var(--spec-font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--spec-rose);
  letter-spacing: -0.02em;
}
.uc-plane-name {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--spec-ink);
}
.uc-plane-range {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute);
}
.uc-plane-blocks {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute);
  margin-top: 0.5rem;
}
</style>