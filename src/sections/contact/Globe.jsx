import { useCallback, useEffect, useRef, useState } from "react";
import { useSpring } from "motion/react";
import { cn } from "@/lib/cn";
import useInViewport from "@/hooks/useInViewport";
import useMotionPreference from "@/hooks/useMotionPreference";
import { PERSON } from "@/constants/site";

const SIZE = 320;
const FREEZE_AFTER_MS = 700; // reduced motion: let the map texture land, then hold one static frame
const QUIET_MS = 180; // create the globe once no scroll event has arrived for this long

/** Free the GPU context of a canvas we are done with (a fresh canvas is mounted for the next globe). */
const loseContext = (canvas) => {
  try {
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* ignore */
  }
};

/**
 * cobe globe with a gold marker on Tarragona. Desktop tier A only (ChannelPanel decides), never on mobile.
 * - cobe is lazy-loaded once the globe is within 600 px of the viewport; the globe itself is created once scrolling
 *   pauses (180 ms without a scroll event, then an idle callback), so its one long task never lands mid-scroll.
 * - destroy() when it is more than one viewport away (IntersectionObserver rootMargin 100%) and on unmount;
 *   recreated when it comes back.
 * - Pointer drag adds to dragOffset, a Motion spring (stiffness 280, damping 40).
 * - Reduced motion: one static frame, no rotation (a drag still turns it, because the visitor asked).
 */
export default function Globe({ className }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const globeRef = useRef(null);
  const thawTimer = useRef(0);
  const drag = useRef({ startX: null, movement: 0 });

  const { reduced } = useMotionPreference();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const near = useInViewport(wrapRef, { rootMargin: "600px 0px", once: true, attr: false });
  const withinReach = useInViewport(wrapRef, { rootMargin: "100% 0px", once: false, attr: false, initial: true });

  const dragOffset = useSpring(0, { stiffness: 280, damping: 40 });
  const [ready, setReady] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    if (!near || !withinReach) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let cancelled = false;
    let globe = null;
    let freezeTimer = 0;
    let quietTimer = 0;
    let idleId;

    // createGlobe() compiles the shaders and uploads the map in one ~110-170 ms task. Fetch the chunk now, but
    // only create the globe once scrolling has paused (and the main thread is idle), never mid-scroll.
    const loading = import("cobe");
    loading.catch(() => {}); // chunk failure: the panel simply has no globe
    const whenQuiet = () => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(() => {
        window.removeEventListener("scroll", whenQuiet);
        const go = () => loading.then(create).catch(() => {});
        if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(go, { timeout: 600 });
        else go();
      }, QUIET_MS);
    };

    function create({ default: createGlobe }) {
      if (cancelled || !canvas.isConnected) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const size = canvas.clientWidth || SIZE;
      let phi = 0.35;
      let painted = false;

      try {
        globe = createGlobe(canvas, {
          devicePixelRatio: dpr,
          width: size * dpr,
          height: size * dpr,
          phi: 0.35,
          theta: 0.25,
          dark: 1,
          diffuse: 1.1,
          mapSamples: 16000,
          mapBrightness: 2.2,
          baseColor: [0.1, 0.12, 0.18],
          markerColor: [0.957, 0.722, 0.376],
          glowColor: [0.96, 0.72, 0.38],
          markers: [{ location: PERSON.coords, size: 0.06 }],
          onRender: (s) => {
            const dragging = drag.current.startX !== null;
            if (!dragging && !reducedRef.current) phi += 0.003;
            s.phi = phi + dragOffset.get();
            if (!painted) {
              painted = true;
              setReady(true);
            }
          },
        });
      } catch {
        return; /* WebGL failure: the panel simply has no globe */
      }
      globeRef.current = globe;
      if (reducedRef.current) freezeTimer = window.setTimeout(() => globe?.toggle(false), FREEZE_AFTER_MS);
    }

    window.addEventListener("scroll", whenQuiet, { passive: true });
    whenQuiet();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", whenQuiet);
      window.clearTimeout(quietTimer);
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      window.clearTimeout(freezeTimer);
      window.clearTimeout(thawTimer.current);
      if (globe) {
        globe.destroy();
        loseContext(canvas);
        globeRef.current = null;
        setReady(false);
        setCanvasKey((k) => k + 1); // the next globe gets a fresh canvas
      }
    };
  }, [near, withinReach, canvasKey, dragOffset]);

  // Motion switched at runtime: freeze on the current frame, or resume rotating.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return undefined;
    if (!reduced) {
      globe.toggle(true);
      return undefined;
    }
    const t = window.setTimeout(() => globe.toggle(false), 120);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const onPointerDown = useCallback((e) => {
    drag.current.startX = e.clientX - drag.current.movement;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setGrabbing(true);
    if (reducedRef.current) {
      window.clearTimeout(thawTimer.current);
      globeRef.current?.toggle(true);
    }
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (drag.current.startX === null) return;
      const movement = e.clientX - drag.current.startX;
      drag.current.movement = movement;
      dragOffset.set(movement / 200);
    },
    [dragOffset]
  );

  const endDrag = useCallback(() => {
    if (drag.current.startX === null) return;
    drag.current.startX = null;
    setGrabbing(false);
    if (reducedRef.current) {
      window.clearTimeout(thawTimer.current);
      thawTimer.current = window.setTimeout(() => globeRef.current?.toggle(false), 1200);
    }
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={cn("relative mx-auto aspect-square w-[320px] max-w-full", className)}
    >
      {/* Placeholder limb, same radius as the globe (cobe draws it at 80% of the canvas) */}
      <span
        className="absolute inset-[10%] rounded-full border border-line transition-opacity duration-reveal ease-out motion-off:transition-none"
        style={{ opacity: ready ? 0 : 1 }}
      />
      <canvas
        key={canvasKey}
        ref={canvasRef}
        className="absolute inset-0 block size-full touch-none select-none"
        style={{
          opacity: ready ? 1 : 0,
          // Reduced motion: the globe simply appears (static final state, no crossfade).
          transition: reduced ? "none" : "opacity 500ms var(--ease-out)",
          cursor: grabbing ? "grabbing" : "grab",
          contain: "layout paint size",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      />
    </div>
  );
}
