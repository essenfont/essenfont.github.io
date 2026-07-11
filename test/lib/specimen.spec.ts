import { describe, it, expect } from 'vitest';
import { SPECIMEN_PANELS } from '../../src/astro/lib/specimen';

describe('SPECIMEN_PANELS', () => {
  it('has at least 4 panels', () => {
    expect(SPECIMEN_PANELS.length).toBeGreaterThanOrEqual(4);
  });

  it('has unique panel ids', () => {
    const ids = SPECIMEN_PANELS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every panel has non-empty id, block, title, blurb', () => {
    for (const p of SPECIMEN_PANELS) {
      expect(p.id).toBeTruthy();
      expect(p.block).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.blurb).toBeTruthy();
    }
  });

  it('every panel has at least 2 codepoints', () => {
    for (const p of SPECIMEN_PANELS) {
      expect(p.codepoints.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all codepoints are valid Unicode (0x0–0x10FFFF)', () => {
    for (const p of SPECIMEN_PANELS) {
      for (const cp of p.codepoints) {
        expect(cp).toBeGreaterThanOrEqual(0x0);
        expect(cp).toBeLessThanOrEqual(0x10ffff);
        expect(Number.isInteger(cp)).toBe(true);
      }
    }
  });

  it('has unique block names across panels', () => {
    const blocks = SPECIMEN_PANELS.map((p) => p.block);
    expect(new Set(blocks).size).toBe(blocks.length);
  });
});
