<script setup lang="ts">
import type { UnihanField } from '../types'
import { charRoute } from '../constants'
import { isCodepointRef, isSelfReference, glyphOf } from '../unihan'
import { RouterLink } from 'vue-router'

type RenderMode = 'text' | 'variant'

const props = defineProps<{
  heading: string
  fields: UnihanField[] | undefined
  render: RenderMode
  selfCp: number
}>()

function parseHex(val: string): number {
  return parseInt(val.replace(/^U\+/i, ''), 16)
}
</script>

<template>
  <section v-if="fields && fields.length > 0" class="ucp-section">
    <h2>{{ heading }}</h2>
    <dl>
      <template v-for="(f, i) in fields" :key="i">
        <dt>
          <code>{{ f.name }}</code>
        </dt>
        <dd v-if="render === 'text'">{{ f.values.join(', ') }}</dd>
        <dd v-else>
          <span class="ucp-variant-list">
            <template v-for="(val, j) in f.values" :key="j">
              <span class="ucp-variant-item">
                <span v-if="isSelfReference(val, props.selfCp)" class="ucp-variant-self" title="self-reference">
                  <span class="ucp-variant-self-label">self</span>
                  <span class="ucp-variant-glyph ucp-variant-glyph-self">{{ glyphOf(val) }}</span>
                </span>
                <RouterLink v-else-if="isCodepointRef(val)" :to="charRoute(parseHex(val))" class="ucp-variant-link">
                  <code class="ucp-variant-cp">{{ val }}</code>
                  <span class="ucp-variant-glyph">{{ glyphOf(val) }}</span>
                </RouterLink>
                <code v-else>{{ val }}</code>
              </span>
              <span v-if="j < f.values.length - 1" class="ucp-variant-sep">·</span>
            </template>
          </span>
        </dd>
      </template>
    </dl>
  </section>
</template>

<style scoped>
.ucp-variant-list { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 0.3rem; }
.ucp-variant-item { display: inline-flex; align-items: baseline; gap: 0.35rem; }
.ucp-variant-link { display: inline-flex; align-items: baseline; gap: 0.35rem; text-decoration: none; color: inherit; }
.ucp-variant-link:hover { color: var(--spec-rose); }
.ucp-variant-cp { font-family: var(--spec-font-mono); font-size: 0.85em; color: var(--spec-mute); }
.ucp-variant-glyph {
  font-family: var(--spec-font-glyph);
  font-size: 1.5rem;
  line-height: 1;
  color: var(--spec-ink);
}
.ucp-variant-sep { color: var(--spec-mute); margin: 0 0.2rem; }
.ucp-variant-self {
  display: inline-flex; align-items: baseline; gap: 0.3rem;
  padding: 0.15rem 0.4rem;
  border: 1px dashed var(--spec-rule-strong);
  border-radius: 6px;
  opacity: 0.75;
}
.ucp-variant-self-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--spec-mute);
  font-weight: 500;
}
.ucp-variant-glyph-self { color: var(--spec-mute); }

dl { display: grid; grid-template-columns: auto 1fr; gap: 0.4rem 1rem; margin: 0; }
dt { font-size: 0.75rem; font-weight: 600; color: var(--spec-mute); white-space: nowrap; }
dt code {
  font-family: var(--spec-font-mono);
  font-size: 0.75rem;
  color: var(--spec-rose);
}
dd { margin: 0; font-size: 0.85rem; color: var(--spec-ink); }
dd code {
  font-family: var(--spec-font-mono);
  font-size: 0.75rem;
  background: var(--vp-c-bg-soft);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

h2 {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--spec-rose);
  margin: 0 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--spec-rule);
}
</style>