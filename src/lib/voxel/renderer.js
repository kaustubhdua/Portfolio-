import { buildTiles, TILE, TILE_COUNT } from './atlas.js';
import { InstanceWriter, createActors } from './actors.js';
import { sampleCamera, scrollToProgress } from './journey.js';
import { computeLight } from './light.js';
import { SLAB, meshWorld } from './mesh.js';
import { ENTITY_FS, ENTITY_VS, PART_FS, PART_VS, SKY_FS, SKY_VS, TERRAIN_FS, TERRAIN_VS } from './shaders.js';
import { SIZE, buildWorld } from './worlds.js';

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
export function createWorldRenderer(canvas, { sections, reduced = false, onContextLost, onProgress } = {}) {
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
      gen: meshWorld(meta.grid, light),
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
    w.slabs[r.slab] = entry;
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
  let bobAmp = 0;
  const cam = {};
  let dirty = true;
  let scale = Math.min(window.devicePixelRatio || 1, 1.5);
  const maxScale = scale;
  let width = 0;
  let height = 0;
  let timeSlow = 0;
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
      const pos = [cam.x + fwdX * lurch, cam.y + bob + idle, cam.z + fwdZ * lurch];
      const yaw = cam.yaw + px * 0.05 + sway;
      const pitch = cam.pitch - py * 0.025 + Math.sin(walk) * 0.004 * bobAmp;
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
      for (const actor of w.actors) actor.draw(simTime, writer);
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
        if (avg > 26 && scale > 0.55) {
          scale = Math.max(0.55, scale - 0.15);
          resize();
        } else if (avg < 14 && scale < maxScale) {
          timeSlow++;
          if (timeSlow > 2) {
            scale = Math.min(maxScale, scale + 0.1);
            timeSlow = 0;
            resize();
          }
        } else timeSlow = 0;
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

    const moving = Math.abs(target - progress) > 0.0004 || dive > 0;
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
        if (!a.pick) continue;
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
      return { name: best.name, line: best.line, kind: best.kind, x: sx, y: sy };
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
      cancelAnimationFrame(raf);
      clearTimeout(building);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      ro?.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
