# 03 — CBLC BinData model

A BinData model for the CBLC (Color Bitmap Location) table.

## Spec reference

[OpenType CBLC spec](https://learn.microsoft.com/en-us/typography/opentype/spec/cblc)

Structure:
```
CBLC Header (version uint16, numSizes uint32)
BitmapSizeTable[numSizes]
  indexSubTableArrayOffset (uint32, into CBLC)
  indexTablesSize (uint32)
  numberOfIndexSubTables (uint32)
  colorRef (uint32, unused)
  hori / vert (sbitLineMetrics, 12 bytes each)
  startGlyphIndex (uint16)
  endGlyphIndex (uint16)
  ppemX (uint8)
  ppemY (uint8)
  bitDepth (uint8)
  flags (int8)
IndexSubTableArray[numberOfIndexSubTables]
  firstGlyphIndex (uint16)
  lastGlyphIndex (uint16)
  additionalOffsetToIndexSubtable (uint32)
IndexSubTable (format 1/2/3/4/5 — format-specific)
```

## File target

`lib/fontisan/tables/cblc.rb` — BinData model + read/write + iteration
helpers (`each_glyph_bitmap_offset`).

## Acceptance

- `Tables::CBLC.read(bytes)` returns parsed model
- Round-trip: `model.to_binary_s == bytes`
- `model.bitmap_offset_for_gid(gid, ppem)` returns CBDT offset
