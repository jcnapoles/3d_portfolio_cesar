/**
 * FIG 03.3 — WHITE-LABEL ARCHITECTURE (viewBox 560 x 400).
 * A SHARED CORE in the centre, a MICRO-FRONTENDS ring around it carrying four nodes, CARRIER A to D
 * (airline names are never shown), each fed by a spoke from the core.
 * The satellite runs on the MICRO-FRONTENDS (target) ring. `fig` carries the shared primitives from MissionCard.
 */
const CX = 280;
const CY = 195;
const RX = 200;
const RY = 84;
const CORE_R = 26;

// Clockwise from top-left: A (220 deg), B (320), C (40), D (140).
const CARRIERS = [
  { name: "Carrier A", deg: 220, place: "above" },
  { name: "Carrier B", deg: 320, place: "above" },
  { name: "Carrier C", deg: 40, place: "below" },
  { name: "Carrier D", deg: 140, place: "below" },
];

/** Straight spoke from the core's edge to just short of a node ring. */
function spoke(p) {
  const dx = p.x - CX;
  const dy = p.y - CY;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const s = CORE_R + 5;
  const e = len - 12;
  return `M ${(CX + ux * s).toFixed(2)} ${(CY + uy * s).toFixed(2)} L ${(CX + ux * e).toFixed(2)} ${(CY + uy * e).toFixed(2)}`;
}

export default function FlyrDiagram({ svgRef, fig }) {
  const { Stroke, Node, Label, Satellite, ellipse, onEllipse } = fig;
  const ring = ellipse(CX, CY, RX, RY);
  const core = ellipse(CX, CY, CORE_R, CORE_R);
  const nodes = CARRIERS.map((c) => ({ ...c, ...onEllipse(CX, CY, RX, RY, c.deg) }));
  const nodeDelay = (i) => 0.7 + i * 0.08;

  return (
    <>
      <svg ref={svgRef} viewBox="0 0 560 400" className="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false" fill="none">
        <Stroke d={ring} delay={0} />
        <Stroke d={core} delay={0.15} />
        {nodes.map((n, i) => (
          <Stroke key={n.name} d={spoke(n)} delay={0.4 + i * 0.06} tone="hud" dash="2 4" linecap="butt" />
        ))}
        <Node x={CX} y={CY} delay={0.3} tone="gold" r={3.6} ring={10} />
        {nodes.map((n, i) => (
          <Node key={n.name} x={n.x} y={n.y} delay={nodeDelay(i)} />
        ))}
      </svg>
      <Satellite orbit={{ cx: CX, cy: CY, rx: RX, ry: RY }} parkDeg={0} />

      <Label x={CX} y={CY - RY - 13} place="above" tone="ion" delay={0.25}>
        Micro-frontends
      </Label>
      <Label x={CX} y={CY + CORE_R + 10} place="below" tone="ion" delay={0.35}>
        Shared core
      </Label>
      {nodes.map((n, i) => (
        <Label key={n.name} x={n.x} y={n.place === "above" ? n.y - 14 : n.y + 14} place={n.place} delay={nodeDelay(i)}>
          {n.name}
        </Label>
      ))}
    </>
  );
}
