import { useEffect, useRef, useState } from 'react';
import { getExploreApi } from '../lib/voxel/travel.js';
import { placeSound } from '../lib/audio.js';

const SLOTS = [
  { name: 'Planks', cls: 'slot-planks' },
  { name: 'Cobblestone', cls: 'slot-cobble' },
  { name: 'Glass', cls: 'slot-glass' },
  { name: 'Lamp', cls: 'slot-lamp' },
];

/**
 * Everything shown while exploring freely: a crosshair, the hotbar, key hints and, on touch
 * screens, a joystick, a look area and jump / place buttons. The rest of the page is hidden.
 */
export default function ExploreHud({ onExit }) {
  const [slot, setSlot] = useState(0);
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches);
  const [hint, setHint] = useState(true);
  const stickRef = useRef(null);
  const knobRef = useRef(null);
  const api = getExploreApi();

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 9000);
    const onKey = (e) => {
      if (e.code === 'Escape') onExit();
      if (/^Digit[1-4]$/.test(e.code)) setSlot(Number(e.code.slice(5)) - 1);
    };
    // Esc releases the mouse capture; treat that as "leave"
    let locked = false;
    const onLock = () => {
      if (document.pointerLockElement) locked = true;
      else if (locked) onExit();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerlockchange', onLock);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerlockchange', onLock);
    };
  }, [onExit]);

  // joystick
  useEffect(() => {
    const el = stickRef.current;
    if (!el || !touch) return undefined;
    let id = null;
    let ox = 0;
    let oy = 0;
    const R = 46;
    const set = (x, y) => {
      const dx = Math.max(-R, Math.min(R, x - ox));
      const dy = Math.max(-R, Math.min(R, y - oy));
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      api?.moveInput(dx / R, -dy / R);
    };
    const down = (e) => {
      if (id !== null) return;
      id = e.pointerId;
      const r = el.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
      el.setPointerCapture(id);
      set(e.clientX, e.clientY);
    };
    const move = (e) => e.pointerId === id && set(e.clientX, e.clientY);
    const up = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      knobRef.current.style.transform = '';
      api?.moveInput(0, 0);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      api?.moveInput(0, 0);
    };
  }, [touch, api]);

  // drag to look (touch) when the pointer is not captured
  const lookRef = useRef(null);
  useEffect(() => {
    const el = lookRef.current;
    if (!el || !touch) return undefined;
    let id = null;
    let lx = 0;
    let ly = 0;
    let moved = 0;
    const down = (e) => {
      if (id !== null) return;
      id = e.pointerId;
      lx = e.clientX;
      ly = e.clientY;
      moved = 0;
      el.setPointerCapture(id);
    };
    const move = (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      api?.lookBy(dx * 0.006, dy * 0.006);
    };
    const up = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      if (moved < 8) api?.tap(e.clientX, e.clientY);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [touch, api]);

  const choose = (i) => {
    setSlot(i);
    api?.select(i);
  };

  return (
    <div className="explore-hud" data-touch={touch ? 'yes' : 'no'}>
      <button type="button" className="explore-exit pixel" onClick={onExit}>
        Leave world {!touch && <span aria-hidden="true">Esc</span>}
      </button>
      {!touch && <div className="crosshair" aria-hidden="true" />}
      {hint && (
        <p className="explore-hint pixel" role="status">
          {touch ? 'Left thumb moves · drag the right side to look · tap to dig' : 'WASD to walk · Space to jump · Shift to sprint · click to dig · right-click to place'}
        </p>
      )}
      <ul className="hotbar" aria-label="Blocks you can place">
        {SLOTS.map((s, i) => (
          <li key={s.name}>
            <button type="button" className={`hotbar-slot ${s.cls}${slot === i ? ' is-on' : ''}`} aria-pressed={slot === i} aria-label={`${s.name} (${i + 1})`} onClick={() => choose(i)}>
              <span aria-hidden="true">{i + 1}</span>
            </button>
          </li>
        ))}
      </ul>
      {touch && (
        <>
          <div className="look-area" ref={lookRef} aria-hidden="true" />
          <div className="stick" ref={stickRef} aria-label="Move joystick" role="presentation">
            <div className="stick-knob" ref={knobRef} />
          </div>
          <button type="button" className="ex-btn ex-jump pixel" onPointerDown={() => api?.jumpInput(true)} onPointerUp={() => api?.jumpInput(false)} onPointerCancel={() => api?.jumpInput(false)}>
            Jump
          </button>
          <button
            type="button"
            className="ex-btn ex-place pixel"
            onClick={() => {
              if (api?.placeBlock()) placeSound();
            }}
          >
            Place
          </button>
        </>
      )}
    </div>
  );
}
