import { useCallback, useRef } from "react";

/**
 * Launch-window eclipse handle.
 * - `eclipseRef` goes on the ambient <Eclipse> behind the contact portrait (LaunchWindow > LaunchPortrait).
 * - `flare()` fires the "diamond ring": the Eclipse's 10 o'clock star pulses (scale -> 2.2 -> rest, glow and
 *   opacity up and back, 900 ms, EASE.out). The Eclipse itself does nothing under reduced motion.
 */
export default function useEclipse() {
  const eclipseRef = useRef(null);
  const flare = useCallback(() => {
    eclipseRef.current?.flare?.();
  }, []);
  return { eclipseRef, flare };
}
