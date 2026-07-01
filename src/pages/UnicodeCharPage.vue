<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import {
  loadAllBlocks, loadBlockCharacters, loadUnihanForCodepoint, hexCp, safeChar, categoryName,
  blockDisplayName, blockSlug, PLANES, charRoute, bidiClassName,
  isControlChar, controlAbbrev, controlName, cEscape,
  displayChar, combiningClassName, scriptDisplayName, UNIHAN_CATEGORIES,
} from '../lib/unicode'
import type { UnicodeBlock, CodepointUnihan } from '../lib/unicode'
import UnihanCategorySection from '../lib/unicode/components/UnihanCategorySection.vue'

const route = useRoute()
const router = useRouter()
const hex = computed(() => route.params.hex as string)
const cp = computed(() => parseInt(hex.value, 16))

const allBlocks = ref<UnicodeBlock[]>([])
const charData = ref<any>(null)
const allCharsInBlock = ref<any[]>([])
const unihan = ref<CodepointUnihan | null>(null)

const block = computed(() => allBlocks.value.find(b => cp.value >= b.start && cp.value <= b.end))
const planeKey = computed(() => block.value?.plane || 'bmp')
const plane = computed(() => PLANES.find(p => p.key === planeKey.value))

const isControl = computed(() => isControlChar(charData.value?.category || '', cp.value))
const abbrev = computed(() => controlAbbrev(cp.value))
const ctrlName = computed(() => controlName(cp.value))
const escapeSeq = computed(() => cEscape(cp.value))
const displayName = computed(() => {
  if (isControl.value && ctrlName.value) return `<${ctrlName.value}>`
  return charData.value?.name || ''
})

const charIndex = computed(() => allCharsInBlock.value.findIndex((c: any) => c.cp === cp.value))
const prevCp = computed(() => charIndex.value > 0 ? allCharsInBlock.value[charIndex.value - 1] : null)
const nextCp = computed(() => charIndex.value >= 0 && charIndex.value < allCharsInBlock.value.length - 1 ? allCharsInBlock.value[charIndex.value + 1] : null)

const utf8 = computed(() => {
  const buf = new TextEncoder().encode(String.fromCodePoint(cp.value))
  return Array.from(buf).map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
})

const utf16 = computed(() => {
  const cpVal = cp.value
  if (cpVal <= 0xFFFF) return '0x' + cpVal.toString(16).toUpperCase().padStart(4, '0')
  const offset = cpVal - 0x10000
  const hi = 0xD800 + (offset >> 10)
  const lo = 0xDC00 + (offset & 0x3FF)
  return '0x' + hi.toString(16).toUpperCase().padStart(4, '0') + ' 0x' + lo.toString(16).toUpperCase().padStart(4, '0')
})

const urlEncoded = computed(() => encodeURIComponent(String.fromCodePoint(cp.value)))

function navigateToCp(targetCp: number) {
  router.push(charRoute(targetCp))
}

async function loadForCurrentCp() {
  charData.value = null
  unihan.value = null
  const b = block.value
  if (b) {
    allCharsInBlock.value = await loadBlockCharacters(b.name)
    charData.value = allCharsInBlock.value.find((c: any) => c.cp === cp.value)
    // Load Unihan data (CJK only). Reads from data/unihan/ during SSG;
    // returns null on client so client-side nav hides the sections.
    unihan.value = await loadUnihanForCodepoint(blockSlug(b.name), cp.value)
  }
}

allBlocks.value = await loadAllBlocks()
await loadForCurrentCp()
watch(hex, () => { loadForCurrentCp() })

useHead(() => ({
  title: charData.value?.name
    ? `U+${hex.value.toUpperCase()} ${charData.value.name} — Unicode Character — Essenfont`
    : `U+${hex.value.toUpperCase()} — Unicode Character — Essenfont`,
  meta: [
    { property: 'og:title', content: `U+${hex.value.toUpperCase()}${charData.value?.name ? ' ' + charData.value.name : ''}` },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: `https://essenfont.github.io/unicode/char/${hex.value}` }],
}))
</script>

<template>
  <div class="container ucp" v-if="charData">
    <nav class="ucp-crumbs">
      <RouterLink to="/unicode">Unicode</RouterLink>
      <span>›</span>
      <RouterLink :to="`/unicode/plane/${planeKey}`">{{ plane?.shortName }}</RouterLink>
      <span>›</span>
      <RouterLink :to="`/unicode/block/${blockSlug(block.name)}`">{{ blockDisplayName(block.name) }}</RouterLink>
      <span>›</span>
      <span class="ucp-crumb-current">{{ hexCp(cp) }}</span>
    </nav>

    <div class="ucp-nav">
      <button v-if="prevCp" @click="navigateToCp(prevCp.cp)" class="ucp-nav-btn ucp-prev">
        ← <span class="ucp-nav-glyph" v-if="!isControlChar(prevCp.category || '', prevCp.cp)">{{ displayChar(prevCp.cp, prevCp.category || '') }}</span>
        <span class="ucp-nav-glyph ucp-nav-ctrl" v-else>{{ controlAbbrev(prevCp.cp) }}</span>
        <span class="ucp-nav-hex">{{ hexCp(prevCp.cp) }}</span>
      </button>
      <span v-else class="ucp-nav-spacer"></span>

      <span class="ucp-nav-current">{{ hexCp(cp) }}</span>

      <button v-if="nextCp" @click="navigateToCp(nextCp.cp)" class="ucp-nav-btn ucp-next">
        <span class="ucp-nav-glyph" v-if="!isControlChar(nextCp.category || '', nextCp.cp)">{{ displayChar(nextCp.cp, nextCp.category || '') }}</span>
        <span class="ucp-nav-glyph ucp-nav-ctrl" v-else>{{ controlAbbrev(nextCp.cp) }}</span>
        <span class="ucp-nav-hex">{{ hexCp(nextCp.cp) }}</span> →
      </button>
      <span v-else class="ucp-nav-spacer"></span>
    </div>

    <div class="ucp-glyph-area">
      <div class="ucp-glyph-stage" v-if="!isControl">
        <div class="ucp-guides">
          <span class="ucp-guide ucp-guide--cap" title="Cap height"></span>
          <span class="ucp-guide ucp-guide--xheight" title="x-height"></span>
          <span class="ucp-guide ucp-guide--baseline" title="Baseline"></span>
        </div>
        <span class="ucp-glyph">{{ displayChar(cp, charData.category) }}</span>
      </div>
      <span v-else class="ucp-control-box">{{ abbrev }}</span>
    </div>

    <h1 class="ucp-name">
      {{ displayName }}
      <span class="ucp-name-abbrev" v-if="isControl && abbrev">({{ abbrev }})</span>
    </h1>
    <code class="ucp-hex">{{ hexCp(cp) }}</code>

    <div class="ucp-sections">
      <section class="ucp-section">
        <h2>Classification</h2>
        <dl>
          <dt v-if="block?.unicodeVersion">Unicode Version</dt>
          <dd v-if="block?.unicodeVersion">{{ block.unicodeVersion }}</dd>
          <dt>Category</dt>
          <dd><RouterLink :to="`/unicode/category/${charData.category}`">{{ categoryName(charData.category) }}</RouterLink> <code>{{ charData.category }}</code></dd>
          <dt>Script</dt>
          <dd><RouterLink :to="`/unicode/scripts/${charData.script}`">{{ scriptDisplayName(charData.script) }}</RouterLink></dd>
          <dt>Block</dt>
          <dd><RouterLink :to="`/unicode/block/${blockSlug(block.name)}`">{{ blockDisplayName(block.name) }}</RouterLink></dd>
          <dt>Plane</dt>
          <dd><RouterLink :to="`/unicode/plane/${planeKey}`">{{ plane?.name }} ({{ plane?.shortName }})</RouterLink></dd>
          <dt v-if="charData.bidiClass">Bidirectional</dt>
          <dd v-if="charData.bidiClass"><RouterLink :to="`/unicode/bidiclass/${charData.bidiClass}`">{{ bidiClassName(charData.bidiClass) }}</RouterLink> <code>{{ charData.bidiClass }}</code></dd>
          <dt>Combining Class</dt>
          <dd><RouterLink :to="`/unicode/combining/${charData.combiningClass || 0}`">{{ combiningClassName(charData.combiningClass || 0) }}</RouterLink> <code>{{ charData.combiningClass || 0 }}</code></dd>
          <dt v-if="charData.mirrored">Mirrored</dt>
          <dd v-if="charData.mirrored">Yes</dd>
          <dt v-if="escapeSeq">Escape Sequence</dt>
          <dd v-if="escapeSeq"><code>{{ escapeSeq }}</code></dd>
        </dl>
      </section>

      <section class="ucp-section">
        <h2>Encodings</h2>
        <dl>
          <dt>HTML Decimal</dt>
          <dd><code>&amp;#{{ cp }};</code></dd>
          <dt>HTML Hex</dt>
          <dd><code>&amp;#x{{ hex }};</code></dd>
          <dt>CSS Escape</dt>
          <dd><code>\{{ hex }}</code></dd>
          <dt>JavaScript</dt>
          <dd><code>\\u{{ hex }}</code></dd>
          <dt>URL Encoded</dt>
          <dd><code>{{ urlEncoded }}</code></dd>
          <dt>UTF-8</dt>
          <dd><code>{{ utf8 }}</code></dd>
          <dt>UTF-16</dt>
          <dd><code>{{ utf16 }}</code></dd>
          <dt>UTF-32</dt>
          <dd><code>0x{{ cp.toString(16).toUpperCase().padStart(8, '0') }}</code></dd>
        </dl>
      </section>

      <section class="ucp-section" v-if="charData.simpleUppercase || charData.simpleLowercase || charData.simpleTitlecase">
        <h2>Case Mappings</h2>
        <dl>
          <template v-if="charData.simpleUppercase">
            <dt>Uppercase</dt>
            <dd>
              <RouterLink :to="charRoute(charData.simpleUppercase)">
                {{ safeChar(parseInt(charData.simpleUppercase, 16)) }} {{ hexCp(parseInt(charData.simpleUppercase, 16)) }}
              </RouterLink>
            </dd>
          </template>
          <template v-if="charData.simpleLowercase">
            <dt>Lowercase</dt>
            <dd>
              <RouterLink :to="charRoute(charData.simpleLowercase)">
                {{ safeChar(parseInt(charData.simpleLowercase, 16)) }} {{ hexCp(parseInt(charData.simpleLowercase, 16)) }}
              </RouterLink>
            </dd>
          </template>
          <template v-if="charData.simpleTitlecase">
            <dt>Title Case</dt>
            <dd>
              <RouterLink :to="charRoute(charData.simpleTitlecase)">
                {{ safeChar(parseInt(charData.simpleTitlecase, 16)) }} {{ hexCp(parseInt(charData.simpleTitlecase, 16)) }}
              </RouterLink>
            </dd>
          </template>
        </dl>
      </section>

      <section class="ucp-section" v-if="charData.decomposition">
        <h2>Decomposition</h2>
        <dl>
          <dt>Decomposes To</dt>
          <dd>
            <template v-for="(part, i) in charData.decomposition.split(' ')" :key="i">
              <RouterLink v-if="part.match(/^[0-9A-Fa-f]+$/)" :to="charRoute(part)">
                {{ safeChar(parseInt(part, 16)) }}
              </RouterLink>
              <code v-else>{{ part }}</code>
              <span v-if="i < charData.decomposition.split(' ').length - 1"> </span>
            </template>
          </dd>
        </dl>
      </section>

      <!-- Unihan sections — one component per category. Data baked in
           during SSG; hidden on client-side nav. -->
      <template v-if="unihan">
        <UnihanCategorySection
          v-for="spec in UNIHAN_CATEGORIES"
          :key="spec.key"
          :heading="spec.heading"
          :fields="unihan[spec.key]"
          :render="spec.render"
          :self-cp="cp"
        />
      </template>
    </div>
  </div>

  <div v-else class="container ucp-notfound">
    <p>Character U+{{ hex }} not found.</p>
    <RouterLink to="/unicode">← Browse Unicode</RouterLink>
  </div>
</template>

<style scoped>
.ucp { padding: 1.5rem 1.5rem 4rem; max-width: 900px; }

.ucp-crumbs {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.8rem; margin-bottom: 1rem; flex-wrap: wrap;
}
.ucp-crumbs a { color: var(--spec-rose); text-decoration: none; }
.ucp-crumbs a:hover { text-decoration: underline; }
.ucp-crumbs span { color: var(--spec-mute); }
.ucp-crumb-current { color: var(--spec-ink) !important; font-weight: 500; }

.ucp-nav {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.5rem;
}
.ucp-nav-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--spec-rule);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--spec-ink);
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.ucp-nav-btn:hover {
  border-color: var(--spec-rose);
  background: var(--vp-c-bg-soft);
  color: var(--spec-rose);
}
.ucp-nav-glyph {
  font-family: var(--spec-font-glyph);
  font-size: 1.5rem;
}
.ucp-nav-hex {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-mute);
}
.ucp-nav-current {
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
  color: var(--spec-mute);
}
.ucp-nav-spacer { width: 80px; }

.ucp-glyph-area {
  display: flex; align-items: center; justify-content: center;
  padding: 3rem 1rem 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}
.ucp-glyph-stage {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
  padding: 0.5rem 3rem;
}
.ucp-guides { position: absolute; inset: 0; pointer-events: none; }
.ucp-guide { position: absolute; left: 0; right: 0; height: 0; }
.ucp-guide--cap { top: 12%; border-top: 1px dashed rgba(0,0,0,0.18); }
.ucp-guide--xheight { top: 32%; border-top: 1px dashed rgba(0,0,0,0.14); }
.ucp-guide--baseline { bottom: 18%; border-top: 2px solid rgba(184,71,95,0.40); }
.ucp-glyph {
  position: relative; z-index: 1;
  font-family: var(--spec-font-glyph);
  font-size: 6rem;
  line-height: 1;
  color: var(--spec-ink);
}
.ucp-control-box {
  font-family: var(--spec-font-mono);
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--spec-mute);
  padding: 1rem 2rem;
  border: 2px dashed var(--spec-rule-strong);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.ucp-name {
  font-family: var(--spec-font-display);
  font-size: 1.6rem; font-weight: 500;
  margin: 0 0 0.3rem;
  color: var(--spec-ink);
}
.ucp-name-abbrev {
  font-family: var(--spec-font-mono);
  font-size: 1rem; font-weight: 500;
  color: var(--spec-mute);
  margin-left: 0.5rem;
}
.ucp-hex {
  font-family: var(--spec-font-mono);
  font-size: 1.1rem;
  color: var(--spec-rose);
}

.ucp-sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.ucp-section h2 {
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
.ucp-section dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 1rem;
  margin: 0;
}
.ucp-section dt {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--spec-mute);
  white-space: nowrap;
}
.ucp-section dd { margin: 0; font-size: 0.85rem; color: var(--spec-ink); }
.ucp-section dd a { color: var(--spec-rose); text-decoration: none; }
.ucp-section dd a:hover { text-decoration: underline; }
.ucp-section dd code {
  font-family: var(--spec-font-mono);
  font-size: 0.75rem;
  background: var(--vp-c-bg-soft);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.ucp-nav-ctrl {
  font-family: var(--spec-font-mono) !important;
  font-size: 0.8rem !important;
  font-weight: 700;
  padding: 0.2rem 0.4rem;
  border: 1px dashed var(--spec-rule-strong);
  border-radius: 3px;
  color: var(--spec-mute);
}

.ucp-notfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 0.5rem;
  color: var(--spec-mute);
}

html.dark .ucp-guide--cap { border-top-color: rgba(255,255,255,0.18); }
html.dark .ucp-guide--xheight { border-top-color: rgba(255,255,255,0.14); }
html.dark .ucp-guide--baseline { border-top-color: rgba(212,113,138,0.40); }
</style>