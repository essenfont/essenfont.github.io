#!/usr/bin/env python3
"""Count codepoints in each per-block WOFF2 subset."""
import json, os, sys
from pathlib import Path
from fontTools.ttLib import TTFont

FONTS_DIR = Path(__file__).resolve().parent.parent / "public" / "fonts"
BLOCKS_DIR = Path(__file__).resolve().parent.parent / "public" / "unicode" / "blocks"

results = {}
for woff2 in sorted(FONTS_DIR.glob("*.woff2")):
    name = woff2.stem
    if name.startswith("Essenfont-"):
        continue
    try:
        font = TTFont(woff2, fontNumber=0)
        cmap = font.getBestCmap()
        cps = set(cmap.keys())
        results[name] = sorted(cps)
        font.close()
    except Exception as e:
        print(f"  ERROR {name}: {e}", file=sys.stderr)
        results[name] = []

json.dump(results, sys.stdout)
