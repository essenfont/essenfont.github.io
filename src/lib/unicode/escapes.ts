// escapes.ts: pure functions for codepoint → escape format conversions.
//
// Extracted from UnicodeCharPage.vue where they lived as 9 separate
// `computed()` blocks with no test coverage. Now pure + unit-testable.
// Used by UnicodeCharPage, SearchPage results, future "copy as…" menus.

export function utf8(cp: number): string {
  const buf = new TextEncoder().encode(String.fromCodePoint(cp))
  return Array.from(buf)
    .map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ")
}

export function utf16(cp: number): string {
  if (cp <= 0xffff) return "0x" + cp.toString(16).toUpperCase().padStart(4, "0")
  const offset = cp - 0x10000
  const hi = 0xd800 + (offset >> 10)
  const lo = 0xdc00 + (offset & 0x3ff)
  return (
    "0x" + hi.toString(16).toUpperCase().padStart(4, "0") +
    " 0x" + lo.toString(16).toUpperCase().padStart(4, "0")
  )
}

export function utf32(cp: number): string {
  return "0x" + cp.toString(16).toUpperCase().padStart(8, "0")
}

export function urlEncoded(cp: number): string {
  return encodeURIComponent(String.fromCodePoint(cp))
}

export function htmlDecimal(cp: number): string {
  return `&#${cp};`
}

export function htmlHex(cp: number): string {
  return `&#x${cp.toString(16).toUpperCase()};`
}

export function cssEscape(cp: number): string {
  return `\\${cp.toString(16)}`
}

export function jsEscape(cp: number): string {
  return `\\u${cp.toString(16)}`
}

export function pythonEscape(cp: number): string {
  return `"\\u${cp.toString(16)}"`
}

// All escapes as a record, for iterating in UI.
export const ALL_ESCAPES = {
  "HTML Decimal": htmlDecimal,
  "HTML Hex": htmlHex,
  "CSS Escape": cssEscape,
  "JavaScript": jsEscape,
  "Python": pythonEscape,
  "URL Encoded": urlEncoded,
  "UTF-8": utf8,
  "UTF-16": utf16,
  "UTF-32": utf32,
} as const

export type EscapeName = keyof typeof ALL_ESCAPES
