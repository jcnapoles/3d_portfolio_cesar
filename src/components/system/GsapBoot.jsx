import { useEffect, useState } from "react";
import { initHeadingReveals, loadGsap, requestRefresh } from "@/lib/gsap";
import useMotionPreference from "@/hooks/useMotionPreference";
import useLenis from "@/hooks/useLenis";
import { DEFERRED_EVENT } from "@/components/system/DeferredMount";

const INTERACTION_EVENTS = ["scroll", "wheel", "touchstart", "keydown", "pointerdown"];
const INTRO_GRACE_MS = 1500; // after `load`: let the hero intro play before the GSAP chunk is evaluated

/**
 * Loads the lazy GSAP chunk (never under reduced motion), in an idle callback, whichever comes first:
 * window `load` + 1.5 s (the hero intro) + requestIdleCallback({ timeout: 2000 }), or the first scroll / wheel /
 * touchstart / keydown / pointerdown + requestIdleCallback({ timeout: 400 }). Never inside the input handler itself:
 * evaluating the chunk and enabling ScrollTrigger is one long task, which used to land on the first scroll frame.
 * Then: ScrollTrigger.update on every Lenis-smoothed scroll frame, the global H2 line-mask reveals (split lazily as
 * each heading approaches), and a refresh once fonts are ready.
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
    let started = false;
    let idleId;
    let timerId;
    let graceId;

    const cleanupListeners = () => {
      window.removeEventListener("load", onLoad);
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, onInteract, { capture: true }));
    };
    const clearTimers = () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
      if (graceId !== undefined) clearTimeout(graceId);
      idleId = timerId = graceId = undefined;
    };
    function boot() {
      if (started || cancelled) return;
      started = true;
      cleanupListeners();
      clearTimers();
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
    // (Re)schedule the boot for the next idle period, at most `timeout` ms away.
    function soon(timeout) {
      if (started) return;
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(boot, { timeout });
      else timerId = setTimeout(boot, Math.min(timeout, 300));
    }
    function onInteract() {
      soon(400);
    }
    function onLoad() {
      graceId = setTimeout(() => soon(2000), INTRO_GRACE_MS);
    }

    INTERACTION_EVENTS.forEach((type) => window.addEventListener(type, onInteract, { capture: true, passive: true, once: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      cancelled = true;
      cleanupListeners();
      clearTimers();
    };
  }, [reduced, api]);

  // 2. Keep ScrollTrigger in sync with Lenis (re-subscribes when Lenis is recreated). ScrollTrigger already
  // updates from its own window "scroll" listener; that event arrives one frame after Lenis moves the page, so the
  // extra same-frame update is only worth it while Lenis itself is smoothing (wheel, programmatic scrolls). Native
  // scrolling (touch, keyboard, scrollbar) is left to ScrollTrigger's listener instead of updating every trigger twice.
  useEffect(() => {
    if (!api || !lenis) return undefined;
    const sync = (l) => {
      if (l.isScrolling === "smooth") api.ScrollTrigger.update();
    };
    const off = lenis.on("scroll", sync);
    return () => (typeof off === "function" ? off() : lenis.off?.("scroll", sync));
  }, [api, lenis]);

  // 2b. ScrollTrigger only re-measures on resize/load. Content above a trigger can change height later
  // (Deliverables / FAQ / Flight log disclosures, late images, fonts), which would leave every trigger below
  // stale; refresh (debounced, shared with useLazyGsap) whenever the page HEIGHT changes (width changes are
  // window resizes, which ScrollTrigger handles itself).
  useEffect(() => {
    if (!api || typeof ResizeObserver === "undefined") return undefined;
    let lastHeight = -1;
    const ro = new ResizeObserver(([entry]) => {
      const h = Math.round(entry.contentRect.height);
      if (h === lastHeight) return;
      const first = lastHeight === -1;
      lastHeight = h;
      if (!first) requestRefresh();
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [api]);

  // 3. Motion switched back on after a reduced start: pick up headings that were never initialised. Sections that
  // mount after the boot (DeferredMount groups) are armed as they arrive.
  useEffect(() => {
    if (!api || reduced) return undefined;
    initHeadingReveals(api);
    const onSections = () => initHeadingReveals(api);
    window.addEventListener(DEFERRED_EVENT, onSections);
    return () => window.removeEventListener(DEFERRED_EVENT, onSections);
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
