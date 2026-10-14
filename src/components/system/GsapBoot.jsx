import { useEffect, useState } from "react";
import { initHeadingReveals, loadGsap, requestRefresh } from "@/lib/gsap";
import useMotionPreference from "@/hooks/useMotionPreference";
import useLenis from "@/hooks/useLenis";

const INTERACTION_EVENTS = ["scroll", "wheel", "touchstart", "keydown", "pointerdown"];

/**
 * Loads the lazy GSAP chunk (never under reduced motion), whichever comes first:
 * window `load` + requestIdleCallback({ timeout: 2000 }), or the first scroll / wheel / touchstart / keydown / pointerdown.
 * Then: ScrollTrigger.update on every Lenis scroll, the global H2 line-mask reveals, and a refresh once fonts are ready.
 * If motion is switched off at runtime, pending (not yet played) heading reveals jump to their final state.
 * Renders null.
 */
export default function GsapBoot() {
  const { reduced } = useMotionPreference();
  const lenis = useLenis();
  const [api, setApi] = useState(null);

  // 1. Schedule the load.
  useEffect(() => {
    if (reduced || api) return undefined;
    let cancelled = false;
    let idleId;
    let timerId;

    const cleanupListeners = () => {
      window.removeEventListener("load", onLoad);
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, boot, { capture: true }));
    };
    function boot() {
      cleanupListeners();
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
      loadGsap()
        .then((loaded) => {
          if (cancelled) return;
          initHeadingReveals(loaded);
          document.fonts?.ready?.then(() => loaded.ScrollTrigger.refresh());
          setApi(loaded);
        })
        .catch(() => {
          /* GSAP is an enhancement: the page already renders its final state (M-2). */
        });
    }
    function onLoad() {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(boot, { timeout: 2000 });
      else timerId = setTimeout(boot, 1200);
    }

    INTERACTION_EVENTS.forEach((type) => window.addEventListener(type, boot, { capture: true, passive: true, once: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      cancelled = true;
      cleanupListeners();
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, [reduced, api]);

  // 2. Keep ScrollTrigger in sync with Lenis (re-subscribes when Lenis is recreated).
  useEffect(() => {
    if (!api || !lenis) return undefined;
    const off = lenis.on("scroll", api.ScrollTrigger.update);
    return () => (typeof off === "function" ? off() : lenis.off?.("scroll", api.ScrollTrigger.update));
  }, [api, lenis]);

  // 2b. ScrollTrigger only re-measures on resize/load. Content above a trigger can change height later
  // (Deliverables / FAQ / Flight log disclosures, late images, fonts), which would leave every trigger below
  // stale; refresh (debounced, shared with useLazyGsap) whenever the page height changes.
  useEffect(() => {
    if (!api || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => requestRefresh());
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [api]);

  // 3. Motion switched back on after a reduced start: pick up headings that were never initialised.
  useEffect(() => {
    if (!api || reduced) return;
    initHeadingReveals(api);
  }, [api, reduced]);

  // 4. Motion switched off at runtime: finish pending heading reveals instantly (no further movement).
  useEffect(() => {
    if (!api || !reduced) return;
    api.ScrollTrigger.getAll().forEach((st) => {
      const el = st.trigger;
      if (!el || !el.matches?.('[data-reveal="lines"]') || el.dataset.revealDone) return;
      st.animation?.progress(1);
      el.dataset.revealDone = "true";
      st.kill();
    });
  }, [api, reduced]);

  return null;
}
