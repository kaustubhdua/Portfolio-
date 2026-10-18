/**
 * Adaptive render resolution, kept free of the DOM and WebGL so it can be tested on its own.
 *
 * The renderer feeds in the average frame time (ms) of each 40-frame window and gets back whether
 * the drawing scale changed (1 = one canvas pixel per CSS pixel). It draws smaller when frames run
 * long and creeps back up when the device keeps up, so a hiccup while the world builds does not
 * leave the picture blurry for the rest of the visit.
 *
 * "Keeping up" has to include a plain 60 Hz screen, whose frames are 16.7 ms apart. (An earlier
 * version waited for under 14 ms, which only 90 Hz or faster screens ever reach, so on a normal
 * screen the picture stayed small for good after any slow moment.)
 *
 * A size that is too much for the device is remembered as a ceiling (`cap`), so a borderline device
 * settles just below it instead of bouncing between two sizes. The ceiling is only tested again after
 * a long calm stretch.
 */
export const MIN_SCALE = 0.55;
export const SLOW_MS = 26; // above this a window is slow: draw smaller
export const FAST_MS = 19; // at or below this the device keeps up with a 60 Hz screen, with some jitter
const STEP_DOWN = 0.15;
const STEP_UP = 0.1;
const NEED = 3; // fast windows in a row before trying a bigger size (about two seconds)
const RETRY = 60; // fast windows at the ceiling before testing whether the ceiling can go up (about 40 s)

/** `max` is the sharpest size to allow; `start` (default `max`) is where to begin. */
export function createQuality(max, start = max) {
  return { scale: Math.min(max, Math.max(MIN_SCALE, start)), max, cap: max, good: 0, stable: 0, justRose: false };
}

/** Where to begin: lower on phones and weak machines, then rise to `max` once they prove they can. */
export function startScale(max, { coarse = false, cores = 8, memory = 8 } = {}) {
  return coarse || cores <= 4 || memory <= 4 ? max * 0.75 : max;
}

/** Feeds one window's average frame time. Returns true when `q.scale` changed. */
export function stepQuality(q, avg) {
  if (avg > SLOW_MS) {
    q.good = 0;
    q.stable = 0;
    if (q.scale <= MIN_SCALE) {
      q.justRose = false;
      return false;
    }
    // Slow straight after a rise: that size is too much for this device, so the size below is the ceiling.
    if (q.justRose) q.cap = Math.max(MIN_SCALE, q.scale - STEP_UP);
    q.justRose = false;
    q.scale = Math.max(MIN_SCALE, q.scale - STEP_DOWN);
    return true;
  }
  q.justRose = false; // a window at this size that was not slow: the size is acceptable
  if (avg <= FAST_MS) {
    if (q.scale >= q.cap) {
      q.good = 0;
      if (++q.stable >= RETRY && q.cap < q.max) {
        q.cap = Math.min(q.max, q.cap + STEP_UP);
        q.stable = 0;
      }
      return false;
    }
    if (++q.good >= NEED) {
      q.good = 0;
      q.justRose = true;
      q.scale = Math.min(q.cap, q.scale + STEP_UP);
      return true;
    }
    return false;
  }
  q.good = 0; // in between: neither draw smaller nor try bigger
  return false;
}
