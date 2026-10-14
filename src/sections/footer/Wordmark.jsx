import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { fadeUp, staggerParent } from "@/lib/motion";
import Reveal from "@/components/ui/Reveal";
import RevealItem from "@/components/ui/RevealItem";
import useMediaQuery from "@/hooks/useMediaQuery";
import useMotionPreference from "@/hooks/useMotionPreference";
import usePrefersFinePointer from "@/hooks/usePrefersFinePointer";

const WORD = "NAPOLES";
const LETTERS = Array.from(WORD);
const RADIUS = 300; // px
const REST = '"wdth" 125, "wght" 800';
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const parentVariants = staggerParent({ stagger: 0.05 });
const letterVariants = fadeUp({ y: 40 });

/**
 * Giant footer wordmark (spec 6.15): NAPOLES, ghost gradient, sinking under the footer's bottom edge.
 * Letters rise with a 50 ms stagger on enter (Motion). On desktop with a fine pointer (motion on),
 * letters near the pointer narrow and thicken: t = clamp(1 - dist / 300), wdth 125 - 25t, wght 800 + 100t.
 * `trackRef` is the element whose pointermove drives the effect (the footer). Decorative: pass aria-hidden.
 */
export default function Wordmark({ trackRef, className, ...rest }) {
  const boxRef = useRef(null);
  const letterRefs = useRef([]);
  const { reduced } = useMotionPreference();
  const fine = usePrefersFinePointer();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const proximity = !reduced && fine && desktop;

  useEffect(() => {
    if (!proximity) return undefined;
    const track = trackRef?.current;
    const box = boxRef.current;
    if (!track || !box) return undefined;

    let raf = 0;
    let px = 0;
    let py = 0;
    let active = false;
    let centers = null; // letter centres relative to the box, measured at rest
    let lastLeave = 0;

    const letters = () => letterRefs.current.filter(Boolean);
    const measure = () => {
      const b = box.getBoundingClientRect();
      centers = letters().map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
      });
    };
    const apply = () => {
      raf = 0;
      if (!centers) measure();
      const b = box.getBoundingClientRect();
      letters().forEach((el, i) => {
        const c = centers[i];
        if (!c) return;
        const t = active ? clamp01(1 - Math.hypot(px - (b.left + c.x), py - (b.top + c.y)) / RADIUS) : 0;
        el.style.fontVariationSettings = t > 0.001 ? `"wdth" ${(125 - 25 * t).toFixed(2)}, "wght" ${(800 + 100 * t).toFixed(1)}` : REST;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onEnter = () => {
      // Re-measure only when the letters have had time to settle back to rest.
      if (performance.now() - lastLeave > 450) centers = null;
    };
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      px = e.clientX;
      py = e.clientY;
      active = true;
      schedule();
    };
    const onLeave = () => {
      active = false;
      lastLeave = performance.now();
      schedule();
    };
    const onResize = () => {
      centers = null;
    };

    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointermove", onMove, { passive: true });
    track.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize, { passive: true });
    document.fonts?.ready?.then(onResize).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      letters().forEach((el) => {
        el.style.fontVariationSettings = "";
      });
    };
  }, [proximity, trackRef]);

  return (
    <div
      ref={boxRef}
      className={cn(
        "wordmark-box select-none whitespace-nowrap font-extrabold leading-[.8] tracking-[-0.05em] stretch-125",
        className
      )}
      {...rest}
    >
      <Reveal as="div" variants={parentVariants} className="flex justify-center">
        {LETTERS.map((ch, i) => (
          <RevealItem as="span" key={`${ch}-${i}`} variants={letterVariants} className="inline-block">
            <span
              ref={(el) => {
                letterRefs.current[i] = el;
              }}
              className="wordmark-letter inline-block bg-g-wordmark bg-clip-text text-transparent"
            >
              {ch}
            </span>
          </RevealItem>
        ))}
      </Reveal>
    </div>
  );
}
