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
  '6 upstream PRs merged!',
  'NSoC Campus Ambassador!',
  '120-case benchmark!',
  'No fake skill bars!',
  'Verify everything!',
  'Failure paths tested!',
  'Webhook retries matter!',
  'Path safety tested!',
  'Built at JIIT Noida!',
];

/** Loading-screen tips draw only from the five selected case studies and this portfolio. */
export const tips = [
  'JIIT Youth Club 128 pairs rich interactions with accessible navigation.',
  'RideForge expires driver offers after 45 seconds.',
  'BharatSim separates planned tests from executed device evidence.',
  'SATARK links investigation findings to preserved source evidence.',
  'Saathi tests Hindi and Hinglish intent routing on synthetic cases.',
  'Press Ctrl+K to open the keyboard command palette.',
  'Free roam hides the page and lets you explore the world.',
  'Every texture and sound here is generated in-house.',
  'Reduced motion skips the portal transition.',
  'The portfolio uses a custom WebGL 2 voxel renderer.',
  'Six upstream Lemma Platform pull requests have merged.',
  'The site remains readable without the 3D scene.',
];
