import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getMode, subscribeMode } from '../lib/voxel/travel.js';

/**
 * For browsers without WebGL 2 (or visitors who turn 3D off): still pictures of the same village
 * or fortress, one per stop of the scroll journey, cross-faded as you move between sections.
 */
export default function FallbackBackdrop({ world, sections, active }) {
  const mode = useSyncExternalStore(subscribeMode, getMode);
  const index = Math.max(0, sections.indexOf(active));
  const [layers, setLayers] = useState([]);
  const counter = useRef(0);

  useEffect(() => {
    if (mode !== 'off') return undefined;
    const src = `img/world/${world}-${index}.jpg`;
    const id = ++counter.current;
    setLayers((prev) => (prev.at(-1)?.src === src ? prev : [...prev.slice(-1), { src, id }]));
    const t = setTimeout(() => setLayers((prev) => prev.slice(-1)), 1200);
    return () => clearTimeout(t);
  }, [mode, world, index]);

  if (mode !== 'off') return null;
  return (
    <div className="fallback-backdrop" aria-hidden="true">
      {layers.map((l) => (
        <img key={l.id} className="fallback-layer" src={l.src} alt="" decoding="async" />
      ))}
    </div>
  );
}
