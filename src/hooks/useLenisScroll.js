import { useEffect, useRef } from "react";
import useLenis from "@/hooks/useLenis";

/**
 * useLenisScroll(cb, deps, { throttle = 0 } = {})
 * Calls cb({ scroll, velocity, direction }) on every Lenis scroll event. Without Lenis it listens to
 * window `scroll` and computes velocity from deltas (px per ~16.7 ms frame, signed; direction 1 | -1 | 0).
 * The latest cb is always used; deps re-run the subscription. Unsubscribes on unmount.
 *
 * `throttle` (ms, optional): call cb at most once per window (leading + trailing), for handlers that measure
 * layout to answer a coarse question ("which card is in front?") and do not need every frame.
 */
export default function useLenisScroll(cb, deps = [], { throttle = 0 } = {}) {
  const lenis = useLenis();
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    let last = 0;
    let timer = 0;
    let pending = null;
    const fire = (data) => {
      last = performance.now();
      cbRef.current?.(data);
    };
    const call = (data) => {
      if (!throttle) {
        cbRef.current?.(data);
        return;
      }
      const wait = throttle - (performance.now() - last);
      if (wait <= 0) {
        window.clearTimeout(timer);
        timer = 0;
        fire(data);
        return;
      }
      pending = data;
      if (!timer) {
        timer = window.setTimeout(() => {
          timer = 0;
          fire(pending);
        }, wait);
      }
    };

    if (lenis) {
      const handler = (l) => call({ scroll: l.scroll, velocity: l.velocity, direction: l.direction });
      const off = lenis.on("scroll", handler);
      return () => {
        window.clearTimeout(timer);
        if (typeof off === "function") off();
        else lenis.off?.("scroll", handler);
      };
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
      call({ scroll: y, velocity, direction: dy > 0 ? 1 : dy < 0 ? -1 : 0 });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis, throttle, ...deps]);
}
