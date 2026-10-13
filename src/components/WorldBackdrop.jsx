import { useEffect, useRef } from 'react';
import { onDive } from '../lib/voxel/travel.js';

/**
 * The fixed full-screen 3D world behind the page. Scrolling walks the camera down the village road
 * (day) or across the fortress bridge (night). The engine is loaded lazily; when WebGL 2 is
 * missing the page keeps its 2D scenes.
 */
export default function WorldBackdrop({ world, sections, reduced }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const worldRef = useRef(world);
  worldRef.current = world;

  useEffect(() => {
    let cancelled = false;
    let renderer = null;
    const root = document.documentElement;
    import('../lib/voxel/renderer.js')
      .then(({ createWorldRenderer }) => {
        if (cancelled) return;
        renderer = createWorldRenderer(canvasRef.current, {
          sections,
          reduced,
          onContextLost: () => delete root.dataset.threed,
        });
        if (!renderer) return;
        rendererRef.current = renderer;
        renderer.setWorld(worldRef.current);
        renderer.start();
        const stopDive = onDive((v) => renderer.setDive(v));
        renderer.stopDive = stopDive;
        renderer.ready.then(() => {
          if (!cancelled) root.dataset.threed = 'on';
        });
        // Build the other world quietly so the portal trip lands instantly.
        setTimeout(() => !cancelled && renderer.prepare(worldRef.current === 'nether' ? 'overworld' : 'nether'), 2500);
      })
      .catch((err) => console.error('3D world unavailable', err));
    return () => {
      cancelled = true;
      delete root.dataset.threed;
      renderer?.stopDive?.();
      renderer?.dispose();
      rendererRef.current = null;
    };
  }, [sections, reduced]);

  useEffect(() => {
    rendererRef.current?.setWorld(world);
  }, [world]);

  return <canvas ref={canvasRef} className="world-canvas" aria-hidden="true" />;
}
