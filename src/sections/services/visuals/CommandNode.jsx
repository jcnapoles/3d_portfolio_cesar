import { useEffect, useRef } from "react";
import Chip from "@/components/ui/Chip";
import StarGlyph from "@/components/ui/StarGlyph";
import useMotionPreference from "@/hooks/useMotionPreference";

// Spec 6.5, tile A. viewBox 400 x 300 (4:3). HTML chips sit at the same coordinates as percentages.
const W = 400;
const H = 300;
const CENTER = { x: 200, y: 150 };
const NODES = [
  { label: "Product", x: 60, y: 60 },
  { label: "Team", x: 60, y: 150 },
  { label: "Cloud", x: 60, y: 240 },
  { label: "AI", x: 340, y: 90 },
  { label: "Business", x: 340, y: 210 },
];
// Quadratic from the node to the center, control point at the horizontal midpoint (node height).
const controlFor = ({ x, y }) => ({ x: (x + CENTER.x) / 2, y });
const pathFor = (n) => {
  const c = controlFor(n);
  return `M ${n.x} ${n.y} Q ${c.x} ${c.y} ${CENTER.x} ${CENTER.y}`;
};
// The range rings sit in the 320 px desktop stage (centred on it): an elliptical fade (300 x 160 px radii) ends
// every ring softly before the stage's top and bottom edges instead of letting the clip cut the arcs.
const RING_FADE = "radial-gradient(300px 160px at 50% 50%, #000 55%, transparent 100%)";
const RING_MASK = { WebkitMaskImage: RING_FADE, maskImage: RING_FADE };

/* ---------- Pulses: one gold streak per wire, moved by the compositor (WAAPI transform + opacity) ----------
   Same timing as the old stroke-dashoffset dash: a 2.4 s cycle per wire, staggered 0.48 s; the head runs from the
   node to the CTO node in the first 2.0 s at constant speed, then the wire rests. Animating stroke-dashoffset on
   10 SVG paths restyled and repainted the tile on the main thread every frame. */
const CYCLE_MS = 2400;
const STAGGER_MS = 480;
const TRAVEL = 2.0 / 2.4; // share of the cycle spent travelling
const KEYS = 14; // keyframes along the wire (equal arc length), linear in between
const STREAK = 4.5; // streak length, % of the visual's width (~18 viewBox units, like the old 10 % dash)

/** Keyframes for one wire: equal arc-length samples of the quadratic, rotated to its tangent. */
function pulseFrames(n) {
  const c = controlFor(n);
  const at = (t) => {
    const u = 1 - t;
    return {
      x: u * u * n.x + 2 * u * t * c.x + t * t * CENTER.x,
      y: u * u * n.y + 2 * u * t * c.y + t * t * CENTER.y,
      dx: 2 * u * (c.x - n.x) + 2 * t * (CENTER.x - c.x),
      dy: 2 * u * (c.y - n.y) + 2 * t * (CENTER.y - c.y),
    };
  };
  // Arc-length table.
  const N = 96;
  const pts = Array.from({ length: N + 1 }, (_, i) => at(i / N));
  const len = [0];
  for (let i = 1; i <= N; i += 1) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = len[N];
  const tAtLength = (s) => {
    let i = 1;
    while (i < N && len[i] < s) i += 1;
    const f = (s - len[i - 1]) / Math.max(len[i] - len[i - 1], 1e-6);
    return (i - 1 + f) / N;
  };

  let prevDeg = null;
  const frames = [];
  for (let k = 0; k <= KEYS; k += 1) {
    const p = at(tAtLength((k / KEYS) * total));
    let deg = (Math.atan2(p.dy, p.dx) * 180) / Math.PI;
    if (prevDeg !== null) {
      while (deg - prevDeg > 180) deg -= 360;
      while (deg - prevDeg < -180) deg += 360;
    }
    prevDeg = deg;
    const offset = (k / KEYS) * TRAVEL;
    const opacity = offset < 0.03 ? offset / 0.03 : offset > TRAVEL - 0.07 ? Math.max(0, (TRAVEL - offset) / 0.07) : 1;
    frames.push({
      offset,
      opacity,
      transform: `translate(${((p.x / W) * 100).toFixed(3)}%, ${((p.y / H) * 100).toFixed(3)}%) rotate(${deg.toFixed(2)}deg)`,
    });
  }
  frames.push({ ...frames[frames.length - 1], offset: 1, opacity: 0 });
  return frames;
}
const PULSES = NODES.map(pulseFrames);

function usePulses(refs, enabled, active) {
  const anims = useRef([]);
  useEffect(() => {
    if (!enabled) return undefined;
    const els = refs.current;
    anims.current = PULSES.map((frames, i) => {
      const el = els[i];
      if (!el || typeof el.animate !== "function") return null;
      const a = el.animate(frames, { duration: CYCLE_MS, delay: i * STAGGER_MS, iterations: Infinity, easing: "linear" });
      a.pause();
      return a;
    });
    return () => {
      anims.current.forEach((a) => a?.cancel());
      anims.current = [];
    };
  }, [refs, enabled]);
  useEffect(() => {
    anims.current.forEach((a) => {
      if (!a) return;
      if (active) a.play();
      else a.pause();
    });
  }, [active, enabled]);
}

/**
 * A. CommandNode: five domains wired into the CTO node. A gold pulse flows along each wire (2.4 s, staggered
 * 0.48 s) while `active`. Reduced motion: wires only, no pulses.
 */
export default function CommandNode({ active = false }) {
  const { reduced } = useMotionPreference();
  const pulseRefs = useRef([]);
  usePulses(pulseRefs, !reduced, active && !reduced);

  return (
    <div className="svc-vis svc-cmd relative aspect-[4/3] w-full" data-active={active ? "true" : "false"}>
      {/* Desktop: static range rings around the CTO node fill the 320 px featured stage (clipped by the stage). */}
      <svg
        viewBox="0 0 800 800"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[800px] -translate-x-1/2 -translate-y-1/2 lg:block"
        style={RING_MASK}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="400" cy="400" r="150" stroke="var(--line)" />
        <circle cx="400" cy="400" r="230" stroke="var(--hud-dim)" strokeDasharray="2 6" />
        <circle cx="400" cy="400" r="310" stroke="var(--line)" />
        <circle cx="400" cy="400" r="390" stroke="var(--line)" strokeDasharray="1 5" />
      </svg>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 size-full overflow-visible"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {NODES.map((n) => (
          <path key={n.label} d={pathFor(n)} stroke="var(--hud)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      {/* Pulses (HTML, composited). Each mover is as large as the visual so translate(%) is in viewBox units. */}
      {!reduced
        ? NODES.map((n, i) => (
            <span
              key={`pulse-${n.label}`}
              ref={(el) => {
                pulseRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 origin-top-left opacity-0"
            >
              <i
                className="absolute top-0 h-[5px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(244,184,96,0),rgba(244,184,96,.22))]"
                style={{ left: `-${STREAK}%`, width: `${STREAK}%` }}
              />
              <i
                className="absolute top-0 h-[1.6px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,208,138,0),var(--gold-hot))]"
                style={{ left: `-${STREAK}%`, width: `${STREAK}%` }}
              />
            </span>
          ))
        : null}

      {/* Soft glow behind the CTO node (static). */}
      <span
        data-glow
        className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--gold-tint),transparent)]"
      />

      {NODES.map((n) => (
        <Chip
          key={n.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-line-strong bg-space-700 px-2 text-[11px] text-ink-1 sm:px-2.5 sm:text-[13px]"
          style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%` }}
        >
          {n.label}
        </Chip>
      ))}

      <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-line-strong bg-space-700 shadow-hi-top">
        <StarGlyph size={14} className="text-gold" />
        <span className="font-mono text-[10px] font-medium leading-none tracking-[0.16em] text-ink-1">CTO</span>
      </div>
    </div>
  );
}
