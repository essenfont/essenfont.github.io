<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Ruby API — Docs — Essenfont',
  meta: [
    { name: 'description', content: 'Drive Essenfont programmatically via the fontisan + essenfont Ruby gems. Read OTCs, subset, custom partitioning, donor manifest.' },
  ],
  link: [{ rel: 'canonical', href: 'https://essenfont.github.io/docs/api' }],
})
</script>

<template>
  <div class="doc">
    <header class="doc-head">
      <RouterLink to="/" class="back">← Home</RouterLink>
      <span class="doc-flag">Docs · III</span>
      <h1>Ruby API</h1>
      <p class="lede">
        Essenfont's build pipeline is pure Ruby on top of
        <a href="https://github.com/fontist/fontisan" target="_blank" rel="noopener">fontisan</a>
        (≥ 0.4.7) and <a href="https://github.com/fontist/ucode" target="_blank" rel="noopener">ucode</a>
        (≥ 0.3.0). Drive it for build pipelines, font tools, or custom subsetting.
      </p>
    </header>

    <section>
      <h2>1 · Quickstart</h2>
      <pre><code>gem "essenfont", path: "path/to/essenfont"
gem "fontisan", "~> 0.4"
gem "ucode",   "~> 0.3"</code></pre>
      <pre><code>require "essenfont"
require "fontisan"

donors = {
  noto: { label: :noto, font: Fontisan::FontLoader.load("NotoSans-Regular.ttf") }
}
cp_map = {}
donors.each_value do |d|
  d[:font].table("cmap").unicode_mappings.each do |cp, gid|
    cp_map[cp] = { label: d[:label], gid: gid }
  end
end

result = Essenfont::Otc::Build.new(
  cp_map: cp_map,
  donors: donors,
  subfont_format: :otf2  # CFF2 outlines — ~48% smaller than glyf
).call(output_path: "My-Font.otc")

puts "wrote #{result.bytes} bytes, #{result.subfont_count} faces"</code></pre>
    </section>

    <section>
      <h2>2 · Read an OTC</h2>
      <pre><code>reader = Fontisan::Collection::Reader.open("Essenfont-Regular.otc")
puts "faces: #{reader.face_count}"

reader.stats.each do |s|
  puts "  face #{s.index}: #{s.glyph_count} glyphs, #{s.codepoint_count} cps"
end

puts "cmap union: #{reader.cmap_union.size} cps"</code></pre>
    </section>

    <section>
      <h2>3 · Custom partitioning</h2>
      <p>Override the default plane partitioner:</p>
      <pre><code># Partition by Unicode script (Latin, CJK, Arabic, ...)
class ByScript &lt; Fontisan::Stitcher::PartitionStrategy::Base
  def call(cp_map, cap: 65_484)
    # ... group by Script_Extensions property ...
    Blueprint.new(partitions: partitions)
  end
end

Essenfont::Otc::Build.new(
  cp_map:, donors:,
  partitioner: ByScript.new
).call(output_path: "out.otc")</code></pre>
    </section>

    <section>
      <h2>4 · CLI</h2>
      <pre><code># Build (default: TTC with glyf outlines)
ruby scripts/build.rb

# CFF2 OTC (modern, ~35% smaller)
ruby scripts/build.rb --format=otc-cff2

# Per-plane TTFs
ruby scripts/build.rb --format=ttf-per-plane

# Encode WOFF/WOFF2 (fontisan CLI)
fontisan convert Essenfont-BMP.ttf --to woff,woff2 --output Essenfont-BMP

# Validate a collection
fontisan validate collection Essenfont-Regular.otc</code></pre>
    </section>

    <section>
      <h2>5 · Donor manifest</h2>
      <p>Edit <code>sources/manifest.yml</code> to add or replace donors:</p>
      <pre><code>donors:
  - label: noto_sans_egyptian_hieroglyphs
    family: Noto Sans Egyptian Hieroglyphs
    file: references/input-fonts/NotoSansEgyptianHieroglyphs-Regular.ttf
    license: OFL-1.1
    sha256: abc123...
    covers:
      - Egyptian_Hieroglyphs
    url: https://fonts.google.com/noto</code></pre>
      <p>The <code>covers:</code> declaration is validated at build time — if the donor's cmap has zero codepoints in the declared block, the build fails.</p>
    </section>

    <section>
      <h2>6 · Architecture reference</h2>
      <p>
        The full OTC pipeline is documented in
        <a href="https://github.com/essenfont/essenfont/tree/main/TODO.otc-essenfont" target="_blank" rel="noopener">TODO.otc-essenfont/</a>
        (10 spec docs). The slim Ruby subsystem that wires fontisan + ucode is at
        <a href="https://github.com/essenfont/essenfont/tree/main/lib/essenfont/otc" target="_blank" rel="noopener">lib/essenfont/otc/</a>
        (~126 LOC).
      </p>
    </section>

    <section class="next">
      <h3>Next</h3>
      <ul>
        <li><RouterLink to="/docs/install">Per-OS install →</RouterLink></li>
        <li><RouterLink to="/docs/css">Embed in CSS →</RouterLink></li>
        <li><RouterLink to="/provenance">Donor provenance explorer →</RouterLink></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.doc { max-width: 860px; margin: 0 auto; padding: 4rem 2rem 6rem; color: var(--spec-ink); }
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
.lede a { color: var(--spec-rose); text-decoration: none; }
.lede a:hover { text-decoration: underline; }
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
  border-left: 3px solid var(--spec-rose-soft); margin: 0.6rem 0;
}
.doc .next { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--spec-rule); }
.doc .next h3 {
  font-family: var(--spec-font-mono); font-size: 0.7rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--spec-ink-soft); margin: 0 0 1rem;
}
.doc .next ul { list-style: none; padding: 0; margin: 0; }
.doc .next li { margin-bottom: 0.4rem; }
</style>
