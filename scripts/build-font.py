#!/usr/bin/env python3
"""Builds the "Nether Pixel" webfont from scripts/lib/glyphs.json.

The font is original work: every glyph is a 5x7 pixel bitmap drawn as square
outlines. The generated files are committed, so this script only needs to run
when the glyph data changes:

    pip install fonttools brotli
    python3 scripts/build-font.py
"""
import json
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = Path(__file__).resolve().parent.parent
GLYPHS = json.loads((ROOT / "scripts/lib/glyphs.json").read_text(encoding="utf-8"))
OUT_DIR = ROOT / "public/fonts"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PIXEL = 100  # font units per bitmap pixel
ROWS = 7
ADVANCE = 6 * PIXEL  # 5 pixel columns + 1 pixel of spacing
UPM = 800
ASCENT = 800
DESCENT = -200


def draw(rows):
    pen = TTGlyphPen(None)
    for r, row in enumerate(rows):
        y0 = (ROWS - 1 - r) * PIXEL
        y1 = y0 + PIXEL
        x = 0
        while x < len(row):
            if row[x] != "#":
                x += 1
                continue
            start = x
            while x < len(row) and row[x] == "#":
                x += 1
            x0, x1 = start * PIXEL, x * PIXEL
            # Clockwise contour = filled area in TrueType.
            pen.moveTo((x0, y0))
            pen.lineTo((x0, y1))
            pen.lineTo((x1, y1))
            pen.lineTo((x1, y0))
            pen.closePath()
    return pen.glyph()


def glyph_name(ch):
    return "uni%04X" % ord(ch)


chars = list(GLYPHS.keys())
glyph_order = [".notdef"] + [glyph_name(c) for c in chars]
cmap = {ord(c): glyph_name(c) for c in chars}
# Lowercase letters reuse the capital shapes, as is usual for pixel fonts.
for c in chars:
    if c.isalpha() and c.isascii():
        cmap[ord(c.lower())] = glyph_name(c)
# Typographic apostrophes map to the straight one.
cmap[0x2019] = glyph_name("'")
cmap[0x2018] = glyph_name("'")
cmap[0x00A0] = glyph_name(" ")

notdef_rows = ["#####", "#...#", "#...#", "#...#", "#...#", "#...#", "#####"]
glyphs = {".notdef": draw(notdef_rows)}
for c in chars:
    glyphs[glyph_name(c)] = draw(GLYPHS[c])

fb = FontBuilder(UPM, isTTF=True)
fb.setupGlyphOrder(glyph_order)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics({name: (ADVANCE, 0) for name in glyph_order})
fb.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT)
fb.setupNameTable(
    {
        "familyName": "Nether Pixel",
        "styleName": "Regular",
        "uniqueFontIdentifier": "NetherPixel-Regular-1.0",
        "fullName": "Nether Pixel Regular",
        "psName": "NetherPixel-Regular",
        "version": "Version 1.0",
        "copyright": "Original pixel font created for this portfolio.",
    }
)
fb.setupOS2(
    sTypoAscender=ASCENT,
    sTypoDescender=DESCENT,
    sTypoLineGap=0,
    usWinAscent=ASCENT,
    usWinDescent=-DESCENT,
    sxHeight=700,
    sCapHeight=700,
)
fb.setupPost()

ttf_path = OUT_DIR / "nether-pixel.ttf"
fb.save(str(ttf_path))

try:
    from fontTools.ttLib import TTFont

    font = TTFont(str(ttf_path))
    font.flavor = "woff2"
    font.save(str(OUT_DIR / "nether-pixel.woff2"))
    ttf_path.unlink()
    print("Wrote public/fonts/nether-pixel.woff2")
except Exception as exc:  # brotli missing: fall back to WOFF (zlib)
    from fontTools.ttLib import TTFont

    print("WOFF2 unavailable (%s); writing WOFF instead." % exc)
    font = TTFont(str(ttf_path))
    font.flavor = "woff"
    font.save(str(OUT_DIR / "nether-pixel.woff"))
    ttf_path.unlink()
    print("Wrote public/fonts/nether-pixel.woff")
