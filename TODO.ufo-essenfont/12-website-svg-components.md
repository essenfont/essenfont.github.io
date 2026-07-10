# 12 — Data-driven SVG diagram components

## Location

`essenfont.github.io/src/astro/components/diagrams/`

## Components

### `TTCAnatomy.astro`

Reads `public/face-table.json`. Renders the TTC as a labeled
cross-section: outer container rect, inner face rects, table chips
(head, hhea, OS/2, glyf, cmap) per face.

- Face count is dynamic (renders `faces.length` faces)
- UPM, glyph count, ascent/descent from JSON — zero hardcoded values
- Color: tables have semantic colors (head=blue, hhea=green, OS/2=amber,
  glyf=rose, cmap=purple) defined in a shared `diagram-colors.css`
- Responsive: stacks vertically on mobile

### `DonorAttribution.astro`

Reads `public/donor-attribution.json`. Renders a bubble-chart matrix:
rows = donors, columns = planes (BMP/SMP/SIP/TIP/SSP), cell circle
radius = `sqrt(codepointCount) * SCALE`.

- Top N donors shown (N = 20, rest grouped as "other")
- Circle color = donor category color
- Tooltips (`<title>`) with exact counts + donor label
- Legend showing category colors

### `BuildPipeline.astro`

Reads a `pipeline-stages.json` data file (structural, committed to
`public/pipeline-stages.json`). Renders horizontal flow: manifest →
load → normalize → CpMap → partition → stitch → metrics → TTC.

- Stage count from JSON
- New stages (UFO normalize, MetricsPass) highlighted in accent
- Each stage is a box with: stage number, name, module, input → output
- Arrows between stages

### `UPMNormalization.astro`

Reads `public/upm-scales.json`. Renders a horizontal bar chart:
- One bar per donor (grouped by UPM: 1000, 1024, 2048, 2400)
- Bar shows native UPM (gray) vs scaled-to-1000 (accent)
- Scale factor annotation
- Donors at native 1000 shown with "no scale" badge

## Shared design

### Colors (`src/astro/components/diagrams/_colors.css`)

```css
:root {
  --diagram-table-head: #2a5c8a;
  --diagram-table-hhea: #3d8b5e;
  --diagram-table-os2: #c19a3e;
  --diagram-table-glyf: #b04040;
  --diagram-table-cmap: #7d4ea6;

  --diagram-donor-fsung: #b04040;
  --diagram-donor-noto-sans: #2a5c8a;
  --diagram-donor-noto-serif: #3d4e8a;
  --diagram-donor-academic: #c19a3e;
  --diagram-donor-synthetic: #3d8b5e;
  --diagram-donor-other: #888888;

  --diagram-stage-existing: var(--ef-text-2);
  --diagram-stage-new: var(--ef-accent);
}
```

### SVG conventions

- `viewBox` set explicitly; no width/height (CSS scales)
- `font-family: var(--spec-font-mono)` for labels
- `<title>` elements for accessibility/tooltips on every interactive shape
- `role="img"` + `<desc>` on each SVG

## Acceptance criteria

- [ ] All 4 components render from JSON data (zero hardcoded values)
- [ ] Components are responsive (mobile-friendly)
- [ ] SVGs have `<title>` + `<desc>` for accessibility
- [ ] Colors come from shared CSS variables
