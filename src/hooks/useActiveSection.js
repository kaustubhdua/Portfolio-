import { useEffect, useState } from 'react';

/** Tracks which section currently crosses the middle band of the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        let best = null;
        for (const id of ids) {
          const v = visible.get(id) ?? 0;
          if (v > 0 && (best === null || v > (visible.get(best) ?? 0))) best = id;
        }
        if (best) setActive(best);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.01, 0.1, 0.5, 1] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}
