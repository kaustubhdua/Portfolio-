import { BY, GY } from './worlds.js';

/**
 * Original blocky characters and creatures, each built from a handful of coloured boxes and
 * animated from the clock alone (no per-actor state), so they are cheap and always in step.
 * Every instance is 20 floats: a 4x4 model matrix and an rgb colour plus an emissive amount.
 */
const U = 1 / 16;
const TAU = Math.PI * 2;

const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];

// model = Base(translation + yaw) * Part(pivot, swing about X, centre offset, size)
function pushPart(push, base, part, angle, bob = 0) {
  const [sx, sy, sz] = part.s;
  const [px, py, pz] = part.p;
  const [, cy, cz] = part.c;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  // local columns
  const l1y = ca * sy;
  const l1z = sa * sy;
  const l2y = -sa * sz;
  const l2z = ca * sz;
  const l3x = px;
  const l3y = py + cy * ca - cz * sa + bob;
  const l3z = pz + cy * sa + cz * ca;
  const { c, s: sn, x, y, z } = base;
  // Base rotation: ex=(c,0,-s) ey=(0,1,0) ez=(s,0,c)
  const m = push.next();
  m[0] = c * sx; m[1] = 0; m[2] = -sn * sx; m[3] = 0;
  m[4] = sn * l1z; m[5] = l1y; m[6] = c * l1z; m[7] = 0;
  m[8] = sn * l2z * 0 + sn * l2z; m[9] = l2y; m[10] = c * l2z; m[11] = 0;
  // second column used a y/z mix; fix x components for ey and ez of the local frame
  m[4] = sn * l1z; m[6] = c * l1z;
  m[8] = sn * l2z; m[10] = c * l2z;
  m[12] = c * l3x + sn * l3z + x;
  m[13] = l3y + y;
  m[14] = -sn * l3x + c * l3z + z;
  m[15] = 1;
  const col = push.color();
  col[0] = part.col[0]; col[1] = part.col[1]; col[2] = part.col[2]; col[3] = part.glow ?? 0;
}

const box = (s, p, col, extra = {}) => ({ s: s.map((v) => v * U), p: p.map((v) => v * U), c: [0, 0, 0], col, ...extra });
const limb = (s, p, col, extra = {}) => ({ s: s.map((v) => v * U), p: p.map((v) => v * U), c: [0, (-s[1] / 2) * U, 0], col, ...extra });

function humanoidParts({ skin, top, legs, hair, hat, apron, glowEyes, eye = [0.08, 0.08, 0.1], big }) {
  const parts = [
    limb([4, 12, 4], [-2, 12, 0], legs, { swing: 1, role: 'leg' }),
    limb([4, 12, 4], [2, 12, 0], legs, { swing: -1, role: 'leg' }),
    box([8, 12, 4], [0, 18, 0], top),
    limb([4, 12, 4], [-6, 24, 0], top, { swing: -1, role: 'arm' }),
    limb([4, 12, 4], [6, 24, 0], top, { swing: 1, role: 'arm' }),
    box([8, 8, 8], [0, 28, 0], skin),
    box([1.8, 1.8, 0.5], [-2, 28.5, 4.2], glowEyes ? glowEyes : eye, glowEyes ? { glow: 1 } : {}),
    box([1.8, 1.8, 0.5], [2, 28.5, 4.2], glowEyes ? glowEyes : eye, glowEyes ? { glow: 1 } : {}),
  ];
  if (hair) {
    parts.push(box([8.6, 2.4, 8.6], [0, 32, 0], hair));
    parts.push(box([8.6, 6, 1.4], [0, 29.4, -4.2], hair));
  }
  if (hat === 'straw') parts.push(box([15, 1, 15], [0, 32.4, 0], hex(0xd9b44a)), box([8.6, 3, 8.6], [0, 33.4, 0], hex(0xd9b44a)));
  if (hat === 'hood') parts.push(box([9, 9, 9], [0, 28.4, -0.4], top), box([5, 2, 0.6], [0, 24.6, 4.4], skin));
  if (hat === 'helm') parts.push(box([9, 4, 9], [0, 31.4, 0], hex(0x1a1418)), box([2, 5, 2], [0, 34.4, 0], hex(0x7a1d12), { glow: 0.4 }));
  if (apron) parts.push(box([8.4, 10, 0.8], [0, 17, 2.4], apron));
  if (big) parts.push(box([2.4, 4, 2], [0, 27, 4.8], skin));
  return parts;
}

const SKINS = [0xe0b394, 0xc58c64, 0x8d5a3b, 0xf0c8a8].map(hex);
const TOPS = [0x7b4a2d, 0x3b6e8f, 0x8f3b3b, 0x4f7a3a, 0x5a4a8a, 0xb88a3a].map(hex);

const quadParts = ({ wool, face, leg, size = 1, eyes }) => {
  const k = size;
  const L = (x, z) => limb([3 * k, 6 * k, 3 * k], [x * k, 6 * k, z * k], leg, { swing: x * z > 0 ? 1 : -1, role: 'leg' });
  return [
    box([12 * k, 9 * k, 16 * k], [0, 11 * k, 0], wool),
    box([6 * k, 6 * k, 6 * k], [0, 14 * k, 10 * k], face),
    box([6.4 * k, 2 * k, 6.4 * k], [0, 17.4 * k, 9.4 * k], wool),
    box([1.2 * k, 1.2 * k, 0.5 * k], [-1.6 * k, 14.6 * k, 13.2 * k], eyes ?? [0.05, 0.05, 0.06]),
    box([1.2 * k, 1.2 * k, 0.5 * k], [1.6 * k, 14.6 * k, 13.2 * k], eyes ?? [0.05, 0.05, 0.06]),
    L(-3, 5), L(3, 5), L(-3, -5), L(3, -5),
  ];
};

const birdParts = (body, beak) => [
  box([5, 5, 7], [0, 6, 0], body),
  box([3.4, 4, 3.4], [0, 10, 3.6], body),
  box([2, 1.4, 2], [0, 9.6, 5.8], beak),
  box([2, 2, 0.8], [0, 8, 6.9 - 0.6], hex(0xc23a2a)),
  box([0.8, 3, 5], [-3, 7, 0], body),
  box([0.8, 3, 5], [3, 7, 0], body),
  limb([1, 4, 1], [-1.2, 4, 0], beak, { swing: 1, role: 'leg' }),
  limb([1, 4, 1], [1.2, 4, 0], beak, { swing: -1, role: 'leg' }),
];

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

/** Walks one body part list. `phase` drives limb swing, `bob` lifts the whole body. */
function drawParts(push, parts, base, phase, amp, hammer = 0) {
  for (const part of parts) {
    let a = 0;
    if (part.role === 'leg') a = part.swing * Math.sin(phase) * amp;
    else if (part.role === 'arm') a = part.swing * Math.sin(phase) * amp * 0.8 - hammer * (part.swing > 0 ? 1.6 : 0);
    pushPart(push, base, part, a);
  }
}

const baseOf = (x, y, z, yaw) => ({ c: Math.cos(yaw), s: Math.sin(yaw), x, y, z });

function pingPong(t, speed, len, offset) {
  const u = (((t * speed + offset) % (2 * len)) + 2 * len) % (2 * len);
  return u < len ? { d: u, dir: 1 } : { d: 2 * len - u, dir: -1 };
}

/** Creates every actor for a world. Each has update(t, push). */
export function createActors(world) {
  const actors = [];
  if (world === 'overworld') {
    const lanes = [
      { x: 29.8, z0: 16, z1: 62, speed: 1.0, off: 0, dir: 1, i: 0 },
      { x: 34.4, z0: 18, z1: 70, speed: 0.9, off: 20, dir: -1, i: 1 },
      { x: 30.2, z0: 56, z1: 112, speed: 1.1, off: 7, dir: -1, i: 2 },
      { x: 34.0, z0: 62, z1: 120, speed: 1.0, off: 31, dir: 1, i: 3 },
      { x: 29.9, z0: 108, z1: 160, speed: 0.95, off: 12, dir: 1, i: 4 },
      { x: 34.3, z0: 104, z1: 158, speed: 1.15, off: 40, dir: -1, i: 5 },
      { x: 30.0, z0: 150, z1: 190, speed: 1.0, off: 3, dir: -1, i: 6 },
      { x: 34.2, z0: 148, z1: 188, speed: 0.9, off: 28, dir: 1, i: 7 },
    ];
    for (const l of lanes) {
      const parts = humanoidParts({
        skin: SKINS[l.i % SKINS.length],
        top: TOPS[l.i % TOPS.length],
        legs: hex(0x3a3340),
        hair: l.i % 3 === 0 ? null : hex(0x3b2a1e),
        hat: l.i % 4 === 1 ? 'straw' : l.i % 4 === 3 ? 'hood' : null,
        big: false,
      });
      const len = l.z1 - l.z0;
      actors.push((t, push) => {
        const { d, dir } = pingPong(t, l.speed, len, l.off);
        const z = l.z0 + d;
        const facing = dir * (l.dir || 1);
        const zz = facing > 0 ? z : z;
        const yaw = dir > 0 ? 0 : Math.PI;
        const ph = t * l.speed * 5.2;
        const sway = Math.sin(t * 0.6 + l.i) * 0.25;
        drawParts(push, parts, baseOf(l.x + sway, GY, zz, yaw), ph, 0.7);
      });
    }
    // blacksmith hammering at the anvil
    const smith = humanoidParts({ skin: SKINS[2], top: hex(0x3a2a24), legs: hex(0x2a2428), hair: hex(0x1e1410), apron: hex(0x6a4a2a), big: false });
    actors.push((t, push) => drawParts(push, smith, baseOf(23.2, GY, 99.6, -Math.PI / 2), 0, 0, 0.5 + 0.5 * Math.sin(t * 5)));
    // market vendors
    const vendors = [[40.5, 66.8], [40.5, 74.8], [23.5, 69.5], [47.5, 82]];
    vendors.forEach(([x, z], i) => {
      const p = humanoidParts({ skin: SKINS[(i + 1) % 4], top: TOPS[(i + 2) % 6], legs: hex(0x40384a), hair: hex(0x2a1c14), hat: i === 1 ? 'straw' : null, apron: hex(0xe8e0d0) });
      actors.push((t, push) => drawParts(push, p, baseOf(x, GY, z, x > 32 ? -Math.PI / 2 : Math.PI / 2), t * 2 + i, 0.15, Math.max(0, Math.sin(t * 1.3 + i * 2)) * 0.6));
    });
    // farmers walk the crop rows
    [[15.5, 121, 137, 0.5, 0], [21.5, 123, 135, 0.45, 9]].forEach(([x, z0, z1, sp, off], i) => {
      const p = humanoidParts({ skin: SKINS[i], top: hex(0x4f7a3a), legs: hex(0x3a3340), hat: 'straw' });
      actors.push((t, push) => {
        const { d, dir } = pingPong(t, sp, z1 - z0, off);
        drawParts(push, p, baseOf(x, GY, z0 + d, dir > 0 ? 0 : Math.PI), t * sp * 5.2, 0.55);
      });
    });
    // woolly sheep wander in the pen
    for (let i = 0; i < 5; i++) {
      const parts = quadParts({ wool: hex(i % 4 === 3 ? 0x6a5a4a : 0xece8e0), face: hex(0x3a3028), leg: hex(0x3a3028), size: 1.05 });
      const a = 0.17 + i * 0.07;
      actors.push((t, push) => {
        const px = 21 + Math.sin(t * a + i * 1.7) * 4.2;
        const pz = 166 + Math.sin(t * a * 1.3 + i * 2.3) * 3.4;
        const vx = Math.cos(t * a + i * 1.7) * 4.2 * a;
        const vz = Math.cos(t * a * 1.3 + i * 2.3) * 3.4 * a * 1.3;
        const moving = Math.hypot(vx, vz);
        drawParts(push, parts, baseOf(px, GY, pz, Math.atan2(vx, vz)), t * 4 * (0.4 + moving), 0.5);
      });
    }
    // peepers hop about near the market and the farm
    [[26, 60], [38, 60], [27, 114], [26, 142], [41, 150]].forEach(([x, z], i) => {
      const parts = birdParts(i % 2 ? hex(0xf4efe4) : hex(0xb5703a), hex(0xe8a53a));
      actors.push((t, push) => {
        const a = t * 0.5 + i * 2;
        const hop = Math.abs(Math.sin(t * 5 + i)) * 0.12;
        const base = baseOf(x + Math.sin(a) * 1.6, GY + hop, z + Math.cos(a * 0.8) * 1.4, Math.atan2(Math.cos(a), -Math.sin(a * 0.8) * 0.8));
        drawParts(push, parts, base, t * 8 + i, 0.5);
      });
    });
    // windmill sails
    const sails = [];
    for (let k = 0; k < 4; k++) {
      sails.push({ k, spar: box([0.35, 7.6, 0.35], [0, 0, 0], hex(0x6a4a2a)), cloth: box([1.8, 5.6, 0.12], [0, 0, 0], hex(0xe6dfcf)) });
    }
    actors.push((t, push) => {
      const hubX = 40.2;
      const hubY = GY + 9.5;
      const hubZ = 156;
      const rot = t * 0.55;
      for (const { k } of sails) {
        const ang = rot + (k * Math.PI) / 2;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        // spar and cloth lie in the y-z plane, rotated about the x axis
        for (const [len, w, thick, off, col, glow] of [[7.6, 0.35, 0.35, 0, hex(0x6a4a2a), 0], [5.6, 0.12, 1.8, 0.6, hex(0xe6dfcf), 0]]) {
          const m = push.next();
          const dy = ca * (len * 0.5 + 0.2);
          const dz = sa * (len * 0.5 + 0.2);
          m[0] = w; m[1] = 0; m[2] = 0; m[3] = 0;
          m[4] = 0; m[5] = ca * len; m[6] = sa * len; m[7] = 0;
          m[8] = 0; m[9] = -sa * thick; m[10] = ca * thick; m[11] = 0;
          m[12] = hubX - off * 0.3;
          m[13] = hubY + dy;
          m[14] = hubZ + dz;
          m[15] = 1;
          const c = push.color();
          c[0] = col[0]; c[1] = col[1]; c[2] = col[2]; c[3] = glow;
        }
      }
      const hub = push.next();
      hub.fill(0);
      hub[0] = 0.9; hub[5] = 0.9; hub[10] = 0.9; hub[15] = 1; hub[12] = hubX; hub[13] = hubY; hub[14] = hubZ;
      const hc = push.color();
      hc[0] = 0.35; hc[1] = 0.24; hc[2] = 0.14; hc[3] = 0;
    });
    actors.push(portalActor(32, GY + 2.5, 207.4));
  } else {
    // Cinder wardens patrol the bridge, glowing eyes and all
    const lanes = [
      { x: 29.6, z0: 14, z1: 66, speed: 0.85, off: 0 },
      { x: 34.6, z0: 18, z1: 64, speed: 0.8, off: 14 },
      { x: 29.7, z0: 60, z1: 120, speed: 0.9, off: 5 },
      { x: 34.5, z0: 66, z1: 118, speed: 0.85, off: 33 },
      { x: 29.6, z0: 112, z1: 176, speed: 0.8, off: 21 },
      { x: 34.6, z0: 120, z1: 180, speed: 0.9, off: 9 },
      { x: 30.0, z0: 170, z1: 200, speed: 0.75, off: 11 },
    ];
    lanes.forEach((l, i) => {
      const parts = humanoidParts({ skin: hex(0x3a2e2e), top: hex(0x241c1e), legs: hex(0x1a1416), hat: 'helm', glowEyes: hex(0xffa43a) });
      actors.push((t, push) => {
        const { d, dir } = pingPong(t, l.speed, l.z1 - l.z0, l.off);
        drawParts(push, parts, baseOf(l.x, BY, l.z0 + d, dir > 0 ? 0 : Math.PI), t * l.speed * 5.5, 0.6);
      });
      void i;
    });
    // a smith warden tends the forge
    const smith = humanoidParts({ skin: hex(0x3a2e2e), top: hex(0x3a1a14), legs: hex(0x1a1416), glowEyes: hex(0xffa43a), apron: hex(0x5a3a22) });
    actors.push((t, push) => drawParts(push, smith, baseOf(28.2, BY, 100, Math.PI / 2 * -1 + Math.PI), 0, 0, 0.5 + 0.5 * Math.sin(t * 5)));
    // magma skimmers wade through the lava on either side of the bridge
    const lava = 9.88;
    [[24.2, 20, 90, 0.9, 0], [40.2, 50, 120, 0.8, 10], [24.4, 110, 190, 1.0, 5], [40.4, 140, 200, 0.85, 25], [25.0, 8, 60, 0.7, 40], [39.4, 90, 150, 0.9, 13]].forEach(([x, z0, z1, sp, off]) => {
      const parts = skimmerParts();
      actors.push((t, push) => {
        const { d, dir } = pingPong(t, sp, z1 - z0, off);
        drawParts(push, parts, baseOf(x, lava - 0.2 + Math.sin(t * 2 + x) * 0.05, z0 + d, dir > 0 ? 0 : Math.PI), t * sp * 4, 0.45);
      });
    });
    // glow wisps drift above the lava
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? 1 : -1;
      const cx = 32 + side * (13 + (i % 3) * 3);
      const cz = 14 + i * 21;
      const parts = [box([2.4, 2.4, 2.4], [0, 0, 0], hex(0xffc060), { glow: 1 }), box([4, 4, 4], [0, 0, 0], hex(0xff7a20), { glow: 0.5 })];
      actors.push((t, push) => {
        const a = t * (0.25 + (i % 3) * 0.06) + i * 1.9;
        const x = cx + Math.cos(a) * 3.5;
        const z = cz + Math.sin(a * 0.8) * 7;
        const y = 17 + Math.sin(a * 1.7) * 2.2 + (i % 3) * 2;
        const m = push.next();
        m.fill(0);
        const s = 0.16 + 0.02 * Math.sin(t * 3 + i);
        const ca = Math.cos(t + i);
        const sa = Math.sin(t + i);
        m[0] = ca * s * 2.4; m[2] = -sa * s * 2.4; m[5] = s * 2.4; m[8] = sa * s * 2.4; m[10] = ca * s * 2.4;
        m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
        const c = push.color();
        c[0] = parts[0].col[0]; c[1] = parts[0].col[1]; c[2] = parts[0].col[2]; c[3] = 1;
      });
    }
    actors.push(portalActor(32, BY + 3.5, 205.5));
  }
  return actors;
}

function portalActor(x, y, z) {
  return (t, push) => {
    for (let i = 0; i < 3; i++) {
      const m = push.next();
      m.fill(0);
      m[0] = 3; m[5] = 3 + (i ? 0 : 0); m[10] = 0.12; m[15] = 1;
      m[12] = x; m[13] = y; m[14] = z + (i - 1) * 0.07;
      m[0] = 3 - i * 0.25;
      m[5] = 3 - i * 0.25;
      const pulse = 0.5 + 0.5 * Math.sin(t * (1.6 + i * 0.7) + i * 2);
      const c = push.color();
      c[0] = 0.32 + 0.3 * pulse; c[1] = 0.05 + 0.1 * pulse; c[2] = 0.6 + 0.35 * pulse; c[3] = 1;
    }
  };
}

/** The per-frame instance buffer the renderer uploads. */
export class InstanceWriter {
  constructor(capacity = 900) {
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
export { TAU };
