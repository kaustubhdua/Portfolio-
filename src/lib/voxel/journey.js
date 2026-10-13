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

/** Maps the page scroll position to a position along the path using the real section centres. */
export function scrollToProgress(ids, scrollY, viewH) {
  const probe = scrollY + viewH * 0.5;
  const centres = [];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    centres.push(r.top + window.scrollY + r.height / 2);
  }
  if (centres.length < 2) return 0;
  if (probe <= centres[0]) return 0;
  for (let i = 1; i < centres.length; i++) {
    if (probe <= centres[i]) return i - 1 + (probe - centres[i - 1]) / (centres[i] - centres[i - 1]);
  }
  return centres.length - 1;
}
