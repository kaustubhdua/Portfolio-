import { useCallback, useEffect, useRef, useState } from 'react';
import { tips } from '../data/biomes.js';
import { getLoad, onLoad } from '../lib/voxel/travel.js';

const MIN_MS = 1400;
const MAX_MS = 9000;
const FADE_MS = 300;
const SEGMENTS = 20;
const GRID = 11; // the square of chunks drawn while the spawn area is prepared
const PHASES = [
  [0, 'Loading world'],
  [0.12, 'Generating terrain'],
  [0.4, 'Building terrain'],
  [0.7, 'Preparing spawn area'],
];

// Cells of the grid in spiral order from the centre, so the grid fills outward like the game's.
const RANK = (() => {
  const out = [];
  let x = Math.floor(GRID / 2);
  let y = x;
  let dx = 1;
  let dy = 0;
  let len = 1;
  while (out.length < GRID * GRID) {
    for (let t = 0; t < 2 && out.length < GRID * GRID; t++) {
      for (let i = 0; i < len && out.length < GRID * GRID; i++) {
        out.push(y * GRID + x);
        x += dx;
        y += dy;
      }
      [dx, dy] = [-dy, dx];
    }
    len++;
  }
  const rank = [];
  out.forEach((cell, k) => (rank[cell] = k));
  return rank; // rank[cell] = when that cell fills
})();

const savedWorld = () => {
  try {
    return localStorage.getItem('portfolio-world') === 'overworld' ? 'overworld' : 'nether';
  } catch {
    return 'nether';
  }
};

/**
 * World-entry screen in the style of the game's own: a tiled block-texture background, a status
 * line and a percentage. The percentage is real: it follows the 3D world being built behind it
 * (or jumps straight to 100% when the page runs without 3D). It stays for at least a moment so it
 * never flashes, gives up waiting after a few seconds, and is skippable by button, click or key.
 * Never shown to reduced-motion users or on repeat visits in the same session.
 */
export default function Loader({ onDone, soundOn = false, onSound }) {
  const buttonRef = useRef(null);
  const [progress, setProgress] = useState(getLoad());
  const [world] = useState(savedWorld);
  // Reuse the tip already painted by the static boot screen so the hand-off does not change text.
  const [tip] = useState(
    () => document.querySelector('#boot .loader-tip span')?.textContent || tips[Math.floor(Math.random() * tips.length)],
  );
  const [leaving, setLeaving] = useState(false);
  const leftRef = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const leave = useCallback(() => {
    if (leftRef.current) return;
    leftRef.current = true;
    setLeaving(true);
    setTimeout(() => doneRef.current(), FADE_MS);
  }, []);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    const started = performance.now();
    let finished = false;
    let doneTimer = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      leave();
    };
    const timers = [setTimeout(finish, MAX_MS)];
    const check = (v) => {
      setProgress(v);
      if (v >= 1 && !doneTimer) doneTimer = setTimeout(finish, Math.max(300, MIN_MS - (performance.now() - started)));
    };
    check(getLoad());
    const off = onLoad(check);
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      finished = true;
      off();
      clearTimeout(doneTimer);
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
    };
  }, [leave]);

  // Ease the shown number so it never jumps backwards or stalls visibly.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setShown((s) => {
        const next = s + (progress - s) * 0.12 + 0.002;
        return Math.min(progress, next);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const percent = Math.min(100, Math.floor(shown * 100));
  const phase = [...PHASES].reverse().find(([at]) => shown >= at)[1];

  const filled = Math.floor(shown * SEGMENTS) / SEGMENTS;

  return (
    <div
      className={`loader loader-${world}${leaving ? ' is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      onClick={leave}
    >
      <div className="chunk-grid" aria-hidden="true" style={{ '--n': GRID }}>
        {Array.from({ length: GRID * GRID }, (_, cell) => {
          const k = RANK[cell];
          const at = shown * GRID * GRID;
          return <i key={cell} className={k < at - 6 ? 'is-done' : k < at ? 'is-busy' : ''} />;
        })}
      </div>
      <span className="sr-only">{phase}</span>
      <p className="loader-title pixel" aria-hidden="true">{phase}{percent > 0 && percent < 100 ? `: ${percent}%` : ''}</p>
      <div className="loader-bar" aria-hidden="true">
        <span className="is-live" style={{ width: `${filled * 100}%` }} />
      </div>
      <p className="loader-tip" aria-hidden="true"><strong>Did you know?</strong> <span>{tip}</span></p>
      <div className="loader-actions">
        <button
          type="button"
          className="loader-skip pixel"
          aria-pressed={soundOn}
          onClick={(e) => {
            e.stopPropagation();
            onSound?.();
          }}
        >
          Sound: {soundOn ? 'On' : 'Off'}
        </button>
        <button ref={buttonRef} type="button" className="loader-skip pixel" onClick={leave}>
          Skip
        </button>
      </div>
    </div>
  );
}
