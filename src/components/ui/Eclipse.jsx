import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { cancelFrame, cubicBezier, frame, useScroll } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";
import useMotionPreference from "@/hooks/useMotionPreference";
import useInViewport from "@/hooks/useInViewport";
import useFirstVisit from "@/hooks/useFirstVisit";
import StarGlyph from "@/components/ui/StarGlyph";
import "./eclipse.css";

/* ------------------------------------------------------------------------------------------------------------------
   Geometry, in sun radii (sun centre = origin, screen axes: x right, y down).
   A total eclipse needs the moon's disc to look slightly larger than the sun's (here 4.5 %). The moon's limb is not
   a circle: mountains and valleys (relief exaggerated about 8x so it reads on screen). When the crescent becomes
   thinner than that relief it breaks up into Baily's beads, sunlight shining through the deepest lunar valleys; the
   last bead is the diamond ring. Totality starts once every valley is covered (second contact) and ends when the
   first valley on the exiting limb opens again (third contact).
   The moon travels from the lower left towards the upper right on a shallow parabola (the "slight arc").
   ------------------------------------------------------------------------------------------------------------------ */
const RM = 1.045;
const DIR = (-32 * Math.PI) / 180; // direction of travel: up and to the right
const UX = Math.cos(DIR);
const UY = Math.sin(DIR);
const VX = -UY; // perpendicular (down-right): bends the path into an arc
const VY = UX;
const ARC = 0.07;
const LIMB = { plain: 0.996, relief: 0.0015, valley: 0.012, width: (0.8 * Math.PI) / 180 };
const S_START = -2.14; // just outside first contact: the sun is fully bright
const S_REST = -0.018; // just inside second contact (all valleys covered): the corona + the diamond, frozen
const S_EXIT = 0.95; // where the scroll exit ends (hero fully scrolled out): a wide crescent after third contact
// Scroll progress -> moon travel. Eased in, so third contact (beads, the small diamond ring) plays over roughly
// the first half of the exit while the hero is still well in view, then the crescent widens faster.
const exitTravel = (p) => (S_EXIT - S_REST) * Math.pow(p, 1.45);
const KG = 2.4; // glare layer, in sun diameters (must match .ecl-glare --k)

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
const moonAt = (s) => [s * UX + ARC * s * s * VX, s * UY + ARC * s * s * VY];

/** Area of the sun (r = 1) covered by the moon (r = RM) at centre distance d. */
function coveredArea(d) {
  if (d >= 1 + RM) return 0;
  if (d <= RM - 1) return Math.PI;
  const a = Math.acos(clamp((d * d + 1 - RM * RM) / (2 * d), -1, 1));
  const b = RM * RM * Math.acos(clamp((d * d + RM * RM - 1) / (2 * d * RM), -1, 1));
  const c = 0.5 * Math.sqrt(Math.max(0, (-d + 1 + RM) * (d + 1 - RM) * (d - 1 + RM) * (d + 1 + RM)));
  return a + b - c;
}
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Baily's beads sit where the deepest valleys of the moon's limb meet the sun's limb:
// [offset from the contact point (deg), valley depth (x LIMB.valley), size, twinkle ms].
const BEAD_SPECS_C2 = [
  [-23, 0.8, 0.7, 380],
  [-15, 0.95, 0.9, 470],
  [-8, 1, 1, 330],
  [-1, 1.1, 1.2, 520],
  [6, 0.95, 0.95, 410],
  [13, 0.9, 0.8, 360],
  [21, 0.8, 0.65, 450],
];
const BEAD_SPECS_C3 = [
  [-17, 0.8, 0.7, 400],
  [-8, 0.95, 0.9, 350],
  [1, 1.1, 1.1, 480],
  [9, 0.9, 0.85, 380],
  [17, 0.8, 0.65, 430],
];
const moonAtXY = (s) => {
  const [x, y] = moonAt(s);
  return { x, y };
};
const angleDelta = (a, b) => {
  let d = (a - b) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return d;
};
/** Beads on the sun's limb + their valley directions seen from the moon's centre during that contact. */
function makeBeads(specs, base, moonMid) {
  return specs.map(([deg, depth, size, tw]) => {
    const t = base + (deg * Math.PI) / 180;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    return {
      cos,
      sin,
      depth,
      size,
      tw,
      valley: Math.atan2(sin - moonMid.y, cos - moonMid.x),
      left: `${50 + 49.6 * cos}%`,
      top: `${50 + 49.6 * sin}%`,
    };
  });
}
const BEADS_C2 = makeBeads(BEAD_SPECS_C2, DIR, moonAtXY(-0.034));
const BEADS_C3 = makeBeads(BEAD_SPECS_C3, DIR + Math.PI, moonAtXY(0.034));
const VALLEYS = [...BEADS_C2, ...BEADS_C3];
// Shallower valleys all around the limb (seeded, deterministic), so the whole profile reads as one rugged limb.
// They keep clear of the bead valleys (which stay the deepest), so no light ever leaks through at rest.
const RUGGED = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const list = [];
  for (let i = 0; i < 64; i += 1) {
    const valley = (i / 64) * 2 * Math.PI + (rnd() - 0.5) * 0.08;
    const depth = 0.08 + rnd() * 0.16;
    const w = 0.7 + rnd() * 0.8;
    const nearBead = VALLEYS.some((b) => Math.abs(angleDelta(valley, b.valley)) < (3.2 * Math.PI) / 180);
    if (!nearBead) list.push({ valley, depth, w });
  }
  return list;
})();

/** Lunar limb radius factor at angle theta (moon frame): rolling relief + the bead valleys. */
function limbAt(theta) {
  const n = 0.5 * Math.sin(7 * theta + 1.3) + 0.3 * Math.sin(17 * theta + 0.4) + 0.2 * Math.sin(31 * theta + 2.1);
  let f = LIMB.plain + LIMB.relief * n;
  for (const v of VALLEYS) {
    const k = angleDelta(theta, v.valley) / LIMB.width;
    if (Math.abs(k) < 4) f -= LIMB.valley * v.depth * Math.exp(-k * k);
  }
  for (const v of RUGGED) {
    const k = angleDelta(theta, v.valley) / (LIMB.width * v.w);
    if (Math.abs(k) < 4) f -= LIMB.valley * v.depth * Math.exp(-k * k);
  }
  return f;
}
for (const b of VALLEYS) b.floor = RM * limbAt(b.valley);

/** The moon's silhouette as a clip-path polygon (its box is the circle of radius RM). */
const MOON_CLIP = (() => {
  const pts = [];
  const N = 720;
  for (let i = 0; i < N; i += 1) {
    const t = (i / N) * 2 * Math.PI;
    const f = limbAt(t);
    pts.push(`${(50 + 50 * f * Math.cos(t)).toFixed(3)}% ${(50 + 50 * f * Math.sin(t)).toFixed(3)}%`);
  }
  return `polygon(${pts.join(",")})`;
})();

/** Sunlight left in a valley: distance from the moon's centre to the sun's limb point minus the valley floor. */
const valleyGap = (b, mx, my) => Math.hypot(b.cos - mx, b.sin - my) - b.floor;
const C3_MAIN = BEADS_C3[2];
const MOON_STYLE = { clipPath: MOON_CLIP };

const pointOnLimb = (theta) => ({ left: `${50 + 50 * Math.cos(theta)}%`, top: `${50 + 50 * Math.sin(theta)}%` });
const C2_POINT = pointOnLimb(DIR);
const C3_POINT = pointOnLimb(DIR + Math.PI);
const AMBIENT_POINT = pointOnLimb((210 * Math.PI) / 180); // 10 o'clock, clear of the portrait's head

/* ------------------------------------------------------------------------------------------------------------------
   Intro timeline (seconds after the delay; it runs beside the copy reveal, never before it). About 1.9 s in total:
   approach (the sun dims as the moon covers it) -> thin crescent -> Baily's beads (lingering, the suspense)
   -> the last bead flashes into the diamond ring (totality, ~1.25 s) -> the corona blooms and stays.
   The whole sequence is the original 3 s one scaled by 0.62 (segment ratios kept, so the eases still hand over
   with a continuous velocity).
   ------------------------------------------------------------------------------------------------------------------ */
const INTRO = { delay: 0.1, flashAt: 1.153, bloomAt: 1.079, flash: 0.558, bloom: 0.713 };
const REPEAT_SPEED = 0.62; // repeat visits in the same tab: the same sequence, shorter (~1.2 s)
// Moon path keyframes. Segment eases are matched so the velocity is continuous at each hand-over.
const PATH = {
  s: [S_START, -0.15, -0.05, S_REST],
  t: [0, 0.651, 0.899, 1.364],
  ease: [cubicBezier(0.35, 0.05, 0.5, 0.868), cubicBezier(0.2, 0.4, 0.45, 0.906), cubicBezier(0.3, 0.3, 0.5, 1)],
};
// Total intro length (seconds at speed 1), from the start of the delay to the settled corona.
const INTRO_END = INTRO.delay + Math.max(PATH.t[PATH.t.length - 1], INTRO.flashAt + INTRO.flash, INTRO.bloomAt + INTRO.bloom);
const INTRO_FPS = 60; // keyframe sampling rate of the compositor intro
function pathAt(t) {
  const { s, t: T, ease } = PATH;
  if (t <= 0) return s[0];
  for (let i = 0; i < ease.length; i += 1) {
    if (t < T[i + 1]) return lerp(s[i], s[i + 1], ease[i]((t - T[i]) / (T[i + 1] - T[i])));
  }
  return s[s.length - 1];
}
const easeOut = cubicBezier(...EASE.out);
const easeInOut = cubicBezier(...EASE.inout);
const FLASH_PEAK_AT = 0.38; // of the flash duration
const PULSE_MS = 900;

/* ------------------------------------------------------------------------------------------------------------------
   Idle loops, two compositor animations in total (every running animation costs the main thread a style update on
   each frame something else draws, so the corona's four loops became two plus a one-shot):
   - the slow layer (K-corona, radially symmetric, + helmet streamers) turns once per 280 s and breathes
     (opacity 1 -> .88 -> 1 every 8 s, 35 breaths per turn);
   - the fine rays sit inside it and turn once per 146.1 s relative to it, i.e. once per 96 s on screen;
   - the diamond's rare glint is a 1.4 s one-shot every 14 s (first one at 17.6 s), not a loop that idles 90 %.
   ------------------------------------------------------------------------------------------------------------------ */
const SLOW_TURN_MS = 280000;
const RAYS_TURN_MS = 96000;
const RAYS_REL_MS = 1 / (1 / RAYS_TURN_MS - 1 / SLOW_TURN_MS);
const BREATHS = 35; // 280 s / 8 s
const EASE_INOUT_CSS = `cubic-bezier(${EASE.inout.join(",")})`;
const SLOW_FRAMES = (() => {
  // Rotation: linear over the whole turn (it is only set on the first and last keyframe). Breathing: one keyframe
  // per half breath, eased; the first segment is linear because the first keyframe also starts the rotation.
  const frames = [{ offset: 0, transform: "rotate(0deg)", opacity: 1, easing: "linear" }];
  for (let k = 1; k < BREATHS * 2; k += 1) {
    frames.push({ offset: k / (BREATHS * 2), opacity: k % 2 ? 0.88 : 1, easing: "ease-in-out" });
  }
  frames.push({ offset: 1, transform: "rotate(360deg)", opacity: 1 });
  return frames;
})();
const SPIN_FRAMES = [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }];
const GLINT_FRAMES = [
  { transform: "none", easing: EASE_INOUT_CSS },
  { offset: 0.35, transform: "scale(1.38) rotate(14deg)", easing: EASE_INOUT_CSS },
  { transform: "none" },
];
const GLINT_MS = 1400;
const GLINT_EVERY = 14000;
const GLINT_FIRST = 17600;

const REST = {
  hero: { scale: 0.9, glow: 0.55, star: 1 },
  ambient: { scale: 1, glow: 0.5, star: 0.6 },
};

/** Two-segment keyframes [from, peak, to] at FLASH_PEAK_AT, ease out then ease in-out. */
function flashCurve(t, from, peak, to) {
  if (t <= 0) return from;
  if (t >= 1) return to;
  if (t < FLASH_PEAK_AT) return lerp(from, peak, easeOut(t / FLASH_PEAK_AT));
  return lerp(peak, to, easeInOut((t - FLASH_PEAK_AT) / (1 - FLASH_PEAK_AT)));
}

/** The intro state at `t` seconds after the delay (speed 1): moon travel, diamond flash, corona bloom. */
function introAt(S, t, rest0) {
  S.s = pathAt(t);
  const tf = (t - INTRO.flashAt) / INTRO.flash;
  S.fScale = flashCurve(tf, 0, 2.2, rest0.scale);
  S.fGlow = flashCurve(tf, 0, 1, rest0.glow);
  S.bloom = easeOut(clamp01((t - INTRO.bloomAt) / INTRO.bloom));
}

/**
 * Every node the hero eclipse animates, as (node name, CSS property, value) through `put`. Transform and opacity
 * only. Node names: corona, glare, moon, flare, flareGlow, flareStar, flare3, b0..b6 (second-contact beads),
 * c0..c4 (third-contact beads). Returns true while any Baily's bead shows.
 */
function writeHero(S, put) {
  // Pulse (flare()) rides on top of the flash state.
  let fScale = S.fScale;
  let fGlow = S.fGlow;
  if (S.pulse) {
    const p = easeOut(clamp01(S.pulse.k));
    const bump = p < 0.5 ? p / 0.5 : (1 - p) / 0.5;
    fScale += (2.2 - fScale) * bump;
    fGlow += (1 - fGlow) * bump;
  }

  const s = S.s + exitTravel(S.p);
  const [mx, my] = moonAt(s);
  const d = Math.hypot(mx, my);

  // Moon (its box is 2 RM sun radii wide).
  put("moon", "transform", `translate(${((mx / (2 * RM)) * 100).toFixed(3)}%, ${((my / (2 * RM)) * 100).toFixed(3)}%)`);

  // Glare: sqrt of the visible fraction (the sky only darkens in the last moments), centred on the crescent.
  const A = coveredArea(d);
  const vis = clamp01(1 - A / Math.PI);
  const g = Math.sqrt(vis);
  let cx = 0;
  let cy = 0;
  if (A > 0 && d > 1e-6) {
    const lens = (Math.max(-1, d - RM) + 1) / 2;
    const c = vis > 1e-6 ? Math.max(-0.96, (-A * lens) / (Math.PI - A)) : -0.96;
    cx = (mx / d) * c;
    cy = (my / d) * c;
  }
  put("glare", "opacity", (g * 0.96).toFixed(3));
  put(
    "glare",
    "transform",
    `translate(${((cx / (2 * KG)) * 100).toFixed(3)}%, ${((cy / (2 * KG)) * 100).toFixed(3)}%) scale(${(0.5 + 0.5 * g).toFixed(4)})`
  );

  // Third contact: the exiting limb's main valley opens; the corona fades as the glare returns.
  const gap3 = valleyGap(C3_MAIN, mx, my);
  const corPos = 1 - smooth(0.004, 0.17, gap3);
  put("corona", "opacity", (S.bloom * corPos).toFixed(3));
  put("corona", "transform", `scale(${(0.92 + 0.08 * S.bloom).toFixed(4)})`);

  // Second-contact diamond (flash state), covered again as the moon moves deeper into totality.
  const posC2 = 1 - smooth(S_REST + 0.004, S_REST + 0.07, s);
  put("flare", "opacity", posC2.toFixed(3));
  put("flare", "transform", `scale(${fScale.toFixed(4)})`);
  put("flareGlow", "opacity", fGlow.toFixed(3));

  // Third-contact diamond: small, peaks as the first bead breaks through, merges into the crescent's glare.
  const dr3 = smooth(0, 0.014, gap3) * (1 - smooth(0.07, 0.34, gap3));
  put("flare3", "opacity", dr3.toFixed(3));
  put("flare3", "transform", `scale(${(0.38 + 0.45 * dr3).toFixed(4)})`);

  // Baily's beads: sunlight left in a valley once the mountains around it already cover the sun
  // (gap below the relief); above that the crescent is still continuous and the bead hands over to it.
  let any = false;
  const beadPass = (list, key) => {
    for (let i = 0; i < list.length; i += 1) {
      const gv = valleyGap(list[i], mx, my);
      const v = smooth(0, 0.0025, gv) * (1 - smooth(0.012, 0.022, gv));
      if (v > 0.01) any = true;
      put(`${key}${i}`, "opacity", v.toFixed(3));
    }
  };
  beadPass(BEADS_C2, "b");
  beadPass(BEADS_C3, "c");
  return any;
}

/**
 * Pre-samples a hero sequence into Web Animation keyframes: `offsets` (0 -> 1, increasing) are the keyframe
 * offsets, `setup(S, i)` puts the state of sample i into S. Only the properties that change are kept, and a sample
 * is kept only where some property of that node changes (runs of equal values collapse to their ends).
 * Returns { nodes: Map(name -> keyframes[]), beads: [[on, off], ...] (offsets where some bead shows) }.
 */
function sampleHero(offsets, setup) {
  const rest0 = REST.hero;
  const S = { s: S_REST, p: 0, fScale: rest0.scale, fGlow: rest0.glow, bloom: 1, pulse: null };
  const N = offsets.length - 1;
  const tracks = new Map(); // "node|prop" -> { node, prop, values }
  const beadOn = [];
  for (let i = 0; i <= N; i += 1) {
    setup(S, i);
    beadOn.push(
      writeHero(S, (node, prop, value) => {
        const key = `${node}|${prop}`;
        let tr = tracks.get(key);
        if (!tr) tracks.set(key, (tr = { node, prop, values: [] }));
        tr.values.push(value);
      })
    );
  }
  const byNode = new Map();
  for (const tr of tracks.values()) {
    if (tr.values.every((v) => v === tr.values[0])) continue;
    if (!byNode.has(tr.node)) byNode.set(tr.node, []);
    byNode.get(tr.node).push(tr);
  }
  const nodes = new Map();
  byNode.forEach((list, node) => {
    const frames = [];
    for (let i = 0; i <= N; i += 1) {
      const edge = i === 0 || i === N;
      const moving = edge || list.some((tr) => tr.values[i] !== tr.values[i - 1] || tr.values[i] !== tr.values[i + 1]);
      if (!moving) continue;
      const f = { offset: offsets[i] };
      for (const tr of list) f[tr.prop] = tr.values[i];
      frames.push(f);
    }
    nodes.set(node, frames);
  });
  const beads = [];
  for (let i = 1; i <= N; i += 1) {
    if (beadOn[i] && !beadOn[i - 1]) beads.push([offsets[i], 1]);
    else if (!beadOn[i] && beadOn[i - 1] && beads.length) beads[beads.length - 1][1] = offsets[i];
  }
  return { nodes, beads };
}

/** The first-visit intro (INTRO_FPS samples per second), so the compositor plays it while the page still mounts. */
let introSample = null;
function sampleIntro() {
  if (!introSample) {
    const N = Math.ceil(INTRO_END * INTRO_FPS);
    const offsets = Array.from({ length: N + 1 }, (_, i) => i / N);
    introSample = sampleHero(offsets, (S, i) => introAt(S, offsets[i] * INTRO_END - INTRO.delay, REST.hero));
  }
  return introSample;
}

/**
 * The scroll exit (scroll progress p: 0 -> 1), for a scroll-driven animation. Sampled densest at the start
 * (p = u^1.6), where third contact plays its beads and small diamond ring.
 */
const EXIT_STEPS = 200;
let exitSample = null;
function sampleExit() {
  if (!exitSample) {
    const offsets = Array.from({ length: EXIT_STEPS + 1 }, (_, i) => Math.pow(i / EXIT_STEPS, 1.6));
    exitSample = sampleHero(offsets, (S, i) => {
      S.p = offsets[i];
    });
  }
  return exitSample;
}
const hasScrollTimeline = () => typeof window !== "undefined" && typeof window.ScrollTimeline === "function";
/** "end" -> 1, "40%" -> 0.4 (the share of the target's height after which the exit completes). */
const exitShare = (exitAt) => (exitAt === "end" ? 1 : Math.min(1, Math.max(0.01, (Number.parseFloat(exitAt) || 100) / 100)));

/**
 * Pipes the scroll progress of `target`: 0 when its top reaches the viewport top, 1 when the `exitAt` point of the
 * target does ("end" = its bottom, i.e. 0 -> 100 % of its height; "30%" = after 30 % of its height).
 */
function ScrollLink({ target, exitAt, onProgress }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start start", `${exitAt} start`] });
  useEffect(() => {
    onProgress(scrollYProgress.get());
    return scrollYProgress.on("change", onProgress);
  }, [scrollYProgress, onProgress]);
  useEffect(() => () => onProgress(0), [onProgress]);
  return null;
}

/* Helmet streamers (static SVG, sun radius = 50 units, box = 2.8 suns = 280 units). */
const R = 50;
function streamerPath(w, b, len) {
  const bx = R * Math.cos(w);
  const by = R * Math.sin(w);
  return [
    `M ${bx} ${-by}`,
    `C ${R * 1.18} ${-R * b} ${R * 1.55} ${-R * b * 0.85} ${R * 1.95} ${-R * 0.16}`,
    `Q ${len * 0.62} ${-R * 0.05} ${len} 0`,
    `Q ${len * 0.62} ${R * 0.05} ${R * 1.95} ${R * 0.16}`,
    `C ${R * 1.55} ${R * b * 0.85} ${R * 1.18} ${R * b} ${bx} ${by}`,
    "Z",
  ].join(" ");
}
// [angle deg, half base (rad), bulge (sun radii), length (units), opacity]
const STREAMER_SPECS = [
  [-52, 0.55, 0.6, 136, 0.85],
  [-12, 0.38, 0.4, 102, 0.55],
  [146, 0.6, 0.64, 138, 0.85],
  [178, 0.4, 0.44, 106, 0.6],
  [96, 0.32, 0.34, 84, 0.4],
  [254, 0.3, 0.33, 80, 0.38],
  [40, 0.28, 0.3, 92, 0.42],
  [214, 0.28, 0.3, 96, 0.45],
];
const STREAMERS = STREAMER_SPECS.map(([a, w, b, len, o]) => ({ a, d: streamerPath(w, b, len), o }));
// Ambient (around the contact portrait): a tighter corona, so every streamer fades out inside its smaller box.
const AMBIENT_REACH = 0.78;
const STREAMERS_AMBIENT = STREAMER_SPECS.map(([a, w, b, len, o]) => ({
  a,
  d: streamerPath(w, b, R * 1.95 + (len - R * 1.95) * AMBIENT_REACH),
  o,
}));
// Polar plumes: thin straight rays near the poles (solar-minimum look).
const PLUMES = [-104, -96, -88, -80, -73, 74, 82, 90, 98, 106].map((a, i) => ({
  a,
  len: 22 + ((i * 37) % 19),
  w: 0.7 + ((i * 13) % 5) * 0.18,
}));

/**
 * `half`: half the corona box in units (the box is `half * 2 / 100` suns wide); `reach` scales the streamer lengths
 * (and the fade) so they always die out inside the box.
 */
function Streamers({ half = 140, reach = 1 }) {
  const uid = useId().replace(/:/g, "");
  const grad = `ecl-sg-${uid}`;
  const blur = `ecl-sb-${uid}`;
  const paths = reach === 1 ? STREAMERS : STREAMERS_AMBIENT;
  // Stops in units from the sun centre; beyond the limb (50) the distances shrink with `reach`.
  const at = (u) => (u <= R ? u : R + (u - R) * reach);
  const r = at(140);
  const off = (u) => (at(u) / r).toFixed(4);
  return (
    <svg viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={grad} gradientUnits="userSpaceOnUse" cx="0" cy="0" r={r}>
          <stop offset={off(47.6)} stopColor="#FFF6E8" stopOpacity="0.95" />
          <stop offset={off(58.8)} stopColor="#FFE7BE" stopOpacity="0.62" />
          <stop offset={off(78.4)} stopColor="#FFD08A" stopOpacity="0.3" />
          <stop offset={off(106.4)} stopColor="#F4B860" stopOpacity="0.1" />
          <stop offset="1" stopColor="#F4B860" stopOpacity="0" />
        </radialGradient>
        <filter id={blur} filterUnits="userSpaceOnUse" x={-half} y={-half} width={half * 2} height={half * 2}>
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <g filter={`url(#${blur})`} fill={`url(#${grad})`}>
        {paths.map((s) => (
          <path key={s.a} d={s.d} opacity={s.o} transform={`rotate(${s.a})`} />
        ))}
        {PLUMES.map((p) => (
          <rect key={p.a} x={R * 0.98} y={-p.w / 2} width={p.len} height={p.w} opacity="0.55" transform={`rotate(${p.a})`} />
        ))}
      </g>
    </svg>
  );
}

/**
 * A physically modelled total solar eclipse, CSS/SVG only (no WebGL), animated with transform and opacity.
 *
 * Layers, back to front: corona (soft K-corona + slowly rotating plumes + helmet streamers, gold with a faint ion
 * edge) -> photosphere glare (dims with the visible sun area and slides onto the crescent) -> sun disc (gold-hot
 * core, limb-darkened) -> `underMoon` slot (e.g. the back half of an orbit) -> moon (void, ion earthshine rim) ->
 * Baily's beads -> diamond-ring flares (radial bloom + spikes + StarGlyph).
 *
 * variant 'hero': first visit plays the ~1.9 s totality intro (repeat visits ~1.2 s), pre-sampled into Web
 * Animations so the compositor plays it smoothly while the page is still mounting; with `scrollTarget` the moon
 * keeps travelling as that element scrolls out (third contact: beads, a small diamond ring on the exiting limb,
 * then a growing crescent while the corona fades). variant 'ambient': a static totality around a disc (the moon is
 * styled as the portrait disc), with a 10 o'clock star for flare().
 *
 * Idle (two compositor loops): rays turn (96 s), streamers turn (280 s) while the corona breathes (opacity
 * 1 -> .88, 8 s), plus a rare glint on the diamond. Paused offscreen. Reduced motion / tier C: static totality,
 * no loops.
 *
 * props: size (px number or CSS length: the sun's diameter), intro, scrollTarget (ref), exitAt (where on the
 * target the exit completes: "end" = 0 -> 100 % of its height, or e.g. "30%" when the eclipse sits at the very top
 * of a tall target), variant, active (CTA hovered: corona brightens), underMoon (node), className, style.
 * ref -> { flare(), element }.
 */
const Eclipse = forwardRef(function Eclipse(
  {
    size = 320,
    intro = false,
    scrollTarget,
    exitAt = "end",
    variant = "hero",
    active = false,
    underMoon = null,
    className,
    style,
    ...rest
  },
  ref
) {
  const hero = variant !== "ambient";
  const rest0 = hero ? REST.hero : REST.ambient;
  const { reduced, tier } = useMotionPreference();
  const { firstVisit } = useFirstVisit();
  const still = reduced || tier === "C";

  const rootRef = useRef(null);
  const coronaRef = useRef(null);
  const glareRef = useRef(null);
  const moonRef = useRef(null);
  const flareRef = useRef(null);
  const flareGlowRef = useRef(null);
  const flareStarRef = useRef(null);
  const flare3Ref = useRef(null);
  const beads2Ref = useRef(null);
  const beads3Ref = useRef(null);
  const slowRef = useRef(null);
  const raysRef = useRef(null);
  const glintRef = useRef(null);

  // Animation state lives in a ref: frames write styles directly (no React render per frame).
  const st = useRef({
    s: S_REST,
    p: 0,
    fScale: rest0.scale,
    fGlow: rest0.glow,
    fStar: rest0.star,
    bloom: 1,
    intro: null, // { anims: Animation[], timers: number[] } while the compositor intro plays
    pulse: null, // { t0 }
    beadsOn: false,
    last: {},
  });
  const loopRef = useRef(null);
  const [phase, setPhase] = useState("idle");

  const inView = useInViewport(rootRef, { rootMargin: "160px 0px", once: false, attr: false, initial: true });

  /** The DOM node behind a writeHero() node name. */
  const nodeOf = useCallback((name) => {
    switch (name) {
      case "corona":
        return coronaRef.current;
      case "glare":
        return glareRef.current;
      case "moon":
        return moonRef.current;
      case "flare":
        return flareRef.current;
      case "flareGlow":
        return flareGlowRef.current;
      case "flareStar":
        return flareStarRef.current;
      case "flare3":
        return flare3Ref.current;
      default: {
        const box = name[0] === "b" ? beads2Ref.current : name[0] === "c" ? beads3Ref.current : null;
        return box?.children[Number(name.slice(1))] ?? null;
      }
    }
  }, []);

  const setBeads = useCallback((on) => {
    const S = st.current;
    if (on === S.beadsOn) return;
    S.beadsOn = on;
    if (on) rootRef.current?.setAttribute("data-beads", "");
    else rootRef.current?.removeAttribute("data-beads");
  }, []);

  /* ---- write the current state to the DOM (transform / opacity only) ---- */
  const apply = useCallback(() => {
    const S = st.current;
    const L = S.last;
    const put = (name, prop, value) => {
      const key = `${name}|${prop}`;
      if (L[key] === value) return;
      const el = nodeOf(name);
      if (!el) return;
      L[key] = value;
      el.style[prop] = value;
    };

    if (!hero) {
      // Ambient: only the flare pulse moves.
      let fScale = S.fScale;
      let fGlow = S.fGlow;
      let fStar = S.fStar;
      if (S.pulse) {
        const p = easeOut(clamp01(S.pulse.k));
        const bump = p < 0.5 ? p / 0.5 : (1 - p) / 0.5;
        fScale += (2.2 - fScale) * bump;
        fGlow += (1 - fGlow) * bump;
        fStar += (1 - fStar) * bump;
      }
      put("flare", "transform", `scale(${fScale.toFixed(4)})`);
      put("flareGlow", "opacity", fGlow.toFixed(3));
      put("flareStar", "opacity", fStar.toFixed(3));
      return;
    }

    const any = writeHero(S, put);
    // While the compositor intro plays, its own timers own data-beads.
    if (!S.intro) setBeads(any);
  }, [hero, nodeOf, setBeads]);

  /* ---- the compositor intro ---- */
  const finishIntro = useCallback(() => {
    const S = st.current;
    if (!S.intro) return;
    const { anims, timers } = S.intro;
    S.intro = null;
    timers.forEach((id) => window.clearTimeout(id));
    // Inline styles already hold the rest frame: cancelling drops the intro effect without a jump.
    anims.forEach((a) => a.cancel());
    S.s = S_REST;
    S.fScale = rest0.scale;
    S.fGlow = rest0.glow;
    S.bloom = 1;
    rootRef.current?.removeAttribute("data-intro");
    setPhase("idle");
  }, [rest0]);

  /** Plays the pre-sampled intro on the compositor. The inline styles must already hold the rest frame. */
  const playIntro = useCallback(
    (speed) => {
      const S = st.current;
      const { nodes, beads } = sampleIntro();
      const duration = (INTRO_END / speed) * 1000;
      const anims = [];
      nodes.forEach((frames, name) => {
        const el = nodeOf(name);
        if (el) anims.push(el.animate(frames, { duration, easing: "linear", fill: "none" }));
      });
      if (!anims.length) return false;
      const intro = { anims, timers: [] };
      S.intro = intro;
      setBeads(false);
      // Attribute switches (bead twinkle, idle phase) follow the animation clock, which starts on the first frame.
      anims[0].ready
        .then(() => {
          if (S.intro !== intro) return;
          for (const [on, off] of beads) {
            intro.timers.push(window.setTimeout(() => S.intro === intro && setBeads(true), on * duration));
            intro.timers.push(window.setTimeout(() => S.intro === intro && setBeads(false), off * duration));
          }
        })
        .catch(() => {});
      anims[0].finished
        .then(() => {
          if (S.intro !== intro) return;
          finishIntro();
          apply();
        })
        .catch(() => {});
      return true;
    },
    [apply, finishIntro, nodeOf, setBeads]
  );

  /* ---- the frame loop (only for the flare() pulse) ---- */
  const step = useCallback(() => {
    const S = st.current;
    let busy = false;
    if (S.pulse) {
      S.pulse.k = (performance.now() - S.pulse.t0) / PULSE_MS;
      if (S.pulse.k >= 1) S.pulse = null;
      else busy = true;
    }
    apply();
    return busy;
  }, [apply]);

  const startLoop = useCallback(() => {
    if (loopRef.current) return;
    const loop = () => {
      if (!step()) {
        cancelFrame(loop);
        loopRef.current = null;
      }
    };
    loopRef.current = loop;
    frame.render(loop, true);
  }, [step]);

  useEffect(
    () => () => {
      if (loopRef.current) cancelFrame(loopRef.current);
      loopRef.current = null;
      const S = st.current;
      if (S.intro) {
        S.intro.timers.forEach((id) => window.clearTimeout(id));
        S.intro.anims.forEach((a) => a.cancel());
        S.intro = null;
      }
    },
    []
  );

  /* ---- mount: decide the intro before the first paint ---- */
  useLayoutEffect(() => {
    const el = rootRef.current;
    let eligible = hero && intro && !still && !!el && typeof el.animate === "function";
    if (eligible) {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      eligible = r.bottom > 0 && r.top < vh && window.scrollY < 40;
    }
    // The inline styles always hold the rest frame; the intro plays over them on the compositor.
    apply();
    if (eligible && playIntro(firstVisit ? 1 : 1 / REPEAT_SPEED)) {
      el.setAttribute("data-intro", "");
      setPhase("intro");
    }
    // Mount-only: later changes (reduced motion, scroll) are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- idle loops (compositor animations; none under reduced motion / tier C) ---- */
  const loopsRef = useRef([]);
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  useEffect(() => {
    const slow = slowRef.current;
    const rays = raysRef.current;
    if (still || !slow || !rays || typeof slow.animate !== "function") return undefined;
    const anims = [
      slow.animate(SLOW_FRAMES, { duration: SLOW_TURN_MS, iterations: Infinity }),
      rays.animate(SPIN_FRAMES, { duration: RAYS_REL_MS, iterations: Infinity }),
    ];
    if (!inViewRef.current) anims.forEach((a) => a.pause());
    loopsRef.current = anims;
    return () => {
      anims.forEach((a) => a.cancel());
      loopsRef.current = [];
    };
  }, [still]);
  // Offscreen: pause (the CSS [data-paused] rule only reaches CSS animations).
  useEffect(() => {
    loopsRef.current.forEach((a) => (inView ? a.play() : a.pause()));
  }, [inView]);

  // The diamond's rare glint, once the corona has settled and while on screen.
  useEffect(() => {
    const glint = glintRef.current;
    if (still || phase !== "idle" || !inView || !glint || typeof glint.animate !== "function") return undefined;
    let timer = 0;
    let anim = null;
    const fire = () => {
      anim = glint.animate(GLINT_FRAMES, { duration: GLINT_MS });
      timer = window.setTimeout(fire, GLINT_EVERY);
    };
    timer = window.setTimeout(fire, GLINT_FIRST);
    return () => {
      window.clearTimeout(timer);
      anim?.cancel();
    };
  }, [still, phase, inView]);

  // Motion switched off at runtime: jump to the final frame, no loops.
  useEffect(() => {
    if (!still) return;
    const S = st.current;
    S.pulse = null;
    S.p = 0;
    if (S.intro) finishIntro();
    if (loopRef.current) {
      cancelFrame(loopRef.current);
      loopRef.current = null;
    }
    apply();
  }, [still, apply, finishIntro]);

  const linkScroll = hero && !!scrollTarget && !still;

  /* ---- scroll exit on the compositor: the pre-sampled exit on a ScrollTimeline (no per-frame JS). Created once
     no intro plays (a later animation would win over the intro). Without ScrollTimeline, onProgress below writes
     inline styles per frame instead. ---- */
  const exitRef = useRef(null); // { anims, beads } while the compositor owns the exit
  useEffect(() => {
    const target = scrollTarget?.current;
    const first = coronaRef.current;
    if (!linkScroll || phase !== "idle" || !target || !first || typeof first.animate !== "function" || !hasScrollTimeline()) {
      return undefined;
    }
    const share = exitShare(exitAt);
    const range = () => {
      const top = Math.round(target.getBoundingClientRect().top + window.scrollY);
      return [`${top}px`, `${Math.round(top + share * target.offsetHeight)}px`];
    };
    const { nodes, beads } = sampleExit();
    const anims = [];
    try {
      const timeline = new window.ScrollTimeline({ source: document.documentElement, axis: "block" });
      const [rangeStart, rangeEnd] = range();
      nodes.forEach((frames, name) => {
        const el = nodeOf(name);
        if (el) anims.push(el.animate(frames, { timeline, rangeStart, rangeEnd, fill: "both", easing: "linear" }));
      });
    } catch {
      anims.forEach((a) => a.cancel());
      return undefined;
    }
    exitRef.current = { anims, beads };
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        const [rangeStart, rangeEnd] = range();
        anims.forEach((a) => {
          a.rangeStart = rangeStart;
          a.rangeEnd = rangeEnd;
        });
      });
      ro.observe(target);
    }
    return () => {
      ro?.disconnect();
      anims.forEach((a) => a.cancel());
      exitRef.current = null;
      apply(); // hand the current progress back to the inline styles
    };
  }, [linkScroll, phase, scrollTarget, exitAt, nodeOf, apply]);

  const onProgress = useCallback(
    (v) => {
      const S = st.current;
      const p = clamp01(Number(v) || 0);
      if (p === S.p) return;
      S.p = p;
      // Scrolling during the intro: settle it at once, the scroll then owns the moon.
      if (S.intro && p > 0.02) finishIntro();
      const exit = exitRef.current;
      if (exit) {
        // The compositor moves everything; only the bead twinkle switch is left to the main thread.
        setBeads(exit.beads.some(([on, off]) => p >= on && p < off));
        return;
      }
      if (!loopRef.current) frame.render(apply);
    },
    [apply, finishIntro, setBeads]
  );

  useImperativeHandle(
    ref,
    () => ({
      element: rootRef.current,
      /** The diamond-ring pulse (scale -> 2.2 -> rest, 900 ms). Nothing under reduced motion. */
      flare() {
        if (reduced) return;
        st.current.pulse = { t0: performance.now(), k: 0 };
        startLoop();
      },
    }),
    [reduced, startLoop]
  );

  const sizeValue = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn("ecl", hero ? "ecl--hero" : "ecl--ambient", className)}
      style={{ "--ecl-d": sizeValue, ...style }}
      data-still={still ? "" : undefined}
      data-paused={inView ? undefined : ""}
      data-phase={phase}
      data-cta-active={active ? "true" : undefined}
      {...rest}
    >
      {linkScroll ? <ScrollLink target={scrollTarget} exitAt={exitAt} onProgress={onProgress} /> : null}

      {/* Corona: JS owns opacity/scale (bloom, exit) > CSS boost (CTA) > the slow layer (turn + breathing) holding
          the K-corona, the rays (their own relative turn) and the streamers, in that paint order. */}
      <div ref={coronaRef} className="ecl-l ecl-corona" data-glow>
        <div className="ecl-fill ecl-boost">
          {/* The turning elements are plain wrappers: an animated element's style is recomputed on every frame the
              main thread runs, so the gradient-heavy layers never animate themselves. */}
          <div ref={slowRef} className="ecl-fill ecl-slow">
            <div className="ecl-fill ecl-k" />
            <div ref={raysRef} className="ecl-fill ecl-spin">
              <div className="ecl-fill ecl-rays" />
            </div>
            <div className="ecl-fill ecl-streamers">
              {hero ? <Streamers /> : <Streamers half={115} reach={AMBIENT_REACH} />}
            </div>
          </div>
        </div>
      </div>

      {hero ? (
        <>
          <div ref={glareRef} className="ecl-l ecl-glare" data-glow />
          <div className="ecl-l ecl-sun" />
        </>
      ) : null}

      {underMoon}

      <div ref={moonRef} className="ecl-l ecl-moon" style={hero ? MOON_STYLE : undefined} />

      {hero ? (
        <>
          <div ref={beads2Ref} className="ecl-l ecl-beads">
            {BEADS_C2.map((b, i) => (
              <span key={i} className="ecl-bead" style={{ left: b.left, top: b.top }}>
                <span className="ecl-bead-i" style={{ "--s": b.size, "--tw": `${b.tw}ms` }} />
              </span>
            ))}
          </div>
          <div ref={beads3Ref} className="ecl-l ecl-beads">
            {BEADS_C3.map((b, i) => (
              <span key={i} className="ecl-bead" style={{ left: b.left, top: b.top }}>
                <span className="ecl-bead-i" style={{ "--s": b.size, "--tw": `${b.tw}ms` }} />
              </span>
            ))}
          </div>
          <span className="ecl-flare" style={C3_POINT}>
            <span ref={flare3Ref} className="ecl-flare-m" style={{ opacity: 0 }}>
              <span className="ecl-flare-bloom" data-glow />
              <span className="ecl-flare-spike" />
              <span className="ecl-flare-core" />
            </span>
          </span>
        </>
      ) : null}

      <span className="ecl-flare" style={hero ? C2_POINT : AMBIENT_POINT}>
        <span ref={flareRef} className="ecl-flare-m">
          <span ref={flareGlowRef} className="ecl-flare-bloom" data-glow />
          <span className="ecl-flare-spike" />
          <span className="ecl-flare-spike ecl-flare-spike--v" />
          {/* JS owns the star's opacity (flare pulse); CSS owns the inner rare glint (transform). */}
          <span ref={flareStarRef} className="ecl-flare-star" style={{ "--star": hero ? 0.15 : 0.06, opacity: rest0.star }}>
            <span ref={glintRef} className="ecl-flare-glint">
              <StarGlyph size={24} />
            </span>
          </span>
          <span className="ecl-flare-core" />
        </span>
      </span>
    </div>
  );
});

export default Eclipse;
