# 19 — WOFF2 subsets deploy

`public/fonts/*.woff2` (and `.woff`) are committed binaries. They must end up in `dist/fonts/` after the Astro build.

## Astro behavior

Astro copies `public/` to `dist/` verbatim during build. No extra step needed.

## Verification

```sh
diff <(ls public/fonts | sort) <(ls dist/fonts | sort)
# should be empty
```

## Acceptance

- `dist/fonts/` contains every `public/fonts/*.{woff,woff2}` file
- `fonts.css` is also copied to `dist/fonts.css`
- Subsetting rebuild script (`scripts/subset-fonts.rb`) still writes to `public/fonts/`
