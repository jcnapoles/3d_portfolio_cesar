import { Mail } from "lucide-react";
import BrowserFrame from "@/components/ui/BrowserFrame";
import Picture from "@/components/ui/Picture";
import useBrandIcons from "@/hooks/useBrandIcons";
import { projectShots } from "@/assets/media";

/**
 * FIG 03.4 — LIVE PRODUCT (viewBox 560 x 400).
 * The live product in a browser frame, four channel nodes around it (WhatsApp, Instagram, Messenger,
 * email) sitting on a faint orbit, each joined by a 1 px line to an AI ASSISTANT label.
 * The satellite runs on that channel orbit and passes behind the frame. `fig` carries the shared
 * primitives from MissionCard.
 */
const ORBIT = { cx: 280, cy: 180, rx: 250, ry: 129 }; // passes through all four channel nodes
const CHIP = { x: 280, y: 338 };
// `brand` names resolve against the lazily loaded brand icon map (useBrandIcons); the email node is lucide.
const CHANNELS = [
  { key: "whatsapp", x: 70, y: 110, brand: "SiWhatsapp", line: "M 70 110 C 70 262, 160 338, 280 338" },
  { key: "instagram", x: 70, y: 250, brand: "SiInstagram", line: "M 70 250 C 70 314, 170 338, 280 338" },
  { key: "messenger", x: 490, y: 110, brand: "SiMessenger", line: "M 490 110 C 490 262, 400 338, 280 338" },
  { key: "email", x: 490, y: 250, Icon: Mail, line: "M 490 250 C 490 314, 390 338, 280 338" },
];

export default function ClosevibeDiagram({ svgRef, fig }) {
  const { Stroke, Pop, Fade, Satellite, ellipse } = fig;
  const icons = useBrandIcons(svgRef);
  const orbit = ellipse(ORBIT.cx, ORBIT.cy, ORBIT.rx, ORBIT.ry);
  const nodeDelay = (i) => 0.55 + i * 0.08;

  return (
    <>
      <svg ref={svgRef} viewBox="0 0 560 400" className="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false" fill="none">
        <Stroke d={orbit} delay={0} tone="dim" />
        {CHANNELS.map((c, i) => (
          <Stroke key={c.key} d={c.line} delay={0.3 + i * 0.08} />
        ))}
      </svg>
      {/* HTML, after the SVG and before the browser frame: it still passes behind the frame. */}
      <Satellite orbit={ORBIT} parkDeg={300} dur={20} />

      {/* The product: x 150..410 of the viewBox, centred on the orbit. */}
      <div className="absolute left-[26.79%] top-[45%] w-[46.43%] -translate-y-1/2">
        <Fade delay={0.1}>
          {/* Phones: the frame is ~120 px wide, so the bar drops its dots and tightens so the URL pill reads in full
              instead of truncating to "clo…". */}
          <BrowserFrame
            url="closevibe.com"
            className="max-sm:[&>div>span:first-child]:hidden max-sm:[&>div>span:last-child]:px-2 max-sm:[&>div>span:last-child]:text-[10px] max-sm:[&>div]:px-2"
          >
            <Picture
              image={projectShots.closevibe}
              alt=""
              sizes="(min-width: 1024px) 260px, 45vw"
              imgClassName="block aspect-[16/10] h-auto w-full object-cover object-top"
            />
          </BrowserFrame>
        </Fade>
      </div>

      {CHANNELS.map(({ key, x, y, Icon: LocalIcon, brand }, i) => {
        const Icon = LocalIcon || (icons ? icons[brand] : null);
        return (
          <Pop
            key={key}
            x={x}
            y={y}
            delay={nodeDelay(i)}
            className="grid size-[26px] place-items-center rounded-full border border-line-strong bg-space-800 text-ion sm:size-9"
          >
            {Icon ? <Icon aria-hidden="true" focusable="false" className="size-3 sm:size-4" /> : null}
          </Pop>
        );
      })}

      <Pop
        x={CHIP.x}
        y={CHIP.y}
        delay={0.9}
        className="whitespace-nowrap rounded-pill border border-ion/30 bg-space-800 px-2 py-1 font-mono text-[9px] font-medium uppercase leading-none tracking-[0.1em] text-ion sm:px-2.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em]"
      >
        AI assistant
      </Pop>
    </>
  );
}
