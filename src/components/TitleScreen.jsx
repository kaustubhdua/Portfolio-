import { useEffect, useRef, useState } from 'react';
import { splashes } from '../data/splashes.js';

const savedWorld = () => {
  try {
    return localStorage.getItem('portfolio-world') === 'overworld' ? 'overworld' : 'nether';
  } catch {
    return 'nether';
  }
};

const pick = (not) => {
  let s;
  do s = splashes[Math.floor(Math.random() * splashes.length)];
  while (s === not && splashes.length > 1);
  return s;
};

/**
 * The first screen of a visit, laid out like a game's title screen: a big block-letter logo, a yellow
 * splash that tilts and pulses (click it for another), a short menu and a small legal line. The 3D
 * world is already building behind it. Choosing an entry starts the world-loading screen.
 * Never shown to reduced-motion visitors or on repeat visits in the same session.
 */
export default function TitleScreen({ onChoose, soundOn, onSound, quick, onQuick }) {
  const [world] = useState(savedWorld);
  const [splash, setSplash] = useState(() => pick(''));
  const menu = useRef(null);
  const playRef = useRef(null);

  useEffect(() => {
    playRef.current?.focus({ preventScroll: true });
  }, []);

  const onKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...menu.current.querySelectorAll('button')];
    const i = items.indexOf(document.activeElement);
    const next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    next?.focus();
    e.preventDefault();
  };

  return (
    <div className={`title-screen title-${world}`} role="dialog" aria-modal="true" aria-label="Title screen" onKeyDown={onKey}>
      <header className="title-logo">
        <h1 className="pixel">
          <span>Kaustubh</span> <span>Dua</span>
        </h1>
        <p className="title-edition pixel">Portfolio Edition</p>
        <button
          type="button"
          className={`title-splash pixel${splash.length > 22 ? ' is-long' : ''}`}
          aria-label={`Splash text: ${splash}. Activate for another.`}
          onClick={() => setSplash((s) => pick(s))}
        >
          {splash}
        </button>
      </header>

      <nav className="title-menu" aria-label="Start" ref={menu}>
        <button ref={playRef} type="button" className="mc-button pixel" onClick={() => onChoose('play')}>
          Play
        </button>
        <button type="button" className="mc-button pixel" onClick={() => onChoose('explore')}>
          Free roam
        </button>
        <button type="button" className="mc-button pixel" onClick={() => onChoose('contact')}>
          Contact
        </button>
        <div className="title-row">
          <button type="button" className="mc-button pixel" aria-pressed={soundOn} onClick={onSound}>
            Sound: {soundOn ? 'On' : 'Off'}
          </button>
          <button type="button" className="mc-button pixel" aria-pressed={quick} onClick={onQuick}>
            Quick view: {quick ? 'On' : 'Off'}
          </button>
        </div>
      </nav>

      <footer className="title-foot">
        <span>Portfolio 2026</span>
        <span>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</span>
      </footer>
    </div>
  );
}
