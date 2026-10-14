import { createContext, useContext } from "react";

/**
 * Which era of the site is on screen, and the switch between them (VersionProvider).
 * version: 'new' | 'legacy'
 * status: 'idle' | 'loading' (fetching the 2024 chunk) | 'warping' (transition running) | 'error' (chunk failed)
 * switchTo(target, origin?): origin = { x, y } viewport point the warp radiates from.
 * preload(): starts fetching the 2024 chunk (called on pointerdown, just ahead of the click).
 */
export const VersionContext = createContext({
  version: "new",
  status: "idle",
  switchTo: () => {},
  preload: () => {},
});

export const useVersion = () => useContext(VersionContext);

/** The warp origin for a click (pointer position) or a keyboard activation (centre of the control). */
export function originFrom(event) {
  if (!event) return null;
  if (event.detail > 0 && Number.isFinite(event.clientX) && (event.clientX !== 0 || event.clientY !== 0)) {
    return { x: event.clientX, y: event.clientY };
  }
  const el = event.currentTarget;
  if (el && typeof el.getBoundingClientRect === "function") {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return null;
}
