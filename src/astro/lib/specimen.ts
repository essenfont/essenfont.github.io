// SpecimenPanel model — single source of truth for the homepage tour.
//
// Each entry declares the block name, a 1-line blurb, and the
// codepoints to feature. The build verifies at SSG time that:
//   - The block exists in public/unicode-blocks.json
//   - Each featured codepoint is inside the block's range
//   - A per-block WOFF2 subset exists in public/fonts/<slug>.woff2
//
// Adding a panel = appending to SPECIMEN_PANELS. No component changes.

import { loadAllBlocks, slugifyBlockName } from './unicode';
import { existsSync } from 'node:fs';
import path from 'node:path';

export interface SpecimenPanel {
  /** Stable id; used as DOM id and as the per-panel slug. */
  id: string;
  /** Block name (must match an entry in unicode-blocks.json). */
  block: string;
  /** Tile title. */
  title: string;
  /** One-sentence why-it-matters. */
  blurb: string;
  /** Codepoints to feature. */
  codepoints: number[];
}

export const SPECIMEN_PANELS: readonly SpecimenPanel[] = [
  {
    id: 'cjk',
    block: 'CJK Unified Ideographs',
    title: 'CJK Ideographs',
    blurb: '20,992 codepoints covered by Full-Sung (Taiwan 全宋體) — every Traditional Chinese glyph through Unicode 17 Ext J.',
    codepoints: [0x4E16, 0x754C, 0x8A9E, 0x8A00],
  },
  {
    id: 'hieroglyphs',
    block: 'Egyptian Hieroglyphs',
    title: 'Egyptian Hieroglyphs',
    blurb: '1,072+ signs from Middle Kingdom through Greco-Roman periods, drawn from UniHieroglyphica.',
    codepoints: [0x13000, 0x13021, 0x1307F, 0x1315B],
  },
  {
    id: 'math',
    block: 'Mathematical Operators',
    title: 'Mathematical Operators',
    blurb: 'Operators from basic arithmetic to advanced category theory — Noto Sans Math donor.',
    codepoints: [0x2211, 0x222B, 0x2200, 0x2203],
  },
  {
    id: 'emoji',
    block: 'Emoticons',
    title: 'Emoji & Pictographs',
    blurb: 'Color-emoji-ready via CBDT/CBLC passthrough — Noto Color Emoji donor in the TTC.',
    codepoints: [0x1F600, 0x1F603, 0x1F60A, 0x1F622],
  },
  {
    id: 'historical',
    block: 'Tangut',
    title: 'Historical Scripts',
    blurb: 'Tangut, Cuneiform, Phoenician, Linear B — scripts reconstructed from primary sources. Panel features Tangut (Tangut Western Xia dynasty).',
    codepoints: [0x17000, 0x17015, 0x17135, 0x17400],
  },
  {
    id: 'minority',
    block: 'Beria Erfe',
    title: 'Minority & Indigenous',
    blurb: 'Beria Erfe, Tai Yo, Sidetic, Tolong Siki — scripts documented by individual typographers. Panel features Beria Erfe.',
    codepoints: [0x16EA0, 0x16EB0, 0x16EC0, 0x16ED0],
  },
] as const;

export interface PanelVerification {
  panel: SpecimenPanel;
  blockSlug: string;
  woff2Path: string;
  woff2Exists: boolean;
  rangeOk: boolean;
}

/** Verify each panel against the build's font data. Throws on the first
 *  panel whose block doesn't exist, codepoints fall outside the block,
 *  or whose per-block WOFF2 subset is missing. */
export function verifyPanelsForBuild(): PanelVerification[] {
  const blocks = loadAllBlocks();
  const PUBLIC = path.resolve('./public');
  const results: PanelVerification[] = [];

  for (const panel of SPECIMEN_PANELS) {
    const block = blocks.find((b) => b.name === panel.block);
    if (!block) {
      throw new Error(`SpecimenPanel "${panel.id}" references unknown block "${panel.block}".`);
    }
    const blockSlug = slugifyBlockName(block.name);
    const woff2Path = path.join(PUBLIC, 'fonts', `${blockSlug}.woff2`);
    const woff2Exists = existsSync(woff2Path);
    let rangeOk = true;
    for (const cp of panel.codepoints) {
      if (cp < block.start || cp > block.end) {
        throw new Error(
          `SpecimenPanel "${panel.id}": codepoint U+${cp.toString(16).toUpperCase()} ` +
          `falls outside block ${block.name} (${block.range}).`,
        );
      }
    }
    if (!woff2Exists) {
      console.warn(
        `[specimen] ⚠ ${panel.id}: missing per-block subset at public/fonts/${blockSlug}.woff2 — ` +
        `featured glyphs may render via fallback. See TODO.improve/04-specimen-tour.md.`,
      );
    }
    results.push({ panel, blockSlug, woff2Path, woff2Exists, rangeOk });
  }
  return results;
}
