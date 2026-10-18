"""
Draws the pixel-art portrait of Kaustubh used in the Profile section and the blog.

It is an original drawing made pixel by pixel from a few shapes below, not a photo filter and not a
game skin. Run `python3 scripts/build-avatar.py` to regenerate public/img/avatar.png (and the small
public/img/avatar-64.png). Needs Pillow.
"""
import math
import os
import random

from PIL import Image

W = H = 32
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'public', 'img')

PAL = {
    'hair': '#17110f',
    'hair2': '#241915',
    'hair3': '#33251d',
    'skin': '#c98d62',
    'skin_hi': '#dba578',
    'skin_lo': '#a96f4a',
    'skin_dk': '#8a5538',
    'stubble': '#6b4631',
    'brow': '#1d1411',
    'frame': '#0c0c10',
    'lens': '#b9c8cf',
    'lens_hi': '#e3eef2',
    'eye': '#150f0d',
    'mouth': '#7d3f33',
    'blazer': '#1d2744',
    'blazer_lo': '#141c33',
    'blazer_hi': '#2a3760',
    'shirt': '#eceae4',
    'shirt_lo': '#c9c6bd',
}

img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
px = img.load()


def rgb(name):
    h = PAL[name].lstrip('#')
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def put(x, y, name):
    if 0 <= x < W and 0 <= y < H:
        px[x, y] = rgb(name)


def rect(x0, y0, x1, y1, name):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(x, y, name)


def ellipse(cx, cy, rx, ry, name, only=None):
    for y in range(H):
        for x in range(W):
            if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                if only is None or only(x, y):
                    put(x, y, name)


random.seed(7)

FACE = (16, 15.5, 9.2, 9.6)  # cx, cy, rx, ry


def in_face(x, y, grow=0.0):
    cx, cy, rx, ry = FACE
    return ((x + 0.5 - cx) / (rx + grow)) ** 2 + ((y + 0.5 - cy) / (ry + grow)) ** 2


# ---- shoulders and blazer (drawn first so the neck and chin sit on top)
ellipse(16, 37, 16.5, 10.5, 'blazer')
rect(1, 31, 30, 31, 'blazer')
for y in range(27, 32):
    for x in range(0, 32):
        if px[x, y][3] and (x < 8 or x > 24):
            put(x, y, 'blazer_lo')
# shirt collar V and lapels
for i in range(5):
    rect(14 - i // 2, 27 + i, 18 + i // 2, 27 + i, 'shirt')
for i in range(5):
    put(12 - i // 2, 27 + i, 'blazer_hi')
    put(20 + i // 2, 27 + i, 'blazer_hi')
rect(15, 30, 17, 31, 'shirt_lo')

# ---- neck
rect(13, 24, 19, 28, 'skin_lo')
rect(13, 25, 19, 25, 'skin_dk')

# ---- ears
rect(6, 14, 7, 18, 'skin')
rect(25, 14, 26, 18, 'skin')
put(6, 16, 'skin_lo')
put(26, 16, 'skin_lo')

# ---- face
ellipse(*FACE, 'skin')
ellipse(*FACE, 'skin_lo', only=lambda x, y: x >= 23 or y >= 24)
ellipse(*FACE, 'skin_hi', only=lambda x, y: x <= 11 and 12 <= y <= 17 and (x + y) % 2 == 0)
for (x, y) in [(10, 18), (11, 18), (21, 18), (22, 18)]:
    put(x, y, 'skin_hi')

# ---- hair: a big curly mass with bumpy edges, a few locks falling over the forehead
ellipse(16, 8.5, 12.2, 8.2, 'hair')
for (x, y) in [(5, 11), (4, 8), (6, 4), (9, 2), (13, 1), (17, 1), (21, 2), (25, 4), (27, 8), (26, 11), (8, 3), (24, 3), (11, 1), (20, 1), (3, 10), (28, 10)]:
    ellipse(x, y, 2.2, 2.0, 'hair')
for x in range(7, 26):
    depth = 9 + ((x * 7) % 3 == 0)
    for y in range(5, depth + 1):
        put(x, y, 'hair')
# the fringe sits just above the brows; one curl falls over the middle of the forehead
for x in range(8, 25):
    put(x, 10, 'hair')
put(16, 11, 'hair')
put(15, 11, 'hair2')
rect(7, 11, 8, 13, 'hair')   # sideburns
rect(24, 11, 25, 13, 'hair')
for _ in range(34):
    x = random.randint(4, 27)
    y = random.randint(1, 9)
    if px[x, y][:3] == rgb('hair')[:3]:
        put(x, y, random.choice(['hair2', 'hair2', 'hair3']))
for (x, y) in [(5, 2), (27, 2), (3, 7), (29, 7), (2, 11), (30, 11), (10, 0), (16, 0), (22, 0)]:
    px[x, y] = (0, 0, 0, 0)

# ---- eyebrows, just above the frames
rect(10, 11, 14, 11, 'brow')
rect(18, 11, 22, 11, 'brow')

# ---- glasses: thick black rectangular frames, lenses clear so the eyes show
for (x0, x1) in [(9, 14), (18, 23)]:
    rect(x0, 13, x1, 13, 'frame')
    rect(x0, 17, x1, 17, 'frame')
    rect(x0, 13, x0, 17, 'frame')
    rect(x1, 13, x1, 17, 'frame')
    rect(x0 + 1, 14, x1 - 1, 16, 'skin')
rect(15, 14, 17, 14, 'frame')  # bridge
rect(7, 14, 8, 14, 'frame')    # arms
rect(24, 14, 25, 14, 'frame')
# eyes: dark iris with a tiny catch-light
rect(11, 15, 12, 16, 'eye')
rect(20, 15, 21, 16, 'eye')
put(11, 15, 'lens_hi')
put(20, 15, 'lens_hi')
# a glint on each lens
put(10, 14, 'lens_hi')
put(19, 14, 'lens_hi')

# ---- nose
put(16, 17, 'skin_lo')
put(16, 18, 'skin_lo')
put(15, 19, 'skin_lo')
put(16, 19, 'skin_dk')
put(17, 19, 'skin_lo')

# ---- stubble across the jaw and chin
for y in range(20, 26):
    for x in range(8, 25):
        d = in_face(x, y)
        if d > 1:
            continue
        if (y >= 23 or d > 0.6) and (x * 3 + y * 5) % 3 != 0:
            put(x, y, 'stubble')
# moustache: a dark band with a small gap under the nose
rect(12, 20, 20, 20, 'hair2')
put(16, 20, 'skin_lo')
rect(12, 21, 14, 21, 'stubble')
rect(18, 21, 20, 21, 'stubble')
# mouth
rect(14, 22, 18, 22, 'mouth')
put(13, 21, 'skin_lo')
put(19, 21, 'skin_lo')

os.makedirs(OUT, exist_ok=True)
big = img.resize((256, 256), Image.NEAREST)
big.save(os.path.join(OUT, 'avatar.png'), optimize=True)
img.resize((64, 64), Image.NEAREST).save(os.path.join(OUT, 'avatar-64.png'), optimize=True)
print('wrote avatar.png and avatar-64.png')
