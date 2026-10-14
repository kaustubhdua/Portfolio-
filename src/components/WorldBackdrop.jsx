import { useEffect, useRef, useState } from 'react';
import { blockSound, mobSound, placeSound, stepSound } from '../lib/audio.js';
import { onDive, setExploreApi, setLoad, setMode } from '../lib/voxel/travel.js';

// Anything the visitor can actually use must keep its own clicks; only empty space reaches the world.
const SOLID_UI = 'a,button,input,textarea,select,summary,label,dialog,nav,.panel,.card,.stat,.chat,.hud,.biome-picker,[role="dialog"]';

/**
 * The fixed full-screen 3D world behind the page. Scrolling walks the camera down the village road
 * (day) or across the fortress bridge (night). Click any creature in empty space to poke it.
 * The engine loads lazily; without WebGL 2 the page keeps its 2D scenes.
 */
export default function WorldBackdrop({ world, sections, reduced, disabled = false, explore = false }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const worldRef = useRef(world);
  worldRef.current = world;
  const [bubble, setBubble] = useState(null);

  useEffect(() => {
    try {
      if (disabled || localStorage.getItem('portfolio-3d') === 'off') {
        setLoad(1);
        setMode('off');
        return undefined;
      }
    } catch {
      /* storage blocked: carry on with 3D */
    }
    let cancelled = false;
    let renderer = null;
    let bubbleTimer = 0;
    const root = document.documentElement;
    let cleanup = () => {};
    import('../lib/voxel/renderer.js')
      .then(({ createWorldRenderer }) => {
        if (cancelled) return;
        renderer = createWorldRenderer(canvasRef.current, {
          sections,
          reduced,
          onContextLost: () => setMode('off'),
          onProgress: setLoad,
          onStep: stepSound,
        });
        if (!renderer) {
          setLoad(1);
          setMode('off');
          return;
        }
        rendererRef.current = renderer;
        renderer.setWorld(worldRef.current);
        renderer.start();
        setExploreApi({
          enter: () => {
            renderer.setExplore(true);
            if (!window.matchMedia('(pointer: coarse)').matches) renderer.lockPointer();
          },
          leave: () => renderer.setExplore(false),
          moveInput: renderer.moveInput,
          jumpInput: renderer.jumpInput,
          lookBy: renderer.lookBy,
          select: () => {},
          placeBlock: () => renderer.place(),
          tap: (x, y) => {
            const hit = renderer.pick(x, y, true);
            if (!hit && renderer.mine(x, y)) blockSound('stone');
          },
        });
        const stopDive = onDive((v) => renderer.setDive(v));
        renderer.ready.then(() => {
          if (!cancelled) setMode('on');
        });
        setTimeout(() => !cancelled && renderer.prepare(worldRef.current === 'nether' ? 'overworld' : 'nether'), 2500);

        const free = (e) => !e.target.closest?.(SOLID_UI);
        let hovering = false;
        const onMove = (e) => {
          if (e.pointerType === 'touch') return;
          const hit = free(e) && renderer.pick(e.clientX, e.clientY);
          if (Boolean(hit) !== hovering) {
            hovering = Boolean(hit);
            root.classList.toggle('mob-hover', hovering);
          }
        };
        const onContext = (e) => {
          if (!renderer.exploring) return;
          e.preventDefault();
          if (renderer.place()) placeSound();
        };
        const onClick = (e) => {
          if (renderer.exploring) {
            // while exploring the crosshair is the centre of the screen; touch uses its own tap handler
            if (e.target.closest?.('.explore-hud button')) return;
            if (window.matchMedia('(pointer: coarse)').matches) return;
            if (!document.pointerLockElement) {
              renderer.lockPointer();
              return;
            }
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const hit = renderer.pick(cx, cy, true);
            if (hit) mobSound(hit.name, hit.kind);
            else {
              const ground = renderer.mine(cx, cy);
              if (ground) blockSound(ground);
            }
            return;
          }
          if (!free(e) || window.getSelection()?.toString()) return;
          const hit = renderer.pick(e.clientX, e.clientY, true);
          if (!hit) {
            const ground = renderer.mine(e.clientX, e.clientY);
            if (ground) blockSound(ground);
            return;
          }
          mobSound(hit.name, hit.kind);
          clearTimeout(bubbleTimer);
          setBubble({ ...hit, id: Date.now() });
          bubbleTimer = setTimeout(() => setBubble(null), 3200);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('click', onClick);
        window.addEventListener('contextmenu', onContext);
        cleanup = () => {
          stopDive();
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('click', onClick);
          window.removeEventListener('contextmenu', onContext);
          root.classList.remove('mob-hover');
          clearTimeout(bubbleTimer);
        };
      })
      .catch((err) => {
        setLoad(1);
        setMode('off');
        console.error('3D world unavailable', err);
      });
    return () => {
      cancelled = true;
      cleanup();
      renderer?.dispose();
      rendererRef.current = null;
    };
  }, [sections, reduced, disabled]);

  useEffect(() => {
    rendererRef.current?.setWorld(world);
  }, [world]);

  return (
    <>
      <canvas key={disabled ? 'off' : 'on'} ref={canvasRef} className="world-canvas" aria-hidden="true" />
      {bubble && (
        <div
          key={bubble.id}
          className={`mob-bubble ${bubble.kind}`}
          style={{ left: Math.min(Math.max(bubble.x, 150), window.innerWidth - 150), top: Math.min(Math.max(bubble.y, 90), window.innerHeight - 40) }}
          role="status"
        >
          <b className="pixel">{bubble.name}</b>
          <span>{bubble.line}</span>
        </div>
      )}
    </>
  );
}
