#!/usr/bin/env ruby
# frozen_string_literal: true

# Regenerate public/fonts.css from existing WOFF2/WOFF files in
# public/fonts/. Use this when fonts.css was clobbered (e.g. by a
# single-block --block=X run that only wrote one entry).
#
# Reads:  public/unicode-blocks.json  (for unicode-range per block)
#         public/fonts/*.woff2        (existing subsets)
# Writes: public/fonts.css            (@font-face rules for every block)

require "json"

ROOT = File.expand_path("..", __dir__)
PUBLIC = File.join(ROOT, "public")
FONTS_DIR = File.join(PUBLIC, "fonts")
BLOCKS_JSON = File.join(PUBLIC, "unicode-blocks.json")
FONTS_CSS = File.join(PUBLIC, "fonts.css")

def block_slug(name)
  name.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
end

blocks = JSON.parse(File.read(BLOCKS_JSON))

rules = []
count = 0

blocks.each do |b|
  slug = block_slug(b["name"])
  woff2 = File.join(FONTS_DIR, "#{slug}.woff2")
  woff1 = File.join(FONTS_DIR, "#{slug}.woff")

  next unless File.exist?(woff2)

  start_hex = b["start"].to_s(16).upcase.rjust(4, "0")
  end_hex = b["end"].to_s(16).upcase.rjust(4, "0")

  woff_src = File.exist?(woff1) ? "url(\"/fonts/#{slug}.woff\") format(\"woff\"),\n      " : ""

  rules << <<~CSS
    @font-face {
      font-family: "Essenfont";
      src: #{woff_src}url("/fonts/#{slug}.woff2") format("woff2");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: U+#{start_hex}-#{end_hex};
    }
  CSS
  count += 1
end

File.write(FONTS_CSS, rules.join("\n"))
warn "Wrote #{count} @font-face rules → #{FONTS_CSS}"