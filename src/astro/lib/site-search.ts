// SiteSearch island logic. Extracted so it's testable.
//
// Loads /search-index.json lazily on the first keystroke, then filters
// in-memory on every subsequent keystroke. Matches on:
//   - block name (case-insensitive substring)
//   - codepoint hex ("U+0041", "0041", "41" — any prefix form)
//   - codepoint decimal (numeric input matches the decimal value)
//   - single-char literal input (matches the codepoint)
//   - donor family name (case-insensitive substring)
//
// Keyboard nav: ↑/↓ moves the active option, Enter navigates, Esc clears.
// Mouse: hover sets active option, click navigates.

export type ResultKind = 'block' | 'char' | 'donor';

export interface SearchResult {
  kind: ResultKind;
  label: string;
  href: string;
  detail?: string;
}

export interface SearchIndex {
  blocks: Array<{ name: string; slug: string; start: number; end: number }>;
  chars: Array<{ cp: number; name: string }>;
  donors: Array<{ family: string; slug: string; vendor: string }>;
}

const HEX_RE = /^(?:U\+)?([0-9A-Fa-f]{1,6})$/;
const DEC_RE = /^\d{1,8}$/;

export function search(index: SearchIndex, query: string, limit = 12): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const lower = q.toLowerCase();
  const out: SearchResult[] = [];

  // Codepoint hex/decimal / single-char lookups.
  const hexMatch = q.match(HEX_RE);
  const decMatch = q.match(DEC_RE);
  const singleChar = [...q].length === 1 ? q.codePointAt(0) : undefined;

  // Donor matches.
  for (const d of index.donors) {
    if (out.length >= limit) break;
    if (d.family.toLowerCase().includes(lower)) {
      out.push({ kind: 'donor', label: d.family, href: `/donors/${d.slug}`, detail: d.vendor });
    }
  }

  // Block matches.
  for (const b of index.blocks) {
    if (out.length >= limit) break;
    if (b.name.toLowerCase().includes(lower)) {
      out.push({
        kind: 'block',
        label: b.name,
        href: `/unicode/block/${b.slug}`,
        detail: `U+${b.start.toString(16).toUpperCase()}–U+${b.end.toString(16).toUpperCase()}`,
      });
    }
  }

  // Char matches by name.
  if (out.length < limit) {
    for (const c of index.chars) {
      if (out.length >= limit) break;
      if (c.name && c.name.toLowerCase().includes(lower)) {
        out.push({
          kind: 'char',
          label: c.name,
          href: `/unicode/char/${c.cp.toString(16).toUpperCase().padStart(4, '0')}`,
          detail: `U+${c.cp.toString(16).toUpperCase()}`,
        });
      }
    }
  }

  // Direct codepoint lookup (hex).
  if (hexMatch && out.length < limit) {
    const cp = parseInt(hexMatch[1], 16);
    out.unshift({
      kind: 'char',
      label: `U+${cp.toString(16).toUpperCase()}`,
      href: `/unicode/char/${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      detail: cp <= 0x10FFFF ? String.fromCodePoint(cp) : undefined,
    });
  }

  // Direct codepoint lookup (decimal).
  if (decMatch && out.length < limit) {
    const cp = parseInt(decMatch[0], 10);
    if (cp <= 0x10FFFF) {
      out.unshift({
        kind: 'char',
        label: `U+${cp.toString(16).toUpperCase()} (${cp})`,
        href: `/unicode/char/${cp.toString(16).toUpperCase().padStart(4, '0')}`,
        detail: String.fromCodePoint(cp),
      });
    }
  }

  // Direct codepoint lookup (single-character literal).
  if (singleChar !== undefined && out.length < limit) {
    out.unshift({
      kind: 'char',
      label: `U+${singleChar.toString(16).toUpperCase()}`,
      href: `/unicode/char/${singleChar.toString(16).toUpperCase().padStart(4, '0')}`,
      detail: String.fromCodePoint(singleChar),
    });
  }

  return out.slice(0, limit);
}

export interface SiteSearchController {
  /** Re-run the filter against the current input. */
  refresh: () => void;
  /** Move the active option up (-1) or down (+1). */
  moveActive: (delta: number) => void;
  /** Navigate to the currently-active option (Enter). */
  enter: () => void;
  /** Clear input + results (Esc). */
  clear: () => void;
  /** Index of the active option, or -1 when none. */
  activeIndex: () => number;
  /** Detach all event listeners. */
  detach: () => void;
}

export function initSiteSearch(
  input: HTMLInputElement,
  resultsList: HTMLElement,
  options: {
    onNavigate?: (href: string) => void;
    fetchIndex?: () => Promise<SearchIndex>;
  } = {},
): SiteSearchController {
  let index: SearchIndex | null = null;
  let results: SearchResult[] = [];
  let active = -1;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let loading = false;

  const onNavigate = options.onNavigate ?? ((href: string) => { window.location.href = href; });
  const fetchIndex = options.fetchIndex ?? (async () => {
    const res = await fetch('/search-index.json');
    return (await res.json()) as SearchIndex;
  });

  function render() {
    resultsList.innerHTML = '';
    results.forEach((r, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.id = `sr-option-${i}`;
      li.className = `sr-option kind-${r.kind}${i === active ? ' is-active' : ''}`;
      li.dataset.href = r.href;
      li.dataset.index = String(i);

      const label = document.createElement('span');
      label.className = 'sr-label';
      label.textContent = r.label;
      li.appendChild(label);

      if (r.detail) {
        const detail = document.createElement('span');
        detail.className = 'sr-detail mono';
        detail.textContent = r.detail;
        li.appendChild(detail);
      }

      li.addEventListener('mouseenter', () => {
        active = i;
        updateActive();
      });
      li.addEventListener('click', () => {
        onNavigate(r.href);
      });

      resultsList.appendChild(li);
    });
    input.setAttribute('aria-activedescendant', active >= 0 ? `sr-option-${active}` : '');
  }

  function updateActive() {
    resultsList.querySelectorAll<HTMLElement>('.sr-option').forEach((li) => {
      const i = Number(li.dataset.index);
      li.classList.toggle('is-active', i === active);
    });
    input.setAttribute('aria-activedescendant', active >= 0 ? `sr-option-${active}` : '');
  }

  async function refresh() {
    const q = input.value;
    if (!q) {
      results = [];
      active = -1;
      render();
      return;
    }
    if (!index && !loading) {
      loading = true;
      try {
        index = await fetchIndex();
      } catch {
        loading = false;
        return;
      }
      loading = false;
    }
    if (index) {
      results = search(index, q);
      active = results.length > 0 ? 0 : -1;
      render();
    }
  }

  function moveActive(delta: number) {
    if (results.length === 0) return;
    active = (active + delta + results.length) % results.length;
    updateActive();
  }

  function enter() {
    if (active >= 0 && results[active]) {
      onNavigate(results[active].href);
    }
  }

  function clear() {
    input.value = '';
    results = [];
    active = -1;
    render();
    input.focus();
  }

  function handleInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(refresh, 120);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      enter();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clear();
    }
  }

  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeydown);

  return {
    refresh,
    moveActive,
    enter,
    clear,
    activeIndex: () => active,
    detach: () => {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('keydown', handleKeydown);
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  };
}
