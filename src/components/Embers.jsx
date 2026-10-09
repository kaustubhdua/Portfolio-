import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useMedia.js';

/**
 * Floating embers and ash on a single canvas. Pauses when the tab is hidden or the hero
 * is off screen, caps its particle count by viewport size, and draws one static frame
 * for reduced-motion users.
 */
export default function Embers() {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let onScreen = true;
    let last = 0;
    let slowFrames = 0;
    let particles = [];

    const make = (initial) => {
      const ash = Math.random() < 0.35;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: ash ? 1 + Math.random() * 1.5 : 1 + Math.random() * 2,
        vy: ash ? 6 + Math.random() * 10 : -(10 + Math.random() * 28),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.4 + Math.random() * 0.8,
        drift: ash ? 6 + Math.random() * 8 : 8 + Math.random() * 14,
        life: Math.random(),
        ash,
      };
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(24, (w * h) / 22000)));
      particles = Array.from({ length: count }, () => make(true));
      if (reduced) draw(0);
    };

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.sway += p.swaySpeed * dt;
        p.y += p.vy * dt;
        p.x += Math.sin(p.sway) * p.drift * dt;
        p.life += dt * 0.25;
        if (p.y < -10 || p.y > h + 12) Object.assign(p, make(false), { y: p.ash ? -8 : h + 8 });
        const flicker = 0.65 + 0.35 * Math.sin(p.life * 6 + p.sway);
        const px = Math.round(p.x / 2) * 2;
        const py = Math.round(p.y / 2) * 2;
        const s = Math.max(2, Math.round(p.r) * 2);
        if (p.ash) {
          ctx.fillStyle = `rgba(190,170,180,${0.28 * flicker})`;
        } else {
          const t = Math.max(0, Math.min(1, 1 - p.y / h));
          ctx.fillStyle = t > 0.55 ? `rgba(255,210,122,${0.9 * flicker})` : `rgba(255,106,26,${0.85 * flicker})`;
        }
        ctx.fillRect(px, py, s, s);
      }
    }

    const frame = (t) => {
      if (!running) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      // Back off on weak devices: if frames take too long, thin the particle field.
      if (dt > 0.034) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 40 && particles.length > 16) {
        particles.length = Math.floor(particles.length * 0.7);
        slowFrames = 0;
      }
      last = t;
      draw(dt);
      raf = requestAnimationFrame(frame);
    };

    const sync = () => {
      const should = !reduced && onScreen && !document.hidden;
      if (should && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="embers" aria-hidden="true" />;
}
