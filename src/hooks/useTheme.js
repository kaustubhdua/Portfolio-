import { createContext, useCallback, useContext, useState } from 'react';

const KEY = 'portfolio-world';
export const WORLDS = { nether: 'nether', overworld: 'overworld' };

const read = () => {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === WORLDS.overworld || stored === WORLDS.nether) return stored;
  } catch {
    /* storage can be blocked; fall back to the default world */
  }
  return document.documentElement.dataset.theme === WORLDS.overworld ? WORLDS.overworld : WORLDS.nether;
};

/** The site has two worlds: the Nether (night, default) and the Overworld (day). */
export function useTheme() {
  const [theme, setThemeState] = useState(read);
  const setTheme = useCallback((next) => {
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === WORLDS.overworld ? '#bfe0ff' : '#0b0610');
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* the choice just will not be remembered */
    }
  }, []);
  return [theme, setTheme];
}

export const WorldContext = createContext(WORLDS.nether);
/** The world currently shown: 'nether' (night) or 'overworld' (day). */
export const useWorld = () => useContext(WorldContext);
