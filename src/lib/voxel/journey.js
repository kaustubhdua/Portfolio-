/** The camera path: one stop per section of the page, and a smooth spline between them. */

export const STOP_Z = [6, 40, 70, 100, 130, 160, 190];
export const CENTER_X = 32;
const WEAVE = [0, 0.9, -0.8, 0.7, -0.9, 0.8, 0];

// yaw 0 looks down the road (+z); positive yaw turns toward +x. Pitch is up when positive.
const LOOK = {
  overworld: [[0, 0.1], [-0.35, 0.0], [0.32, -0.02], [-0.5, 0.02], [0.45, 0.06], [0.42, 0.02], [0.0, 0.0]],
  nether: [[0, 0.1], [-0.45, 0.04], [0.4, -0.02], [-0.3, 0.06], [0.5, 0.08], [0.0, 0.02], [0.0, 0.0]],
};
export const EYE = 1.62;

export function stopsFor(world, surfaceY) {
  return STOP_Z.map((z, i) => ({
    x: CENTER_X + WEAVE[i],
    y: surfaceY + EYE,
    z,
    yaw: LOOK[world][i][0],
    pitch: LOOK[world][i][1],
  }));
}

const cr = (p0, p1, p2, p3, t) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/** Samples the spline at s in [0, stops.length - 1]. */
export function sampleCamera(stops, s, out = {}) {
  const n = stops.length - 1;
  const c = Math.min(n, Math.max(0, s));
  const i = Math.min(n - 1, Math.floor(c));
  const t = c - i;
  const a = stops[Math.max(0, i - 1)];
  const b = stops[i];
  const d = stops[i + 1];
  const e = stops[Math.min(n, i + 2)];
  for (const k of ['x', 'y', 'z', 'yaw', 'pitch']) out[k] = cr(a[k], b[k], d[k], e[k], t);
  return out;
}

/**
 * Maps the page scroll position to a position along the path. A section's own top edge is its
 * anchor: when you have scrolled so that section i starts at the top of the screen, the camera
 * stands at stop i. The last anchors are pulled back so a short final page can still reach them.
 */
export function scrollToProgress(ids, scrollY, viewH) {
  const tops = [];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    tops.push(el.getBoundingClientRect().top + window.scrollY);
  }
  if (tops.length < 2) return 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewH);
  const last = tops.length - 1;
  const anchors = tops.map((t, i) => Math.min(t, maxScroll - (last - i)));
  anchors[0] = Math.min(anchors[0], 0);
  if (scrollY <= anchors[0]) return 0;
  for (let i = 1; i <= last; i++) {
    if (scrollY <= anchors[i]) return i - 1 + (scrollY - anchors[i - 1]) / Math.max(1, anchors[i] - anchors[i - 1]);
  }
  return last;
}
