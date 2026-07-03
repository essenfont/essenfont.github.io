<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

type Entry = { t: 'cp' | 'blk' | 'don' | 'scr'; q: string; n: string; u: string }

const open = ref(false)
const query = ref('')
const results = ref<Entry[]>([])
const activeIdx = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

let allEntries: Entry[] = []

const router = useRouter()

function openOverlay() {
  open.value = true
  setTimeout(() => inputEl.value?.focus(), 50)
}

function closeOverlay() {
  open.value = false
  query.value = ''
  results.value = []
  activeIdx.value = 0
}

function toggleOverlay() {
  open.value ? closeOverlay() : openOverlay()
}

async function ensureIndex() {
  if (allEntries.length) return
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}search-index.json`)
    allEntries = await res.json()
  } catch {
    // Search index not yet built — silent
  }
}

function runSearch(q: string) {
  if (!q || q.length < 2 || !allEntries.length) {
    results.value = []
    activeIdx.value = 0
    return
  }
  const lower = q.toLowerCase()
  const hexMatch = q.replace(/^u\+/i, '').toLowerCase()
  const isHex = /^[0-9a-f]+$/i.test(hexMatch)

  const scored = allEntries
    .map(e => {
      let score = 0
      if (isHex && e.q.toLowerCase().includes(hexMatch)) score = 100
      if (e.n.toLowerCase().includes(lower)) {
        score = Math.max(score, e.n.toLowerCase() === lower ? 80 : e.n.toLowerCase().startsWith(lower) ? 50 : 20)
      }
      if (e.q.toLowerCase().includes(lower)) score = Math.max(score, 30)
      return { entry: e, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)

  results.value = scored.map(x => x.entry)
  activeIdx.value = 0
}

function navigate(entry?: Entry) {
  const target = entry ?? results.value[activeIdx.value]
  if (!target) return
  router.push(target.u)
  closeOverlay()
}

function onKey(e: KeyboardEvent) {
  // Cmd+K / Ctrl+K toggles
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    toggleOverlay()
    return
  }
  // `/` opens when not in an input
  if (e.key === '/' && !isTypingTarget(e.target)) {
    e.preventDefault()
    openOverlay()
    return
  }
  if (!open.value) return
  if (e.key === 'Escape') { closeOverlay(); return }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIdx.value = Math.min(results.value.length - 1, activeIdx.value + 1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIdx.value = Math.max(0, activeIdx.value - 1)
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    navigate()
  }
}

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  await ensureIndex()
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <button
    class="ss-trigger"
    @click="openOverlay"
    aria-label="Search (Cmd+K)"
    title="Search (Cmd+K or /)"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <span class="ss-trigger-text">Search</span>
    <span class="ss-trigger-kbd">⌘K</span>
  </button>

  <Teleport to="body">
    <div v-if="open" class="ss-overlay" @click.self="closeOverlay">
      <div class="ss-card">
        <div class="ss-input-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            @input="runSearch(query)"
            type="text"
            placeholder="U+1F600, grinning, Noto, Tangut…"
            spellcheck="false"
            autocomplete="off"
            class="ss-input"
          />
          <kbd class="ss-esc-kbd">esc</kbd>
        </div>

        <ul v-if="results.length" class="ss-results">
          <li
            v-for="(r, i) in results"
            :key="i"
            :class="{ active: i === activeIdx }"
            @mouseenter="activeIdx = i"
            @click="navigate(r)"
          >
            <span class="ss-r-type" :class="`type-${r.t}`">{{ r.t }}</span>
            <span class="ss-r-query">{{ r.q }}</span>
            <span class="ss-r-name">{{ r.n }}</span>
            <span class="ss-r-arrow">↵</span>
          </li>
        </ul>

        <div v-else-if="query.length >= 2" class="ss-empty">
          No matches for "{{ query }}"
        </div>
        <div v-else class="ss-empty">
          Type a hex codepoint (1F600), a name fragment (grinning), or a donor (Noto)
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ss-trigger {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  font-family: var(--spec-font-mono); font-size: 0.72rem;
  background: var(--vp-c-bg-soft); border: 1px solid var(--spec-rule);
  border-radius: 4px; color: var(--spec-ink-soft); cursor: pointer;
  transition: all 0.15s;
}
.ss-trigger:hover { border-color: var(--spec-rose); color: var(--spec-rose); }
.ss-trigger-text { letter-spacing: 0.04em; }
.ss-trigger-kbd {
  font-size: 0.62rem; padding: 0.05rem 0.35rem;
  background: var(--vp-c-bg); border: 1px solid var(--spec-rule); border-radius: 2px;
  opacity: 0.7;
}

.ss-overlay {
  position: fixed; inset: 0; background: rgba(28, 26, 24, 0.4);
  display: flex; justify-content: center; align-items: flex-start;
  padding-top: 12vh; z-index: 100;
  backdrop-filter: blur(2px);
}
.ss-card {
  width: min(640px, calc(100vw - 2rem));
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule); border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  overflow: hidden;
}
.ss-input-row {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--spec-rule);
  color: var(--spec-ink-soft);
}
.ss-input {
  flex: 1; font-family: var(--spec-font-mono); font-size: 0.95rem;
  background: transparent; border: none; outline: none; color: var(--spec-ink);
}
.ss-esc-kbd {
  font-family: var(--spec-font-mono); font-size: 0.66rem;
  padding: 0.1rem 0.4rem; background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule); border-radius: 2px;
  color: var(--spec-ink-soft); opacity: 0.7;
}

.ss-results { list-style: none; padding: 0.3rem 0; margin: 0; max-height: 50vh; overflow-y: auto; }
.ss-results li {
  display: grid; grid-template-columns: auto auto 1fr auto;
  align-items: baseline; gap: 0.7rem;
  padding: 0.55rem 1.1rem; cursor: pointer;
  font-family: var(--spec-font-mono); font-size: 0.82rem; color: var(--spec-ink);
  transition: background 0.1s;
}
.ss-results li.active, .ss-results li:hover {
  background: rgba(184, 71, 95, 0.06);
}
.ss-r-type {
  font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 0.15rem 0.45rem; border-radius: 999px; min-width: 38px; text-align: center;
}
.type-cp { background: var(--ef-accent-muted); color: var(--ef-accent); }
.type-blk { background: rgba(94, 124, 78, 0.12); color: #5e7c4e; }
.type-don { background: rgba(125, 78, 166, 0.12); color: #7d4ea6; }
.type-scr { background: rgba(193, 154, 62, 0.15); color: #c19a3e; }
.ss-r-query { color: var(--spec-rose); font-weight: 600; }
.ss-r-name {
  font-family: var(--spec-font-display); font-size: 0.92rem;
  color: var(--spec-ink-soft); font-weight: 300;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ss-r-arrow { color: var(--spec-rose); opacity: 0.5; }

.ss-empty {
  padding: 2rem 1.1rem; text-align: center;
  font-family: var(--spec-font-display); font-size: 0.92rem;
  color: var(--spec-ink-soft); opacity: 0.7;
}

@media (max-width: 540px) {
  .ss-trigger-text, .ss-trigger-kbd { display: none; }
}
</style>
