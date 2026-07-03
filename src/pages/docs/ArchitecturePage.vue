<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Architecture — Docs — Essenfont',
  meta: [
    { name: 'description', content: 'Why Essenfont ships as an OTC with 5 subfonts. Build pipeline, distribution formats, and @font-face loading strategy.' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/docs/architecture' }],
})

const GH = 'https://github.com/essenfont/essenfont/releases/latest/download'
</script>

<template>
  <div class="doc-page">
    <header class="dp-head">
      <RouterLink to="/docs" class="back">← Docs</RouterLink>
      <span class="flag">№ III · Architecture</span>
      <h1>Why five subfonts, not one TTF</h1>
      <p class="lede">
        TrueType caps a font face at <strong>65,535 glyphs</strong>. Essenfont has
        <strong>~154,000</strong>. The solution: partition by Unicode plane.
      </p>
    </header>

    <!-- The cap -->
    <section class="dp-section">
      <h2>The 65,535 problem</h2>
      <p>
        OpenType/TrueType's <code>maxp.num_glyphs</code> field is a uint16 —
        65,535 is the absolute maximum glyphs per face. Essenfont has ~154,000
        assigned codepoints plus <code>.notdef</code>, control glyphs, and
        composite references. A single TTF <em>physically cannot</em> hold them.
      </p>
      <div class="dp-bar-demo">
        <div class="bar-row">
          <span class="bar-label">TrueType cap</span>
          <div class="bar-track"><div class="bar-fill bar-cap" style="width: 100%"></div></div>
          <span class="bar-num">65,535</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">Essenfont</span>
          <div class="bar-track"><div class="bar-fill bar-full" style="width: 100%"></div>
            <div class="bar-overflow"></div>
          </div>
          <span class="bar-num bar-num-over">~154,000</span>
        </div>
      </div>
      <p class="dp-note">
        Every assigned codepoint lives in exactly one Unicode plane.
        <code>cp &gt;&gt; 16</code> gives the plane number in O(1).
        This is why planes are the natural partition unit — MECE,
        stable across Unicode versions, and semantically meaningful.
      </p>
    </section>

    <!-- Build pipeline SVG -->
    <section class="dp-section">
      <h2>Build pipeline</h2>
      <svg class="dp-diagram" viewBox="0 0 900 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Build pipeline diagram">
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" opacity="0.4"/>
          </marker>
        </defs>
        <!-- Stage 1: Donor fonts -->
        <rect x="10" y="40" width="140" height="200" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>
        <text x="80" y="25" text-anchor="middle" font-family="var(--spec-font-mono)" font-size="9" fill="currentColor" opacity="0.5" letter-spacing="1.5">DONORS</text>
        <rect x="25" y="55" width="110" height="28" rx="4" fill="currentColor" fill-opacity="0.06"/>
        <text x="80" y="73" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7">Noto Sans</text>
        <rect x="25" y="90" width="110" height="28" rx="4" fill="currentColor" fill-opacity="0.06"/>
        <text x="80" y="108" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7">Full-Sung</text>
        <rect x="25" y="125" width="110" height="28" rx="4" fill="currentColor" fill-opacity="0.06"/>
        <text x="80" y="143" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7">Lentariso</text>
        <rect x="25" y="160" width="110" height="28" rx="4" fill="currentColor" fill-opacity="0.06"/>
        <text x="80" y="178" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7">Kedebideri</text>
        <text x="80" y="215" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.4">+ 20 more</text>

        <!-- Arrow -->
        <line x1="155" y1="140" x2="185" y2="140" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" marker-end="url(#arr)"/>
        <text x="170" y="130" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.4">fontisan</text>

        <!-- Stage 2: Assembled TTF -->
        <rect x="190" y="95" width="130" height="90" rx="8" fill="var(--ef-accent)" fill-opacity="0.08" stroke="var(--ef-accent)" stroke-opacity="0.3" stroke-width="1.5"/>
        <text x="255" y="125" text-anchor="middle" font-size="11" fill="var(--ef-accent)" font-weight="600">Essenfont</text>
        <text x="255" y="140" text-anchor="middle" font-size="10" fill="var(--ef-accent)" opacity="0.7">~46 MB TTF</text>
        <text x="255" y="155" text-anchor="middle" font-size="10" fill="var(--ef-accent)" opacity="0.7">~154k glyphs</text>
        <text x="255" y="175" text-anchor="middle" font-size="9" fill="var(--ef-accent)" opacity="0.5">EXCEEDS 65K CAP</text>

        <!-- Arrow -->
        <line x1="325" y1="140" x2="355" y2="140" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" marker-end="url(#arr)"/>
        <text x="340" y="130" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.4">partition</text>

        <!-- Stage 3: 5 planes -->
        <rect x="360" y="40" width="120" height="200" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>
        <text x="420" y="25" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.5" letter-spacing="1.5">PLANES</text>
        <g v-for="(p, i) in [
          { code: 'BMP', n: '~62k' },
          { code: 'SMP', n: '~9k' },
          { code: 'SIP', n: '~60k' },
          { code: 'TIP', n: '~6k' },
          { code: 'SSP', n: '~100' },
        ]" :key="p.code">
          <rect :x="375" :y="55 + i * 38" width="90" height="30" rx="4" fill="var(--ef-accent)" fill-opacity="0.06" stroke="var(--ef-accent)" stroke-opacity="0.2"/>
          <text :x="420" :y="74 + i * 38" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">{{ p.code }} · {{ p.n }}</text>
        </g>

        <!-- Arrow -->
        <line x1="485" y1="140" x2="515" y2="140" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" marker-end="url(#arr)"/>
        <text x="500" y="130" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.4">package</text>

        <!-- Stage 4: Outputs -->
        <rect x="520" y="40" width="370" height="200" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>
        <text x="705" y="25" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.5" letter-spacing="1.5">DISTRIBUTION</text>
        <rect x="535" y="55" width="100" height="50" rx="6" fill="currentColor" fill-opacity="0.04"/>
        <text x="585" y="76" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">OTC</text>
        <text x="585" y="92" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.4">5 faces, ~50MB</text>
        <rect x="650" y="55" width="100" height="50" rx="6" fill="currentColor" fill-opacity="0.04"/>
        <text x="700" y="76" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">Per-plane TTF</text>
        <text x="700" y="92" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.4">5 × .ttf</text>
        <rect x="765" y="55" width="110" height="50" rx="6" fill="currentColor" fill-opacity="0.04"/>
        <text x="820" y="76" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">Per-plane WOFF2</text>
        <text x="820" y="92" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.4">5 × .woff2 (web)</text>
        <rect x="535" y="120" width="340" height="50" rx="6" fill="var(--ef-accent)" fill-opacity="0.06" stroke="var(--ef-accent)" stroke-opacity="0.2"/>
        <text x="705" y="142" text-anchor="middle" font-size="10" fill="var(--ef-accent)" font-weight="600">Per-block WOFF2 (~214 files, ~80 KB each)</text>
        <text x="705" y="158" text-anchor="middle" font-size="8" fill="var(--ef-accent)" opacity="0.5">This site's inline rendering — browser fetches only the block it needs</text>
        <text x="705" y="200" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.4">All formats ship from GitHub Releases</text>
      </svg>
    </section>

    <!-- Format comparison -->
    <section class="dp-section">
      <h2>Format guide</h2>
      <table class="dp-table">
        <thead>
          <tr><th>Format</th><th>Files</th><th>When to use</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>OTC</strong></td>
            <td>1 file, 5 faces</td>
            <td>Desktop install (macOS/Windows/Linux). One file, all planes.</td>
          </tr>
          <tr>
            <td><strong>Per-plane TTF</strong></td>
            <td>5 × .ttf</td>
            <td>Apps that can't read OTC. One face per file.</td>
          </tr>
          <tr>
            <td><strong>Per-plane WOFF2</strong></td>
            <td>5 × .woff2</td>
            <td>External web embed. Use with <code>@font-face</code> + <code>unicode-range</code>. Browser fetches only planes the page uses.</td>
          </tr>
          <tr>
            <td><strong>Per-block WOFF2</strong></td>
            <td>~214 × .woff2</td>
            <td>This site's inline rendering. Most granular — browser fetches ~80 KB per block shown.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- @font-face loading -->
    <section class="dp-section">
      <h2>How @font-face + unicode-range works</h2>
      <p>
        The browser's font matcher checks each <code>@font-face</code> rule's
        <code>unicode-range</code> against the text on the page. If the page
        has no SIP characters, the browser <strong>never downloads</strong>
        the SIP WOFF2 — even though the <code>@font-face</code> rule exists.
      </p>
      <pre class="dp-code"><code>&lt;!-- Load only the planes your page needs --&gt;
@font-face &#123;
  font-family: 'essenfont';
  src: url(' Essenfont-BMP.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0000-FFFF;
&#125;
@font-face &#123;
  font-family: 'essenfont';
  src: url(' Essenfont-SIP.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+20000-2FFFF;
&#125;

&lt;!-- essenfont is the LAST entry — fills gaps --&gt;
body &#123;
  font-family: -apple-system, 'Segoe UI', sans-serif, 'essenfont';
&#125;</code></pre>
      <p class="dp-note">
        No page on your site has CJK Extension B (SIP) characters?
        The browser skips the SIP download entirely. That's how you get
        "full coverage" without loading 50 MB of font data.
      </p>
    </section>

    <!-- Why per-block on this site -->
    <section class="dp-section">
      <h2>Why this site uses per-block WOFF2</h2>
      <p>
        This website serves ~214 per-block WOFF2 files (~80 KB each) instead
        of 5 per-plane WOFF2s. When you view a single Unicode block page
        (e.g., <RouterLink to="/unicode/block/basic-latin">Basic Latin</RouterLink>),
        the browser fetches one 80 KB file — not a 6 MB BMP WOFF2.
      </p>
      <p>
        For your own site, the per-plane WOFF2s are usually the right
        tradeoff: 5 files, simple setup, and <code>unicode-range</code> ensures
        only needed planes download. The per-block approach is for
        this site's browsing interface where users view one block at a time.
      </p>
    </section>
  </div>
</template>

<style scoped>
.doc-page { max-width: 880px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

.dp-head { margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--ef-accent); }
.back { font-family: var(--spec-font-mono); font-size: 0.78rem; color: var(--ef-accent); text-decoration: none; }
.back:hover { text-decoration: underline; }
.flag { display: block; font-family: var(--spec-font-mono); font-size: 0.68rem; color: var(--ef-text-3); letter-spacing: 0.08em; margin: 0.5rem 0; }
.dp-head h1 {
  font-family: var(--spec-font-display);
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 500;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}
.lede { font-size: 1.02rem; line-height: 1.6; color: var(--ef-text-2); max-width: 640px; }
.lede strong { color: var(--ef-text); }

.dp-section { margin-bottom: 2.5rem; }
.dp-section h2 {
  font-family: var(--spec-font-display);
  font-size: 1.35rem;
  font-weight: 500;
  margin: 0 0 0.75rem;
  color: var(--ef-text);
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--ef-rule);
}
.dp-section p {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--ef-text-2);
  margin: 0 0 0.75rem;
}
.dp-section code {
  font-family: var(--spec-font-mono);
  font-size: 0.84rem;
  background: var(--ef-surface);
  padding: 0.05rem 0.35rem;
  border-radius: 3px;
}
.dp-note {
  font-size: 0.88rem !important;
  color: var(--ef-text-3) !important;
  font-style: italic;
  padding: 0.75rem 1rem;
  background: var(--ef-accent-soft);
  border-left: 3px solid var(--ef-accent);
  border-radius: 0 4px 4px 0;
}

/* Bar demo */
.dp-bar-demo { margin: 1rem 0; }
.bar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
.bar-label { font-family: var(--spec-font-mono); font-size: 0.75rem; color: var(--ef-text-3); min-width: 100px; }
.bar-track { flex: 1; height: 24px; background: var(--ef-surface); border-radius: 4px; overflow: hidden; position: relative; max-width: 400px; }
.bar-fill { height: 100%; border-radius: 4px; }
.bar-cap { background: var(--ef-accent); opacity: 0.5; }
.bar-full { background: var(--ef-accent); }
.bar-overflow {
  position: absolute; right: -20px; top: 0; bottom: 0; width: 20px;
  background: repeating-linear-gradient(45deg, var(--ef-accent), var(--ef-accent) 3px, transparent 3px, transparent 6px);
  opacity: 0.3;
}
.bar-num { font-family: var(--spec-font-mono); font-size: 0.82rem; color: var(--ef-text); font-weight: 600; }
.bar-num-over { color: var(--ef-accent); }

/* Diagram */
.dp-diagram {
  width: 100%;
  max-width: 900px;
  height: auto;
  color: var(--ef-text);
  margin: 1rem 0;
}

/* Table */
.dp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.dp-table th, .dp-table td {
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--ef-rule);
  vertical-align: top;
}
.dp-table th {
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ef-text-3);
}
.dp-table td { color: var(--ef-text-2); }
.dp-table td code { font-size: 0.78rem; }

/* Code block */
.dp-code {
  background: var(--ef-text);
  color: var(--ef-bg);
  padding: 1rem 1.25rem;
  border-radius: var(--ef-radius-sm);
  font-family: var(--spec-font-mono);
  font-size: 0.82rem;
  line-height: 1.7;
  overflow-x: auto;
  margin: 0.75rem 0;
}
</style>