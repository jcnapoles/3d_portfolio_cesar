import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatElapsed } from "@/lib/time";

/**
 * Mission elapsed time: real time on page since navigation start (performance.now()), "MET 00:04:12".
 * Ticks each second on the second boundary; skips work while the tab is hidden. Decorative (aria-hidden).
 */
export default function MissionElapsed({ className, label = "MET" }) {
  const [ms, setMs] = useState(() => performance.now());

  useEffect(() => {
    let timer;
    const tick = () => {
      const now = performance.now();
      if (!document.hidden) setMs(now);
      timer = setTimeout(tick, 1000 - (now % 1000) + 5);
    };
    timer = setTimeout(tick, 1000 - (performance.now() % 1000) + 5);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span aria-hidden="true" className={cn("font-mono tabular", className)}>
      {label ? `${label} ` : ""}
      {formatElapsed(ms)}
    </span>
  );
}
