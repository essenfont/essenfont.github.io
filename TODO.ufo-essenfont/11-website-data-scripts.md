# 11 — Website data generator scripts

## Location

`essenfont.github.io/scripts/`

## Scripts

### `scripts/gen-face-table.mjs`

Reads `Essenfont-Regular.ttc` from the sibling build repo (or from
the GH release download), extracts per-face metadata, writes
`public/face-table.json`.

```json
{
  "generatedAt": "2026-07-10T...",
  "source": "Essenfont-Regular.ttc",
  "sourceSha256": "...",
  "targetUpm": 1000,
  "faces": [
    {
      "index": 0,
      "plane": "BMP",
      "planeIndex": 0,
      "range": "U+0000–U+FFFF",
      "glyphCount": 42721,
      "upm": 1000,
      "head": { "xMin": 0, "yMin": -203, "xMax": 1020, "yMax": 820 },
      "hhea": { "ascent": 800, "descent": -200, "lineGap": 0 },
      "os2": {
        "sTypoAscender": 800,
        "sTypoDescender": -200,
        "sTypoLineGap": 0,
        "usWinAscent": 1000,
        "usWinDescent": 200
      }
    },
    ...
  ]
}
```

Implementation: uses `fonttools` via Python subprocess (fontTools
is the most reliable TTC parser; shelling out from Node is simpler
than a pure-JS TTC parser).

### `scripts/gen-donor-attribution.mjs`

Reads `public/cp_map.json` (downloaded from GH release), groups
codepoints by donor × plane, writes `public/donor-attribution.json`.

```json
{
  "generatedAt": "2026-07-10T...",
  "source": "cp_map.json",
  "donors": [
    {
      "label": "noto-sans",
      "family": "Noto Sans",
      "category": "noto-sans",
      "totalCodepoints": 6500,
      "byPlane": { "0": 6500, "1": 0, "2": 0, "3": 0, "14": 0 }
    },
    {
      "label": "fsung-m",
      "family": "Full-Sung",
      "category": "fsung",
      "totalCodepoints": 35128,
      "byPlane": { "0": 35128, "1": 0, "2": 0, "3": 0, "14": 0 }
    },
    ...
  ]
}
```

Donor categories (for color coding):
- `fsung` — FSung family (warm rose)
- `noto-sans` — Noto Sans family (steel blue)
- `noto-serif` — Noto Serif family (deep indigo)
- `academic` — uni-hieroglyphica, NewGardiner (gold)
- `synthetic` — code-chart SVG donors (forest green)
- `other` — everything else (gray)

### `scripts/gen-upm-scales.mjs`

Reads each donor's `head.unitsPerEm` from `references/input-fonts/`
(or a cached `donor-upms.json` from the build repo), writes
`public/upm-scales.json`.

```json
{
  "targetUpm": 1000,
  "donors": [
    { "label": "noto-sans", "nativeUpm": 1000, "scaleFactor": 1.0, "scaled": false },
    { "label": "fsung-m", "nativeUpm": 1024, "scaleFactor": 0.9766, "scaled": true },
    { "label": "uni-hieroglyphica", "nativeUpm": 1000, "scaleFactor": 1.0, "scaled": false },
    { "label": "lentariso", "nativeUpm": 2400, "scaleFactor": 0.4167, "scaled": true },
    ...
  ]
}
```

## Build integration

`package.json` `build` script:

```json
{
  "scripts": {
    "build": "node scripts/gen-site-stats.mjs && node scripts/gen-face-table.mjs && node scripts/gen-donor-attribution.mjs && node scripts/gen-upm-scales.mjs && astro build"
  }
}
```

## Acceptance criteria

- [ ] `public/face-table.json` has 5+ faces with correct metadata
- [ ] `public/donor-attribution.json` has all donors with correct counts
- [ ] `public/upm-scales.json` has all donors with correct scale factors
- [ ] All three regenerate on every `npm run build`
