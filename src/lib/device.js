const FINE_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Boot state written on <html> by the inline script in index.html before first paint.
 * Returns { motion: 'full'|'reduced', tierBase: 'A'|'B'|'C', tier: 'A'|'B'|'C', pointer: 'fine'|'coarse', visit: 'first'|'repeat' }.
 */
export function getBootState() {
  const ds = typeof document !== "undefined" ? document.documentElement.dataset : {};
  return {
    motion: ds.motion === "reduced" ? "reduced" : "full",
    tierBase: ds.tierBase || "B",
    tier: ds.tier || ds.tierBase || "B",
    pointer: ds.pointer === "fine" ? "fine" : "coarse",
    visit: ds.visit === "repeat" ? "repeat" : "first",
  };
}

export const isFinePointer = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(FINE_QUERY).matches;
