import { useLayoutEffect, useState } from "react";

// Orbit geometry in disc units (spec 6.2): two rings 1.7 x 0.6 disc, rx .78, ry .2, rotated -12 deg,
// centred .18 disc below the disc centre. Shared by the hero eclipse and the contact portrait.
export const RING = { w: 1.7, h: 0.6, rx: 0.78, ry: 0.2, drop: 0.18, rotate: -12 };

/** The ring's SVG box, in disc-box pixels. */
export const ringBox = (d) => ({
  left: (d - RING.w * d) / 2,
  top: d / 2 + RING.drop * d - (RING.h * d) / 2,
  width: Math.round(RING.w * d),
  height: Math.round(RING.h * d),
});

/** OrbitRing props for a disc of d px. */
export const ringProps = (d) => {
  const box = ringBox(d);
  return { width: box.width, height: box.height, rx: RING.rx * d, ry: RING.ry * d, rotate: RING.rotate };
};

/** A point on the ring at angle t (degrees, local ellipse coordinates), in disc-box pixels. */
export const ringPoint = (d, t) => {
  const a = (t * Math.PI) / 180;
  const r = (RING.rotate * Math.PI) / 180;
  const lx = RING.rx * d * Math.cos(a);
  const ly = RING.ry * d * Math.sin(a);
  return {
    x: d / 2 + lx * Math.cos(r) - ly * Math.sin(r),
    y: d / 2 + RING.drop * d + lx * Math.sin(r) + ly * Math.cos(r),
  };
};

/** The rendered width of `ref` (the disc box), kept in sync with a ResizeObserver. */
export function useDiscSize(ref, initial) {
  const [d, setD] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const w = Math.round(el.offsetWidth);
      if (w > 0) setD((prev) => (prev === w ? prev : w));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return d;
}

/** Back half of the orbit plane (local "top" half), as a CSS half-plane gradient. */
export const BACK_HALF = `linear-gradient(${360 + RING.rotate}deg, transparent 50%, #000 50%)`;
