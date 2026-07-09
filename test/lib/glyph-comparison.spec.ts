import { describe, it, expect, beforeEach } from 'vitest';
import { attachGlyphComparison } from '../../src/astro/lib/glyph-comparison';

describe('attachGlyphComparison', () => {
  let button: HTMLButtonElement;
  let target: HTMLElement;
  let changes: string[];

  beforeEach(() => {
    button = document.createElement('button');
    button.textContent = 'compare';
    target = document.createElement('span');
    document.body.appendChild(button);
    document.body.appendChild(target);
    changes = [];
  });

  it('starts in essenfont mode and applies the essenfont class', () => {
    attachGlyphComparison(button, target, 'essenfont', 'system');

    expect(target.classList.contains('essenfont')).toBe(true);
    expect(target.classList.contains('system')).toBe(false);
  });

  it('toggles to system on click', () => {
    const ctrl = attachGlyphComparison(button, target, 'essenfont', 'system');

    button.click();

    expect(ctrl.mode()).toBe('system');
    expect(target.classList.contains('system')).toBe(true);
    expect(target.classList.contains('essenfont')).toBe(false);
  });

  it('toggles back to essenfont on a second click', () => {
    const ctrl = attachGlyphComparison(button, target, 'essenfont', 'system');

    button.click();
    button.click();

    expect(ctrl.mode()).toBe('essenfont');
  });

  it('fires onChange with the new mode on every transition', () => {
    attachGlyphComparison(button, target, 'essenfont', 'system', {
      onChange: (mode) => changes.push(mode),
    });

    button.click();
    button.click();
    button.click();

    expect(changes).toEqual(['system', 'essenfont', 'system']);
  });

  it('respects initial mode', () => {
    const ctrl = attachGlyphComparison(button, target, 'essenfont', 'system', {
      initial: 'system',
    });

    expect(ctrl.mode()).toBe('system');
    expect(target.classList.contains('system')).toBe(true);
  });

  it('set() with the current mode is a no-op (no onChange)', () => {
    let changeCount = 0;
    const ctrl = attachGlyphComparison(button, target, 'essenfont', 'system', {
      onChange: () => changeCount++,
    });

    ctrl.set('essenfont');
    expect(changeCount).toBe(0);
    expect(ctrl.mode()).toBe('essenfont');
  });

  it('detach() removes the click listener', () => {
    const ctrl = attachGlyphComparison(button, target, 'essenfont', 'system');

    ctrl.detach();
    button.click();

    expect(ctrl.mode()).toBe('essenfont');
  });
});
