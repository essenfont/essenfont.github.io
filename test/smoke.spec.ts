import { describe, it, expect } from 'vitest';

// Smoke spec — confirms the vitest setup is wired correctly.
// If this fails, the whole suite is suspect.

describe('vitest infrastructure', () => {
  it('runs a synchronous test', () => {
    expect(1 + 1).toBe(2);
  });

  it('has happy-dom globals available', () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
    expect(navigator).toBeDefined();
  });

  it('can create and query DOM elements', () => {
    const div = document.createElement('div');
    div.id = 'probe';
    div.textContent = 'hello';
    document.body.appendChild(div);

    expect(document.getElementById('probe')?.textContent).toBe('hello');
  });

  it('can dispatch events', () => {
    const btn = document.createElement('button');
    let count = 0;
    btn.addEventListener('click', () => count++);
    document.body.appendChild(btn);

    btn.click();
    btn.click();

    expect(count).toBe(2);
  });
});
