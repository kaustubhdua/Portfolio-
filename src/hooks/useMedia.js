import { useEffect, useState } from 'react';

/** Subscribes to a media query. Returns `fallback` during the first render. */
export function useMedia(query, fallback = false) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? fallback : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
