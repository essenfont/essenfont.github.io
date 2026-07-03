<script setup lang="ts">
// CoverageMap — Unicode 17 coverage infographic, editorial specimen-card
// aesthetic. Each block is a rectangle sized by its codepoint range;
// colour encodes coverage. PUA / Specials / Surrogates are marked
// "Reserved" and excluded from totals — they're empty by Unicode design,
// not by coverage gaps.
//
// Hover UX: cursor-following tooltip via <Teleport to="body"> +
// position:fixed. The tooltip never goes below the fold because it
// tracks the cursor with viewport-edge collision.

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PLANES } from '../lib/unicode'

interface BlockCoverage {
  id: string
  range: string
  first: number
  last: number
  covered: number
  total: number
  pct: number
  status: string
}

interface CoverageData {
  generated_at: string
  blocks: BlockCoverage[]
  totals: {
    blocks: number
    empty: number
    complete: number
    covered: number
    assigned: number
  }
}

const data = ref<CoverageData | null>(null)
const hover = ref<BlockCoverage | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const planeFilter = ref<number | null>(null)
const statusFilter = ref<string | null>(null)

// Load coverage data via the shared useBuildJson composable.
const { useBuildJson } = await import('../composables/useBuildJson')
data.value = (await useBuildJson<CoverageData>('coverage.json')).value
if (!data.value) console.error('Failed to load coverage.json')

// ── Reserved-block detection ──
// PUA + Specials + Surrogates are "empty by Unicode design". Essenfont
// intentionally does not cover them. They're marked RESERVED and excluded
// from the coverage totals so the headline % isn't dragged down by blocks
// that should never be covered.
function isReserved(b: BlockCoverage): boolean {
  return /Private.Use|Surrogates|Specials/i.test(b.id)
}

function isPua(b: BlockCoverage): boolean {
  return /Private.Use/i.test(b.id)
}

// ── Status → colour mapping ──
// Multi-hue palette: each status gets a clearly different colour so
// cells are distinguishable at small sizes. Single-hue (all-pink)
// palettes collapse visually in a dense grid.
//   rose  → fully covered (brand)
//   amber → nearly complete
//   ochre → mostly there
//   sage  → partial — visible hue shift signals "has gaps"
//   stone → empty
//   olive → reserved (with hatch pattern)
const STATUS_COLORS: Record<string, string> = {
  COMPLETE: '#a83a55',
  FULL:     '#c8743a',
  MOSTLY:   '#b8923a',
  PARTIAL:  '#7a8a4a',
  EMPTY:    '#9a968e',
  RESERVED: '#5a6a3a',
}

const STATUS_LABEL: Record<string, string> = {
  COMPLETE: 'Fully covered',
  FULL:     'Nearly complete',
  MOSTLY:   'Mostly covered',
  PARTIAL:  'Partially covered',
  EMPTY:    'No donor yet',
  RESERVED: 'Reserved by Unicode',
}

// Determine the effective status from the percentage, not from the
// upstream-assigned status string. The upstream generator buckets
// 95–100% as "FULL" — which mislabels 100%-covered blocks (e.g. CJK
// Unified Ideographs) as "nearly complete". We re-derive from pct so
// a fully covered block always shows COMPLETE.
function effectiveStatus(b: BlockCoverage): string {
  if (isReserved(b)) return 'RESERVED'
  if (b.pct >= 100) return 'COMPLETE'
  if (b.pct >= 95) return 'FULL'
  if (b.pct >= 50) return 'MOSTLY'
  if (b.pct > 0) return 'PARTIAL'
  return 'EMPTY'
}

function color(b: BlockCoverage): string {
  if (colorMode.value === 'plane') return PLANE_COLORS[blockPlane(b)] ?? '#888'
  return STATUS_COLORS[effectiveStatus(b)] ?? '#888'
}

function statusClass(s: string): string {
  return `status-${s.toLowerCase()}`
}

// ── Plane geometry ──
const PLANE_ORDER = [0, 1, 2, 3, 14, 15, 16]

// Derive PLANE_LABELS and PLANE_COLORS from the unified PLANES constant
// (src/lib/unicode/constants.ts). Single source of truth — no duplication.
const PLANE_LABELS: Record<number, { short: string; full: string; roman: string }> =
  Object.fromEntries(PLANES.map(p => [p.index, { short: p.shortName, full: p.name, roman: p.roman }]))

const PLANE_COLORS: Record<number, string> =
  Object.fromEntries(PLANES.map(p => [p.index, p.color]))

// Two color modes: "coverage" (default) colors by % covered,
// "plane" colors by which subfont carries the block.
const colorMode = ref<'coverage' | 'plane'>('coverage')

function blockPlane(b: BlockCoverage): number {
  return b.first >> 16
}

function blockX(b: BlockCoverage): number {
  return (b.first & 0xFFFF) / 65535 * 100
}

function blockWidth(b: BlockCoverage): number {
  return Math.max(0.4, (b.last - b.first + 1) / 65535 * 100)
}

function blockSlug(b: BlockCoverage): string {
  return b.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function blockAbbr(b: BlockCoverage): string {
  // For wider blocks, show 2-3 letter abbreviation
  return b.id.split('_').map((w: string) => w[0]).join('').toUpperCase().slice(0, 4)
}

const filteredBlocks = computed(() => {
  if (!data.value) return []
  return data.value.blocks.filter((b) => {
    if (planeFilter.value !== null && blockPlane(b) !== planeFilter.value) return false
    if (statusFilter.value && effectiveStatus(b) !== statusFilter.value) return false
    return true
  })
})

// ── Totals (excluding reserved) ──
const overall = computed(() => {
  if (!data.value) return null
  const relevant = data.value.blocks.filter(b => !isReserved(b))
  const assigned = relevant.reduce((s, b) => s + b.total, 0)
  const covered = relevant.reduce((s, b) => s + Math.min(b.covered, b.total), 0)
  const pct = assigned > 0 ? (100 * covered / assigned).toFixed(1) : '0.0'
  const complete = relevant.filter(b => b.status === 'COMPLETE' || b.status === 'FULL').length
  const partial = relevant.filter(b => !['COMPLETE', 'FULL', 'EMPTY'].includes(b.status)).length
  const empty = relevant.filter(b => b.status === 'EMPTY').length
  const reservedCount = data.value.blocks.filter(b => isReserved(b)).length
  return {
    pct,
    covered,
    assigned,
    relevantBlocks: relevant.length,
    complete,
    partial,
    empty,
    reserved: reservedCount,
  }
})

// ── Cursor-following tooltip ──
function onMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

function onEnter(b: BlockCoverage) {
  hover.value = b
}

function onLeave() {
  hover.value = null
}

const tipStyle = computed(() => {
  if (!hover.value) return { display: 'none' }
  const w = 280
  const h = 140
  const pad = 18
  let x = mouseX.value + pad
  let y = mouseY.value + pad
  // Viewport collision: flip to opposite side if near an edge
  if (typeof window !== 'undefined') {
    if (x + w > window.innerWidth - 8) x = mouseX.value - w - pad
    if (y + h > window.innerHeight - 8) y = mouseY.value - h - pad
    if (x < 8) x = 8
    if (y < 8) y = 8
  }
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
  }
})

const STATUS_FILTERS = ['COMPLETE', 'FULL', 'MOSTLY', 'PARTIAL', 'EMPTY', 'RESERVED']
</script>

<template>
  <section class="coverage-map" v-if="data" @mousemove="onMove">
    <!-- Section header — accession label style -->
    <header class="cm-header">
      <span class="cm-accession">№ Coverage</span>
      <h2>Unicode 17 coverage</h2>
      <p class="cm-summary" v-if="overall">
        <span class="cm-big">{{ overall.pct }}<small>%</small></span>
        <span class="cm-summary-text">
          {{ overall.covered.toLocaleString() }} of
          {{ overall.assigned.toLocaleString() }} assigned codepoints
          across {{ overall.relevantBlocks }} blocks.
          <span class="cm-summary-note">
            {{ overall.reserved }} block(s) reserved by Unicode (PUA, Specials, Surrogates) —
            intentionally not covered.
          </span>
        </span>
      </p>
    </header>

    <!-- Legend -->
    <div class="cm-legend">
      <div class="cm-color-mode">
        <span class="cm-mode-label">color by</span>
        <button
          :class="['mode-toggle', { active: colorMode === 'coverage' }]"
          @click="colorMode = 'coverage'"
        >coverage</button>
        <button
          :class="['mode-toggle', { active: colorMode === 'plane' }]"
          @click="colorMode = 'plane'"
        >subfont</button>
      </div>
      <template v-if="colorMode === 'coverage'">
        <button
          v-for="s in STATUS_FILTERS"
          :key="s"
          :class="['legend-chip', statusClass(s), { active: statusFilter === s }]"
          :style="{ '--chip-color': STATUS_COLORS[s] }"
          @click="statusFilter = statusFilter === s ? null : s"
        >
          <span class="legend-swatch"></span>
          <span class="legend-label">{{ STATUS_LABEL[s] }}</span>
        </button>
      </template>
      <template v-else>
        <span
          v-for="p in [0, 1, 2, 3, 14]"
          :key="p"
          class="legend-chip plane-legend"
          :style="{ '--chip-color': PLANE_COLORS[p] }"
        >
          <span class="legend-swatch"></span>
          <span class="legend-label">{{ PLANE_LABELS[p].short }} subfont</span>
        </span>
      </template>
    </div>

    <!-- Plane filter -->
    <div class="cm-plane-filter">
      <span class="cm-filter-label">Plane</span>
      <button
        v-for="p in PLANE_ORDER"
        :key="p"
        :class="['plane-chip', { active: planeFilter === p }]"
        @click="planeFilter = planeFilter === p ? null : p"
      >
        <span class="plane-chip-roman">{{ PLANE_LABELS[p].roman }}</span>
        <span class="plane-chip-code">{{ PLANE_LABELS[p].short }}</span>
      </button>
    </div>

    <!-- The map itself -->
    <div class="cm-canvas">
      <div
        v-for="p in PLANE_ORDER"
        :key="p"
        class="cm-plane-row"
        v-show="planeFilter === null || planeFilter === p"
      >
        <div class="cm-plane-label">
          <span class="cm-plane-roman">{{ PLANE_LABELS[p].roman }}</span>
          <span class="cm-plane-code">{{ PLANE_LABELS[p].short }}</span>
          <span class="cm-plane-full">{{ PLANE_LABELS[p].full }}</span>
        </div>
        <div class="cm-plane-strip">
          <RouterLink
            v-for="b in filteredBlocks.filter(bb => blockPlane(bb) === p)"
            :key="b.id"
            :to="`/unicode/block/${blockSlug(b)}`"
            class="cm-block"
            :class="[
              statusClass(effectiveStatus(b)),
              { dim: statusFilter && effectiveStatus(b) !== statusFilter, reserved: isReserved(b) }
            ]"
            :style="{
              left: blockX(b) + '%',
              width: blockWidth(b) + '%',
              '--block-color': color(b),
            }"
            @mouseenter="onEnter(b)"
            @mouseleave="onLeave"
          >
            <span class="cm-block-abbr" v-if="blockWidth(b) > 5 && !isReserved(b)">
              {{ blockAbbr(b) }}
            </span>
          </RouterLink>
        </div>
        <div class="cm-plane-axis">
          <span>U+{{ (p * 65536).toString(16).toUpperCase().padStart(6, '0') }}</span>
          <span>U+{{ ((p + 1) * 65536 - 1).toString(16).toUpperCase().padStart(6, '0') }}</span>
        </div>
      </div>
    </div>

    <!-- Cursor-following tooltip — teleported to body so it's never
         clipped or below the fold. position: fixed tracks mousemove. -->
    <Teleport to="body">
      <div
        v-if="hover"
        class="cm-tooltip"
        :style="tipStyle"
        :class="statusClass(effectiveStatus(hover))"
      >
        <div class="cm-tip-head">
          <span class="cm-tip-status" :style="{ background: color(hover) }">
            {{ STATUS_LABEL[effectiveStatus(hover)] }}
          </span>
          <span class="cm-tip-plane">{{ PLANE_LABELS[blockPlane(hover)]?.short }}</span>
        </div>
        <div class="cm-tip-name">{{ hover.id.replace(/_/g, ' ') }}</div>
        <div class="cm-tip-range">{{ hover.range }}</div>
        <div class="cm-tip-stats" v-if="!isReserved(hover)">
          <div class="cm-tip-bar">
            <div class="cm-tip-bar-fill" :style="{ width: Math.max(hover.pct, 1) + '%', background: color(hover) }"></div>
          </div>
          <div class="cm-tip-counts">
            <span class="cm-tip-covered">{{ hover.covered.toLocaleString() }}</span>
            <span class="cm-tip-sep">/</span>
            <span class="cm-tip-total">{{ hover.total.toLocaleString() }} cp</span>
            <span class="cm-tip-pct">{{ hover.pct.toFixed(1) }}%</span>
          </div>
          <div class="cm-tip-note" v-if="hover.pct < 100 && hover.pct >= 95">
            Gaps are typically non-printable control characters (Cc) that
            don't need visible glyphs.
          </div>
          <div class="cm-tip-note" v-else-if="hover.pct < 95 && hover.pct > 0">
            Partial donor coverage — some characters may render as tofu.
          </div>
          <div class="cm-tip-note" v-else-if="hover.pct === 0">
            No donor font covers this block yet.
          </div>
        </div>
        <div class="cm-tip-reserved" v-else>
          This block is reserved by the Unicode standard. No characters are
          assigned here; essenfont does not attempt coverage.
        </div>
        <div class="cm-tip-hint">click to browse block →</div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.coverage-map {
  font-family: var(--spec-font-body);
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── Header ── */
.cm-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--spec-rose);
}
.cm-accession {
  display: inline-block;
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--spec-rose);
  margin-bottom: 0.3rem;
}
.cm-header h2 {
  font-family: var(--spec-font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 500;
  margin: 0 0 0.75rem;
  color: var(--spec-ink);
  letter-spacing: -0.025em;
  line-height: 1.1;
}
.cm-summary {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin: 0;
  flex-wrap: wrap;
}
.cm-big {
  font-family: var(--spec-font-display);
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 500;
  color: var(--spec-rose);
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: oldstyle-nums;
}
.cm-big small {
  font-size: 0.5em;
  vertical-align: super;
  font-weight: 400;
  margin-left: 0.05em;
}
.cm-summary-text {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--spec-ink-soft);
  flex: 1;
  min-width: 260px;
}
.cm-summary-note {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--spec-mute);
  font-style: italic;
}

/* ── Legend ── */
.cm-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  align-items: center;
}
.cm-color-mode {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-right: 0.8rem;
  padding-right: 0.8rem;
  border-right: 1px solid var(--spec-rule);
}
.cm-mode-label {
  font-family: var(--spec-font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-ink-soft);
  opacity: 0.7;
}
.mode-toggle {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  background: transparent;
  border: 1px solid var(--spec-rule);
  border-radius: 2px;
  color: var(--spec-ink-soft);
  cursor: pointer;
  transition: all 0.15s;
}
.mode-toggle:hover { border-color: var(--spec-rose); color: var(--spec-rose); }
.mode-toggle.active {
  background: var(--spec-ink);
  color: var(--vp-c-bg);
  border-color: var(--spec-ink);
}
.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 3px;
  cursor: pointer;
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-ink-soft);
  transition: border-color 0.15s, background 0.15s;
}
.plane-legend { cursor: default; }
.plane-legend:hover { border-color: var(--spec-rule); }
.legend-chip:hover {
  border-color: var(--chip-color, var(--spec-rose));
}
.legend-chip.active {
  border-color: var(--chip-color, var(--spec-rose));
  background: var(--vp-c-bg);
  box-shadow: 0 0 0 1px var(--chip-color, var(--spec-rose)) inset;
}
.legend-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: var(--chip-color);
  border-radius: 1px;
}
.legend-chip.status-reserved .legend-swatch {
  background: repeating-linear-gradient(
    45deg,
    var(--chip-color),
    var(--chip-color) 2px,
    transparent 2px,
    transparent 4px
  );
  border: 1px solid var(--chip-color);
}

/* ── Plane filter ── */
.cm-plane-filter {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.cm-filter-label {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--spec-mute);
  margin-right: 0.25rem;
}
.plane-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 3px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-decoration: none;
}
.plane-chip:hover {
  border-color: var(--spec-rose);
}
.plane-chip.active {
  background: var(--spec-ink);
  border-color: var(--spec-ink);
}
.plane-chip.active .plane-chip-roman,
.plane-chip.active .plane-chip-code {
  color: var(--spec-paper);
}
.plane-chip-roman {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--spec-rose);
}
.plane-chip-code {
  font-family: var(--spec-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--spec-ink-soft);
}

/* ── Canvas + plane rows ── */
.cm-canvas {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 6px;
  padding: 0.5rem 1rem;
}
.cm-plane-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-rows: auto auto;
  gap: 0.1rem 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px dashed var(--spec-rule);
  align-items: center;
}
.cm-plane-row:last-child {
  border-bottom: none;
}
.cm-plane-label {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}
.cm-plane-roman {
  font-family: var(--spec-font-display);
  font-style: italic;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--spec-rose);
  line-height: 1;
}
.cm-plane-code {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--spec-ink);
}
.cm-plane-full {
  font-size: 0.7rem;
  color: var(--spec-mute);
  line-height: 1.2;
}
.cm-plane-strip {
  position: relative;
  height: 30px;
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule);
  border-radius: 2px;
  overflow: hidden;
}
.cm-plane-axis {
  grid-column: 2;
  display: flex;
  justify-content: space-between;
  font-family: var(--spec-font-mono);
  font-size: 0.62rem;
  color: var(--spec-mute);
  padding-top: 0.1rem;
}

/* ── Block cells ── */
.cm-block {
  position: absolute;
  top: 0;
  bottom: 0;
  cursor: pointer;
  background: var(--block-color);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.12s, transform 0.12s;
  text-decoration: none;
}
.cm-block:hover {
  filter: brightness(1.12) saturate(1.1);
  z-index: 2;
  transform: scaleY(1.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.cm-block.dim {
  opacity: 0.2;
}
.cm-block.reserved {
  background: var(--block-color);
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 3px,
    rgba(255, 255, 255, 0.4) 3px,
    rgba(255, 255, 255, 0.4) 5px
  );
  border-right-style: dashed;
}
.cm-block-abbr {
  font-family: var(--spec-font-mono);
  font-size: 0.58rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  letter-spacing: 0.04em;
}

/* ── Cursor-following tooltip ── */
.cm-tooltip {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  background: var(--vp-c-bg, #f1ece1);
  border: 1px solid var(--spec-rule-strong, rgba(28, 26, 24, 0.5));
  border-radius: 4px;
  padding: 0.6rem 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08);
  font-family: var(--spec-font-body);
  font-size: 0.82rem;
  color: var(--spec-ink);
}
.cm-tip-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.3rem;
}
.cm-tip-status {
  font-family: var(--spec-font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fff;
  padding: 0.12rem 0.4rem;
  border-radius: 2px;
}
.cm-tip-plane {
  font-family: var(--spec-font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--spec-mute);
  letter-spacing: 0.08em;
}
.cm-tip-name {
  font-family: var(--spec-font-display);
  font-size: 0.98rem;
  font-weight: 500;
  color: var(--spec-ink);
  line-height: 1.2;
  margin-bottom: 0.15rem;
  letter-spacing: -0.005em;
}
.cm-tip-range {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-ink-soft);
  margin-bottom: 0.4rem;
}
.cm-tip-bar {
  height: 3px;
  background: var(--spec-rule);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.3rem;
}
.cm-tip-bar-fill {
  height: 100%;
  transition: width 0.15s;
}
.cm-tip-counts {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}
.cm-tip-covered { font-weight: 700; color: var(--spec-ink); }
.cm-tip-sep { color: var(--spec-mute); }
.cm-tip-total { color: var(--spec-mute); }
.cm-tip-pct {
  margin-left: auto;
  font-weight: 700;
  color: var(--spec-rose);
}
.cm-tip-note {
  font-family: var(--spec-font-body);
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--spec-mute);
  font-style: italic;
  margin-top: 0.35rem;
}
.cm-tip-reserved {
  font-size: 0.76rem;
  color: var(--spec-ink-soft);
  line-height: 1.45;
  font-style: italic;
  margin: 0.2rem 0 0.4rem;
  padding: 0.4rem 0.5rem;
  background: rgba(107, 122, 63, 0.08);
  border-left: 2px solid #6b7a3f;
  border-radius: 0 2px 2px 0;
}
.cm-tip-hint {
  font-family: var(--spec-font-mono);
  font-size: 0.62rem;
  color: var(--spec-mute);
  letter-spacing: 0.05em;
  margin-top: 0.4rem;
  padding-top: 0.35rem;
  border-top: 1px solid var(--spec-rule);
}

@media (max-width: 768px) {
  .cm-plane-row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
  .cm-plane-label {
    flex-direction: row;
    gap: 0.5rem;
    align-items: baseline;
  }
  .cm-plane-axis { display: none; }
  .cm-tooltip { width: 240px !important; }
}

/* Dark mode adjustments */
html.dark .cm-block {
  border-right-color: rgba(255, 255, 255, 0.1);
}
html.dark .cm-block-abbr {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}
</style>