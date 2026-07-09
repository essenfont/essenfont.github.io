import { describe, it, expect } from 'vitest';
import { search } from '../../src/astro/lib/site-search';
import type { SearchIndex } from '../../src/astro/lib/site-search';

const sampleIndex: SearchIndex = {
  blocks: [
    { name: 'Basic Latin', slug: 'basic-latin', start: 0, end: 0x7F },
    { name: 'CJK Unified Ideographs Extension G', slug: 'cjk-unified-ideographs-extension-g', start: 0x30000, end: 0x3134F },
  ],
  chars: [
    { cp: 0x41, name: 'LATIN CAPITAL LETTER A' },
    { cp: 0x30F4D, name: 'CJK UNIFIED IDEOGRAPH-30F4D' },
  ],
  donors: [
    { family: 'Noto Sans', slug: 'noto-sans', vendor: 'Google' },
    { family: 'FSung-3', slug: 'fsung-3', vendor: 'Foundry' },
  ],
};

describe('search', () => {
  it('matches a block by name substring (case-insensitive)', () => {
    const results = search(sampleIndex, 'latin');
    expect(results.some(r => r.kind === 'block' && r.label === 'Basic Latin')).toBe(true);
  });

  it('matches a donor family substring', () => {
    const results = search(sampleIndex, 'noto');
    expect(results.some(r => r.kind === 'donor' && r.label === 'Noto Sans')).toBe(true);
  });

  it('matches a char by name substring', () => {
    const results = search(sampleIndex, 'LATIN CAPITAL');
    expect(results.some(r => r.kind === 'char' && r.label === 'LATIN CAPITAL LETTER A')).toBe(true);
  });

  it('matches codepoint hex in U+XXXX form', () => {
    const results = search(sampleIndex, 'U+0041');
    expect(results.some(r => r.kind === 'char' && r.href.endsWith('/char/0041'))).toBe(true);
  });

  it('matches codepoint hex without the U+ prefix', () => {
    const results = search(sampleIndex, '0041');
    expect(results.some(r => r.kind === 'char' && r.href.endsWith('/char/0041'))).toBe(true);
  });

  it('matches codepoint hex with fewer digits (e.g. "41")', () => {
    const results = search(sampleIndex, '41');
    expect(results.some(r => r.kind === 'char' && r.href.endsWith('/char/0041'))).toBe(true);
  });

  it('matches codepoint decimal value', () => {
    const results = search(sampleIndex, '65');  // 0x41
    expect(results.some(r => r.kind === 'char' && r.href.endsWith('/char/0041'))).toBe(true);
  });

  it('matches a single-character literal input', () => {
    const results = search(sampleIndex, 'A');
    expect(results.some(r => r.kind === 'char' && r.href.endsWith('/char/0041'))).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    expect(search(sampleIndex, '')).toEqual([]);
    expect(search(sampleIndex, '   ')).toEqual([]);
  });

  it('respects the limit argument', () => {
    const results = search(sampleIndex, 'a', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('places a direct codepoint hit at the front (unshift)', () => {
    const results = search(sampleIndex, 'U+0041');
    expect(results[0].kind).toBe('char');
    expect(results[0].href).toContain('/char/0041');
  });
});
