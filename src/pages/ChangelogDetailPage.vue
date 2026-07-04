<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { fetchJson } from '../lib/ssr-fetch'

useHead(() => ({
  title: `v${tag.value} — Changelog — Essenfont`,
  link: [{ rel: 'canonical', href: `https://essenfont.github.io/changelog/${tag.value}` }],
}))

const route = useRoute()
const tag = computed(() => route.params.tag as string)

type Release = {
  tag: string
  name: string
  date: string
  url: string
  body?: string
  assets?: { name: string; size: number; download_url: string }[]
}

const release = ref<Release | null>(null)

async function load() {
  try {
    const all = await fetchJson<Release[]>('releases-full.json')
    release.value = all.find((r) => r.tag === tag.value) ?? null
  } catch {
    release.value = null
  }
}

await load()
watch(tag, load)

const prettyBody = computed(() => release.value?.body ?? '<p><em>No release notes.</em></p>')
</script>

<template>
  <div class="catalog">
    <header class="catalog-masthead">
      <RouterLink to="/changelog" class="back-mark">← All releases</RouterLink>
      <div class="catalog-flag">
        <span class="flag-num">v{{ tag }}</span>
        <span class="flag-sep">·</span>
        <span class="flag-label">{{ release?.date ?? '—' }}</span>
      </div>
      <h1 class="catalog-title">{{ release?.name ?? `v${tag}` }}</h1>
      <p class="catalog-deck">
        <a v-if="release" :href="release.url" target="_blank" rel="noopener">View on GitHub ↗</a>
      </p>
    </header>

    <section v-if="release" class="release-content">
      <article class="release-body" v-html="prettyBody" />
    </section>

    <section v-else class="release-empty">
      <p>Release v{{ tag }} not found.</p>
      <p>
        <RouterLink to="/changelog">← Back to changelog</RouterLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.catalog { max-width: 760px; margin: 0 auto; padding: 4rem 2rem 6rem; color: var(--spec-ink); }
.catalog-masthead { margin-bottom: 3rem; }
.back-mark {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--spec-rose);
  text-decoration: none;
  text-transform: uppercase;
}
.back-mark:hover { text-decoration: underline; }
.catalog-flag {
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
.catalog-title {
  font-family: var(--spec-font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0 0 0.5rem;
}
.catalog-deck { margin: 0; font-family: var(--spec-font-mono); font-size: 0.85rem; }
.catalog-deck a { color: var(--spec-rose); text-decoration: none; }
.catalog-deck a:hover { text-decoration: underline; }

.release-body {
  font-family: var(--spec-font-display);
  font-size: 1.02rem;
  font-weight: 300;
  line-height: 1.65;
  color: var(--spec-ink-soft);
  white-space: pre-wrap;
}
.release-empty {
  padding: 3rem 0;
  text-align: center;
  font-family: var(--spec-font-display);
  color: var(--spec-ink-soft);
}
.release-empty a { color: var(--spec-rose); text-decoration: none; }
</style>
