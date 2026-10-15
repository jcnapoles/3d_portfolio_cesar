/**
 * FIG 03.3 — LEGACY TO CLOUD (viewBox 560 x 400).
 * A 120 x 120 MONOLITH block on the left whose dashed lines resolve into an AWS / AZURE ring on the
 * right, with the delivery pipeline (JENKINS · GITLAB CI) beneath.
 * The satellite runs on the AWS / AZURE (target) ring. `fig` carries the shared primitives from MissionCard.
 */
const RING = { cx: 395, cy: 165, rx: 115, ry: 48 };
const PIPE_Y = 300;
const PIPE_NODES = [
  { x: 200, name: "Jenkins" },
  { x: 360, name: "GitLab CI" },
];

export default function IsernDiagram({ svgRef, fig }) {
  const { Stroke, Node, Label, Satellite, ellipse, onEllipse } = fig;
  const ring = ellipse(RING.cx, RING.cy, RING.rx, RING.ry);
  const top = onEllipse(RING.cx, RING.cy, RING.rx, RING.ry, 195);
  const mid = onEllipse(RING.cx, RING.cy, RING.rx, RING.ry, 180);
  const bottom = onEllipse(RING.cx, RING.cy, RING.rx, RING.ry, 165);
  const block = "M 60 105 H 180 V 225 H 60 Z";
  const layers = "M 60 135 H 180 M 60 165 H 180 M 60 195 H 180";
  const nodeDelay = (i) => 0.85 + i * 0.08;

  return (
    <>
      <svg ref={svgRef} viewBox="0 0 560 400" className="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false" fill="none">
        <Stroke d={block} delay={0} linecap="square" />
        <Stroke d={layers} delay={0.2} tone="dim" linecap="butt" />
        <Stroke d={ring} delay={0.15} />
        <Stroke d={`M 180 132 C 230 132, 236 ${top.y}, ${top.x} ${top.y}`} delay={0.45} dash="3 4" />
        <Stroke d={`M 180 165 H ${mid.x}`} delay={0.5} tone="gold" width={1.5} dash="3 5" opacity={0.9} />
        <Stroke d={`M 180 198 C 230 198, 236 ${bottom.y}, ${bottom.x} ${bottom.y}`} delay={0.55} dash="3 4" />
        <Stroke d={`M 90 ${PIPE_Y} H 470`} delay={0.6} tone="line" />
        <Stroke d={`M 90 ${PIPE_Y - 6} V ${PIPE_Y + 6} M 470 ${PIPE_Y - 6} V ${PIPE_Y + 6}`} delay={0.7} linecap="butt" />
        <Stroke d={`M ${RING.cx} ${RING.cy + RING.ry + 6} V ${PIPE_Y - 10}`} delay={0.75} dash="2 4" linecap="butt" opacity={0.7} />
        <Node x={mid.x} y={mid.y} delay={0.95} tone="gold" r={2.6} ring={6} />
        {PIPE_NODES.map((n, i) => (
          <Node key={n.name} x={n.x} y={PIPE_Y} delay={nodeDelay(i)} />
        ))}
      </svg>
      <Satellite orbit={RING} parkDeg={300} />

      <Label x={120} y={239} place="below" delay={0.3}>
        Monolith
      </Label>
      <Label x={RING.cx} y={RING.cy} tone="ion" delay={0.4}>
        AWS / Azure
      </Label>
      {PIPE_NODES.map((n, i) => (
        <Label key={n.name} x={n.x} y={PIPE_Y + 16} place="below" delay={nodeDelay(i)}>
          {n.name}
        </Label>
      ))}
    </>
  );
}
