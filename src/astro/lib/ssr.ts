// Port of src/lib/ssr-fetch.ts for Astro's SSG model.
//
// Astro frontmatter (the `---` block) runs at build time in Node,
// so we can read from the filesystem directly. Browser-side fetch
// still goes through fetch() for the few interactive islands.

import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.resolve('./public');

/**
 * Read a JSON file from public/ at build time.
 * Use this in .astro frontmatter — never in client-side code.
 */
export function loadJson<T>(relPath: string): T {
  const fullPath = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

/**
 * Format bytes as KB or MB.
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

/**
 * Format a number with thousands separators.
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
