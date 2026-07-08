# 07 — WOFF2 round-trip integration spec

End-to-end spec verifying that CBDT/CBLC tables survive the full
subset → WOFF2 encode → WOFF2 decode round trip intact.

## Spec

`spec/fontisan/subset/cbdt_round_trip_spec.rb`

## Setup

- Source: NotoColorEmoji.ttf (committed as fixture or generated on the fly)
- Subset to U+1F600 + U+1F601 (😀 + 😁) only
- Encode as WOFF2 via `Converters::Woff2Encoder`
- Decode via `fontTools.ttLib.TTFont(woff2_path)` (Python, optional)
- Verify CBDT/CBLC present in both subset TTF and WOFF2
- Verify both emojis render color when loaded in Chrome (puppeteer)

## Acceptance

- Subset TTF has CBDT + CBLC tables with the 2 emojis' bitmaps
- Subset TTF loads in Chrome (no "network error")
- (Optional) WOFF2 also loads in Chrome
- (Optional) Glyph count in subset = 2 + .notdef
