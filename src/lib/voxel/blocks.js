import { T } from './atlas.js';

/** Block ids. Zero is air. */
export const B = {
  AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, COBBLE: 4, STONE_BRICK: 5, LOG: 6, LEAVES: 7, PLANKS: 8, SPRUCE_PLANKS: 9,
  SPRUCE_LOG: 10, SPRUCE_LEAVES: 11, SAND: 12, GRAVEL: 13, WATER: 14, GLASS: 15, ROOF: 16, PATH: 17, FARMLAND: 18,
  CROP: 19, HAY: 20, DOOR: 21, LAMP: 22, WOOL_RED: 23, WOOL_WHITE: 24, WOOL_BLUE: 25, NETHERRACK: 26, NETHER_BRICK: 27,
  NETHER_FENCE: 28, LAVA: 29, OBSIDIAN: 30, GLOWSTONE: 31, BASALT: 32, BLACKSTONE: 33, SOUL_SAND: 34, CRIMSON_STEM: 35,
  WARPED_STEM: 36, WART: 37, WARPED_WART: 38, SHROOMLIGHT: 39, SNOW_GRASS: 40, GOLD_GRASS: 41, FIRE: 42, BARREL: 43,
};

const all = (tile) => ({ top: tile, side: tile, bottom: tile });
const cap = (top, side, bottom) => ({ top, side, bottom });

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
  [B.NETHER_FENCE]: all(T.NETHER_FENCE),
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
};

const N_IDS = 64;
export const OPAQUE = new Uint8Array(N_IDS);
export const EMIT = new Uint8Array(N_IDS);
// Anything a person (or the camera) cannot walk through.
export const SOLID = new Uint8Array(N_IDS);
for (const [id, def] of Object.entries(DEF)) {
  OPAQUE[id] = def.opaque === false ? 0 : 1;
  EMIT[id] = def.emit ?? 0;
  SOLID[id] = def.liquid || def.plant ? 0 : 1;
}
