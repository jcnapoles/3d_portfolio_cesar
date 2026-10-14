import { useEffect, useState } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "motion/react";
import { LenisContext } from "@/providers/contexts";
import useMotionPreference from "@/hooks/useMotionPreference";
import { CLOSEVIBE_ROOT_SELECTOR } from "@/constants/site";

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

/**
 * Lenis smooth scroll, driven by Motion's frame loop (a single rAF loop for the page).
 * Created only when motion is not reduced and the base tier is not C; destroyed at runtime
 * when the visitor switches motion off. Exposes the instance (or null) through LenisContext.
 */
export default function SmoothScrollProvider({ children }) {
  const { reduced, tierBase } = useMotionPreference();
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if (reduced || tierBase === "C") return undefined;
    const instance = new Lenis({
      autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false,
      wheelMultiplier: 1, touchMultiplier: 1,
      // Lenis 1.3.26 subtracts the target's scroll-margin-top and html's scroll-padding-top (88 px, index.css)
      // itself, so the spec's `offset: -NAV_OFFSET` would double the navbar offset. No extra offset here.
      anchors: true,
      prevent: (node) => !!node.closest?.(`[data-lenis-prevent], ${CLOSEVIBE_ROOT_SELECTOR}`),
      // Lenis 1.3.26 defaults this to true (instant scrolls under OS reduced motion). Our provider already
      // decides: Lenis only exists when motion is on, and an explicit "Motion: On" overrides the OS setting.
      respectReducedMotion: false,
    });
    const update = (data) => instance.raf(data.timestamp);
    frame.update(update, true);
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
      document.removeEventListener("click", onClickCapture, true);
      cancelFrame(update);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced, tierBase]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
