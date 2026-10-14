/**
 * FIG 03.1 — SCALE TRANSFER (viewBox 560 x 400).
 * Core STTOK at (280, 200); inner orbit 80 x 30 (50K); outer orbit 220 x 90 (250K+); a dashed gold
 * Hohmann-style transfer arc, tangent to both orbits; four ion nodes on the outer ring at 30, 120, 210
 * and 300 degrees. The satellite runs on the outer (target) orbit.
 * `fig` carries the shared primitives from MissionCard.
 */
export default function SttokDiagram({ svgRef, fig }) {
  const { Stroke, Node, Label, Satellite, ellipse, onEllipse } = fig;
  const outer = ellipse(280, 200, 220, 90);
  const inner = ellipse(280, 200, 80, 30);
  const transfer = "M 200 200 A 150 50 0 0 1 500 200";
  const nodes = [30, 120, 210, 300].map((deg) => onEllipse(280, 200, 220, 90, deg));
  const nodeDelay = (i) => 0.62 + i * 0.08;

  return (
    <>
      <svg ref={svgRef} viewBox="0 0 560 400" className="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false" fill="none">
        <Stroke d={outer} delay={0} />
        <Stroke d={inner} delay={0.12} tone="hud" />
        <Stroke d={transfer} delay={0.4} tone="gold" width={1.5} dash="3 5" opacity={0.9} />
        <Satellite d={outer} park={onEllipse(280, 200, 220, 90, 340)} />
        {nodes.map((p, i) => (
          <Node key={i} x={p.x} y={p.y} delay={nodeDelay(i)} />
        ))}
        <Node x={500} y={200} delay={0.9} tone="gold" r={2.6} ring={6} />
      </svg>

      <Label x={280} y={200} tone="ion" delay={0.2}>
        Sttok
      </Label>
      <Label x={280} y={240} place="below" tone="ion" delay={0.3}>
        50K
      </Label>
      <Label x={142} y={116} anchor="end" place="above" tone="ion" delay={0.3}>
        250K+
      </Label>
      <Label x={480} y={256} anchor="start" place="below" delay={nodeDelay(0)}>
        CI/CD
      </Label>
      <Label x={170} y={293} place="below" delay={nodeDelay(1)}>
        Cognito
      </Label>
      <Label x={82} y={145} anchor="end" place="above" delay={nodeDelay(2)}>
        VPC
      </Label>
      <Label x={400} y={107} place="above" delay={nodeDelay(3)}>
        Atlas Search
      </Label>
    </>
  );
}
