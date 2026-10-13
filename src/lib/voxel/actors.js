import { BY, GY } from './worlds.js';

/**
 * Original blocky characters and creatures. They are built from a few coloured boxes, animated
 * from the clock alone, and each one can be poked with the cursor: it hops (friendly) or flashes
 * red (hostile) and says a line. Every instance written to the GPU is 20 floats: a 4x4 model
 * matrix and an rgb colour plus an emissive amount.
 */
const U = 1 / 16;
const PI = Math.PI;
const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const lerp = (a, b, t) => a + (b - a) * t;

let cur = null; // the actor being drawn, so helpers can apply its click reaction

// model = BaseYaw * T(pivot) * Ry * Rz * Rx * T(centre) * Scale
const R = new Float64Array(9);
function rot(rx, ry, rz) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  // Rz * Rx
  const a00 = cz, a01 = -sz * cx, a02 = sz * sx;
  const a10 = sz, a11 = cz * cx, a12 = -cz * sx;
  const a20 = 0, a21 = sx, a22 = cx;
  // Ry * (Rz * Rx)
  R[0] = cy * a00 + sy * a20; R[1] = cy * a01 + sy * a21; R[2] = cy * a02 + sy * a22;
  R[3] = a10; R[4] = a11; R[5] = a12;
  R[6] = -sy * a00 + cy * a20; R[7] = -sy * a01 + cy * a21; R[8] = -sy * a02 + cy * a22;
}

const FLASH_HOSTILE = [1, 0.2, 0.15];
const FLASH_FRIEND = [1, 0.95, 0.65];

function pushPart(push, base, part, rx = 0, ry = 0, rz = 0) {
  rot(rx, ry, rz);
  const [sx, sy, sz] = part.s;
  const [px, py, pz] = part.p;
  const [cx, cy, cz] = part.c;
  const { c, s, x, y, z } = base;
  const m = push.next();
  const col = (k) => {
    const vx = R[k] * (k === 0 ? sx : 0);
    return vx;
  };
  void col;
  // local columns (R times the scaled axes)
  const cols = [
    [R[0] * sx, R[3] * sx, R[6] * sx],
    [R[1] * sy, R[4] * sy, R[7] * sy],
    [R[2] * sz, R[5] * sz, R[8] * sz],
    [px + R[0] * cx + R[1] * cy + R[2] * cz, py + R[3] * cx + R[4] * cy + R[5] * cz, pz + R[6] * cx + R[7] * cy + R[8] * cz],
  ];
  for (let k = 0; k < 4; k++) {
    const [vx, vy, vz] = cols[k];
    m[k * 4] = c * vx + s * vz + (k === 3 ? x : 0);
    m[k * 4 + 1] = vy + (k === 3 ? y : 0);
    m[k * 4 + 2] = -s * vx + c * vz + (k === 3 ? z : 0);
    m[k * 4 + 3] = k === 3 ? 1 : 0;
  }
  const o = push.color();
  const glow = part.glow ?? 0;
  let r = part.col[0], g = part.col[1], b = part.col[2];
  if (cur && cur.flash > 0 && glow < 0.5) {
    const f = cur.flash * 0.75;
    const t = cur.kind === 'hostile' ? FLASH_HOSTILE : FLASH_FRIEND;
    r = lerp(r, t[0], f); g = lerp(g, t[1], f); b = lerp(b, t[2], f);
  }
  o[0] = r; o[1] = g; o[2] = b; o[3] = glow;
}

const box = (s, p, col, extra = {}) => ({ s: s.map((v) => v * U), p: p.map((v) => v * U), c: [0, 0, 0], col, ...extra });
const limb = (s, p, col, extra = {}) => ({ s: s.map((v) => v * U), p: p.map((v) => v * U), c: [0, (-s[1] / 2) * U, 0], col, ...extra });

function baseOf(x, y, z, yaw) {
  let hop = 0;
  let spin = 0;
  if (cur) {
    const u = (cur.t - cur.hitT) / 0.75;
    if (u >= 0 && u < 1) {
      hop = Math.sin(u * PI) * (cur.kind === 'hostile' ? 0.25 : 0.55);
      spin = Math.sin(u * PI * 2) * 0.7;
      cur.flash = 1 - u;
    } else cur.flash = 0;
    cur.pos[0] = x;
    cur.pos[1] = y + hop;
    cur.pos[2] = z;
  }
  const a = yaw + spin;
  return { c: Math.cos(a), s: Math.sin(a), x, y: y + hop, z };
}

function drawParts(push, parts, base, phase, amp, hammer = 0, extra) {
  for (const part of parts) {
    let a = 0;
    if (part.role === 'leg') a = part.swing * Math.sin(phase) * amp;
    else if (part.role === 'arm') a = part.swing * Math.sin(phase) * amp * 0.8 - hammer * (part.swing > 0 ? 1.6 : 0);
    else if (part.role === 'tail') {
      pushPart(push, base, part, 0, Math.sin(phase * 0.6 + (part.k ?? 0)) * 0.5, 0);
      continue;
    }
    if (extra) a += extra(part);
    pushPart(push, base, part, a);
  }
}

/* ------------------------------------------------------------------ body plans */

function humanoidParts({ skin, top, legs, hair, hat, apron, glowEyes, eye = [0.08, 0.08, 0.1], robe, scarf, pack, beard, arms }) {
  const parts = [];
  if (robe) {
    parts.push(box([9, 15, 6], [0, 7.5, 0], robe));
    parts.push(limb([3, 3, 3], [-2, 3, 0], legs, { swing: 1, role: 'leg' }), limb([3, 3, 3], [2, 3, 0], legs, { swing: -1, role: 'leg' }));
  } else {
    parts.push(limb([4, 12, 4], [-2, 12, 0], legs, { swing: 1, role: 'leg' }), limb([4, 12, 4], [2, 12, 0], legs, { swing: -1, role: 'leg' }));
  }
  parts.push(box([8, 12, 4], [0, 18, 0], top));
  parts.push(limb([4, arms ?? 12, 4], [-6, 24, 0], top, { swing: -1, role: 'arm' }), limb([4, arms ?? 12, 4], [6, 24, 0], top, { swing: 1, role: 'arm' }));
  parts.push(box([8, 8, 8], [0, 28, 0], skin));
  const e = glowEyes ?? eye;
  const gl = glowEyes ? { glow: 1 } : {};
  parts.push(box([1.8, 1.8, 0.5], [-2, 28.5, 4.2], e, gl), box([1.8, 1.8, 0.5], [2, 28.5, 4.2], e, gl));
  if (hair) parts.push(box([8.6, 2.4, 8.6], [0, 32, 0], hair), box([8.6, 6, 1.4], [0, 29.4, -4.2], hair));
  if (hat === 'straw') parts.push(box([15, 1, 15], [0, 32.4, 0], hex(0xd9b44a)), box([8.6, 3, 8.6], [0, 33.4, 0], hex(0xd9b44a)));
  if (hat === 'hood') parts.push(box([9, 9, 9], [0, 28.4, -0.4], top), box([5, 2, 0.6], [0, 24.6, 4.4], skin));
  if (hat === 'helm') parts.push(box([9, 4, 9], [0, 31.4, 0], hex(0x1a1418)), box([2, 5, 2], [0, 34.4, 0], hex(0x7a1d12), { glow: 0.4 }));
  if (hat === 'cap') parts.push(box([9, 3, 9], [0, 31.8, 0], hex(0x3b6e8f)), box([9, 1, 4], [0, 30.6, 5.5], hex(0x2a5070)));
  if (apron) parts.push(box([8.4, 10, 0.8], [0, 17, 2.4], apron));
  if (scarf) parts.push(box([9, 2.4, 5], [0, 24.4, 0], scarf));
  if (pack) parts.push(box([6, 8, 3], [0, 18, -3.4], pack));
  if (beard) parts.push(box([6, 5, 1.2], [0, 24.8, 4.3], beard));
  return parts;
}

const SKINS = [0xe0b394, 0xc58c64, 0x8d5a3b, 0xf0c8a8].map(hex);
const TOPS = [0x7b4a2d, 0x3b6e8f, 0x8f3b3b, 0x4f7a3a, 0x5a4a8a, 0xb88a3a].map(hex);

const quadParts = ({ wool, face, leg, size = 1, eyes, spots, horns }) => {
  const k = size;
  const L = (x, z) => limb([3 * k, 6 * k, 3 * k], [x * k, 6 * k, z * k], leg, { swing: x * z > 0 ? 1 : -1, role: 'leg' });
  const p = [
    box([12 * k, 9 * k, 16 * k], [0, 11 * k, 0], wool),
    box([6 * k, 6 * k, 6 * k], [0, 14 * k, 10 * k], face),
    horns ? box([8 * k, 1.4 * k, 1.4 * k], [0, 17.6 * k, 9.4 * k], horns) : box([6.4 * k, 2 * k, 6.4 * k], [0, 17.4 * k, 9.4 * k], wool),
    box([1.2 * k, 1.2 * k, 0.5 * k], [-1.6 * k, 14.6 * k, 13.2 * k], eyes ?? [0.05, 0.05, 0.06]),
    box([1.2 * k, 1.2 * k, 0.5 * k], [1.6 * k, 14.6 * k, 13.2 * k], eyes ?? [0.05, 0.05, 0.06]),
    L(-3, 5), L(3, 5), L(-3, -5), L(3, -5),
  ];
  if (spots) {
    p.push(box([5 * k, 0.4 * k, 6 * k], [-2 * k, 15.7 * k, 2 * k], spots), box([4 * k, 0.4 * k, 5 * k], [3 * k, 15.7 * k, -4 * k], spots), box([0.4 * k, 4 * k, 5 * k], [6.1 * k, 11 * k, 1 * k], spots));
  }
  return p;
};

const birdParts = (body, beak) => [
  box([5, 5, 7], [0, 6, 0], body),
  box([3.4, 4, 3.4], [0, 10, 3.6], body),
  box([2, 1.4, 2], [0, 9.6, 5.8], beak),
  box([2, 2, 0.8], [0, 8, 6.3], hex(0xc23a2a)),
  box([0.8, 3, 5], [-3, 7, 0], body),
  box([0.8, 3, 5], [3, 7, 0], body),
  limb([1, 4, 1], [-1.2, 4, 0], beak, { swing: 1, role: 'leg' }),
  limb([1, 4, 1], [1.2, 4, 0], beak, { swing: -1, role: 'leg' }),
];

// A small whiskered cat-like pet
const catParts = (fur, belly, eyes) => [
  box([5, 5, 12], [0, 6.5, 0], fur),
  box([5, 4.6, 5], [0, 8, 7.5], fur),
  box([1.4, 2.2, 1.2], [-1.8, 11.4, 7.4], fur),
  box([1.4, 2.2, 1.2], [1.8, 11.4, 7.4], fur),
  box([1, 1, 0.5], [-1.2, 8.6, 10.2], eyes, { glow: 0.5 }),
  box([1, 1, 0.5], [1.2, 8.6, 10.2], eyes, { glow: 0.5 }),
  box([1.4, 1, 0.5], [0, 7.4, 10.2], belly),
  limb([1.6, 5, 1.6], [-1.6, 5, 4.5], fur, { swing: 1, role: 'leg' }),
  limb([1.6, 5, 1.6], [1.6, 5, 4.5], fur, { swing: -1, role: 'leg' }),
  limb([1.6, 5, 1.6], [-1.6, 5, -4.5], fur, { swing: -1, role: 'leg' }),
  limb([1.6, 5, 1.6], [1.6, 5, -4.5], fur, { swing: 1, role: 'leg' }),
  { s: [1.4 * U, 1.4 * U, 5 * U], p: [0, 8.2 * U, -6 * U], c: [0, 0, -2.5 * U], col: fur, role: 'tail', k: 0 },
  { s: [1.2 * U, 1.2 * U, 4 * U], p: [0, 8.2 * U, -11 * U], c: [0, 0, -2 * U], col: belly, role: 'tail', k: 1 },
];

const sentinelParts = () => {
  const stone = hex(0x8a8f86);
  const dark = hex(0x6d726b);
  const moss = hex(0x5d8a3f);
  return [
    limb([5, 11, 5], [-3.5, 11, 0], dark, { swing: 1, role: 'leg' }),
    limb([5, 11, 5], [3.5, 11, 0], dark, { swing: -1, role: 'leg' }),
    box([14, 12, 8], [0, 17, 0], stone),
    box([9, 5, 7], [0, 10, 0], dark),
    limb([5, 22, 5], [-9.5, 23, 0], stone, { swing: -1, role: 'arm' }),
    limb([5, 22, 5], [9.5, 23, 0], stone, { swing: 1, role: 'arm' }),
    box([8, 8, 8], [0, 27.5, 0], stone),
    box([2, 4, 2], [0, 26.6, 4.6], dark),
    box([1.8, 1.4, 0.5], [-2.2, 28.2, 4.1], hex(0xffe08a), { glow: 1 }),
    box([1.8, 1.4, 0.5], [2.2, 28.2, 4.1], hex(0xffe08a), { glow: 1 }),
    box([3, 12, 0.6], [-4, 18, 4.2], moss),
    box([4, 3, 0.6], [4.5, 21, 4.2], moss),
    box([6, 1.4, 6], [-4, 31.8, 0], moss),
  ];
};

const bonesParts = (bone, dark, bow) => [
  limb([2, 12, 2], [-1.6, 12, 0], bone, { swing: 1, role: 'leg' }),
  limb([2, 12, 2], [1.6, 12, 0], bone, { swing: -1, role: 'leg' }),
  box([6, 3, 3], [0, 14, 0], dark),
  box([6, 3, 2.4], [0, 17.5, 0], bone),
  box([6, 3, 2.4], [0, 21, 0], dark),
  box([2, 12, 2], [0, 18, 0], bone),
  limb([2, 12, 2], [-4, 24, 0], bone, { swing: -1, role: 'arm' }),
  limb([2, 12, 2], [4, 24, 0], bone, { swing: 1, role: 'arm' }),
  box([8, 8, 8], [0, 28, 0], bone),
  box([2, 2, 0.6], [-2, 28.5, 4.1], dark, { glow: 0 }),
  box([2, 2, 0.6], [2, 28.5, 4.1], dark),
  box([4, 1, 0.6], [0, 25.8, 4.1], dark),
  box([9, 14, 1.4], [0, 20, -3], dark),
  box([9, 2, 9], [0, 32.4, 0], dark),
  box([9, 9, 1.2], [0, 28.4, -4.6], dark),
  box([1, 14, 1], [5.8, 20.5, 5.5], bow),
  box([0.3, 13, 0.3], [5.8, 20.5, 4.7], hex(0xe8e0d0)),
];

const raiderParts = () => {
  const cloak = hex(0x5a1e24);
  const dark = hex(0x2a1618);
  const gold = hex(0xf0c040);
  const ash = hex(0x6a5a58);
  return [
    limb([5, 11, 5], [-2.8, 11, 0], dark, { swing: 1, role: 'leg' }),
    limb([5, 11, 5], [2.8, 11, 0], dark, { swing: -1, role: 'leg' }),
    box([11, 13, 6], [0, 17.5, 0], cloak),
    box([12, 2, 6.8], [0, 14, 0], gold),
    box([13, 3, 8], [0, 24, 0], gold),
    limb([4.5, 12, 4.5], [-7.7, 23, 0], ash, { swing: -1, role: 'arm' }),
    limb([4.5, 12, 4.5], [7.7, 23, 0], ash, { swing: 1, role: 'arm' }),
    box([8, 9, 8], [0, 29, 0], ash),
    box([8.8, 9.6, 1], [0, 29, 4.4], gold),
    box([2.4, 0.9, 0.6], [-2, 30, 5.1], hex(0xff6a1a), { glow: 1 }),
    box([2.4, 0.9, 0.6], [2, 30, 5.1], hex(0xff6a1a), { glow: 1 }),
    box([1.6, 6, 1.6], [-4.4, 36, 0], gold),
    box([1.6, 6, 1.6], [4.4, 36, 0], gold),
    box([8.6, 1.6, 8.6], [0, 34, 0], dark),
    box([1.6, 12, 1.6], [9.4, 19, 5], hex(0x7a5a3a)),
    box([3.4, 3.4, 3.4], [9.4, 26, 5], gold),
  ];
};

const skimmerParts = () => [
  box([10, 8, 12], [0, 17, 0], hex(0x6b1a14)),
  box([8, 3, 8], [0, 22, 0], hex(0xd8481a), { glow: 0.6 }),
  box([6, 5, 5], [0, 17, 8.5], hex(0x4e120e)),
  box([1.4, 1.4, 0.6], [-1.6, 18, 11.2], hex(0xffc24a), { glow: 1 }),
  box([1.4, 1.4, 0.6], [1.6, 18, 11.2], hex(0xffc24a), { glow: 1 }),
  limb([2, 14, 2], [-4, 14, 4], hex(0x3a0e0b), { swing: 1, role: 'leg' }),
  limb([2, 14, 2], [4, 14, 4], hex(0x3a0e0b), { swing: -1, role: 'leg' }),
  limb([2, 14, 2], [-4, 14, -4], hex(0x3a0e0b), { swing: -1, role: 'leg' }),
  limb([2, 14, 2], [4, 14, -4], hex(0x3a0e0b), { swing: 1, role: 'leg' }),
];

/* ------------------------------------------------------------------ registry */

const pingPong = (t, speed, len, offset) => {
  const u = (((t * speed + offset) % (2 * len)) + 2 * len) % (2 * len);
  return u < len ? { d: u, dir: 1 } : { d: 2 * len - u, dir: -1 };
};
const smooth = (x) => x * x * (3 - 2 * x);

function actor(list, { name, line, kind = 'friendly', r = 0.9, h = 1, pick = true }, fn) {
  const A = { name, line, kind, r, h, pick, hitT: -99, flash: 0, t: 0, pos: [0, 0, 0], fn };
  list.push(A);
  return A;
}

/** Creates every creature for a world. Each is { name, line, pos, r, h, draw(t, push) }. */
export function createActors(world) {
  const list = [];
  const quiet = { pick: false };
  if (world === 'overworld') {
    const lines = [
      'Nice day for a stroll down the road.',
      'Have you seen the Forge? The projects are good.',
      'I hear this developer writes tests first.',
      'Hmm! Fresh bread at the market today.',
      'Careful: the blacksmith is hammering.',
      'Welcome to the village, traveller.',
      'The Saathi project talks in many languages.',
      'Take a look at the Inventory, it is well stocked.',
    ];
    const lanes = [
      { x: 29.8, z0: 16, z1: 62, speed: 1.0, off: 0, i: 0 },
      { x: 34.4, z0: 18, z1: 70, speed: 0.9, off: 20, i: 1 },
      { x: 30.2, z0: 56, z1: 112, speed: 1.1, off: 7, i: 2 },
      { x: 34.0, z0: 62, z1: 120, speed: 1.0, off: 31, i: 3 },
      { x: 29.9, z0: 108, z1: 160, speed: 0.95, off: 12, i: 4 },
      { x: 34.3, z0: 104, z1: 158, speed: 1.15, off: 40, i: 5 },
      { x: 30.0, z0: 150, z1: 190, speed: 1.0, off: 3, i: 6 },
      { x: 34.2, z0: 148, z1: 188, speed: 0.9, off: 28, i: 7 },
    ];
    for (const l of lanes) {
      const parts = humanoidParts({
        skin: SKINS[l.i % 4],
        top: TOPS[l.i % 6],
        legs: hex(0x3a3340),
        hair: l.i % 3 === 0 ? null : hex(0x3b2a1e),
        hat: l.i % 4 === 1 ? 'straw' : l.i % 4 === 3 ? 'hood' : l.i % 4 === 2 ? 'cap' : null,
        robe: l.i % 3 === 0 ? TOPS[(l.i + 2) % 6] : null,
        scarf: l.i % 2 ? hex(0xc23a2a) : null,
        pack: l.i % 4 === 2 ? hex(0x6a4a2a) : null,
        beard: l.i === 4 ? hex(0xdddddd) : null,
      });
      const len = l.z1 - l.z0;
      actor(list, { name: l.i === 4 ? 'Village Elder' : 'Townsfolk', line: lines[l.i % lines.length], r: 0.8, h: 1 }, (t) => {
        const { d, dir } = pingPong(t, l.speed, len, l.off);
        drawParts(pushRef, parts, baseOf(l.x + Math.sin(t * 0.6 + l.i) * 0.25, GY, l.z0 + d, dir > 0 ? 0 : PI), t * l.speed * 5.2, 0.7);
      });
    }
    const smith = humanoidParts({ skin: SKINS[2], top: hex(0x3a2a24), legs: hex(0x2a2428), hair: hex(0x1e1410), apron: hex(0x6a4a2a) });
    actor(list, { name: 'Blacksmith', line: 'Strong projects need strong tests. Mind the lava!', r: 0.9 }, (t) =>
      drawParts(pushRef, smith, baseOf(23.2, GY, 99.6, -PI / 2), 0, 0, 0.5 + 0.5 * Math.sin(t * 5)),
    );
    [[40.5, 66.8], [40.5, 74.8], [23.5, 69.5], [47.5, 82]].forEach(([x, z], i) => {
      const p = humanoidParts({ skin: SKINS[(i + 1) % 4], top: TOPS[(i + 2) % 6], legs: hex(0x40384a), hair: hex(0x2a1c14), hat: i === 1 ? 'straw' : null, apron: hex(0xe8e0d0) });
      actor(list, { name: 'Merchant', line: ['Fresh wheat, honest prices!', 'Everything here is verified, like this portfolio.', 'Take a look, no pressure.', 'Best barrels in the valley.'][i], r: 0.8 }, (t) =>
        drawParts(pushRef, p, baseOf(x, GY, z, x > 32 ? -PI / 2 : PI / 2), t * 2 + i, 0.15, Math.max(0, Math.sin(t * 1.3 + i * 2)) * 0.6),
      );
    });
    [[15.5, 121, 137, 0.5, 0], [21.5, 123, 135, 0.45, 9]].forEach(([x, z0, z1, sp, off], i) => {
      const p = humanoidParts({ skin: SKINS[i], top: hex(0x4f7a3a), legs: hex(0x3a3340), hat: 'straw' });
      actor(list, { name: 'Farmer', line: 'The crops are coming in nicely.', r: 0.8 }, (t) => {
        const { d, dir } = pingPong(t, sp, z1 - z0, off);
        drawParts(pushRef, p, baseOf(x, GY, z0 + d, dir > 0 ? 0 : PI), t * sp * 5.2, 0.55);
      });
    });
    // children chase each other near the well
    for (let i = 0; i < 2; i++) {
      const p = humanoidParts({ skin: SKINS[i + 2], top: TOPS[i + 3], legs: hex(0x3a3340), hair: hex(0x2a1c14) }).map((q) => ({ ...q, s: q.s.map((v) => v * 0.62), p: q.p.map((v) => v * 0.62), c: q.c.map((v) => v * 0.62) }));
      actor(list, { name: 'Child', line: 'Tag! You are it!', r: 0.55, h: 0.6 }, (t) => {
        const a = t * 0.9 + i * PI;
        const x = 31.5 + Math.cos(a) * 6.5;
        const z = 52 + Math.sin(a) * 5;
        // stay clear of the camera lane
        drawParts(pushRef, p, baseOf(x > 29.2 && x < 34.8 ? (x < 32 ? 29.2 : 34.8) : x, GY, z, Math.atan2(-Math.sin(a), Math.cos(a))), t * 9, 0.9);
      });
    }
    // gathering around the campfire at the end of the road
    [[29.2, 197, PI / 2, 0], [34.8, 198, -PI / 2, 1], [31, 200.6, PI + 0.4, 2], [33.4, 200.3, PI - 0.4, 3]].forEach(([x, z, yaw, i]) => {
      const p = humanoidParts({ skin: SKINS[i], top: TOPS[(i + 1) % 6], legs: hex(0x3a3340), hair: i % 2 ? hex(0x3b2a1e) : null, scarf: hex(0xc23a2a), robe: i === 3 ? TOPS[4] : null });
      actor(list, { name: i === 2 ? 'Storyteller' : 'Townsfolk', line: i === 2 ? 'Once, a student built a whole world with code...' : 'Come, warm yourself by the fire.', r: 0.8 }, (t) =>
        drawParts(pushRef, p, baseOf(x, GY, z, yaw), 0, 0, Math.max(0, Math.sin(t * 0.8 + i)) * 0.4),
      );
    });
    // stone sentinels guard the road
    [[27.4, 20, 44, 0.35, 0], [37.1, 126, 150, 0.3, 5]].forEach(([x, z0, z1, sp, off]) => {
      const parts = sentinelParts();
      actor(list, { name: 'Stone Sentinel', line: 'I keep the road safe. Here, take a lantern.', r: 1.3, h: 1.6 }, (t) => {
        const { d, dir } = pingPong(t, sp, z1 - z0, off);
        const gift = cur && (t - cur.hitT) < 1.4 && (t - cur.hitT) >= 0 ? -1.6 : 0;
        drawParts(pushRef, parts, baseOf(x, GY, z0 + d, dir > 0 ? 0 : PI), t * sp * 4, 0.45, 0, (part) => (part.role === 'arm' && part.swing > 0 ? gift : 0));
      });
    });
    // woolly sheep and spotted cattle in the pen
    for (let i = 0; i < 5; i++) {
      const parts = quadParts({ wool: hex(i % 4 === 3 ? 0x6a5a4a : 0xece8e0), face: hex(0x3a3028), leg: hex(0x3a3028), size: 1.05 });
      const a = 0.17 + i * 0.07;
      actor(list, { name: 'Woolly', line: 'Baaa.', r: 0.9, h: 0.7 }, (t) => {
        const px = 21 + Math.sin(t * a + i * 1.7) * 4.2;
        const pz = 166 + Math.sin(t * a * 1.3 + i * 2.3) * 3.4;
        const vx = Math.cos(t * a + i * 1.7) * 4.2 * a;
        const vz = Math.cos(t * a * 1.3 + i * 2.3) * 3.4 * a * 1.3;
        drawParts(pushRef, parts, baseOf(px, GY, pz, Math.atan2(vx, vz)), t * 4 * (0.4 + Math.hypot(vx, vz)), 0.5);
      });
    }
    for (let i = 0; i < 2; i++) {
      const parts = quadParts({ wool: hex(i ? 0x6a4a34 : 0xf0ebe2), face: hex(i ? 0x4a3226 : 0xe6dfd2), leg: hex(0x5a4a3a), size: 1.25, spots: hex(i ? 0xf0ebe2 : 0x4a3a30), horns: hex(0xe8e0c8) });
      const a = 0.12 + i * 0.05;
      actor(list, { name: 'Spotted Cow', line: 'Mooo.', r: 1.1, h: 0.9 }, (t) => {
        const px = 23 + Math.sin(t * a + i * 3) * 2.6;
        const pz = 168 - i * 4 + Math.sin(t * a * 1.4 + i) * 1.8;
        const vx = Math.cos(t * a + i * 3) * 2.6 * a;
        const vz = Math.cos(t * a * 1.4 + i) * 1.8 * a * 1.4;
        drawParts(pushRef, parts, baseOf(px, GY, pz, Math.atan2(vx, vz)), t * 3 * (0.4 + Math.hypot(vx, vz) * 3), 0.4);
      });
    }
    // peepers
    [[26, 60], [38, 60], [27, 114], [26, 142], [38, 150]].forEach(([x, z], i) => {
      const parts = birdParts(i % 2 ? hex(0xf4efe4) : hex(0xb5703a), hex(0xe8a53a));
      actor(list, { name: 'Peeper', line: 'Peep peep!', r: 0.5, h: 0.4 }, (t) => {
        const a = t * 0.5 + i * 2;
        const hop = Math.abs(Math.sin(t * 5 + i)) * 0.12;
        drawParts(pushRef, parts, baseOf(x + Math.sin(a) * 1.6, GY + hop, z + Math.cos(a) * 1.4, Math.atan2(Math.cos(a), -Math.sin(a) * 0.8)), t * 8 + i, 0.5);
      });
    });
    // whiskered cats near the houses, lazing in between walks
    [[26.4, 30, 0xd98a3a, 0xf4e8d0], [37.6, 86, 0x2a2428, 0x8a8490], [26.6, 154, 0xe8e2d6, 0xd8b8a0]].forEach(([x, z, fur, belly], i) => {
      const parts = catParts(hex(fur), hex(belly), hex(i === 1 ? 0xffe08a : 0x3a6a3a));
      actor(list, { name: 'Whisker the Cat', line: 'Purrr...', r: 0.6, h: 0.35 }, (t) => {
        const cyc = (t * 0.12 + i * 0.37) % 1;
        const walking = cyc < 0.45;
        const a = t * 0.7 + i * 2;
        const px = x + (walking ? Math.sin(a) * 1.4 : Math.sin(Math.floor(t * 0.12 + i * 0.37) * 2) * 1.4);
        const pz = z + (walking ? Math.cos(a * 0.8) * 1.6 : Math.cos(Math.floor(t * 0.12 + i * 0.37) * 2.7) * 1.6);
        const yaw = Math.atan2(Math.cos(a), -Math.sin(a) * 0.8);
        // sitting cats lower their body a touch and stop moving their legs
        drawParts(pushRef, parts, baseOf(walking ? px : x, GY - (walking ? 0 : 0.08), walking ? pz : z, yaw), walking ? t * 7 : 0, walking ? 0.6 : 0);
      });
    });
    // skylarks circle above the village
    for (let i = 0; i < 6; i++) {
      const body = hex(i % 2 ? 0x4a7ac2 : 0xc24a4a);
      const parts = [
        box([4, 4, 8], [0, 0, 0], body),
        box([3, 3, 3], [0, 1, 4.6], body),
        box([1.4, 1, 2], [0, 0.6, 6.6], hex(0xe8a53a)),
        box([1, 1, 5], [0, 0, -6], hex(0xf4efe4)),
      ];
      const wingL = { s: [7 * U, 0.6 * U, 4 * U], p: [-2 * U, 1.8 * U, 0], c: [-3.5 * U, 0, 0], col: hex(0xf4efe4) };
      const wingR = { s: [7 * U, 0.6 * U, 4 * U], p: [2 * U, 1.8 * U, 0], c: [3.5 * U, 0, 0], col: hex(0xf4efe4) };
      actor(list, { name: 'Skylark', line: 'Tweet!', r: 0.6, h: 0 }, (t) => {
        const a = t * (0.32 + i * 0.03) + i * 1.1;
        const cx = 32 + Math.sin(i * 2.3) * 8;
        const cz = 20 + i * 30 + Math.sin(t * 0.1 + i) * 6;
        const x = cx + Math.cos(a) * 11;
        const z = cz + Math.sin(a) * 11;
        const y = GY + 11 + Math.sin(a * 1.6 + i) * 1.5;
        const base = baseOf(x, y, z, Math.atan2(-Math.sin(a), Math.cos(a)));
        for (const p of parts) pushPart(pushRef, base, p, Math.sin(a * 3) * 0.1);
        const flap = Math.sin(t * 11 + i) * 0.9;
        pushPart(pushRef, base, wingL, 0, 0, flap);
        pushPart(pushRef, base, wingR, 0, 0, -flap);
      });
    }
    // windmill sails
    actor(list, quietOpts(quiet, 'Windmill'), (t) => {
      const hubX = 40.2, hubY = GY + 9.5, hubZ = 156;
      const rot2 = t * 0.55;
      for (let k = 0; k < 4; k++) {
        const ang = rot2 + (k * PI) / 2;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        for (const [len, w, thick, off, col] of [[7.6, 0.35, 0.35, 0, hex(0x6a4a2a)], [5.6, 0.12, 1.8, 0.6, hex(0xe6dfcf)]]) {
          const m = pushRef.next();
          m[0] = w; m[1] = 0; m[2] = 0; m[3] = 0;
          m[4] = 0; m[5] = ca * len; m[6] = sa * len; m[7] = 0;
          m[8] = 0; m[9] = -sa * thick; m[10] = ca * thick; m[11] = 0;
          m[12] = hubX - off * 0.3; m[13] = hubY + ca * (len * 0.5 + 0.2); m[14] = hubZ + sa * (len * 0.5 + 0.2); m[15] = 1;
          const c = pushRef.color();
          c[0] = col[0]; c[1] = col[1]; c[2] = col[2]; c[3] = 0;
        }
      }
      const hub = pushRef.next();
      hub.fill(0);
      hub[0] = 0.9; hub[5] = 0.9; hub[10] = 0.9; hub[15] = 1; hub[12] = hubX; hub[13] = hubY; hub[14] = hubZ;
      const hc = pushRef.color();
      hc[0] = 0.35; hc[1] = 0.24; hc[2] = 0.14; hc[3] = 0;
    });
    actor(list, quietOpts(quiet, 'Portal'), portalDraw(32, GY + 2.5, 207.4));
  } else {
    // Cinder guards patrol the bridge
    const lanes = [
      { x: 29.6, z0: 18, z1: 66, speed: 0.85, off: 0 },
      { x: 34.6, z0: 22, z1: 64, speed: 0.8, off: 14 },
      { x: 29.7, z0: 60, z1: 120, speed: 0.9, off: 5 },
      { x: 34.5, z0: 66, z1: 118, speed: 0.85, off: 33 },
      { x: 29.6, z0: 112, z1: 176, speed: 0.8, off: 21 },
      { x: 34.6, z0: 120, z1: 180, speed: 0.9, off: 9 },
      { x: 30.0, z0: 170, z1: 200, speed: 0.75, off: 11 },
    ];
    const guardLines = ['Halt. State your business in the fortress.', 'The bridge is safe. The lava is not.', 'Looking for the Forge? Straight ahead.', 'Nobody crosses without a good README.'];
    lanes.forEach((l, i) => {
      const parts = humanoidParts({ skin: hex(0x3a2e2e), top: hex(0x241c1e), legs: hex(0x1a1416), hat: 'helm', glowEyes: hex(0xffa43a) });
      actor(list, { name: 'Cinder Guard', line: guardLines[i % 4], kind: 'hostile', r: 0.8 }, (t) => {
        const { d, dir } = pingPong(t, l.speed, l.z1 - l.z0, l.off);
        drawParts(pushRef, parts, baseOf(l.x, BY, l.z0 + d, dir > 0 ? 0 : PI), t * l.speed * 5.5, 0.6);
      });
    });
    const smith = humanoidParts({ skin: hex(0x3a2e2e), top: hex(0x3a1a14), legs: hex(0x1a1416), glowEyes: hex(0xffa43a), apron: hex(0x5a3a22) });
    actor(list, { name: 'Forge Keeper', line: 'The lava never goes out. Neither do the builds.', kind: 'hostile', r: 0.9 }, (t) =>
      drawParts(pushRef, smith, baseOf(28.2, BY, 100, PI / 2), 0, 0, 0.5 + 0.5 * Math.sin(t * 5)),
    );
    // bone archers: pale and charred, scanning the bridge with bows raised
    const archerSpots = [
      [29.5, 30, 0, 0], [34.7, 52, 1, 1], [29.6, 84, 0, 2], [34.6, 108, 1, 3], [22, 160, 0, 4], [43, 156, 1, 5], [28, 196, 0, 6],
    ];
    archerSpots.forEach(([x, z, charred, i]) => {
      const parts = bonesParts(charred ? hex(0x45403c) : hex(0xe8e4d6), charred ? hex(0x1f1a18) : hex(0xb8b2a0), hex(0x7a5a3a));
      actor(list, { name: charred ? 'Charred Archer' : 'Bone Archer', line: charred ? '*clatter* ...burnt, but still aiming.' : '*clatter* Do not make me draw this bow.', kind: 'hostile', r: 0.7, h: 1.1 }, (t) => {
        const sweep = Math.sin(t * 0.5 + i) * 0.9 + (x > 32 ? -PI / 2 : PI / 2) * 0.5;
        const draw = Math.max(0, Math.sin(t * 0.9 + i * 1.7));
        drawParts(pushRef, parts, baseOf(x, BY, z, sweep + (z > 140 ? PI : 0) * 0), 0, 0, 0, (part) => (part.role === 'arm' && part.swing > 0 ? -1.5 - draw * 0.2 : 0));
      });
    });
    // gilded raiders in horned gold masks
    [[22, 160, 3, 0.5, 0], [43, 152, 2.4, 0.45, 2], [25, 195, 3, 0.4, 4], [40, 192, 2.6, 0.5, 1]].forEach(([cx, cz, rad, sp, off], i) => {
      const parts = raiderParts();
      actor(list, { name: 'Gilded Raider', line: 'Gold? You carry gold? ...No? Move along.', kind: 'hostile', r: 0.9, h: 1.1 }, (t) => {
        const a = t * sp + off;
        drawParts(pushRef, parts, baseOf(cx + Math.cos(a) * rad, BY, cz + Math.sin(a) * rad, Math.atan2(-Math.sin(a), Math.cos(a))), t * sp * 9, 0.6);
        void i;
      });
    });
    // lava jellies bounce around
    [[30, 156, 0], [36, 166, 1], [26, 200, 2], [38, 186, 3]].forEach(([x, z, i]) => {
      actor(list, { name: 'Lava Jelly', line: 'Boing!', kind: 'hostile', r: 0.8, h: 0.5 }, (t) => {
        const cyc = (t * 1.1 + i * 0.7) % 1;
        const hop = Math.abs(Math.sin(cyc * PI)) * 0.9;
        const squash = 1 + (cyc < 0.1 || cyc > 0.9 ? -0.25 : 0.12);
        const a = t * 0.3 + i * 2;
        const px = x + Math.cos(a) * 3;
        const pz = z + Math.sin(a) * 3;
        // keep the lane the camera walks on clear
        const cx = px > 29 && px < 35 ? (px < 32 ? 29 : 35) : px;
        const base = baseOf(cx, BY + hop, pz, 0);
        const body = { s: [0.9, 0.9 * squash, 0.9], p: [0, 0.45 * squash, 0], c: [0, 0, 0], col: hex(0xd8481a), glow: 0.7 };
        const core = { s: [0.45, 0.45, 0.45], p: [0, 0.45 * squash, 0], c: [0, 0, 0], col: hex(0xffd060), glow: 1 };
        pushPart(pushRef, base, body);
        pushPart(pushRef, base, core);
        const e1 = { s: [0.1, 0.1, 0.05], p: [-0.2, 0.55 * squash, 0.46], c: [0, 0, 0], col: hex(0x2a0e0a) };
        const e2 = { ...e1, p: [0.2, 0.55 * squash, 0.46] };
        pushPart(pushRef, base, e1);
        pushPart(pushRef, base, e2);
      });
    });
    // magma waders
    [[24.2, 20, 90, 0.9, 0], [40.2, 50, 120, 0.8, 10], [24.4, 110, 190, 1.0, 5], [40.4, 140, 200, 0.85, 25], [25.0, 8, 60, 0.7, 40], [39.4, 90, 150, 0.9, 13]].forEach(([x, z0, z1, sp, off]) => {
      const parts = skimmerParts();
      actor(list, { name: 'Magma Wader', line: 'Glub. The lava is lovely this time of year.', kind: 'hostile', r: 1.0, h: 1.1 }, (t) => {
        const { d, dir } = pingPong(t, sp, z1 - z0, off);
        drawParts(pushRef, parts, baseOf(x, 9.68 + Math.sin(t * 2 + x) * 0.05, z0 + d, dir > 0 ? 0 : PI), t * sp * 4, 0.45);
      });
    });
    // flame spirits hover beside the bridge, trailing orbiting sparks; they lob embers
    [[22.5, 34, 0], [42, 58, 1], [21.5, 126, 2], [43, 96, 3], [21, 176, 4]].forEach(([x, z, i]) => {
      const core = [
        box([9, 4, 9], [0, -3, 0], hex(0xd8481a), { glow: 0.8 }),
        box([7, 4, 7], [0, 0, 0], hex(0xe8841f), { glow: 0.9 }),
        box([5, 4, 5], [0, 3, 0], hex(0xf4b030), { glow: 1 }),
        box([2.6, 3, 2.6], [0, 6, 0], hex(0xffe27a), { glow: 1 }),
        box([1.4, 1.4, 0.6], [-1.2, 0.4, 3.6], hex(0x2a0e0a)),
        box([1.4, 1.4, 0.6], [1.2, 0.4, 3.6], hex(0x2a0e0a)),
      ];
      const rod = { s: [3 * U, 3 * U, 3 * U], p: [0, 0, 0], c: [0, 0, 0], col: hex(0xffd04a), glow: 1 };
      const ember = { s: [0.35, 0.35, 0.35], p: [0, 0, 0], c: [0, 0, 0], col: hex(0xff7a20), glow: 1 };
      actor(list, { name: 'Flame Spirit', line: 'Fwoosh! Stand still, I am only warming you.', kind: 'hostile', r: 1.1, h: 0 }, (t) => {
        const y = 16.5 + Math.sin(t * 1.3 + i) * 0.7 + (i % 2) * 1.5;
        const toward = Math.atan2(32 - x, 0);
        const base = baseOf(x, y, z, toward + Math.sin(t * 0.4 + i) * 0.5);
        for (const p of core) pushRef && pushPart(pushRef, base, p);
        for (let ring = 0; ring < 3; ring++) {
          const rad = (6 + ring * 1.8) * U * 1.6;
          const yy = (ring - 1) * 0.55 + Math.sin(t * 2 + ring) * 0.08;
          for (let k = 0; k < 4; k++) {
            const a = t * (ring % 2 ? 1.8 : -1.4) + (k * PI) / 2 + ring;
            rod.p = [Math.cos(a) * rad, yy, Math.sin(a) * rad];
            pushPart(pushRef, base, rod);
          }
        }
        // a small ember flies off every few seconds
        const f = ((t * 0.35 + i * 0.27) % 1);
        if (f < 0.6) {
          const d = f / 0.6;
          ember.p = [(32 - x) * 0.0 + Math.sin(i) * 0.3, -0.2 - d * 1.5, 0];
          const b2 = { c: 1, s: 0, x: x + (x < 32 ? d * 12 : -d * 12), y: y - d * 2, z: z + d * 4 };
          pushPart(pushRef, b2, ember);
        }
      });
    });
    // ember cages: iron-barred cubes with a small spirit spinning inside
    [[25.5, BY + 0.5, 91.5], [38.5, BY + 0.5, 103.5], [22.5, BY + 0.5, 168]].forEach(([x, y, z], i) => {
      const bars = [];
      const iron = hex(0x2a2428);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) bars.push(box([1.4, 16, 1.4], [sx * 7, 8, sz * 7], iron));
      for (const yy of [0.7, 15.3]) {
        for (const sx of [-1, 1]) bars.push(box([14.4, 1.4, 1.4], [0, yy, sx * 7], iron), box([1.4, 1.4, 14.4], [sx * 7, yy, 0], iron));
      }
      const spin = { s: [4 * U, 4 * U, 4 * U], p: [0, 8 * U, 0], c: [0, 0, 0], col: hex(0xffc24a), glow: 1 };
      const floor = box([13, 1, 13], [0, 0.5, 0], hex(0x3a1a14));
      actor(list, { name: 'Ember Cage', line: 'Something small and hot is spinning in here.', kind: 'hostile', r: 0.9, h: 0.5 }, (t) => {
        const base = baseOf(x, y - 0.5, z, 0);
        pushPart(pushRef, base, floor);
        for (const b of bars) pushPart(pushRef, base, b);
        spin.p = [0, (8 + Math.sin(t * 2 + i) * 1.2) * U, 0];
        pushPart(pushRef, base, spin, t * 2, t * 3, 0);
      });
    });
    // glow wisps drift above the lava
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? 1 : -1;
      const cx = 32 + side * (13 + (i % 3) * 3);
      const cz = 14 + i * 21;
      actor(list, { name: 'Glow Wisp', line: '...', kind: 'hostile', r: 0.8, h: 0 }, (t) => {
        const a = t * (0.25 + (i % 3) * 0.06) + i * 1.9;
        const x = cx + Math.cos(a) * 3.5;
        const z = cz + Math.sin(a * 0.8) * 7;
        const y = 17 + Math.sin(a * 1.7) * 2.2 + (i % 3) * 2;
        const base = baseOf(x, y, z, 0);
        const s = 0.16 + 0.02 * Math.sin(t * 3 + i);
        pushPart(pushRef, base, { s: [s * 2.4, s * 2.4, s * 2.4], p: [0, 0, 0], c: [0, 0, 0], col: hex(0xffc060), glow: 1 }, t, t * 0.7, 0);
      });
    }
    actor(list, quietOpts(quiet, 'Portal'), portalDraw(32, BY + 3.5, 205.5));
  }

  // The writer is handed to draw() each frame; actor closures reach it through this reference.
  const api = list.map((A) => ({
    name: A.name,
    line: A.line,
    kind: A.kind,
    r: A.r,
    h: A.h,
    pick: A.pick,
    get pos() {
      return A.pos;
    },
    poke(t) {
      A.hitT = t;
    },
    draw(t, push) {
      pushRef = push;
      cur = A;
      A.t = t;
      A.fn(t);
      cur = null;
    },
  }));
  return api;
}

let pushRef = null;
const quietOpts = (_q, name) => ({ name, pick: false });

function portalDraw(x, y, z) {
  return (t) => {
    for (let i = 0; i < 3; i++) {
      const m = pushRef.next();
      m.fill(0);
      m[10] = 0.12; m[15] = 1;
      m[12] = x; m[13] = y; m[14] = z + (i - 1) * 0.07;
      m[0] = 3 - i * 0.25;
      m[5] = 3 - i * 0.25;
      const pulse = 0.5 + 0.5 * Math.sin(t * (1.6 + i * 0.7) + i * 2);
      const c = pushRef.color();
      c[0] = 0.32 + 0.3 * pulse; c[1] = 0.05 + 0.1 * pulse; c[2] = 0.6 + 0.35 * pulse; c[3] = 1;
    }
  };
}

/** The per-frame instance buffer the renderer uploads. */
export class InstanceWriter {
  constructor(capacity = 1800) {
    this.data = new Float32Array(capacity * 20);
    this.count = 0;
    this.cap = capacity;
  }

  reset() {
    this.count = 0;
  }

  next() {
    if (this.count >= this.cap) this.count = this.cap - 1;
    return this.data.subarray(this.count * 20, this.count * 20 + 16);
  }

  color() {
    const c = this.data.subarray(this.count * 20 + 16, this.count * 20 + 20);
    this.count++;
    return c;
  }
}
