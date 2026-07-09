export interface PlaneMeta {
  key: PlaneKey
  name: string
  shortName: string
  range: string
  start: number
  end: number
  index: number
  code: string
  roman: string
  color: string
  isReserved: boolean
  notable: string[]
}

export const PLANES: PlaneMeta[] = [
  { key: 'bmp', name: 'Basic Multilingual Plane', shortName: 'BMP', range: 'U+0000–U+FFFF', start: 0x0000, end: 0xFFFF,
    index: 0, code: '0', roman: 'I', color: '#b8475f', isReserved: false,
    notable: ['Latin', 'Greek', 'Cyrillic', 'Arabic', 'Hebrew', 'Devanagari', 'CJK Unified Ideographs', 'Egyptian Hieroglyphs'] },
  { key: 'smp', name: 'Supplementary Multilingual Plane', shortName: 'SMP', range: 'U+10000–U+1FFFF', start: 0x10000, end: 0x1FFFF,
    index: 1, code: '1', roman: 'II', color: '#3d8b8b', isReserved: false,
    notable: ['Linear B', 'Ogham', 'Braille', 'Musical Symbols', 'Mathematical Alphanumeric', 'Emoji', 'Tolong Siki', 'Tai Yo'] },
  { key: 'sip', name: 'Supplementary Ideographic Plane', shortName: 'SIP', range: 'U+20000–U+2FFFF', start: 0x20000, end: 0x2FFFF,
    index: 2, code: '2', roman: 'III', color: '#7d4ea6', isReserved: false,
    notable: ['CJK Extension B', 'CJK Extension C', 'CJK Extension D', 'CJK Extension E', 'CJK Extension F', 'CJK Extension I'] },
  { key: 'tip', name: 'Tertiary Ideographic Plane', shortName: 'TIP', range: 'U+30000–U+3FFFF', start: 0x30000, end: 0x3FFFF,
    index: 3, code: '3', roman: 'IV', color: '#d97757', isReserved: false,
    notable: ['CJK Extension G', 'CJK Extension H', 'CJK Extension J', 'Tangut', 'Khitan Small Script', 'Nushu'] },
  { key: 'ssp', name: 'Special-purpose Plane', shortName: 'SSP', range: 'U+E0000–U+EFFFF', start: 0xE0000, end: 0xEFFFF,
    index: 14, code: 'E', roman: 'XIV', color: '#c19a3e', isReserved: false,
    notable: ['Tags', 'Variation Selectors Supplement'] },
  { key: 'pua-a', name: 'Supplementary Private Use Area-A', shortName: 'PUA-A', range: 'U+F0000–U+FFFFF', start: 0xF0000, end: 0xFFFFF,
    index: 15, code: 'F', roman: 'XV', color: '#a8a8a8', isReserved: true,
    notable: [] },
  { key: 'pua-b', name: 'Supplementary Private Use Area-B', shortName: 'PUA-B', range: 'U+100000–U+10FFFF', start: 0x100000, end: 0x10FFFF,
    index: 16, code: '10', roman: 'XVI', color: '#a8a8a8', isReserved: true,
    notable: [] },
]

export function planeForCodepoint(cp: number): PlaneKey {
  for (const p of PLANES) {
    if (cp >= p.start && cp <= p.end) return p.key
  }
  return 'bmp'
}

const CATEGORY_NAMES: Record<string, string> = {
  Lu: 'Uppercase Letter', Ll: 'Lowercase Letter', Lt: 'Titlecase Letter',
  Lm: 'Modifier Letter', Lo: 'Other Letter',
  Mn: 'Nonspacing Mark', Mc: 'Spacing Mark', Me: 'Enclosing Mark',
  Nd: 'Decimal Number', Nl: 'Letter Number', No: 'Other Number',
  Pc: 'Connector Punctuation', Pd: 'Dash Punctuation', Ps: 'Open Punctuation',
  Pe: 'Close Punctuation', Pi: 'Initial Punctuation', Pf: 'Final Punctuation',
  Po: 'Other Punctuation',
  Sm: 'Math Symbol', Sc: 'Currency Symbol', Sk: 'Modifier Symbol', So: 'Other Symbol',
  Zs: 'Space Separator', Zl: 'Line Separator', Zp: 'Paragraph Separator',
  Cc: 'Control', Cf: 'Format', Cs: 'Surrogate', Co: 'Private Use', Cn: 'Unassigned',
}

export function categoryName(code: string): string {
  return CATEGORY_NAMES[code] || code
}

export function hexCp(cp: number): string {
  return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0')
}

export function canonicalCodepointHex(cp: number): string {
  return cp.toString(16).toUpperCase().padStart(4, '0')
}

export function blockSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function blockDisplayName(name: string): string {
  return name
}

export function safeChar(cp: number): string {
  try {
    return String.fromCodePoint(cp)
  } catch {
    return ''
  }
}

const DOTTED_CIRCLE = 0x25CC

export function isCombiningMark(category: string): boolean {
  return category === 'Mn' || category === 'Mc' || category === 'Me'
}

export function displayChar(cp: number, category: string): string {
  if (isCombiningMark(category)) {
    return safeChar(DOTTED_CIRCLE) + safeChar(cp)
  }
  return safeChar(cp)
}

export function charRoute(cp: number): string {
  return `/unicode/char/${cp.toString(16).toUpperCase().padStart(4, '0')}`
}

export type ScriptFamily =
  | 'latin'
  | 'cyrillic'
  | 'greek'
  | 'middle-eastern'
  | 'south-se-asian'
  | 'cjk'
  | 'other-scripts'
  | 'emoji'
  | 'symbols-math'
  | 'private-use'
  | 'technical'
  | 'other'

const SCRIPT_FAMILY_PATTERNS: Array<[ScriptFamily, RegExp]> = [
  ['latin', /Latin|IPA|Spacing Modifier|Combining Diacritic/i],
  ['cyrillic', /Cyrillic/i],
  ['greek', /Greek|Coptic/i],
  ['middle-eastern', /Arabic|Hebrew|Syriac|Thaana|Samaritan|Mandaic/i],
  ['south-se-asian', /Devanagari|Bengali|Gurmukhi|Gujarati|Oriya|Tamil|Telugu|Kannada|Malayalam|Sinhala|Thai|Lao|Tibetan|Myanmar/i],
  ['cjk', /CJK|Hiragana|Katakana|Hangul|Bopomofo|Kangxi|Yi|Phags-pa/i],
  ['other-scripts', /Ethiopic|Cherokee|Canadian Aboriginal|Ogham|Runic|Tagalog|Hanunoo|Buhid|Tagbanwa|Khmer|Mongolian|Limbu|Tai Le|New Tai Lue|Buginese|Tai Tham|Tai Viet|Avestan|Egyptian Hieroglyphs|Anatolian|Bamum|Modifier Tone|Latin Extended/i],
  ['emoji', /Emoji|Pictograph|Emoticon|Transport|Alchemy/i],
  ['symbols-math', /Math|Arrow|Geometric|Dingbat|Symbol|Currency|Number|Subscript|Superscript/i],
  ['private-use', /Private Use/i],
  ['technical', /Specials|Variation Selector|Tags|Control Pictures|Block Elements|Box Drawing/i],
]

const SCRIPT_FAMILY_LABELS: Record<ScriptFamily, string> = {
  'latin': 'Latin',
  'cyrillic': 'Cyrillic',
  'greek': 'Greek',
  'middle-eastern': 'Middle Eastern',
  'south-se-asian': 'South & SE Asian',
  'cjk': 'CJK',
  'other-scripts': 'Other Scripts',
  'emoji': 'Emoji',
  'symbols-math': 'Symbols & Math',
  'private-use': 'Private Use',
  'technical': 'Technical',
  'other': 'Other',
}

export function scriptGroup(blockName: string): string {
  for (const [family, pattern] of SCRIPT_FAMILY_PATTERNS) {
    if (pattern.test(blockName)) return SCRIPT_FAMILY_LABELS[family]
  }
  return SCRIPT_FAMILY_LABELS['other']
}

const SCRIPT_NAMES: Record<string, string> = {
  Zinh: 'Inherited', Zyyy: 'Common', Zsym: 'Symbols', Zmth: 'Mathematical',
  Latn: 'Latin', Cyrl: 'Cyrillic', Grek: 'Greek', Arab: 'Arabic',
  Hebr: 'Hebrew', Syrc: 'Syriac', Thaa: 'Thaana', Deva: 'Devanagari',
  Beng: 'Bengali', Gurm: 'Gurmukhi', Gujr: 'Gujarati', Orya: 'Oriya',
  Taml: 'Tamil', Telu: 'Telugu', Knda: 'Kannada', Mlym: 'Malayalam',
  Sinh: 'Sinhala', Thai: 'Thai', Laoo: 'Lao', Tibt: 'Tibetan',
  Mymr: 'Myanmar', Georg: 'Georgian', Hang: 'Hangul',
  Hira: 'Hiragana', Kana: 'Katakana', Hani: 'Han (Chinese)',
  Cans: 'Canadian Aboriginal', Ethi: 'Ethiopic', Cher: 'Cherokee',
  Ogam: 'Ogham', Runr: 'Runic', Khmr: 'Khmer', Mong: 'Mongolian',
  Bopo: 'Bopomofo', Yiii: 'Yi', Tglg: 'Tagalog', Hano: 'Hanunoo',
  Buhd: 'Buhid', Tagb: 'Tagbanwa', Limb: 'Limbu', Tale: 'Tai Le',
  Linb: 'Linear B', Ugar: 'Ugaritic', Shaw: 'Shavian', Osma: 'Osmanya',
  Cprt: 'Cypriot', Brah: 'Brahmi', Khar: 'Kharoshthi',
  Phag: 'Phags-pa', Phnx: 'Phoenician', Nkoo: 'N\'Ko',
  Vaii: 'Vai', Sora: 'Sora Sompeng',
}

export function scriptDisplayName(scriptOrCode: string): string {
  return SCRIPT_NAMES[scriptOrCode] || scriptOrCode
}

const BIDI_CLASS_NAMES: Record<string, string> = {
  L: 'Left-to-Right', R: 'Right-to-Left', AL: 'Right-to-Left Arabic',
  EN: 'European Number', ES: 'European Separator', ET: 'European Terminator',
  AN: 'Arabic Number', CS: 'Common Separator', NSM: 'Nonspacing Mark',
  BN: 'Boundary Neutral', B: 'Paragraph Separator', S: 'Segment Separator',
  WS: 'Whitespace', ON: 'Other Neutral',
  LRE: 'LRE Embedding', LRO: 'LRO Override', RLE: 'RLE Embedding',
  RLO: 'RLO Override', PDF: 'Pop Directional Format', LRI: 'LRI Isolate',
  RLI: 'RLI Isolate', FSI: 'FSI Isolate', PDI: 'Pop Directional Isolate',
}

export function bidiClassName(code: string): string {
  return BIDI_CLASS_NAMES[code] || code
}

const COMBINING_CLASS_NAMES: Record<number, string> = {
  0: 'Not Reordered', 1: 'Overlay', 7: 'Nukta', 8: 'Kana Voicing',
  9: 'Virama', 220: 'Below', 230: 'Above', 233: 'Double Below',
  234: 'Double Above',
}

export function combiningClassName(cc: number): string {
  return COMBINING_CLASS_NAMES[cc] || `Class ${cc}`
}

const CONTROL_ABBREVS: Record<number, string> = {
  0x00: 'NUL', 0x01: 'SOH', 0x02: 'STX', 0x03: 'ETX',
  0x04: 'EOT', 0x05: 'ENQ', 0x06: 'ACK', 0x07: 'BEL',
  0x08: 'BS',  0x09: 'HT',  0x0A: 'LF',  0x0B: 'VT',
  0x0C: 'FF',  0x0D: 'CR',  0x0E: 'SO',  0x0F: 'SI',
  0x10: 'DLE', 0x11: 'DC1', 0x12: 'DC2', 0x13: 'DC3',
  0x14: 'DC4', 0x15: 'NAK', 0x16: 'SYN', 0x17: 'ETB',
  0x18: 'CAN', 0x19: 'EM',  0x1A: 'SUB', 0x1B: 'ESC',
  0x1C: 'FS',  0x1D: 'GS',  0x1E: 'RS',  0x1F: 'US',
  0x7F: 'DEL',
}

const CONTROL_NAMES: Record<number, string> = {
  0x00: 'Null', 0x09: 'Character Tabulation', 0x0A: 'Line Feed',
  0x0D: 'Carriage Return', 0x1B: 'Escape', 0x7F: 'Delete',
}

export function isControlChar(category: string, cp: number): boolean {
  return category === 'Cc' || (cp >= 0x00 && cp <= 0x1F) || cp === 0x7F || (cp >= 0x80 && cp <= 0x9F)
}

export function controlAbbrev(cp: number): string | null {
  return CONTROL_ABBREVS[cp] ?? null
}

export function controlName(cp: number): string | null {
  return CONTROL_NAMES[cp] ?? null
}

const C_ESCAPES: Record<number, string> = {
  0x00: '\\0', 0x07: '\\a', 0x08: '\\b', 0x09: '\\t',
  0x0A: '\\n', 0x0B: '\\v', 0x0C: '\\f', 0x0D: '\\r',
  0x1B: '\\e', 0x22: '\\"', 0x27: "\\'", 0x5C: '\\\\',
}

export function cEscape(cp: number): string | null {
  return C_ESCAPES[cp] ?? null
}

export type { PlaneKey } from './types'

// ── Unihan categories ────────────────────────────────────────────
// Single source of truth for which Unihan categories the char page
// renders and how each one displays. Mirrors fontist.org's pattern.

export type UnihanRenderMode = 'text' | 'variant'

export interface UnihanCategorySpec {
  key: keyof import('./types').CodepointUnihan
  heading: string
  render: UnihanRenderMode
}

export const UNIHAN_CATEGORIES: readonly UnihanCategorySpec[] = [
  { key: 'dictionary_indices',    heading: 'Dictionary Indices',      render: 'text' },
  { key: 'readings',              heading: 'Readings',                 render: 'text' },
  { key: 'variants',              heading: 'Variants',                 render: 'variant' },
  { key: 'numeric_values',        heading: 'Numeric Values',           render: 'text' },
  { key: 'radical_stroke_counts', heading: 'Radical-Stroke Counts',    render: 'text' },
  { key: 'dictionary_like_data',  heading: 'Dictionary-Like Data',     render: 'text' },
  { key: 'irg_sources',           heading: 'IRG Sources',              render: 'text' },
  { key: 'other_mappings',        heading: 'Other Mappings',           render: 'text' },
]