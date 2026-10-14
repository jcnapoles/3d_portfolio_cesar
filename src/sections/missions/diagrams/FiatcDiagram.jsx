/**
 * FIG 03.2 — INTRANET MIGRATION (viewBox 560 x 400).
 * A small dashed LEGACY CMS orbit on the left, a dashed gold transfer arc into a larger solid LIFERAY
 * orbit on the right, and a bottom axis with ticks labelled AUDIT · ROADMAP · CI/CD.
 * The satellite runs on the LIFERAY (target) orbit. `fig` carries the shared primitives from MissionCard.
 */
const AXIS_Y = 300;
const MAJOR = [140, 280, 420];
const minorTicks = () => {
  let d = "";
  for (let x = 70; x <= 490; x += 14) {
    if (!MAJOR.includes(x)) d += `M ${x} ${AXIS_Y} V ${AXIS_Y + 4} `;
  }
  return d.trim();
};

export default function FiatcDiagram({ svgRef, fig }) {
  const { Stroke, Node, Label, Satellite, ellipse, onEllipse } = fig;
  const legacy = ellipse(150, 180, 72, 28);
  const liferay = ellipse(380, 180, 130, 52);
  const landing = onEllipse(380, 180, 130, 52, 235);
  const transfer = `M 150 152 C 172 86, 268 80, ${landing.x} ${landing.y}`;
  const majors = MAJOR.map((x) => `M ${x} ${AXIS_Y - 8} V ${AXIS_Y + 8}`).join(" ");
  const tickDelay = (i) => 0.75 + i * 0.08;

  return (
    <>
      <svg ref={svgRef} viewBox="0 0 560 400" className="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false" fill="none">
        <Stroke d={legacy} delay={0} dash="4 5" />
        <Stroke d={liferay} delay={0.1} />
        <Stroke d={transfer} delay={0.38} tone="gold" width={1.5} dash="3 5" opacity={0.9} />
        <Stroke d={`M 70 ${AXIS_Y} H 490`} delay={0.3} tone="line" />
        <Stroke d={minorTicks()} delay={0.45} tone="dim" linecap="butt" />
        <Stroke d={majors} delay={0.55} tone="hud" linecap="butt" />
        <Node x={150} y={180} delay={0.5} r={2.6} ring={6.5} />
        <Node x={landing.x} y={landing.y} delay={0.95} tone="gold" r={2.6} ring={6} />
        {MAJOR.map((x, i) => (
          <Node key={x} x={x} y={AXIS_Y} delay={tickDelay(i)} r={2.6} ring={6} />
        ))}
      </svg>
      <Satellite orbit={{ cx: 380, cy: 180, rx: 130, ry: 52 }} parkDeg={300} />

      <Label x={150} y={222} place="below" delay={0.35}>
        Legacy CMS
      </Label>
      <Label x={380} y={180} tone="ion" delay={0.45}>
        Liferay
      </Label>
      <Label x={MAJOR[0]} y={AXIS_Y + 16} place="below" delay={tickDelay(0)}>
        Audit
      </Label>
      <Label x={MAJOR[1]} y={AXIS_Y + 16} place="below" delay={tickDelay(1)}>
        Roadmap
      </Label>
      <Label x={MAJOR[2]} y={AXIS_Y + 16} place="below" delay={tickDelay(2)}>
        CI/CD
      </Label>
    </>
  );
}
