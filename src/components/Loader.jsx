import { useEffect, useRef, useState } from 'react';
import { tips } from '../data/biomes.js';

const MIN_MS = 900;
const MAX_MS = 4000;
// The lava layer is shared by every biome; the rest belong to the default Crimson Forest.
const LAYERS = ['img/hero/lava.png', ...['sky', 'far', 'mid', 'near', 'fore'].map((n) => `img/hero/crimson/${n}.png`)];
const STEPS = ['Lighting the portal...', 'Building terrain...', 'Spawning embers...'];

/**
 * World-entry screen that tracks the real work: the hero art is decoded in the background and
 * the bar fills as each layer arrives. It stays for at least a moment so it never flashes, gives
 * up waiting after a few seconds, and is skippable by button, click or key. Never shown to
 * reduced-motion users or on repeat visits in the same session.
 */
export default function Loader({ onDone }) {
  const buttonRef = useRef(null);
  const [loaded, setLoaded] = useState(0);
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    const started = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };
    let count = 0;
    const timers = [setTimeout(finish, MAX_MS)];
    const settle = () => {
      count += 1;
      setLoaded(count);
      if (count === LAYERS.length) timers.push(setTimeout(finish, Math.max(0, MIN_MS - (performance.now() - started))));
    };
    for (const src of LAYERS) {
      const img = new Image();
      img.onload = settle;
      img.onerror = settle;
      img.src = src;
    }
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      finished = true;
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  const progress = loaded / LAYERS.length;
  const step = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));

  return (
    <div className="loader" role="status" aria-live="polite" onClick={onDone}>
      <div className="loader-portal" aria-hidden="true" />
      <p className="loader-title pixel">Entering the Nether</p>
      <p className="loader-status pixel" aria-hidden="true">{STEPS[step]}</p>
      <div className="loader-bar" aria-hidden="true">
        <span className="is-live" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <p className="loader-tip"><strong>Did you know?</strong> {tip}</p>
      <button ref={buttonRef} type="button" className="loader-skip pixel" onClick={onDone}>
        Skip
      </button>
    </div>
  );
}
