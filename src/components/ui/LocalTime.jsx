import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatTarragona } from "@/lib/time";

const read = () => {
  const now = new Date();
  return { label: formatTarragona(now), iso: now.toISOString() };
};

/**
 * Real Tarragona wall-clock time: "{prefix} 14:32 CEST" in a <time dateTime>.
 * Re-renders on each minute boundary; the timer stops while the tab is hidden and resyncs on return.
 */
export default function LocalTime({ className, prefix = "TARRAGONA" }) {
  const [now, setNow] = useState(read);

  useEffect(() => {
    let timer;
    const schedule = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      const msToNextMinute = 60000 - (Date.now() % 60000) + 50;
      timer = setTimeout(() => {
        setNow(read());
        schedule();
      }, msToNextMinute);
    };
    const onVisibility = () => {
      if (document.hidden) {
        clearTimeout(timer);
      } else {
        setNow(read());
        schedule();
      }
    };
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <time dateTime={now.iso} className={cn("font-mono tabular", className)}>
      {prefix ? `${prefix} ` : ""}
      {now.label}
    </time>
  );
}
