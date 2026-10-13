/** A tiny shared value: how far the portal "dive" has progressed (0 to 1). */
const listeners = new Set();
let dive = 0;
export const setDive = (v) => {
  dive = v;
  for (const fn of listeners) fn(v);
};
export const getDive = () => dive;
export const onDive = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** World-building progress (0 to 1), shown by the loading screen. */
const loadListeners = new Set();
let load = 0;
export const setLoad = (v) => {
  load = v;
  for (const fn of loadListeners) fn(v);
};
export const getLoad = () => load;
export const onLoad = (fn) => {
  loadListeners.add(fn);
  return () => loadListeners.delete(fn);
};

/** Whether the 3D world is running: 'pending' while it starts, then 'on' or 'off' (2D scenes). */
const modeListeners = new Set();
let mode = 'pending';
export const setMode = (m) => {
  if (m === mode) return;
  mode = m;
  document.documentElement.dataset.threed = m;
  for (const fn of modeListeners) fn();
};
export const getMode = () => mode;
export const subscribeMode = (fn) => {
  modeListeners.add(fn);
  return () => modeListeners.delete(fn);
};
