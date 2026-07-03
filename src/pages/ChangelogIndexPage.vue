<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Changelog — Essenfont',
  meta: [
    { name: 'description', content: 'Every essenfont release, in reverse chronological order. Click a version for the full notes.' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/changelog' }],
})

type Release = {
  tag: string
  name: string
  date: string
  url: string
  otc_url?: string
  coverage_url?: string
}

const releases = ref<Release[]>([])
const loadError = ref<string | null>(null)

// useBuildJson handles the SSR-vs-client fetch centrally.
const { useBuildJson } = await import('../composables/useBuildJson')
releases.value = (await useBuildJson<Release[]>('releases.json')).value ?? []

const hasReleases = computed(() => releases.value.length > 0)
</script>

<template>
  <div class="catalog">
    <header class="catalog-masthead">
      <RouterLink to="/" class="back-mark">← Home</RouterLink>
      <div class="catalog-flag">
        <span class="flag-num">№ 05</span>
        <span class="flag-sep">·</span>
        <span class="flag-label">Changelog</span>
      </div>
      <h1 class="catalog-title">Releases, in order.</h1>
      <p class="catalog-deck">
        Every essenfont release ships as a GitHub Release with the OTC,
        per-plane TTFs, per-plane WOFF/WOFF2, license pack, and per-codepoint
        SVG exports. Click a version for the full notes.
      </p>
    </header>

    <section v-if="hasReleases" class="release-list">
      <RouterLink
        v-for="r in releases"
        :key="r.tag"
        :to="`/changelog/${r.tag}`"
        class="release-row"
      >
        <span class="release-tag">{{ r.tag }}</span>
        <span class="release-date">{{ r.date }}</span>
        <span class="release-name">{{ r.name || r.tag }}</span>
        <span class="release-arrow">→</span>
      </RouterLink>
    </section>

    <section v-else class="release-empty">
      <p v-if="loadError">Couldn't load releases: {{ loadError }}</p>
      <p v-else>No releases published yet.</p>
      <p>
        <a href="https://github.com/essenfont/essenfont/releases" target="_blank" rel="noopener">
          View GitHub Releases ↗
        </a>
      </p>
    </section>
  </div>
</template>

<style scoped>
.catalog { max-width: 880px; margin: 0 auto; padding: 4rem 2rem 6rem; color: var(--spec-ink); }
.catalog-masthead { margin-bottom: 4rem; }
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
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 300;
  line-height: 1.04;
  letter-spacing: -0.025em;
  margin: 0 0 1.2rem;
}
.catalog-deck {
  font-family: var(--spec-font-display);
  font-size: 1.05rem;
  font-weight: 300;
  line-height: 1.55;
  max-width: 60ch;
  margin: 0;
  color: var(--spec-ink-soft);
}
.release-list { display: flex; flex-direction: column; gap: 0.5rem; }
.release-row {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: baseline;
  gap: 1.2rem;
  padding: 1.2rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.15s;
}
.release-row:hover {
  border-color: var(--spec-rose);
  transform: translateX(2px);
}
.release-tag {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--spec-rose);
  letter-spacing: -0.01em;
}
.release-date {
  font-family: var(--spec-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}
.release-name {
  font-family: var(--spec-font-display);
  font-size: 1rem;
  color: var(--spec-ink);
}
.release-arrow {
  font-family: var(--spec-font-mono);
  font-size: 0.8rem;
  color: var(--spec-rose);
}
.release-empty {
  padding: 3rem 2rem;
  text-align: center;
  font-family: var(--spec-font-display);
  font-size: 1rem;
  color: var(--spec-ink-soft);
}
.release-empty a { color: var(--spec-rose); text-decoration: none; }
.release-empty a:hover { text-decoration: underline; }
</style>
