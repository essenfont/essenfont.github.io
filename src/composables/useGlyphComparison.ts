import { ref } from 'vue'

// Toggle between "essenfont" and "system font" glyph rendering.
// Extracted from UnicodeCharPage — any glyph display area can use it.
//
// When `mode` is 'essenfont', the glyph uses font-family: var(--spec-font-glyph)
// (Essenfont only — tofu if uncovered). When 'system', it uses the body
// font stack (system fallback fills in).
//
// @example
//   const { mode, toggle } = useGlyphComparison()
//   <span :class="mode === 'system' ? 'system-font' : 'essenfont-font'">glyph</span>
export function useGlyphComparison() {
  const mode = ref<'essenfont' | 'system'>('essenfont')

  function toggle() {
    mode.value = mode.value === 'essenfont' ? 'system' : 'essenfont'
  }

  return { mode, toggle }
}