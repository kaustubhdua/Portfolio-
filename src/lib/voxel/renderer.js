import { buildTiles, TILE, TILE_COUNT } from './atlas.js';
import { InstanceWriter, createActors, setActorSound, setLookTarget } from './actors.js';
import { sampleCamera, scrollToProgress } from './journey.js';
import { EYE_HEIGHT, createPlayer, stepPlayer } from './explore.js';
import { computeLight } from './light.js';
import { B, DEF, SOLID } from './blocks.js';
import { SLAB, meshWorld } from './mesh.js';
import { ENTITY_FS, ENTITY_VS, PART_FS, PART_VS, SKY_FS, SKY_VS, TERRAIN_FS, TERRAIN_VS } from './shaders.js';
import { SIZE, buildWorld } from './worlds.js';
import { createQuality, startScale, stepQuality } from './quality.js';

const MAX_QUADS = 70000;

const LOOKS = {
  overworld: { nether: 0, fog: [0.74, 0.86, 0.97], near: 55, far: 135, ambient: [0.2, 0.22, 0.27], sky: [0.95, 0.93, 0.86] },
  nether: { nether: 1, fog: [0.24, 0.07, 0.055], near: 34, far: 115, ambient: [0.3, 0.14, 0.12], sky: [0, 0, 0] },
};

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    uniforms[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u: uniforms };
}

const mul = (a, b) => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
};

const perspective = (fovy, aspect, n, f) => {
  const t = 1 / Math.tan(fovy / 2);
  const m = new Float32Array(16);
  m[0] = t / aspect;
  m[5] = t;
  m[10] = (f + n) / (n - f);
  m[11] = -1;
  m[14] = (2 * f * n) / (n - f);
  return m;
};

const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Creates the world renderer. Returns null when WebGL 2 is not available. */
export function createWorldRenderer(canvas, { sections, reduced = false, onContextLost, onProgress, onStep, onEvent, onWorldSound } = {}) {
  setActorSound(onWorldSound ?? null);
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', depth: true });
  if (!gl) return null;

  let terrain;
  let sky;
  let entity;
  let part;
  try {
    terrain = program(gl, TERRAIN_VS, TERRAIN_FS);
    sky = program(gl, SKY_VS, SKY_FS);
    entity = program(gl, ENTITY_VS, ENTITY_FS);
    part = program(gl, PART_VS, PART_FS);
  } catch (err) {
    console.error('Shader error', err);
    return null;
  }

  // textures
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 5, gl.RGBA8, TILE, TILE, TILE_COUNT);
  const tiles = buildTiles();
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, TILE, TILE, TILE_COUNT, gl.RGBA, gl.UNSIGNED_BYTE, tiles);
  gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // shared index buffer for every quad
  const indices = new Uint32Array(MAX_QUADS * 6);
  for (let q = 0; q < MAX_QUADS; q++) {
    const v = q * 4;
    indices.set([v, v + 1, v + 2, v, v + 2, v + 3], q * 6);
  }
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  function makeMeshVao(buffer) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribIPointer(1, 4, gl.UNSIGNED_BYTE, 20, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribIPointer(2, 4, gl.UNSIGNED_BYTE, 20, 16);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bindVertexArray(null);
    return vao;
  }

  // unit cube for entities
  const cubeData = [];
  const faces = [
    [[1, 0, 0], [[0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, -0.5, 0.5]]],
    [[-1, 0, 0], [[-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5]]],
    [[0, 1, 0], [[-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5]]],
    [[0, -1, 0], [[-0.5, -0.5, 0.5], [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5]]],
    [[0, 0, 1], [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]]],
    [[0, 0, -1], [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]]],
  ];
  for (const [n, vs] of faces) for (const k of [0, 1, 2, 0, 2, 3]) cubeData.push(...vs[k], ...n);
  const cubeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData), gl.STATIC_DRAW);
  const instBuffer = gl.createBuffer();
  const writer = new InstanceWriter(2200);
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, writer.data.byteLength, gl.DYNAMIC_DRAW);
  const entityVao = gl.createVertexArray();
  gl.bindVertexArray(entityVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuffer);
  for (let i = 0; i < 5; i++) {
    gl.enableVertexAttribArray(2 + i);
    gl.vertexAttribPointer(2 + i, 4, gl.FLOAT, false, 80, i * 16);
    gl.vertexAttribDivisor(2 + i, 1);
  }
  gl.bindVertexArray(null);
  const emptyVao = gl.createVertexArray();

  // worlds
  const worlds = {};
  let current = 'nether';
  let disposed = false;
  let building = null;

  function ensureWorld(name) {
    if (worlds[name]) return worlds[name];
    const meta = buildWorld(name);
    const light = computeLight(meta.grid, name === 'overworld');
    const w = {
      name,
      meta,
      slabs: [],
      done: false,
      light,
      gen: meshWorld(meta.grid, light),
      broken: [],
      actors: createActors(name),
    };
    worlds[name] = w;
    return w;
  }

  function uploadSlab(w, r) {
    const entry = { z0: r.slab * SLAB, z1: Math.min(SIZE.l, (r.slab + 1) * SLAB), solid: null, glass: null };
    for (const kind of ['solid', 'glass']) {
      const m = r[kind];
      if (!m.quads) continue;
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, m.data, gl.STATIC_DRAW);
      entry[kind] = { buffer, vao: makeMeshVao(buffer), count: Math.min(m.quads, MAX_QUADS) * 6 };
    }
    const old = w.slabs[r.slab];
    for (const kind of ['solid', 'glass']) {
      if (old?.[kind]) {
        gl.deleteBuffer(old[kind].buffer);
        gl.deleteVertexArray(old[kind].vao);
      }
    }
    w.slabs[r.slab] = entry;
  }

  // ---- breaking blocks: a click on bare terrain digs it out, and it grows back a few seconds later
  const debris = [];
  const tileColour = {};
  const colourOf = (id) => {
    if (tileColour[id]) return tileColour[id];
    const tile = DEF[id]?.side ?? 0;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    const base = tile * TILE * TILE * 4;
    for (let i = 0; i < TILE * TILE; i++) {
      if (tiles[base + i * 4 + 3] < 128) continue;
      r += tiles[base + i * 4];
      g += tiles[base + i * 4 + 1];
      b += tiles[base + i * 4 + 2];
      n++;
    }
    return (tileColour[id] = n ? [r / n / 255, g / n / 255, b / n / 255] : [0.5, 0.5, 0.5]);
  };
  const remesh = (w, z) => {
    const slabs = new Set([Math.floor(z / SLAB)]);
    if (z % SLAB === 0) slabs.add(Math.floor(z / SLAB) - 1);
    if (z % SLAB === SLAB - 1) slabs.add(Math.floor(z / SLAB) + 1);
    for (const slab of slabs) {
      if (slab < 0 || slab * SLAB >= SIZE.l) continue;
      for (const r of meshWorld(w.meta.grid, w.light, slab)) if (r) uploadSlab(w, r);
    }
  };
  const relight = (w) => {
    clearTimeout(w.relightTimer);
    w.relightTimer = setTimeout(() => {
      const fresh = computeLight(w.meta.grid, w.name === 'overworld');
      w.light.sky.set(fresh.sky);
      w.light.blk.set(fresh.blk);
      for (const zs of w.dirtySlabs ?? []) remesh(w, zs * SLAB);
      w.dirtySlabs = new Set();
      dirty = true;
      schedule();
    }, 160);
  };
  const touch = (w, x, y, z, id) => {
    w.meta.grid.set(x, y, z, id);
    remesh(w, z);
    (w.dirtySlabs ??= new Set()).add(Math.floor(z / SLAB));
    relight(w);
    dirty = true;
    schedule();
  };
  const fourWays = (base) => [0, 1, 2, 3].map((f) => base + f);
  const STONEISH = new Set([
    B.STONE, B.COBBLE, B.STONE_BRICK, B.NETHERRACK, B.NETHER_BRICK, B.NETHER_FENCE, B.OBSIDIAN, B.BASALT, B.BLACKSTONE, B.GLOWSTONE,
    B.LAMP, B.GLASS, B.ROOF, B.GOLD_BLOCK, B.GILDED, B.STONECUT, B.PANE, B.LANTERN, B.SLAB_COBBLE, B.SLAB_NETHER, B.MOSSY_COBBLE, B.FURNACE, B.ANVIL, B.SPAWNER,
    ...fourWays(B.STAIR_COBBLE), ...fourWays(B.STAIR_NETHER), ...fourWays(B.STAIR_BRICK),
  ]);
  const WOODISH = new Set([
    B.LOG, B.PLANKS, B.SPRUCE_PLANKS, B.SPRUCE_LOG, B.BARREL, B.DOOR, B.CRIMSON_STEM, B.WARPED_STEM, B.HAY, B.FENCE, B.TORCH,
    B.SLAB_PLANKS, B.SLAB_SPRUCE, B.BOOKSHELF, B.CRAFTING, B.LECTERN, B.CARTO, B.FLETCH, ...fourWays(B.STAIR_PLANKS), ...fourWays(B.STAIR_SPRUCE),
    ...fourWays(B.DOOR_LOW), ...fourWays(B.DOOR_UP),
  ]);
  const groundOf = (id) => (STONEISH.has(id) ? 'stone' : WOODISH.has(id) ? 'wood' : 'grass');
  function breakBlock(w, x, y, z) {
    const id = w.meta.grid.get(x, y, z);
    if (!id || y < 2 || x < 1 || x >= SIZE.w - 1 || z < 1 || z >= SIZE.l - 1) return null;
    touch(w, x, y, z, 0);
    canvas.dataset.dug = String(Number(canvas.dataset.dug ?? 0) + 1);
    const col = colourOf(id);
    for (let i = 0; i < 14; i++) {
      debris.push({
        p: [x + 0.2 + Math.random() * 0.6, y + 0.2 + Math.random() * 0.6, z + 0.2 + Math.random() * 0.6],
        v: [(Math.random() - 0.5) * 3, 1.5 + Math.random() * 2.5, (Math.random() - 0.5) * 3],
        life: 0.9 + Math.random() * 0.5,
        c: col.map((v) => v * (0.75 + Math.random() * 0.4)),
        s: 0.07 + Math.random() * 0.08,
      });
    }
    w.broken.push({ x, y, z, id, at: simTime + 7 + Math.random() * 3 });
    return id;
  }


  // ---- break animation: a click starts cracks that grow in ten stages over about half a second, then
  // the block pops out. While walking freely, the block under the crosshair gets a thin black outline.
  let breaking = null;
  let hoverBlock = null;
  const digTime = (id) => (STONEISH.has(id) ? 0.7 : WOODISH.has(id) ? 0.5 : 0.32);
  const mineable = (w, x, y, z) => w.meta.grid.get(x, y, z) && y >= 2 && x >= 1 && x < SIZE.w - 1 && z >= 1 && z < SIZE.l - 1;
  function pickSolid(w, clientX, clientY, reach) {
    if (!pickCam) return null;
    const nx = (clientX / window.innerWidth) * 2 - 1;
    const ny = 1 - (clientY / window.innerHeight) * 2;
    const { pos, r, u, f, tx, ty } = pickCam;
    const d = norm([f[0] + r[0] * nx * tx + u[0] * ny * ty, f[1] + r[1] * nx * tx + u[1] * ny * ty, f[2] + r[2] * nx * tx + u[2] * ny * ty]);
    // march along the ray in small steps; the first solid block is the one hit
    for (let t = 0.3; t < reach; t += 0.05) {
      const x = Math.floor(pos[0] + d[0] * t);
      const y = Math.floor(pos[1] + d[1] * t);
      const z = Math.floor(pos[2] + d[2] * t);
      if (SOLID[w.meta.grid.get(x, y, z)]) return [x, y, z];
    }
    return null;
  }
  function finishBreak() {
    const b = breaking;
    breaking = null;
    if (b && b.w.meta.grid.get(b.x, b.y, b.z) === b.id) breakBlock(b.w, b.x, b.y, b.z);
  }
  const hash3 = (a, b, c) => {
    let h = Math.imul((a * 73856093) ^ (b * 19349663) ^ (c * 83492791), 2654435761);
    h ^= h >>> 13;
    return ((h >>> 0) % 1000) / 1000;
  };
  function pushBox(cx, cy, cz, sx, sy, sz, shade) {
    const m = writer.next();
    m.fill(0);
    m[0] = sx; m[5] = sy; m[10] = sz; m[12] = cx; m[13] = cy; m[14] = cz; m[15] = 1;
    const c = writer.color();
    c[0] = shade; c[1] = shade * 0.9; c[2] = shade * 0.9; c[3] = 0;
  }
  function pushOutline(x, y, z) {
    const e = 0.028;
    for (let a = 0; a < 3; a++) {
      const [b, c] = [0, 1, 2].filter((k) => k !== a);
      for (const sb of [-0.5, 0.5]) {
        for (const sc of [-0.5, 0.5]) {
          const cen = [x + 0.5, y + 0.5, z + 0.5];
          cen[b] += sb * 1.006;
          cen[c] += sc * 1.006;
          const size = [e, e, e];
          size[a] = 1.012 + e;
          pushBox(cen[0], cen[1], cen[2], size[0], size[1], size[2], 0.015);
        }
      }
    }
  }
  /** Dark crack lines laid over the faces; stage 0..9 adds more of them, so the block looks more broken. */
  function pushCracks(x, y, z, stage) {
    const h0 = Math.floor(hash3(x, y, z) * 6);
    for (let i = 0; i <= stage; i++) {
      const f = (i + h0) % 6;
      const ax = f >> 1;
      const sgn = f & 1 ? -1 : 1;
      const [b, c] = [0, 1, 2].filter((k) => k !== ax);
      const along = i % 2 ? b : c;
      const cross = along === b ? c : b;
      const len = 0.3 + hash3(x + i, y, z + i * 3) * 0.55;
      const o1 = (hash3(x, y + i, z) - 0.5) * 0.4;
      const o2 = (hash3(x, y, z + i) - 0.5) * 0.7;
      for (const branch of i >= 3 ? [false, true] : [false]) {
        const size = [0, 0, 0];
        size[ax] = 0.012;
        size[along] = branch ? 0.05 : len;
        size[cross] = branch ? len * 0.5 : 0.05;
        const cen = [x + 0.5, y + 0.5, z + 0.5];
        cen[ax] += sgn * 0.506;
        cen[along] += o1 + (branch ? len * 0.2 : 0);
        cen[cross] += o2;
        pushBox(cen[0], cen[1], cen[2], size[0], size[1], size[2], 0.07);
      }
    }
  }

  let readyResolve;
  const ready = new Promise((res) => (readyResolve = res));
  let firstReady = false;

  function pump() {
    building = null;
    if (disposed) return;
    const order = [current, current === 'nether' ? 'overworld' : 'nether'];
    const w = order.map((n) => worlds[n]).find((x) => x && !x.done);
    if (!w) return;
    const budget = w.name === current ? 9 : 4;
    const start = performance.now();
    while (performance.now() - start < budget) {
      const step = w.gen.next();
      if (step.done) {
        w.done = true;
        if (w.name === current) canvas.dataset.built = 'yes';
        break;
      }
      if (step.value) uploadSlab(w, step.value);
    }
    if (w.name === current) onProgress?.(Math.min(1, w.slabs.filter(Boolean).length / 4));
    if (!firstReady && worlds[current]?.slabs.filter(Boolean).length >= 4) {
      firstReady = true;
      canvas.dataset.state = 'ready';
      readyResolve();
    }
    if (w.name === current) {
      dirty = true;
      schedule();
    }
    building = setTimeout(pump, w.name === current ? 0 : 20);
  }
  const kick = () => {
    if (!building && !disposed) building = setTimeout(pump, 0);
  };

  // camera state
  let progress = 0;
  let target = 0;
  let dive = 0;
  let pointerX = 0;
  let pointerY = 0;
  let px = 0;
  let py = 0;
  let walk = 0;
  let lastStep = 0;
  let bobAmp = 0;
  const cam = {};
  let dirty = true;
  // Draw at up to 1.5x the page's pixels. Phones and weak machines start smaller and rise to that
  // once they show they can keep up (see quality.js).
  const maxScale = Math.min(window.devicePixelRatio || 1, 1.5);
  const quality = createQuality(
    maxScale,
    startScale(maxScale, {
      coarse: window.matchMedia?.('(pointer: coarse)').matches,
      cores: navigator.hardwareConcurrency,
      memory: navigator.deviceMemory,
    }),
  );
  let scale = quality.scale;
  let width = 0;
  let height = 0;
  let slowWindows = 0;
  const frameTimes = [];
  let frames = 0;

  const resize = () => {
    const cw = Math.max(1, window.innerWidth);
    const ch = Math.max(1, window.innerHeight);
    width = Math.max(2, Math.round(cw * scale));
    height = Math.max(2, Math.round(ch * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    dirty = true;
  };

  const readScroll = () => {
    const next = scrollToProgress(sections, window.scrollY, window.innerHeight);
    if (Math.abs(next - target) < 1e-4 && frames > 0) return;
    target = next;
    dirty = true;
    schedule();
  };
  const onPointer = (e) => {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    dirty = true;
    schedule();
  };
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', () => {
    resize();
    readScroll();
  });
  window.addEventListener('pointermove', onPointer, { passive: true });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(readScroll) : null;
  ro?.observe(document.body);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    onContextLost?.();
  });

  const drawSlabs = (w, vp, kind, camPos, look) => {
    const planes = [];
    for (const [s, i] of [[1, 0], [-1, 0], [1, 1], [-1, 1], [1, 2], [-1, 2]]) {
      const row = (j) => [vp[j], vp[4 + j], vp[8 + j], vp[12 + j]];
      const a = row(3);
      const b = row(i);
      planes.push([a[0] + s * b[0], a[1] + s * b[1], a[2] + s * b[2], a[3] + s * b[3]]);
    }
    for (const slab of w.slabs) {
      const mesh = slab?.[kind];
      if (!mesh) continue;
      // distance cull along z, then frustum cull the slab's box
      const nearZ = Math.max(slab.z0 - camPos.z, 0, camPos.z - slab.z1);
      if (nearZ > look.far) continue;
      let visible = true;
      for (const pl of planes) {
        const x = pl[0] > 0 ? SIZE.w : 0;
        const y = pl[1] > 0 ? SIZE.h : 0;
        const z = pl[2] > 0 ? slab.z1 : slab.z0;
        if (pl[0] * x + pl[1] * y + pl[2] * z + pl[3] < 0) {
          visible = false;
          break;
        }
      }
      if (!visible) continue;
      gl.bindVertexArray(mesh.vao);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
    }
  };

  // ---- free roam: walk anywhere in the world with the keyboard, mouse or touch controls
  let exploring = false;
  let player = null;
  let blend = 1;
  let blendFrom = null;
  const exIn = { fx: 0, fz: 0, jump: false, sprint: false };
  const keys = new Set();
  const syncKeys = () => {
    exIn.fx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + touchMove.fx;
    exIn.fz = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + touchMove.fz;
    exIn.sprint = keys.has('ShiftLeft') || keys.has('ShiftRight');
    exIn.jump = keys.has('Space') || touchMove.jump;
  };
  const touchMove = { fx: 0, fz: 0, jump: false };
  const onKeyDown = (e) => {
    if (!exploring) return;
    if (e.code === 'Escape') return;
    if (/^(Key[WASD]|Arrow.*|Space|Shift.*)$/.test(e.code)) {
      e.preventDefault();
      keys.add(e.code);
      syncKeys();
      schedule();
    }
    if (/^Digit[1-4]$/.test(e.code)) hotbar = Number(e.code.slice(5)) - 1;
  };
  const onKeyUp = (e) => {
    if (keys.delete(e.code)) syncKeys();
  };
  // Chromium reports a huge, bogus pair of mouse deltas (the cursor "jumping" to the lock point and
  // back, hundreds of ms apart) around pointer lock, which used to spin a new player round to face a
  // wall or the sky. Ignore the first moments after a lock, drop any single event too large to be a
  // real hand movement, and cap the rest so a genuine flick still feels right.
  let lockedAt = 0;
  const onLockChange = () => {
    lockedAt = performance.now();
  };
  const BOGUS_DELTA = 400;
  const MAX_DELTA = 200;
  const onMouseMove = (e) => {
    if (!exploring || document.pointerLockElement !== canvas) return;
    if (performance.now() - lockedAt < 800) return;
    if (Math.abs(e.movementX) > BOGUS_DELTA || Math.abs(e.movementY) > BOGUS_DELTA) return;
    const dx = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, e.movementX));
    const dy = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, e.movementY));
    player.yaw += dx * 0.0022;
    player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - dy * 0.0022));
  };
  document.addEventListener('pointerlockchange', onLockChange);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  const HOTBAR = [B.PLANKS, B.COBBLE, B.GLASS, B.LAMP];
  let hotbar = 0;

  let pickCam = null;
  let simTime = 0;
  let last = performance.now();
  let raf = 0;

  function frame(now) {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const w = worlds[current];
    const look = LOOKS[current];

    // smooth the scroll into camera progress
    const before = progress;
    if (reduced) progress = target;
    else progress += (target - progress) * (1 - Math.exp(-dt * 4.2));
    const speed = dt > 0 ? Math.abs(progress - before) / dt : 0;
    if (Math.abs(target - progress) < 0.0004) progress = target;
    bobAmp += (Math.min(1, speed * 1.8) - bobAmp) * (1 - Math.exp(-dt * 6));
    if (!reduced) walk += Math.abs(progress - before) * 70;
    const stepIndex = Math.floor(walk / Math.PI);
    if (stepIndex !== lastStep) {
      lastStep = stepIndex;
      if (bobAmp > 0.3) onStep?.(current === 'nether' ? 'stone' : 'grass');
    }
    px += (pointerX - px) * (1 - Math.exp(-dt * 4));
    py += (pointerY - py) * (1 - Math.exp(-dt * 4));
    if (!reduced) simTime += dt;

    if (w && w.slabs.length) {
      sampleCamera(w.meta.stops, progress, cam);
      const bob = Math.sin(walk) * 0.07 * bobAmp;
      const sway = Math.cos(walk * 0.5) * 0.012 * bobAmp;
      const idle = reduced ? 0 : Math.sin(simTime * 0.9) * 0.012;
      const fwdX = Math.sin(cam.yaw);
      const fwdZ = Math.cos(cam.yaw);
      const lurch = dive * 4;
      let pos = [cam.x + fwdX * lurch, cam.y + bob + idle, cam.z + fwdZ * lurch];
      let yaw = cam.yaw + px * 0.05 + sway;
      let pitch = cam.pitch - py * 0.025 + Math.sin(walk) * 0.004 * bobAmp;
      if (exploring && player) {
        const evt = stepPlayer(player, w.meta.grid, exIn, dt);
        if (evt) onEvent?.(evt);
        canvas.dataset.pos = `${player.x.toFixed(1)},${player.y.toFixed(1)},${player.z.toFixed(1)}`;
        const sp = Math.hypot(player.vx, player.vz);
        if (player.onGround) walk += sp * dt * 1.6;
        bobAmp += ((player.onGround ? Math.min(1, sp / 4) : 0) - bobAmp) * Math.min(1, dt * 8);
        const stepNo = Math.floor(walk / Math.PI);
        if (stepNo !== lastStep) {
          lastStep = stepNo;
          if (bobAmp > 0.3) onStep?.(groundOf(w.meta.grid.get(Math.floor(player.x), Math.floor(player.y) - 1, Math.floor(player.z))));
        }
        pos = [player.x, player.y + EYE_HEIGHT + Math.sin(walk) * 0.06 * bobAmp, player.z];
        yaw = player.yaw;
        pitch = player.pitch;
        blend = 0;
        blendFrom = { pos: pos.slice(), yaw, pitch };
      } else if (blend < 1 && blendFrom) {
        // easing back onto the scroll path after exploring
        blend = Math.min(1, blend + dt / 0.9);
        const k = blend * blend * (3 - 2 * blend);
        pos = pos.map((v, i) => blendFrom.pos[i] + (v - blendFrom.pos[i]) * k);
        yaw = blendFrom.yaw + (yaw - blendFrom.yaw) * k;
        pitch = blendFrom.pitch + (pitch - blendFrom.pitch) * k;
      }
      const aspect = width / height;
      const fovy = ((aspect < 1 ? 80 : 64) + dive * 30) * (Math.PI / 180);
      const f = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
      const r0 = norm(cross(f, [0, 1, 0]));
      const u0 = cross(r0, f);
      const roll = sway * 2 + dive * 0.15 * Math.sin(simTime * 12);
      const cr = Math.cos(roll);
      const sr = Math.sin(roll);
      const r = [r0[0] * cr + u0[0] * sr, r0[1] * cr + u0[1] * sr, r0[2] * cr + u0[2] * sr];
      const u = [u0[0] * cr - r0[0] * sr, u0[1] * cr - r0[1] * sr, u0[2] * cr - r0[2] * sr];
      const view = new Float32Array([
        r[0], u[0], -f[0], 0,
        r[1], u[1], -f[1], 0,
        r[2], u[2], -f[2], 0,
        -dot(r, pos), -dot(u, pos), dot(f, pos), 1,
      ]);
      const vp = mul(perspective(fovy, aspect, 0.1, 400), view);
      pickCam = { pos, r, u, f, tx: Math.tan(fovy / 2) * aspect, ty: Math.tan(fovy / 2), vp };
      const camPos = { x: pos[0], y: pos[1], z: pos[2], far: look.far + 8 };

      gl.viewport(0, 0, width, height);
      gl.clearColor(look.fog[0], look.fog[1], look.fog[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // sky
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.useProgram(sky.p);
      gl.uniform3fv(sky.u.uRight, r);
      gl.uniform3fv(sky.u.uUp, u);
      gl.uniform3fv(sky.u.uFwd, f);
      const th = Math.tan(fovy / 2);
      gl.uniform2f(sky.u.uTan, th * aspect, th);
      gl.uniform3f(sky.u.uCam, pos[0], pos[1], pos[2]);
      gl.uniform1f(sky.u.uTime, simTime);
      gl.uniform1f(sky.u.uNether, look.nether);
      gl.uniform3fv(sky.u.uFog, look.fog);
      gl.bindVertexArray(emptyVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // terrain
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.useProgram(terrain.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
      gl.uniform1i(terrain.u.uTex, 0);
      gl.uniformMatrix4fv(terrain.u.uVP, false, vp);
      gl.uniform3f(terrain.u.uCam, pos[0], pos[1], pos[2]);
      gl.uniform1f(terrain.u.uTime, simTime);
      gl.uniform1f(terrain.u.uNether, look.nether);
      gl.uniform3fv(terrain.u.uAmbient, look.ambient);
      gl.uniform3fv(terrain.u.uSkyTint, look.sky);
      gl.uniform1f(terrain.u.uFogNear, look.near);
      gl.uniform1f(terrain.u.uFogFar, look.far);
      gl.uniform3fv(terrain.u.uFog, look.fog);
      gl.uniform1f(terrain.u.uPass, 0);
      drawSlabs(w, vp, 'solid', camPos, look);

      // characters
      writer.reset();
      setLookTarget(pos[0], pos[1], pos[2]);
      // People and animals far beyond the fog are not drawn; they are still stepped now and then so
      // their position stays roughly right for when the camera comes near.
      for (let i = 0; i < w.actors.length; i++) {
        const actor = w.actors[i];
        if (Math.abs(actor.pos[2] - pos[2]) > look.far + 30 && (frames + i) % 20) continue;
        actor.draw(simTime, writer);
      }
      for (let i = w.broken.length - 1; i >= 0; i--) {
        const b = w.broken[i];
        if (simTime >= b.at) {
          const inBody = exploring && player && b.id && Math.abs(b.x + 0.5 - player.x) < 1 && Math.abs(b.z + 0.5 - player.z) < 1 && b.y >= Math.floor(player.y) - 1 && b.y <= Math.floor(player.y) + 2;
          if (inBody) {
            b.at = simTime + 2;
            continue;
          }
          w.broken.splice(i, 1);
          if (!b.id) {
            if (w.meta.grid.get(b.x, b.y, b.z)) touch(w, b.x, b.y, b.z, 0);
          } else if (!w.meta.grid.get(b.x, b.y, b.z)) touch(w, b.x, b.y, b.z, b.id);
        }
      }
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.life -= dt;
        if (d.life <= 0) {
          debris.splice(i, 1);
          continue;
        }
        d.v[1] -= 14 * dt;
        for (let k = 0; k < 3; k++) d.p[k] += d.v[k] * dt;
        if (SOLID[w.meta.grid.get(Math.floor(d.p[0]), Math.floor(d.p[1]), Math.floor(d.p[2]))]) {
          d.p[1] = Math.floor(d.p[1]) + 1.01;
          d.v[0] *= 0.4;
          d.v[1] = 0;
          d.v[2] *= 0.4;
        }
        const m = writer.next();
        m.fill(0);
        m[0] = d.s; m[5] = d.s; m[10] = d.s; m[12] = d.p[0]; m[13] = d.p[1]; m[14] = d.p[2]; m[15] = 1;
        const c = writer.color();
        c[0] = d.c[0]; c[1] = d.c[1]; c[2] = d.c[2]; c[3] = 0;
      }
      if (breaking && (breaking.w !== w || simTime - breaking.t0 >= breaking.dur)) finishBreak();
      hoverBlock = exploring && player ? pickSolid(w, window.innerWidth / 2, window.innerHeight / 2, 6) : null;
      if (breaking) {
        pushCracks(breaking.x, breaking.y, breaking.z, Math.min(9, Math.floor(((simTime - breaking.t0) / breaking.dur) * 10)));
        pushOutline(breaking.x, breaking.y, breaking.z);
      } else if (hoverBlock) pushOutline(hoverBlock[0], hoverBlock[1], hoverBlock[2]);
      gl.useProgram(entity.p);
      gl.disable(gl.CULL_FACE);
      gl.uniformMatrix4fv(entity.u.uVP, false, vp);
      gl.uniform3f(entity.u.uCam, pos[0], pos[1], pos[2]);
      gl.uniform1f(entity.u.uNether, look.nether);
      gl.uniform1f(entity.u.uFogNear, look.near);
      gl.uniform1f(entity.u.uFogFar, look.far);
      gl.uniform1f(entity.u.uTime, simTime);
      gl.uniform3fv(entity.u.uFog, look.fog);
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, writer.data, 0, writer.count * 20);
      gl.bindVertexArray(entityVao);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, writer.count);

      // water, lava and glass
      gl.enable(gl.CULL_FACE);
      gl.useProgram(terrain.p);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      gl.uniform1f(terrain.u.uPass, 1);
      drawSlabs(w, vp, 'glass', camPos, look);
      gl.depthMask(true);

      // floating motes
      if (!reduced) {
        gl.useProgram(part.p);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.depthMask(false);
        gl.uniformMatrix4fv(part.u.uVP, false, vp);
        gl.uniform3f(part.u.uCam, pos[0], pos[1], pos[2]);
        gl.uniform1f(part.u.uTime, simTime);
        gl.uniform1f(part.u.uNether, look.nether);
        gl.uniform1f(part.u.uScale, height);
        gl.bindVertexArray(emptyVao);
        gl.drawArrays(gl.POINTS, 0, 220);
        gl.depthMask(true);
      }
      gl.disable(gl.BLEND);
      frames++;
      canvas.dataset.frames = String(frames);
    }

    // adaptive resolution
    if (!reduced) {
      frameTimes.push(dt * 1000);
      if (frameTimes.length >= 40) {
        const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        frameTimes.length = 0;
        if (stepQuality(quality, avg)) {
          scale = quality.scale;
          resize();
        }
        canvas.dataset.scale = scale.toFixed(2);
        // A device that cannot draw even the smallest picture in good time gets the 2D scenes.
        if (avg > 140 && scale <= 0.56 && ++slowWindows >= 3) {
          onContextLost?.();
          return;
        }
        if (avg <= 140) slowWindows = 0;
      }
    }
    canvas.dataset.progress = progress.toFixed(3);

    const moving = Math.abs(target - progress) > 0.0004 || dive > 0 || breaking !== null;
    if (!reduced || dirty || moving) {
      dirty = false;
      schedule();
    }
  }

  function schedule() {
    if (!raf && !disposed && !document.hidden) raf = requestAnimationFrame(frame);
  }
  // In reduced-motion mode frames only happen when something changed.
  const onVisibility = () => {
    last = performance.now();
    schedule();
  };
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  readScroll();
  progress = target;

  return {
    ready,
    /** Switches worlds, building the new one first if needed. */
    setWorld(name) {
      current = name;
      ensureWorld(name);
      if (!worlds[name].done) kick();
      canvas.dataset.world = name;
      dirty = true;
      schedule();
    },
    /** Starts building a world in the background so a later switch is instant. */
    prepare(name) {
      ensureWorld(name);
      kick();
    },
    /** 0 to 1 while the portal camera dive is playing. */
    setDive(v) {
      dive = v;
      dirty = true;
      schedule();
    },
    start() {
      canvas.dataset.state = 'building';
      ensureWorld(current);
      kick();
      schedule();
    },
    /**
     * Finds the creature under a screen point. With poke = true it also reacts (hop or flash) and
     * returns where on screen to show its speech bubble.
     */
    pick(clientX, clientY, poke = false) {
      const w = worlds[current];
      if (!w || !pickCam) return null;
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = 1 - (clientY / window.innerHeight) * 2;
      const { pos, r, u, f, tx, ty, vp } = pickCam;
      const d = norm([f[0] + r[0] * nx * tx + u[0] * ny * ty, f[1] + r[1] * nx * tx + u[1] * ny * ty, f[2] + r[2] * nx * tx + u[2] * ny * ty]);
      let best = null;
      let bestT = 60;
      for (const a of w.actors) {
        if (!a.pick || a.hidden) continue;
        const c = [a.pos[0], a.pos[1] + a.h * 0.9, a.pos[2]];
        const oc = [c[0] - pos[0], c[1] - pos[1], c[2] - pos[2]];
        const t = dot(oc, d);
        if (t < 0.5) continue;
        const dist2 = dot(oc, oc) - t * t;
        const rad = a.r * (0.9 + Math.min(t, 30) * 0.015);
        if (dist2 <= rad * rad && t < bestT) {
          best = a;
          bestT = t;
        }
      }
      if (!best) return null;
      if (poke) {
        best.poke(simTime);
        dirty = true;
        schedule();
      }
      const c = [best.pos[0], best.pos[1] + best.h * 1.9 + 0.5, best.pos[2], 1];
      const clip = [0, 0, 0, 0].map((_, i) => vp[i] * c[0] + vp[4 + i] * c[1] + vp[8 + i] * c[2] + vp[12 + i]);
      const sx = ((clip[0] / clip[3]) * 0.5 + 0.5) * window.innerWidth;
      const sy = (0.5 - (clip[1] / clip[3]) * 0.5) * window.innerHeight;
      return { name: best.name, line: best.line, kind: best.kind, role: best.role, x: sx, y: sy };
    },
    /**
     * The page did something (a button was pressed, the section changed): the nearest people in front
     * of the camera wave back, and creatures without arms hop. 'section' wakes up a few more of them.
     */
    react(kind = 'click') {
      const w = worlds[current];
      if (!w || !pickCam || exploring) return;
      const { pos, f } = pickCam;
      const near = [];
      for (const a of w.actors) {
        if (!a.pick || a.hidden) continue;
        const dx = a.pos[0] - pos[0];
        const dz = a.pos[2] - pos[2];
        const d = Math.hypot(dx, dz);
        if (d < 1.5 || d > 28 || dx * f[0] + dz * f[2] <= 0) continue;
        near.push([d, a]);
      }
      near.sort((p, q) => p[0] - q[0]);
      near.slice(0, kind === 'section' ? 4 : 2).forEach(([, a], i) => a.wave(simTime + i * 0.3 + Math.random() * 0.25));
      dirty = true;
      schedule();
    },
    /** Free roam: leave the scroll path and walk the world. */
    setExplore(on) {
      const w = worlds[current];
      if (on === exploring || !w) return;
      exploring = on;
      keys.clear();
      touchMove.fx = touchMove.fz = 0;
      touchMove.jump = false;
      syncKeys();
      if (on) {
        sampleCamera(w.meta.stops, progress, cam);
        player = createPlayer(cam.x, cam.y - EYE_HEIGHT + 0.05, cam.z, cam.yaw, cam.pitch);
        canvas.dataset.explore = 'on';
      } else {
        delete canvas.dataset.explore;
        if (document.pointerLockElement === canvas) document.exitPointerLock();
      }
      dirty = true;
      schedule();
    },
    get exploring() {
      return exploring;
    },
    lockPointer() {
      canvas.requestPointerLock?.();
    },
    moveInput(fx, fz) {
      touchMove.fx = fx;
      touchMove.fz = fz;
      syncKeys();
    },
    jumpInput(on) {
      touchMove.jump = on;
      syncKeys();
    },
    lookBy(dx, dy) {
      if (!player) return;
      player.yaw += dx;
      player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - dy));
    },
    /** Puts the selected block against the face under the crosshair. */
    place(clientX = window.innerWidth / 2, clientY = window.innerHeight / 2) {
      const w = worlds[current];
      if (!w || !pickCam) return false;
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = 1 - (clientY / window.innerHeight) * 2;
      const { pos, r, u, f, tx, ty } = pickCam;
      const d = norm([f[0] + r[0] * nx * tx + u[0] * ny * ty, f[1] + r[1] * nx * tx + u[1] * ny * ty, f[2] + r[2] * nx * tx + u[2] * ny * ty]);
      let prev = null;
      for (let t = 0.3; t < 8; t += 0.04) {
        const c = [Math.floor(pos[0] + d[0] * t), Math.floor(pos[1] + d[1] * t), Math.floor(pos[2] + d[2] * t)];
        if (SOLID[w.meta.grid.get(...c)]) {
          if (!prev) return false;
          const inBody = player && Math.abs(prev[0] + 0.5 - player.x) < 0.8 && Math.abs(prev[2] + 0.5 - player.z) < 0.8 && prev[1] >= Math.floor(player.y) - 1 && prev[1] <= Math.floor(player.y) + 1;
          if (inBody) return false;
          touch(w, prev[0], prev[1], prev[2], HOTBAR[hotbar]);
          w.broken.push({ x: prev[0], y: prev[1], z: prev[2], id: 0, at: simTime + 45 });
          return true;
        }
        if (!prev || prev[0] !== c[0] || prev[1] !== c[1] || prev[2] !== c[2]) prev = c;
      }
      return false;
    },
    get hotbar() {
      return hotbar;
    },
    /** Digs out the block under a screen point (within reach). Returns its name or null. */
    mine(clientX, clientY) {
      const w = worlds[current];
      if (!w || !pickCam) return null;
      const hit = pickSolid(w, clientX, clientY, 14);
      if (!hit) return null;
      const [x, y, z] = hit;
      if (!mineable(w, x, y, z)) return null;
      const id = w.meta.grid.get(x, y, z);
      if (breaking && breaking.x === x && breaking.y === y && breaking.z === z) return groundOf(id);
      if (breaking) finishBreak();
      breaking = { w, x, y, z, id, t0: simTime, dur: reduced ? 0.01 : digTime(id) };
      dirty = true;
      schedule();
      return groundOf(id);
    },
    get progress() {
      return progress;
    },
    stats() {
      return {
        frames,
        scale,
        slabs: Object.fromEntries(Object.entries(worlds).map(([k, v]) => [k, v.slabs.filter(Boolean).length])),
      };
    },
    dispose() {
      disposed = true;
      setActorSound(null);
      cancelAnimationFrame(raf);
      clearTimeout(building);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onLockChange);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      ro?.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
