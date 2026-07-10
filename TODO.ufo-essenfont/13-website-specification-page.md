# 13 — /engineering/specification page

## Location

`essenfont.github.io/src/astro/pages/engineering/specification.astro`

## Content sections

### 1. Introduction
What this page is: the internal structure of Essenfont-Regular.ttc.

### 2. TTC anatomy
`<TTCAnatomy />` — SVG cross-section. Short paragraph explaining
TTC = container, each face = independent font with its own tables.

### 3. Face table
Auto-generated table from `face-table.json`. One row per face:
plane, range, glyph count, UPM, primary donors, ascent, descent.

### 4. UPM strategy
- Target: 1000 (PostScript convention)
- Why 1000 (134/148 donors native)
- Scale factor table (`<UPMNormalization />` SVG)
- Per-donor uniform scaling principle

### 5. Vertical metrics
- Per-face recompute from actual glyph extents
- Before/after comparison (frozen Latin vs actual)
- Why per-face (Noto Sans model)

### 6. Donor attribution
`<DonorAttribution />` — SVG bubble matrix.
Short paragraph per major donor family.

### 7. Partitioning
- By Unicode plane (MECE, stable, O(1) via `cp >> 16`)
- 65,535 glyph cap
- No block torn across faces

### 8. Build pipeline
`<BuildPipeline />` — SVG flow diagram.
7 stages with the new UFO normalization + MetricsPass highlighted.

## Nav

Add "Specification" to the engineering sub-nav on `/engineering`:

```
Engineering
├── Build pipeline
├── Where the glyphs come from
├── Output formats & distribution
├── Font specification     ← NEW
└── Coverage, gaps & roadmap
```

## Acceptance criteria

- [ ] Page renders at `/engineering/specification`
- [ ] All SVGs are data-driven (no hardcoded values)
- [ ] Nav link added on `/engineering` hub
- [ ] Mobile-responsive
- [ ] `<title>` + meta description set
