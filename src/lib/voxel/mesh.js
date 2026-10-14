import { DEF, OPAQUE } from './blocks.js';

export const SLAB = 16;
const STRIDE = 20;

class VertexBuffer {
  constructor() {
    this.cap = 4096;
    this.buf = new ArrayBuffer(this.cap * STRIDE);
    this.f32 = new Float32Array(this.buf);
    this.u8 = new Uint8Array(this.buf);
    this.count = 0;
  }

  push(x, y, z, u, v, tile, face, ao, sky, blk, flags) {
    if (this.count === this.cap) {
      this.cap *= 2;
      const next = new ArrayBuffer(this.cap * STRIDE);
      new Uint8Array(next).set(this.u8);
      this.buf = next;
      this.f32 = new Float32Array(next);
      this.u8 = new Uint8Array(next);
    }
    const f = this.count * 5;
    this.f32[f] = x;
    this.f32[f + 1] = y;
    this.f32[f + 2] = z;
    const b = this.count * STRIDE + 12;
    const u8 = this.u8;
    u8[b] = u;
    u8[b + 1] = v;
    u8[b + 2] = tile;
    u8[b + 3] = face;
    u8[b + 4] = ao;
    u8[b + 5] = sky;
    u8[b + 6] = blk;
    u8[b + 7] = flags;
    this.count++;
  }

  finish() {
    return { data: this.buf.slice(0, this.count * STRIDE), quads: this.count / 4 };
  }
}

// face: normal, tangent 1, tangent 2 (t1 x t2 = normal so corners wind counter-clockwise)
const FACES = [
  { n: [1, 0, 0], t1: [0, 1, 0], t2: [0, 0, 1], uv: (a, b) => [1 - b, a] },
  { n: [-1, 0, 0], t1: [0, 0, 1], t2: [0, 1, 0], uv: (a, b) => [a, b] },
  { n: [0, 1, 0], t1: [0, 0, 1], t2: [1, 0, 0], uv: (a, b) => [b, a] },
  { n: [0, -1, 0], t1: [1, 0, 0], t2: [0, 0, 1], uv: (a, b) => [a, b] },
  { n: [0, 0, 1], t1: [1, 0, 0], t2: [0, 1, 0], uv: (a, b) => [a, b] },
  { n: [0, 0, -1], t1: [0, 1, 0], t2: [1, 0, 0], uv: (a, b) => [1 - b, a] },
];
const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];

/**
 * Builds the triangles for the whole world a few layers at a time. It is a generator: each
 * `yield null` is a good moment to hand control back to the browser, and each yielded object
 * is a finished slab: { slab, solid, glass }.
 */
export function* meshWorld(grid, light, only = null) {
  const { sky, blk } = light;
  const { w, h, l, data } = grid;
  const slabs = Math.ceil(l / SLAB);
  const ao4 = [0, 0, 0, 0];
  const lv = [0, 0, 0, 0];
  const lb = [0, 0, 0, 0];

  const at = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= l ? -1 : (y * l + z) * w + x);

  for (let slab = only ?? 0; slab < (only === null ? slabs : only + 1); slab++) {
    const solid = new VertexBuffer();
    const glass = new VertexBuffer();
    for (let z = slab * SLAB; z < Math.min(l, (slab + 1) * SLAB); z++) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const id = data[(y * l + z) * w + x];
          if (!id) continue;
          const def = DEF[id];
          const here = at(x, y, z);
          const translucent = def.liquid || def.glass;
          const out = translucent ? glass : solid;
          const flags = (def.bright ? 1 : 0) | (def.flow ? 2 : 0) | (def.cut ? 4 : 0) | (def.liquid ? 8 : 0) | (def.flow === 2 ? 16 : 0);

          if (def.plant) {
            const lsky = sky[here];
            const lblk = blk[here];
            const quads = [[0.1, 0.1, 0.9, 0.9], [0.9, 0.1, 0.1, 0.9]];
            for (const [x0, z0, x1, z1] of quads) {
              const order = [[x0, 0, z0, 0, 0], [x1, 0, z1, 1, 0], [x1, 1, z1, 1, 1], [x0, 1, z0, 0, 1]];
              for (const side of [0, 1]) {
                const seq = side ? [order[1], order[0], order[3], order[2]] : order;
                for (const [px, py, pz, u, v] of seq) out.push(x + px, y + py, z + pz, u, v, def.side, 2, 3, lsky, lblk, flags);
              }
            }
            continue;
          }

          for (let f = 0; f < 6; f++) {
            const F = FACES[f];
            const nx = x + F.n[0];
            const ny = y + F.n[1];
            const nz = z + F.n[2];
            const ni = at(nx, ny, nz);
            const nid = ni < 0 ? 0 : data[ni];
            if (nid) {
              if (OPAQUE[nid]) continue;
              if (nid === id && (translucent || def.leaf)) continue;
            }
            const tile = f === 2 ? def.top : f === 3 ? def.bottom : def.side;
            const lowerTop = def.liquid && (ny > y ? true : false);
            for (let c = 0; c < 4; c++) {
              const [a, b] = CORNERS[c];
              const sa = a ? 1 : -1;
              const sb = b ? 1 : -1;
              const c0x = nx;
              const c0y = ny;
              const c0z = nz;
              const s1 = at(c0x + sa * F.t1[0], c0y + sa * F.t1[1], c0z + sa * F.t1[2]);
              const s2 = at(c0x + sb * F.t2[0], c0y + sb * F.t2[1], c0z + sb * F.t2[2]);
              const cc = at(c0x + sa * F.t1[0] + sb * F.t2[0], c0y + sa * F.t1[1] + sb * F.t2[1], c0z + sa * F.t1[2] + sb * F.t2[2]);
              const o1 = s1 >= 0 && OPAQUE[data[s1]] ? 1 : 0;
              const o2 = s2 >= 0 && OPAQUE[data[s2]] ? 1 : 0;
              const oc = cc >= 0 && OPAQUE[data[cc]] ? 1 : 0;
              ao4[c] = o1 && o2 ? 0 : 3 - (o1 + o2 + oc);
              let sSum = 0;
              let bSum = 0;
              let cnt = 0;
              for (const cell of [ni, s1, s2, o1 && o2 ? -1 : cc]) {
                if (cell < 0 || OPAQUE[data[cell]]) continue;
                sSum += sky[cell];
                bSum += blk[cell];
                cnt++;
              }
              lv[c] = cnt ? Math.round(sSum / cnt) : 0;
              lb[c] = cnt ? Math.round(bSum / cnt) : 0;
              if (ni >= 0 && cnt === 0) {
                lv[c] = 0;
                lb[c] = 0;
              }
            }
            const flip = ao4[0] + ao4[2] > ao4[1] + ao4[3] ? 1 : 0;
            for (let k = 0; k < 4; k++) {
              const c = (k + flip) % 4;
              const [a, b] = CORNERS[c];
              const px = x + (F.n[0] > 0 ? 1 : 0) + (F.t1[0] ? a : 0) + (F.t2[0] ? b : 0);
              let py = y + (F.n[1] > 0 ? 1 : 0) + (F.t1[1] ? a : 0) + (F.t2[1] ? b : 0);
              const pz = z + (F.n[2] > 0 ? 1 : 0) + (F.t1[2] ? a : 0) + (F.t2[2] ? b : 0);
              if (def.liquid) {
                const above = at(x, y + 1, z);
                const aboveLiquid = above >= 0 && data[above] === id;
                if (!aboveLiquid && py === y + 1) py = y + 0.88;
              }
              const [u, v] = F.uv(a, b);
              out.push(px, py, pz, u, v, tile, f, ao4[c], lv[c], lb[c], flags);
            }
            void lowerTop;
          }
        }
      }
      yield null;
    }
    yield { slab, solid: solid.finish(), glass: glass.finish() };
  }
}
