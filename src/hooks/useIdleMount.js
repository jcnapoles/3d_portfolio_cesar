import { useEffect, useState } from "react";

/**
 * useIdleMount({ timeout = 1500, after = 'load' } = {}) => boolean
 * Becomes true after window `load` (after: 'load') or right after mount (after: 'mount'),
 * followed by requestIdleCallback({ timeout }), with a setTimeout fallback.
 */
export default function useIdleMount({ timeout = 1500, after = "load" } = {}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId;
    let timerId;
    let cancelled = false;
    const done = () => { if (!cancelled) setReady(true); };
    const schedule = () => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(done, { timeout });
      else timerId = window.setTimeout(done, Math.min(timeout, 1200));
    };

    if (after !== "load" || document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [timeout, after]);

  return ready;
}
