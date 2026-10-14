import { Raster, hex, lerpColor, shade, rng, fbm, noise2, bayer } from './raster.mjs';
import { W, H, CX, PLATFORM_Y } from './scene.mjs';

/**
 * Daytime "Overworld" hero art. Same 320x180 layer contract as the Nether scenes (sky, far,
 * water in place of the lava lake, mid, near, fore) so the CSS portal stays locked to the same
 * platform. Everything is drawn procedurally; nothing is copied from the game.
 */

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const OVERWORLD_BIOMES = {
  meadow: {
    sky: [[0, '#5b9bf0'], [0.45, '#7fb8f7'], [0.8, '#b4dcff'], [1, '#e4f4ff']],
    sun: { x: 238, y: 30, size: 14, color: '#fff6c8', glow: '#fff1a8' },
    cloud: ['#ffffff', '#e6eef7', '#c9d7e8'],
    far: { rim: '#6f9a86', body: ['#7fa8b8', '#9bc0d0'], tree: '#5d8f6a', snow: null },
    water: { deep: ['#2a6fd1', '#2f7ae0', '#3b88ec'], light: '#8fc6ff', foam: '#e8f6ff' },
    ground: { top: ['#6fbf45', '#7ccd4f'], side: '#866043', rock: ['#8a8a8a', '#7c7c7c', '#6b6b6b', '#969696'] },
    leaf: ['#4c9a34', '#3c8a2c', '#2d6f22', '#69b848'],
    wood: ['#7a5230', '#5e3f24', '#47301b'],
    trees: 11,
    pines: 0,
    flowers: ['#ff5d6c', '#ffd23d', '#ffffff', '#b57bff'],
    near: { top: ['#3f8a2c', '#479434'], side: '#5a3f27', rock: ['#555', '#4a4a4a', '#404040', '#5f5f5f'], leaf: ['#2f7a24', '#276a1e', '#1d5217', '#3d8f2e'], wood: ['#5a3c22', '#452d19', '#35230f'] },
    fore: { leaf: ['#3a8a2a', '#2c7020', '#4aa337'], tip: '#8fe06a' },
    particles: { hi: '#fff7c2', lo: '#ffe27a', ash: [120, 190, 90], ashRatio: 0.3 },
  },
  pine: {
    sky: [[0, '#6aa6e6'], [0.4, '#92c2ee'], [0.75, '#c3def4'], [1, '#e8f1f8']],
    sun: { x: 90, y: 34, size: 12, color: '#fffbe8', glow: '#fff5c8' },
    cloud: ['#ffffff', '#e3ebf3', '#c4d0de'],
    far: { rim: '#d8e6f0', body: ['#7f98ae', '#9db3c6'], tree: '#4b7260', snow: '#f4f9ff' },
    water: { deep: ['#2c6aa8', '#337ab8', '#3f89c6'], light: '#9ccbe8', foam: '#eaf6ff' },
    ground: { top: ['#4f9a4a', '#5aa655'], side: '#6b4f3a', rock: ['#7d8288', '#6f747a', '#5f6469', '#8a9096'] },
    leaf: ['#2f6b3f', '#245733', '#1b4527', '#3f8250'],
    wood: ['#5e4330', '#48321f', '#392818'],
    trees: 0,
    pines: 14,
    flowers: ['#ffffff', '#cfe8ff', '#ffd23d', '#ff8fa8'],
    near: { top: ['#2f6f3a', '#377a43'], side: '#4a3626', rock: ['#4c5258', '#42474d', '#383c41', '#565c63'], leaf: ['#1f5530', '#194727', '#10351c', '#2a6a3d'], wood: ['#4a3322', '#392819', '#2b1e11'] },
    fore: { leaf: ['#2a6a3a', '#1f5530', '#3b7f4b'], tip: '#a8e0b4' },
    particles: { hi: '#ffffff', lo: '#d8ecff', ash: [235, 245, 255], ashRatio: 0.85 },
  },
  golden: {
    sky: [[0, '#5a78c8'], [0.35, '#9a86c4'], [0.65, '#f0a58a'], [0.88, '#ffcf8a'], [1, '#ffe7b0']],
    sun: { x: 160, y: 108, size: 16, color: '#fff0c0', glow: '#ffc16a' },
    cloud: ['#ffe9d0', '#f5c8b0', '#d9a0a0'],
    far: { rim: '#c88a7a', body: ['#8a6a8e', '#a98098'], tree: '#7a6a5a', snow: null },
    water: { deep: ['#3a68b8', '#4676c8', '#5886d6'], light: '#ffc98a', foam: '#fff0d0' },
    ground: { top: ['#8fb23c', '#a0c248'], side: '#7a5638', rock: ['#8a8070', '#7c7264', '#6b6256', '#968c7c'] },
    leaf: ['#d98a2a', '#c4701f', '#a8581a', '#e8a838'],
    wood: ['#6e4a2c', '#553820', '#402816'],
    trees: 11,
    pines: 0,
    flowers: ['#ff7a3d', '#ffd23d', '#ffffff', '#ff5d8a'],
    near: { top: ['#6f8f2c', '#799a34'], side: '#563a24', rock: ['#5a5246', '#4e473d', '#433d34', '#645b4e'], leaf: ['#b8701f', '#a05c18', '#7a4412', '#cc8428'], wood: ['#503620', '#3d2918', '#2e1e10'] },
    fore: { leaf: ['#c0781f', '#a05f18', '#d8902a'], tip: '#ffd27a' },
    particles: { hi: '#ffe7a0', lo: '#ffb347', ash: [220, 150, 60], ashRatio: 0.55 },
  },
};

function ramp(stops, t) {
  const s = stops.map(([p, c]) => [p, hex(c)]);
  if (t <= s[0][0]) return s[0][1];
  for (let i = 1; i < s.length; i++) {
    if (t <= s[i][0]) return lerpColor(s[i - 1][1], s[i][1], (t - s[i - 1][0]) / (s[i][0] - s[i - 1][0]));
  }
  return s[s.length - 1][1];
}

/* ------------------------------------------------------------------ sky */

export function sky(b, seed = 3) {
  const r = new Raster(W, H);
  const steps = 16;
  const palette = Array.from({ length: steps + 1 }, (_, i) => ramp(b.sky, i / steps));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = clamp01(y / 140 + (fbm(x / 80, y / 16, seed, 2) - 0.5) * 0.08);
      const f = t * steps;
      const band = Math.floor(f);
      r.set(x, y, palette[Math.min(steps, band + (f - band > bayer(x, y) ? 1 : 0))]);
    }
  }

  // The sun is a square, a soft glow behind it.
  const { x: sx, y: sy, size, color, glow } = b.sun;
  const g = hex(glow);
  for (let y = sy - 46; y < sy + 46; y++) {
    for (let x = sx - 46; x < sx + 46; x++) {
      const a = Math.pow(Math.max(0, 1 - Math.hypot(x - sx, y - sy) / 46), 1.8) * 0.8;
      if (a > bayer(x, y) && r.inside(x, y)) r.set(x, y, lerpColor(r.get(x, y), g, 0.6));
    }
  }
  r.rect(sx - size / 2, sy - size / 2, size, size, hex(color));

  // Blocky clouds: stacked rectangles with a shaded underside.
  const rand = rng(seed + 17);
  const [c0, c1, c2] = b.cloud.map((c) => hex(c));
  for (let i = 0; i < 9; i++) {
    const cx = Math.floor(rand() * W);
    const cy = 14 + Math.floor(rand() * 70);
    const rows = 2 + Math.floor(rand() * 2);
    for (let row = 0; row < rows; row++) {
      const w = 22 + Math.floor(rand() * 34) - row * 5;
      const x0 = cx - Math.floor(w / 2) + Math.floor(rand() * 6);
      const y0 = cy + row * 4;
      r.rect(x0, y0, w, 4, c0);
      if (row === rows - 1) r.rect(x0, y0 + 3, w, 1, c1);
      r.rect(x0 + w - 2, y0, 2, 4, c1);
    }
    r.rect(cx - 8, cy + rows * 4, 14, 1, c2);
  }
  return r;
}

/* ------------------------------------------------------- distant terrain */

export function far(b, seed = 11) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const p = b.far;
  const rim = hex(p.rim);
  const body0 = hex(p.body[0]);
  const body1 = hex(p.body[1]);
  const top = (x) => Math.round((92 + (fbm(x / 60, 0.5, seed, 3) - 0.5) * 40 + (fbm(x / 14, 3.1, seed + 3, 2) - 0.5) * 8) / 2) * 2;

  for (let x = 0; x < W; x++) {
    const t = top(x);
    for (let y = t; y < 136; y++) {
      const depth = y - t;
      let c = depth < 1 ? rim : lerpColor(body0, body1, Math.min(1, depth / 38));
      if (p.snow && depth < 6 - Math.max(0, (t - 80) / 4)) c = hex(p.snow);
      r.set(x, y, c);
    }
  }
  // A line of tiny trees along the ridge.
  const tree = hex(p.tree);
  for (let i = 0; i < 46; i++) {
    const x = Math.floor(rand() * W);
    const base = top(x) + 2;
    const h = 4 + Math.floor(rand() * 5);
    r.rect(x, base - h, 1, h, shade(tree, 0.75));
    r.rect(x - 2, base - h - 3, 5, 3, tree);
    r.rect(x - 1, base - h - 4, 3, 1, shade(tree, 1.15));
  }
  return r;
}

/* ------------------------------------------------------------- water lake */

export function water(b, seed = 5) {
  const r = new Raster(W, H);
  const [d0, d1, d2] = b.water.deep.map((c) => hex(c));
  const light = hex(b.water.light);
  const foam = hex(b.water.foam);
  for (let x = 0; x < W; x++) {
    const edge = 124 + Math.round(noise2(x / 9, 1, seed) * 3);
    for (let y = edge; y < H; y++) {
      const wave = fbm(x / 20 + y / 90, y / 2.6, seed, 3);
      let c = wave > 0.6 ? d2 : wave > 0.42 ? d1 : d0;
      if (y - edge < 2) c = lerpColor(c, light, 0.5);
      if (noise2(x / 5, y / 1.6, seed + 4) > 0.84) c = light;
      if (noise2(x / 7, y / 2, seed + 11) > 0.93) c = foam;
      r.set(x, y, c);
    }
  }
  return r;
}

/* ----------------------------------------------------------- mid ground */

function groundTop(x, seed) {
  const dx = Math.abs(x - CX);
  if (dx <= 44) return PLATFORM_Y;
  if (dx <= 60) return PLATFORM_Y + Math.floor((dx - 44) / 4) * 2;
  if (dx < 94 && fbm(x / 22, 7.7, seed, 2) > 0.62) return null;
  const base = 148 + (fbm(x / 30, 2.2, seed + 5, 3) - 0.5) * 16 + (dx < 94 ? 6 : 0);
  return Math.round(base / 2) * 2;
}

function drawGround(r, topFn, g, seed, depthShade = 0.5) {
  const top = g.top.map((c) => hex(c));
  const side = hex(g.side);
  const rock = g.rock.map((c) => hex(c));
  for (let x = 0; x < W; x++) {
    const t = topFn(x);
    if (t === null) continue;
    for (let y = t; y < H; y++) {
      const depth = y - t;
      let c;
      if (depth === 0) c = top[(x + (noise2(x / 2, 3, seed) > 0.5 ? 1 : 0)) % 2];
      else if (depth < 2) c = shade(top[0], 0.82);
      else if (depth < 7) c = shade(side, 1 - (depth - 2) * 0.025 + (noise2(x * 0.8, y * 0.8, seed + 2) - 0.5) * 0.18);
      else {
        const h = noise2(x * 0.9 + y * 0.35, y * 0.9 - x * 0.2, seed + 3);
        c = shade(rock[Math.min(rock.length - 1, Math.floor(h * rock.length))], 1 - Math.min(1, depth / 60) * depthShade);
      }
      const lt = topFn(x - 1);
      if ((lt === null || lt > y) && depth > 0) c = shade(c, 1.12);
      r.set(x, y, c);
    }
  }
}

/** A tree made of 4x4 leaf cubes, like the blocky trees of the game but drawn from scratch. */
function drawOak(r, cx, baseY, o) {
  const { trunkW, height, canopy, wood, leaf, rand } = o;
  const [w0, w1, w2] = wood.map((c) => hex(c));
  const x0 = cx - Math.floor(trunkW / 2);
  for (let k = 0; k < height; k++) {
    for (let i = 0; i < trunkW; i++) r.set(x0 + i, baseY - k, i === 0 ? w0 : i === trunkW - 1 ? w2 : w1);
    if (k % 6 === 3) r.set(x0 + 1, baseY - k, w2);
  }
  const L = leaf.map((c) => hex(c));
  const cell = 4;
  const cols = Math.round(canopy / cell);
  const rows = Math.max(3, Math.round(cols * 0.55));
  const topY = baseY - height - rows * cell + 6;
  for (let row = 0; row < rows; row++) {
    const inset = row === 0 || row === rows - 1 ? 1 : 0;
    for (let col = inset; col < cols - inset; col++) {
      const x = cx - Math.floor((cols * cell) / 2) + col * cell;
      const y = topY + row * cell;
      if (rand() < 0.12 && (row === 0 || col === 0 || col === cols - 1)) continue;
      const tone = row === 0 ? L[3] : row >= rows - 1 ? L[2] : (col + row) % 3 === 0 ? L[1] : L[0];
      r.rect(x, y, cell, cell, tone);
      r.rect(x, y, cell, 1, shade(tone, 1.2));
      r.rect(x + cell - 1, y, 1, cell, shade(tone, 0.82));
      r.rect(x, y + cell - 1, cell, 1, shade(tone, 0.8));
    }
  }
}

function drawPine(r, cx, baseY, o) {
  const { height, wood, leaf, rand } = o;
  const [w0, , w2] = wood.map((c) => hex(c));
  const L = leaf.map((c) => hex(c));
  r.rect(cx - 1, baseY - 8, 3, 8, w2);
  r.rect(cx - 1, baseY - 8, 1, 8, w0);
  const tiers = 4 + Math.floor(rand() * 3);
  const tierH = Math.floor(height / tiers);
  for (let t = 0; t < tiers; t++) {
    const yBase = baseY - 6 - t * tierH;
    const maxW = Math.round(((tiers - t) / tiers) * (14 + rand() * 6)) + 4;
    for (let k = 0; k < tierH + 3; k++) {
      const half = Math.max(1, Math.round((maxW / 2) * (k / (tierH + 3))));
      const y = yBase - tierH - 3 + k;
      for (let dx = -half; dx <= half; dx++) {
        const edge = dx === -half ? L[2] : dx === half ? L[2] : (dx + k) % 4 === 0 ? L[3] : L[0];
        r.set(cx + dx, y, k === tierH + 2 ? L[2] : edge);
      }
    }
  }
}

export function mid(b, seed = 21) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const top = (x) => groundTop(x, seed);
  drawGround(r, top, b.ground, seed);

  const placed = [];
  const spaced = (x, gap) => placed.every((p) => Math.abs(p - x) >= gap);
  const standable = (x) => [-3, -1, 0, 1, 3].every((o) => top(x + o) !== null) && top(x) !== null;
  const count = b.pines || b.trees;
  let attempts = 0;
  while (placed.length < count && attempts++ < 500) {
    const x = Math.floor(rand() * W);
    if (Math.abs(x - CX) < 74 || !standable(x) || !spaced(x, b.pines ? 13 : 16)) continue;
    placed.push(x);
    if (b.pines) drawPine(r, x, top(x), { height: 34 + Math.floor(rand() * 26), wood: b.wood, leaf: b.leaf, rand });
    else drawOak(r, x, top(x), { trunkW: 4, height: 18 + Math.floor(rand() * 16), canopy: 28 + Math.floor(rand() * 16), wood: b.wood, leaf: b.leaf, rand });
  }

  // Flowers and tall grass tufts on the grass.
  for (let i = 0; i < 120; i++) {
    const x = Math.floor(rand() * W);
    const t = top(x);
    if (t === null || Math.abs(x - CX) < 46) continue;
    if (rand() < 0.5) {
      r.set(x, t - 1, hex(b.flowers[Math.floor(rand() * b.flowers.length)]));
      r.set(x, t, hex('#3f8a2c'));
    } else {
      r.set(x, t - 1, hex(b.ground.top[1]));
      r.set(x + 1, t - 2, hex(b.ground.top[1]));
    }
  }

  // The portal sits on a small stone-brick platform.
  const stone = [hex('#9a9a9a'), hex('#868686'), hex('#707070'), hex('#aaaaaa')];
  for (let x = CX - 46; x <= CX + 46; x++) {
    for (let d = 0; d < 6; d++) {
      const y = PLATFORM_Y + d;
      const brick = (Math.floor((x + (Math.floor(d / 3) % 2) * 6) / 12) + Math.floor(d / 3)) % 4;
      let c = stone[brick % 3];
      if (d % 3 === 2 || (x + (Math.floor(d / 3) % 2) * 6) % 12 === 0) c = stone[2];
      if (d === 0) c = stone[3];
      r.set(x, y, c);
    }
  }
  return r;
}

/* ----------------------------------------------------------- near ground */

export function near(b, seed = 31) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const n = b.near;
  const top = (x) => {
    const dx = Math.abs(x - CX);
    const base = 172 + (fbm(x / 16, 9, seed, 2) - 0.5) * 8 - (dx > 100 ? (dx - 100) / 6 : 0);
    return Math.min(178, Math.round(base / 2) * 2);
  };
  drawGround(r, top, { top: n.top, side: n.side, rock: n.rock }, seed, 0.3);

  const trees = [
    { x: 16, height: 120, trunkW: 9, canopy: 72 },
    { x: 62, height: 78, trunkW: 6, canopy: 44 },
    { x: 306, height: 128, trunkW: 9, canopy: 74 },
    { x: 262, height: 82, trunkW: 6, canopy: 46 },
  ];
  for (const t of trees) {
    if (b.pines) drawPine(r, t.x, top(t.x), { height: t.height * 0.9, wood: n.wood, leaf: n.leaf, rand });
    else drawOak(r, t.x, top(t.x), { trunkW: t.trunkW, height: t.height, canopy: t.canopy, wood: n.wood, leaf: n.leaf, rand });
  }
  // Grass blades along the edge.
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rand() * W);
    const t = top(x);
    const h = 2 + Math.floor(rand() * 4);
    for (let k = 0; k < h; k++) r.set(x, t - 1 - k, hex(n.top[k % 2]));
  }
  return r;
}

/* ------------------------------------------------------------ foreground */

export function fore(b, seed = 41) {
  const r = new Raster(W, H);
  const rand = rng(seed);
  const f = b.fore;
  const [l0, l1, l2] = f.leaf.map((c) => hex(c));

  // A leaf canopy overhead with a ragged blocky underside.
  const edge = (x) => 4 + Math.round(fbm(x / 14, 4, seed, 2) * 3) * 4;
  for (let x = 0; x < W; x += 4) {
    const e = edge(x);
    for (let y = 0; y < e; y += 4) {
      const tone = ((x + y) / 4) % 3 === 0 ? l1 : l0;
      r.rect(x, y, 4, 4, tone);
      r.rect(x, y, 4, 1, shade(tone, 1.18));
      r.rect(x, y + 3, 4, 1, shade(tone, 0.78));
    }
    if (rand() < 0.45) {
      const hang = 4 + Math.floor(rand() * 3) * 4;
      r.rect(x, e, 4, hang, l2);
      r.rect(x, e, 4, 1, l1);
    }
  }
  // A few hanging vines.
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(rand() * W);
    const len = 8 + Math.floor(rand() * 30);
    const y0 = edge(x - (x % 4)) + 4;
    for (let k = 0; k < len; k++) r.set(x, y0 + k, k % 5 === 4 ? l0 : l2);
    r.set(x, y0 + len, hex(f.tip));
  }
  // Leafy bushes framing the bottom corners.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 54; i++) {
      const x = side < 0 ? i : W - 1 - i;
      const topY = Math.round((H - 6 - Math.max(0, 54 - i) * 0.9 - noise2(x / 5, 2, seed + side) * 8) / 2) * 2;
      for (let y = topY; y < H; y++) {
        const depth = y - topY;
        const cube = noise2(Math.floor(x / 4) * 1.7, Math.floor(y / 4) * 1.7, seed + 9) > 0.55;
        const c = cube ? l1 : l2;
        r.set(x, y, depth < 2 ? l0 : (x % 4 === 0 || y % 4 === 0) ? shade(c, 0.82) : c);
      }
    }
  }
  return r;
}
