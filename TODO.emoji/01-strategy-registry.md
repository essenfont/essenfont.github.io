# 01 — Strategy registry refactor

`TableSubsetter#subset_table` is a `case tag` switch. Every new table
requires editing the dispatcher — OCP violation. This task refactors
to a strategy registry so subsequent tasks (ColorBitmap, future tables)
plug in without touching the dispatcher.

## Dependencies

None. This is the enabler for all subsequent tasks.

## Architecture

### Uniform `Hash<String => String>` interface

Every strategy returns a `Hash` mapping table tags to their subset
bytes — NOT a bare `String`. This lets composite strategies (like
ColorBitmap) return bytes for multiple tables in a single call.

```ruby
class Maxp
  OWNED_TAGS = ["maxp"].freeze

  def self.call(font:, mapping:, options:)
    { "maxp" => subset_maxp_bytes(font, mapping) }
  end
end
```

### Registry

```ruby
# lib/fontisan/subset/table_strategy.rb
module Fontisan
  module Subset
    module TableStrategy
      autoload :Maxp,        "fontisan/subset/table_strategy/maxp"
      autoload :Hhea,        "fontisan/subset/table_strategy/hhea"
      autoload :Hmtx,        "fontisan/subset/table_strategy/hmtx"
      autoload :Loca,        "fontisan/subset/table_strategy/loca"
      autoload :Glyf,        "fontisan/subset/table_strategy/glyf"
      autoload :Cmap,        "fontisan/subset/table_strategy/cmap"
      autoload :Post,        "fontisan/subset/table_strategy/post"
      autoload :Name,        "fontisan/subset/table_strategy/name"
      autoload :Head,        "fontisan/subset/table_strategy/head"
      autoload :Os2,         "fontisan/subset/table_strategy/os2"
      autoload :PassThrough, "fontisan/subset/table_strategy/pass_through"

      REGISTRY = {
        "maxp"  => Maxp,
        "hhea"  => Hhea,
        "hmtx"  => Hmtx,
        "loca"  => Loca,
        "glyf"  => Glyf,
        "cmap"  => Cmap,
        "post"  => Post,
        "name"  => Name,
        "head"  => Head,
        "OS/2"  => Os2,
      }.freeze

      def self.for(tag)
        REGISTRY[tag] || PassThrough
      end
    end
  end
end
```

### Dispatcher

`TableSubsetter#subset_table` becomes a thin dispatcher. The caller
(`TableSubsetter#subset_all` or equivalent) iterates source tags and
skips any already produced by a composite strategy:

```ruby
def subset_all(tags, font, mapping, options)
  tags.each_with_object({}) do |tag, results|
    next if results.key?(tag) # composite already produced it
    next unless font.has_table?(tag)

    strategy = TableStrategy.for(tag)
    strategy::OWNED_TAGS.each { |owned| next if results.key?(owned) }
    results.merge!(strategy.call(font:, mapping:, options:))
  end
end
```

No `respond_to?` — every strategy declares `OWNED_TAGS` uniformly.

## Migration

Mechanical: extract each `subset_<tag>` method body from
`TableSubsetter` into a strategy class. Run existing specs after each
extraction. The `case tag` switch shrinks one `when` at a time. When
the last `when` is extracted, the switch is replaced by the dispatcher.

Order of extraction: maxp → hhea → hmtx → loca → glyf → cmap → post →
name → head → OS/2. Each is independently verifiable.

## Spec coverage

| File | Examples |
|------|----------|
| `spec/fontisan/subset/table_strategy_spec.rb` | (1) registry has entries for every profile'd table, (2) `for("unknown")` returns PassThrough, (3) `for("maxp")` returns Maxp, (4) every strategy declares OWNED_TAGS as a frozen Array of Strings |
| `spec/fontisan/subset/table_strategy/maxp_spec.rb` | subset_maxp returns `{ "maxp" => bytes }`, numGlyphs updated (3+ examples) |
| `spec/fontisan/subset/table_strategy/pass_through_spec.rb` | returns `{ tag => font.table_data[tag] }` (2 examples) |
| existing `spec/fontisan/subset/table_subsetter_spec.rb` | ALL existing cases pass unchanged (regression gate) |

~15 new examples + all existing specs unchanged.

## Risk

- **Existing specs break**: each extraction must preserve exact bytes.
  Run `table_subsetter_spec.rb` after EVERY extraction, not just at the
  end. If any spec fails, the strategy isn't byte-identical — fix
  before moving to the next.
- **`OWNED_TAGS` constant missing on a strategy**: dispatcher will
  crash with `NameError`. Mitigate by adding a spec that asserts every
  REGISTRY entry declares `OWNED_TAGS`.

## References

- `lib/fontisan/subset/table_subsetter.rb:71-97` — the `case tag` switch
- `lib/fontisan/subset/profile.rb` — the profile that defines which tags are subsetted
- `spec/fontisan/subset/table_subsetter_spec.rb` — existing regression suite

## Acceptance

- `TableSubsetter#subset_table` is a 1-liner: `TableStrategy.for(tag).call(...)`
- All existing `table_subsetter_spec.rb` cases pass unchanged
- New `table_strategy_spec.rb` asserts the registry has entries for every profile'd table
- Every strategy class declares `OWNED_TAGS` as a frozen Array
- Rubocop clean
