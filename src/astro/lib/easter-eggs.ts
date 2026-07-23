/**
 * Easter eggs + WAAPI animations for essenfont.github.io.
 *
 * Secrets (type anywhere on any page):
 *   ↑↑↓↓←→←→BA    Konami → glyph rain
 *   "essen"       → confetti burst
 *   "tofu"        → tofu box rain
 *   "unicode"     → block completeness celebration
 *   "donor"       → random donor fact
 *   "free"/"open" → open-source celebration
 *   "all"/"100%"  → coverage boast
 *   "font"        → font trivia
 *
 * Click logo ×7  → rainbow spin
 * Click actual file download → confetti at cursor
 */

interface EasterEggState {
  konamiBuffer: string;
  typeBuffer: string;
  logoClicks: number;
  logoResetTimer: number | null;
  bound: boolean;
}

function reduced(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ─── Glyph rain ─────────────────────────────────────────────────── */
function glyphRain(): void {
  if (reduced()) return;
  const glyphs = 'あ𓀀★☰☵𓆎𓃭𓅓𓂻𓈖カඳமி字體フォント𒀀𒁉𒈧ΩλΣხდᚠᚢᚦ'.split('');
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('span');
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    el.style.cssText = `position:fixed;top:-60px;left:${Math.random()*100}vw;font-size:${18+Math.random()*36}px;font-family:var(--spec-font-glyph),var(--spec-font-display),serif;color:var(--ef-accent);opacity:0;pointer-events:none;z-index:99999;text-shadow:0 0 16px var(--ef-accent)`;
    document.body.appendChild(el);
    el.animate(
      [
        { transform: 'translateY(0) rotate(0deg)', opacity: 0 },
        { transform: 'translateY(20vh) rotate(90deg)', opacity: 1, offset: 0.1 },
        { transform: `translateY(110vh) rotate(${360+Math.random()*720}deg)`, opacity: 0 },
      ],
      { duration: 2000+Math.random()*1500, delay: Math.random()*2000, easing: 'cubic-bezier(0.2,0.6,0.4,1)', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }
}

/* ─── Confetti burst ─────────────────────────────────────────────── */
function confetti(x?: number, y?: number, count = 60): void {
  if (reduced()) return;
  const colors = ['#d4a843','#e8c060','#c85050','#e07070','#eceef2','#9ca0ac'];
  const cx = x ?? window.innerWidth/2;
  const cy = y ?? window.innerHeight/2;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const sz = 6+Math.random()*10;
    el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${sz}px;height:${sz}px;background:${colors[i%colors.length]};border-radius:${Math.random()>0.5?'50%':'2px'};pointer-events:none;z-index:99999`;
    document.body.appendChild(el);
    const a = (Math.PI*2*i)/count + Math.random()*0.4;
    const v = 120+Math.random()*250;
    el.animate(
      [
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(a)*v}px,${Math.sin(a)*v+350}px) rotate(${Math.random()*1080}deg) scale(0.3)`, opacity: 0 },
      ],
      { duration: 1400+Math.random()*600, easing: 'cubic-bezier(0.15,0.8,0.3,1)', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }
}

/* ─── Tofu rain ──────────────────────────────────────────────────── */
function tofuRain(): void {
  if (reduced()) return;
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('span');
    el.textContent = '▯';
    el.style.cssText = `position:fixed;top:-60px;left:${Math.random()*100}vw;font-size:${28+Math.random()*24}px;font-family:var(--spec-font-mono),monospace;color:var(--ef-text-3);opacity:0;pointer-events:none;z-index:99999`;
    document.body.appendChild(el);
    el.animate(
      [
        { transform: 'translateY(0) scale(0.5)', opacity: 0 },
        { transform: 'translateY(30vh) scale(1)', opacity: 0.7, offset: 0.15 },
        { transform: 'translateY(110vh) scale(1)', opacity: 0 },
      ],
      { duration: 2500+Math.random()*1000, delay: Math.random()*1500, easing: 'ease-in', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }
}

/* ─── Full-screen flash overlay ──────────────────────────────────── */
function flashOverlay(color: string, text: string): void {
  if (reduced()) { toast(text); return; }
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--spec-font-display);font-size:clamp(2rem,8vw,5rem);font-weight:700;color:${color};background:rgba(10,12,18,0.85);backdrop-filter:blur(8px);z-index:99998;pointer-events:none;opacity:0;text-align:center;padding:2rem;text-shadow:0 0 40px ${color}`;
  el.textContent = text;
  document.body.appendChild(el);
  el.animate(
    [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)', offset: 0.15 },
      { opacity: 1, transform: 'scale(1)', offset: 0.75 },
      { opacity: 0, transform: 'scale(1.1)' },
    ],
    { duration: 1800, easing: 'cubic-bezier(0.2,0.8,0.2,1)', fill: 'forwards' }
  ).onfinish = () => el.remove();
}

/* ─── Toast ──────────────────────────────────────────────────────── */
function toast(msg: string, icon = '✦'): void {
  const existing = document.querySelector('.ef-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'ef-toast';
  el.textContent = `${icon} ${msg}`;
  el.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(120%);background:var(--ef-raised);color:var(--ef-text);font-family:var(--spec-font-mono);font-size:0.85rem;padding:0.7rem 1.4rem;border-radius:var(--ef-radius-sm);border:1px solid var(--ef-accent);box-shadow:var(--ef-shadow-lg);z-index:100000;pointer-events:none;max-width:90vw;text-align:center`;
  document.body.appendChild(el);
  el.animate(
    [{ transform: 'translateX(-50%) translateY(120%)', opacity: 0 }, { transform: 'translateX(-50%) translateY(0)', opacity: 1 }],
    { duration: 200, easing: 'ease-out', fill: 'forwards' }
  );
  setTimeout(() => {
    el.animate(
      [{ opacity: 1 }, { opacity: 0, transform: 'translateX(-50%) translateY(20px)' }],
      { duration: 300, fill: 'forwards' }
    ).onfinish = () => el.remove();
  }, 3000);
}

/* ─── Rainbow spin ───────────────────────────────────────────────── */
function rainbowSpin(target: HTMLElement): void {
  target.animate([{ filter: 'hue-rotate(0deg)' }, { filter: 'hue-rotate(180deg)' }, { filter: 'hue-rotate(360deg)' }],
    { duration: 800, easing: 'ease-in-out' });
  target.animate(
    [{ transform: 'rotateY(0deg) scale(1)' }, { transform: 'rotateY(720deg) scale(1.3)' }, { transform: 'rotateY(1080deg) scale(1)' }],
    { duration: 1200, easing: 'cubic-bezier(0.2,0.8,0.2,1)' }
  );
}

/* ─── Random facts ───────────────────────────────────────────────── */
const DONOR_FACTS = [
  'Noto Sans alone covers 9 scripts. Essenfont covers 338 blocks from 186 donors.',
  'FSung (Full-Sung) covers all CJK Unified Ideographs — over 100,000 characters.',
  'UniHieroglyphica is the canonical Egyptian Hieroglyphs font — 1,072 glyphs.',
  'Every donor is OFL, Apache, MIT, or BSD licensed. Zero proprietary glyphs.',
  'Some donors are synthetic — generated from Unicode Code Chart PDFs by ucode.',
  'The Tangut donor (Noto Serif Tangut) uses CFF outlines extracted via fontisan.',
];

const TRIVIA = [
  'The tofu box (▯) appears when a font lacks a glyph. Essenfont eliminates it for 99.79% of Unicode.',
  'Unicode 17.0.0 assigns 159,866 codepoints across 340 blocks. We cover 338.',
  'A single OpenType font can hold 65,536 glyphs per face. Essenfont uses 5 faces.',
  'The first Unicode version (1.1, 1993) had 34,803 characters. We add 125,000+.',
  'U+FFFD (REPLACEMENT CHARACTER) is the universal "I don\'t know this character" sign. Essenfont has it.',
  'The largest Unicode block is CJK Unified Ideographs: 20,992 characters. We cover all of them.',
  'There are 5 Unicode planes with assigned characters: BMP, SMP, SIP, TIP, SSP. We cover all 5.',
];

const OSS_FACTS = [
  'Essenfont is free and open-source. The UFO source is on GitHub. Go look.',
  'No proprietary glyphs. No commercial restrictions (except FSung\'s non-commercial CJK subset).',
  'The entire build pipeline — fontisan, ucode, essenfont — is open-source Ruby.',
  'You can rebuild Essenfont from source in 10 minutes. The UFOs are committed.',
];

/* ─── Main ───────────────────────────────────────────────────────── */
let state: EasterEggState | null = null;

export function initEasterEggs(): void {
  if (state?.bound) return;
  state = { konamiBuffer: '', typeBuffer: '', logoClicks: 0, logoResetTimer: null, bound: true };

  const KONAMI = 'arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftarrowrightba';

  const TYPE_TRIGGERS: Record<string, () => void> = {
    'essen': () => { confetti(); toast('You typed the magic word!', '✦'); },
    'tofu': () => { tofuRain(); toast('The void stares back.', '▯'); },
    'unicode': () => { flashOverlay('var(--ef-accent)', '100% U17'); confetti(); },
    'donor': () => { toast(DONOR_FACTS[Math.floor(Math.random()*DONOR_FACTS.length)], '🎨'); confetti(window.innerWidth*0.3, window.innerHeight*0.5, 20); },
    'noto': () => { toast('Noto means "no tofu" — Google\'s mission to cover every script.', '🅽'); },
    'free': () => { flashOverlay('#c85050', 'FREE & OPEN'); toast(OSS_FACTS[Math.floor(Math.random()*OSS_FACTS.length)], '🔓'); },
    'open': () => { flashOverlay('#c85050', 'FREE & OPEN'); toast(OSS_FACTS[Math.floor(Math.random()*OSS_FACTS.length)], '🔓'); },
    'all': () => { flashOverlay('var(--ef-accent)', '100% U17'); toast(TRIVIA[Math.floor(Math.random()*TRIVIA.length)], '★'); },
    '100%': () => { flashOverlay('var(--ef-accent)', '100% U17'); },
    'font': () => { toast(TRIVIA[Math.floor(Math.random()*TRIVIA.length)], '🔤'); },
    'ufo': () => { toast('UFO = Unified Font Object. It\'s the source code for fonts.', '🛸'); },
    'glyph': () => { toast('A glyph is a single visual character shape. Essenfont has ~152,000.', '✦'); },
  };

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!state) return;
    const key = e.key.toLowerCase();

    // Konami
    state.konamiBuffer = (state.konamiBuffer + key).slice(-KONAMI.length);
    if (state.konamiBuffer === KONAMI) {
      glyphRain();
      toast('Glyph rain unleashed!', '🌟');
      state.konamiBuffer = '';
      return;
    }

    // Word triggers — accumulate printable chars only
    if (key.length === 1 && /[a-z0-9%]/.test(key)) {
      state.typeBuffer = (state.typeBuffer + key).slice(-12);
      for (const [word, fn] of Object.entries(TYPE_TRIGGERS)) {
        if (state.typeBuffer.endsWith(word)) {
          fn();
          state.typeBuffer = '';
          break;
        }
      }
    }
  });

  // Logo click counter
  document.addEventListener('click', (e: MouseEvent) => {
    if (!state) return;
    const logoTarget = (e.target as HTMLElement)?.closest('.brand-mark, .brand, #hero-logo') as HTMLElement | null;
    if (logoTarget) {
      state.logoClicks++;
      if (state.logoResetTimer) clearTimeout(state.logoResetTimer);
      state.logoResetTimer = window.setTimeout(() => { if (state) state.logoClicks = 0; }, 3000);

      if (state.logoClicks >= 7) {
        rainbowSpin(logoTarget);
        toast('Rainbow mode activated!', '🌈');
        state.logoClicks = 0;
      } else if (state.logoClicks >= 3) {
        logoTarget.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
          { duration: 200, easing: 'ease-out' });
        toast(`${7 - state.logoClicks} more clicks...`, '👀');
      }
    }
  });

  // File download confetti — only on ACTUAL download links, not nav links
  document.addEventListener('click', (e: MouseEvent) => {
    const link = (e.target as HTMLElement)?.closest('a') as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.getAttribute('href') || '';
    // Only fire on direct file download links, not /download nav
    const isFileDownload = / Essenfont-.*\.(otc|ttf|woff2?|zip)/i.test(href)
      || href.includes('releases/download/')
      || link.hasAttribute('download');
    if (isFileDownload && !link.hasAttribute('data-celebrated')) {
      link.setAttribute('data-celebrated', 'true');
      setTimeout(() => link.removeAttribute('data-celebrated'), 2000);
      const r = link.getBoundingClientRect();
      confetti(r.left + r.width/2, r.top + r.height/2, 40);
    }
  }, true);

  // Footer © click → secret messages
  document.addEventListener('click', (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('.site-footer') && t.textContent?.includes('©')) {
      toast([...DONOR_FACTS, ...TRIVIA, ...OSS_FACTS][Math.floor(Math.random()*(DONOR_FACTS.length+TRIVIA.length+OSS_FACTS.length))], '◆');
    }
  });
}

/* ─── Cursor trail — REMOVED (was annoying) ─────────────────────── */
export function initCursorTrail(): void {}
