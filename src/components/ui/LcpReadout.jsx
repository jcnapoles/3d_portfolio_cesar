import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const supported = () =>
  typeof PerformanceObserver !== "undefined" &&
  Array.isArray(PerformanceObserver.supportedEntryTypes) &&
  PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint");

// Core Web Vitals "good" LCP threshold. Slower readings would undersell the site, so they are never shown.
const GOOD_LCP_S = 2.5;

/**
 * The visitor's real Largest Contentful Paint, read from PerformanceObserver (buffered).
 * The value is final on the first pointerdown / keydown or visibilitychange (LCP stops there).
 * Renders "THIS PAGE RENDERED IN 0.84 S ON YOUR DEVICE" only while the measured LCP is <= 2.5 s; renders null
 * where LCP is unsupported, not yet known or slower than 2.5 s (a later, slower candidate hides it again).
 */
export default function LcpReadout({ className }) {
  const [seconds, setSeconds] = useState(null);

  useEffect(() => {
    if (!supported()) return undefined;
    let po;
    let finalized = false;
    const finalize = () => {
      if (finalized) return;
      finalized = true;
      if (po) {
        try {
          const rest = po.takeRecords?.() || [];
          const last = rest[rest.length - 1];
          if (last) setSeconds(last.startTime / 1000);
        } catch {
          /* ignore */
        }
        po.disconnect();
      }
      removeListeners();
    };
    const opts = { capture: true, once: true, passive: true };
    const removeListeners = () => {
      window.removeEventListener("pointerdown", finalize, opts);
      window.removeEventListener("keydown", finalize, opts);
      document.removeEventListener("visibilitychange", finalize, opts);
    };
    try {
      po = new PerformanceObserver((list) => {
        if (finalized) return;
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) setSeconds(last.startTime / 1000);
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      return undefined;
    }
    window.addEventListener("pointerdown", finalize, opts);
    window.addEventListener("keydown", finalize, opts);
    document.addEventListener("visibilitychange", finalize, opts);
    return () => {
      finalized = true;
      po?.disconnect();
      removeListeners();
    };
  }, []);

  if (seconds == null || !Number.isFinite(seconds) || seconds > GOOD_LCP_S) return null;
  return (
    <span className={cn("font-mono text-hud-xs uppercase tabular", className)}>
      THIS PAGE RENDERED IN {seconds.toFixed(2)} S ON YOUR DEVICE
    </span>
  );
}
