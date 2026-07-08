# 06 — Refactor TableSubsetter to strategy registry

`TableSubsetter#subset_table` is a `case tag` switch. Every new table
requires editing the dispatcher — OCP violation. Refactor to a
strategy registry so adding CBDT/CBLC (or any future table) only adds
a new class + one REGISTRY entry.

## Before (subset of lib/fontisan/subset/table_subsetter.rb)

```ruby
def subset_table(tag, table)
  case tag
  when "maxp"  then subset_maxp(table)
  when "hhea"  then subset_hhea(table)
  when "glyf"  then subset_glyf(table)
  ...
  else
    font.table_data[tag]
  end
end
```

## After

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
      autoload :OS2,         "fontisan/subset/table_strategy/os2"
      autoload :CBDT,        "fontisan/subset/table_strategy/cbdt"
      autoload :CBLC,        "fontisan/subset/table_strategy/cblc"
      autoload :PassThrough, "fontisan/subset/table_strategy/pass_through"

      REGISTRY = {
        "maxp" => Maxp,
        "hhea" => Hhea,
        # ...
        "CBDT" => CBDT,
        "CBLC" => CBLC,
      }.freeze

      def self.for(tag)
        REGISTRY[tag] || PassThrough
      end
    end
  end
end
```

Each strategy class has a uniform interface:

```ruby
class Maxp
  # @param font [SfntFont]
  # @param mapping [GlyphMapping]
  # @param options [Options]
  # @return [String] binary bytes for the subset table
  def self.call(font:, mapping:, options:)
    ...
  end
end
```

## Migration

Mechanical: extract each `subset_<tag>` method body into a strategy
class. Run existing specs after each extraction to catch regressions.

## Acceptance

- `TableSubsetter#subset_table` becomes a 1-liner: `TableStrategy.for(tag).call(...)`
- All existing `table_subsetter_spec.rb` cases pass unchanged
- New `table_strategy_spec.rb` asserts the registry has entries for every
  profile'd table
