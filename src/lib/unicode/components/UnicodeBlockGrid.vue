<script setup lang="ts">
import { computed } from 'vue'
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

const visibleChars = computed(() =>
  props.block.characters.slice(0, props.maxChars)
)

const missingInVisible = computed(() =>
  visibleChars.value.filter(c => isMissing(c.cp)).length
)

// A character is "missing" if the coverage data is loaded AND the
// codepoint isn't in the font's cmap. When no coverage data is loaded
// (e.g. no coverage file for this block), nothing is marked missing.
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

    <div class="ub-foot" v-if="block.characters.length > visibleChars.length">
      Showing {{ visibleChars.length.toLocaleString() }} of
      {{ block.characters.length.toLocaleString() }} assigned characters.
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