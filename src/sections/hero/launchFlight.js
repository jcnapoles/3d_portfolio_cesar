// Lazy chunk for the full-stop launch (desktop tier A, first visit only): keeps Motion's standalone `animate`
// (about 4 KB gzip) out of the entry chunk. Imported by useFullStopLaunch at mount, used at 1 s.
import { animate } from "motion/react";
import { EASE } from "@/lib/motion";

/**
 * Flies `el` through pre-sampled points (already EASE.inout-spaced, so each segment is linear) while it swells
 * and shrinks (scale 1 -> 1.4 -> 0.7 on EASE.inout). Returns Motion's controls (thenable, stop()).
 */
export function flyToOrbit(el, xs, ys, duration) {
  return animate(
    el,
    { x: xs, y: ys, scale: [1, 1.4, 0.7] },
    { duration, ease: "linear", scale: { duration, ease: EASE.inout } }
  );
}
