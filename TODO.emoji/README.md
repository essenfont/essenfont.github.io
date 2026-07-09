# Emoji Fix B — CBDT/CBLC Preservation in Subsetter

Track at https://github.com/fontist/fontisan

Emoji fix A (PR #104) gave Emoticons a *monochrome* outline glyph so
Chrome's OTS accepts the subset. Emoji fix B makes the same subset
carry the **color** emoji bitmaps from the source NotoColorEmoji
donor, so browsers render color emoji on `/unicode/char/1F600` pages.

## Why this is non-trivial

CBDT (Color Bitmap Data) and CBLC (Color Bitmap Location) tables are
paired: CBLC indexes glyph IDs to bitmap offsets; CBDT holds the raw
bitmap strikes. Subsetting requires:

1. Walking CBLC's `BitmapSizeTable` records to find which GIDs have
   bitmap data
2. Filtering to only GIDs present in the subset
3. Rewriting the IndexArray entries per BitmapSize
4. Rewriting CBDT with only the referenced bitmap blocks
5. Updating offsets in both tables

fontisan's subsetter currently drops both tables (the `else` branch in
`TableSubsetter#subset_table` passes through `font.table_data[tag]`
unchanged, which leaves the FULL source CBDT — invalid for a subset).

## Migration sequence

| #  | Task                                                       | Effort | Status |
|----|------------------------------------------------------------|--------|--------|
| 01 | [Profile: add CBDT/CBLC to web profile](01-profile-cbdt.md)       | XS | done |
| 02 | [CBDT BinData model](02-cbdt-bindata.md)                           | M  | done |
| 03 | [CBLC BinData model](03-cblc-bindata.md)                           | M  | done |
| 04 | [CBDTSubsetter strategy](04-cbdt-subsetter.md)                     | L  | done |
| 05 | [CBLCSubsetter strategy](05-cblc-subsetter.md)                     | L  | done |
| 06 | [Refactor TableSubsetter to strategy registry](06-strategy-registry.md) | M | done |
| 07 | [WOFF2 round-trip integration spec](07-woff2-roundtrip-spec.md)    | S  | done |
| 08 | [Browser color-rendering smoke test](08-browser-color-smoke.md)    | S  | done |

Effort legend: XS (<1h), S (1–2h), M (half-day), L (full day+).

## Architecture target

`TableSubsetter#subset_table` is currently a `case tag` switch — every
new table requires editing the dispatcher (OCP violation). Refactor
to a strategy registry:

```ruby
module Fontisan
  module Subset
    module TableStrategy
      REGISTRY = {
        "maxp"  => MaxpStrategy,
        "hhea"  => HheaStrategy,
        "glyf"  => GlyfStrategy,
        # ...
        "CBDT"  => CBDTStrategy,
        "CBLC"  => CBLCStrategy,
      }.freeze

      def self.for(tag)
        REGISTRY[tag] || PassThroughStrategy
      end
    end
  end
end
```

Each strategy is a stateless class with `.call(font, mapping, options)`
returning binary bytes. Adding a new table = adding one class + one
REGISTRY entry.

## Constraints

- All changes via PR. Never commit to main.
- No `double()` in specs. Use real BinData fixtures.
- Use Ruby autoload (not `require_relative`).
- Follow lutaml-model for any model serialization.
- No `send` / `instance_variable_set` / `respond_to?`.
