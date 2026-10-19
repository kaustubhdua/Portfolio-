import { B, door, stair } from './blocks.js';
import { Grid, rng, vnoise } from './grid.js';
import { CENTER_X, STOP_Z, sampleCamera, stopsFor } from './journey.js';

export const SIZE = { w: 64, h: 44, l: 216 };
export const GY = 12; // Overworld ground level: the top face of the grass is at y = 12
export const BY = 20; // Nether bridge deck level

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Wall of mountains / cavern rock around the playable valley so the world never ends in the void. */
const edgeWall = (x, z) => {
  const e = Math.min(x, SIZE.w - 1 - x, z, SIZE.l - 1 - z);
  return Math.pow(clamp((11 - e) / 11, 0, 1), 1.4);
};

function carveCorridor(g, stops, surface, top) {
  const out = {};
  for (let i = 0; i <= 600; i++) {
    sampleCamera(stops, (i / 600) * (stops.length - 1), out);
    const cx = Math.floor(out.x);
    const cz = Math.floor(out.z);
    for (let x = cx - 3; x <= cx + 3; x++)
      for (let z = cz - 2; z <= cz + 2; z++)
        for (let y = surface; y <= surface + top; y++) g.set(x, y, z, B.AIR);
  }
}


/**
 * A tribute monument for Technoblade, the owner's favourite YouTuber ("Technoblade never dies"). Two
 * pedestal steps, four corner pillars capped with gold and a lantern, a tall obelisk and a crown of
 * glowing blocks and gold floating above it, with a signpost in front. It is an original design,
 * deliberately not a likeness of any person or character. (cx, cz) is the centre and y0 the first
 * free level. body, step and glow are block ids.
 */
function tributeMonument(g, cx, cz, y0, { body, step, glow }) {
  g.fill(cx - 3, y0, cz - 3, cx + 3, y0, cz + 3, step);
  g.fill(cx - 2, y0 + 1, cz - 2, cx + 2, y0 + 1, cz + 2, step);
  g.fill(cx - 1, y0 + 2, cz - 1, cx + 1, y0 + 2, cz + 1, body);
  g.fill(cx - 1, y0 + 3, cz - 1, cx + 1, y0 + 3, cz + 1, body);
  g.fill(cx, y0 + 4, cz, cx, y0 + 9, cz, body); // obelisk
  g.set(cx, y0 + 6, cz - 1, B.GILDED); // a gilded band facing the road
  g.set(cx, y0 + 6, cz + 1, B.GILDED);
  g.set(cx - 1, y0 + 6, cz, B.GILDED);
  g.set(cx + 1, y0 + 6, cz, B.GILDED);
  for (const dx of [-3, 3]) {
    for (const dz of [-3, 3]) {
      g.fill(cx + dx, y0 + 1, cz + dz, cx + dx, y0 + 4, cz + dz, step);
      g.set(cx + dx, y0 + 5, cz + dz, B.GOLD_BLOCK);
      g.set(cx + dx, y0 + 6, cz + dz, B.LANTERN);
    }
  }
  // the crown: a glowing band, gold points and a bright top
  for (let x = cx - 1; x <= cx + 1; x++)
    for (let z = cz - 1; z <= cz + 1; z++) if (x !== cx || z !== cz) g.set(x, y0 + 10, z, glow);
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) g.set(cx + dx, y0 + 11, cz + dz, B.GOLD_BLOCK);
  g.set(cx, y0 + 10, cz, B.GOLD_BLOCK);
  g.set(cx, y0 + 11, cz, glow);
  // a signpost on the camera side: a fence post with a plank board (the engine draws no text)
  g.set(cx, y0 - 1, cz - 4, step);
  g.set(cx, y0, cz - 4, B.FENCE);
  g.fill(cx - 1, y0 + 1, cz - 4, cx + 1, y0 + 1, cz - 4, B.SPRUCE_PLANKS);
}

/* ------------------------------------------------------------------------------------------ */
/* Overworld: a village                                                                         */
/* ------------------------------------------------------------------------------------------ */

function buildVillage() {
  const g = new Grid(SIZE.w, SIZE.h, SIZE.l);
  const rand = rng(1991);
  const n1 = vnoise(11);
  const n2 = vnoise(23);
  const taken = new Uint8Array(SIZE.w * SIZE.l);
  const reserve = (x0, z0, x1, z1, m = 1) => {
    for (let z = z0 - m; z <= z1 + m; z++) for (let x = x0 - m; x <= x1 + m; x++) if (x >= 0 && z >= 0 && x < SIZE.w && z < SIZE.l) taken[z * SIZE.w + x] = 1;
  };
  const isTaken = (x, z) => taken[z * SIZE.w + x] === 1;

  const pond = { x: 17, z: 180, r: 6 };
  // Terrain
  for (let z = 0; z < SIZE.l; z++) {
    for (let x = 0; x < SIZE.w; x++) {
      const dist = Math.abs(x - CENTER_X);
      const ramp = clamp((dist - 8) / 10, 0, 1);
      const n = n1(x / 9, z / 9) * 0.7 + n2(x / 4, z / 4) * 0.3;
      let h = GY + Math.round(ramp * (n * 8 - 2.5)) + Math.round(edgeWall(x, z) * 30);
      const pd = Math.hypot(x - pond.x, (z - pond.z) * 1.1);
      if (pd < pond.r) h = Math.min(h, GY - 3 + Math.floor(pd / 3));
      h = clamp(h, 3, SIZE.h - 6);
      for (let y = 0; y < h; y++) {
        let id = B.STONE;
        if (y === h - 1) id = h > 28 ? B.SNOW_GRASS : B.GRASS;
        else if (y >= h - 4) id = h > 28 ? B.STONE : B.DIRT;
        g.set(x, y, z, id);
      }
      if (h <= GY - 1) {
        for (let y = h; y <= GY - 2; y++) g.set(x, y, z, B.WATER);
        if (h <= GY - 2) g.set(x, h - 1, z, B.SAND);
      }
      if (dist <= 3) {
        g.set(x, GY - 1, z, B.PATH);
      } else if (dist === 4 && rand() < 0.45) {
        g.set(x, GY - 1, z, B.PATH);
      }
    }
  }
  reserve(CENTER_X - 5, 0, CENTER_X + 5, SIZE.l, 0);

  const flatten = (x0, z0, x1, z1, height) => {
    for (let z = z0 - 1; z <= z1 + 1; z++)
      for (let x = x0 - 1; x <= x1 + 1; x++) {
        for (let y = 0; y < GY - 1; y++) if (g.get(x, y, z) === B.AIR || g.get(x, y, z) === B.WATER) g.set(x, y, z, B.DIRT);
        g.set(x, GY - 1, z, B.GRASS);
        for (let y = GY; y <= GY + height + 8; y++) g.set(x, y, z, B.AIR);
      }
    reserve(x0, z0, x1, z1, 2);
  };

  // a fence post with a torch on top, like the lamp posts along a village street
  const lampPost = (x, z, h = 3) => {
    g.fill(x, GY, z, x, GY + h - 1, z, B.FENCE);
    g.set(x, GY + h, z, B.TORCH);
  };

  // A gabled roof of stairs along z: each layer climbs one block, the ridge is a slab (odd width) or two stairs
  // back to back (even width), and the triangular ends are filled with wall blocks.
  const gableRoof = (x0, z0, x1, z1, y, mat, slab, wall) => {
    for (let k = 0; ; k++) {
      const yl = y + k;
      const xl = x0 - 1 + k;
      const xr = x1 + 1 - k;
      if (xl > xr) break;
      if (xl === xr) {
        for (let z = z0 - 1; z <= z1 + 1; z++) g.set(xl, yl, z, slab);
        break;
      }
      for (let z = z0 - 1; z <= z1 + 1; z++) {
        g.set(xl, yl, z, stair(mat, 0));
        g.set(xr, yl, z, stair(mat, 1));
      }
      if (k > 0) for (let x = xl + 1; x <= xr - 1; x++) for (const z of [z0, z1]) g.set(x, yl, z, wall);
      if (xl + 1 === xr) break;
    }
  };

  // A village house: cobblestone base course, log corners, plank walls, panes, a door and a gabled stair roof.
  const house = (x0, z0, w, d, h, doorEast, opts = {}) => {
    const { roof = B.STAIR_SPRUCE, slab = B.SLAB_SPRUCE, wall = B.PLANKS, base = B.COBBLE, chimney = false } = opts;
    const x1 = x0 + w - 1;
    const z1 = z0 + d - 1;
    flatten(x0 - 2, z0 - 2, x1 + 2, z1 + 2, h + w);
    g.fill(x0, GY - 1, z0, x1, GY - 1, z1, B.PLANKS);
    g.shell(x0, GY, z0, x1, GY + h - 1, z1, wall);
    for (let x = x0; x <= x1; x++) for (const z of [z0, z1]) g.set(x, GY, z, base);
    for (let z = z0; z <= z1; z++) for (const x of [x0, x1]) g.set(x, GY, z, base);
    g.fill(x0 + 1, GY, z0 + 1, x1 - 1, GY + h - 2, z1 - 1, B.AIR);
    for (const cx of [x0, x1]) for (const cz of [z0, z1]) g.fill(cx, GY, cz, cx, GY + h - 1, cz, B.LOG);
    const dz = z0 + Math.floor(d / 2);
    const dx = doorEast ? x1 : x0;
    const [lo, up] = door(doorEast ? 1 : 0);
    g.set(dx, GY, dz, lo);
    g.set(dx, GY + 1, dz, up);
    for (let z = z0 + 2; z <= z1 - 2; z += 3) {
      for (const wx of [x0, x1]) if (!(wx === dx && Math.abs(z - dz) < 2)) g.fill(wx, GY + 1, z, wx, GY + 2, z, B.PANE);
    }
    const mx = Math.floor((x0 + x1) / 2);
    for (const wz of [z0, z1]) g.fill(mx, GY + 1, wz, mx, GY + 2, wz, B.PANE);
    // furnishings, visible when exploring
    if (opts.barn) {
      // a barn: hay bales stacked inside instead of a hearth
      g.fill(x0 + 1, GY, z0 + 1, x1 - 1, GY + 1, z0 + 2, B.HAY);
      g.fill(x1 - 3, GY, z1 - 2, x1 - 1, GY, z1 - 1, B.HAY);
      g.set(x1 - 2, GY + 1, z1 - 1, B.HAY);
      g.set(x0 + 2, GY, z1 - 1, B.BARREL);
    } else {
      g.set(x0 + 1, GY, z1 - 1, B.CRAFTING);
      g.set(x1 - 1, GY, z1 - 1, B.FURNACE);
      g.fill(x0 + 1, GY, z0 + 1, x0 + 2, GY + 1, z0 + 1, B.BOOKSHELF);
    }
    g.set(mx, GY + h - 2, Math.floor((z0 + z1) / 2), B.LANTERN);
    if (opts.upper) {
      // a second storey: a plank floor and a row of upstairs windows
      g.fill(x0 + 1, GY + 4, z0 + 1, x1 - 1, GY + 4, z1 - 1, B.PLANKS);
      for (let z = z0 + 2; z <= z1 - 2; z += 3) for (const wx of [x0, x1]) g.fill(wx, GY + 5, z, wx, GY + 6, z, B.PANE);
      for (const wz of [z0, z1]) g.fill(mx, GY + 5, wz, mx, GY + 6, wz, B.PANE);
    }
    gableRoof(x0, z0, x1, z1, GY + h - 1, roof, slab, wall);
    if (chimney) {
      const cx = x0 + 2;
      const cz = z0 + 2;
      g.fill(cx, GY + h, cz, cx, GY + h + Math.ceil(w / 2) + 1, cz, B.COBBLE);
    }
    // porch torch post beside the door
    lampPost(doorEast ? x1 + 2 : x0 - 2, dz + 2, 2);
    // a worn dirt path from the door to the road, and a couple of flowers by the step
    const out = doorEast ? x1 + 1 : x0 - 1;
    const road = doorEast ? 27 : 37;
    for (let x = Math.min(out, road); x <= Math.max(out, road); x++) g.set(x, GY - 1, dz, B.PATH);
    g.set(out, GY, dz - 2, B.FLOWER_RED);
    g.set(out, GY, dz + 3, B.FLOWER_YELLOW);
  };

  // gate
  for (const x of [28, 36]) {
    g.fill(x, GY, 17, x, GY + 6, 17, B.SPRUCE_LOG);
    g.set(x, GY + 7, 17, B.LANTERN);
  }
  g.fill(28, GY + 6, 17, 36, GY + 6, 17, B.SPRUCE_PLANKS);
  g.fill(31, GY + 3, 17, 33, GY + 5, 17, B.WOOL_RED);
  reserve(26, 15, 38, 19, 0);

  // houses
  house(14, 22, 8, 7, 4, true, { chimney: true });
  house(44, 26, 8, 8, 5, false, { roof: B.STAIR_COBBLE, slab: B.SLAB_COBBLE });
  house(13, 50, 9, 8, 5, true, { wall: B.COBBLE, base: B.MOSSY_COBBLE, roof: B.STAIR_COBBLE, slab: B.SLAB_COBBLE });
  house(45, 52, 7, 7, 4, false, { roof: B.STAIR_PLANKS, slab: B.SLAB_PLANKS });
  house(44, 92, 8, 8, 4, false, { chimney: true });
  house(13, 150, 8, 8, 5, true, { roof: B.STAIR_PLANKS, slab: B.SLAB_PLANKS, chimney: true });
  house(45, 176, 8, 7, 4, false, { roof: B.STAIR_COBBLE, slab: B.SLAB_COBBLE });
  // a two-storey townhouse and a barn fill the gaps along the road
  house(14, 34, 8, 9, 8, true, { upper: true, chimney: true, roof: B.STAIR_COBBLE, slab: B.SLAB_COBBLE });
  house(46, 134, 9, 11, 5, false, { barn: true, wall: B.SPRUCE_PLANKS, roof: B.STAIR_SPRUCE, slab: B.SLAB_SPRUCE });
  // the meeting hall: a long house lined with bookshelves, a lectern out front, and a bell shed on the ridge
  house(45, 105, 10, 12, 5, false, { wall: B.PLANKS, base: B.STONE_BRICK, roof: B.STAIR_COBBLE, slab: B.SLAB_COBBLE, chimney: true });
  for (let z = 106; z <= 115; z++) g.fill(53, GY, z, 53, GY + 1, z, B.BOOKSHELF);
  for (let x = 47; x <= 52; x++) g.fill(x, GY, 106, x, GY + 1, 106, B.BOOKSHELF);
  g.set(41, GY, 110, B.LECTERN); // the librarian's lectern
  // more villagers with their job-site blocks, on the west side of the road
  g.set(27, GY, 128, B.CARTO); // cartographer
  g.set(27, GY, 122, B.STONECUT); // mason
  g.set(27, GY, 134, B.FLETCH); // fletcher
  for (const x of [49, 50]) for (const z of [108, 113]) g.fill(x, GY + 10, z, x, GY + 11, z, B.FENCE);
  g.fill(49, GY + 12, 108, 50, GY + 12, 113, B.SLAB_SPRUCE);

  // well near the profile stop
  flatten(40, 40, 44, 44, 5);
  g.shell(41, GY, 41, 43, GY + 1, 43, B.COBBLE);
  g.set(42, GY, 42, B.WATER);
  g.set(42, GY - 1, 42, B.WATER);
  for (const [x, z] of [[41, 41], [43, 41], [41, 43], [43, 43]]) g.fill(x, GY + 2, z, x, GY + 3, z, B.FENCE);
  g.fill(41, GY + 4, 41, 43, GY + 4, 43, B.SLAB_COBBLE);
  g.set(42, GY + 4, 42, B.COBBLE);
  for (let z = 25; z < 200; z += 12) {
    lampPost(27, z);
    lampPost(37, z + 6);
  }

  // market stalls
  const stall = (x0, z0, w, d) => {
    flatten(x0, z0, x0 + w - 1, z0 + d - 1, 4);
    for (const x of [x0, x0 + w - 1]) for (const z of [z0, z0 + d - 1]) g.fill(x, GY, z, x, GY + 2, z, B.FENCE);
    for (let x = x0; x < x0 + w; x++) for (let z = z0; z < z0 + d; z++) g.set(x, GY + 3, z, (x + z) % 2 ? B.WOOL_RED : B.WOOL_WHITE);
    g.fill(x0 + 1, GY, z0 + d - 1, x0 + w - 2, GY, z0 + d - 1, B.BARREL);
    g.set(x0 + 1, GY, z0, B.HAY);
    g.set(x0 + w - 2, GY, z0, B.BARREL);
    g.set(x0 + 1, GY + 1, z0, B.CROP);
  };
  stall(38, 64, 5, 5);
  stall(38, 72, 5, 5);
  stall(21, 67, 5, 5);
  stall(45, 80, 5, 4);

  // blacksmith (open front toward the road)
  flatten(14, 92, 26, 108, 10);
  g.fill(14, GY - 1, 92, 26, GY - 1, 108, B.COBBLE);
  g.shell(14, GY, 92, 26, GY + 5, 108, B.STONE_BRICK);
  g.fill(15, GY, 93, 25, GY + 4, 107, B.AIR);
  g.fill(26, GY, 95, 26, GY + 3, 105, B.AIR); // wide open front
  for (const z of [95, 105]) g.fill(26, GY, z, 26, GY + 4, z, B.SPRUCE_LOG);
  g.fill(26, GY + 4, 95, 26, GY + 4, 105, B.SPRUCE_PLANKS);
  gableRoof(14, 92, 26, 108, GY + 5, B.STAIR_COBBLE, B.SLAB_COBBLE, B.STONE_BRICK);
  g.fill(15, GY, 93, 25, GY + 4, 107, B.AIR);
  g.fill(17, GY - 1, 99, 19, GY - 1, 101, B.LAVA);
  g.shell(16, GY - 1, 98, 20, GY - 1, 102, B.BLACKSTONE);
  g.fill(17, GY - 1, 99, 19, GY - 1, 101, B.LAVA);
  g.set(22, GY, 99, B.ANVIL);
  g.fill(15, GY, 99, 15, GY, 101, B.FURNACE);
  g.set(15, GY, 97, B.CRAFTING);
  g.fill(15, GY, 103, 15, GY + 1, 104, B.BOOKSHELF);
  g.set(18, GY, 96, B.BARREL);
  g.set(19, GY, 96, B.BARREL);
  g.fill(15, GY, 105, 15, GY + 1, 105, B.COBBLE);
  g.fill(14, GY + 6, 106, 14, GY + 12, 106, B.COBBLE); // chimney
  g.fill(14, GY, 106, 14, GY + 5, 106, B.COBBLE);
  g.set(14, GY + 13, 106, B.FIRE);
  g.set(20, GY + 4, 100, B.LANTERN);
  g.set(19, GY, 94, B.FIRE);

  // tower
  flatten(40, 122, 47, 129, 16);
  g.fill(40, GY - 1, 122, 47, GY - 1, 129, B.COBBLE);
  g.shell(40, GY, 122, 47, GY + 14, 129, B.COBBLE);
  g.fill(41, GY, 123, 46, GY + 13, 128, B.AIR);
  g.fill(40, GY, 125, 40, GY + 2, 126, B.AIR);
  for (const y of [GY + 4, GY + 8, GY + 11]) {
    g.fill(40, y, 125, 40, y + 1, 125, B.GLASS);
    g.fill(47, y, 125, 47, y + 1, 125, B.GLASS);
  }
  for (let x = 39; x <= 48; x++)
    for (let z = 121; z <= 130; z++) {
      if (x === 39 || x === 48 || z === 121 || z === 130) g.set(x, GY + 15, z, B.STONE_BRICK);
      if ((x + z) % 2 === 0 && (x === 39 || x === 48 || z === 121 || z === 130)) g.set(x, GY + 16, z, B.STONE_BRICK);
    }
  g.fill(39, GY + 14, 121, 48, GY + 14, 130, B.STONE_BRICK);
  for (const [x, z] of [[39, 121], [48, 121], [39, 130], [48, 130]]) g.set(x, GY + 17, z, B.TORCH);
  g.set(43, GY + 5, 125, B.LANTERN);
  g.set(43, GY + 5, 126, B.LANTERN);
  for (let z = 123; z <= 127; z++) g.set(41, GY, z, B.AIR);

  // farm
  flatten(13, 118, 27, 140, 3);
  for (let x = 14; x <= 26; x++)
    for (let z = 119; z <= 139; z++) {
      const row = x % 3;
      if (row === 0) g.set(x, GY - 1, z, B.WATER);
      else {
        g.set(x, GY - 1, z, B.FARMLAND);
        if (rand() < 0.93) g.set(x, GY, z, B.CROP);
      }
    }
  for (const [x, z] of [[13, 118], [27, 118], [13, 140], [27, 140]]) lampPost(x, z, 2);
  g.set(28, GY, 128, B.HAY);
  g.set(28, GY, 129, B.HAY);
  g.set(28, GY + 1, 128, B.HAY);

  // windmill
  flatten(41, 152, 46, 160, 18);
  g.fill(41, GY - 1, 153, 46, GY - 1, 158, B.COBBLE);
  for (let y = 0; y < 5; y++) g.shell(41, GY + y, 153, 46, GY + y, 158, B.COBBLE);
  for (let y = 5; y < 10; y++) g.shell(42, GY + y, 154, 45, GY + y, 157, B.PLANKS);
  for (let k = 0; k < 4; k++) g.fill(41 + k, GY + 10 + k, 153 + k, 46 - k, GY + 10 + k, 158 - k, B.ROOF);
  g.fill(41, GY, 155, 41, GY + 1, 155, B.AIR);
  g.fill(41, GY, 156, 41, GY + 1, 156, B.AIR);
  g.fill(42, GY, 155, 45, GY + 3, 156, B.AIR);

  // sheep pen
  flatten(15, 160, 27, 172, 2);
  for (let x = 15; x <= 27; x++) for (const z of [160, 172]) g.set(x, GY, z, B.FENCE);
  for (let z = 160; z <= 172; z++) for (const x of [15, 27]) g.set(x, GY, z, B.FENCE);
  g.set(27, GY, 166, B.AIR);
  g.set(27, GY - 1, 166, B.PATH);
  g.set(18, GY, 163, B.HAY);
  g.set(24, GY, 169, B.HAY);

  // plaza and campfire at the end of the road
  for (let z = 183; z <= 205; z++)
    for (let x = 22; x <= 42; x++) {
      if (Math.hypot(x - 32, (z - 196) * 0.9) < 10.5) {
        g.set(x, GY - 1, z, B.PATH);
        for (let y = GY; y < GY + 8; y++) g.set(x, y, z, B.AIR);
      }
    }
  reserve(22, 183, 42, 207, 0);
  for (const [x, z] of [[31, 197], [33, 197], [32, 196], [32, 198]]) g.set(x, GY, z, B.LOG);
  g.set(32, GY, 197, B.COBBLE);
  g.set(32, GY + 1, 197, B.FIRE);
  for (const [x, z] of [[28, 193], [36, 193], [28, 201], [36, 201]]) lampPost(x, z, 3);
  for (let z = 196; z <= 198; z++) {
    g.set(27, GY, z, stair(B.STAIR_SPRUCE, 1));
    g.set(37, GY, z, stair(B.STAIR_SPRUCE, 0));
  }
  // tribute monument on the east side of the plaza
  tributeMonument(g, 38, 203, GY, { body: B.STONE, step: B.STONE_BRICK, glow: B.GLOWSTONE });
  // portal home
  g.shell(30, GY, 207, 34, GY + 4, 207, B.OBSIDIAN);
  g.fill(31, GY + 1, 207, 33, GY + 3, 207, B.AIR);
  reserve(28, 205, 36, 209, 0);

  // trees
  for (let i = 0; i < 520; i++) {
    const x = 3 + Math.floor(rand() * (SIZE.w - 6));
    const z = 3 + Math.floor(rand() * (SIZE.l - 8));
    if (Math.abs(x - CENTER_X) < 7 || isTaken(x, z)) continue;
    let y = SIZE.h - 1;
    while (y > 0 && g.get(x, y, z) === B.AIR) y--;
    if (g.get(x, y, z) !== B.GRASS) continue;
    const th = 4 + Math.floor(rand() * 3);
    g.fill(x, y + 1, z, x, y + th, z, B.LOG);
    for (let dy = -2; dy <= 1; dy++) {
      const r = dy <= 0 ? 2 : 1;
      for (let dx = -r; dx <= r; dx++)
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) === r && Math.abs(dz) === r && rand() < 0.5) continue;
          if (g.get(x + dx, y + th + dy, z + dz) === B.AIR) g.set(x + dx, y + th + dy, z + dz, B.LEAVES);
        }
    }
    reserve(x - 2, z - 2, x + 2, z + 2, 0);
  }

  // tall grass and flowers in the meadow (not on the road itself)
  for (let z = 2; z < SIZE.l - 2; z++) {
    for (let x = 2; x < SIZE.w - 2; x++) {
      if (Math.abs(x - CENTER_X) < 4) continue;
      let y = SIZE.h - 1;
      while (y > 0 && g.get(x, y, z) === B.AIR) y--;
      if (g.get(x, y, z) !== B.GRASS || g.get(x, y + 1, z) !== B.AIR) continue;
      const r = rand();
      if (r < 0.11) g.set(x, y + 1, z, B.TALL_GRASS);
      else if (r < 0.135) g.set(x, y + 1, z, r < 0.1225 ? B.FLOWER_RED : B.FLOWER_YELLOW);
    }
  }

  const stops = stopsFor('overworld', GY);
  carveCorridor(g, stops, GY, 5);
  return { grid: g, stops, surface: GY, portal: { x: 32, y: GY + 1, z: 207, w: 3, h: 3 } };
}

/* ------------------------------------------------------------------------------------------ */
/* Nether: a fortress above a lava sea                                                         */
/* ------------------------------------------------------------------------------------------ */

function buildFortress() {
  const g = new Grid(SIZE.w, SIZE.h, SIZE.l);
  const rand = rng(1337);
  const n1 = vnoise(5);
  const n2 = vnoise(9);
  const LAVA_TOP = 9;

  for (let z = 0; z < SIZE.l; z++) {
    for (let x = 0; x < SIZE.w; x++) {
      const dist = Math.abs(x - CENTER_X);
      const wall = edgeWall(x, z);
      let floorH = 5;
      const isl = n1(x / 12, z / 12) * 0.75 + n2(x / 4, z / 4) * 0.25;
      if (dist > 9 && isl > 0.62) floorH = 6 + Math.floor((isl - 0.62) * 34);
      floorH = Math.max(floorH, 5 + Math.round(wall * 30));
      for (let y = 0; y < floorH; y++) g.set(x, y, z, y > 1 && n2(x / 3, y / 3 + z / 5) > 0.82 ? B.BLACKSTONE : B.NETHERRACK);
      if (floorH > 10 && floorH < 14) g.set(x, floorH - 1, z, rand() < 0.5 ? B.SOUL_SAND : B.NETHERRACK);
      for (let y = floorH; y <= LAVA_TOP; y++) g.set(x, y, z, B.LAVA);
      // cavern ceiling with stalactites
      const drop = Math.round(n2(x / 5, z / 5) * 7 + wall * 6);
      for (let y = 40 - drop; y < SIZE.h; y++) g.set(x, y, z, B.NETHERRACK);
      if (dist > 9 && rand() < 0.012) {
        const cy = 39 - drop;
        for (const [dx, dy, dz] of [[0, 0, 0], [1, 0, 0], [0, 0, 1], [0, -1, 0], [-1, 0, 0]]) if (g.get(x + dx, cy + dy, z + dz) === B.AIR) g.set(x + dx, cy + dy, z + dz, B.GLOWSTONE);
      }
    }
  }
  // basalt columns standing in the lava
  for (let i = 0; i < 90; i++) {
    const x = 3 + Math.floor(rand() * (SIZE.w - 6));
    const z = 3 + Math.floor(rand() * (SIZE.l - 6));
    if (Math.abs(x - CENTER_X) < 11) continue;
    let y = 0;
    while (y < SIZE.h && g.get(x, y, z) !== B.AIR) y++;
    const h = 2 + Math.floor(rand() * 7);
    for (let k = 0; k < h; k++) g.set(x, y + k, z, B.BASALT);
  }
  // lava falls from the ceiling cracks
  for (let i = 0; i < 26; i++) {
    const x = 4 + Math.floor(rand() * (SIZE.w - 8));
    const z = 4 + Math.floor(rand() * (SIZE.l - 8));
    if (Math.abs(x - CENTER_X) < 10) continue;
    let y = SIZE.h - 1;
    while (y > 12 && g.get(x, y, z) !== B.AIR) y--;
    const top = y;
    g.set(x, top + 1, z, B.LAVA);
    for (; y > LAVA_TOP && g.get(x, y, z) === B.AIR; y--) g.set(x, y, z, B.LAVA);
  }

  const D = BY - 1; // deck block level
  // main bridge
  for (let z = 0; z <= 206; z++) {
    g.fill(28, D - 1, z, 36, D, z, B.NETHER_BRICK);
    for (const x of [28, 36]) {
      g.set(x, D + 1, z, B.NETHER_FENCE);
      if (z % 12 === 6) {
        g.fill(x, D + 1, z, x, D + 2, z, B.NETHER_BRICK);
        g.set(x, D + 3, z, B.GLOWSTONE);
      }
    }
    if (z % 14 === 0) {
      for (const x of [28, 35]) {
        g.fill(x - 1, LAVA_TOP - 2, z - 1, x + 2, D - 2, z + 1, B.NETHER_BRICK);
        g.fill(x - 1, D - 3, z - 1, x + 2, D - 3, z + 1, B.NETHER_BRICK);
      }
      g.fill(29, D - 3, z, 35, D - 2, z, B.NETHER_BRICK);
      g.fill(30, D - 3, z, 34, D - 3, z, B.AIR);
      for (let x = 30; x <= 34; x++) if (x === 30 || x === 34) g.set(x, D - 2, z, B.NETHER_BRICK);
      g.fill(31, D - 2, z, 33, D - 2, z, B.AIR);
    }
  }

  const sideBridge = (x0, x1, z) => {
    g.fill(x0, D - 1, z - 1, x1, D, z + 1, B.NETHER_BRICK);
    g.fill(x0, D + 1, z - 1, x1, D + 1, z - 1, B.NETHER_FENCE);
    g.fill(x0, D + 1, z + 1, x1, D + 1, z + 1, B.NETHER_FENCE);
  };

  // gate
  for (const x of [25, 37]) {
    g.fill(x, D - 6, 15, x + 2, D + 8, 17, B.NETHER_BRICK);
    g.fill(x + 1, D + 1, 16, x + 1, D + 2, 16, B.AIR);
  }
  g.fill(25, D + 7, 15, 39, D + 8, 17, B.NETHER_BRICK);
  for (let x = 28; x <= 36; x += 2) g.set(x, D + 6, 16, B.GLOWSTONE);
  g.fill(28, D + 1, 15, 36, D + 1, 17, B.AIR);
  g.fill(28, D + 1, 15, 28, D + 1, 17, B.NETHER_FENCE);
  g.fill(36, D + 1, 15, 36, D + 1, 17, B.NETHER_FENCE);

  // watch tower (left)
  g.fill(12, 4, 34, 21, D - 2, 46, B.NETHER_BRICK);
  g.shell(12, D - 1, 34, 21, D + 16, 46, B.NETHER_BRICK);
  g.fill(13, D, 35, 20, D + 15, 45, B.AIR);
  g.fill(21, D, 38, 21, D + 3, 42, B.AIR);
  for (const y of [D + 6, D + 10]) for (const z of [37, 41, 43]) g.fill(21, y, z, 21, y + 1, z, B.AIR);
  g.fill(12, D + 17, 34, 21, D + 17, 46, B.NETHER_BRICK);
  for (let x = 12; x <= 21; x++) for (let z = 34; z <= 46; z++) if ((x + z) % 2 === 0 && (x === 12 || x === 21 || z === 34 || z === 46)) g.set(x, D + 18, z, B.NETHER_BRICK);
  g.set(16, D + 14, 40, B.GLOWSTONE);
  g.set(17, D + 4, 40, B.GLOWSTONE);
  sideBridge(22, 27, 40);
  g.fill(22, D + 1, 39, 27, D + 3, 41, B.AIR);
  g.fill(22, D + 1, 39, 27, D + 1, 39, B.NETHER_FENCE);
  g.fill(22, D + 1, 41, 27, D + 1, 41, B.NETHER_FENCE);

  // wart garden (right) near the profile stop
  g.fill(37, D - 3, 60, 54, D, 80, B.NETHER_BRICK);
  g.fill(36, D + 1, 62, 36, D + 1, 78, B.AIR);
  for (let x = 40; x <= 52; x += 2)
    for (let z = 63; z <= 77; z++) {
      g.set(x, D, z, B.SOUL_SAND);
      g.set(x + 1, D, z, B.SOUL_SAND);
      if (rand() < 0.85) g.set(x, D + 1, z, B.NWART);
      if (rand() < 0.85) g.set(x + 1, D + 1, z, B.NWART);
    }
  for (let x = 37; x <= 54; x++) for (const z of [60, 80]) g.set(x, D + 1, z, B.NETHER_FENCE);
  for (let z = 60; z <= 80; z++) g.set(54, D + 1, z, B.NETHER_FENCE);
  g.set(39, D + 1, 62, B.GLOWSTONE);
  g.set(39, D + 1, 78, B.GLOWSTONE);

  // forge hall (roofed bridge section)
  g.fill(22, D + 9, 88, 42, D + 10, 112, B.NETHER_BRICK);
  for (const [x, z] of [[22, 88], [42, 88], [22, 112], [42, 112], [22, 100], [42, 100]]) g.fill(x, D - 2, z, x + 1, D + 8, z + 1, B.NETHER_BRICK);
  g.fill(22, D, 88, 27, D, 112, B.NETHER_BRICK);
  g.fill(37, D, 88, 42, D, 112, B.NETHER_BRICK);
  for (let z = 90; z <= 110; z += 4) for (let x = 25; x <= 39; x += 4) g.set(x, D + 8, z, B.GLOWSTONE);
  g.fill(23, D, 96, 27, D, 104, B.BASALT);
  g.fill(24, D, 97, 26, D, 103, B.LAVA);
  g.set(25, D + 1, 100, B.FIRE);
  g.fill(37, D + 1, 92, 41, D + 1, 92, B.BLACKSTONE);
  g.fill(38, D + 1, 108, 40, D + 1, 108, B.BLACKSTONE);
  g.fill(23, D + 1, 90, 23, D + 1, 94, B.NETHER_FENCE);
  g.fill(28, D + 1, 88, 28, D + 1, 112, B.AIR);
  g.fill(36, D + 1, 88, 36, D + 1, 112, B.AIR);

  // keep (right)
  g.fill(41, 4, 121, 52, D - 2, 138, B.NETHER_BRICK);
  g.shell(41, D - 1, 121, 52, D + 18, 138, B.NETHER_BRICK);
  g.fill(42, D, 122, 51, D + 17, 137, B.AIR);
  g.fill(41, D, 128, 41, D + 3, 131, B.AIR);
  for (const z of [124, 135]) for (const y of [D + 5, D + 10, D + 14]) g.fill(41, y, z, 41, y + 2, z, B.AIR);
  for (let x = 41; x <= 52; x++) for (let z = 121; z <= 138; z++) if ((x + z) % 2 === 0 && (x === 41 || x === 52 || z === 121 || z === 138)) g.set(x, D + 19, z, B.NETHER_BRICK);
  g.fill(44, D + 18, 124, 49, D + 18, 135, B.NETHER_BRICK);
  g.set(46, D + 5, 130, B.GLOWSTONE);
  g.set(47, D + 12, 130, B.SHROOMLIGHT);
  sideBridge(37, 40, 130);
  g.fill(37, D + 1, 129, 40, D + 3, 131, B.AIR);
  g.fill(37, D + 1, 129, 40, D + 1, 129, B.NETHER_FENCE);
  g.fill(37, D + 1, 131, 40, D + 1, 131, B.NETHER_FENCE);

  // crossroads platform with fungus trees
  g.fill(18, D - 3, 148, 46, D, 172, B.NETHER_BRICK);
  g.fill(28, D + 1, 148, 28, D + 1, 172, B.AIR);
  g.fill(36, D + 1, 148, 36, D + 1, 172, B.AIR);
  for (let x = 18; x <= 46; x++) for (const z of [148, 172]) if (x < 28 || x > 36) g.set(x, D + 1, z, B.NETHER_FENCE);
  for (let z = 148; z <= 172; z++) for (const x of [18, 46]) g.set(x, D + 1, z, B.NETHER_FENCE);
  const fungus = (x, z, stem, cap, h) => {
    g.fill(x, D + 1, z, x, D + h, z, stem);
    for (let dy = 0; dy < 3; dy++) {
      const r = dy === 2 ? 1 : 3 - dy;
      for (let dx = -r - 1; dx <= r + 1; dx++)
        for (let dz = -r - 1; dz <= r + 1; dz++) {
          if (Math.hypot(dx, dz) > r + 0.6) continue;
          if (g.get(x + dx, D + h - 1 + dy, z + dz) === B.AIR) g.set(x + dx, D + h - 1 + dy, z + dz, rand() < 0.1 ? B.SHROOMLIGHT : cap);
        }
    }
  };
  g.fill(23, D, 153, 25, D, 155, B.SOUL_SAND);
  fungus(24, 154, B.CRIMSON_STEM, B.WART, 7);
  g.fill(39, D, 164, 41, D, 166, B.SOUL_SAND);
  fungus(40, 165, B.WARPED_STEM, B.WARPED_WART, 8);
  for (const [x, z] of [[27, 156], [37, 156], [27, 168], [37, 168]]) g.fill(x, D + 1, z, x, D + 3, z, B.NETHER_BRICK), g.set(x, D + 4, z, B.GLOWSTONE);

  // end platform and the portal home
  g.fill(21, D - 3, 182, 43, D, 208, B.NETHER_BRICK);
  g.fill(28, D + 1, 182, 36, D + 1, 182, B.AIR);
  for (let x = 21; x <= 43; x++) g.set(x, D + 1, 208, B.NETHER_FENCE);
  for (let z = 182; z <= 208; z++) for (const x of [21, 43]) g.set(x, D + 1, z, B.NETHER_FENCE);
  g.fill(30, D + 1, 205, 34, D + 5, 205, B.OBSIDIAN);
  g.fill(31, D + 2, 205, 33, D + 4, 205, B.AIR);
  for (const [x, z] of [[24, 186], [40, 186], [24, 204], [40, 204], [27, 196], [37, 196]]) {
    g.set(x, D, z, B.SOUL_SAND);
    g.set(x, D + 1, z, B.FIRE);
  }
  g.fill(31, D, 196, 33, D, 198, B.BASALT);
  g.fill(32, D + 1, 197, 32, D + 1, 197, B.FIRE);

  // fortress corridor just inside the gate: pillars with arches, brick walls with fence windows,
  // a balcony, a lava well and a soul-sand niche with nether wart, like the corridors of a real fortress
  for (let z = 19; z <= 33; z++) {
    const pillar = (z - 19) % 4 === 0;
    for (const x of [28, 36]) {
      g.fill(x, D + 1, z, x, D + 4, z, B.NETHER_BRICK);
      if (!pillar) g.fill(x, D + 2, z, x, D + 3, z, B.NETHER_FENCE);
    }
    if (pillar) {
      g.fill(28, D + 5, z, 36, D + 5, z, B.NETHER_BRICK);
      g.set(29, D + 4, z, stair(B.STAIR_NETHER, 0));
      g.set(35, D + 4, z, stair(B.STAIR_NETHER, 1));
    }
  }
  // balcony on the west wall (opening in the wall, a deck with a fence rail over the drop)
  g.fill(28, D + 1, 25, 28, D + 4, 27, B.AIR);
  g.fill(25, D - 1, 24, 27, D, 28, B.NETHER_BRICK);
  g.fill(25, D + 1, 24, 27, D + 1, 24, B.NETHER_FENCE);
  g.fill(25, D + 1, 28, 27, D + 1, 28, B.NETHER_FENCE);
  g.fill(25, D + 1, 24, 25, D + 1, 28, B.NETHER_FENCE);
  // lava well alcove on the east wall
  g.fill(36, D + 1, 21, 36, D + 4, 24, B.AIR);
  g.fill(37, D - 1, 20, 40, D, 25, B.NETHER_BRICK);
  g.fill(38, D, 22, 39, D, 23, B.LAVA);
  g.fill(37, D + 1, 20, 40, D + 1, 20, B.NETHER_FENCE);
  g.fill(37, D + 1, 25, 40, D + 1, 25, B.NETHER_FENCE);
  g.fill(40, D + 1, 20, 40, D + 1, 25, B.NETHER_FENCE);
  g.set(38, D + 1, 22, B.GLOWSTONE);
  // soul sand with nether wart in a niche
  g.fill(36, D + 1, 29, 36, D + 4, 32, B.AIR);
  g.fill(37, D - 1, 28, 39, D, 33, B.NETHER_BRICK);
  g.fill(37, D, 29, 38, D, 32, B.SOUL_SAND);
  g.fill(37, D + 1, 29, 38, D + 1, 32, B.NWART);
  g.fill(37, D + 1, 28, 39, D + 1, 28, B.NETHER_FENCE);
  g.fill(37, D + 1, 33, 39, D + 1, 33, B.NETHER_FENCE);

  // bastion bridge before the end platform: blackstone ramparts crowned with gilded stone, gold
  // blocks on the corner towers, and lava running on both sides under the deck
  for (let z = 173; z <= 181; z++) {
    g.fill(28, D - 1, z, 36, D, z, B.BLACKSTONE);
    for (const x of [28, 36]) {
      g.fill(x, D + 1, z, x, D + 3, z, B.BLACKSTONE);
      g.set(x, D + 4, z, (z + (x === 28 ? 0 : 1)) % 2 === 0 ? B.GILDED : B.AIR);
      if (z % 3 === 0) g.set(x, D + 2, z, B.GILDED);
    }
  }
  for (const x of [27, 35]) for (const z of [172, 181]) {
    g.fill(x, D, z, x + 2, D + 6, z + 1, B.BLACKSTONE);
    g.set(x, D + 7, z, B.GOLD_BLOCK);
    g.set(x + 2, D + 7, z, B.GOLD_BLOCK);
    g.set(x + 1, D + 7, z + 1, B.GOLD_BLOCK);
  }
  g.fill(32, D, 176, 32, D, 178, B.GILDED);
  g.set(32, D + 1, 177, B.GOLD_BLOCK);
  g.set(31, D + 1, 177, B.LANTERN);
  g.set(33, D + 1, 177, B.LANTERN);

  // tribute monument on the end platform, in blackstone with a glowing crown
  tributeMonument(g, 26, 201, BY, { body: B.BLACKSTONE, step: B.NETHER_BRICK, glow: B.GLOWSTONE });

  const stops = stopsFor('nether', BY);
  carveCorridor(g, stops, BY, 5);
  return { grid: g, stops, surface: BY, portal: { x: 32, y: BY + 2, z: 205, w: 3, h: 3 } };
}

const cache = {};
/** Builds (once) the block grid for 'overworld' or 'nether'. */
export function buildWorld(name) {
  cache[name] ??= name === 'overworld' ? buildVillage() : buildFortress();
  return cache[name];
}
export { STOP_Z };
