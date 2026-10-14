import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatElapsed } from "@/lib/time";
import useInViewport from "@/hooks/useInViewport";

/**
 * Mission elapsed time: real time on page since navigation start (performance.now()), "MET 00:04:12".
 * Ticks each second on the second boundary; skips work while the tab is hidden or the clock is off screen (an
 * off-screen tick still cost a React commit, a text layout and a frame every second). Decorative (aria-hidden).
 */
export default function MissionElapsed({ className, label = "MET" }) {
  const ref = useRef(null);
  const [ms, setMs] = useState(() => performance.now());
  const onScreen = useInViewport(ref, { rootMargin: "0px", once: false, attr: false, initial: true });

  useEffect(() => {
    if (!onScreen) return undefined;
    let timer;
    const tick = () => {
      const now = performance.now();
      if (!document.hidden) setMs(now);
      timer = setTimeout(tick, 1000 - (now % 1000) + 5);
    };
    setMs(performance.now()); // back on screen: catch up at once
    timer = setTimeout(tick, 1000 - (performance.now() % 1000) + 5);
    return () => clearTimeout(timer);
  }, [onScreen]);

  return (
    <span ref={ref} aria-hidden="true" className={cn("font-mono tabular", className)}>
      {label ? `${label} ` : ""}
      {formatElapsed(ms)}
    </span>
  );
}
