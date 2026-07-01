<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { UnicodeBlock, UnicodeCharacter, GridMode } from '..'
import { isControlChar, controlAbbrev, controlName, displayChar } from '..'

const props = withDefaults(defineProps<{
  block: UnicodeBlock
  mode?: GridMode
  showMissing?: boolean
  maxChars?: number
  coveredSet?: Set<number> | null
}>(), {
  mode: 'standalone',
  showMissing: true,
  maxChars: 512,
  coveredSet: null,
})

const emit = defineEmits<{
  (e: 'select', cp: number): void
}>()

// ── Pagination ──
// Large blocks (CJK Extension A = 6,592, Extension B = 42,720,
// Hangul Syllables = 11,184) would render thousands of DOM nodes
// at once. Paginate at maxChars per page.
const currentPage = ref(0)
const pageSize = computed(() => props.maxChars)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.block.characters.length / pageSize.value))
)

// Reset to page 0 when the block changes (navigation between blocks)
watch(() => props.block.name, () => { currentPage.value = 0 })

const pageStart = computed(() => currentPage.value * pageSize.value)
const pageEnd = computed(() => Math.min(pageStart.value + pageSize.value, props.block.characters.length))

const visibleChars = computed(() =>
  props.block.characters.slice(pageStart.value, pageEnd.value)
)

const missingInVisible = computed(() =>
  visibleChars.value.filter(c => isMissing(c.cp)).length
)

function isMissing(cp: number): boolean {
  if (!props.coveredSet) return false
  return !props.coveredSet.has(cp)
}

function displayName(char: UnicodeCharacter): string {
  if (isControlChar(char.category, char.cp)) {
    return controlName(char.cp) || char.name
  }
  return char.name
}

function goToPage(p: number) {
  if (p >= 0 && p < totalPages.value) {
    currentPage.value = p
  }
}
</script>

<template>
  <div class="ub-container">
    <!-- Missing-character banner — shows only when there are gaps -->
    <div class="ub-missing-banner" v-if="missingInVisible > 0">
      <span class="ub-banner-icon">▢</span>
      <span class="ub-banner-text">
        <strong>{{ missingInVisible }}</strong> character{{ missingInVisible === 1 ? '' : 's' }} NOT in essenfont
      </span>
      <span class="ub-banner-hint">shown as tofu boxes below</span>
    </div>

    <div class="ub-grid">
      <button
        v-for="char in visibleChars"
        :key="char.cp"
        :class="['ub-cell', { 'ub-cell-missing': isMissing(char.cp) }]"
        @click="emit('select', char.cp)"
      >
        <span class="ub-cp">{{ char.hex }}</span>

        <!-- Missing: render a tofu box with the hex inside, NOT the
             system-fallback glyph. The user sees exactly what's missing. -->
        <div class="ub-tofu" v-if="isMissing(char.cp) && !isControlChar(char.category, char.cp)">
          <span class="ub-tofu-x">✕</span>
          <span class="ub-tofu-hex">{{ char.hex.replace('U+', '').slice(-4) }}</span>
        </div>
        <div class="ub-glyph-box" v-else-if="isControlChar(char.category, char.cp)">
          <span class="ub-control-box">{{ controlAbbrev(char.cp) }}</span>
        </div>
        <div class="ub-glyph-box" v-else>
          <div class="ub-guides">
            <span class="ub-guide ub-guide--cap"></span>
            <span class="ub-guide ub-guide--baseline"></span>
          </div>
          <span class="ub-glyph">{{ displayChar(char.cp, char.category) }}</span>
        </div>

        <span :class="['ub-name', { 'ub-name-missing': isMissing(char.cp) }]">
          {{ isMissing(char.cp) ? 'NOT IN ESSENFONT' : displayName(char) }}
        </span>
      </button>
    </div>

    <!-- Pager — only shows when the block has more chars than one page -->
    <div class="ub-pager" v-if="totalPages > 1">
      <div class="ub-pager-info">
        Showing
        <strong>{{ (pageStart + 1).toLocaleString() }}</strong>–<strong>{{ pageEnd.toLocaleString() }}</strong>
        of <strong>{{ block.characters.length.toLocaleString() }}</strong>
      </div>
      <div class="ub-pager-controls">
        <button
          class="ub-page-btn"
          :disabled="currentPage === 0"
          @click="goToPage(currentPage - 1)"
          aria-label="Previous page"
        >←</button>
        <span class="ub-page-current">
          {{ currentPage + 1 }} <span class="ub-page-of">/</span> {{ totalPages }}
        </span>
        <button
          class="ub-page-btn"
          :disabled="currentPage >= totalPages - 1"
          @click="goToPage(currentPage + 1)"
          aria-label="Next page"
        >→</button>
      </div>
      <div class="ub-pager-jump" v-if="totalPages > 3">
        <input
          type="number"
          min="1"
          :max="totalPages"
          :value="currentPage + 1"
          @change="(e) => goToPage(parseInt(($event.target as HTMLInputElement).value) - 1)"
          class="ub-page-input"
        />
        <span class="ub-page-jump-label">/ {{ totalPages }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ub-container { width: 100%; }

.ub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 0.5rem;
}

.ub-cell {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
  padding: 0.5rem 0.4rem 0.4rem;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-divider, #e8e6e0);
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s;
  position: relative;
}
.ub-cell:hover {
  border-color: var(--spec-rose);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

/* Missing-from-essenfont: bold red tofu box replacing the glyph.
   The character shows as a cross-hatched square with its hex inside —
   the universal "missing glyph" symbol. Impossible to miss. */
.ub-cell-missing {
  background: rgba(184, 71, 95, 0.05);
  border: 1px solid var(--spec-rose);
}
.ub-cell-missing:hover {
  background: rgba(184, 71, 95, 0.10);
  border-color: var(--spec-rose);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(184, 71, 95, 0.2);
}

.ub-tofu {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  margin: 0.25rem 0;
  background:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 3px,
      rgba(184, 71, 95, 0.15) 3px,
      rgba(184, 71, 95, 0.15) 5px
    );
  border: 2px solid var(--spec-rose);
  border-radius: 3px;
}
.ub-tofu-x {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-family: var(--spec-font-mono);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--spec-rose);
  opacity: 0.35;
  pointer-events: none;
}
.ub-tofu-hex {
  position: relative;
  z-index: 1;
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--spec-rose);
  letter-spacing: 0.06em;
  background: var(--vp-c-bg, #fff);
  padding: 0.1rem 0.35rem;
  border-radius: 2px;
}

.ub-name-missing {
  font-family: var(--spec-font-mono) !important;
  font-size: 0.58rem !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--spec-rose) !important;
  line-height: 1.3;
}

/* Missing banner at top of grid */
.ub-missing-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1rem;
  margin-bottom: 0.75rem;
  background: rgba(184, 71, 95, 0.08);
  border: 1px solid var(--spec-rose);
  border-left: 4px solid var(--spec-rose);
  border-radius: 4px;
  font-family: var(--spec-font-body);
  font-size: 0.88rem;
  color: var(--spec-ink);
  flex-wrap: wrap;
}
.ub-banner-icon {
  font-size: 1.2rem;
  color: var(--spec-rose);
  line-height: 1;
}
.ub-banner-text strong {
  color: var(--spec-rose);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ub-banner-hint {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute);
  margin-left: auto;
}

/* ── Pager ── */
.ub-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft, #f8f7f4);
  border: 1px solid var(--spec-rule, #e8e6e0);
  border-radius: 6px;
  flex-wrap: wrap;
}
.ub-pager-info {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-mute, #75716c);
}
.ub-pager-info strong {
  color: var(--spec-ink, #1c1a18);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ub-pager-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ub-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-family: var(--spec-font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  background: var(--vp-c-bg, #fff);
  color: var(--spec-ink, #1c1a18);
  border: 1px solid var(--spec-rule, rgba(28, 26, 24, 0.16));
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.ub-page-btn:hover:not(:disabled) {
  border-color: var(--spec-rose, #b8475f);
  color: var(--spec-rose, #b8475f);
  background: var(--vp-c-brand-soft, rgba(184, 71, 95, 0.12));
}
.ub-page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.ub-page-current {
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--spec-ink, #1c1a18);
  font-variant-numeric: tabular-nums;
  min-width: 3.5rem;
  text-align: center;
}
.ub-page-of {
  color: var(--spec-mute, #75716c);
  font-weight: 400;
}
.ub-pager-jump {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}
.ub-page-input {
  width: 3rem;
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  text-align: center;
  padding: 0.2rem 0.3rem;
  background: var(--vp-c-bg, #fff);
  color: var(--spec-ink, #1c1a18);
  border: 1px solid var(--spec-rule, rgba(28, 26, 24, 0.16));
  border-radius: 3px;
}
.ub-page-input:focus {
  outline: none;
  border-color: var(--spec-rose, #b8475f);
}
.ub-page-jump-label {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute, #75716c);
}

@media (max-width: 640px) {
  .ub-pager { flex-direction: column; gap: 0.5rem; }
}

.ub-cp {
  font-family: var(--spec-font-mono);
  font-size: 0.6rem;
  color: var(--spec-mute);
  letter-spacing: 0.04em;
}

.ub-glyph-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  margin: 0.25rem 0;
}
.ub-guides {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ub-guide {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
}
.ub-guide--cap {
  top: 10%;
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
}
.ub-guide--xheight {
  top: 32%;
  border-top: 1px dashed rgba(0, 0, 0, 0.10);
}
.ub-guide--baseline {
  bottom: 18%;
  border-top: 1px solid rgba(184, 71, 95, 0.30);
}

.ub-glyph {
  position: relative;
  z-index: 1;
  font-family: var(--spec-font-glyph);
  font-size: 2.4rem;
  line-height: 1;
  color: var(--spec-ink);
}

.ub-control-box {
  position: relative;
  z-index: 1;
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--spec-mute);
  padding: 0.2rem 0.4rem;
  border: 1px dashed var(--spec-rule-strong);
  border-radius: 3px;
  background: var(--vp-c-bg, #fff);
}

.ub-name {
  font-size: 0.68rem;
  color: var(--spec-ink-soft);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 1.7rem;
}

.ub-foot {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-mute);
  background: var(--vp-c-bg-soft, #f8f7f4);
  border-radius: 6px;
  text-align: center;
}

html.dark .ub-guide--cap { border-top-color: rgba(255,255,255,0.12); }
html.dark .ub-guide--xheight { border-top-color: rgba(255,255,255,0.10); }
html.dark .ub-guide--baseline { border-top-color: rgba(212,113,138,0.40); }
</style>