# 02 — CBDT BinData model

A BinData model for the CBDT (Color Bitmap Data) table so the
subsetter can parse + rewrite it.

## Spec reference

[OpenType CBDT spec](https://learn.microsoft.com/en-us/typography/opentype/spec/cbdt)

Structure:
```
CBDT Header (version uint32, numSizes uint32 — actually in CBLC)
BigGlyphMetrics / SmallGlyphMetrics + bitmap data per glyph
```

CBDT itself is just a sequence of bitmap data blocks. The CBLC table
indexes them. To subset CBDT:

1. Parse CBLC to know each glyph's bitmap offset(s) per strike size
2. Walk CBDT in CBLC-defined order
3. For subset GIDs, keep their bitmap blocks; drop others
4. Rewrite CBLC offsets to point into the new CBDT

## File target

`lib/fontisan/tables/cbdt.rb` — BinData model + read/write.

## Acceptance

- `Tables::CBDT.read(bytes)` returns parsed model
- Round-trip: `model.to_binary_s == bytes`
- Spec covers reading a real NotoColorEmoji CBDT slice
