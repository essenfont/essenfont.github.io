/**
 * Easter eggs + WAAPI animations for essenfont.github.io.
 *
 * Injected globally in BaseLayout. Re-binds on astro:page-load so it
 * survives View Transitions. Respects prefers-reduced-motion.
 *
 * Secrets:
 *   ↑↑↓↓←→←→BA    Konami → glyph rain
 *   type "essen"  → confetti burst
 *   click logo ×7  → rainbow spin
 *   type "tofu"   → tofu box rain
 *   click © in footer → secret message
 */

interface EasterEggState {
  konamiBuffer: string;
  typeBuffer: string;
  logoClicks: number;
  logoResetTimer: number | null;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ─── Glyph rain (Konami code) ───────────────────────────────────── */
function glyphRain(): void {
  if (prefersReducedMotion()) return;
  const glyphs = 'あ𓀀★☰ ☵𓆎𓃭𓅓𓂻𓈖埃及ඳत்மமி字體フォント𒀀𒁉'.split('');
  const count = 40;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    el.style.cssText = `
      position: fixed;
      top: -50px;
      left: ${Math.random() * 100}vw;
      font-size: ${16 + Math.random() * 32}px;
      font-family: var(--spec-font-glyph), var(--spec-font-display), serif;
      color: var(--ef-accent);
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      text-shadow: 0 0 12px var(--ef-accent);
    `;
    document.body.appendChild(el);

    const delay = Math.random() * 2000;
    const duration = 2000 + Math.random() * 1500;
    el.animate(
      [
        { transform: `translateY(0) rotate(0deg)`, opacity: 0 },
        { transform: `translateY(20vh) rotate(90deg)`, opacity: 1, offset: 0.1 },
        { transform: `translateY(110vh) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 },
      ],
      { duration, delay, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }
}

/* ─── Confetti burst (type "essen") ──────────────────────────────── */
function confettiBurst(x?: number, y?: number): void {
  if (prefersReducedMotion()) return;
  const colors = ['#d4a843', '#e8c060', '#c85050', '#e07070', '#eceef2', '#9ca0ac'];
  const rect = { x: x ?? window.innerWidth / 2, y: y ?? window.innerHeight / 2 };
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    const size = 6 + Math.random() * 8;
    el.style.cssText = `
      position: fixed;
      left: ${rect.x}px;
      top: ${rect.y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(el);

    const angle = (Math.PI * 2 * i) / 50 + Math.random() * 0.3;
    const velocity = 100 + Math.random() * 200;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 100;

    el.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 300}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 1200 + Math.random() * 600, easing: 'cubic-bezier(0.15, 0.8, 0.3, 1)', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }
}

/* ─── Tofu rain (type "tofu") ────────────────────────────────────── */
function tofuRain(): void {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < 15; i++) {
    const el = document.createElement('span');
    el.textContent = '▯';
    el.style.cssText = `
      position: fixed;
      top: -50px;
      left: ${Math.random() * 100}vw;
      font-size: ${24 + Math.random() * 20}px;
      font-family: var(--spec-font-mono), monospace;
      color: var(--ef-text-3);
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(el);

    el.animate(
      [
        { transform: 'translateY(0) scale(0.5)', opacity: 0 },
        { transform: 'translateY(30vh) scale(1)', opacity: 0.8, offset: 0.15 },
        { transform: 'translateY(110vh) scale(1)', opacity: 0 },
      ],
      { duration: 2500 + Math.random() * 1000, delay: Math.random() * 1500, easing: 'ease-in', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }
}

/* ─── Rainbow logo spin (7 clicks) ───────────────────────────────── */
function rainbowSpin(target: HTMLElement): void {
  const hueShift = [
    { filter: 'hue-rotate(0deg)' },
    { filter: 'hue-rotate(180deg)' },
    { filter: 'hue-rotate(360deg)' },
  ];
  target.animate(hueShift, { duration: 800, iterations: 1, easing: 'ease-in-out' });
  target.animate(
    [{ transform: 'rotateY(0deg) scale(1)' }, { transform: 'rotateY(720deg) scale(1.3)' }, { transform: 'rotateY(1080deg) scale(1)' }],
    { duration: 1200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' }
  );
}

/* ─── Toast notification ─────────────────────────────────────────── */
function toast(msg: string, icon = '✦'): void {
  const el = document.createElement('div');
  el.textContent = `${icon} ${msg}`;
  el.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(120%);
    background: var(--ef-raised);
    color: var(--ef-text);
    font-family: var(--spec-font-mono);
    font-size: 0.82rem;
    padding: 0.6rem 1.2rem;
    border-radius: var(--ef-radius-sm);
    border: 1px solid var(--ef-accent);
    box-shadow: var(--ef-shadow-lg);
    z-index: 10000;
    pointer-events: none;
  `;
  document.body.appendChild(el);
  el.animate(
    [
      { transform: 'translateX(-50%) translateY(120%)', opacity: 0 },
      { transform: 'translateX(-50%) translateY(0)', opacity: 1 },
    ],
    { duration: 200, easing: 'ease-out', fill: 'forwards' }
  );
  setTimeout(() => {
    el.animate(
      [
        { opacity: 1 },
        { opacity: 0, transform: 'translateX(-50%) translateY(20px)' },
      ],
      { duration: 300, fill: 'forwards' }
    ).onfinish = () => el.remove();
  }, 2500);
}

/* ─── Main init ──────────────────────────────────────────────────── */
let state: EasterEggState | null = null;

export function initEasterEggs(): void {
  if (state) return; // already bound
  state = { konamiBuffer: '', typeBuffer: '', logoClicks: 0, logoResetTimer: null };

  const KONAMI = 'arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftarrowrightba';

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!state) return;

    // Konami code
    const key = e.key.toLowerCase();
    state.konamiBuffer = (state.konamiBuffer + key).slice(-KONAMI.length);
    if (state.konamiBuffer === KONAMI) {
      glyphRain();
      toast('Glyph rain unleashed!', '🌟');
      state.konamiBuffer = '';
    }

    // Type "essen" → confetti
    state.typeBuffer = (state.typeBuffer + key).slice(-10);
    if (state.typeBuffer.endsWith('essen')) {
      confettiBurst();
      toast('You typed the magic word!', '✦');
      state.typeBuffer = '';
    }

    // Type "tofu" → tofu rain
    if (state.typeBuffer.endsWith('tofu')) {
      tofuRain();
      toast('The void stares back.', '▯');
      state.typeBuffer = '';
    }
  });

  // Logo click counter (7 clicks = rainbow spin)
  const logoSelector = '.brand-mark, .brand, #hero-logo';
  document.addEventListener('click', (e: MouseEvent) => {
    if (!state) return;
    const target = (e.target as HTMLElement)?.closest(logoSelector) as HTMLElement | null;
    if (!target) {
      state.logoClicks = 0;
      return;
    }
    state.logoClicks++;
    if (state.logoResetTimer) clearTimeout(state.logoResetTimer);
    state.logoResetTimer = window.setTimeout(() => { if (state) state.logoClicks = 0; }, 3000);

    if (state.logoClicks === 7) {
      rainbowSpin(target);
      toast('Rainbow mode activated!', '🌈');
      state.logoClicks = 0;
    } else if (state.logoClicks >= 3) {
      const hints = [
        '', '', '',
        `${7 - state.logoClicks} more...`,
        `${7 - state.logoClicks} more...`,
        `${7 - state.logoClicks} more...`,
        'One more click!',
      ];
      const hint = hints[state.logoClicks];
      if (hint) {
        target.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
          { duration: 200, easing: 'ease-out' }
        );
      }
    }
  });

  // Download button confetti
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href*="/download"], a[href*=" Essenfont-Regular"], .btn-primary');
    if (link && !link.hasAttribute('data-celebrated')) {
      link.setAttribute('data-celebrated', 'true');
      setTimeout(() => link.removeAttribute('data-celebrated'), 2000);
      const rect = link.getBoundingClientRect();
      confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }, true);

  // Footer copyright click → secret message
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.site-footer') && target.textContent?.includes('©')) {
      const messages = [
        'Every glyph in this font came from somewhere.',
        '186 donors. 159,866 codepoints. Zero hand-drawn glyphs.',
        'The UFO source is on GitHub. Go look.',
        'Bookmark: /architecture',
        'Try the Konami code.',
        'Type "tofu" anywhere on this page.',
      ];
      toast(messages[Math.floor(Math.random() * messages.length)], '◆');
    }
  });
}

/* ─── Cursor particle trail (WAAPI, respects reduced-motion) ─────── */
let lastTrail = 0;
export function initCursorTrail(): void {
  if (prefersReducedMotion()) return;
  if (localStorage.getItem('no-trail') === '1') return;
  document.addEventListener('mousemove', (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastTrail < 60) return;
    lastTrail = now;

    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 6px;
      height: 6px;
      background: var(--ef-accent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(el);
    el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5 },
        { transform: `translate(-50%, -50%) translate(${(Math.random() - 0.5) * 40}px, ${(Math.random() - 0.5) * 40}px) scale(0)`, opacity: 0 },
      ],
      { duration: 600, easing: 'ease-out', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }, { passive: true });
}
