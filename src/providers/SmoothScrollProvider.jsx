import { useEffect, useState } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "motion/react";
import { LenisContext } from "@/providers/contexts";
import useMotionPreference from "@/hooks/useMotionPreference";
import { CLOSEVIBE_ROOT_SELECTOR } from "@/constants/site";
import { DEFERRED_EVENT } from "@/components/system/DeferredMount";

/** The same-page fragment target of an unmodified primary click on a plain `<a href="#id">`, or null. */
function hashTarget(event) {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return null;
  const hash = link.getAttribute("href");
  if (!hash || hash.length < 2) return null;
  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  return document.getElementById(id);
}

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
// Frames with nothing to smooth before the loop goes back to sleep (~1/3 s at 60 Hz).
const SLEEP_AFTER_FRAMES = 20;
// Longest timed (duration-based) scroll, in seconds: anchors, scrollToId, scrollToTop.
const MAX_SCROLL_S = 0.9;

/**
 * Lenis smooth scroll, driven by Motion's frame loop (a single rAF loop for the page).
 * Created only when motion is not reduced and the base tier is not C; destroyed at runtime
 * when the visitor switches motion off. Exposes the instance (or null) through LenisContext.
 *
 * Tempo: lerp 0.14 (a wheel burst settles in ~0.5 s instead of gliding for ~1.2 s); in-page anchors take 0.8 s and
 * no timed scroll (scrollToId / scrollToTop pass 1.2 / 1.6 s) runs longer than 0.9 s.
 * Cost: the frame loop only runs while Lenis has something to smooth (it wakes on every Lenis scrollTo, which is
 * also how wheel input reaches it) and sleeps again ~20 frames after it settles. An idle page therefore requests
 * no main-thread frames at all, so compositor-only loops (orbit satellites, spins, pings) stay off the main thread.
 */
export default function SmoothScrollProvider({ children }) {
  const { reduced, tierBase } = useMotionPreference();
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if (reduced || tierBase === "C") return undefined;
    const instance = new Lenis({
      autoRaf: false, lerp: 0.14, smoothWheel: true, syncTouch: false,
      wheelMultiplier: 1, touchMultiplier: 1,
      // Lenis 1.3.26 subtracts the target's scroll-margin-top and html's scroll-padding-top (88 px, index.css)
      // itself, so the spec's `offset: -NAV_OFFSET` would double the navbar offset. No extra offset here.
      anchors: { duration: 0.8, easing: easeOutQuart },
      prevent: (node) => !!node.closest?.(`[data-lenis-prevent], ${CLOSEVIBE_ROOT_SELECTOR}`),
      // Lenis 1.3.26 defaults this to true (instant scrolls under OS reduced motion). Our provider already
      // decides: Lenis only exists when motion is on, and an explicit "Motion: On" overrides the OS setting.
      respectReducedMotion: false,
    });

    let awake = false;
    let quiet = 0;
    const update = (data) => {
      instance.raf(data.timestamp);
      if (instance.isScrolling === "smooth" || instance.animate?.isRunning) {
        quiet = 0;
        return;
      }
      quiet += 1;
      if (quiet > SLEEP_AFTER_FRAMES) {
        awake = false;
        cancelFrame(update);
      }
    };
    const wake = () => {
      quiet = 0;
      if (awake) return;
      awake = true;
      // Lenis measures each step from its previous raf time: restart the clock so the first frame after a
      // sleep is one normal frame long, not the whole idle gap (which would jump straight to the target).
      instance.time = performance.now() - 1000 / 60;
      frame.update(update, true);
    };
    // Every smoothed movement goes through scrollTo: wheel input (Lenis calls this.scrollTo internally), anchors,
    // and our own scrollToId / scrollToTop. Wrapping the instance method wakes the loop for all of them, and caps
    // any timed scroll at MAX_SCROLL_S (tempo rule: no programmatic scroll takes longer than 0.9 s).
    const scrollTo = instance.scrollTo.bind(instance);
    // Lenis re-measures the page only on a 250 ms debounced resize. Sections that mount after the hero
    // (DeferredMount) grow the page in one go, so refresh the scroll limit as each group lands, and before any
    // programmatic scroll (anchors, scrollToId): an early click would otherwise stop at the old page bottom.
    // dimensions.resize() only re-measures; Lenis's own resize() would also cancel a smooth scroll in progress.
    const remeasure = () => instance.dimensions?.resize?.();
    window.addEventListener(DEFERRED_EVENT, remeasure);
    instance.scrollTo = (target, options) => {
      if (options?.programmatic !== false) remeasure();
      wake();
      const capped =
        options && typeof options.duration === "number" && options.duration > MAX_SCROLL_S
          ? { ...options, duration: MAX_SCROLL_S }
          : options;
      return scrollTo(target, capped);
    };
    setLenis(instance);

    // Lenis `anchors` scrolls from a bubbling window click listener but never cancels the browser's own
    // instant fragment jump, so the target could flash for a frame before the smooth scroll. Cancel the
    // native jump here (capture phase, before any handler) and leave the scrolling to Lenis. A keyboard
    // activation (detail 0) still moves focus into the target, as native fragment navigation would,
    // unless the link's own handler already moved it (the chrome links focus the section heading).
    const onClickCapture = (event) => {
      const target = hashTarget(event);
      if (!target) return;
      event.preventDefault();
      if (event.detail !== 0) return;
      const link = event.target.closest("a");
      window.setTimeout(() => {
        if (document.activeElement !== link || !target.isConnected) return;
        const el = target.querySelector("h1, h2, h3") || target;
        if (!el.matches("a[href], button, input, select, textarea, [tabindex]")) {
          el.setAttribute("tabindex", "-1");
          el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
        }
        el.focus({ preventScroll: true });
      }, 0);
    };
    document.addEventListener("click", onClickCapture, true);

    return () => {
      window.removeEventListener(DEFERRED_EVENT, remeasure);
      document.removeEventListener("click", onClickCapture, true);
      cancelFrame(update);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced, tierBase]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
