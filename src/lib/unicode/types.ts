export interface UnicodeCharacter {
  cp: number
  hex: string
  name: string
  category: string
  script: string
  char: string
  combiningClass: number
  bidiClass: string | null
  mirrored: boolean
  simpleUppercase: string | null
  simpleLowercase: string | null
  simpleTitlecase: string | null
  decomposition: string | null
}

export interface UnicodeBlock {
  name: string
  start: number
  end: number
  range: string
  plane: PlaneKey
  displayName: string
  scriptGroup: string
  unicodeVersion: string
  characters: UnicodeCharacter[]
  assignedCount: number
}

export interface UnicodePlane {
  key: PlaneKey
  name: string
  shortName: string
  range: string
  start: number
  end: number
  blocks: UnicodeBlock[]
}

export type PlaneKey = 'bmp' | 'smp' | 'sip' | 'tip' | 'ssp' | 'pua-a' | 'pua-b'

export type GridMode = 'standalone' | 'per-font'

export interface UnihanField {
  name: string
  values: string[]
}

export interface CodepointUnihan {
  dictionary_indices?: UnihanField[]
  readings?: UnihanField[]
  variants?: UnihanField[]
  numeric_values?: UnihanField[]
  radical_stroke_counts?: UnihanField[]
  dictionary_like_data?: UnihanField[]
  irg_sources?: UnihanField[]
  other_mappings?: UnihanField[]
}