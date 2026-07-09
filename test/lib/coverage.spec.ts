import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadBlockCoverage,
  loadCoverageIndex,
  isReservedBlock,
} from '../../src/astro/lib/coverage';

const sampleBlockCoverage = {
  covered: [0x41, 0x42, 0x43],
  covered_count: 3,
  assigned_count: 4,
  uncovered_count: 1,
  unassigned_count: 0,
  total_range: 4,
  pct: 75,
  status: 'MOSTLY',
};

const sampleCoverageIndex = {
  generated_at: '2026-07-09T00:00:00Z',
  blocks: [
    { id: 'Basic_Latin', name: 'Basic Latin', range: 'U+0000..U+007F', first: 0, last: 127, covered: 95, total: 128, pct: 74.2, status: 'MOSTLY' },
    { id: 'Private_Use_Area', name: 'Private Use Area', range: 'U+E000..U+F8FF', first: 0xE000, last: 0xF8FF, covered: 0, total: 6400, pct: 0, status: 'RESERVED' },
  ],
  totals: { blocks: 2, assigned_blocks: 1, reserved_blocks: 1, empty: 0, complete: 0, covered: 95, assigned: 128, pct: 74.2 },
};

describe('coverage loaders', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadBlockCoverage', () => {
    it('returns the covered Set + summary on success', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => sampleBlockCoverage,
      } as Response);

      const result = await loadBlockCoverage('basic-latin');

      expect(result).not.toBeNull();
      expect(result!.covered.has(0x41)).toBe(true);
      expect(result!.covered.size).toBe(3);
      expect(result!.summary.pct).toBe(75);
      expect(result!.summary.status).toBe('MOSTLY');
    });

    it('returns null when fetch returns !ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await loadBlockCoverage('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network'));

      const result = await loadBlockCoverage('any');
      expect(result).toBeNull();
    });
  });

  describe('loadCoverageIndex', () => {
    it('returns the parsed CoverageIndex on success', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => sampleCoverageIndex,
      } as Response);

      const result = await loadCoverageIndex();

      expect(result).not.toBeNull();
      expect(result!.blocks.length).toBe(2);
      expect(result!.totals!.covered).toBe(95);
    });

    it('returns null on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network'));

      const result = await loadCoverageIndex();
      expect(result).toBeNull();
    });
  });

  describe('isReservedBlock', () => {
    it('flags Private Use Area as reserved', () => {
      const block = { id: 'Private_Use_Area', name: 'PUA', range: 'U+E000..U+F8FF', first: 0xE000, last: 0xF8FF, covered: 0, total: 6400, pct: 0, status: 'EMPTY' };
      expect(isReservedBlock(block)).toBe(true);
    });

    it('flags Supplemental Private Use Area-B as reserved', () => {
      const block = { id: 'Supplementary_Private_Use_Area-B', name: 'SPUA-B', range: 'U+100000..U+10FFFD', first: 0x100000, last: 0x10FFFD, covered: 0, total: 0, pct: 0, status: 'EMPTY' };
      expect(isReservedBlock(block)).toBe(true);
    });

    it('flags Surrogates as reserved', () => {
      const block = { id: 'Surrogates', name: 'Surrogates', range: 'U+D800..U+DFFF', first: 0xD800, last: 0xDFFF, covered: 0, total: 0, pct: 0, status: 'EMPTY' };
      expect(isReservedBlock(block)).toBe(true);
    });

    it('flags Specials as reserved', () => {
      const block = { id: 'Specials', name: 'Specials', range: 'U+FFF0..U+FFFF', first: 0xFFF0, last: 0xFFFF, covered: 0, total: 0, pct: 0, status: 'EMPTY' };
      expect(isReservedBlock(block)).toBe(true);
    });

    it('passes through a normal block (not reserved)', () => {
      const block = { id: 'Basic_Latin', name: 'Basic Latin', range: 'U+0000..U+007F', first: 0, last: 0x7F, covered: 95, total: 128, pct: 74.2, status: 'MOSTLY' };
      expect(isReservedBlock(block)).toBe(false);
    });
  });
});
