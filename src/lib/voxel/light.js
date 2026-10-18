import { EMIT, OPAQUE, SHAPED } from './blocks.js';

/**
 * Light is two separate 0-15 channels: sky light (the Overworld only) and block light from
 * lamps, lava, fire and glowstone. Both spread outwards losing one level per block.
 */
export function computeLight(grid, withSky) {
  const { w, h, l, data } = grid;
  const total = w * h * l;
  const sky = new Uint8Array(total);
  const blk = new Uint8Array(total);
  const queue = new Int32Array(total);
  const stepX = 1;
  const stepZ = w;
  const stepY = w * l;

  const spread = (level, seeds) => {
    let head = 0;
    let tail = 0;
    for (const s of seeds) queue[tail++] = s;
    while (head < tail) {
      const i = queue[head++];
      const v = level[i] - 1;
      if (v <= 0) continue;
      const x = i % w;
      const z = ((i / w) | 0) % l;
      const y = (i / stepY) | 0;
      const tryCell = (j) => {
        if (OPAQUE[data[j]] || level[j] >= v) return;
        level[j] = v;
        queue[tail++] = j;
      };
      if (x > 0) tryCell(i - stepX);
      if (x < w - 1) tryCell(i + stepX);
      if (z > 0) tryCell(i - stepZ);
      if (z < l - 1) tryCell(i + stepZ);
      if (y > 0) tryCell(i - stepY);
      if (y < h - 1) tryCell(i + stepY);
    }
  };

  const blockSeeds = [];
  for (let i = 0; i < total; i++) {
    const e = EMIT[data[i]];
    if (e) {
      blk[i] = e;
      blockSeeds.push(i);
    }
  }
  spread(blk, blockSeeds);

  if (withSky) {
    const skySeeds = [];
    for (let z = 0; z < l; z++)
      for (let x = 0; x < w; x++) {
        for (let y = h - 1; y >= 0; y--) {
          const i = y * stepY + z * stepZ + x;
          if (OPAQUE[data[i]]) break;
          sky[i] = 15;
          skySeeds.push(i);
        }
      }
    spread(sky, skySeeds);
  }
  // A stair or slab blocks light but is not a whole cube, so its faces (and the faces of cubes beside it) should be
  // lit like the open air next to it: give each such cell the brightest light around it.
  for (let i = 0; i < total; i++) {
    const id = data[i];
    if (!SHAPED[id] || !OPAQUE[id]) continue;
    const x = i % w;
    const z = ((i / w) | 0) % l;
    const y = (i / stepY) | 0;
    let s = 0;
    let b = 0;
    const look = (j) => {
      if (sky[j] > s) s = sky[j];
      if (blk[j] > b) b = blk[j];
    };
    if (x > 0) look(i - stepX);
    if (x < w - 1) look(i + stepX);
    if (z > 0) look(i - stepZ);
    if (z < l - 1) look(i + stepZ);
    if (y > 0) look(i - stepY);
    if (y < h - 1) look(i + stepY);
    sky[i] = s;
    blk[i] = b;
  }
  return { sky, blk };
}
