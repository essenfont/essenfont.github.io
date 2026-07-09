// TypeTester island logic. Extracted from the .astro shell so it can be
// unit-tested without a DOM walkthrough.
//
// The shell (TypeTester.astro) renders:
//   <div data-tester>
//     <textarea id="X-input">
//     <div id="X-output">
//     <span id="X-folio">counter</span>
//     <input id="X-size-input" type="range">
//     <span id="X-size-value">"56px"</span>
//
// initTypeTester(root) wires it up. Multiple testers can coexist —
// the IDs are scoped by `data-tester` so each root is independent.

export interface TypeTesterController {
  /** Current text in the input. */
  text: () => string;
  /** Current font-size in px. */
  size: () => number;
  /** Detach all listeners. */
  detach: () => void;
}

export function initTypeTester(root: HTMLElement): TypeTesterController | null {
  const input = root.querySelector<HTMLTextAreaElement>('textarea[id$="-input"]');
  const output = root.querySelector<HTMLElement>('[id$="-output"]');
  if (!input || !output) return null;

  const folio = root.querySelector<HTMLElement>('[id$="-folio"]');
  const sizeInput = root.querySelector<HTMLInputElement>('input[type="range"][id$="-size-input"]');
  const sizeValue = root.querySelector<HTMLElement>('[id$="-size-value"]');

  function syncText(): void {
    const text = input.value;
    output.textContent = text;
    if (folio) {
      const chars = [...text].length;
      const codeUnits = text.length;
      folio.textContent = `${chars} char${chars === 1 ? '' : 's'} · ${codeUnits} code unit${codeUnits === 1 ? '' : 's'}`;
    }
  }

  function syncSize(): void {
    if (!sizeInput) return;
    const px = Number(sizeInput.value);
    output.style.fontSize = `${px}px`;
    if (sizeValue) sizeValue.textContent = `${px}px`;
  }

  // Initial render — apply current input + slider values to the output.
  syncText();
  syncSize();

  const inputListener = () => syncText();
  const sizeListener = () => syncSize();
  input.addEventListener('input', inputListener);
  sizeInput?.addEventListener('input', sizeListener);

  return {
    text: () => input.value,
    size: () => Number(sizeInput?.value ?? 0),
    detach: () => {
      input.removeEventListener('input', inputListener);
      sizeInput?.removeEventListener('input', sizeListener);
    },
  };
}
