/**
 * Procedural 16x16 block textures. Every tile is painted from noise at start-up, so the world
 * carries no image downloads and no third-party art. Tiles are stacked into one texture array
 * (one layer each), which lets the GPU build clean mipmaps with no bleeding between tiles.
 */
export const TILE = 16;

const NAMES = [
  'GRASS_TOP', 'GRASS_SIDE', 'DIRT', 'STONE', 'COBBLE', 'STONE_BRICK', 'LOG_SIDE', 'LOG_TOP', 'LEAVES',
  'PLANKS', 'SPRUCE_PLANKS', 'SPRUCE_LOG', 'SPRUCE_LEAVES', 'SAND', 'GRAVEL', 'WATER', 'GLASS', 'ROOF',
  'PATH_TOP', 'FARMLAND', 'CROP', 'HAY_SIDE', 'HAY_TOP', 'DOOR', 'LAMP', 'WOOL_RED', 'WOOL_WHITE', 'WOOL_BLUE',
  'NETHERRACK', 'NETHER_BRICK', 'NETHER_FENCE', 'LAVA', 'OBSIDIAN', 'GLOWSTONE', 'BASALT_TOP', 'BASALT_SIDE',
  'BLACKSTONE', 'SOUL_SAND', 'CRIMSON_STEM', 'CRIMSON_TOP', 'WARPED_STEM', 'WARPED_TOP', 'WART', 'WARPED_WART',
  'SHROOMLIGHT', 'SNOW_TOP', 'SNOW_SIDE', 'GOLD_GRASS_TOP', 'GOLD_GRASS_SIDE', 'CLOUD', 'FIRE', 'BARREL',
  'DOOR_LOW', 'DOOR_UP', 'IRON', 'FURNACE_FRONT', 'FURNACE_TOP', 'BOOKSHELF', 'CRAFTING_TOP', 'CRAFTING_SIDE',
  'NWART', 'SPAWNER', 'TORCH', 'LANTERN', 'MOSSY_COBBLE', 'FLOWER_RED', 'FLOWER_YELLOW', 'TALL_GRASS',
];
export const T = Object.fromEntries(NAMES.map((n, i) => [n, i]));
export const TILE_COUNT = NAMES.length;

// ---- tiny helpers ------------------------------------------------------------------------

function hash(x, y, s) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s + 1, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Value noise that tiles every 16 pixels. `period` must divide 16. */
function noise(x, y, s, period) {
  const n = TILE / period;
  const fx = x / period;
  const fy = y / period;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const h = (a, b) => hash(((a % n) + n) % n, ((b % n) + n) % n, s);
  const a = h(x0, y0);
  const b = h(x0 + 1, y0);
  const c = h(x0, y0 + 1);
  const d = h(x0 + 1, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

const mul = (c, f) => [c[0] * f, c[1] * f, c[2] * f, c[3] ?? 255];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 255];
const jit = (c, x, y, s, amt) => mul(c, 1 + (hash(x, y, s) - 0.5) * amt);

/** Tileable cellular pattern: returns { id, edge } for the nearest of 4x4 jittered points. */
function cells(x, y, s, size) {
  const n = TILE / size;
  let d1 = 1e9;
  let d2 = 1e9;
  let id = 0;
  const cx = Math.floor(x / size);
  const cy = Math.floor(y / size);
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const gx = cx + i;
      const gy = cy + j;
      const wx = ((gx % n) + n) % n;
      const wy = ((gy % n) + n) % n;
      const px = (gx + hash(wx, wy, s)) * size;
      const py = (gy + hash(wx, wy, s + 9)) * size;
      const d = Math.hypot(x + 0.5 - px, y + 0.5 - py);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = hash(wx, wy, s + 33);
      } else if (d < d2) d2 = d;
    }
  }
  return { id, edge: d2 - d1 };
}

function paint(fn) {
  const data = new Uint8ClampedArray(TILE * TILE * 4);
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let sn = 0;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const c = fn(x, y);
      const i = (y * TILE + x) * 4;
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = c[3] ?? 255;
      if ((c[3] ?? 255) > 128) {
        sr += c[0];
        sg += c[1];
        sb += c[2];
        sn += 1;
      }
    }
  }
  // Transparent pixels borrow the tile's average colour so mipmaps do not grow dark halos.
  if (sn) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) {
        data[i] = sr / sn;
        data[i + 1] = sg / sn;
        data[i + 2] = sb / sn;
      }
    }
  }
  return data;
}

const dirtAt = (x, y, s) => {
  const v = hash(x, y, s);
  const base = [121, 86, 58];
  return v > 0.93 ? mul(base, 0.66) : v < 0.08 ? mul(base, 1.22) : jit(base, x, y, s + 2, 0.3);
};

// ---- the tiles ---------------------------------------------------------------------------

const PAINT = {
  GRASS_TOP: (x, y) => {
    const c = jit([96, 158, 52], x, y, 1, 0.34);
    return hash(x, y, 5) > 0.9 ? [132, 190, 72, 255] : c;
  },
  GRASS_SIDE: (x, y) => {
    const edge = 3 + Math.floor(hash(x, 0, 7) * 3);
    return y < edge ? jit([96, 158, 52], x, y, 1, 0.34) : dirtAt(x, y, 3);
  },
  DIRT: (x, y) => dirtAt(x, y, 3),
  STONE: (x, y) => {
    const n = noise(x, y, 4, 4);
    return mul(jit([128, 128, 132], x, y, 6, 0.2), 0.88 + n * 0.24);
  },
  COBBLE: (x, y) => {
    const { id, edge } = cells(x, y, 11, 4);
    const c = mul([122, 122, 126], 0.74 + id * 0.5);
    return edge < 0.85 ? mul(c, 0.55) : c;
  },
  STONE_BRICK: (x, y) => {
    const row = Math.floor(y / 4);
    const ox = row % 2 ? 4 : 0;
    const mortar = y % 4 === 3 || (x + ox) % 8 === 7;
    if (mortar) return [84, 84, 90, 255];
    return mul(jit([134, 134, 138], x, y, 8, 0.12), 0.9 + hash(Math.floor((x + ox) / 8), row, 12) * 0.2);
  },
  LOG_SIDE: (x, y) => mul([104, 78, 46], 0.72 + hash(x, 0, 14) * 0.5 + (hash(x, y, 15) - 0.5) * 0.12),
  LOG_TOP: (x, y) => {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    if (d > 6.6) return mul([88, 64, 36], 0.85 + hash(x, y, 16) * 0.2);
    return mul([176, 140, 86], Math.floor(d) % 2 ? 0.86 : 1.04);
  },
  LEAVES: (x, y) => {
    const c = mul([62, 128, 40], 0.62 + hash(x, y, 17) * 0.7);
    return hash(x, y, 18) < 0.17 ? [c[0], c[1], c[2], 0] : c;
  },
  PLANKS: (x, y) => {
    const row = Math.floor(y / 4);
    const joint = Math.floor(hash(row, 0, 19) * 16);
    const base = mul([164, 126, 76], 0.9 + hash(row, 1, 20) * 0.2);
    if (y % 4 === 0) return mul(base, 0.72);
    if (x === joint) return mul(base, 0.78);
    return jit(base, x, y, 21, 0.1);
  },
  SPRUCE_PLANKS: (x, y) => {
    const row = Math.floor(y / 4);
    const joint = Math.floor(hash(row, 0, 22) * 16);
    const base = mul([108, 80, 48], 0.9 + hash(row, 1, 23) * 0.2);
    if (y % 4 === 0) return mul(base, 0.7);
    if (x === joint) return mul(base, 0.76);
    return jit(base, x, y, 24, 0.1);
  },
  SPRUCE_LOG: (x, y) => mul([60, 42, 24], 0.7 + hash(x, 0, 25) * 0.55 + (hash(x, y, 26) - 0.5) * 0.1),
  SPRUCE_LEAVES: (x, y) => {
    const c = mul([38, 86, 52], 0.6 + hash(x, y, 27) * 0.75);
    return hash(x, y, 28) < 0.15 ? [c[0], c[1], c[2], 0] : c;
  },
  SAND: (x, y) => jit([220, 208, 160], x, y, 29, 0.12),
  GRAVEL: (x, y) => {
    const { id } = cells(x, y, 30, 3);
    return mul([128, 124, 122], 0.66 + id * 0.6);
  },
  WATER: (x, y) => {
    const n = noise(x, y, 31, 8) * 0.55 + noise(x, y, 32, 4) * 0.45;
    const c = mix([34, 82, 196], [120, 180, 240], Math.pow(n, 2.2));
    return [c[0], c[1], c[2], 200];
  },
  GLASS: (x, y) => {
    const border = x === 0 || x === 15 || y === 0 || y === 15;
    if (border) return [214, 236, 244, 230];
    if ((x + y === 6 || x + y === 7) && x > 1 && x < 7) return [255, 255, 255, 170];
    return [190, 225, 240, 36];
  },
  ROOF: (x, y) => {
    const row = Math.floor(y / 4);
    const ox = row % 2 ? 4 : 0;
    const col = Math.floor((x + ox) / 8);
    const base = mul([158, 44, 36], 0.86 + hash(col, row, 33) * 0.28);
    if (y % 4 === 3) return mul(base, 0.6);
    if ((x + ox) % 8 === 7) return mul(base, 0.76);
    return jit(base, x, y, 34, 0.1);
  },
  PATH_TOP: (x, y) => {
    const c = jit([164, 130, 82], x, y, 35, 0.2);
    return hash(x, y, 36) > 0.92 ? mul(c, 0.7) : c;
  },
  FARMLAND: (x, y) => mul(jit([84, 54, 34], x, y, 37, 0.2), y % 4 < 2 ? 0.8 : 1.08),
  CROP: (x, y) => {
    const stalk = [2, 5, 8, 11, 14].includes(x);
    const stalk2 = [3, 6, 9, 12, 15].includes(x) && hash(x, 0, 38) > 0.3;
    if (!stalk && !stalk2) return [0, 0, 0, 0];
    const top = 2 + Math.floor(hash(x, 1, 39) * 4);
    if (y < top) return [0, 0, 0, 0];
    if (y < top + 4) return mul([218, 190, 74], 0.9 + hash(x, y, 40) * 0.2);
    return mul([142, 168, 56], 0.85 + hash(x, y, 41) * 0.3);
  },
  HAY_SIDE: (x, y) => {
    if (y === 3 || y === 12) return [126, 92, 30, 255];
    return mul([208, 172, 44], 0.84 + hash(x, 0, 42) * 0.3);
  },
  HAY_TOP: (x, y) => jit([218, 186, 52], x, y, 43, 0.2),
  DOOR: (x, y) => {
    const frame = x < 2 || x > 13 || y < 2 || y > 13;
    const mid = y === 7 || y === 8;
    let c = mul([116, 82, 46], frame || mid ? 0.82 : 1.0);
    c = jit(c, x, y, 44, 0.1);
    if (x >= 11 && x <= 12 && y >= 8 && y <= 9) return [58, 56, 56, 255];
    return c;
  },
  LAMP: (x, y) => {
    const frame = x < 2 || x > 13 || y < 2 || y > 13 || x === 7 || x === 8;
    if (frame) return mul([70, 44, 24], 0.8 + hash(x, y, 45) * 0.4);
    const d = Math.hypot(x - 7.5, y - 7.5);
    return mix([255, 238, 168], [255, 190, 86], Math.min(1, d / 8));
  },
  WOOL_RED: (x, y) => jit([190, 52, 50], x, y, 46, 0.14),
  WOOL_WHITE: (x, y) => jit([236, 234, 228], x, y, 47, 0.08),
  WOOL_BLUE: (x, y) => jit([62, 94, 192], x, y, 48, 0.14),
  NETHERRACK: (x, y) => mul(jit([112, 40, 42], x, y, 49, 0.3), 0.78 + noise(x, y, 50, 4) * 0.4),
  NETHER_BRICK: (x, y) => {
    const row = Math.floor(y / 4);
    const ox = row % 2 ? 4 : 0;
    if (y % 4 === 3 || (x + ox) % 8 === 7) return [26, 10, 14, 255];
    return mul(jit([66, 24, 30], x, y, 51, 0.16), 0.9 + hash(Math.floor((x + ox) / 8), row, 52) * 0.25);
  },
  NETHER_FENCE: (x, y) => mul(jit([46, 18, 24], x, y, 53, 0.2), y < 2 ? 1.5 : 1),
  LAVA: (x, y) => {
    const n = noise(x, y, 54, 8) * 0.55 + noise(x, y, 55, 4) * 0.45;
    if (n < 0.34) return mix([128, 32, 10], [200, 60, 10], n / 0.34);
    return mix([226, 84, 12], [255, 226, 110], Math.min(1, Math.pow((n - 0.34) / 0.5, 1.5)));
  },
  OBSIDIAN: (x, y) => {
    const v = hash(x, y, 56);
    if (v > 0.94) return [84, 36, 140, 255];
    if (v > 0.87) return [34, 18, 54, 255];
    return mul([20, 12, 32], 0.7 + noise(x, y, 57, 4) * 0.7);
  },
  GLOWSTONE: (x, y) => {
    const { id, edge } = cells(x, y, 58, 5);
    if (edge < 0.7) return [150, 98, 34, 255];
    return mix([214, 160, 70], [255, 232, 150], id);
  },
  BASALT_TOP: (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    return mul(jit([70, 70, 78], x, y, 59, 0.2), Math.floor(d / 2.2) % 2 ? 0.86 : 1.06);
  },
  BASALT_SIDE: (x, y) => mul(jit([64, 64, 72], x, y, 60, 0.16), x % 4 === 0 ? 0.7 : 1 + hash(x, 0, 61) * 0.2),
  BLACKSTONE: (x, y) => {
    const v = hash(x, y, 62);
    if (v > 0.955) return [150, 118, 58, 255];
    return mul(jit([38, 33, 40], x, y, 63, 0.4), 0.9 + noise(x, y, 64, 4) * 0.3);
  },
  SOUL_SAND: (x, y) => {
    const { id, edge } = cells(x, y, 65, 5);
    if (id > 0.72 && edge > 0.3) return [34, 26, 22, 255];
    return jit([96, 76, 60], x, y, 66, 0.18);
  },
  CRIMSON_STEM: (x, y) => mul([124, 34, 54], 0.7 + hash(x, 0, 67) * 0.7 + (hash(x, y, 68) - 0.5) * 0.1),
  CRIMSON_TOP: (x, y) => {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    return d > 6.6 ? [100, 26, 44, 255] : mul([176, 64, 78], Math.floor(d) % 2 ? 0.84 : 1.04);
  },
  WARPED_STEM: (x, y) => mul([40, 124, 124], 0.7 + hash(x, 0, 69) * 0.7 + (hash(x, y, 70) - 0.5) * 0.1),
  WARPED_TOP: (x, y) => {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    return d > 6.6 ? [30, 96, 98, 255] : mul([70, 176, 170], Math.floor(d) % 2 ? 0.84 : 1.04);
  },
  WART: (x, y) => {
    const { id } = cells(x, y, 71, 4);
    return mul([166, 28, 38], 0.74 + id * 0.6);
  },
  WARPED_WART: (x, y) => {
    const { id } = cells(x, y, 72, 4);
    return mul([22, 134, 112], 0.74 + id * 0.6);
  },
  SHROOMLIGHT: (x, y) => {
    const { id, edge } = cells(x, y, 73, 4);
    if (edge < 0.6) return [214, 108, 44, 255];
    return mix([255, 170, 80], [255, 232, 160], id);
  },
  SNOW_TOP: (x, y) => jit([240, 246, 252], x, y, 74, 0.07),
  SNOW_SIDE: (x, y) => {
    const edge = 3 + Math.floor(hash(x, 0, 75) * 3);
    return y < edge ? jit([240, 246, 252], x, y, 74, 0.07) : dirtAt(x, y, 3);
  },
  GOLD_GRASS_TOP: (x, y) => {
    const c = jit([186, 168, 58], x, y, 76, 0.32);
    return hash(x, y, 77) > 0.9 ? [214, 148, 52, 255] : c;
  },
  GOLD_GRASS_SIDE: (x, y) => {
    const edge = 3 + Math.floor(hash(x, 0, 78) * 3);
    return y < edge ? jit([186, 168, 58], x, y, 76, 0.32) : dirtAt(x, y, 3);
  },
  CLOUD: (x, y) => jit([255, 255, 255], x, y, 79, 0.05),
  FIRE: (x, y) => {
    const h = 4 + Math.floor(hash(x, 0, 80) * 9);
    const inside = x > 2 && x < 13 && y > 15 - h;
    if (!inside) return [0, 0, 0, 0];
    return mix([255, 214, 70], [255, 90, 20], Math.min(1, (y - (15 - h)) / h) * 0.9);
  },
  BARREL: (x, y) => {
    const band = y % 5 === 0 || x === 0 || x === 15;
    return band ? mul([62, 48, 36], 0.9 + hash(x, y, 81) * 0.3) : mul(jit([138, 100, 58], x, y, 82, 0.12), 0.86 + (x % 4) * 0.05);
  },
  // ---- shaped-block textures: doors, workstations, torches, plants --------------------------
  DOOR_LOW: (x, y) => {
    const edge = x < 1 || x > 14 || y > 14;
    const groove = y === 3 || y === 12 || x === 3 || x === 12 || x === 7 || x === 8;
    const c = jit(mul([138, 100, 58], edge ? 0.62 : groove ? 0.82 : 1), x, y, 120, 0.1);
    if (x >= 11 && x <= 12 && y >= 7 && y <= 8) return [214, 206, 190, 255]; // handle
    return c;
  },
  DOOR_UP: (x, y) => {
    const edge = x < 1 || x > 14 || y < 1;
    const win = ((x >= 3 && x <= 5) || (x >= 10 && x <= 12)) && ((y >= 3 && y <= 5) || (y >= 8 && y <= 10));
    if (win) return mul([54, 70, 82], 0.9 + hash(x, y, 121) * 0.25);
    const frame = x === 7 || x === 8 || y === 7 || y === 6 || y === 11 || y === 2;
    return jit(mul([138, 100, 58], edge ? 0.62 : frame ? 0.82 : 1), x, y, 122, 0.1);
  },
  IRON: (x, y) => mul(jit([86, 86, 92], x, y, 123, 0.2), 0.86 + noise(x, y, 124, 4) * 0.3),
  FURNACE_FRONT: (x, y) => {
    const { id, edge } = cells(x, y, 125, 4);
    const base = mul([118, 118, 122], 0.7 + id * 0.45);
    if (x >= 3 && x <= 12 && y >= 6 && y <= 12) {
      const glow = y >= 10 ? (y - 9) / 3 : 0;
      return mix([20, 18, 22], [255, 150, 40], glow * (0.55 + 0.45 * hash(x, y, 126)));
    }
    if (x >= 3 && x <= 12 && y >= 2 && y <= 4) return [34, 34, 38, 255];
    return edge < 0.85 ? mul(base, 0.55) : base;
  },
  FURNACE_TOP: (x, y) => mul(jit([108, 108, 112], x, y, 127, 0.16), x < 1 || y < 1 || x > 14 || y > 14 ? 0.7 : 1),
  BOOKSHELF: (x, y) => {
    if (y < 2 || y > 13 || y === 7 || y === 8) return mul(jit([164, 126, 76], x, y, 128, 0.12), 0.85);
    const book = Math.floor(x / 2) + (y < 7 ? 0 : 5);
    const cols = [[150, 40, 40], [48, 90, 150], [60, 128, 70], [170, 130, 50], [110, 60, 140], [200, 190, 170]];
    const c = cols[Math.floor(hash(book, 0, 129) * cols.length)];
    return x % 2 === 1 && hash(x, y, 130) > 0.45 ? mul(c, 0.78) : mul(c, 0.9 + hash(x, y, 131) * 0.2);
  },
  CRAFTING_TOP: (x, y) => {
    const base = mul([164, 126, 76], 0.9);
    if (x < 1 || y < 1 || x > 14 || y > 14) return mul(base, 0.6);
    if ((x - 1) % 4 === 3 || (y - 1) % 4 === 3) return mul(base, 0.7);
    return jit(base, x, y, 132, 0.1);
  },
  CRAFTING_SIDE: (x, y) => {
    const base = [138, 100, 58];
    if (y < 3) return mul(jit(base, x, y, 133, 0.1), 0.62);
    if (y >= 5 && y <= 11 && x >= 3 && x <= 12) {
      if (x === 4 || x === 11) return [60, 46, 34, 255]; // tools hanging
      if (y === 6 && x > 4 && x < 11) return [190, 190, 196, 255];
    }
    return jit(base, x, y, 134, 0.1);
  },
  NWART: (x, y) => {
    const stem = x >= 7 && x <= 8 && y >= 10;
    if (stem) return [96, 30, 36, 255];
    const d = Math.hypot((x - 7.5) / 5.8, (y - 8) / 4.2);
    if (d < 1 && y >= 3 && y <= 12) return hash(x, y, 135) > 0.78 ? [224, 70, 70, 255] : mul([170, 28, 38], 0.8 + hash(x, y, 136) * 0.5);
    return [0, 0, 0, 0];
  },
  SPAWNER: (x, y) => {
    const bar = x % 5 === 2 || y % 5 === 2 || x === 0 || y === 0 || x === 15 || y === 15;
    if (bar) return mul(jit([66, 70, 84], x, y, 137, 0.2), 0.8 + noise(x, y, 138, 4) * 0.4);
    return mix([8, 8, 14], [40, 14, 12], hash(x, y, 139) * 0.5);
  },
  TORCH: (x, y) => {
    if (x < 7 || x > 8) return [0, 0, 0, 0];
    if (y < 4) return [0, 0, 0, 0];
    if (y <= 5) return y === 4 ? [255, 240, 150, 255] : [255, 178, 56, 255];
    return mul([128, 92, 52], 0.8 + hash(x, y, 140) * 0.4);
  },
  LANTERN: (x, y) => {
    // body rows 9-15 (a lit cage), cap rows 7-8, hook above
    if (y >= 9) {
      const frame = x === 5 || x === 10 || y === 15 || y === 9;
      if (x < 5 || x > 10) return [0, 0, 0, 0];
      if (frame) return mul([46, 44, 48], 0.9 + hash(x, y, 141) * 0.3);
      return mix([255, 232, 140], [255, 178, 70], Math.min(1, Math.hypot(x - 7.5, y - 12) / 3.4));
    }
    if (y >= 7) return x >= 6 && x <= 9 ? mul([54, 52, 58], 0.9 + hash(x, y, 142) * 0.2) : [0, 0, 0, 0];
    return [0, 0, 0, 0];
  },
  MOSSY_COBBLE: (x, y) => {
    const { id, edge } = cells(x, y, 143, 4);
    const moss = hash(x, y, 144) > 0.55 && noise(x, y, 145, 4) > 0.45;
    const c = moss ? mul([78, 112, 56], 0.7 + id * 0.5) : mul([122, 122, 126], 0.74 + id * 0.5);
    return edge < 0.85 ? mul(c, 0.55) : c;
  },
  FLOWER_RED: (x, y) => {
    const d = Math.hypot(x - 7.5, y - 3.5);
    if (d < 3.4) return d < 1.3 ? [250, 220, 80, 255] : mul([214, 40, 52], 0.85 + hash(x, y, 146) * 0.3);
    if (y > 6 && x >= 7 && x <= 8) return [58, 120, 44, 255];
    if (y > 9 && (x === 6 || x === 9) && hash(x, y, 147) > 0.3) return [58, 120, 44, 255];
    return [0, 0, 0, 0];
  },
  FLOWER_YELLOW: (x, y) => {
    const d = Math.hypot(x - 7.5, y - 3.5);
    if (d < 3.4) return d < 1.3 ? [200, 130, 40, 255] : mul([248, 220, 60], 0.85 + hash(x, y, 148) * 0.25);
    if (y > 6 && x >= 7 && x <= 8) return [58, 120, 44, 255];
    if (y > 9 && (x === 6 || x === 9) && hash(x, y, 149) > 0.3) return [58, 120, 44, 255];
    return [0, 0, 0, 0];
  },
  TALL_GRASS: (x, y) => {
    const blades = [2, 4, 6, 8, 10, 12, 13];
    const i = blades.indexOf(x);
    if (i < 0) return [0, 0, 0, 0];
    const top = 3 + Math.floor(hash(x, 7, 150) * 7);
    if (y < top) return [0, 0, 0, 0];
    return mul([88, 150, 48], 0.7 + (y - top) * 0.04 + hash(x, y, 151) * 0.3);
  },
};

/** All tiles as one RGBA byte array, 16x16 pixels per layer. */
export function buildTiles() {
  const out = new Uint8Array(TILE * TILE * 4 * TILE_COUNT);
  NAMES.forEach((name, i) => out.set(paint(PAINT[name]), i * TILE * TILE * 4));
  return out;
}
