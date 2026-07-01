<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { fetchJson } from '../lib/ssr-fetch'

interface CountMap { [key: string]: number }

const props = defineProps<{
  property: 'scripts' | 'category' | 'bidiclass' | 'combining'
  title: string
  label: string
}>()

const route = useRoute()

const INDEX_FILE: Record<typeof props.property, string> = {
  scripts: 'by-script.json',
  category: 'by-category.json',
  bidiclass: 'by-bidi.json',
  combining: 'by-combining.json',
}

const DIR: Record<typeof props.property, string> = {
  scripts: 'scripts',
  category: 'category',
  bidiclass: 'bidiclass',
  combining: 'combining',
}

const counts = ref<CountMap>({})

counts.value = await fetchJson<CountMap>(`unicode/indexes/${INDEX_FILE[props.property]}`)

const entries = computed(() =>
  Object.entries(counts.value)
    .sort((a, b) => b[1] - a[1])
)

const totalCount = computed(() =>
  entries.value.reduce((sum, [, c]) => sum + c, 0)
)

function propertyFileName(key: string): string {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

useHead(() => ({
  title: `${props.title} — Unicode — Essenfont`,
  meta: [
    { property: 'og:title', content: `${props.title} — Unicode` },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: `https://essenfont.github.io${route.path}` }],
}))
</script>

<template>
  <div class="container plp">
    <header class="plp-header">
      <RouterLink to="/unicode" class="plp-back">← Unicode Browser</RouterLink>
      <h1>{{ title }}</h1>
      <p>{{ entries.length }} {{ label }} · {{ totalCount.toLocaleString() }} characters total</p>
    </header>

    <ul class="plp-list">
      <li v-for="[code, count] in entries" :key="code">
        <RouterLink :to="`/unicode/${property}/${propertyFileName(code)}`" class="plp-row">
          <span class="plp-code">{{ code }}</span>
          <span class="plp-bar">
            <span
              class="plp-bar-fill"
              :style="{ width: `${(count / entries[0][1]) * 100}%` }"
            ></span>
          </span>
          <span class="plp-count">{{ count.toLocaleString() }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.plp { padding: 1.5rem 1.5rem 4rem; max-width: 880px; }
.plp-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--spec-rose); }
.plp-back {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-rose);
  text-decoration: none;
}
.plp-back:hover { text-decoration: underline; }
.plp-header h1 {
  font-family: var(--spec-font-display);
  font-size: 1.6rem; font-weight: 500;
  margin: 0.3rem 0 0.2rem;
  color: var(--spec-ink);
}
.plp-header p {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-mute);
  margin: 0;
}

.plp-list { list-style: none; padding: 0; margin: 0; }
.plp-row {
  display: grid;
  grid-template-columns: 90px 1fr 100px;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid var(--spec-rule);
  text-decoration: none;
  transition: background 0.1s;
}
.plp-row:hover { background: var(--vp-c-bg-soft); text-decoration: none; }

.plp-code {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--spec-rose);
}
.plp-bar {
  height: 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 3px;
  overflow: hidden;
}
.plp-bar-fill {
  display: block;
  height: 100%;
  background: var(--spec-rose);
  opacity: 0.6;
}
.plp-count {
  font-family: var(--spec-font-mono);
  font-size: 0.75rem;
  color: var(--spec-mute);
  text-align: right;
}

@media (max-width: 640px) {
  .plp-row { grid-template-columns: 80px 1fr 80px; gap: 0.5rem; }
}
</style>