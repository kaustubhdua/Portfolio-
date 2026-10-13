import { useEffect, useRef, useState } from 'react';
import { portalSound } from '../lib/audio.js';
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
  const swirl = useRef(null);

  // The portal texture itself: a small animated purple swirl, scaled up with hard pixels like the game's.
  useEffect(() => {
    portalSound();
    const canvas = swirl.current;
    const ctx = canvas.getContext('2d');
    const W = 96;
    const H = 54;
    const img = ctx.createImageData(W, H);
    let raf = 0;
    const t0 = performance.now();
    const paint = (now) => {
      const t = (now - t0) / 1000;
      const total = (IN_MS + HOLD_MS + OUT_MS) / 1000;
      // strength: grows in, holds, fades out
      const k = t < IN_MS / 1000 ? t / (IN_MS / 1000) : t < (IN_MS + HOLD_MS) / 1000 ? 1 : Math.max(0, 1 - (t - (IN_MS + HOLD_MS) / 1000) / (OUT_MS / 1000));
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const dx = (x - W / 2) / (W / 2);
          const dy = (y - H / 2) / (H / 2);
          const r = Math.hypot(dx, dy);
          const a = Math.atan2(dy, dx);
          const v = 0.5 + 0.25 * Math.sin(r * 9 - t * 3 + a * 3) + 0.15 * Math.sin(x * 0.45 + t * 2.1) + 0.1 * Math.sin(y * 0.6 - t * 1.7 + x * 0.2);
          const q = Math.max(0, Math.min(1, v));
          const step = Math.floor(q * 5) / 4;
          const i = (y * W + x) * 4;
          img.data[i] = 40 + step * 150;
          img.data[i + 1] = 8 + step * 50;
          img.data[i + 2] = 110 + step * 145;
          const edge = Math.min(1, 0.35 + r * 0.9);
          img.data[i + 3] = Math.min(255, 255 * k * (k > 0.98 ? 1 : edge) * (0.25 + 0.75 * k));
        }
      }
      ctx.putImageData(img, 0, 0);
      if (t < total) raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);

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
      <canvas ref={swirl} className="travel-swirl" width="96" height="54" />
      <p className="travel-note pixel">{phase === 'in' ? 'Entering portal...' : 'Loading terrain...'}</p>
      <div className="travel-wash" />
      <div className="travel-vignette" />
    </div>
  );
}
