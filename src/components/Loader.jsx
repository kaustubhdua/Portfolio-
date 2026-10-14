import { useEffect, useRef, useState } from 'react';
import { tips } from '../data/biomes.js';
import { getLoad, onLoad } from '../lib/voxel/travel.js';

const MIN_MS = 1400;
const MAX_MS = 9000;
const PHASES = [
  [0, 'Loading world'],
  [0.12, 'Generating terrain'],
  [0.4, 'Building terrain'],
  [0.7, 'Preparing spawn area'],
];

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
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    const started = performance.now();
    let finished = false;
    let doneTimer = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
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
  }, [onDone]);

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

  return (
    <div className={`loader loader-world loader-${world}`} role="status" aria-live="polite" onClick={onDone}>
      <div className="loader-cube" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>
      <p className="loader-title pixel">{phase}{percent > 0 && percent < 100 ? `: ${percent}%` : ''}</p>
      <div className="loader-bar" aria-hidden="true">
        <span className="is-live" style={{ transform: `scaleX(${shown})` }} />
      </div>
      <p className="loader-tip"><strong>Did you know?</strong> {tip}</p>
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
        <button ref={buttonRef} type="button" className="loader-skip pixel" onClick={onDone}>
          Skip
        </button>
      </div>
    </div>
  );
}
