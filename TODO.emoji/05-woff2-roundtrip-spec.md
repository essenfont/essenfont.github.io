# 05 — WOFF2 round-trip integration spec

End-to-end spec verifying that CBDT/CBLC tables survive the full
subset → WOFF2 encode → WOFF2 decode round trip intact. This is the
gate for task 06 (profile enablement): the profile is only enabled
after this spec passes.

## Dependencies

- Task 04 (ColorBitmap composite strategy) — the spec exercises it
  end-to-end.

## Spec

`spec/fontisan/subset/cbdt_round_trip_spec.rb`

## Setup

Source: a real CBDT font fixture. If NotoColorEmoji is too large,
build a minimal CBDT font via `SfntBuilder` with hand-built CBLC +
CBDT bytes that encode 2-3 synthetic emoji bitmaps. The fixture must
have:
- A valid CBLC with 1 strike, 1 IndexSubTable (Format 1 or 2)
- A CBDT with the bitmap data for 3 GIDs
- A glyf table (for outline fallback — emoji fix A)

## Test cases

```ruby
RSpec.describe "CBDT/CBLC subset → WOFF2 round trip" do
  it "retains CBDT + CBLC tables through subsetting" do
    font = Fontisan::FontLoader.load(cbdt_font_path)
    mapping = Fontisan::Subset::GlyphMapping.new(...)
    subset = Fontisan::Subset::Builder.build(
      font, mapping, profile: Fontisan::Subset::Profile.for_name("web")
    )

    expect(subset.has_table?("CBDT")).to be(true)
    expect(subset.has_table?("CBLC")).to be(true)

    # CBDT should be smaller (only 2 of 3 emojis)
    expect(subset.table_data["CBDT"].bytesize)
      .to be < font.table_data["CBDT"].bytesize
  end

  it "produces a subset that fontTools can decode", :python do
    skip "fontTools not available" unless python_fonttools?

    # ... subset to file, then:
    t = TTFont(subset_path)
    expect(t.keys).to include("CBDT", "CBLC")
  end

  it "encodes the subset as WOFF2 without losing CBDT/CBLC" do
    woff2 = Fontisan::Converters::Woff2Encoder.new
      .convert(subset_font, brotli_quality: 11)[:woff2_binary]

    Dir.mktmpdir do |dir|
      path = File.join(dir, "subset.woff2")
      File.binwrite(path, woff2)

      decoded = Fontisan::Woff2Font.from_file(path)
      expect(decoded.has_table?("CBDT")).to be(true)
      expect(decoded.has_table?("CBLC")).to be(true)
    end
  end

  it "Validator passes on the subset CBDT/CBLC pair" do
    # Direct invariant check on the subset output
    graph = ColorBitmap::IndexSubTableGraph.new(
      subset.table_data["CBLC"],
      subset.table_data["CBDT"].bytesize,
    )
    expect(graph.all_offsets_in_range?).to be(true)
    expect(graph.gids_subset_of?(mapping.kept_old_gids)).to be(true)
  end
end
```

## Optional Chrome test (deferred to task 07)

If a local Chrome instance is available via Puppeteer, add a probe:

```ruby
it "renders color pixels in Chrome" do
  # Load the WOFF2 as a data URL, render 😀 in a <span>, screenshot
  # the bounding box, and verify multiple distinct colors are present.
  # Monochrome fallback (glyf only) would be a single color.
end if chrome_available?
```

This is optional for task 05; the full browser smoke is task 07.

## Spec coverage

| File | Examples |
|------|----------|
| `spec/fontisan/subset/cbdt_round_trip_spec.rb` | (1) subset retains CBDT+CBLC, (2) subset CBDT is smaller, (3) fontTools decodes subset, (4) WOFF2 round-trip preserves CBDT+CBLC, (5) Validator passes on subset output (5 examples) |

## Risk

- **No CBDT fixture available**: this is the same gap that blocked
  the stitcher outline-priority spec (PR #104). Build a minimal
  synthetic fixture via `SfntBuilder`. If that's too hard, the spec
  should skip with a clear message pointing to the fixture follow-up.

- **fontTools dependency**: the `:python` tag requires fontTools.
  The spec should skip gracefully if unavailable, not fail.

- **WOFF2 + CBDT interaction**: Chrome's OTS may reject WOFF2 files
  with CBDT if the table order or padding is wrong. This spec
  verifies fontTools can decode, but Chrome acceptance is task 07.

## References

- Task 04's `ColorBitmap.call(...)` — the strategy under test
- Task 04's `Validator` — the invariant check
- `lib/fontisan/converters/woff2_encoder.rb` — the WOFF2 encoder
- `spec/fontisan/subset/` — existing subset spec patterns

## Acceptance

- Subset TTF has CBDT + CBLC tables with the subset emojis' bitmaps
- Subset CBDT size < source CBDT size
- fontTools can decode the subset TTF
- WOFF2 round-trip preserves CBDT + CBLC
- Validator passes on the subset CBDT/CBLC pair
- All 5 examples pass (fontTools-dependent ones skip if unavailable)
