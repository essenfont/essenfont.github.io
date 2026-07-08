# 06 — Profile enablement

Add CBDT and CBLC to the `web` subsetting profile. This is the **go
live** switch — only enable after task 05 (integration spec) passes.

## Dependencies

- Task 05 (WOFF2 round-trip integration spec) — must pass before the
  profile is changed. If the profile is enabled before the ColorBitmap
  strategy works, every web subset with emoji produces an invalid font.

## Why this is last

The original v1 plan put this FIRST (task 01). That was wrong: enabling
CBDT/CBLC in the profile makes `Subset::Builder` try to preserve them,
but without the ColorBitmap strategy (task 04), the subsetter passes
through the FULL source CBDT — invalid for a subset. Anyone using the
`web` profile between the old task 01 and the old task 04 lands an
invalid font.

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

## Spec coverage

| File | Examples |
|------|----------|
| `spec/fontisan/subset/profile_spec.rb` | (1) `Profile.for_name("web")` includes "CBDT" and "CBLC", (2) `Profile.for_name("pdf")` does NOT include them, (3) other profiles unchanged (3 examples) |

## Risk

- **Existing subsets that include CBDT fonts change behavior**: fonts
  that previously dropped CBDT/CBLC now preserve them. This is the
  desired behavior, but any downstream consumer that assumed CBDT was
  absent might need updating. Low risk for the essenfont project (the
  website is the only consumer and WANTS color emoji).

- **Subset size increase**: CBDT/CBLC tables add weight. NotoColorEmoji
  CBDT is ~10MB for the full font. The subsetter reduces this to only
  the kept emojis, but the subset font is still larger than a CBDT-less
  outline-only subset. This is acceptable — the color data IS the point.

## References

- `lib/fontisan/subset/profile.rb` — the profile definitions
- Task 05's integration spec — the gate for this change

## Acceptance

- `Profile.for_name("web")` includes `"CBDT"` and `"CBLC"`
- `Profile.for_name("pdf")` does NOT include them (no change)
- All existing profile specs pass
- Task 05 integration spec passes (precondition)
