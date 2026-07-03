<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Install — Docs — Essenfont',
  meta: [
    { name: 'description', content: 'Install Essenfont on macOS, Windows, Linux, iOS, or Android. OTC + per-plane TTFs for every platform.' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/docs/install' }],
})

const GH = 'https://github.com/essenfont/essenfont/releases/latest/download'
</script>

<template>
  <div class="doc">
    <header class="doc-head">
      <RouterLink to="/" class="back">← Home</RouterLink>
      <span class="doc-flag">Docs · I</span>
      <h1>Install Essenfont</h1>
      <p class="lede">
        Install once, get every Unicode 17 codepoint rendering.
        The canonical artifact is the OTC (5 plane subfonts); per-plane
        TTFs are available for clients that don't enumerate OTC faces.
      </p>
    </header>

    <nav class="doc-toc">
      <a href="#macos">macOS</a>
      <a href="#windows">Windows</a>
      <a href="#linux">Linux</a>
      <a href="#ios">iOS / iPadOS</a>
      <a href="#android">Android</a>
    </nav>

    <section id="macos">
      <h2>1 · macOS</h2>
      <ol>
        <li>
          Download <a :href="`${GH}/Essenfont-Regular.otc`">Essenfont-Regular.otc</a>
          (~50 MB).
        </li>
        <li>Double-click the <code>.otc</code> file — Font Book opens.</li>
        <li>Font Book shows 5 faces (BMP / SMP / SIP / TIP / SSP). Click <em>Install All</em>.</li>
        <li>Verify: any app's font menu now lists <code>Essenfont BMP</code>, <code>Essenfont SMP</code>, etc.</li>
      </ol>
      <pre><code>cp ~/Downloads/Essenfont-Regular.otc ~/Library/Fonts/   # per-user
sudo cp ~/Downloads/Essenfont-Regular.otc /Library/Fonts/  # system-wide</code></pre>
    </section>

    <section id="windows">
      <h2>2 · Windows</h2>
      <ol>
        <li>Download <a :href="`${GH}/Essenfont-Regular.otc`">Essenfont-Regular.otc</a>.</li>
        <li>Right-click → <em>Install for all users</em> (requires admin).</li>
        <li>The 5 faces appear individually in app font menus as <em>Essenfont BMP</em>, <em>Essenfont SMP</em>, etc.</li>
      </ol>
      <p>If your Windows version doesn't enumerate OTC faces, install the per-plane TTFs instead:</p>
      <pre><code>curl -LO {{ GH }}/Essenfont-BMP.ttf
curl -LO {{ GH }}/Essenfont-SIP.ttf
:: Right-click each .ttf → Install</code></pre>
    </section>

    <section id="linux">
      <h2>3 · Linux</h2>
      <pre><code>mkdir -p ~/.local/share/fonts
curl -L {{ GH }}/Essenfont-Regular.otc -o ~/.local/share/fonts/Essenfont-Regular.otc
fc-cache -fv
fc-list | grep -i essenfont</code></pre>
      <p>For older fontconfig (&lt; 2.12) that doesn't enumerate OTC faces:</p>
      <pre><code>for P in BMP SMP SIP TIP SSP; do
  curl -L {{ GH }}/Essenfont-${P}.ttf -o ~/.local/share/fonts/Essenfont-${P}.ttf
done
fc-cache -fv</code></pre>
    </section>

    <section id="ios">
      <h2>4 · iOS / iPadOS</h2>
      <p>iOS doesn't enumerate OTC subfonts reliably. Use per-plane TTFs via a configuration profile:</p>
      <ol>
        <li>Download each per-plane TTF to Files.</li>
        <li>Tap a TTF → iOS prompts to install as a profile.</li>
        <li>Settings → Profile Downloaded → Install.</li>
      </ol>
      <p class="note">Limitation: per-app font availability depends on the app. Safari and Pages support installed profiles; some third-party apps don't.</p>
    </section>

    <section id="android">
      <h2>5 · Android</h2>
      <ol>
        <li>Download each per-plane TTF via the browser.</li>
        <li>Files app → tap the TTF → <em>Set as font</em> (Android 13+).</li>
        <li>Pre-Android 13: bundle the TTF in your app's <code>res/font/</code>.</li>
      </ol>
    </section>

    <section class="next">
      <h3>Next</h3>
      <ul>
        <li><RouterLink to="/docs/css">Embed in a website →</RouterLink></li>
        <li><RouterLink to="/docs/api">Drive via Ruby API →</RouterLink></li>
        <li><RouterLink to="/download">All download formats →</RouterLink></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.doc { max-width: 760px; margin: 0 auto; padding: 4rem 2rem 6rem; color: var(--spec-ink); }
.doc-head { margin-bottom: 3rem; }
.back {
  font-family: var(--spec-font-mono); font-size: 0.74rem; letter-spacing: 0.08em;
  color: var(--spec-rose); text-decoration: none; text-transform: uppercase;
}
.back:hover { text-decoration: underline; }
.doc-flag {
  display: inline-block; margin: 1.5rem 0 0.8rem;
  font-family: var(--spec-font-mono); font-size: 0.72rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--spec-ink-soft);
}
.doc h1 {
  font-family: var(--spec-font-display);
  font-size: clamp(2rem, 4vw, 3rem); font-weight: 300;
  letter-spacing: -0.025em; margin: 0 0 1rem;
}
.lede {
  font-family: var(--spec-font-display); font-size: 1.05rem; font-weight: 300;
  line-height: 1.6; color: var(--spec-ink-soft); margin: 0;
}
.doc-toc {
  display: flex; flex-wrap: wrap; gap: 1.2rem;
  padding: 1rem 0; border-top: 1px solid var(--spec-rule); border-bottom: 1px solid var(--spec-rule);
  margin: 0 0 3rem;
  font-family: var(--spec-font-mono); font-size: 0.78rem;
}
.doc-toc a { color: var(--spec-rose); text-decoration: none; }
.doc-toc a:hover { text-decoration: underline; }
.doc section { margin-bottom: 3rem; }
.doc section h2 {
  font-family: var(--spec-font-mono); font-size: 0.86rem;
  font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--spec-rose); margin: 0 0 1rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--spec-rule);
}
.doc p, .doc li {
  font-family: var(--spec-font-display); font-size: 1rem; font-weight: 300;
  line-height: 1.65; color: var(--spec-ink-soft);
}
.doc a { color: var(--spec-rose); text-decoration: none; }
.doc a:hover { text-decoration: underline; }
.doc code {
  font-family: var(--spec-font-mono); font-size: 0.85rem;
  background: rgba(184, 71, 95, 0.08); padding: 0.05em 0.4em; border-radius: 2px;
  color: var(--spec-rose);
}
.doc pre {
  background: var(--spec-term-bg); color: var(--spec-term-ink);
  padding: 1rem 1.25rem; border-radius: 4px; overflow-x: auto;
  font-family: var(--spec-font-mono); font-size: 0.82rem; line-height: 1.6;
  border-left: 3px solid var(--spec-rose-soft);
}
.doc .note {
  padding: 0.8rem 1.2rem; background: rgba(184, 71, 95, 0.05);
  border-left: 2px solid var(--spec-rose); font-style: italic;
}
.doc .next { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--spec-rule); }
.doc .next h3 {
  font-family: var(--spec-font-mono); font-size: 0.7rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--spec-ink-soft); margin: 0 0 1rem;
}
.doc .next ul { list-style: none; padding: 0; margin: 0; }
.doc .next li { margin-bottom: 0.4rem; }
</style>
