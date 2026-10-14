export const EASE = {
  out: [0.16, 1, 0.3, 1],      // "settle": all reveals
  inout: [0.76, 0, 0.24, 1],   // "burn": menu, full-stop launch, eclipse
  ui: [0.25, 1, 0.5, 1],       // "trim": hover, focus, colour, dim
  in: [0.7, 0, 0.84, 0],       // "jettison": exits only
  draw: [0.65, 0, 0.35, 1],    // "trace": SVG path draws
};
export const CSS_EASE = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inout: "cubic-bezier(0.76, 0, 0.24, 1)",
  ui: "cubic-bezier(0.25, 1, 0.5, 1)",
  in: "cubic-bezier(0.7, 0, 0.84, 0)",
  draw: "cubic-bezier(0.65, 0, 0.35, 1)",
};
export const GSAP_EASE = { out: "expo.out", inout: "power4.inOut", ui: "quart.out", in: "expo.in", draw: "sine.inOut", none: "none" };
export const DUR = { press: 0.1, micro: 0.16, ui: 0.24, panel: 0.42, reveal: 0.8, headline: 1.1, draw: 1.2, drawLong: 1.6 };
export const SPRING = {
  magnet: { type: "spring", stiffness: 150, damping: 15, mass: 0.1 },
  lock: { type: "spring", stiffness: 380, damping: 32 },
  preview: { type: "spring", stiffness: 220, damping: 26, mass: 0.6 },
  progress: { stiffness: 120, damping: 30, restDelta: 0.001 },
};
export const STAGGER = { words: 0.07, lines: 0.1, chars: 0.018, cards: 0.08, stats: 0.12, groups: 0.2, cap: 0.48 };
export const VIEWPORT = { once: true, amount: 0.3 };

/** Per-item stagger so a group never exceeds STAGGER.cap in total. */
export const staggerFor = (count, step = STAGGER.cards) => Math.min(step, STAGGER.cap / Math.max(count, 1));

export const fadeUp = ({ y = 24, delay = 0, duration = DUR.reveal } = {}) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE.out } },
});
export const fadeUpScale = ({ y = 32, delay = 0 } = {}) => ({
  hidden: { opacity: 0, y, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.reveal, delay, ease: EASE.out } },
});
export const staggerParent = ({ stagger = STAGGER.cards, delay = 0 } = {}) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
