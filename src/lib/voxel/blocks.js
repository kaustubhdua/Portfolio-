import { T } from './atlas.js';

/** Block ids. Zero is air. */
export const B = {
  AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, COBBLE: 4, STONE_BRICK: 5, LOG: 6, LEAVES: 7, PLANKS: 8, SPRUCE_PLANKS: 9,
  SPRUCE_LOG: 10, SPRUCE_LEAVES: 11, SAND: 12, GRAVEL: 13, WATER: 14, GLASS: 15, ROOF: 16, PATH: 17, FARMLAND: 18,
  CROP: 19, HAY: 20, DOOR: 21, LAMP: 22, WOOL_RED: 23, WOOL_WHITE: 24, WOOL_BLUE: 25, NETHERRACK: 26, NETHER_BRICK: 27,
  NETHER_FENCE: 28, LAVA: 29, OBSIDIAN: 30, GLOWSTONE: 31, BASALT: 32, BLACKSTONE: 33, SOUL_SAND: 34, CRIMSON_STEM: 35,
  WARPED_STEM: 36, WART: 37, WARPED_WART: 38, SHROOMLIGHT: 39, SNOW_GRASS: 40, GOLD_GRASS: 41, FIRE: 42, BARREL: 43,
  // shaped blocks (see SHAPE below)
  TORCH: 44, LANTERN: 45, FENCE: 46, PANE: 47, NWART: 48, ANVIL: 49, FURNACE: 50, BOOKSHELF: 51, CRAFTING: 52, SPAWNER: 53,
  SLAB_PLANKS: 54, SLAB_SPRUCE: 55, SLAB_COBBLE: 56, SLAB_NETHER: 57, MOSSY_COBBLE: 58, FLOWER_RED: 59,
  // stairs and doors come in four facings each, in consecutive ids (see stair() and door())
  STAIR_PLANKS: 60, STAIR_SPRUCE: 64, STAIR_COBBLE: 68, STAIR_NETHER: 72, STAIR_BRICK: 76,
  DOOR_LOW: 80, DOOR_UP: 84, FLOWER_YELLOW: 88, TALL_GRASS: 89,
  // gold and villager workstations
  GOLD_BLOCK: 90, GILDED: 91, LECTERN: 92, CARTO: 93, STONECUT: 94, FLETCH: 95,
};

/** The block id of a stair of the given material (a B.STAIR_* value) whose tall back side faces +x, -x, +z or -z (0..3). */
export const stair = (material, facing) => material + facing;
/** The lower and upper halves of a door whose panel sits on the -x, +x, -z or +z side of its cell (facing 0..3). */
export const door = (facing) => [B.DOOR_LOW + facing, B.DOOR_UP + facing];

const all = (tile) => ({ top: tile, side: tile, bottom: tile });
const cap = (top, side, bottom) => ({ top, side, bottom });

/* Shapes are lists of boxes in sixteenths of a block: { b: [x0, y0, z0, x1, y1, z1], t?, top?, side?, bottom? }.
 * A shape function gets a `near(dx, dy, dz)` lookup for the neighbours and returns the boxes (fences and panes
 * grow arms toward their neighbours). */
const box = (b, extra = {}) => ({ b, ...extra });
const stairShape = (facing) => [
  box([0, 0, 0, 16, 8, 16]),
  box([[8, 8, 0, 16, 16, 16], [0, 8, 0, 8, 16, 16], [0, 8, 8, 16, 16, 16], [0, 8, 0, 16, 16, 8]][facing]),
];
const slabShape = [box([0, 0, 0, 16, 8, 16])];
const doorShape = (facing, tile) => [box([[0, 0, 0, 3, 16, 16], [13, 0, 0, 16, 16, 16], [0, 0, 0, 16, 16, 3], [0, 0, 13, 16, 16, 16]][facing], { t: tile })];
const OPEN_SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
// does the neighbour in this direction join up with a fence or a pane?
const joins = (near, id, dx, dz) => {
  const n = near(dx, 0, dz);
  return n === id || (n !== 0 && OPAQUE_RAW(n));
};
const OPAQUE_RAW = (id) => DEF[id] && DEF[id].opaque !== false && !DEF[id].shape && !DEF[id].shapeFn;
const arm = (dx, dz, y0, y1, w) => {
  const lo = 8 - w / 2;
  const hi = 8 + w / 2;
  if (dx > 0) return [hi, y0, lo, 16, y1, hi];
  if (dx < 0) return [0, y0, lo, lo, y1, hi];
  if (dz > 0) return [lo, y0, hi, hi, y1, 16];
  return [lo, y0, 0, hi, y1, lo];
};
const fenceShape = (id, tile) => (near) => {
  const boxes = [box([6, 0, 6, 10, 16, 10], { t: tile })];
  for (const [dx, dz] of OPEN_SIDES) {
    if (!joins(near, id, dx, dz)) continue;
    boxes.push(box(arm(dx, dz, 6, 9, 2), { t: tile }), box(arm(dx, dz, 12, 15, 2), { t: tile }));
  }
  return boxes;
};
const paneShape = (id) => (near) => {
  const boxes = [box([7, 0, 7, 9, 16, 9], { t: T.GLASS })];
  let any = false;
  for (const [dx, dz] of OPEN_SIDES) {
    if (!joins(near, id, dx, dz)) continue;
    any = true;
    boxes.push(box(arm(dx, dz, 0, 16, 2), { t: T.GLASS }));
  }
  if (!any) for (const [dx, dz] of OPEN_SIDES) boxes.push(box(arm(dx, dz, 0, 16, 2), { t: T.GLASS }));
  return boxes;
};

/**
 * How each block looks and behaves:
 *  opaque  hides the faces behind it and blocks light
 *  cut     see-through pixels are discarded (leaves, crops)
 *  liquid  drawn in the translucent pass with animated texture
 *  glass   translucent but solid
 *  plant   drawn as two crossed quads instead of a cube
 *  emit    block light level it gives off (0-15)
 *  flow    1 = animated surface, 2 = also flows downwards
 */
export const DEF = {
  [B.GRASS]: { ...cap(T.GRASS_TOP, T.GRASS_SIDE, T.DIRT) },
  [B.DIRT]: all(T.DIRT),
  [B.STONE]: all(T.STONE),
  [B.COBBLE]: all(T.COBBLE),
  [B.STONE_BRICK]: all(T.STONE_BRICK),
  [B.LOG]: cap(T.LOG_TOP, T.LOG_SIDE, T.LOG_TOP),
  [B.LEAVES]: { ...all(T.LEAVES), opaque: false, cut: true, leaf: true },
  [B.PLANKS]: all(T.PLANKS),
  [B.SPRUCE_PLANKS]: all(T.SPRUCE_PLANKS),
  [B.SPRUCE_LOG]: cap(T.LOG_TOP, T.SPRUCE_LOG, T.LOG_TOP),
  [B.SPRUCE_LEAVES]: { ...all(T.SPRUCE_LEAVES), opaque: false, cut: true, leaf: true },
  [B.SAND]: all(T.SAND),
  [B.GRAVEL]: all(T.GRAVEL),
  [B.WATER]: { ...all(T.WATER), opaque: false, liquid: true, flow: 1 },
  [B.GLASS]: { ...all(T.GLASS), opaque: false, glass: true },
  [B.ROOF]: all(T.ROOF),
  [B.PATH]: cap(T.PATH_TOP, T.DIRT, T.DIRT),
  [B.FARMLAND]: cap(T.FARMLAND, T.DIRT, T.DIRT),
  [B.CROP]: { ...all(T.CROP), opaque: false, cut: true, plant: true },
  [B.HAY]: cap(T.HAY_TOP, T.HAY_SIDE, T.HAY_TOP),
  [B.DOOR]: all(T.DOOR),
  [B.LAMP]: { ...all(T.LAMP), emit: 15 },
  [B.WOOL_RED]: all(T.WOOL_RED),
  [B.WOOL_WHITE]: all(T.WOOL_WHITE),
  [B.WOOL_BLUE]: all(T.WOOL_BLUE),
  [B.NETHERRACK]: all(T.NETHERRACK),
  [B.NETHER_BRICK]: all(T.NETHER_BRICK),
  [B.NETHER_FENCE]: { ...all(T.NETHER_BRICK), opaque: false, shapeFn: fenceShape(B.NETHER_FENCE, T.NETHER_BRICK) },
  [B.LAVA]: { ...all(T.LAVA), opaque: false, liquid: true, emit: 15, flow: 2, bright: true },
  [B.OBSIDIAN]: all(T.OBSIDIAN),
  [B.GLOWSTONE]: { ...all(T.GLOWSTONE), emit: 15, bright: true },
  [B.BASALT]: cap(T.BASALT_TOP, T.BASALT_SIDE, T.BASALT_TOP),
  [B.BLACKSTONE]: all(T.BLACKSTONE),
  [B.SOUL_SAND]: all(T.SOUL_SAND),
  [B.CRIMSON_STEM]: cap(T.CRIMSON_TOP, T.CRIMSON_STEM, T.CRIMSON_TOP),
  [B.WARPED_STEM]: cap(T.WARPED_TOP, T.WARPED_STEM, T.WARPED_TOP),
  [B.WART]: all(T.WART),
  [B.WARPED_WART]: all(T.WARPED_WART),
  [B.SHROOMLIGHT]: { ...all(T.SHROOMLIGHT), emit: 15, bright: true },
  [B.SNOW_GRASS]: cap(T.SNOW_TOP, T.SNOW_SIDE, T.DIRT),
  [B.GOLD_GRASS]: cap(T.GOLD_GRASS_TOP, T.GOLD_GRASS_SIDE, T.DIRT),
  [B.FIRE]: { ...all(T.FIRE), opaque: false, cut: true, plant: true, emit: 14, bright: true },
  [B.BARREL]: cap(T.PLANKS, T.BARREL, T.PLANKS),
  [B.TORCH]: { ...all(T.TORCH), opaque: false, cut: true, bright: true, emit: 14, shape: [box([7, 0, 7, 9, 12, 9], { top: T.GLOWSTONE })] },
  [B.LANTERN]: { ...all(T.LANTERN), opaque: false, cut: true, bright: true, emit: 15, shape: [box([5, 0, 5, 11, 7, 11], { top: T.IRON, bottom: T.IRON }), box([6, 7, 6, 10, 9, 10], { t: T.LANTERN, top: T.IRON })] },
  [B.FENCE]: { ...all(T.SPRUCE_PLANKS), opaque: false, shapeFn: fenceShape(B.FENCE, T.SPRUCE_PLANKS) },
  [B.PANE]: { ...all(T.GLASS), opaque: false, glass: true, shapeFn: paneShape(B.PANE) },
  [B.NWART]: { ...all(T.NWART), opaque: false, cut: true, plant: true },
  [B.ANVIL]: {
    ...all(T.IRON),
    opaque: false,
    shape: [box([2, 0, 2, 14, 4, 14]), box([5, 4, 4, 11, 10, 12]), box([1, 10, 3, 15, 16, 13])],
  },
  [B.FURNACE]: cap(T.FURNACE_TOP, T.FURNACE_FRONT, T.FURNACE_TOP),
  [B.BOOKSHELF]: cap(T.PLANKS, T.BOOKSHELF, T.PLANKS),
  [B.CRAFTING]: cap(T.CRAFTING_TOP, T.CRAFTING_SIDE, T.PLANKS),
  [B.SPAWNER]: { ...all(T.SPAWNER), opaque: false },
  [B.GOLD_BLOCK]: all(T.GOLD),
  [B.GILDED]: all(T.GILDED),
  [B.LECTERN]: {
    ...cap(T.LECTERN_TOP, T.LECTERN_SIDE, T.PLANKS),
    opaque: false,
    shape: [box([4, 0, 4, 12, 11, 12]), box([1, 11, 2, 15, 15, 14], { top: T.LECTERN_TOP })],
  },
  [B.CARTO]: cap(T.CARTO_TOP, T.CARTO_SIDE, T.PLANKS),
  [B.STONECUT]: { ...cap(T.STONECUT_TOP, T.STONECUT_SIDE, T.STONE_BRICK), opaque: false, shape: [box([0, 0, 0, 16, 9, 16])] },
  [B.FLETCH]: cap(T.FLETCH_TOP, T.FLETCH_SIDE, T.PLANKS),
  [B.SLAB_PLANKS]: { ...all(T.PLANKS), shape: slabShape },
  [B.SLAB_SPRUCE]: { ...all(T.SPRUCE_PLANKS), shape: slabShape },
  [B.SLAB_COBBLE]: { ...all(T.COBBLE), shape: slabShape },
  [B.SLAB_NETHER]: { ...all(T.NETHER_BRICK), shape: slabShape },
  [B.MOSSY_COBBLE]: all(T.MOSSY_COBBLE),
  [B.FLOWER_RED]: { ...all(T.FLOWER_RED), opaque: false, cut: true, plant: true },
  [B.FLOWER_YELLOW]: { ...all(T.FLOWER_YELLOW), opaque: false, cut: true, plant: true },
  [B.TALL_GRASS]: { ...all(T.TALL_GRASS), opaque: false, cut: true, plant: true },
};
for (const [mat, tile] of [[B.STAIR_PLANKS, T.PLANKS], [B.STAIR_SPRUCE, T.SPRUCE_PLANKS], [B.STAIR_COBBLE, T.COBBLE], [B.STAIR_NETHER, T.NETHER_BRICK], [B.STAIR_BRICK, T.STONE_BRICK]]) {
  for (let f = 0; f < 4; f++) DEF[mat + f] = { ...all(tile), shape: stairShape(f) };
}
for (let f = 0; f < 4; f++) {
  DEF[B.DOOR_LOW + f] = { ...all(T.DOOR_LOW), opaque: false, nosolid: true, shape: doorShape(f, T.DOOR_LOW) };
  DEF[B.DOOR_UP + f] = { ...all(T.DOOR_UP), opaque: false, nosolid: true, shape: doorShape(f, T.DOOR_UP) };
}

const N_IDS = 128;
export const OPAQUE = new Uint8Array(N_IDS);
export const EMIT = new Uint8Array(N_IDS);
// Anything a person (or the camera) cannot walk through.
export const SOLID = new Uint8Array(N_IDS);
// Blocks that are drawn from boxes instead of a plain cube (stairs, slabs, fences, doors...).
export const SHAPED = new Uint8Array(N_IDS);
// A full opaque cube: it hides the faces behind it. Shaped blocks never do.
export const FULL = new Uint8Array(N_IDS);
for (const [id, def] of Object.entries(DEF)) {
  OPAQUE[id] = def.opaque === false ? 0 : 1;
  EMIT[id] = def.emit ?? 0;
  SOLID[id] = def.liquid || def.plant || def.nosolid ? 0 : 1;
  SHAPED[id] = def.shape || def.shapeFn ? 1 : 0;
  FULL[id] = OPAQUE[id] && !SHAPED[id] ? 1 : 0;
}
