import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { STEPS, TRANSFER_PATH, WAYPOINTS } from "@/constants/process";

const VB_W = 1200;
const VB_H = 420;
const RING_R = 16;
const START_ORBIT = { cx: 80, cy: 360, rx: 40, ry: 14 };
const TARGET_ORBIT = { cx: 1120, cy: 80, rx: 70, ry: 22 };

/* ---------- Arc-length sampling of TRANSFER_PATH (absolute M / L / C / S only) ----------
   Gives the same points as path.getPointAtLength(w * totalLength), but at module load and without the DOM,
   so the waypoints are placed in the very first render (final state first, no measuring pass, works while
   the diagram is display:none below 1024 px). */
function toCubics(d) {
  const tok = d.match(/[MLCS]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const segs = [];
  let i = 0;
  let cmd = "";
  let cur = [0, 0];
  let lastCtrl = null;
  const n = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/^[MLCS]$/.test(tok[i])) cmd = tok[i++];
    if (cmd === "M") {
      cur = [n(), n()];
      lastCtrl = null;
      cmd = "L"; // implicit lineto after moveto
    } else if (cmd === "L") {
      const p = [n(), n()];
      segs.push([cur, cur, p, p]);
      cur = p;
      lastCtrl = null;
    } else if (cmd === "C") {
      const c1 = [n(), n()];
      const c2 = [n(), n()];
      const p = [n(), n()];
      segs.push([cur, c1, c2, p]);
      lastCtrl = c2;
      cur = p;
    } else if (cmd === "S") {
      const c1 = lastCtrl ? [2 * cur[0] - lastCtrl[0], 2 * cur[1] - lastCtrl[1]] : cur;
      const c2 = [n(), n()];
      const p = [n(), n()];
      segs.push([cur, c1, c2, p]);
      lastCtrl = c2;
      cur = p;
    } else {
      break;
    }
  }
  return segs;
}

function pointsAtFractions(d, fractions, steps = 96) {
  const pts = [];
  toCubics(d).forEach((s, si) => {
    for (let k = si === 0 ? 0 : 1; k <= steps; k += 1) {
      const t = k / steps;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const e = t * t * t;
      pts.push([a * s[0][0] + b * s[1][0] + c * s[2][0] + e * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + e * s[3][1]]);
    }
  });
  const lens = [0];
  for (let k = 1; k < pts.length; k += 1) lens.push(lens[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const total = lens[lens.length - 1];
  return fractions.map((f) => {
    const target = Math.min(Math.max(f, 0), 1) * total;
    let k = 1;
    while (k < lens.length - 1 && lens[k] < target) k += 1;
    const span = lens[k] - lens[k - 1] || 1;
    const r = (target - lens[k - 1]) / span;
    return { x: pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * r, y: pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * r };
  });
}

const POINTS = pointsAtFractions(TRANSFER_PATH, WAYPOINTS);
const pctX = (x) => `${((x / VB_W) * 100).toFixed(4)}%`;
const pctY = (y) => `${((y / VB_H) * 100).toFixed(4)}%`;

/**
 * 6.8 Desktop (>= 1024) Hohmann-style transfer diagram, aria-hidden (the steps are real text below it).
 * Default markup is the final state: progress path fully drawn, every waypoint active, comet parked at the end.
 * Process.jsx drives the scrub (GSAP DrawSVG on the two progress strokes, MotionPath on the comet) through `refs`.
 * Paint order: base path, gold progress (+ soft glow stroke), comet, then the opaque waypoint discs, so the comet
 * slips behind each waypoint and its halo rings the disc it is parked under.
 * Labels are HTML over the SVG so mono text stays at its real px size at every width.
 */
const TransferDiagram = forwardRef(function TransferDiagram({ active, refs, className }, ref) {
  return (
    <div ref={ref} aria-hidden="true" className={cn("relative aspect-[1200/420] w-full select-none", className)}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 size-full overflow-visible" fill="none" focusable="false">
        <defs>
          <radialGradient id="process-comet-glow">
            <stop offset="0" style={{ stopColor: "var(--gold-hot)", stopOpacity: 0.9 }} />
            <stop offset="0.35" style={{ stopColor: "var(--gold)", stopOpacity: 0.4 }} />
            <stop offset="1" style={{ stopColor: "var(--gold)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Start and target orbits */}
        <ellipse {...START_ORBIT} className="stroke-orbit" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <ellipse {...TARGET_ORBIT} className="stroke-orbit" strokeWidth={1} vectorEffect="non-scaling-stroke" />

        {/* Transfer trajectory: base, glow, progress */}
        <path ref={refs?.basePath} d={TRANSFER_PATH} className="stroke-line-strong" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path
          ref={refs?.glowPath}
          d={TRANSFER_PATH}
          data-glow=""
          className="stroke-gold"
          strokeOpacity={0.16}
          strokeWidth={6}
          vectorEffect="non-scaling-stroke"
        />
        <path ref={refs?.progressPath} d={TRANSFER_PATH} className="stroke-gold" strokeWidth={2} vectorEffect="non-scaling-stroke" />

        {/* Comet: parked at the end of the path until GSAP takes over */}
        <g ref={refs?.comet}>
          <circle cx={TARGET_ORBIT.cx} cy={TARGET_ORBIT.cy} r={20} fill="url(#process-comet-glow)" data-glow="" />
          <circle cx={TARGET_ORBIT.cx} cy={TARGET_ORBIT.cy} r={3} className="fill-gold-hot" />
        </g>

        {/* Waypoint discs (opaque, above the comet) */}
        {POINTS.map((p, i) => (
          <circle
            key={STEPS[i].n}
            cx={p.x}
            cy={p.y}
            r={RING_R}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className={cn("fill-space-900 transition-colors duration-panel ease-ui", i <= active ? "stroke-ion" : "stroke-line-strong")}
          />
        ))}
      </svg>

      {POINTS.map((p, i) => {
        const reached = i <= active;
        return (
          <div key={STEPS[i].n}>
            {/* Step number, centred in its disc */}
            <span
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 font-mono text-hud-xs tabular tracking-[.04em] transition-colors duration-panel ease-ui",
                reached ? "text-ion" : "text-ink-3"
              )}
              style={{ left: pctX(p.x), top: pctY(p.y) }}
            >
              {STEPS[i].n}
            </span>
            {/* Phase label above the disc, right-aligned to its right edge: the upper-left quadrant is always
                clear of the trajectory, which leaves every disc towards the upper right. */}
            <span
              className={cn(
                "absolute -translate-x-full -translate-y-full whitespace-nowrap font-mono text-hud-xs uppercase transition-colors duration-panel ease-ui",
                reached ? "text-ion" : "text-ink-3"
              )}
              style={{ left: pctX(p.x + RING_R), top: pctY(p.y - RING_R - 12) }}
            >
              {STEPS[i].phase}
            </span>
          </div>
        );
      })}
    </div>
  );
});

export default TransferDiagram;
