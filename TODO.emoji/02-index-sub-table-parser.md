# 02 — IndexSubTable polymorphic parser

CBLC's IndexSubTable has 5 formats (1–5) per OpenType spec, each with
a different binary layout. This task implements a format registry so
the ColorBitmap strategy (task 04) can enumerate `(gid, cbdt_offset,
size)` tuples regardless of which format a given IndexSubTable uses.

## Dependencies

None. Can be developed in parallel with task 01 (strategy registry).

## Spec reference

[OpenType EBLC IndexSubTable spec](https://learn.microsoft.com/en-us/typography/opentype/spec/eblc#indexsubtable)
(CBLC reuses the EBLC format verbatim.)

| Format | Metrics type | Data layout |
|--------|-------------|-------------|
| 1 | BigGlyphMetrics per glyph | Raw image data follows each metrics |
| 2 | SmallGlyphMetrics per glyph | Uniform-size data follows each metrics |
| 3 | BigGlyphMetrics per glyph | No data (data lives elsewhere — Format 4 pair) |
| 4 | N/A (uses IndexSubTableArray) | Variable-size data, nested array |
| 5 | One BigGlyphMetrics for range | Uniform-size data, constant metrics |

## Architecture

### Format registry (OCP-compliant)

```ruby
# lib/fontisan/tables/cblc/index_sub_table.rb
module Fontisan
  module Tables
    class Cblc < Binary::BaseRecord
      module IndexSubTable
        autoload :Format1, "fontisan/tables/cblc/index_sub_table/format1"
        autoload :Format2, "fontisan/tables/cblc/index_sub_table/format2"
        autoload :Format3, "fontisan/tables/cblc/index_sub_table/format3"
        autoload :Format4, "fontisan/tables/cblc/index_sub_table/format4"
        autoload :Format5, "fontisan/tables/cblc/index_sub_table/format5"
        autoload :FormatBase, "fontisan/tables/cblc/index_sub_table/format_base"

        REGISTRY = {
          1 => Format1,
          2 => Format2,
          3 => Format3,
          4 => Format4,
          5 => Format5,
        }.freeze

        def self.for(format_code)
          REGISTRY[format_code] ||
            raise(InvalidFontError, "unknown IndexSubTable format #{format_code}")
        end
      end
    end
  end
end
```

### Uniform contract per format

Every Format class implements the same interface, inheriting from
`FormatBase`:

```ruby
class FormatBase
  # @param bytes [String] raw bytes of this IndexSubTable (starting at
  #   the indexFormat field)
  # @param first_gid [Integer] first GID in the range
  # @param last_gid [Integer] last GID in the range
  # @param image_data_offset [Integer] base offset into CBDT for this
  #   strike's data (from CBLC's BitmapSize.indexSubTableArrayOffset +
  #   additionalOffsetToIndexSubtable)
  def initialize(bytes, first_gid:, last_gid:, image_data_offset:)
    ...
  end

  # @return [Enumerator<BitmapSlice>] one slice per GID in range
  def each_slice
    raise NotImplementedError
  end

  # @return [Integer] the indexFormat code (1, 2, 3, 4, or 5)
  def format_code
    raise NotImplementedError
  end

  # Rewrite this subtable with new CBDT offsets for the kept GIDs.
  # GIDs not in gid_to_new_offset are dropped from the range.
  # @param gid_to_new_offset [Hash<Integer => Integer>] { old_gid => new_cbdt_offset }
  # @return [String] new bytes for this IndexSubTable
  def rewrite(gid_to_new_offset)
    raise NotImplementedError
  end
end
```

`BitmapSlice` is a value object:

```ruby
BitmapSlice = Struct.new(:gid, :offset, :size, keyword_init: true)
```

### Per-format parsing notes

- **Format 1**: read `BigGlyphMetrics` (5 bytes) + `imageData` per
  glyph. Each glyph's CBDT offset = `image_data_offset +
  cumulative_byte_offset`. Size = imageData length.

- **Format 2**: read `SmallGlyphMetrics` (5 bytes) once, then
  `dataSize` (uint32). Every glyph has the same data size. Offsets are
  evenly spaced.

- **Format 3**: same layout as Format 1 but `imageSize` is 0 — data
  is NOT stored inline; it's referenced by Format 4 elsewhere.

- **Format 4**: has a nested `IndexSubTableArray` with variable-length
  entries. `numIndices` (uint32) followed by `IndexSubTableArrayEntry`
  records. RECURSION RISK — see Risk section.

- **Format 5**: one `BigGlyphMetrics` for the entire range, then
  `imageSize` (uint32). Every glyph shares the same metrics and data
  size.

### CBDT stays a byte-holder

CBDT has no header — just a byte buffer of bitmap data. The existing
`Tables::Cbdt` is the right shape (thin byte-holder). Add only:

```ruby
class Cbdt
  # Slice + concat into a new CBDT, tracking new offsets.
  # @param slices [Array<BitmapSlice>]
  # @param source_bytes [String] original CBDT bytes
  # @return [String, Hash<Integer => Integer>] new CBDT bytes + { gid => new_offset }
  def self.rebuild_from(slices, source_bytes)
    ...
  end
end
```

## Spec coverage

| File | Examples |
|------|----------|
| `spec/fontisan/tables/cblc/index_sub_table_spec.rb` | (1) `for(1)` returns Format1, (2) `for(99)` raises InvalidFontError, (3) REGISTRY covers formats 1-5 |
| `spec/fontisan/tables/cblc/index_sub_table/format1_spec.rb` | parse known bytes → correct slices; rewrite with subset GIDs → correct new offsets; round-trip (8+ examples) |
| `spec/fontisan/tables/cblc/index_sub_table/format2_spec.rb` | uniform-size slicing; rewrite preserves metrics (6+ examples) |
| `spec/fontisan/tables/cblc/index_sub_table/format3_spec.rb` | zero-data format; slicing returns offset but size 0 (4+ examples) |
| `spec/fontisan/tables/cblc/index_sub_table/format4_spec.rb` | nested IndexSubTableArray; recursion depth 1 (6+ examples) |
| `spec/fontisan/tables/cblc/index_sub_table/format5_spec.rb` | constant-metrics slicing; rewrite preserves single-metrics block (6+ examples) |
| `spec/fontisan/tables/cbdt_spec.rb` | (add) `Cbdt.rebuild_from` with empty slices, single slice, multi-slice (4+ examples) |

~40 new examples. Each format has a minimal synthetic byte fixture
(hand-built, not from a real font).

## Risk

- **Format 4 recursion**: the nested IndexSubTableArray can itself
  reference other IndexSubTables. Real fonts rarely nest beyond depth
  1, but a malicious font could cause stack overflow. Set
  `MAX_NESTING_DEPTH = 2` and raise `InvalidFontError` on deeper
  nesting.

- **Format 3 + Format 4 pairing**: Format 3 subtables store NO inline
  data — they're metadata-only. The actual data lives in a Format 4
  subtable elsewhere in the same strike. The parser must cross-reference
  the pair. If a Format 3 appears without its Format 4 partner, raise
  `InvalidFontError`.

- **Byte alignment**: CBDT data blocks are NOT necessarily 4-byte
  aligned. The CBLC offsets are absolute byte offsets, not padded.
  Don't apply `Utilities::Padding` to CBDT slices — they must be
  byte-for-byte identical to the source.

- **Endianness**: all multi-byte fields in IndexSubTable are
  big-endian. Use BinData or `unpack("n")` / `unpack("N")`.

## References

- `lib/fontisan/tables/cblc.rb:75` — existing `BitmapSize` class (start point for the IndexSubTable graph)
- `lib/fontisan/tables/cbdt.rb:92` — existing `bitmap_data_at(offset, length)` (the byte-holder API)
- [OpenType EBLC IndexSubTable spec](https://learn.microsoft.com/en-us/typography/opentype/spec/eblc#indexsubtable)

## Acceptance

- `IndexSubTable.for(format)` dispatches to the correct Format class
- Each format can parse synthetic test bytes and produce correct slices
- Each format can rewrite with a subset GID map
- No `case format` switch anywhere — dispatch is via REGISTRY
- All ~40 new specs pass
- Rubocop clean
