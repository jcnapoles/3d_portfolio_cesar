import { useEffect, useLayoutEffect, useRef } from "react";
import useMotionPreference from "@/hooks/useMotionPreference";
import { DEFERRED_EVENT } from "@/components/system/DeferredMount";

// A cell is due once its top is 6 % inside the viewport (VIEWPORT.margin in lib/motion.js), or anywhere above that.
const DUE_AT = 0.94;
// Same trigger line at the bottom, and a root that reaches far above the viewport: a cell flung past between two
// frames (below the viewport in one, above it in the next, never "in" it) still flips to intersecting.
const ROOT_MARGIN = "100000px 0px -6% 0px";
// One last sweep after mount (a single timer, not a loop) for an observer callback that comes late.
const WATCHDOG_MS = 2500;
// An observer entry handled this long after it was computed means the main thread was blocked (deferred groups
// mounting on a slow phone) while the cell sat empty in view: show it at once instead of starting a fade then.
const LATE_MS = 200;

/**
 * Entrance for the telemetry cells: a short fade-up as CSS transitions (telemetry.css), driven by data-enter on each
 * `selector` element inside `listRef`. The final, visible state is the default; the script can only delay it:
 * - No attribute = final state. Before the first paint (layout effect) only cells still below the trigger line get
 *   "wait" (hidden), and only with motion on. A cell already in view or above it at mount (its deferred group mounted
 *   while the page sat on the band, a restored scroll) is never hidden and never animates, like NumberTicker.
 * - "wait" -> "go" (the transition) on any of: an intersecting observer entry (every entry is read, so an older
 *   "not intersecting" entry batched with a newer one never wins), a sweep of the live geometry after each observer
 *   callback, after each deferred group commits (DEFERRED_EVENT, the long tasks that delay callbacks on phones) and
 *   once WATCHDOG_MS after mount. Cells scrolled past fast count as due (the observer root reaches above the viewport).
 *   A late reveal (entry handled > LATE_MS after it was computed, a sweep that finds the cell deep in view) or one
 *   above the viewport drops the attribute instead: the final state at once, no fade.
 * - Reduced motion (at mount or switched on later) shows everything at once; CSS also guards every hidden state with
 *   html:not([data-motion="reduced"]). Unmounting shows any cell still waiting.
 */
export default function useCellEntrance(listRef, selector = ".tlm-in") {
  const { reduced } = useMotionPreference();
  const showAll = useRef(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || reduced) return undefined;
    const vh = () => window.innerHeight || document.documentElement.clientHeight;
    const isDue = (el) => el.getBoundingClientRect().top < vh() * DUE_AT;
    const waiting = new Set([...list.querySelectorAll(selector)].filter((el) => !isDue(el)));
    if (!waiting.size || typeof IntersectionObserver === "undefined") return undefined;
    waiting.forEach((el) => {
      el.dataset.enter = "wait";
    });

    let io = null;
    let timer = 0;
    function stop() {
      io?.disconnect();
      window.removeEventListener(DEFERRED_EVENT, sweep);
      window.clearTimeout(timer);
      showAll.current = null;
    }
    // animate: "go" (the transition). Otherwise the attribute goes and the cell shows at once: a late reveal (the
    // visitor has been looking at the empty cell) or one above the viewport gains nothing from a fade.
    function reveal(el, animate) {
      if (!waiting.delete(el)) return;
      if (animate) el.dataset.enter = "go";
      else delete el.dataset.enter;
      io?.unobserve(el);
      if (!waiting.size) stop();
    }
    // Geometry fallback: animate only while the cell is still near the trigger line (top in the lower half).
    function sweep() {
      waiting.forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        if (top < vh() * DUE_AT) reveal(el, bottom > 0 && top > vh() * 0.5);
      });
    }

    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const timely = performance.now() - entry.time < LATE_MS;
          reveal(entry.target, timely && entry.boundingClientRect.bottom > 0);
        });
        sweep();
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    );
    waiting.forEach((el) => io.observe(el));
    window.addEventListener(DEFERRED_EVENT, sweep);
    timer = window.setTimeout(sweep, WATCHDOG_MS);

    const finish = () => {
      waiting.forEach((el) => {
        delete el.dataset.enter;
      });
      waiting.clear();
      stop();
    };
    showAll.current = finish;
    return finish;
    // Armed once, at mount: switching motion back on at runtime never hides cells again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reduced motion switched on at runtime: everything still waiting shows now.
  useEffect(() => {
    if (reduced) showAll.current?.();
  }, [reduced]);
}
