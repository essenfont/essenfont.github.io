// Encoding escapes for unicode codepoints.

export function utf8(cp: number): string {
  const bytes: number[] = [];
  if (cp < 0x80) {
    bytes.push(cp);
  } else if (cp < 0x800) {
    bytes.push(0xC0 | (cp >> 6));
    bytes.push(0x80 | (cp & 0x3F));
  } else if (cp < 0x10000) {
    bytes.push(0xE0 | (cp >> 12));
    bytes.push(0x80 | ((cp >> 6) & 0x3F));
    bytes.push(0x80 | (cp & 0x3F));
  } else if (cp < 0x200000) {
    bytes.push(0xF0 | (cp >> 18));
    bytes.push(0x80 | ((cp >> 12) & 0x3F));
    bytes.push(0x80 | ((cp >> 6) & 0x3F));
    bytes.push(0x80 | (cp & 0x3F));
  }
  return bytes.map(b => `\\x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(' ');
}

export function utf16(cp: number): string {
  if (cp < 0x10000) {
    return `\\u${cp.toString(16).toUpperCase().padStart(4, '0')}`;
  }
  const high = 0xD800 + ((cp - 0x10000) >> 10);
  const low = 0xDC00 + ((cp - 0x10000) & 0x3FF);
  return `\\u${high.toString(16).toUpperCase()} \\u${low.toString(16).toUpperCase()}`;
}

export function utf32(cp: number): string {
  return `0x${cp.toString(16).toUpperCase().padStart(8, '0')}`;
}

export function urlEncoded(cp: number): string {
  let s = '';
  try { s = encodeURIComponent(String.fromCodePoint(cp)); } catch { /* */ }
  return s;
}

export function pythonEscape(cp: number): string {
  if (cp < 0x10000) {
    return `\\u${cp.toString(16).toUpperCase().padStart(4, '0')}`;
  }
  return `\\U${cp.toString(16).toUpperCase().padStart(8, '0')}`;
}

export function jsEscape(cp: number): string {
  if (cp < 0x10000) {
    return `\\u${cp.toString(16).toUpperCase().padStart(4, '0')}`;
  }
  const high = 0xD800 + ((cp - 0x10000) >> 10);
  const low = 0xDC00 + ((cp - 0x10000) & 0x3FF);
  return `\\u${high.toString(16).toUpperCase()}\\u${low.toString(16).toUpperCase()}`;
}

export function cssEscape(cp: number): string {
  if (cp < 0x10) return `\\${cp.toString(16)} `;
  if (cp < 0x100) return `\\${cp.toString(16)} `;
  if (cp < 0x10000) return `\\${cp.toString(16).toUpperCase()} `;
  return `\\${cp.toString(16).toUpperCase()} `;
}

export function htmlDecimal(cp: number): string {
  return `&#${cp};`;
}

export function htmlHex(cp: number): string {
  return `&#x${cp.toString(16).toUpperCase()};`;
}
