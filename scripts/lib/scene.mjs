import { Raster, hex, lerpColor, shade, rng, fbm, noise2, bayer } from './raster.mjs';

/** Logical pixel grid of every hero layer (16:9). Layers are scaled up with nearest-neighbour. */
export const W = 320;
export const H = 180;
export const CX = 160;
/** Y of the flat platform the portal stands on. The page positions the portal from this value. */
export const PLATFORM_Y = 153;

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const BIOMES = {
  crimson: {
    sky: [
      [0, '#0d0309'],
      [0.3, '#230711'],
      [0.55, '#3d0b14'],
      [0.75, '#6a1612'],
      [0.9, '#a8340f'],
      [1, '#e0661a'],
    ],
    far: { rim: '#8a301c', body: ['#3a0f18', '#1d0811'], spire: '#220b15', fungus: '#3a0d18', glow: '#c8581a' },
    ground: { top: ['#a82334', '#c22f43'], side: '#8f1d2c', rock: ['#5e1a1c', '#6c2022', '#521719', '#7a2626'] },
    tree: {
      stem: ['#7a2c4a', '#5e2038', '#3e1428'],
      cap: ['#c22f43', '#a82334', '#7a1220'],
      vine: '#8f1d2c',
      glow: ['#ffb347', '#ffd27a'],
    },
    trees: 13,
    columns: 6,
    accent: '#ff6a7a',
  },
  basalt: {
    sky: [
      [0, '#0b070d'],
      [0.35, '#1a1320'],
      [0.6, '#2d2230'],
      [0.8, '#53332f'],
      [0.92, '#8a4a28'],
      [1, '#d0701e'],
    ],
    far: { rim: '#6b4a3e', body: ['#2a2230', '#150f1a'], spire: '#1c1522', fungus: '#2a2230', glow: '#e0701e' },
    ground: { top: ['#4a4150', '#5a5060'], side: '#3d3441', rock: ['#231c26', '#2d2530', '#1c1620', '#342b39'] },
    tree: {
      stem: ['#4a4150', '#3d3441', '#2d2530'],
      cap: ['#5a5060', '#4a4150', '#342b39'],
      vine: '#3d3441',
      glow: ['#ffb347', '#ffd27a'],
    },
    trees: 0,
    columns: 16,
    accent: '#ffb347',
  },
  wastes: {
    sky: [
      [0, '#12060a'],
      [0.3, '#2a0c10'],
      [0.55, '#4e1612'],
      [0.78, '#8a2a14'],
      [0.92, '#c9501a'],
      [1, '#f08a2a'],
    ],
    far: { rim: '#b04a22', body: ['#4a1a14', '#26100c'], spire: '#2e120e', fungus: '#4a1a14', glow: '#ffb347' },
    ground: { top: ['#a04a30', '#b25a38'], side: '#8a3a2a', rock: ['#6a2a20', '#7a3226', '#5a2018', '#843a2c'] },
    tree: {
      stem: ['#8a4a3a', '#6a3a2c', '#4a281e'],
      cap: ['#c0603a', '#a04a30', '#6a2a20'],
      vine: '#8a3a2a',
      glow: ['#ffd27a', '#fff0b0'],
    },
    trees: 5,
    columns: 4,
    accent: '#ffd27a',
  },
};

function sampleRamp(stops, t) {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      return lerpColor(c0, c1, (t - t0) / (t1 - t0));
    }
  }
  return stops[stops.length - 1][1];
}

/* ------------------------------------------------------------------ sky */

export function sky(biome, seed = 3) {
  const r = new Raster(W, H);
  const ramp = biome.sky.map(([t, c]) => [t, hex(c)]);
  const steps = 18;
  const palette = Array.from({ length: steps + 1 }, (_, i) => sampleRamp(ramp, i / steps));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = clamp01(y / 132 + (fbm(x / 70, y / 14, seed, 3) - 0.5) * 0.18);
      const f = t * steps;
      const band = Math.floor(f);
      const idx = Math.min(steps, band + (f - band > bayer(x, y) ? 1 : 0));
      r.set(x, y, palette[idx]);
    }
  }
  return r;
}

/* ------------------------------------------------------- distant terrain */

export function far(biome, seed = 11) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const p = biome.far;
  const rim = hex(p.rim);
  const body0 = hex(p.body[0]);
  const body1 = hex(p.body[1]);
  const top = (x) =>
    Math.round((96 + (fbm(x / 55, 0.5, seed, 3) - 0.5) * 28 + (fbm(x / 13, 3.1, seed + 3, 2) - 0.5) * 7) / 2) * 2;

  for (let x = 0; x < W; x++) {
    const t = top(x);
    for (let y = t; y < 136; y++) {
      const depth = y - t;
      r.set(x, y, depth < 1 ? rim : depth < 3 ? body0 : lerpColor(body0, body1, Math.min(1, (depth - 3) / 32)));
    }
  }

  // Tapered basalt spires on the horizon.
  const spire = hex(p.spire);
  const spireDark = shade(spire, 0.6);
  for (let i = 0; i < 9; i++) {
    const x = Math.floor(rand() * W);
    const width = 3 + Math.floor(rand() * 3);
    const height = 12 + Math.floor(rand() * 18);
    const base = top(x) + 3;
    for (let k = 0; k < height; k++) {
      const half = Math.max(0, Math.round((width / 2) * (1 - (k / height) * 0.75)));
      for (let dx = -half; dx <= half; dx++) r.set(x + dx, base - k, dx === half && half > 0 ? spireDark : spire);
    }
  }

  // Lava falls glowing on the far cliffs.
  for (let i = 0; i < 4; i++) {
    const x = 20 + Math.floor(rand() * (W - 40));
    const y0 = top(x) + 1;
    const len = 6 + Math.floor(rand() * 10);
    for (let k = 0; k < len; k++) r.set(x, y0 + k, lerpColor(hex('#ffc247'), hex('#e0501a'), k / len));
  }

  // Tiny silhouettes of distant giant fungi.
  const fungus = hex(p.fungus);
  const glow = hex(p.glow);
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(rand() * W);
    const base = top(x) + 1;
    const h = 5 + Math.floor(rand() * 7);
    for (let k = 0; k < h; k++) r.set(x, base - k, shade(fungus, 0.8));
    const w = 3 + Math.floor(rand() * 3);
    for (let dx = -w; dx <= w; dx++) {
      r.set(x + dx, base - h, fungus);
      if (Math.abs(dx) < w) r.set(x + dx, base - h - 1, fungus);
    }
    if (rand() > 0.55) r.set(x + Math.floor(rand() * 3) - 1, base - h + 1, glow);
  }
  return r;
}

/* ------------------------------------------------------------- lava lake */

export function lava(seed = 5) {
  const r = new Raster(W, H);
  const crust = hex('#4a1208');
  for (let x = 0; x < W; x++) {
    const edge = 124 + Math.round(noise2(x / 9, 1, seed) * 3);
    for (let y = edge; y < 160; y++) {
      const base = fbm(x / 24, y / 3.2, seed, 3) * (1 - ((y - 124) / 40) * 0.22) + (y < 131 ? 0.1 : 0);
      let c;
      if (noise2(x / 6, y / 2, seed + 9) > 0.8) c = crust;
      else if (base > 0.64) c = hex('#ffd04a');
      else if (base > 0.55) c = hex('#ffa326');
      else if (base > 0.42) c = hex('#f0600f');
      else if (base > 0.3) c = hex('#c33a0b');
      else c = hex('#8a240a');
      r.set(x, y, c);
    }
  }
  return r;
}

/* ----------------------------------------------------------- mid ground */

function midGroundTop(x, seed) {
  const dx = Math.abs(x - CX);
  if (dx <= 44) return PLATFORM_Y;
  if (dx <= 60) return PLATFORM_Y + Math.floor((dx - 44) / 4) * 2;
  if (dx < 94 && fbm(x / 22, 7.7, seed, 2) > 0.62) return null;
  const base = 148 + (fbm(x / 30, 2.2, seed + 5, 3) - 0.5) * 16 + (dx < 94 ? 6 : 0);
  return Math.round(base / 2) * 2;
}

function drawGround(r, topFn, biome, seed, maxDepthShade = 0.55) {
  const g = biome.ground;
  const top = g.top.map((c) => hex(c));
  const side = hex(g.side);
  const rock = g.rock.map((c) => hex(c));
  const rand = rng(seed + 100);
  for (let x = 0; x < W; x++) {
    const t = topFn(x);
    if (t === null) continue;
    for (let y = t; y < H; y++) {
      const depth = y - t;
      let c;
      if (depth === 0) c = top[(x + (noise2(x / 2, 3, seed) > 0.5 ? 1 : 0)) % 2];
      else if (depth < 3) c = side;
      else {
        const hsh = noise2(x * 0.9 + y * 0.35, y * 0.9 - x * 0.2, seed + 3);
        c = rock[Math.min(rock.length - 1, Math.floor(hsh * rock.length))];
        c = shade(c, 1 - Math.min(1, depth / 60) * maxDepthShade);
        if (depth > 8 && rand() < 0.004) c = hex('#ff6a1a');
      }
      const lt = topFn(x - 1);
      if ((lt === null || lt > y) && depth > 0) c = shade(c, 1.18);
      r.set(x, y, c);
    }
  }
}

function drawTree(r, cx, baseY, opts) {
  const { trunkW, height, capW, capH, pal, rand, lights = 4, vines = true } = opts;
  const stem = pal.stem.map((c) => hex(c));
  const cap = pal.cap.map((c) => hex(c));
  const vine = hex(pal.vine);
  const glow = pal.glow.map((c) => hex(c));
  const x0 = cx - Math.floor(trunkW / 2);

  for (let k = 0; k < height; k++) {
    const y = baseY - k;
    const band = k % 7 === 0;
    for (let i = 0; i < trunkW; i++) {
      let c = stem[1];
      if (i === 0) c = stem[0];
      else if (i === trunkW - 1) c = stem[2];
      if (band && i > 0 && i < trunkW - 1) c = stem[2];
      r.set(x0 + i, y, c);
    }
  }

  const capTop = baseY - height - capH + 3;
  for (let rr = 0; rr < capH; rr++) {
    const u = (rr + 1) / capH;
    const hw = Math.round((capW / 2) * Math.sqrt(u * (2 - u)));
    const y = capTop + rr;
    for (let dx = -hw; dx <= hw; dx++) {
      let c = cap[1];
      const speck = noise2((cx + dx) / 2.2, y / 2.2, 77);
      if (rr < 2 || (dx < -hw * 0.45 && rr < capH - 3)) c = cap[0];
      if (rr >= capH - 3 || dx > hw * 0.55) c = cap[2];
      if (speck > 0.72 && c !== cap[2]) c = cap[0];
      if (speck < 0.2) c = cap[2];
      if (dx === -hw || dx === hw) c = cap[2];
      r.set(cx + dx, y, c);
    }
  }
  const hwBottom = Math.round(capW / 2);
  for (let dx = -hwBottom + 1; dx < hwBottom; dx++) r.set(cx + dx, capTop + capH, shade(cap[2], 0.7));

  const bottomY = capTop + capH;
  for (let i = 0; i < lights; i++) {
    const lx = cx + Math.floor((rand() - 0.5) * capW * 0.8);
    const ly = bottomY - 1 + Math.floor(rand() * 2);
    r.rect(lx, ly, 2, 2, glow[0]);
    r.set(lx, ly, glow[1]);
  }
  if (vines) {
    const count = Math.max(2, Math.floor(capW / 8));
    for (let i = 0; i < count; i++) {
      const vx = cx + Math.floor((rand() - 0.5) * (capW - 4));
      const len = 3 + Math.floor(rand() * 9);
      for (let k = 1; k <= len; k++) r.set(vx, bottomY + k, vine);
      if (rand() > 0.5) r.set(vx, bottomY + len + 1, glow[0]);
    }
  }
}

function drawColumn(r, x, baseY, w, h, rand) {
  const base = hex('#2d2530');
  const light = hex('#3d3441');
  const dark = hex('#1f1923');
  const topCol = hex('#4a4150');
  const crack = hex('#17101c');
  for (let i = 0; i < w; i++) {
    const colTop = baseY - h + (i % 2 === 0 ? 0 : 2 + Math.floor(rand() * 3));
    for (let y = colTop; y <= baseY + 1; y++) {
      let c = base;
      if (i === 0) c = light;
      else if (i === w - 1) c = dark;
      if ((baseY - y) % 6 === 5 && i > 0) c = crack;
      if (y === colTop) c = topCol;
      r.set(x + i, y, c);
    }
  }
}

export function mid(biome, seed = 21) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const top = (x) => midGroundTop(x, seed);
  drawGround(r, top, biome, seed);

  const placed = [];
  const spaced = (x, gap) => placed.every((p) => Math.abs(p - x) >= gap);
  const standable = (x) => [-3, -1, 0, 1, 3].every((o) => top(x + o) !== null) && top(x) !== null;

  // Giant fungi across the side terrain, never on the portal platform.
  let attempts = 0;
  while (placed.length < biome.trees && attempts++ < 400) {
    const x = Math.floor(rand() * W);
    if (Math.abs(x - CX) < 74 || !standable(x) || !spaced(x, 15)) continue;
    placed.push(x);
    drawTree(r, x, top(x), {
      trunkW: 3 + Math.floor(rand() * 2),
      height: 24 + Math.floor(rand() * 26),
      capW: 22 + Math.floor(rand() * 16),
      capH: 8 + Math.floor(rand() * 4),
      pal: biome.tree,
      rand,
      lights: 3 + Math.floor(rand() * 3),
    });
  }

  // Basalt columns.
  const cols = [];
  attempts = 0;
  while (cols.length < biome.columns && attempts++ < 400) {
    const x = Math.floor(rand() * (W - 8));
    if (Math.abs(x - CX) < 66 || !standable(x + 2) || !cols.every((c) => Math.abs(c - x) >= 9)) continue;
    cols.push(x);
    drawColumn(r, x, top(x + 2), 5 + Math.floor(rand() * 3), 14 + Math.floor(rand() * 24), rand);
  }

  // Blackstone rim around the portal platform.
  const rim = [hex('#2a2230'), hex('#1c1622'), hex('#3a3040')];
  for (const side of [-1, 1]) {
    for (let k = 38; k <= 44; k++) {
      const x = CX + side * k;
      for (let d = 0; d < 3; d++) r.set(x, PLATFORM_Y + d, rim[(k + d) % 3]);
    }
    for (let k = 0; k < 4; k++) r.set(CX + side * (36 + k), PLATFORM_Y - 1, rim[2]);
  }
  return r;
}

/* ----------------------------------------------------------- near ground */

export function near(biome, seed = 31) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const dark = {
    ground: { top: ['#2a0c16', '#33101c'], side: '#1d0a12', rock: ['#14060d', '#1a0911', '#10050a', '#1e0a14'] },
  };
  const top = (x) => {
    const dx = Math.abs(x - CX);
    const base = 172 + (fbm(x / 16, 9, seed, 2) - 0.5) * 8 - (dx > 100 ? (dx - 100) / 6 : 0);
    return Math.min(178, Math.round(base / 2) * 2);
  };
  drawGround(r, top, { ground: dark.ground }, seed, 0.3);

  const pal = {
    stem: ['#3a1424', '#2c0f1c', '#16060e'],
    cap: ['#8a1a2c', '#6a1222', '#3d0a14'],
    vine: '#6a1222',
    glow: ['#ffb347', '#ffd27a'],
  };
  const trees = [
    { x: 14, height: 138, trunkW: 9, capW: 70, capH: 16 },
    { x: 58, height: 92, trunkW: 6, capW: 46, capH: 12 },
    { x: 308, height: 148, trunkW: 9, capW: 72, capH: 16 },
    { x: 262, height: 96, trunkW: 6, capW: 48, capH: 12 },
  ];
  for (const t of trees) drawTree(r, t.x, top(t.x), { ...t, pal, rand, lights: 5 });

  // Glowing lava cracks in the dark rock.
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rand() * W);
    const y = top(x) + 2 + Math.floor(rand() * 6);
    const len = 2 + Math.floor(rand() * 5);
    for (let k = 0; k < len; k++) r.set(x + k, y + (k % 2), hex(k === 0 ? '#ffb347' : '#e0501a'));
  }
  return r;
}

/* ------------------------------------------------------------ foreground */

export function fore(seed = 41) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const ceil = [hex('#0b0509'), hex('#14090f'), hex('#1d0d16')];

  // Netherrack ceiling with a ragged underside.
  const ceilEdge = (x) => 5 + Math.round(fbm(x / 11, 4, seed, 2) * 9);
  for (let x = 0; x < W; x++) {
    const e = ceilEdge(x);
    for (let y = 0; y < e; y++) r.set(x, y, y > e - 3 ? ceil[1] : ceil[0]);
    r.set(x, e, ceil[2]);
  }
  // Stalactites.
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(rand() * W);
    const w = 6 + Math.floor(rand() * 7);
    const len = 8 + Math.floor(rand() * 20);
    for (let k = 0; k < len; k++) {
      const half = Math.max(0, Math.round((w / 2) * (1 - k / len)));
      for (let dx = -half; dx <= half; dx++) r.set(x + dx, ceilEdge(x) + k, dx < 0 ? ceil[2] : ceil[1]);
    }
  }
  // Weeping vines.
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(rand() * W);
    const len = 10 + Math.floor(rand() * 52);
    const y0 = ceilEdge(x);
    for (let k = 0; k < len; k++) r.set(x, y0 + k, k % 5 === 4 ? hex('#8a1a2c') : hex('#5a0e1c'));
    r.set(x, y0 + len, hex(rand() > 0.5 ? '#ffb347' : '#8a1a2c'));
  }

  // Basalt rubble framing the bottom corners.
  const rock = [hex('#0e090f'), hex('#17101a'), hex('#231c26')];
  const crack = hex('#060308');
  for (const side of [-1, 1]) {
    for (let i = 0; i < 52; i++) {
      const x = side < 0 ? i : W - 1 - i;
      const topY = Math.round((H - 6 - Math.max(0, 52 - i) * 0.95 - noise2(x / 5, 2, seed + side) * 8) / 2) * 2;
      for (let y = topY; y < H; y++) {
        const depth = y - topY;
        let c = depth < 2 ? rock[2] : rock[(x + y) % 5 === 0 ? 1 : 0];
        if (depth > 3 && (x % 9 === 0 || (y - topY) % 11 === 10)) c = crack;
        r.set(x, y, c);
      }
    }
  }
  return r;
}

/* ------------------------------------------------------------- textures */

/** Tileable purple swirl used for the portal surface. */
export function portalTile() {
  const size = 64;
  const r = new Raster(size, size);
  const colors = ['#240a4e', '#3d1480', '#5a22b8', '#8b3dff', '#c58bff'].map((c) => hex(c));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const warpX = x + Math.sin((y / size) * Math.PI * 4) * 5;
      const warpY = y + Math.sin((x / size) * Math.PI * 2) * 4;
      const n =
        noise2(warpX / 8, warpY / 8, 5, 8) * 0.6 + noise2(warpX / 4, warpY / 4, 9, 16) * 0.28 + noise2(warpX / 2, warpY / 2, 13, 32) * 0.12;
      const idx = Math.min(colors.length - 1, Math.max(0, Math.floor((n - 0.28) * 7)));
      r.set(x, y, colors[idx]);
    }
  }
  return r;
}

/** 16x16 obsidian block texture. */
export function obsidianTile() {
  const r = new Raster(16, 16);
  const rand = rng(8);
  const base = [hex('#120a1c'), hex('#1a0f28'), hex('#0c0614')];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const v = rand();
      let c = v < 0.18 ? base[2] : v < 0.5 ? base[1] : base[0];
      if (rand() < 0.035) c = hex(rand() > 0.5 ? '#3b2166' : '#5b34a0');
      if (x === 0 || y === 0) c = hex('#2a1a40');
      if (x === 15 || y === 15) c = hex('#07030c');
      r.set(x, y, c);
    }
  }
  return r;
}

/* ---------------------------------------------------- composited helpers */

/** Draws a pixel portal onto `r` (used for thumbnails and the social card). */
export function drawPortal(r, cx, baseY, tile, obsidian, glowAmount = 0.6) {
  const block = 8;
  const left = cx - block * 2;
  const topY = baseY - block * 5;
  const centerY = baseY - block * 2.5;
  const radius = 58;
  for (let y = Math.floor(centerY - radius); y < centerY + radius; y++) {
    for (let x = cx - radius; x < cx + radius; x++) {
      const d = Math.hypot(x - cx, (y - centerY) * 0.9);
      const a = Math.pow(Math.max(0, 1 - d / radius), 2) * glowAmount;
      if (a > bayer(x, y) && r.inside(x, y)) r.set(x, y, lerpColor(r.get(x, y), hex('#8b3dff'), 0.55));
    }
  }
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const corner = (row === 0 || row === 4) && (col === 0 || col === 3);
      if (corner) continue;
      const frame = row === 0 || row === 4 || col === 0 || col === 3;
      for (let py = 0; py < block; py++) {
        for (let px = 0; px < block; px++) {
          const x = left + col * block + px;
          const y = topY + row * block + py;
          r.set(x, y, frame ? obsidian.get(px, py) : tile.get((col * block + px) % 64, (row * block + py + 16) % 64));
        }
      }
    }
  }
}

export function glowDisc(r, cx, cy, radius, color, strength = 0.7) {
  const c = hex(color);
  for (let y = Math.floor(cy - radius); y < cy + radius; y++) {
    for (let x = Math.floor(cx - radius); x < cx + radius; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const a = Math.pow(Math.max(0, 1 - d / radius), 1.6) * strength;
      if (a > bayer(x, y) && r.inside(x, y)) r.set(x, y, lerpColor(r.get(x, y), c, 0.6));
    }
  }
}
