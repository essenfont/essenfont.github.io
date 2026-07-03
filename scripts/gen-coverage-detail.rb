#!/usr/bin/env ruby
# frozen_string_literal: true

# Generate per-block coverage detail from the source Essenfont TTF.
#
# For each Unicode block, output a JSON file listing which codepoints
# the font actually has glyphs for. Used by the block page to highlight
# characters that essenfont doesn't cover (and would silently fall back
# to the system font).
#
# Reads:  ESSENFONT_TTF (env or sibling-repo Essenfont-Regular.ttf)
#         public/unicode-blocks.json
# Writes: public/coverage/<slug>.json   (one per non-empty block)
#         public/coverage.json          (aggregate summary)
#
# Run from this repo's directory:
#   bundle exec ruby scripts/gen-coverage-detail.rb

require "fontisan"
require "json"
require "fileutils"
require "set"

ROOT = File.expand_path("..", __dir__)
PUBLIC = File.join(ROOT, "public")
BLOCKS_JSON = File.join(PUBLIC, "unicode-blocks.json")
COVERAGE_DIR = File.join(PUBLIC, "coverage")
COVERAGE_JSON = File.join(PUBLIC, "coverage.json")

# Default: search the sibling essenfont repo for any Essenfont-Regular.ttf*,
# preferring the plain .ttf and falling back to the newest backup. Override
# with ESSENFONT_TTF env var.
DEFAULT_TTF_PATTERN = File.expand_path("../../essenfont/Essenfont-Regular.ttf*", __dir__)
ESSENFONT_TTF = ENV.fetch("ESSENFONT_TTF") do
  candidates = Dir.glob(DEFAULT_TTF_PATTERN)
  candidates.find { |p| p.end_with?(".ttf") } || candidates.max_by { |p| File.mtime(p) }
end

def block_slug(name)
  name.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
end

def reserved?(name)
  /Private.Use|Surrogates|Specials/i.match?(name)
end

log = ->(msg) { warn "\x1b[1;34mcoverage:\x1b[0m #{msg}" }

log.call("loading #{ESSENFONT_TTF}")
font = Fontisan::FontLoader.load(ESSENFONT_TTF)
cmap = font.table("cmap").unicode_mappings
log.call("cmap has #{cmap.size} codepoints")

blocks = JSON.parse(File.read(BLOCKS_JSON))
FileUtils.mkdir_p(COVERAGE_DIR)

# Clean stale files
Dir.glob("#{COVERAGE_DIR}/*.json").each { |f| File.delete(f) }

summary_blocks = []
totals = { blocks: 0, empty: 0, complete: 0, covered: 0, assigned: 0 }

blocks.each do |b|
  slug = block_slug(b["name"])
  start_cp = b["start"]
  end_cp = b["end"]
  range_total = end_cp - start_cp + 1

  reserved = reserved?(b["name"])

  if reserved
    summary_blocks << {
      id: b["name"].gsub(/\s+/, "_"),
      range: "U+#{start_cp.to_s(16).upcase.rjust(4, '0')}..U+#{end_cp.to_s(16).upcase}",
      first: start_cp, last: end_cp,
      covered: 0, total: range_total, pct: 0.0, status: "RESERVED",
    }
    next
  end

  # Load the assigned codepoints from the block JSON (UCD-derived).
  # These are the codepoints Unicode has actually assigned characters to.
  # The block RANGE includes unassigned slots — those are NOT coverage gaps.
  block_json_path = File.join(PUBLIC, "unicode", "blocks", "#{slug}.json")
  assigned_cps = []
  if File.exist?(block_json_path)
    block_data = JSON.parse(File.read(block_json_path))
    assigned_cps = (block_data["chars"] || []).map { |c| c["cp"] }
  end
  assigned_set = assigned_cps.to_set

  # Three-way classification:
  #   covered_assigned    — Unicode assigned + font has glyph (✓)
  #   uncovered_assigned  — Unicode assigned + font MISSING (real gap, ✗)
  #   unassigned_in_range — Unicode hasn't assigned (not a gap, —)
  covered_assigned = assigned_cps.select { |cp| cmap.key?(cp) }
  uncovered_assigned = assigned_cps.reject { |cp| cmap.key?(cp) }
  unassigned_in_range = (start_cp..end_cp).reject { |cp| assigned_set.include?(cp) }

  assigned_count = assigned_cps.size
  covered_count = covered_assigned.size
  # Coverage % = covered assigned / total assigned (NOT / range size).
  # Unassigned codepoints don't count against coverage.
  pct = assigned_count > 0 ? (covered_count.to_f / assigned_count * 100).round(2) : 0.0

  status = if assigned_count == 0 then "EMPTY"
             elsif pct >= 100 then "COMPLETE"
             elsif pct >= 95 then "FULL"
             elsif pct >= 50 then "MOSTLY"
             elsif pct > 0 then "PARTIAL"
             else "EMPTY"
             end

  # Write per-block detail
  unless covered_assigned.empty? && uncovered_assigned.empty?
    detail = {
      block: b["name"],
      slug: slug,
      range: "U+#{start_cp.to_s(16).upcase.rjust(4, '0')}..U+#{end_cp.to_s(16).upcase.rjust(4, '0')}",
      # The set the grid checks against (for backward compat)
      covered: covered_assigned,
      # Three-way classification
      covered_assigned: covered_assigned,
      uncovered_assigned: uncovered_assigned,
      unassigned_in_range: unassigned_in_range,
      # Summary numbers
      covered_count: covered_count,
      assigned_count: assigned_count,
      uncovered_count: uncovered_assigned.size,
      unassigned_count: unassigned_in_range.size,
      total_range: range_total,
      pct: pct,
      status: status,
    }
    File.write(File.join(COVERAGE_DIR, "#{slug}.json"), JSON.generate(detail))
  end

  summary_blocks << {
    id: b["name"].gsub(/\s+/, "_"),
    range: "U+#{start_cp.to_s(16).upcase.rjust(4, '0')}..U+#{end_cp.to_s(16).upcase}",
    first: start_cp, last: end_cp,
    covered: covered_count,
    total: assigned_count,  # Use assigned count, not range size
    pct: pct,
    status: status,
  }

  totals[:blocks] += 1
  totals[:covered] += covered_count
  totals[:assigned] += assigned_count
  totals[:complete] += 1 if status == "COMPLETE"
  totals[:empty] += 1 if status == "EMPTY"
end

summary = {
  generated_at: Time.now.utc.iso8601,
  source: File.basename(ESSENFONT_TTF),
  blocks: summary_blocks,
  totals: totals,
}

File.write(COVERAGE_JSON, JSON.generate(summary))
log.call("wrote #{summary_blocks.count { |b| b[:status] != "RESERVED" && b[:covered] > 0 }} block detail files → public/coverage/")
log.call("wrote summary → public/coverage.json")
log.call("totals: #{totals[:covered]}}/#{totals[:assigned]} cps, #{totals[:complete]} complete, #{totals[:empty]} empty")