import { createContext, useContext } from "react";

/**
 * Reduced-motion switch for the 2024 site. Same inputs as the 2026 site (spec 4.3): the visitor's explicit
 * choice in localStorage['cn:motion'] wins, otherwise the OS preference. Read once when the legacy site mounts.
 */
export function readReducedMotion() {
  let pref = null;
  try {
    pref = window.localStorage.getItem("cn:motion");
  } catch {
    pref = null;
  }
  if (pref === "reduced") return true;
  if (pref === "full") return false;
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export const LegacyReducedContext = createContext(false);

/** True when the 2024 site must render its final states without movement. */
export const useLegacyReduced = () => useContext(LegacyReducedContext);
