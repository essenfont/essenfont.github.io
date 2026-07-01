<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'

useHead({
  title: 'Not found — Essenfont',
})
</script>

<template>
  <div class="container nf">
    <h1>404</h1>
    <p>That page doesn't exist.</p>
    <p>
      <RouterLink to="/">← Back to Essenfont home</RouterLink>
    </p>
    <p>
      <RouterLink to="/unicode">Browse Unicode →</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.nf {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  gap: 0.5rem;
}
.nf h1 {
  font-family: var(--spec-font-display);
  font-size: 4rem;
  font-weight: 500;
  color: var(--spec-rose);
  margin: 0;
  letter-spacing: -0.03em;
}
.nf p { color: var(--spec-ink-soft); margin: 0; }
.nf a {
  color: var(--spec-rose);
  text-decoration: none;
}
.nf a:hover { text-decoration: underline; }
</style>