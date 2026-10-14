/**
 * Nether biomes the hero can show. Colours and particles follow the game: Crimson Forest has
 * shroomlights and weeping vines, Basalt Deltas has light-grey fog and falling dust, Warped
 * Forest has magenta-purple fog and no music, Soul Sand Valley has blue fog and soul fire.
 * Lantern wisps drift in Basalt Deltas and Soul Sand Valley; ember crawlers walk the lava seas (original creatures, not game mobs).
 */
export const heroBiomes = [
  {
    id: 'crimson',
    name: 'Crimson Forest',
    caption: 'Shroomlights, weeping vines and a red haze.',
    creature: 'crawler',
    particles: { hi: '#ffd27a', lo: '#ff6a1a', ash: [190, 170, 180], ashRatio: 0.35 },
  },
  {
    id: 'basalt',
    name: 'Basalt Deltas',
    caption: 'Light-grey fog and ash drifting down from the ceiling.',
    creature: 'wisp',
    particles: { hi: '#ffd27a', lo: '#ff6a1a', ash: [205, 200, 212], ashRatio: 0.85 },
  },
  {
    id: 'warped',
    name: 'Warped Forest',
    caption: 'Magenta-purple fog and drifting spores. No music here.',
    creature: 'crawler',
    particles: { hi: '#a8f5e0', lo: '#3cd7c0', ash: [150, 190, 200], ashRatio: 0.15 },
  },
  {
    id: 'soul',
    name: 'Soul Sand Valley',
    caption: 'Blue fog, basalt spires and soul fire. Wisps drift here.',
    creature: 'wisp',
    particles: { hi: '#c4f2ff', lo: '#4ad3ff', ash: [150, 200, 220], ashRatio: 0.1 },
  },
];

/**
 * Overworld (day mode) biomes. Same idea as above, in daylight: pollen and falling leaves in the
 * meadow, snow-dust in the pines, warm motes at golden hour. Mosslings and glowflies are
 * original creatures, not game mobs.
 */
export const overworldBiomes = [
  {
    id: 'meadow',
    name: 'Sunny Meadow',
    caption: 'Blue sky, a lake and a stone platform. The portal waits.',
    creature: 'mossling',
    particles: { hi: '#fff7c2', lo: '#ffe27a', ash: [120, 190, 90], ashRatio: 0.3 },
  },
  {
    id: 'pine',
    name: 'Pine Highlands',
    caption: 'Cool air, tall pines and snow-dusted ridges.',
    creature: 'glowfly',
    particles: { hi: '#ffffff', lo: '#d8ecff', ash: [235, 245, 255], ashRatio: 0.85 },
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    caption: 'Autumn leaves and a low sun over the water.',
    creature: 'glowfly',
    particles: { hi: '#ffe7a0', lo: '#ffb347', ash: [220, 150, 60], ashRatio: 0.55 },
  },
];

/** Short true facts shown on the title screen, like Minecraft's yellow splash text. */
export const splashes = [
  'ECM, not ECE!',
  'Prototype labels included!',
  '120-case benchmark!',
  'Now with PatchPilot!',
  'Bundled by esbuild!',
  'No fake skill bars!',
  'Verify everything!',
  'Failure paths tested!',
];

/** Loading-screen tips, each taken from a project README. */
export const tips = [
  'Saathi ships a 120-case synthetic benchmark for its Hindi and Hinglish router.',
  'Smart Waste says plainly that its data is synthetic.',
  'NIRDHOOM keeps service keys on the server, never in the browser.',
  'PatchPilot never clones or executes the code it analyses.',
  'The JYC Website runs CodeQL and Playwright checks in CI.',
];
