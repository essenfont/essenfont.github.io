<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  words: string[]
  /** ms per character while typing */
  typeSpeed?: number
  /** ms per character while deleting */
  deleteSpeed?: number
  /** ms to hold the word before deleting */
  holdMs?: number
}>(), {
  typeSpeed: 70,
  deleteSpeed: 35,
  holdMs: 1400,
})

const display = ref('')
let wordIdx = 0
let charIdx = 0
let deleting = false
let timer: ReturnType<typeof setTimeout> | null = null

function tick() {
  const word = props.words[wordIdx] ?? ''
  if (!deleting) {
    display.value = word.slice(0, charIdx + 1)
    charIdx++
    if (charIdx === word.length) {
      deleting = true
      timer = setTimeout(tick, props.holdMs)
      return
    }
    timer = setTimeout(tick, props.typeSpeed)
  } else {
    display.value = word.slice(0, charIdx - 1)
    charIdx--
    if (charIdx === 0) {
      deleting = false
      wordIdx = (wordIdx + 1) % props.words.length
      timer = setTimeout(tick, props.typeSpeed)
      return
    }
    timer = setTimeout(tick, props.deleteSpeed)
  }
}

onMounted(() => { timer = setTimeout(tick, props.typeSpeed) })
onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <span class="inline-flex items-baseline" style="min-height: 1em;">
    <span aria-live="polite">{{ display || ' ' }}</span>
    <span class="caret" aria-hidden="true"></span>
  </span>
</template>

<style scoped>
.caret {
  display: inline-block;
  width: 0.08em;
  height: 0.85em;
  background: currentColor;
  margin-left: 0.05em;
  align-self: stretch;
  animation: at-blink 0.9s steps(2, end) infinite;
}
@keyframes at-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .caret { animation: none; opacity: 0.7; }
}
</style>
