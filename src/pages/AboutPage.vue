<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'About — Essenfont',
  meta: [
    { name: 'description', content: 'Essenfont is a single redistributable OpenType font that covers every assigned Unicode 17 codepoint. Built from OFL-licensed donor fonts.' },
    { property: 'og:title', content: 'About Essenfont' },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/about' }],
})
</script>

<template>
  <div class="container-narrow about">
    <header class="about-header">
      <RouterLink to="/" class="about-back">← Home</RouterLink>
      <h1>About Essenfont</h1>
      <p class="lede">
        One font, every Unicode 17 codepoint. The Last Resort font, but with real outlines.
      </p>
    </header>

    <!-- Name -->
    <section>
      <h2>The name</h2>
      <p>
        <strong>Essen</strong> — from <em>essential</em> and <em>Latin</em>:
        the foundational, must-have characters that every script depends on,
        from the Latin alphabet outward to every writing system Unicode encodes.
        <strong>font</strong> — a font, plain and simple. The compound reads as
        <em>"the essential font"</em>, or <em>"a font for the essentials of every script"</em>.
      </p>
      <p>
        The name is also a deliberate echo of <em>essence</em> — the idea that
        the universal, load-bearing character set of human writing has a single
        canonical shape, drawn once and shared everywhere.
      </p>
    </section>

    <!-- Why the font was made -->
    <section>
      <h2>Why essenfont exists</h2>

      <p>
        Modern operating systems ship with a handful of fonts that cover the
        scripts their vendors prioritise — typically Latin, Cyrillic, Greek,
        Arabic, Hebrew, the CJK core, and a small set of Indic scripts. Every
        other script is left to the application, the browser, or the user to
        install. When the right font is missing, the user sees tofu:
        <span class="tofu">▢</span> — an empty rectangle where a glyph should be.
      </p>
      <p>
        For most readers, tofu is an annoyance. For speakers of minority and
        historic scripts, it is a daily reality. A Tai Yo speaker opening a
        web page in their own language sees boxes. An Egyptologist reading a
        paper that quotes Unicode 17 Egyptian Hieroglyphs Extended-B sees
        boxes. A linguist citing Sidetic or Beria Erfe — boxes.
      </p>
      <p>
        The Unicode Consortium maintains the
        <a href="https://github.com/unicode-org/last-resort-font" target="_blank" rel="noopener">Last Resort Font</a>
        as a fallback of last resort. But the Last Resort Font ships
        <em>placeholder</em> glyphs — tofu boxes with hex codepoint labels,
        not real outlines. It tells you <em>which</em> character is missing,
        but it does not render it.
      </p>
      <p>
        Essenfont takes the next step. Instead of placeholder boxes, it ships
        <strong>real vector outlines</strong> for every assigned Unicode 17
        codepoint, extracted from canonical OFL-licensed donor fonts:
        Noto for Latin/Cyrillic/Greek/symbols, Full-Sung for CJK (all
        extensions including Unicode 17 Ext J), UniHieroglyphica for Egyptian
        Hieroglyphs, Lentariso for Sidetic, NotoSerifTaiYo for Tai Yo, and
        ~17 donors in total.
      </p>
      <p>
        Install essenfont once and every Unicode 17 character — every plane,
        every block, every assigned codepoint — renders as the glyph its
        donor font designer drew. No more tofu.
      </p>
    </section>

    <!-- Comparison -->
    <section>
      <h2>Comparison with Last Resort Font</h2>
      <table class="cmp-table">
        <thead>
          <tr>
            <th></th>
            <th>Last Resort Font</th>
            <th>Essenfont</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Glyph source</td>
            <td>Hand-designed tofu boxes (hex codepoint label)</td>
            <td>Vector outlines extracted from real donor fonts</td>
          </tr>
          <tr>
            <td>Build toolchain</td>
            <td>Adobe AFDKO + Python fonttools</td>
            <td>Pure Ruby + <a href="https://github.com/fontist/fontisan" target="_blank" rel="noopener">fontisan</a></td>
          </tr>
          <tr>
            <td>CJK coverage</td>
            <td>Noto Sans CJK (partial)</td>
            <td>Full-Sung family — all extensions incl. Unicode 17 Ext J</td>
          </tr>
          <tr>
            <td>Unicode version</td>
            <td>Last published at Unicode 16</td>
            <td>Unicode 17 (Sidetic, Beria Erfe, Tai Yo, Tolong Siki, Egyptian Hieroglyphs Extended-B, …)</td>
          </tr>
          <tr>
            <td>License</td>
            <td>OFL</td>
            <td>OFL</td>
          </tr>
          <tr>
            <td>Distribution</td>
            <td>TTF committed to repo</td>
            <td>GitHub Releases (binary never committed)</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Coverage tiers -->
    <section>
      <h2>Coverage tiers</h2>
      <p>
        Essenfont covers every assigned Unicode 17 codepoint. Per-block coverage
        falls into three tiers:
      </p>
      <table class="tier-table">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Description</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge">Tier 1</span></td>
            <td>Real glyphs sourced from canonical OFL-licensed donor fonts (Noto family, Full-Sung, Lentariso, Kedebideri, UniHieroglyphica, etc.)</td>
            <td>~99% of assigned codepoints</td>
          </tr>
          <tr>
            <td><span class="badge">Tier 2</span></td>
            <td>Vector outlines extracted from the Unicode Code Charts PDFs (for blocks where no redistributable Tier 1 font exists)</td>
            <td>&lt;1% — rare combinations</td>
          </tr>
          <tr>
            <td><span class="badge">Tier 3</span></td>
            <td>Last Resort tofu boxes (placeholder glyphs with codepoint hex labels) for codepoints no donor covered</td>
            <td>&lt;1% — unassigned, PUA, non-character codepoints</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Use cases -->
    <section>
      <h2>Use cases</h2>

      <h3>For readers and end users</h3>
      <ul>
        <li>
          <strong>Minority-language readers.</strong> Open web pages, emails,
          and documents in Tai Yo, Sidetic, Beria Erfe, Tolong Siki, Sunuwar,
          or any of the 100+ scripts Unicode encodes — and see real glyphs
          instead of tofu.
        </li>
        <li>
          <strong>Historians and linguists.</strong> Read papers that quote
          Egyptian Hieroglyphs (Extended-A and Extended-B), Linear A and B,
          Cuneiform, Anatolian Hieroglyphs, Tangut, Phoenician, Ugaritic, and
          dozens of other ancient scripts.
        </li>
        <li>
          <strong>CJK scholars.</strong> Render every CJK Unified Ideograph —
          including Unicode 17 Extension J (U+31350..U+323AF) — via the
          Full-Sung donor.
        </li>
        <li>
          <strong>Emoji and symbol users.</strong> Get full coverage of
          Symbols and Pictographs, Transport and Map Symbols, Alchemical
          Symbols, Mahjong Tiles, Domino Tiles, and the extended symbol
          ranges added through Unicode 17.
        </li>
      </ul>

      <h3>For developers and operators</h3>
      <ul>
        <li>
          <strong>Browser fallback.</strong> Load the WOFF2 as the last entry
          in your <code>font-family</code> stack via <code>@font-face</code>
          with <code>font-display: swap</code>. Any codepoint your default
          font lacks renders via essenfont. One font replaces 10+ per-script
          fallbacks.
        </li>
        <li>
          <strong>Server-side rendering.</strong> Install essenfont on your
          PDF generation server, headless browser farm, or image-rendering
          worker so generated assets always show the right glyphs — without
          bundling dozens of script-specific fonts.
        </li>
        <li>
          <strong>Terminal and editor fallback.</strong> Modern terminals
          (kitty, WezTerm, Alacritty) and text editors (VS Code, Sublime) fall
          back through the system font stack. Install essenfont system-wide
          and every Unicode character the OS knows about renders.
        </li>
        <li>
          <strong>Embedded and kiosk systems.</strong> Ship a single TTF on
          embedded devices, ATMs, ticketing kiosks, and signage players
          where installing 17+ script-specific fonts is impractical.
        </li>
        <li>
          <strong>Document archival.</strong> Embed essenfont inside PDFs as
          the fallback subset so archival documents remain readable as
          Unicode evolves — without per-document font hunting.
        </li>
        <li>
          <strong>Localization QA.</strong> Run a single font across every
          locale's test corpus; missing-glyph rendering is uniform and
          consistent across CI screenshots.
        </li>
      </ul>

      <h3>For foundries and type designers</h3>
      <ul>
        <li>
          <strong>Reference coverage.</strong> Use essenfont's per-block
          browser (this site) as a visual index of what Unicode 17 assigns
          in each block, before designing a new font's coverage.
        </li>
        <li>
          <strong>Comparison baseline.</strong> Compare your font's glyph
          shapes against canonical donor sources without installing each
          donor individually.
        </li>
      </ul>
    </section>

    <!-- Logo -->
    <section>
      <h2>The logo</h2>
      <div class="logo-display">
        <img src="/logo.svg" alt="Essenfont logo" width="96" height="96" />
        <img src="/logo-full.svg" alt="Essenfont logo with wordmark" width="240" />
      </div>
      <p>
        The mark is a geometric <strong>E</strong> built from three horizontal
        bars joined by a vertical spine on the left — the simplest letterform
        that still reads as a letter, mirroring essenfont's premise that a
        single canonical shape can stand in for every script.
      </p>
      <p>
        Inside the middle bar sits the number <strong>17</strong>, set in the
        rose accent (<code>#bf4e6a</code>). It anchors the mark to its
        defining scope: full Unicode 17 coverage, every plane, every block,
        every assigned codepoint. The three bars together also evoke the
        three coverage tiers (donor-derived, chart-extracted, last-resort),
        and the vertical spine stands for the single redistributable file
        that ties them together.
      </p>
      <p>
        The colour palette is borrowed from classical typography:
        <em>ink</em> for the letterform (<code>#1c1a18</code>),
        <em>paper</em> for the ground (<code>#f1ece1</code>), and
        <em>printer's rose</em> for the accent — the same warm red that
        typographers have used for emphasis since the Renaissance. The
        wordmark is set in a serif display face to signal that essenfont is,
        at its core, a typography project.
      </p>
      <p>
        The icon form (square, used as favicon and in the navbar) and the
        horizontal lockup (icon + wordmark + <code>UNIVERSAL · UNICODE 17</code>
        tag) are kept in sync — the same E, the same 17, the same rose.
      </p>
    </section>

    <!-- Donor fonts -->
    <section>
      <h2>Donor fonts</h2>
      <p>
        The donor registry lives at
        <a href="https://github.com/essenfont/essenfont/blob/main/sources/manifest.yml" target="_blank" rel="noopener">
        <code>sources/manifest.yml</code></a> in the source repository. Each entry
        declares a font, its license, and which Unicode blocks it covers.
      </p>
      <p>Major donors include:</p>
      <ul class="donor-list">
        <li><strong>Noto family</strong> (Google) — Latin, Cyrillic, Greek, South Asian, historic scripts, math, symbols.</li>
        <li><strong>Full-Sung</strong> (F.G. Wang, Taiwan 全宋體) — CJK Unified Ideographs, all extensions including Unicode 17 Ext J.</li>
        <li><strong>Lentariso</strong> — selected scripts.</li>
        <li><strong>Kedebideri</strong> — selected scripts.</li>
        <li><strong>UniHieroglyphica</strong> — Egyptian Hieroglyphs.</li>
        <li><strong>NotoSerifTaiYo</strong> — Tai Yo.</li>
        <li><strong>Symbola</strong>, <strong>BabelStone</strong> — symbol coverage.</li>
      </ul>
      <p class="note">
        <strong>Note on FSung's license.</strong> Full-Sung is <em>not</em> OFL.
        It is a custom non-commercial share-and-use grant from F.G. Wang:
        academic research, educational work, and personal reading are
        permitted; commercial use is prohibited. Essenfont propagates this
        restriction into the assembled font's <code>name</code> table and
        into a LICENSE-SOURCES.md published alongside each release.
        Downstream users must honour the no-commercial-use clause for the
        FSung-derived portion.
      </p>
    </section>

    <!-- License -->
    <section>
      <h2>License</h2>
      <p>
        The assembled Essenfont TTF is licensed under the
        <a href="https://scripts.sil.org/OFL" target="_blank" rel="noopener">SIL Open Font License 1.1</a>,
        except where a donor license imposes additional restrictions
        (currently only FSung). You may use, study, modify, and redistribute
        essenfont freely. Donor license terms — where more restrictive than
        OFL — are propagated into the font's <code>name</code> table
        (nameID 0 copyright + nameID 13 license description) and into the
        LICENSE-SOURCES.md file shipped with each release.
      </p>
    </section>

    <!-- Relationship to Fontist -->
    <section>
      <h2>Relationship to Fontist</h2>
      <p>
        Essenfont is a Fontist project. It is built using
        <a href="https://github.com/fontist/fontisan" target="_blank" rel="noopener">fontisan</a>
        (the open-source font processor) and the universal-set manifest from
        <a href="https://github.com/fontist/ucode" target="_blank" rel="noopener">ucode</a>.
        It is installable via <a href="https://github.com/fontist/fontist" target="_blank" rel="noopener">Fontist</a>:
      </p>
      <div class="code-block">
        <pre><code>fontist install "Essenfont"</code></pre>
      </div>
    </section>

    <!-- Source & contributing -->
    <section>
      <h2>Source &amp; contributing</h2>
      <p>
        The font source, build scripts, and donor registry live at
        <a href="https://github.com/essenfont/essenfont" target="_blank" rel="noopener">github.com/essenfont/essenfont</a>.
        Bug reports, glyph corrections, and new donor submissions are welcome via
        GitHub issues.
      </p>
      <p>
        This site lives at
        <a href="https://github.com/essenfont/essenfont.github.io" target="_blank" rel="noopener">github.com/essenfont/essenfont.github.io</a>.
      </p>
    </section>
  </div>
</template>

<style scoped>
.about { padding: 2rem 1.5rem 4rem; }

.about-header { margin-bottom: 2.5rem; }
.about-back {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem;
  color: var(--spec-rose);
  text-decoration: none;
}
.about-back:hover { text-decoration: underline; }
.about-header h1 {
  font-family: var(--spec-font-display);
  font-size: 2.2rem;
  font-weight: 500;
  margin: 0.3rem 0 0.5rem;
  color: var(--spec-ink);
  letter-spacing: -0.02em;
}
.lede {
  font-size: 1.05rem;
  color: var(--spec-ink-soft);
  line-height: 1.6;
  margin: 0;
}

section { margin-bottom: 2.5rem; }
section h2 {
  font-family: var(--spec-font-display);
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--spec-rule);
  letter-spacing: -0.01em;
  color: var(--spec-ink);
}
section h3 {
  font-family: var(--spec-font-display);
  font-size: 1.05rem;
  font-weight: 500;
  margin: 1.25rem 0 0.5rem;
  color: var(--spec-rose);
}
section p, section li {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--spec-ink-soft);
}
section p { margin: 0 0 0.8rem; }
section ul { padding-left: 1.5rem; margin: 0 0 0.8rem; }
section li { margin-bottom: 0.4rem; }
section a { color: var(--spec-rose); text-decoration: none; }
section a:hover { text-decoration: underline; }
section code {
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
  background: var(--vp-c-bg-soft);
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  border: 1px solid var(--spec-rule);
}
section strong { color: var(--spec-ink); font-weight: 600; }
section em { color: var(--spec-ink); font-style: italic; }

.tofu {
  display: inline-block;
  font-family: var(--spec-font-mono);
  padding: 0 0.3rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--spec-rule-strong);
  color: var(--spec-mute);
}

.tier-table, .cmp-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.88rem;
}
.tier-table th, .tier-table td,
.cmp-table th, .cmp-table td {
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--spec-rule);
  vertical-align: top;
}
.tier-table th, .cmp-table th {
  font-family: var(--spec-font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--spec-mute);
  background: var(--vp-c-bg-soft);
}
.tier-table td, .cmp-table td { color: var(--spec-ink-soft); }
.cmp-table tbody tr td:first-child {
  font-weight: 600;
  color: var(--spec-ink);
}

.donor-list li { margin-bottom: 0.5rem; }
.donor-list strong { color: var(--spec-ink); }

.logo-display {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 1rem 0 1.5rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--spec-rule);
  border-radius: 10px;
  flex-wrap: wrap;
}
.logo-display img {
  display: block;
}

.note {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-brand-soft);
  border-left: 3px solid var(--spec-rose);
  border-radius: 4px;
  font-size: 0.9rem;
}
.note strong { color: var(--spec-rose); }

.code-block {
  background: var(--spec-term-bg);
  color: var(--spec-term-ink);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  overflow-x: auto;
}
.code-block pre {
  font-family: var(--spec-font-mono);
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0;
}
</style>