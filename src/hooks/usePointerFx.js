import { useEffect } from 'react';

const GLOW = '.panel, .card, .adv, .slot-step';
const TILT = '.card';

/**
 * One delegated pointer listener drives two effects, so no per-card handlers exist:
 * a spotlight that follows the cursor inside panels and cards, and a gentle 3D tilt on
 * project cards. Both are skipped for touch input, and tilt is skipped for reduced motion.
 */
export function usePointerFx() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches) return undefined;

    let raf = 0;
    let last = null;
    let tilted = null;

    const resetTilt = () => {
      if (!tilted) return;
      tilted.style.removeProperty('--rx');
      tilted.style.removeProperty('--ry');
      tilted = null;
    };

    const apply = () => {
      raf = 0;
      const e = last;
      if (!e || !(e.target instanceof Element)) return;

      const glow = e.target.closest(GLOW);
      if (glow) {
        const r = glow.getBoundingClientRect();
        glow.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`);
        glow.style.setProperty('--my', `${Math.round(e.clientY - r.top)}px`);
      }

      const card = reduced.matches ? null : e.target.closest(TILT);
      if (card !== tilted) resetTilt();
      if (card) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
        tilted = card;
      }
    };

    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      resetTilt();
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      resetTilt();
    };
  }, []);
}
