import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { MotionConfig } from "motion/react";
import { MotionPreferenceContext } from "@/providers/contexts";
import { readLocal, writeLocal } from "@/lib/storage";
import { getBootState } from "@/lib/device";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_QUERY = "(hover: hover) and (pointer: fine)";
const STORAGE_KEY = "cn:motion";

const matches = (q) => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(q).matches;
const readUserPref = () => {
  const v = readLocal(STORAGE_KEY);
  return v === "full" || v === "reduced" ? v : null;
};

/**
 * Owns the reduced-motion switch (OS preference OR the visible Motion toggle; an explicit
 * user choice wins in both directions), rewrites html[data-motion] and html[data-tier],
 * and wraps the app in Motion's MotionConfig.
 */
export default function MotionPreferenceProvider({ children }) {
  const [osReduced, setOsReduced] = useState(() => matches(REDUCED_QUERY));
  const [userPref, setUserPref] = useState(readUserPref);
  const [fine, setFine] = useState(() => matches(FINE_QUERY));
  const [{ tierBase, visit }] = useState(() => getBootState());

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mqReduced = window.matchMedia(REDUCED_QUERY);
    const mqFine = window.matchMedia(FINE_QUERY);
    const onReduced = (e) => setOsReduced(e.matches);
    const onFine = (e) => setFine(e.matches);
    mqReduced.addEventListener?.("change", onReduced);
    mqFine.addEventListener?.("change", onFine);
    return () => {
      mqReduced.removeEventListener?.("change", onReduced);
      mqFine.removeEventListener?.("change", onFine);
    };
  }, []);

  const reduced = userPref ? userPref === "reduced" : osReduced;
  const tier = reduced ? "C" : tierBase;

  // Layout effect: the attribute flips before the browser paints the toggled state.
  useLayoutEffect(() => {
    const d = document.documentElement;
    d.dataset.motion = reduced ? "reduced" : "full";
    d.dataset.tier = tier;
  }, [reduced, tier]);

  const setUserReduced = useCallback((v) => {
    const next = v ? "reduced" : "full";
    writeLocal(STORAGE_KEY, next);
    setUserPref(next);
  }, []);

  const value = useMemo(
    () => ({ reduced, osReduced, userPref, tier, tierBase, fine, firstVisit: visit === "first", setUserReduced }),
    [reduced, osReduced, userPref, tier, tierBase, fine, visit, setUserReduced]
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionPreferenceContext.Provider>
  );
}
