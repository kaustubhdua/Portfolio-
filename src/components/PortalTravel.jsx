import { useEffect, useState } from 'react';

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
