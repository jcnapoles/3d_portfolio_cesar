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
// Tempo pass 2: reveals settle in ~0.5 s (the expo-out curve reads as done well before that), hover / press in
// 100-180 ms, path draws in 0.75 s. Keep index.css (--t-*) and tailwind.config.cjs (transitionDuration) in sync.
export const DUR = { press: 0.1, micro: 0.14, ui: 0.18, panel: 0.32, reveal: 0.5, headline: 0.7, draw: 0.75, drawLong: 1 };
export const SPRING = {
  magnet: { type: "spring", stiffness: 150, damping: 15, mass: 0.1 },
  lock: { type: "spring", stiffness: 420, damping: 34 },
  preview: { type: "spring", stiffness: 260, damping: 28, mass: 0.6 },
  // Navbar progress line: settles ~0.3 s after the scroll stops (was ~0.8 s).
  progress: { stiffness: 320, damping: 42, restDelta: 0.001 },
};
export const STAGGER = { words: 0.045, lines: 0.06, chars: 0.012, cards: 0.05, stats: 0.06, groups: 0.1, cap: 0.3 };
// Reveals fire as soon as the element's top is 6 % inside the viewport (position, not a share of the element's
// height: tall blocks used to wait until 30 % of them was on screen).
export const VIEWPORT = { once: true, margin: "0px 0px -6% 0px" };

/** Per-item stagger so a group never exceeds STAGGER.cap in total. */
export const staggerFor = (count, step = STAGGER.cards) => Math.min(step, STAGGER.cap / Math.max(count, 1));

export const fadeUp = ({ y = 16, delay = 0, duration = DUR.reveal } = {}) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE.out } },
});
export const fadeUpScale = ({ y = 20, delay = 0 } = {}) => ({
  hidden: { opacity: 0, y, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.reveal, delay, ease: EASE.out } },
});
export const staggerParent = ({ stagger = STAGGER.cards, delay = 0 } = {}) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
