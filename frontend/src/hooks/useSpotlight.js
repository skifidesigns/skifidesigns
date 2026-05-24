import { useCallback } from 'react';

/**
 * useSpotlight - wires mousemove to update CSS variables --mx and --my
 * on the hovered element. Pair with the `.skifi-spotlight` utility class.
 */
export const useSpotlight = () => {
  return useCallback((e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);
};
