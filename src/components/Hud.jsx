import { useEffect, useRef } from 'react';
import { sections } from '../data/profile.js';

/**
 * Minecraft-style experience bar. Scroll progress fills the bar and the level is the
 * number of the section the reader is in, like the HUD above the hotbar. Decorative only:
 * the navigation already announces the current section.
 */
export default function Hud({ active }) {
  const barRef = useRef(null);
  const level = Math.max(1, sections.findIndex((s) => s.id === active) + 1);

  useEffect(() => {
    const bar = barRef.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty('--xp', p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={barRef} className={`hud${active === sections[0].id ? ' is-idle' : ''}`} aria-hidden="true">
      <span className="hud-level pixel">{level}</span>
      <div className="hud-xp">
        <span className="hud-fill" />
      </div>
    </div>
  );
}
