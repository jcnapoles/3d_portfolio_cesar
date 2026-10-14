import Chip from "@/components/ui/Chip";
import StarGlyph from "@/components/ui/StarGlyph";

// Spec 6.5, tile A. viewBox 400 x 300 (4:3). HTML chips sit at the same coordinates as percentages.
const CENTER = { x: 200, y: 150 };
const NODES = [
  { label: "Product", x: 60, y: 60 },
  { label: "Team", x: 60, y: 150 },
  { label: "Cloud", x: 60, y: 240 },
  { label: "AI", x: 340, y: 90 },
  { label: "Business", x: 340, y: 210 },
];
// Quadratic from the node to the center, control point at the horizontal midpoint (node height).
const pathFor = ({ x, y }) => `M ${x} ${y} Q ${(x + CENTER.x) / 2} ${y} ${CENTER.x} ${CENTER.y}`;
// The range rings sit in the 320 px desktop stage (centred on it): an elliptical fade (300 x 160 px radii) ends
// every ring softly before the stage's top and bottom edges instead of letting the clip cut the arcs.
const RING_FADE = "radial-gradient(300px 160px at 50% 50%, #000 55%, transparent 100%)";
const RING_MASK = { WebkitMaskImage: RING_FADE, maskImage: RING_FADE };

/**
 * A. CommandNode: five domains wired into the CTO node. A gold pulse flows along each wire
 * (stroke-dashoffset, 2.4 s, staggered 0.48 s) while `active`. Reduced motion: wires only, no pulses.
 */
export default function CommandNode({ active = false }) {
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
        viewBox="0 0 400 300"
        className="absolute inset-0 size-full overflow-visible"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {NODES.map((n) => (
          <path key={n.label} d={pathFor(n)} stroke="var(--hud)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {NODES.map((n, i) => (
          <g key={`beam-${n.label}`} style={{ "--i": i }} strokeLinecap="round">
            <path d={pathFor(n)} pathLength="100" className="svc-beam" stroke="var(--gold)" strokeWidth="5" strokeOpacity="0.2" />
            <path d={pathFor(n)} pathLength="100" className="svc-beam" stroke="var(--gold-hot)" strokeWidth="1.6" />
          </g>
        ))}
      </svg>

      {/* Soft glow behind the CTO node (static). */}
      <span
        data-glow
        className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--gold-tint),transparent)]"
      />

      {NODES.map((n) => (
        <Chip
          key={n.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-line-strong bg-space-700 px-2 text-[11px] text-ink-1 sm:px-2.5 sm:text-[13px]"
          style={{ left: `${(n.x / 400) * 100}%`, top: `${(n.y / 300) * 100}%` }}
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
