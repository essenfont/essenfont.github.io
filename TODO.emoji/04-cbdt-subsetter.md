# 04 — CBDTSubsetter strategy

A strategy class that subsets the CBDT table to only bitmap blocks
referenced by GIDs in the subset's glyph mapping.

## Algorithm

1. Read source CBLC to enumerate `(gid, ppem) → cbdt_offset` pairs
2. Filter to subset GIDs (those in `mapping.new_to_old.values`)
3. For each kept bitmap block: copy bytes from source CBDT into output,
   tracking new offset
4. Return rewritten CBDT bytes + offset map (for CBLC update)

## File target

`lib/fontisan/subset/table_strategy/cbdt.rb` — implements `.call`.

## Signature

```ruby
module Fontisan
  module Subset
    module TableStrategy
      class CBDT
        Result = Struct.new(:bytes, :offset_map, keyword_init: true)

        # @param font [SfntFont] source font
        # @param mapping [GlyphMapping] old↔new GID map
        # @param options [Options]
        # @return [Result] new CBDT bytes + { gid => {ppem => new_offset} }
        def self.call(font:, mapping:, options:)
          ...
        end
      end
    end
  end
end
```

## Acceptance

- CBDT size after subset < source CBDT size when subset omits some emojis
- All retained bitmaps remain decodable (verified by fontTools)
- Spec covers a 2-emoji subset (U+1F600 + U+1F601) from a 10-emoji source
