// Sibling-repo registry — single source of truth for the footer's
// ecosystem column and any other cross-references.
//
// Adding a repo = appending to SIBLING_REPOS. No other file changes.

export interface SiblingRepo {
  /** Display label. */
  label: string;
  /** Full URL. */
  url: string;
  /** One-line role description. */
  role: string;
}

export const SIBLING_REPOS: readonly SiblingRepo[] = [
  {
    label: 'essenfont/essenfont',
    url: 'https://github.com/essenfont/essenfont',
    role: 'Font source + Ruby build pipeline',
  },
  {
    label: 'fontist/fontist',
    url: 'https://github.com/fontist/fontist',
    role: 'Package manager (`fontist install Essenfont`)',
  },
  {
    label: 'fontist/fontisan',
    url: 'https://github.com/fontist/fontisan',
    role: 'Font processor (Stitcher, Collection::Builder)',
  },
  {
    label: 'fontist/fontist.org',
    url: 'https://github.com/fontist/fontist.org',
    role: 'Sister site — patterns we mirror',
  },
] as const;
