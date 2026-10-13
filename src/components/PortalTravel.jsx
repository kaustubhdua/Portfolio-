import { useEffect, useState } from 'react';
import { setDive } from '../lib/voxel/travel.js';

/**
 * Full-screen "walk through the Nether portal" transition between the two worlds.
 *
 *   in   (0 - 1.1 s)   an obsidian gate grows from the middle of the screen until the visitor is
 *                       inside it; the purple portal haze closes in from the edges
 *   hold (1.1 - 1.4 s) full purple swirl; the theme is swapped here, hidden from view
 *   out  (1.4 - 2.6 s) the gate falls away behind you and the haze clears on the other side
 *
 * It only renders while a trip is running, is aria-hidden, and is skipped entirely for
 * reduced-motion visitors (the App swaps the theme instantly for them).
 */
const IN_MS = 1100;
const HOLD_MS = 300;
const OUT_MS = 1200;

export default function PortalTravel({ to, onSwap, onDone }) {
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const timers = [
      setTimeout(onSwap, IN_MS + HOLD_MS / 2),
      setTimeout(() => setPhase('out'), IN_MS + HOLD_MS),
      setTimeout(onDone, IN_MS + HOLD_MS + OUT_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onSwap, onDone]);

  // The 3D camera lunges toward the portal while it grows, then settles back on the far side.
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const ease = (x) => x * x * (3 - 2 * x);
    const tick = (now) => {
      const t = now - t0;
      let v;
      if (t < IN_MS) v = ease(t / IN_MS);
      else if (t < IN_MS + HOLD_MS) v = 1;
      else v = 1 - ease(Math.min(1, (t - IN_MS - HOLD_MS) / OUT_MS));
      setDive(v);
      if (t < IN_MS + HOLD_MS + OUT_MS) raf = requestAnimationFrame(tick);
      else setDive(0);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setDive(0);
    };
  }, []);

  return (
    <div className="travel" data-phase={phase} data-to={to} aria-hidden="true">
      <div className="travel-frame">
        <div className="travel-surface" />
      </div>
      <div className="travel-wash" />
      <div className="travel-vignette" />
    </div>
  );
}
