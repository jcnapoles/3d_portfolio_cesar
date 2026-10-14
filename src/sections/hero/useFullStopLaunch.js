import { useEffect, useRef, useState } from "react";
import { cubicBezier } from "motion/react";
import { EASE } from "@/lib/motion";
import useMotionPreference from "@/hooks/useMotionPreference";
import useFirstVisit from "@/hooks/useFirstVisit";

const LAUNCH_AT = 1000; // ms after mount
const FLIGHT = 1.2; // s
const POINTS = 24;
const ARC_LIFT = 160; // px above the higher end point
const CANCEL_SCROLL = 40; // px
const INTRO_END = 2200; // ms: markLaunched() at the end of the intro or on the first scroll

const isDesktop = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;
const easeInOut = cubicBezier(...EASE.inout);

/**
 * The gold full stop that launches into orbit (spec 6.2).
 * Runs only on desktop (>= 1024), tier A, first visit, motion on. Otherwise the satellite simply orbits.
 * At 1 s a fixed gold clone of `.hero-period` flies a quadratic Bezier (24 points) to the front ring's start point,
 * the original period flashes once, and on landing the ring's satellite begins. Scrolling more than 40 px first
 * cancels the flight and starts the satellite at once.
 *
 * Returns { launchPending }: true while the front ring must wait (mount it with autoStart={!launchPending}).
 * Also calls markLaunched() at the end of the intro (2.2 s) or on the first scroll, on every first visit.
 */
export default function useFullStopLaunch({ periodRef, frontRingRef }) {
  const { reduced, tier } = useMotionPreference();
  const { firstVisit, markLaunched } = useFirstVisit();
  const [eligible] = useState(() => firstVisit && !reduced && tier === "A" && isDesktop());
  const phaseRef = useRef(eligible ? "pending" : "done"); // pending | flying | done
  const abortRef = useRef(null);

  // Repeat visits in this tab skip the intro warp and the launch.
  useEffect(() => {
    if (!firstVisit) return undefined;
    let marked = false;
    let timer = 0;
    const mark = () => {
      if (marked) return;
      marked = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", mark);
      markLaunched();
    };
    timer = window.setTimeout(mark, INTRO_END);
    window.addEventListener("scroll", mark, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", mark);
    };
  }, [firstVisit, markLaunched]);

  useEffect(() => {
    if (!eligible) return undefined;
    let timer = 0;
    let anim = null;
    let clone = null;
    const startY = window.scrollY;

    const removeClone = () => {
      if (anim) anim.stop();
      anim = null;
      clone?.remove();
      clone = null;
    };
    const beginSatellite = () => {
      phaseRef.current = "done";
      window.removeEventListener("scroll", onScroll);
      frontRingRef.current?.beginSatellite();
    };
    const abort = () => {
      if (phaseRef.current === "done") return;
      window.clearTimeout(timer);
      removeClone();
      beginSatellite();
    };
    function onScroll() {
      if (Math.abs(window.scrollY - startY) > CANCEL_SCROLL) abort();
    }
    abortRef.current = abort;
    window.addEventListener("scroll", onScroll, { passive: true });
    let disposed = false;
    // Fetch the flight chunk now so it is ready at 1 s; if it cannot load, the satellite simply starts.
    const flight = import("./launchFlight");
    flight.catch(() => {});

    const launch = ({ flyToOrbit }) => {
      if (disposed || phaseRef.current !== "pending") return;
      const period = periodRef.current;
      const end = frontRingRef.current?.getStartPoint?.();
      const rect = period?.getBoundingClientRect();
      // Layout size (offsetWidth) so a still-running entrance scale on the period cannot shrink the clone.
      const r = rect && { left: rect.left, top: rect.top, width: period.offsetWidth, height: period.offsetHeight };
      if (!period || !end || !r || r.width === 0 || !isDesktop()) {
        abort();
        return;
      }
      phaseRef.current = "flying";

      const x0 = rect.left + rect.width / 2;
      const y0 = rect.top + rect.height / 2;
      const { x: x2, y: y2 } = end;
      const x1 = (x0 + x2) / 2;
      const y1 = Math.min(y0, y2) - ARC_LIFT;
      // Motion eases each keyframe segment separately, so the 24 points are sampled at EASE.inout-spaced
      // parameters and played linearly: the whole flight follows one ease-in-out curve.
      const xs = [];
      const ys = [];
      for (let i = 0; i < POINTS; i += 1) {
        const u = easeInOut(i / (POINTS - 1));
        const a = 1 - u;
        xs.push(a * a * x0 + 2 * a * u * x1 + u * u * x2 - r.width / 2);
        ys.push(a * a * y0 + 2 * a * u * y1 + u * u * y2 - r.height / 2);
      }

      clone = document.createElement("div");
      clone.setAttribute("aria-hidden", "true");
      clone.className = "pointer-events-none fixed left-0 top-0 z-cursor rounded-full bg-gold shadow-glow-sat";
      clone.style.width = `${r.width}px`;
      clone.style.height = `${r.height}px`;
      clone.style.transform = `translate(${xs[0]}px, ${ys[0]}px)`;
      clone.style.willChange = "transform";
      document.body.appendChild(clone);

      // The original period flashes once (CSS, scale 1.4 -> 1, 300 ms).
      period.classList.remove("is-launching");
      void period.offsetWidth;
      period.classList.add("is-launching");
      period.addEventListener("animationend", () => period.classList.remove("is-launching"), { once: true });

      anim = flyToOrbit(clone, xs, ys, FLIGHT);
      anim.then(() => {
        if (phaseRef.current !== "flying") return;
        anim = null;
        removeClone();
        beginSatellite();
      });
    };

    timer = window.setTimeout(() => {
      if (phaseRef.current !== "pending") return;
      flight.then(launch).catch(() => {
        if (!disposed) abort();
      });
    }, LAUNCH_AT);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      removeClone();
      if (phaseRef.current === "flying") phaseRef.current = "pending";
      abortRef.current = null;
    };
  }, [eligible, periodRef, frontRingRef]);

  // Motion switched off mid-launch: cancel (the satellite parks). Switched back on: a ring that was mounted with
  // autoStart=false has a fresh <animateMotion begin="indefinite">, so begin it explicitly.
  const reducedOnce = useRef(reduced);
  useEffect(() => {
    if (reducedOnce.current === reduced) return undefined;
    reducedOnce.current = reduced;
    if (reduced) {
      abortRef.current?.();
      return undefined;
    }
    if (!eligible || phaseRef.current !== "done") return undefined;
    const raf = requestAnimationFrame(() => frontRingRef.current?.beginSatellite());
    return () => cancelAnimationFrame(raf);
  }, [reduced, eligible, frontRingRef]);

  return { launchPending: eligible && phaseRef.current !== "done" };
}
