<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { fetchJson } from '../lib/ssr-fetch'
import { hexCp, safeChar, charRoute } from '../lib/unicode'

interface PropertyDetail {
  property: string
  count: number
  characters: { cp: number; n: string; b: string }[]
}

const props = defineProps<{
  property: 'scripts' | 'category' | 'bidiclass' | 'combining'
  title: string
}>()

const route = useRoute()

const DIR: Record<typeof props.property, string> = {
  scripts: 'scripts',
  category: 'category',
  bidiclass: 'bidiclass',
  combining: 'combining',
}

const code = computed(() => route.params.code as string)

function propertyFileName(key: string): string {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const detail = ref<PropertyDetail | null>(null)

async function load() {
  try {
    detail.value = await fetchJson<PropertyDetail>(
      `unicode/indexes/${DIR[props.property]}/${propertyFileName(code.value)}.json`
    )
  } catch {
    detail.value = null
  }
}

await load()

useHead(() => ({
  title: detail.value
    ? `${code.value} — ${props.title} — Unicode — Essenfont`
    : `${props.title} — Unicode — Essenfont`,
  meta: [
    { property: 'og:title', content: `${code.value} — ${props.title}` },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: `https://essenfont.github.io${route.path}` }],
}))
</script>

<template>
  <div class="container pdp" v-if="detail">
    <header class="pdp-header">
      <RouterLink :to="`/unicode/${property}`" class="pdp-back">← All {{ title }}s</RouterLink>
      <h1><code>{{ code }}</code></h1>
      <p>{{ detail.count.toLocaleString() }} characters</p>
    </header>

    <div class="pdp-grid">
      <RouterLink
        v-for="char in detail.characters"
        :key="char.cp"
        :to="charRoute(char.cp)"
        class="pdp-cell"
      >
        <span class="pdp-glyph">{{ safeChar(char.cp) }}</span>
        <span class="pdp-hex">{{ hexCp(char.cp) }}</span>
        <span class="pdp-name">{{ char.n }}</span>
      </RouterLink>
    </div>
  </div>

  <div v-else class="container pdp-empty">
    <p>{{ title }} "{{ code }}" not found.</p>
    <RouterLink :to="`/unicode/${property}`">← All {{ title }}s</RouterLink>
  </div>
</template>

<style scoped>
.pdp { padding: 1.5rem 1.5rem 4rem; max-width: 1200px; }
.pdp-header { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--spec-rose); }
.pdp-back {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-rose);
  text-decoration: none;
}
.pdp-back:hover { text-decoration: underline; }
.pdp-header h1 {
  font-family: var(--spec-font-display);
  font-size: 1.6rem;
  font-weight: 500;
  margin: 0.3rem 0 0.2rem;
  color: var(--spec-ink);
}
.pdp-header h1 code {
  font-family: var(--spec-font-mono);
  color: var(--spec-rose);
}
.pdp-header p {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-mute);
  margin: 0;
}

.pdp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}
.pdp-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.6rem 0.4rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  text-align: center;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.1s;
}
.pdp-cell:hover {
  border-color: var(--spec-rose);
  transform: translateY(-2px);
  text-decoration: none;
}
.pdp-glyph {
  font-family: var(--spec-font-glyph);
  font-size: 2rem;
  line-height: 1;
  color: var(--spec-ink);
}
.pdp-hex {
  font-family: var(--spec-font-mono);
  font-size: 0.65rem;
  color: var(--spec-rose);
}
.pdp-name {
  font-size: 0.65rem;
  color: var(--spec-mute);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 1.6rem;
}

.pdp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 0.5rem;
  color: var(--spec-mute);
}
</style>