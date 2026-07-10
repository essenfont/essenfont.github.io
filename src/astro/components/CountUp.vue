<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  /** Animation duration in ms */
  duration?: number
  /** Optional format function */
  format?: (n: number) => string
}>(), {
  duration: 1800,
  format: (n: number) => n.toLocaleString('en-US'),
})

const displayed = ref(0)
let raf: number | null = null
let started = false

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function start() {
  if (started) return
  started = true
  const begin = performance.now()
  function step(now: number) {
    const t = Math.min((now - begin) / props.duration, 1)
    displayed.value = Math.round(props.value * easeOutCubic(t))
    if (t < 1) raf = requestAnimationFrame(step)
    else { displayed.value = props.value; raf = null }
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => { start() })
</script>

<template>
  <span>{{ format(displayed) }}</span>
</template>
