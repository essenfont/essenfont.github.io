# 03 — Styles + design tokens

Carry over the existing paper-and-ink palette and per-mode (light/dark) tokens. No redesign in this step — purely mechanical port.

## Source

`src/styles/main.css` — copy wholesale to `src/astro/styles/main.css`.

## Tokens to preserve

| Token | Value (light) | Value (dark) |
|-------|---------------|--------------|
| `--ef-rose` | `#bf4e6a` | `#bf4e6a` |
| `--ef-dark` | `#1c1a18` | `#ecdfd0` |
| `--spec-paper` | `#f1ece1` | `#161513` |
| `--spec-ink` | `#1c1a18` | `#ecdfd0` |

Type stack stays:
- Display: Spectral
- Body: Inter
- Code: IBM Plex Mono

## Astro global stylesheet

```astro
---
// src/astro/layouts/BaseLayout.astro
import '../styles/main.css';
---
```

## Frontend-design polish pass

Apply /frontend-design after migration completes (step 22). Goal: a distinctive
editorial aesthetic that doesn't read as generic AI slop. Refer to skill
guidelines.

## Acceptance

- Light + dark themes toggle correctly via `html.dark` class
- Type stack renders as before (Spectral/Inter/IBM Plex Mono)
- `--vp-c-*` legacy variables still defined for any not-yet-ported components
