<script setup lang="ts">
import { ref } from 'vue'

interface SearchIndexShape {
  chars: Array<{ cp: number; name: string }>
}

const HISTORY_KEY = 'ef:random-history'
const HISTORY_LIMIT = 5

const loading = ref(false)
let cachedIndex: SearchIndexShape | null = null

function readHistory(): number[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function writeHistory(items: number[]) {
  try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(-HISTORY_LIMIT))) } catch { /* quota */ }
}

function pickRandom(chars: SearchIndexShape['chars'], avoid: Set<number>): number {
  for (let i = 0; i < 8; i++) {
    const idx = Math.floor(Math.random() * chars.length)
    if (!avoid.has(chars[idx].cp)) return chars[idx].cp
  }
  return chars[Math.floor(Math.random() * chars.length)].cp
}

async function surprise() {
  loading.value = true
  try {
    if (!cachedIndex) {
      const res = await fetch('/search-index.json')
      cachedIndex = await res.json()
    }
    const history = readHistory()
    const cp = pickRandom(cachedIndex.chars, new Set(history))
    history.push(cp)
    writeHistory(history)
    const hex = cp.toString(16).toUpperCase().padStart(4, '0')
    window.location.href = `/unicode/char/${hex}`
  } catch (err) {
    console.warn('random codepoint failed:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    @click="surprise"
    :disabled="loading"
    class="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-rule bg-surface text-ink-2 hover:border-accent hover:text-accent transition-all duration-150 font-mono text-sm cursor-pointer hover:-translate-y-px disabled:opacity-60 disabled:cursor-wait"
  >
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"
      class="transition-transform duration-300 hover:rotate-90"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
      <circle cx="16" cy="8" r="1.4" fill="currentColor" />
      <circle cx="8" cy="16" r="1.4" fill="currentColor" />
    </svg>
    <span>Random codepoint</span>
  </button>
</template>
