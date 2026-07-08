# 01 — Profile: add CBDT/CBLC to web profile

`Fontisan::Subset::Profile` declares which tables each subsetting
profile preserves. The `web` profile (used by the website) currently
omits CBDT/CBLC.

## Change

```ruby
# lib/fontisan/subset/profile.rb
module Fontisan
  module Subset
    class Profile
      WEB = %w[
        head hhea maxp OS/2 name hmtx cmap post
        glyf loca
        CBDT CBLC   # ← new: preserve color emoji bitmaps
      ].freeze
    end
  end
end
```

## Acceptance

- `Profile.for_name("web")` includes `"CBDT"` and `"CBLC"`
- Specs cover the new entries
- No change to `Profile.for_name("pdf")` or other profiles
