// Test setup — runs before every spec file.
//
// Polyfills the browser APIs our islands depend on (clipboard) so
// happy-dom has everything it needs.

let lastCopiedText: string | null = null;

/**
 * Install a fresh clipboard stub. Tests that need to override behavior
 * (e.g. to test error paths) can re-call this with a custom writeText.
 */
export function installClipboardStub(
  writeText: (text: string) => Promise<void> = async (text) => {
    lastCopiedText = text;
  },
): void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
}

export function getLastCopiedText(): string | null {
  return lastCopiedText;
}

export function resetLastCopiedText(): void {
  lastCopiedText = null;
}

// Initial install.
installClipboardStub();

beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  resetLastCopiedText();
  // Re-install the default stub in case a prior test overrode it.
  installClipboardStub();
});
