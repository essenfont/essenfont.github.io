<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { search, type SearchIndex, type SearchResult } from '../lib/site-search'

const props = withDefaults(defineProps<{
  bare?: boolean
  autoNavigate?: boolean
}>(), {
  bare: false,
  autoNavigate: true,
})

const emit = defineEmits<{
  navigate: [href: string]
}>()

function navigate(href: string) {
  if (props.autoNavigate) {
    window.location.href = href
  }
  emit('navigate', href)
}

const query = ref('')
const results = ref<SearchResult[]>([])
const activeIndex = ref(-1)
let index: SearchIndex | null = null
let loading = false
let debounce: ReturnType<typeof setTimeout> | null = null

async function ensureIndex(): Promise<SearchIndex> {
  if (index) return index
  if (loading) return index!
  loading = true
  const res = await fetch('/search-index.json')
  index = await res.json() as SearchIndex
  loading = false
  return index
}

async function refresh() {
  if (!query.value.trim()) {
    results.value = []
    activeIndex.value = -1
    return
  }
  if (!index && !loading) {
    await ensureIndex()
  }
  if (index) {
    results.value = search(index, query.value)
    activeIndex.value = results.value.length > 0 ? 0 : -1
  }
}

function onInput() {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(refresh, 120)
}

function moveActive(delta: number) {
  if (results.value.length === 0) return
  activeIndex.value = (activeIndex.value + delta + results.value.length) % results.value.length
}

function enter() {
  if (activeIndex.value >= 0 && results.value[activeIndex.value]) {
    navigate(results.value[activeIndex.value].href)
  }
}

function clear() {
  query.value = ''
  results.value = []
  activeIndex.value = -1
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1) }
  else if (e.key === 'Enter') { e.preventDefault(); enter() }
  else if (e.key === 'Escape') { e.preventDefault(); clear() }
}

function onClickResult(href: string) {
  navigate(href)
}
</script>

<template>
  <div :class="['relative', bare ? '' : 'max-w-[640px] mx-auto']">
    <input
      v-model="query"
      @input="onInput"
      @keydown="onKeydown"
      type="text"
      :class="[
        'w-full',
        bare ? 'border-none p-0 text-base' : 'border border-rule-strong rounded-md p-3 text-base',
        'bg-transparent text-ink outline-none focus:border-accent transition-colors',
        'font-[var(--spec-font-body)]',
      ]"
      placeholder="Block name, hex codepoint, or character name…"
      autocomplete="off"
      spellcheck="false"
      aria-label="Search blocks, codepoints, and donors"
      role="combobox"
      :aria-expanded="results.length > 0"
    />
    <ul
      v-if="results.length > 0"
      class="absolute top-full left-0 right-0 z-10 bg-paper border border-rule rounded-b-md shadow-md max-h-[400px] overflow-y-auto list-none p-0 m-0"
      role="listbox"
    >
      <li
        v-for="(r, i) in results"
        :key="r.href"
        @mouseenter="activeIndex = i"
        @click="onClickResult(r.href)"
        :class="[
          'flex items-baseline justify-between gap-3 px-4 py-2 cursor-pointer text-sm transition-colors',
          i === activeIndex ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface',
        ]"
        role="option"
      >
        <span class="flex-1 truncate">{{ r.label }}</span>
        <span v-if="r.detail" class="font-mono text-xs text-ink-3 flex-shrink-0">{{ r.detail }}</span>
      </li>
    </ul>
  </div>
</template>
