import { B, SOLID } from './blocks.js';

/** Free-roam walking physics for the "explore" mode. Pure: it only needs the block grid. */
export const EYE_HEIGHT = 1.62;
const HALF = 0.3; // half the body width
const HEIGHT = 1.8;
const GRAVITY = 26;
const JUMP = 8.4;

export function createPlayer(x, feetY, z, yaw = 0, pitch = 0) {
  return { x, y: feetY, z, vx: 0, vy: 0, vz: 0, yaw, pitch, onGround: false, swimming: false, safe: [x, feetY, z], burned: 0 };
}

function blockedAt(grid, x, y, z) {
  const x0 = Math.floor(x - HALF);
  const x1 = Math.floor(x + HALF);
  const z0 = Math.floor(z - HALF);
  const z1 = Math.floor(z + HALF);
  const y0 = Math.floor(y + 0.001);
  const y1 = Math.floor(y + HEIGHT - 0.001);
  for (let yy = y0; yy <= y1; yy++)
    for (let zz = z0; zz <= z1; zz++)
      for (let xx = x0; xx <= x1; xx++) if (SOLID[grid.get(xx, yy, zz)]) return true;
  return false;
}

/**
 * Advances the player by dt seconds. input = { fx, fz, jump, sprint }: fx is strafe (+ right) and
 * fz is forward, both in -1..1. Returns an event name ('burn' after touching lava) or null.
 */
export function stepPlayer(p, grid, input, dt) {
  dt = Math.min(dt, 0.05);
  const sy = Math.sin(p.yaw);
  const cy = Math.cos(p.yaw);
  let wx = cy * input.fx + sy * input.fz;
  let wz = -sy * input.fx + cy * input.fz;
  const len = Math.hypot(wx, wz);
  if (len > 1) {
    wx /= len;
    wz /= len;
  }
  const speed = (input.sprint ? 5.8 : 4.3) * (p.swimming ? 0.5 : 1);
  const ease = Math.min(1, dt * (p.onGround ? 14 : 4));
  p.vx += (wx * speed - p.vx) * ease;
  p.vz += (wz * speed - p.vz) * ease;

  const feet = grid.get(Math.floor(p.x), Math.floor(p.y + 0.2), Math.floor(p.z));
  const head = grid.get(Math.floor(p.x), Math.floor(p.y + 1.4), Math.floor(p.z));
  p.swimming = feet === B.WATER || head === B.WATER;
  let event = null;
  if (feet === B.LAVA || grid.get(Math.floor(p.x), Math.floor(p.y - 0.1), Math.floor(p.z)) === B.LAVA) {
    p.x = p.safe[0];
    p.y = p.safe[1];
    p.z = p.safe[2];
    p.vx = p.vy = p.vz = 0;
    p.burned++;
    return 'burn';
  }

  if (p.swimming) {
    p.vy += (-2 - p.vy) * Math.min(1, dt * 3);
    if (input.jump) p.vy = 3.2;
  } else {
    p.vy -= GRAVITY * dt;
    if (input.jump && p.onGround) {
      p.vy = JUMP;
      p.onGround = false;
    }
  }
  p.vy = Math.max(p.vy, -40);

  // horizontal, one axis at a time; walking into a one-block step jumps it (like touch-screen auto-jump)
  const nx = p.x + p.vx * dt;
  if (!blockedAt(grid, nx, p.y, p.z)) p.x = nx;
  else {
    if (p.onGround && (input.fx || input.fz) && !blockedAt(grid, nx, p.y + 1.01, p.z)) p.vy = JUMP * 0.86;
    p.vx = 0;
  }
  const nz = p.z + p.vz * dt;
  if (!blockedAt(grid, p.x, p.y, nz)) p.z = nz;
  else {
    if (p.onGround && (input.fx || input.fz) && !blockedAt(grid, p.x, p.y + 1.01, nz)) p.vy = JUMP * 0.86;
    p.vz = 0;
  }

  const ny = p.y + p.vy * dt;
  if (!blockedAt(grid, p.x, ny, p.z)) {
    p.y = ny;
    p.onGround = false;
  } else if (p.vy < 0) {
    p.y = Math.floor(ny) + 1;
    p.vy = 0;
    p.onGround = true;
  } else {
    p.y = Math.floor(ny + HEIGHT) - HEIGHT - 0.001;
    p.vy = 0;
  }

  p.x = Math.min(grid.w - 0.6, Math.max(0.6, p.x));
  p.z = Math.min(grid.l - 0.6, Math.max(0.6, p.z));
  if (p.y < -5) {
    p.x = p.safe[0];
    p.y = p.safe[1];
    p.z = p.safe[2];
    p.vx = p.vy = p.vz = 0;
    event = 'fall';
  }
  // remember a spot that is solid ground with a little room, to come back to after lava or a fall
  if (p.onGround) {
    const below = grid.get(Math.floor(p.x), Math.floor(p.y) - 1, Math.floor(p.z));
    if (SOLID[below] && below !== B.LAVA) {
      const edgeSafe = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dz]) => SOLID[grid.get(Math.floor(p.x) + dx, Math.floor(p.y) - 1, Math.floor(p.z) + dz)]);
      if (edgeSafe) p.safe = [p.x, p.y, p.z];
    }
  }
  return event;
}

/** The camera position for a player: eye height plus a small walking bob. */
export const eyeOf = (p, bob = 0) => [p.x, p.y + EYE_HEIGHT + bob, p.z];
