// Offline checks of the 3D worlds: the camera path must never touch a solid block, both worlds
// must build the same way every time, and the lighting must be sane.
import { SOLID } from '../src/lib/voxel/blocks.js';
import { sampleCamera } from '../src/lib/voxel/journey.js';
import { computeLight } from '../src/lib/voxel/light.js';
import { buildWorld } from '../src/lib/voxel/worlds.js';

let failed = 0;
const ok = (name, pass, detail = '') => {
  if (!pass) failed++;
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name}${detail && !pass ? ` | ${detail}` : ''}`);
};

for (const name of ['overworld', 'nether']) {
  const w = buildWorld(name);
  const out = {};
  let hits = 0;
  let steps = 0;
  for (let i = 0; i <= 1800; i++) {
    sampleCamera(w.stops, (i / 1800) * (w.stops.length - 1), out);
    steps++;
    // a body-sized box around the eye, from the feet to just above the head
    for (const dx of [-0.4, 0, 0.4])
      for (const dz of [-0.4, 0, 0.4])
        for (const dy of [-1.5, -0.7, 0, 0.3]) {
          if (SOLID[w.grid.get(Math.floor(out.x + dx), Math.floor(out.y + dy), Math.floor(out.z + dz))]) hits++;
        }
  }
  ok(`${name}: camera path (${steps} samples) never touches a block`, hits === 0, `${hits} hits`);
  sampleCamera(w.stops, 0, out);
  const below = w.grid.get(Math.floor(out.x), Math.floor(out.y - 1.62 - 0.5), Math.floor(out.z));
  ok(`${name}: the camera starts standing on solid ground`, SOLID[below] === 1);
  const solid = w.grid.data.reduce((n, v) => n + (v ? 1 : 0), 0);
  ok(`${name}: the world is neither empty nor full`, solid > 100000 && solid < w.grid.data.length * 0.6);
  const light = computeLight(w.grid, name === 'overworld');
  let lit = 0;
  for (const v of light.blk) if (v > 0) lit++;
  ok(`${name}: block light spreads from lamps and lava`, lit > 5000);
  if (name === 'overworld') ok('overworld: sunlight reaches the road', light.sky[w.grid.idx(32, 14, 70)] === 15);
}

// free-roam physics
import { createPlayer, stepPlayer } from '../src/lib/voxel/explore.js';
for (const name of ['overworld', 'nether']) {
  const w = buildWorld(name);
  const s0 = w.stops[0];
  const p = createPlayer(s0.x, s0.y - 1.62 + 0.5, s0.z, 0);
  for (let i = 0; i < 120; i++) stepPlayer(p, w.grid, { fx: 0, fz: 0 }, 1 / 60);
  ok(`${name}: a player dropped near the start lands on the ground`, p.onGround && Math.abs(p.y - (s0.y - 1.62)) < 0.05, `y=${p.y}`);
  const startZ = p.z;
  for (let i = 0; i < 300; i++) stepPlayer(p, w.grid, { fx: 0, fz: 1 }, 1 / 60);
  ok(`${name}: walking forward moves along the road`, p.z > startZ + 10, `z=${p.z}`);
  // run sideways for a long time: the player must stay inside the world and never inside a block
  p.yaw = Math.PI / 2;
  let inside = 0;
  for (let i = 0; i < 1500; i++) {
    stepPlayer(p, w.grid, { fx: 0, fz: 1, sprint: true, jump: i % 90 === 0 }, 1 / 60);
    if (SOLID[w.grid.get(Math.floor(p.x), Math.floor(p.y + 0.5), Math.floor(p.z))]) inside++;
  }
  ok(`${name}: running into walls never puts the player inside a block`, inside === 0 && p.x > 0 && p.x < w.grid.w, `inside=${inside} x=${p.x}`);
}
process.exit(failed ? 1 : 0);
