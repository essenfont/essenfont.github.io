// Glyph-comparison toggle for Astro islands.
//
// Toggles a target element between two font-family classes — typically
// "essenfont" (real outlines) and "system" (browser default). Used on
// per-char pages so users can see what the font actually contributes.
//
// Usage:
//   import { attachGlyphComparison } from '../lib/glyph-comparison';
//   <button id="compare-btn">Compare with system</button>
//   <span id="glyph" class="essenfont-mode">A</span>
//   const ctrl = attachGlyphComparison(
//     document.getElementById('compare-btn')!,
//     document.getElementById('glyph')!,
//     'essenfont-mode',
//     'system-mode',
//   );
//   // later: ctrl.mode() === 'essenfont' | 'system'
//   ctrl.detach();

export type GlyphMode = 'essenfont' | 'system';

export interface GlyphComparisonController {
  /** Current mode. */
  mode: () => GlyphMode;
  /** Switch to a specific mode (no-op if already there). */
  set: (mode: GlyphMode) => void;
  /** Flip essenfont ↔ system. */
  toggle: () => void;
  /** Remove the click listener. */
  detach: () => void;
}

export function attachGlyphComparison(
  toggleButton: HTMLElement,
  target: HTMLElement,
  essenfontClass: string,
  systemClass: string,
  options: { onChange?: (mode: GlyphMode) => void; initial?: GlyphMode } = {},
): GlyphComparisonController {
  const { onChange, initial = 'essenfont' } = options;
  let current: GlyphMode = initial;

  function apply(mode: GlyphMode) {
    if (mode === 'essenfont') {
      target.classList.add(essenfontClass);
      target.classList.remove(systemClass);
    } else {
      target.classList.add(systemClass);
      target.classList.remove(essenfontClass);
    }
  }

  function set(mode: GlyphMode) {
    if (mode === current) return;
    current = mode;
    apply(mode);
    onChange?.(mode);
  }

  function toggle() {
    set(current === 'essenfont' ? 'system' : 'essenfont');
  }

  function handleClick() {
    toggle();
  }

  apply(current);
  toggleButton.addEventListener('click', handleClick);

  return {
    mode: () => current,
    set,
    toggle,
    detach: () => toggleButton.removeEventListener('click', handleClick),
  };
}
