<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Search — Essenfont',
  meta: [{ name: 'description', content: 'Search 159,866 Unicode codepoints, 346 blocks, 140 donors by hex, name, or keyword.' }],
})

const router = useRouter()
const query = ref('')
const results = ref<any[]>([])
const isLoading = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

type Entry = {
  t: 'cp' | 'blk' | 'don' | 'scr'
  q: string
  n: string
  u: string
}

let allEntries: Entry[] = []

async function loadIndex() {
  if (allEntries.length) return
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}search-index.json`)
    allEntries = await res.json()
  } catch (e) {
    console.warn('search index failed to load', e)
  }
}

function search(q: string) {
  if (!q || q.length < 2 || !allEntries.length) {
    results.value = []
    return
  }
  isLoading.value = true
  const lower = q.toLowerCase()
  const isHex = /^[0-9a-f]+$/i.test(q.replace(/^u\+/i, ''))
  const hexQuery = isHex ? q.replace(/^u\+/i, '').toLowerCase() : null

  // Score: hex match = 100, exact name = 80, prefix = 50, contains = 20
  const scored = allEntries
    .map(e => {
      let score = 0
      if (hexQuery && e.q.toLowerCase().includes(hexQuery)) score = 100
      if (e.n.toLowerCase().includes(lower)) {
        score = Math.max(score, e.n.toLowerCase() === lower ? 80 : e.n.toLowerCase().startsWith(lower) ? 50 : 20)
      }
      if (e.q.toLowerCase().includes(lower)) score = Math.max(score, 30)
      return { entry: e, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)

  results.value = scored.map(x => x.entry)
  isLoading.value = false
}

watch(query, (q) => search(q))

function navigate(entry: Entry) {
  router.push(entry.u)
}

const typeLabel: Record<string, string> = {
  cp: 'codepoint',
  blk: 'block',
  don: 'donor',
  scr: 'script',
}

onMounted(async () => {
  await loadIndex()
  searchInput.value?.focus()
  // Pre-fill from ?q=
  const params = new URLSearchParams(window.location.search)
  if (params.get('q')) query.value = params.get('q')!
})
</script>

<template>
  <div class="search-page">
    <header class="sp-head">
      <h1>Search</h1>
      <p class="lede">159,866 codepoints · 346 blocks · 140 donors. Type a hex, a name, or a script.</p>
    </header>

    <div class="sp-input-wrap">
      <input
        ref="searchInput"
        v-model="query"
        type="text"
        placeholder="U+1F600, grinning, Noto, Tangut, …"
        spellcheck="false"
        autocomplete="off"
        class="sp-input"
      />
      <span v-if="isLoading" class="sp-spinner"></span>
    </div>

    <p v-if="query.length > 0 && query.length < 2" class="sp-hint">Keep typing…</p>
    <p v-else-if="query.length >= 2 && results.length === 0 && !isLoading" class="sp-hint">
      No matches. Try a hex codepoint (e.g., <code>1F600</code>) or a name fragment.
    </p>

    <ul v-if="results.length" class="sp-results">
      <li v-for="(r, i) in results" :key="i">
        <button class="sp-result" @click="navigate(r)">
          <span class="sp-r-type" :class="`type-${r.t}`">{{ typeLabel[r.t] }}</span>
          <span class="sp-r-query">{{ r.q }}</span>
          <span class="sp-r-name">{{ r.n }}</span>
          <span class="sp-r-arrow">→</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.search-page { max-width: 880px; margin: 0 auto; padding: 4rem 2rem 6rem; color: var(--spec-ink); }
.sp-head { margin-bottom: 2rem; }
.sp-head h1 {
  font-family: var(--spec-font-display);
  font-size: clamp(2rem, 4vw, 2.6rem); font-weight: 300;
  letter-spacing: -0.025em; margin: 0 0 0.5rem;
}
.lede {
  font-family: var(--spec-font-display); font-size: 1rem; font-weight: 300;
  color: var(--spec-ink-soft); margin: 0;
}
.sp-input-wrap { position: relative; margin-bottom: 1.5rem; }
.sp-input {
  width: 100%; padding: 1rem 1.2rem;
  font-family: var(--spec-font-mono); font-size: 1.05rem;
  background: var(--vp-c-bg-soft); border: 1px solid var(--spec-rule);
  border-radius: 4px; color: var(--spec-ink);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.sp-input:focus {
  outline: none; border-color: var(--spec-rose);
  box-shadow: 0 0 0 3px rgba(184, 71, 95, 0.12);
}
.sp-spinner {
  position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; border: 2px solid var(--spec-rule);
  border-top-color: var(--spec-rose); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
.sp-hint {
  font-family: var(--spec-font-mono); font-size: 0.82rem; color: var(--spec-ink-soft);
  padding: 1rem 0; opacity: 0.7;
}
.sp-hint code {
  background: rgba(184, 71, 95, 0.08); padding: 0.05em 0.4em; border-radius: 2px;
  color: var(--spec-rose);
}
.sp-results { list-style: none; padding: 0; margin: 0; }
.sp-result {
  width: 100%; display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: baseline; gap: 0.8rem;
  padding: 0.7rem 1rem; text-align: left;
  background: transparent; border: none; border-bottom: 1px solid var(--spec-rule);
  cursor: pointer; transition: background 0.12s;
  font-family: var(--spec-font-mono); font-size: 0.85rem; color: var(--spec-ink);
}
.sp-result:hover { background: rgba(184, 71, 95, 0.05); }
.sp-r-type {
  font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 0.18rem 0.5rem; border-radius: 999px; min-width: 70px; text-align: center;
}
.type-cp { background: rgba(184, 71, 95, 0.12); color: var(--spec-rose); }
.type-blk { background: rgba(94, 124, 78, 0.12); color: #5e7c4e; }
.type-don { background: rgba(125, 78, 166, 0.12); color: #7d4ea6; }
.type-scr { background: rgba(193, 154, 62, 0.15); color: #c19a3e; }
.sp-r-query { color: var(--spec-rose); font-weight: 600; }
.sp-r-name {
  font-family: var(--spec-font-display); font-size: 0.95rem;
  color: var(--spec-ink-soft); font-weight: 300;
}
.sp-r-arrow { color: var(--spec-rose); opacity: 0.6; }
</style>
