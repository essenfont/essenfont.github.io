<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

export interface TabSpec {
  id: string
  label: string
}

const props = defineProps<{
  tabs: TabSpec[]
}>()

const activeTab = ref(props.tabs[0]?.id ?? '')
const root = ref<HTMLElement | null>(null)

function getSessionKey(): string {
  return `ef:tabs:${typeof window !== 'undefined' ? window.location.pathname : ''}`
}

function resolveInitial(): string {
  if (typeof window === 'undefined') return props.tabs[0]?.id ?? ''
  const hash = window.location.hash.slice(1)
  if (hash && props.tabs.some(t => t.id === hash)) return hash
  try {
    const stored = sessionStorage.getItem(getSessionKey())
    if (stored && props.tabs.some(t => t.id === stored)) return stored
  } catch { /* quota */ }
  return props.tabs[0]?.id ?? ''
}

function applyVisibility() {
  if (!root.value) return
  root.value.querySelectorAll<HTMLElement>('[data-tab]').forEach(el => {
    const id = el.getAttribute('data-tab')
    el.hidden = id !== activeTab.value
    el.id = `panel-${id}`
    el.setAttribute('role', 'tabpanel')
    el.setAttribute('aria-labelledby', `tab-${id}`)
  })
}

function activate(id: string) {
  activeTab.value = id
  if (typeof history !== 'undefined' && history.replaceState) {
    history.replaceState(null, '', `#${id}`)
  }
  try { sessionStorage.setItem(getSessionKey(), id) } catch { /* quota */ }
}

function onKeydown(e: KeyboardEvent) {
  const tabs = props.tabs
  if (tabs.length === 0) return
  const cur = tabs.findIndex(t => t.id === activeTab.value)
  const idx = cur === -1 ? 0 : cur
  let next = idx
  if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length
  else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = tabs.length - 1
  else return
  e.preventDefault()
  activate(tabs[next].id)
}

onMounted(() => {
  activeTab.value = resolveInitial()
  nextTick(applyVisibility)
})

watch(activeTab, () => {
  applyVisibility()
  if (typeof history !== 'undefined' && history.replaceState) {
    history.replaceState(null, '', `#${activeTab.value}`)
  }
})
</script>

<template>
  <div ref="root" class="mt-4">
    <div
      class="flex gap-0 border-b border-rule-strong overflow-x-auto mb-5"
      role="tablist"
      aria-label="Content tabs"
      @keydown="onKeydown"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activate(tab.id)"
        :id="`tab-${tab.id}`"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :tabindex="activeTab === tab.id ? 0 : -1"
        :class="[
          'bg-transparent border-none px-4 py-2.5 font-mono text-xs uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer',
          activeTab === tab.id
            ? 'text-accent border-accent'
            : 'text-ink-3 border-transparent hover:text-ink',
        ]"
      >{{ tab.label }}</button>
    </div>
    <!-- Astro-rendered children with data-tab attributes go here -->
    <slot />
  </div>
</template>
