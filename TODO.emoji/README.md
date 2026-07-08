# Emoji Fix B — CBDT/CBLC Preservation in Subsetter

Track at https://github.com/fontist/fontisan

Emoji fix A (PR #104) gave Emoticons a *monochrome* outline glyph so
Chrome's OTS accepts the subset. Emoji fix B makes the same subset
carry the **color** emoji bitmaps from the source NotoColorEmoji
donor, so browsers render color emoji on `/unicode/char/1F600` pages.

## Why this is non-trivial

CBDT (Color Bitmap Data) and CBLC (Color Bitmap Location) tables are
paired: CBLC indexes glyph IDs to bitmap offsets; CBDT holds the raw
bitmap strikes. Subsetting requires walking CBLC's `BitmapSizeTable`
records, filtering to subset GIDs, rewriting IndexArray entries per
BitmapSize, rewriting CBDT with only referenced bitmap blocks, and
updating offsets in both tables — **as one atomic operation**.

fontisan's subsetter currently drops both tables (the `else` branch in
`TableSubsetter#subset_table` passes through `font.table_data[tag]`
unchanged, which leaves the FULL source CBDT — invalid for a subset).

## Revised architecture (v2)

The original v1 plan (8 tasks) had three structural issues:
1. Profile enablement (01) was sequenced before the subsetter existed —
   invalid fonts between 01 and 04.
2. CBDT and CBLC were modeled as two separable strategies — but they
   share the IndexSubTable graph and must be subsetted as a unit.
3. The registry refactor (06) was sequenced last — pure churn, since
   CBDT/CBLC would be written twice.

The v2 plan fixes all three: registry first, IndexSubTable polymorphism
as a proper format registry, one composite `ColorBitmap` strategy that
owns both tables, specs gate the profile enablement, and profile
enablement is the "go live" switch at the end.

## Migration sequence

| #  | Task                                                       | Effort | Depends on |
|----|------------------------------------------------------------|--------|------------|
| 01 | [Strategy registry refactor](01-strategy-registry.md)       | M  | — |
| 02 | [IndexSubTable polymorphic parser](02-index-sub-table-parser.md) | L | — |
| 03 | [IndexSubTableGraph value object](03-index-sub-table-graph.md) | M | 02 |
| 04 | [ColorBitmap composite strategy](04-color-bitmap-strategy.md) | L | 01, 02, 03 |
| 05 | [WOFF2 round-trip integration spec](05-woff2-roundtrip-spec.md) | S | 04 |
| 06 | [Profile enablement](06-profile-enablement.md)              | XS | 05 |
| 07 | [Browser color-rendering smoke test](07-browser-color-smoke.md) | S | 06 |

Effort legend: XS (<1h), S (1–2h), M (half-day), L (full day+).

## Architecture target

### Strategy registry with uniform Hash interface

`TableSubsetter#subset_table` is currently a `case tag` switch — every
new table requires editing the dispatcher (OCP violation). Refactor to
a strategy registry where every strategy returns a `Hash<String => String>`
mapping table tags to bytes. Single-tag strategies return one entry;
composite strategies (like ColorBitmap) return multiple:

```ruby
module Fontisan
  module Subset
    module TableStrategy
      REGISTRY = {
        "maxp"  => Maxp,
        "hhea"  => Hhea,
        "glyf"  => Glyf,
        "CBDT"  => ColorBitmap,  # composite — owns both CBDT and CBLC
        "CBLC"  => ColorBitmap,
      }.freeze

      def self.for(tag)
        REGISTRY[tag] || PassThrough
      end
    end
  end
end
```

Each strategy declares `OWNED_TAGS` and returns `{ tag => bytes }` for
each owned tag:

```ruby
class Maxp
  OWNED_TAGS = ["maxp"].freeze

  def self.call(font:, mapping:, options:)
    { "maxp" => subset_maxp_bytes(font, mapping) }
  end
end

class ColorBitmap
  OWNED_TAGS = %w[CBDT CBLC].freeze

  def self.call(font:, mapping:, options:)
    graph = IndexSubTableGraph.from_font(font)
    kept = graph.select_gids(mapping.kept_old_gids)
    new_cbdt, offset_map = Tables::Cbdt.rebuild_from(kept, font.table_data["CBDT"])
    new_cblc = Tables::Cblc.rebuild_from(graph, offset_map)
    Validator.call(cblc_bytes: new_cblc, cbdt_bytes: new_cbdt, kept_gids: mapping.kept_old_gids)
    { "CBDT" => new_cbdt, "CBLC" => new_cblc }
  end
end
```

### IndexSubTable polymorphism via format registry

CBLC's IndexSubTable has 5 formats (1–5) with different layouts.
Dispatching on format via `case` would be OCP violation. Each format
is its own class behind a `REGISTRY`:

```ruby
module Fontisan::Tables::Cblc
  module IndexSubTable
    REGISTRY = {
      1 => Format1, 2 => Format2, 3 => Format3,
      4 => Format4, 5 => Format5,
    }.freeze

    def self.for(format_code)
      REGISTRY[format_code] or raise InvalidFontError, "..."
    end
  end
end
```

Adding a hypothetical Format 6 = one class + one REGISTRY entry.

### CBDT stays a byte-holder (not a full BinData record)

CBDT has no header — it's just a sequence of bitmap data blocks. CBLC
owns all the structure. Modeling CBDT as a full BinData record is
over-engineering. The existing `Tables::Cbdt` (thin byte-holder with
`bitmap_data_at(offset, length)`) is the right shape. Add only a
`rebuild_from` class method that slices + concatenates.

## Constraints

- All changes via PR. Never commit to main.
- No `double()` in specs. Use real BinData fixtures.
- Use Ruby autoload (not `require_relative`) for library code.
- Use `require_relative` for spec cross-references (not `require "fontisan/..."`).
- Follow BinData for binary structures.
- No `send` / `instance_variable_set` / `respond_to?`.
