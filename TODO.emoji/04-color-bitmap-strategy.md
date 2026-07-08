# 04 — ColorBitmap composite strategy

A single strategy class that subsets CBDT and CBLC together as one
atomic operation. They share the IndexSubTable graph and cannot be
subsetted independently — subsetting one without the other produces
dangling offsets or orphan bitmap blocks.

## Dependencies

- Task 01 (strategy registry) — the ColorBitmap strategy plugs into
  the registry.
- Task 02 (IndexSubTable parser) — the per-format enumeration.
- Task 03 (IndexSubTableGraph) — the unifying graph abstraction.

## Architecture

### Composite strategy

```ruby
# lib/fontisan/subset/table_strategy/color_bitmap.rb
module Fontisan
  module Subset
    module TableStrategy
      class ColorBitmap
        OWNED_TAGS = %w[CBDT CBLC].freeze

        autoload :IndexSubTableGraph,
                 "fontisan/subset/table_strategy/color_bitmap/index_sub_table_graph"
        autoload :Validator,
                 "fontisan/subset/table_strategy/color_bitmap/validator"

        # Subset CBDT + CBLC to only bitmap blocks referenced by GIDs
        # in the subset's glyph mapping.
        #
        # @param font [SfntFont] source font (must have CBDT and CBLC)
        # @param mapping [GlyphMapping] old↔new GID map
        # @param options [Options]
        # @return [Hash{String => String}] {"CBDT" => bytes, "CBLC" => bytes}
        def self.call(font:, mapping:, options:)
          graph = IndexSubTableGraph.from_font(font)
          kept_gids = mapping.kept_old_gids
          kept_slices = graph.select_gids(kept_gids)

          new_cbdt, offset_map = Tables::Cbdt.rebuild_from(
            kept_slices, font.table_data["CBDT"]
          )
          new_cblc = Tables::Cblc.rebuild_from(graph, offset_map)

          Validator.call(
            cblc_bytes: new_cblc,
            cbdt_bytes: new_cbdt,
            kept_gids: kept_gids,
          )

          { "CBDT" => new_cbdt, "CBLC" => new_cblc }
        end
      end
    end
  end
end
```

### Registry wiring

The strategy registry maps BOTH "CBDT" and "CBLC" to `ColorBitmap`:

```ruby
REGISTRY = {
  ...
  "CBDT" => ColorBitmap,
  "CBLC" => ColorBitmap,
}.freeze
```

The dispatcher (from task 01) sees "CBDT" first, calls
`ColorBitmap.call(...)`, gets `{ "CBDT" => ..., "CBLC" => ... }`, and
skips "CBLC" when it appears later (already in the results hash).

### CBLC rebuild algorithm

`Tables::Cblc.rebuild_from(graph, offset_map)`:

1. Clone the CBLC header (version, numSizes).
2. For each BitmapSize:
   - Walk its IndexSubTableArray entries.
   - For each IndexSubTable: call `Format.rewrite(gid_to_new_offset)`
     with the offsets from `offset_map`.
   - Update `additionalOffsetToIndexSubtable` to the new byte position.
   - Drop IndexSubTables whose GID range has no intersection with
     `kept_gids`.
3. Drop BitmapSize records that have no remaining IndexSubTables.
4. Re-serialize the CBLC bytes.

### Post-subsetting validator

```ruby
# lib/fontisan/subset/table_strategy/color_bitmap/validator.rb
class ColorBitmap
  class Validator
    def self.call(cblc_bytes:, cbdt_bytes:, kept_gids:)
      graph = IndexSubTableGraph.new(cblc_bytes, cbdt_bytes.bytesize)

      unless graph.all_offsets_in_range?
        raise InvalidSubsetError,
              "CBDT offset out of range: a CBLC IndexSubTable references " \
              "beyond the CBDT byte boundary"
      end

      unless graph.gids_subset_of?(kept_gids)
        extra = graph.each_slice.map(&:gid).to_set - kept_gids
        raise InvalidSubsetError,
              "CBLC references GIDs not in subset: #{extra.to_a.sort.first(10)}"
      end

      true
    end
  end
end
```

This catches the three most common subsetting bugs:
1. **Dangling CBDT offset** — CBLC points beyond CBDT boundary.
2. **Orphan CBDT blocks** — CBDT has blocks CBLC doesn't reference
   (checked via size accounting, optional).
3. **Extra GIDs in CBLC** — CBLC still references GIDs that were
   dropped from the subset.

## Spec coverage

| File | Examples |
|------|----------|
| `spec/fontisan/subset/table_strategy/color_bitmap_spec.rb` | (1) empty subset → empty CBDT + empty-strike CBLC, (2) full subset → identical to source, (3) partial subset (2 of 10 emojis) → only 2 bitmaps in CBDT, (4) no CBDT in source → empty hash, (5) OWNED_TAGS returns both tags (6+ examples) |
| `spec/fontisan/subset/table_strategy/color_bitmap/validator_spec.rb` | (1) valid pair passes, (2) dangling offset raises, (3) extra GIDs raises, (4) empty CBDT with empty CBLC passes (5+ examples) |
| `spec/fontisan/subset/table_strategy_spec.rb` | (add) `for("CBDT")` returns ColorBitmap, `for("CBLC")` returns ColorBitmap (2 examples) |

~15 new examples. Integration with real font deferred to task 05.

## Risk

- **Offset arithmetic**: CBDT offsets are relative to the start of
  CBDT, not the start of the file. Getting the base wrong is the #1
  bug in any CBLC/CBDT subsetter. Every offset must be validated by
  the Validator before returning.

- **Multi-strike fonts**: NotoColorEmoji has multiple ppem sizes (e.g.,
  72x72 and 128x128). Each strike independently subsets its GIDs.
  The strategy must keep all strikes (dropping strikes changes
  rendering behavior at different sizes). Only drop GIDs WITHIN each
  strike.

- **Performance**: for a large CBDT (NotoColorEmoji CBDT is ~10MB),
  avoid parsing every bitmap. Use `byteslice` to copy raw byte ranges
  without decoding bitmap content. The `Cbdt.rebuild_from` method
  should never look inside the bitmap data — just slice and concat.

- **Registry ordering**: if the dispatcher processes "CBLC" before
  "CBDT", it still hits `ColorBitmap.call(...)` (same class), but
  might double-process. The dispatcher's `next if results.key?(tag)`
  guard prevents this — verified by task 01's spec.

## References

- Task 01's strategy registry — where ColorBitmap plugs in
- Task 02's `IndexSubTable.for(format).rewrite(gid_to_new_offset)` — per-format rewrite
- Task 03's `IndexSubTableGraph.select_gids` + invariant checks
- `lib/fontisan/subset/glyph_mapping.rb` — `mapping.kept_old_gids` (the GID filter)
- `lib/fontisan/tables/cbdt.rb:92` — `bitmap_data_at` (existing slice API to extend with `rebuild_from`)

## Acceptance

- `ColorBitmap.call(...)` returns `{ "CBDT" => bytes, "CBLC" => bytes }`
- Partial subset CBDT size < source CBDT size
- All retained bitmaps remain decodable (verified by Validator + task 05 integration)
- Every CBLC IndexSubTable's `additionalOffsetToIndexSubtable` points into the new CBDT
- No `send` / `respond_to?` / `instance_variable_set` anywhere
- All ~15 new specs pass
- Rubocop clean
