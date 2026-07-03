#!/usr/bin/env ruby
# frozen_string_literal: true

# Convert essenfont's sources/manifest.yml into JSON the website can load.
#
# Reads:  ../essenfont/sources/manifest.yml
# Writes: public/donors.json            (full registry, all donors)
#         public/donors/<slug>.json     (per-donor detail)
#
# Run manually when the manifest changes:
#   ruby scripts/gen-donors-data.rb
#
# Block IDs in the manifest use underscores (CJK_Unified_Ideographs);
# we convert to display names (CJK Unified Ideographs) by swapping _
# for space, so they match the names in public/unicode-blocks.json.

require "yaml"
require "json"
require "fileutils"

ROOT = File.expand_path("..", __dir__)
ESSENFONT_REPO = File.expand_path("../../essenfont", __dir__)
MANIFEST_YML = File.join(ESSENFONT_REPO, "sources", "manifest.yml")
PUBLIC = File.join(ROOT, "public")
BLOCKS_JSON = File.join(PUBLIC, "unicode-blocks.json")
DONORS_JSON = File.join(PUBLIC, "donors.json")
DONORS_DIR = File.join(PUBLIC, "donors")

def block_id_to_name(id)
  id.to_s.tr("_", " ")
end

def donor_slug(label)
  label.to_s.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
end

# Detect if a donor is a real font (Tier 1) or extracted from Unicode
# Code Charts (Tier 2). Code-chart donors are synthetic glyphs from
# the Unicode PDF charts, not from a redistributable font file.
def detect_source_type(family_name, files)
  type = files.find { |f| f["type"] }&.dig("type")
  return "code-chart" if type == "code_chart"
  return "code-chart" if /chart/i.match?(family_name)
  "font"
end

# Group donors by vendor for the index page. Noto is a huge family
# (130+ sub-fonts) — collapse them into one "Noto (Google)" card.
def detect_vendor(family_name, author)
  name = family_name.to_s.downcase
  return "Noto (Google)" if name.start_with?("noto")
  return "SIL International" if author&.include?("SIL")
  return "Microsoft" if author&.include?("Microsoft")
  return "F.G. Wang" if /full.?sung/i.match?(name)
  return "Unicode Consortium" if author&.include?("Unicode")
  return "Google" if author&.include?("Google")
  author&.split("(").first&.strip || family_name
end

# Common shortforms in the manifest's free-form notes. Sorted by length
# descending when used so longer matches win over prefixes.
SHORTFORMS = {
  "Ext-A Extended"      => "Egyptian Hieroglyphs Extended-A",
  "Format Controls"     => "Egyptian Hieroglyphs Format Controls",
  "Ext-B"               => "CJK Unified Ideographs Extension B",
  "Ext-C"               => "CJK Unified Ideographs Extension C",
  "Ext-D"               => "CJK Unified Ideographs Extension D",
  "Ext-E"               => "CJK Unified Ideographs Extension E",
  "Ext-F"               => "CJK Unified Ideographs Extension F",
  "Ext-G"               => "CJK Unified Ideographs Extension G",
  "Ext-H"               => "CJK Unified Ideographs Extension H",
  "Ext-I"               => "CJK Unified Ideographs Extension I",
  "Ext-J"               => "CJK Unified Ideographs Extension J",
  "Ext-A"               => "Egyptian Hieroglyphs Extended-A",
  "core"                => "Egyptian Hieroglyphs",
}.freeze

# Unicode plane lookup for a block by name. Loads the committed
# unicode-blocks.json so plane/range info is always authoritative.
class BlockIndex
  def initialize(blocks)
    @by_name = {}
    blocks.each do |b|
      @by_name[b["name"]] = b
    end
  end

  def lookup(name)
    # The notes sometimes shorten "Egyptian Hieroglyphs Extended-A" to
    # "Ext-A Extended". Try several suffixes.
    @by_name[name] ||
      @by_name["Egyptian Hieroglyphs #{name}"] ||
      @by_name[name.sub(/\s*Extended\s*/, " Extended-")]
  end

  def self.plane(unicode_block)
    plane_start = unicode_block["start"]
    case plane_start
    when 0x0...0x10000 then { code: "BMP", index: 0, full: "Plane 0" }
    when 0x10000...0x20000 then { code: "SMP", index: 1, full: "Plane 1" }
    when 0x20000...0x30000 then { code: "SIP", index: 2, full: "Plane 2" }
    when 0x30000...0x40000 then { code: "TIP", index: 3, full: "Plane 3" }
    else { code: "?", index: nil, full: "Unknown plane" }
    end
  end
end

# Parse coverage info out of the donor's free-form notes. Returns
# [{ block, plane, plane_index, range, covered, total, pct }, ...]
#
# Strategy: iterate every known block in the BlockIndex, check if its
# name (or common shortforms) appears in the notes, and pull the
# nearest "N/N" coverage number that follows the match.
def parse_coverage(notes, block_index)
  return [] if notes.nil? || notes.empty?

  by_name = block_index.instance_variable_get(:@by_name)
  # Tokens that resolve to a block: every block name + every shortform.
  # Sort by length descending so longer names match preferentially
  # (e.g. "Egyptian Hieroglyphs Extended-A" beats "Egyptian Hieroglyphs").
  tokens = (by_name.keys + SHORTFORMS.keys).sort_by { |t| -t.length }

  results = []
  notes.scan(/(\d+)\s*\/\s*(\d+)/) do |covered, total|
    pos = Regexp.last_match.begin(0)
    # Look back up to 120 chars for the nearest block-name hint.
    preceding = notes[([pos - 120, 0].max)..pos].to_s

    # Find the rightmost token occurrence in the preceding text.
    # "rightmost" = closest to the coverage number, which avoids
    # misattributing a number to a block name that appears earlier
    # in the notes.
    best = nil
    best_pos = -1
    tokens.each do |tok|
      idx = preceding.rindex(tok)
      next unless idx && idx > best_pos
      resolved = SHORTFORMS[tok] || tok
      if (block = by_name[resolved])
        best = block
        best_pos = idx
      end
    end
    next unless best

    # Some notes mention another donor's coverage in parentheses, e.g.
    # "Subsumed by uni-hieroglyphica (3995/4000)." In that case the
    # N/N belongs to uni-hieroglyphica (the primary), not this donor.
    # Heuristic: if "by <word>" or "with <word>" appears in the 40
    # chars immediately before the N/N, skip — those chars carry the
    # primary donor's name, not this donor's attribution.
    immediate = notes[([pos - 40, 0].max)...pos].to_s
    if immediate.match?(/\b(?:by|with)\s+[a-z][\w-]*\s*\(?$/i)
      next
    end

    plane = BlockIndex.plane(best)
    start_hex = "U+" + best["start"].to_s(16).upcase.rjust(4, "0")
    end_hex = "U+" + best["end"].to_s(16).upcase.rjust(4, "0")
    results << {
      block: best["name"],
      plane: plane[:code],
      plane_index: plane[:index],
      plane_full: plane[:full],
      range: "#{start_hex}–#{end_hex}",
      start: start_hex,
      end: end_hex,
      covered: covered.to_i,
      total: total.to_i,
      pct: ((covered.to_f / total.to_i) * 100).round(1),
    }
  end
  # Keep one entry per block (the most informative — i.e. highest coverage)
  best_by_block = {}
  results.each do |r|
    if !best_by_block[r[:block]] || r[:covered] > best_by_block[r[:block]][:covered]
      best_by_block[r[:block]] = r
    end
  end
  best_by_block.values
end

# Determine the donor's role from its notes + covers field.
#   primary    — has explicit covers (primary donor for those blocks)
#   secondary  — covers is empty but notes mention coverage as backup
#   redundant  — explicitly redundant with another donor
def detect_role(covers, notes)
  return "primary" unless covers.nil? || covers.empty?
  text = notes.to_s.downcase
  if text.match?(/\b(defense.in.depth|secondary|redundant|subsumed|no unique)\b/)
    "secondary"
  else
    "unknown"
  end
end

# Parse "redundant with X" / "subsumed by X" / "secondary to X" hints.
def parse_relationship(notes)
  return nil if notes.nil?
  if m = notes.match(/redundant with\s+([\w\-]+)/i)
    { kind: "redundant", primary: m[1] }
  elsif m = notes.match(/subsumed by\s+([\w\-]+)/i)
    { kind: "subsumed", primary: m[1] }
  elsif m = notes.match(/secondary to\s+([\w\-]+)/i)
    { kind: "secondary", primary: m[1] }
  end
end

# Group donors by family so the index page can show one card per family
# (Full-Sung ships as 4 files; we want one entry, not four).
def group_by_family(donors)
  families = {}
  donors.each do |d|
    key = d["family"] || d["label"]
    families[key] ||= []
    families[key] << d
  end
  families.map do |family, files|
    primary = files.max_by { |f| (f["covers"] || []).size }
    {
      "family" => family,
      "slug" => donor_slug(primary["label"] || family),
      "license" => primary["license"],
      "author" => primary["author"],
      "url" => primary["url"],
      "url_mirror" => primary["url_mirror"],
      "web" => primary["web"],
      "notes" => primary["notes"],
      "author_note" => primary["author_note"],
      "file_count" => files.size,
      "covers" => files.flat_map { |f| f["covers"] || [] }.uniq,
      "files" => files.map { |f| f["label"] },
      "source_type" => detect_source_type(family, files),
      "vendor" => detect_vendor(family, primary["author"]),
      "enabled" => files.all? { |f| f["enabled"].nil? ? true : f["enabled"] },
    }
  end
end

def load_manifest
  unless File.exist?(MANIFEST_YML)
    warn "Manifest not found at #{MANIFEST_YML}"
    exit 1
  end
  YAML.load_file(MANIFEST_YML)
end

def build_family_detail(family_entry, manifest)
  license_policy = manifest["ofl_compatible_licenses"] || []
  accepted = manifest["accepted_with_conditions"] || []

  # Find the license category: OFL-compatible or accepted_with_conditions
  license = family_entry["license"]
  license_category = if license_policy.include?(license)
                       "ofl_compatible"
                     elsif accepted.any? { |a| a["id"] == license }
                       "accepted_with_conditions"
                     else
                       "unknown"
                     end

  license_info = accepted.find { |a| a["id"] == license }

  # Pull per-file details from the manifest donors list
  files = (manifest["donors"] || []).select do |d|
    family_entry["files"].include?(d["label"])
  end

  block_index = BlockIndex.new(JSON.parse(File.read(BLOCKS_JSON)))

  # Build per-file coverage from explicit `covers` (manifest) +
  # parsed ranges out of `notes`. The union is the full coverage story
  # for the donor, including defense-in-depth ranges that `covers`
  # alone would miss.
  file_details = files.map do |f|
    explicit = (f["covers"] || []).map { |id| block_id_to_name(id) }
    parsed = parse_coverage(f["notes"], block_index)
    all_coverage = (explicit.map { |b| { block: b, source: "manifest" } } +
                    parsed.map { |c| c.merge(source: "notes") })
    {
      "label" => f["label"],
      "file" => f["file"],
      "style" => f["style"],
      "version" => f["version"],
      "sha256" => f["sha256"],
      "url" => f["url"],
      "url_extract" => f["url_extract"],
      "url_extract_member" => f["url_extract_member"],
      "url_mirror" => f["url_mirror"],
      "covers" => explicit,
      "parsed_coverage" => parsed,
      "all_coverage" => all_coverage,
      "notes" => f["notes"],
      "path_local_only" => f["path_local_only"],
      "enabled" => f["enabled"].nil? ? true : f["enabled"],
    }
  end

  # Family-level role + relationship
  family_role = detect_role(family_entry["covers"], family_entry["notes"])
  family_relationship = parse_relationship(family_entry["notes"])
  role = files.any? { |f| !(f["covers"] || []).empty? } ? "primary" : family_role

  # Plane distribution across all covered blocks
  planes = file_details.flat_map { |f| f["parsed_coverage"] }.map { |c| c[:plane] }.uniq

  {
    **family_entry,
    "license_category" => license_category,
    "license_restriction" => license_info&.dig("restriction"),
    "license_summary" => license_info&.dig("restriction_summary"),
    "license_statement" => license_info&.dig("statement"),
    "covers_blocks" => family_entry["covers"].map { |id| block_id_to_name(id) },
    "files" => file_details,
    "role" => role,
    "relationship" => family_relationship,
    "planes" => planes,
    "parsed_coverage" => file_details.flat_map { |f| f["parsed_coverage"] }.uniq { |c| c[:block] },
  }
end

def main
  manifest = load_manifest
  donors = manifest["donors"] || []
  families = group_by_family(donors)

  FileUtils.mkdir_p(DONORS_DIR)

  # Clean stale files
  Dir.glob("#{DONORS_DIR}/*.json").each { |f| File.delete(f) }

  # Per-family detail files — skip non-donors (zero coverage + disabled)
  active_families = []
  families.each do |family|
    detail = build_family_detail(family, manifest)

    # A donor must actually contribute: at least one covered block
    # from covers, parsed_coverage, or file-level all_coverage.
    has_coverage = detail["covers_blocks"].any? ||
                   (detail["parsed_coverage"] || []).any? ||
                   detail["files"].any? { |f| (f["all_coverage"] || []).any? }
    is_enabled = family["enabled"] != false

    if has_coverage && is_enabled
      detail["source_type"] = family["source_type"]
      detail["vendor"] = family["vendor"]
      path = File.join(DONORS_DIR, "#{family[:slug] || donor_slug(family['family'])}.json")
      File.write(path, JSON.pretty_generate(detail))
      active_families << family
    else
      warn "  skip non-donor: #{family['family']} (no coverage)" unless has_coverage
      warn "  skip disabled: #{family['family']}" unless is_enabled
    end
  end

  # Index file — only active (contributing) families
  index = {
    "essenfont_version" => manifest["essenfont_version"],
    "ucd_version" => manifest["ucd_version"],
    "generated_at" => manifest["generated_at"],
    "license_policy" => {
      "ofl_compatible" => manifest["ofl_compatible_licenses"] || [],
      "accepted_with_conditions" => (manifest["accepted_with_conditions"] || []).map { |a| a["id"] },
    },
    "families" => active_families.map do |f|
      detail_path = File.join(DONORS_DIR, "#{f[:slug] || donor_slug(f['family'])}.json")
      detail = File.exist?(detail_path) ? JSON.parse(File.read(detail_path)) : {}
      {
        "family" => f["family"],
        "slug" => f[:slug] || donor_slug(f["family"]),
        "license" => f["license"],
        "author" => f["author"],
        "file_count" => f["file_count"],
        "covers_count" => f["covers"].size,
        "first_cover" => f["covers"].first ? block_id_to_name(f["covers"].first) : nil,
        "role" => detail["role"] || "unknown",
        "planes" => detail["planes"] || [],
        "parsed_coverage_count" => (detail["parsed_coverage"] || []).size,
        "source_type" => f["source_type"],
        "vendor" => f["vendor"],
      }
    end,
  }
  File.write(DONORS_JSON, JSON.pretty_generate(index))

  warn "Wrote #{active_families.size} donor families → public/donors/"
  warn "Wrote index → #{DONORS_JSON}"
end

main