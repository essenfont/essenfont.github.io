<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  defaultText?: string
  defaultSize?: number
  minSize?: number
  maxSize?: number
}>(), {
  defaultText: '你好世界 · Ω∑∫ · 𓂀 𒀭 · 🪬',
  defaultSize: 56,
  minSize: 24,
  maxSize: 160,
})

const text = ref(props.defaultText)
const size = ref(props.defaultSize)

const charCount = computed(() => [...text.value].length)
const codeUnitCount = computed(() => text.value.length)
</script>

<template>
  <div class="p-6 bg-surface border border-rule rounded-md">
    <div class="flex justify-between items-baseline mb-3 flex-wrap gap-2">
      <p class="font-mono text-xs uppercase tracking-wider text-ink-3 m-0">
        {{ charCount }} char{{ charCount === 1 ? '' : 's' }} · {{ codeUnitCount }} code unit{{ codeUnitCount === 1 ? '' : 's' }}
      </p>
    </div>

    <textarea
      v-model="text"
      class="w-full bg-transparent border-none border-b border-rule-strong text-ink text-base leading-relaxed py-2 pb-3 resize-y outline-none focus:border-accent transition-colors"
      spellcheck="false"
      autocomplete="off"
      placeholder="Type anything — 你好世界, Ω∑∫, 𓂀 𒀭, 🦀, 𐎀𐎂, MCMXC…"
      rows="3"
    />

    <div
      class="mt-5 min-h-[4em] text-ink leading-relaxed break-words"
      style="font-family: var(--spec-font-glyph); font-size: {{ size }}px; line-height: 1.4; transition: font-size 0.1s; font-feature-settings: 'kern' 1; font-size-adjust: ex-height 0.5;"
    >
      {{ text }}
    </div>

    <div class="flex justify-between items-center mt-5 pt-3 border-t border-dashed border-rule flex-wrap gap-3">
      <label class="inline-flex items-center gap-2">
        <span class="font-mono text-xs uppercase tracking-wider text-ink-3">size</span>
        <input
          v-model.number="size"
          type="range"
          :min="minSize"
          :max="maxSize"
          class="accent-[var(--ef-accent)] w-[clamp(100px,20vw,180px)]"
          aria-label="Output font size"
        />
        <span class="font-mono text-sm">{{ size }}px</span>
      </label>
      <p class="font-mono text-xs uppercase tracking-wider text-ink-3 text-right max-w-[38ch] m-0">
        Falls back to Noto Sans for codepoints your system can't show. Install Essenfont for true outlines.
      </p>
    </div>
  </div>
</template>
