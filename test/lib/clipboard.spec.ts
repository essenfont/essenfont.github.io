import { describe, it, expect, beforeEach } from 'vitest';
import { attachClipboard } from '../../src/astro/lib/clipboard';
import { getLastCopiedText, installClipboardStub } from '../setup';

describe('attachClipboard', () => {
  let button: HTMLButtonElement;
  let calls: { copied: number; errored: number };

  beforeEach(() => {
    button = document.createElement('button');
    button.textContent = 'copy';
    document.body.appendChild(button);
    calls = { copied: 0, errored: 0 };
  });

  it('writes the source text to the clipboard on click', async () => {
    attachClipboard(button, {
      getSourceText: () => 'U+0041',
      onCopied: () => { calls.copied++; },
    });

    button.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(getLastCopiedText()).toBe('U+0041');
    expect(calls.copied).toBe(1);
    expect(calls.errored).toBe(0);
  });

  it('calls getSourceText fresh on every click (not memoized)', async () => {
    let count = 0;
    attachClipboard(button, {
      getSourceText: () => `text-${++count}`,
      onCopied: () => {},
    });

    button.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(getLastCopiedText()).toBe('text-1');

    button.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(getLastCopiedText()).toBe('text-2');
  });

  it('calls onError when writeText rejects', async () => {
    // Replace the default stub with a rejecting one for this test only.
    installClipboardStub(async () => { throw new Error('denied'); });

    attachClipboard(button, {
      getSourceText: () => 'will fail',
      onCopied: () => { calls.copied++; },
      onError: () => { calls.errored++; },
    });

    button.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(calls.copied).toBe(0);
    expect(calls.errored).toBe(1);
  });

  it('detach() removes the click listener', async () => {
    const detach = attachClipboard(button, {
      getSourceText: () => 'never',
      onCopied: () => { calls.copied++; },
    });

    detach();
    button.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(calls.copied).toBe(0);
  });
});
