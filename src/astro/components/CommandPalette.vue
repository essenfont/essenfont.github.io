<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SiteSearch from './SiteSearch.vue'

const isOpen = ref(false)
const inputRef = ref<HTMLElement | null>(null)

function open() {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

function close() {
  isOpen.value = false
  document.body.style.overflow = ''
}

function toggle() {
  isOpen.value ? close() : open()
}

function onHotkey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault()
    toggle()
  }
}

function onClickOutside(e: MouseEvent) {
  if (!isOpen.value) return
  const modal = document.querySelector('[data-cmdk-modal]')
  if (modal && !modal.contains(e.target as Node)) close()
}

function onNavigate(href: string) {
  close()
  window.location.href = href
}

onMounted(() => {
  document.addEventListener('keydown', onHotkey)
  document.addEventListener('click', onClickOutside)
  document.querySelectorAll('[data-cmdk-trigger]').forEach(el => {
    el.addEventListener('click', (e: Event) => { e.preventDefault(); open() })
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', onHotkey)
  document.removeEventListener('click', onClickOutside)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-100"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        data-cmdk-modal
        class="fixed inset-0 z-[1000] flex items-start justify-center pt-[8vh] px-6 pb-6 bg-black/40 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="w-full max-w-2xl bg-paper rounded-xl shadow-2xl border border-rule-strong overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
        >
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-rule font-mono text-xs text-ink-3 tracking-wide">
            <span class="uppercase">Search essenfont.github.io</span>
            <button
              @click="close"
              class="border border-rule rounded px-2 py-0.5 text-inherit hover:border-accent hover:text-accent transition-colors cursor-pointer bg-transparent"
            >Esc</button>
          </div>
          <div class="p-4">
            <SiteSearch bare :autoNavigate="false" @navigate="onNavigate" />
          </div>
          <div class="flex items-center gap-3 px-4 py-2.5 border-t border-rule flex-wrap font-mono text-xs text-ink-3">
            <span><kbd class="border border-rule rounded px-1.5 py-0.5 bg-surface text-[0.7rem]">↑↓</kbd> navigate</span>
            <span><kbd class="border border-rule rounded px-1.5 py-0.5 bg-surface text-[0.7rem]">↵</kbd> go</span>
            <span><kbd class="border border-rule rounded px-1.5 py-0.5 bg-surface text-[0.7rem]">Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
