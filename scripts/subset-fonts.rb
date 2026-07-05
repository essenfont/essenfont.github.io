#!/usr/bin/env ruby
# frozen_string_literal: true

# Generate per-block WOFF2 subsets of Essenfont-Regular.ttf and a fonts.css
# that wires each subset to its Unicode range.
#
# Uses the Fontisan Ruby API directly (not the CLI) so we can pass an
# Array<Integer> of codepoints and avoid shell argv limits. This makes
# large blocks (CJK Unified Ideographs = 20,992 cp, Hangul Syllables =
# 11,184 cp) subsettable in one call.
#
# Run from this repo's directory:
#
#   bundle exec ruby scripts/subset-fonts.rb
#   bundle exec ruby scripts/subset-fonts.rb --all       # every block
#   bundle exec ruby scripts/subset-fonts.rb --block=Tai\ Yo
#
# Set ESSENFONT_TTF env var to point at the source TTF (defaults to
# a sibling-repo path that works in dev).

require "json"
require "fileutils"
require "set"
require "fontisan"

ROOT = File.expand_path("..", __dir__)
PUBLIC = File.join(ROOT, "public")
BLOCKS_JSON = File.join(PUBLIC, "unicode-blocks.json")
FONTS_DIR = File.join(PUBLIC, "fonts")
FONTS_CSS = File.join(PUBLIC, "fonts.css")

# Default: search the sibling essenfont repo for the TTC (canonical) or
# TTF (legacy). Override with ESSENFONT_TTC / ESSENFONT_TTF env vars.
DEFAULT_ESSENFONT_TTC = File.expand_path("../../essenfont/Essenfont-Regular.ttc", __dir__)
DEFAULT_ESSENFONT_TTF = File.expand_path("../../essenfont/Essenfont-Regular.ttf", __dir__)
ESSENFONT_TTC = ENV["ESSENFONT_TTC"] || (File.exist?(DEFAULT_ESSENFONT_TTC) ? DEFAULT_ESSENFONT_TTC : nil)
ESSENFONT_TTF = ENV.fetch("ESSENFONT_TTF", DEFAULT_ESSENFONT_TTF)

# Source font + per-block face index lookup. TTCs contain multiple faces
# (BMP got sub-split to stay under the 65,535-glyph cap), so each block
# must be subsetted against the face that actually contains its
# codepoints.
SOURCE_FONT = ESSENFONT_TTC || ESSENFONT_TTF
SOURCE_IS_TTC = File.extname(SOURCE_FONT) == ".ttc"

# Curated demo set: covers the scripts visitors are most likely to be
# surprised by. Pass --all to do every block in unicode-blocks.json.
DEMO_BLOCKS = %w[
  Basic\ Latin
  Latin-1\ Supplement
  Greek\ and\ Coptic
  Cyrillic
  Hebrew
  Arabic
  Thai
  Devanagari
  Bengali
  Hiragana
  Katakana
  CJK\ Unified\ Ideographs
  Hangul\ Syllables
  Ideographic\ Description\ Characters
  Egyptian\ Hieroglyphs
  Miscellaneous\ Symbols\ and Pictographs
  Tai\ Yo
  Beria\ Erfe
  Sidetic
  Tolong\ Siki
].freeze

def block_slug(name)
  name.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
end

# Build {block_first_cp => face_index} lookup by scanning every face's
# cmap. Cached at module level — building it once per process is fine
# because the TTC doesn't change mid-run.
def face_lookup
  return @_face_lookup if @_face_lookup

  lookup = {}
  reader = Fontisan::Collection::Reader.open(SOURCE_FONT)
  reader.stats.each do |stat|
    face = Fontisan::FontLoader.load(SOURCE_FONT, font_index: stat.index)
    cmap = face.table("cmap").unicode_mappings || {}
    cps = cmap.keys.to_set
    cps.each { |cp| lookup[cp] ||= stat.index }
  end
  @_face_lookup = lookup
end

# Find the best face index for a block range: the face containing the
# most codepoints in [start, end]. Falls back to face 0 if no face has
# any of the block's chars (fontisan will then produce an empty subset
# and the rescue below handles it).
def face_for_block(block)
  return 0 if SOURCE_IS_TTC == false

  counts = Hash.new(0)
  (block["start"]..block["end"]).each do |cp|
    idx = face_lookup[cp]
    counts[idx] += 1 if idx
  end
  counts.max_by { |_, c| c }&.first || 0
end

def read_blocks
  JSON.parse(File.read(BLOCKS_JSON))
end

def parse_args(argv)
  opts = { all: false, block: nil }
  argv.each do |arg|
    case arg
    when "--all" then opts[:all] = true
    when /^--block=(.+)$/ then opts[:block] = Regexp.last_match(1)
    else warn "Unknown arg: #{arg}"; exit 1
    end
  end
  opts
end

def select_blocks(all_blocks, opts)
  if opts[:block]
    found = all_blocks.find { |b| b["name"] == opts[:block] }
    abort "Block not found: #{opts[:block]}" unless found
    [found]
  elsif opts[:all]
    all_blocks
  else
    all_blocks.select { |b| DEMO_BLOCKS.include?(b["name"]) }
  end
end

# Subset the TTF (or a single face of a TTC) to the codepoints in
# [start, end] and convert to WOFF2 + WOFF1. Uses Array<Integer> for
# :unicode so we bypass CLI argv limits AND the CLI's silent range
# truncation bug (see fontisan's REQ-unicode-range-subset.md).
def subset_block(block)
  slug = block_slug(block["name"])
  cps = (block["start"]..block["end"]).to_a

  tmp_ttf = "/tmp/essenfont-subset-#{slug}.ttf"
  woff2_path = File.join(FONTS_DIR, "#{slug}.woff2")

  # Web profile (not PDF): web browsers require the OS/2 table for
  # line metrics (usWinAscent/usWinDescent) and clip text without it.
  # The PDF profile drops OS/2 entirely — that's why the previous
  # build's Modi page rendered nothing even though the glyph data
  # was correct.
  options = {
    unicode: cps,
    output: tmp_ttf,
    profile: "web",
  }
  options[:font_index] = face_for_block(block) if SOURCE_IS_TTC

  subset_cmd = Fontisan::Commands::SubsetCommand.new(SOURCE_FONT, **options)
  subset_cmd.run

  convert_cmd = Fontisan::Commands::ConvertCommand.new(
    tmp_ttf,
    to: "woff2",
    output: woff2_path,
  )
  convert_cmd.run

  # WOFF1 fallback (zlib, universal browser support). Same glyphs, larger
  # file, but Safari/older Chrome versions and some embedded WebViews fail
  # to parse the Brotli-compressed WOFF2 for very large CJK subsets.
  woff_path = File.join(FONTS_DIR, "#{slug}.woff")
  woff_cmd = Fontisan::Commands::ConvertCommand.new(
    tmp_ttf,
    to: "woff",
    output: woff_path,
  )
  woff_cmd.run

  File.unlink(tmp_ttf) if File.exist?(tmp_ttf)
  woff2_path
rescue Fontisan::SubsettingError, ArgumentError => e
  # Most common cause: block isn't covered in the current TTF build
  # (fontisan's "No Unicode codepoints found in font" path).
  warn "  ✗ #{e.class}: #{e.message.lines.first.strip}"
  false
end

def write_fonts_css(blocks_subsetted)
  rules = blocks_subsetted.map do |block|
    slug = block_slug(block["name"])
    start_hex = block["start"].to_s(16).upcase.rjust(4, "0")
    end_hex = block["end"].to_s(16).upcase.rjust(4, "0")
    woff_path = File.join(FONTS_DIR, "#{slug}.woff")
    # WOFF2 first (modern, ~30% smaller), WOFF1 fallback for browsers
    # that can't parse Brotli-encoded WOFF2 (some Safari/embedded engines).
    woff_src = File.exist?(woff_path) ? "url(\"/fonts/#{slug}.woff\") format(\"woff\"),\n      " : ""
    <<~CSS
      @font-face {
        font-family: "Essenfont";
        src: #{woff_src}url("/fonts/#{slug}.woff2") format("woff2");
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
        unicode-range: U+#{start_hex}-#{end_hex};
      }
    CSS
  end
  File.write(FONTS_CSS, rules.join("\n"))
end

def main
  opts = parse_args(ARGV)
  blocks = read_blocks
  selected = select_blocks(blocks, opts)

  FileUtils.mkdir_p(FONTS_DIR)

  done = []
  selected.each do |block|
    slug = block_slug(block["name"])
    cp_count = block["end"] - block["start"] + 1
    warn "→ #{block['name']} (#{slug}, #{cp_count} cp)"
    woff2 = subset_block(block)
    if woff2
      size_kb = (File.size(woff2) / 1024.0).round(1)
      warn "  ✓ #{size_kb} KB"
      done << block
    end
  end

  write_fonts_css(done)
  warn ""
  warn "Wrote #{done.size} subsets → public/fonts/"
  warn "Wrote fonts.css → #{FONTS_CSS}"
end

main