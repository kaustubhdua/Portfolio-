import { useEffect, useRef, useState } from 'react';
import { tips } from '../data/biomes.js';

const DURATION = 1800;
const STEPS = ['Lighting the portal...', 'Building terrain...', 'Spawning embers...'];

/** Brief world-entry screen. Skippable by button, click or key; never shown to reduced-motion users. */
export default function Loader({ onDone }) {
  const buttonRef = useRef(null);
  const [step, setStep] = useState(0);
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    const timer = setTimeout(onDone, DURATION);
    const stepTimers = [1, 2].map((n) => setTimeout(() => setStep(n), (DURATION / 3) * n));
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      stepTimers.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  return (
    <div className="loader" role="status" aria-live="polite" onClick={onDone}>
      <div className="loader-portal" aria-hidden="true" />
      <p className="loader-title pixel">Entering the Nether</p>
      <p className="loader-status pixel" aria-hidden="true">{STEPS[step]}</p>
      <div className="loader-bar" aria-hidden="true">
        <span style={{ animationDuration: `${DURATION}ms` }} />
      </div>
      <p className="loader-tip"><strong>Did you know?</strong> {tip}</p>
      <button ref={buttonRef} type="button" className="loader-skip pixel" onClick={onDone}>
        Skip
      </button>
    </div>
  );
}
