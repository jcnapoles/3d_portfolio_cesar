import { useEffect, useRef } from "react";
import useLenis from "@/hooks/useLenis";

/**
 * useLenisScroll(cb, deps)
 * Calls cb({ scroll, velocity, direction }) on every Lenis scroll event. Without Lenis it listens to
 * window `scroll` and computes velocity from deltas (px per ~16.7 ms frame, signed; direction 1 | -1 | 0).
 * The latest cb is always used; deps re-run the subscription. Unsubscribes on unmount.
 */
export default function useLenisScroll(cb, deps = []) {
  const lenis = useLenis();
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    if (lenis) {
      const handler = (l) => cbRef.current?.({ scroll: l.scroll, velocity: l.velocity, direction: l.direction });
      const off = lenis.on("scroll", handler);
      return () => (typeof off === "function" ? off() : lenis.off?.("scroll", handler));
    }

    let lastY = window.scrollY;
    let lastT = performance.now();
    const onScroll = () => {
      const y = window.scrollY;
      const t = performance.now();
      const dy = y - lastY;
      const dt = Math.max(t - lastT, 1);
      lastY = y;
      lastT = t;
      const velocity = (dy / dt) * (1000 / 60);
      cbRef.current?.({ scroll: y, velocity, direction: dy > 0 ? 1 : dy < 0 ? -1 : 0 });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis, ...deps]);
}
