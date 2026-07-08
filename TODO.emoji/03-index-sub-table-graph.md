# 03 — IndexSubTableGraph value object

A value object that captures CBLC's full structure as a queryable
graph: each BitmapSize → each IndexSubTableArray entry → each
`(gid, cbdt_offset, size)` tuple. This is the unifying abstraction
that lets the ColorBitmap strategy (task 04) treat CBLC as a set of
bitmap slices rather than a nested byte structure.

## Dependencies

- Task 02 (IndexSubTable parser) — the graph delegates per-format
  enumeration to `IndexSubTable.for(format).each_slice`.

## Architecture

### IndexSubTableGraph

```ruby
# lib/fontisan/subset/table_strategy/color_bitmap/index_sub_table_graph.rb
module Fontisan
  module Subset
    module TableStrategy
      class ColorBitmap
        # Captures CBLC's structure as a flat, queryable sequence of
        # bitmap slices. Stateless given (cblc_bytes, cbdt_size).
        class IndexSubTableGraph
          # @param font [SfntFont] source font with CBLC and CBDT tables
          # @return [IndexSubTableGraph]
          def self.from_font(font)
            new(font.table_data["CBLC"], font.table_data["CBDT"]&.bytesize || 0)
          end

          # @param cblc_bytes [String] raw CBLC table bytes
          # @param cbdt_size [Integer] total CBDT byte size (for bounds checking)
          def initialize(cblc_bytes, cbdt_size)
            @cblc = Tables::Cblc.read(cblc_bytes)
            @cbdt_size = cbdt_size
          end

          # Enumerate every (gid, ppem, cbdt_offset, size) tuple across
          # all strikes and all IndexSubTable formats.
          #
          # @return [Enumerator<BitmapSlice>]
          def each_slice(&)
            return to_enum(:each_slice) unless block_given?

            @cblc.strikes.each do |strike|
              each_subtable_in(strike) do |sub_bytes, first_gid, last_gid, img_offset|
                format_code = sub_bytes.unpack1("n") # first uint16
                sub = Tables::Cblc::IndexSubTable.for(format_code)
                  .new(sub_bytes, first_gid:, last_gid:, image_data_offset: img_offset)
                sub.each_slice do |slice|
                  yield BitmapSlice.new(
                    gid: slice.gid,
                    ppem: strike.ppem,
                    offset: slice.offset,
                    size: slice.size,
                  )
                end
              end
            end
          end

          # Select slices whose GIDs are in `kept_gids`.
          # @param kept_gids [Set<Integer>] old GIDs to retain
          # @return [Array<BitmapSlice>]
          def select_gids(kept_gids)
            each_slice.select { |s| kept_gids.include?(s.gid) }
          end

          # True if every slice's CBDT offset is within [0, cbdt_size).
          def all_offsets_in_range?
            each_slice.all? { |s| s.offset + s.size <= @cbdt_size }
          end

          # True if every CBLC-referenced GID is in the kept set.
          def gids_subset_of?(kept_gids)
            each_slice.all? { |s| kept_gids.include?(s.gid) }
          end

          private

          def each_subtable_in(strike)
            # Walk the IndexSubTableArray: per BitmapSize, read
            # numberOfIndexSubTables entries of (firstGid, lastGid,
            # additionalOffset). The IndexSubTable data is at
            # indexSubTableArrayOffset + additionalOffset.
            ...
          end
        end

        BitmapSlice = Struct.new(:gid, :ppem, :offset, :size, keyword_init: true)
      end
    end
  end
end
```

### Why a value object, not a BinData model?

The graph is a READ-ONLY view over CBLC's structure. It doesn't own
serialization — CBLC's BinData model does. It just provides:
- `each_slice` — flatten the nested structure into a flat enumerator
- `select_gids` — filter for subsetting
- `all_offsets_in_range?` — invariant check for the validator

This keeps CBLC's BinData model pure (parse + serialize) while the
graph handles the subsetter's query semantics.

### Relationship to tasks 02 and 04

```
Task 02 (IndexSubTable parser)
  → provides Format1..5.each_slice (per-format enumeration)

Task 03 (this task)
  → IndexSubTableGraph composes CBLC.strikes × IndexSubTable.for(format)
  → provides select_gids + invariant checks

Task 04 (ColorBitmap strategy)
  → calls graph.select_gids(mapping.kept_old_gids)
  → calls Cbdt.rebuild_from(slices) to produce new CBDT
  → calls Cblc.rebuild_from(graph, offset_map) to produce new CBLC
  → calls Validator to verify consistency
```

## Spec coverage

| File | Examples |
|------|----------|
| `spec/fontisan/subset/table_strategy/color_bitmap/index_sub_table_graph_spec.rb` | (1) empty CBLC → no slices, (2) single-strike single-format → correct slices, (3) multi-strike → slices tagged with correct ppem, (4) `select_gids` filters correctly, (5) `all_offsets_in_range?` catches out-of-bounds, (6) `gids_subset_of?` catches extra GIDs (8+ examples) |

Each example uses a hand-built minimal CBLC byte fixture (not a real
font). Fixtures are ~100 bytes, easy to inspect.

## Risk

- **Walking the IndexSubTableArray**: the CBLC header's
  `indexSubTableArrayOffset` is relative to the START of CBLC, not
  the start of the file. Getting this offset wrong silently produces
  garbage slices. Add a spec that checks the offset calculation
  against a known-good CBLC.

- **Empty strikes**: some fonts have `numSizes > 0` but all strikes
  have `startGlyphIndex > endGlyphIndex` (empty range). The graph
  should yield zero slices for these — not crash. Add an empty-strike
  fixture.

- **Performance**: for large CBLC (NotoColorEmoji has ~7 strikes ×
  hundreds of glyphs each), `each_slice` yields thousands of times.
  Use lazy enumeration (`Enumerator::Lazy`) if the caller only needs
  a subset. But since `select_gids` iterates everything anyway, eager
  is fine for now.

## References

- `lib/fontisan/tables/cblc.rb:75-157` — existing `BitmapSize` class with `each_index_sub_table` pattern
- Task 02's `IndexSubTable.for(format)` — the per-format delegation point
- `lib/fontisan/subset/glyph_mapping.rb` — `mapping.kept_old_gids` source

## Acceptance

- `IndexSubTableGraph.from_font(font)` produces a graph from any font with CBLC
- `each_slice` yields `BitmapSlice` for every (gid, ppem) pair
- `select_gids(Set)` filters correctly
- `all_offsets_in_range?` and `gids_subset_of?` invariant checks work
- All 8+ new specs pass
- Rubocop clean
