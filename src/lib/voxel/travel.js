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
