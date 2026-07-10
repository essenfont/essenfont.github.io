<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const progress = ref(0)
const activeIndex = ref(0)
const headings = ref<Array<{ id: string; text: string }>>([])

let ticking = false
let scrollHandler: (() => void) | null = null

function scanHeadings() {
  const article = document.querySelector('[data-reading-article]')
  if (!article) return
  const h2s = Array.from(article.querySelectorAll<HTMLElement>('h2'))
  if (h2s.length < 3) return
  headings.value = h2s.map((h, i) => {
    if (!h.id) h.id = (h.textContent ?? `section-${i}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return { id: h.id, text: h.textContent ?? '' }
  })
}

function update() {
  const article = document.querySelector<HTMLElement>('[data-reading-article]')
  if (!article || headings.value.length === 0) return
  const rect = article.getBoundingClientRect()
  const total = rect.height - window.innerHeight
  const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1))
  progress.value = total > 0 ? scrolled / total : 0

  const threshold = window.innerHeight * 0.3 + window.scrollY
  let idx = 0
  for (let i = 0; i < headings.value.length; i++) {
    const el = document.getElementById(headings.value[i].id)
    if (!el) continue
    const top = el.getBoundingClientRect().top + window.scrollY
    if (top <= threshold) idx = i
    else break
  }
  activeIndex.value = idx
}

function scheduleUpdate() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => { update(); ticking = false })
}

onMounted(() => {
  scanHeadings()
  if (headings.value.length === 0) return
  scrollHandler = scheduleUpdate
  window.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('resize', scrollHandler, { passive: true })
  scheduleUpdate()
})

onUnmounted(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    window.removeEventListener('resize', scrollHandler)
  }
})
</script>

<template>
  <div>
    <!-- Scroll progress bar -->
    <div
      class="fixed top-0 left-0 right-0 h-0.5 z-50 pointer-events-none"
      :style="{ background: `linear-gradient(to right, var(--ef-accent) 0%, var(--ef-accent) ${progress * 100}%, transparent ${progress * 100}%)` }"
    />

    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_200px] gap-0 xl:gap-10">
      <div class="min-w-0">
        <slot />
      </div>

      <aside
        v-if="headings.length >= 3"
        class="hidden xl:block sticky top-20 self-start max-h-[calc(100vh-7rem)] overflow-y-auto"
        data-toc
        aria-label="Table of contents"
      >
        <div class="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-3 mb-4 pl-4">
          On this page
        </div>
        <nav>
          <ul class="list-none p-0 m-0 border-l border-rule">
            <li v-for="(h, i) in headings" :key="h.id" class="m-0">
              <a
                :href="`#${h.id}`"
                :class="[
                  'block py-2 pl-4 pr-2 -ml-px border-l-2 no-underline transition-colors duration-150 text-[0.9rem] leading-snug',
                  i === activeIndex
                    ? 'text-accent border-accent font-semibold'
                    : 'text-ink-3 border-transparent hover:text-ink hover:border-ink-3',
                ]"
              >{{ h.text }}</a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</template>
