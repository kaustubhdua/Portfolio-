import { useEffect, useRef } from 'react';

const DURATION = 1800;

/** Brief world-entry screen. Skippable by button, click or key; never shown to reduced-motion users. */
export default function Loader({ onDone }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    const timer = setTimeout(onDone, DURATION);
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  return (
    <div className="loader" role="status" aria-live="polite" onClick={onDone}>
      <div className="loader-portal" aria-hidden="true" />
      <p className="loader-title pixel">Entering the Nether</p>
      <div className="loader-bar" aria-hidden="true">
        <span style={{ animationDuration: `${DURATION}ms` }} />
      </div>
      <button ref={buttonRef} type="button" className="loader-skip pixel" onClick={onDone}>
        Skip
      </button>
    </div>
  );
}
