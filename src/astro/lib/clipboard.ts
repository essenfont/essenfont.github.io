// Copy-to-clipboard helper for Astro islands.
//
// Attaches a click listener to a button. On click, reads the current
// text from `getSourceText()` and writes it to the system clipboard.
// The caller owns the visual feedback — pass an `onCopied` callback
// to flip a "Copied!" badge, swap the button label, etc.
//
// Usage:
//   import { attachClipboard } from '../lib/clipboard';
//   <button id="copy-cp">copy</button>
//   const detach = attachClipboard(
//     document.getElementById('copy-cp')!,
//     () => 'U+0041',
//     () => { /* flash "copied" */ },
//   );
//
// Returns a detach function that removes the listener.

export interface AttachClipboardOptions {
  /** Source-of-truth for the text to copy. Called on every click. */
  getSourceText: () => string;
  /** Callback after a successful copy. */
  onCopied?: () => void;
  /** Callback if the copy failed (permissions, no clipboard API, etc.). */
  onError?: (error: unknown) => void;
}

export function attachClipboard(
  button: HTMLButtonElement,
  options: AttachClipboardOptions,
): () => void {
  const { getSourceText, onCopied, onError } = options;

  async function handleClick() {
    const text = getSourceText();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Legacy fallback for browsers without the async clipboard API.
        legacyCopy(text);
      }
      onCopied?.();
    } catch (error) {
      onError?.(error);
    }
  }

  button.addEventListener('click', handleClick);

  return () => button.removeEventListener('click', handleClick);
}

function legacyCopy(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}
