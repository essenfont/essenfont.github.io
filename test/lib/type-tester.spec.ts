import { describe, it, expect, beforeEach } from 'vitest';
import { initTypeTester } from '../../src/astro/lib/type-tester';

function mountShell(opts: { text?: string; size?: number } = {}): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-tester', '');
  root.innerHTML = `
    <div class="tester-header">
      <span id="tester-folio">— characters</span>
    </div>
    <textarea id="tester-input" rows="3">${opts.text ?? ''}</textarea>
    <div id="tester-output"></div>
    <div class="tester-controls">
      <input id="tester-size-input" type="range" min="24" max="160" value="${opts.size ?? 56}" />
      <span id="tester-size-value">56px</span>
    </div>
  `;
  document.body.appendChild(root);
  return root;
}

describe('initTypeTester', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = mountShell();
  });

  it('renders the initial textarea content into the output on mount', () => {
    root.remove();
    root = mountShell({ text: 'Hello 世界' });

    initTypeTester(root);

    const output = document.getElementById('tester-output')!;
    expect(output.textContent).toBe('Hello 世界');
  });

  it('updates the output when the user types', () => {
    const ctrl = initTypeTester(root)!;
    const input = document.getElementById('tester-input') as HTMLTextAreaElement;
    const output = document.getElementById('tester-output')!;

    input.value = 'new text';
    input.dispatchEvent(new Event('input'));

    expect(output.textContent).toBe('new text');
    expect(ctrl.text()).toBe('new text');
  });

  it('reports codepoint count and UTF-16 code-unit count in the folio', () => {
    initTypeTester(root);
    const input = document.getElementById('tester-input') as HTMLTextAreaElement;
    const folio = document.getElementById('tester-folio')!;

    input.value = 'A';
    input.dispatchEvent(new Event('input'));
    expect(folio.textContent).toBe('1 char · 1 code unit');

    input.value = 'AB';
    input.dispatchEvent(new Event('input'));
    expect(folio.textContent).toBe('2 chars · 2 code units');

    // U+1F600 (😀) is 1 codepoint but 2 UTF-16 code units (surrogate pair).
    input.value = '😀';
    input.dispatchEvent(new Event('input'));
    expect(folio.textContent).toBe('1 char · 2 code units');
  });

  it('syncs output font-size with the slider', () => {
    const ctrl = initTypeTester(root)!;
    const slider = document.getElementById('tester-size-input') as HTMLInputElement;
    const output = document.getElementById('tester-output')!;
    const sizeValue = document.getElementById('tester-size-value')!;

    slider.value = '120';
    slider.dispatchEvent(new Event('input'));

    expect(output.style.fontSize).toBe('120px');
    expect(sizeValue.textContent).toBe('120px');
    expect(ctrl.size()).toBe(120);
  });

  it('initial size applies on mount', () => {
    root.remove();
    root = mountShell({ size: 100 });

    initTypeTester(root);

    const output = document.getElementById('tester-output')!;
    expect(output.style.fontSize).toBe('100px');
  });

  it('detach() removes input and size listeners', () => {
    const ctrl = initTypeTester(root)!;
    const input = document.getElementById('tester-input') as HTMLTextAreaElement;
    const output = document.getElementById('tester-output')!;

    ctrl.detach();

    input.value = 'after detach';
    input.dispatchEvent(new Event('input'));

    expect(output.textContent).not.toBe('after detach');
  });
});
