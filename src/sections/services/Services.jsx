import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import CalendlyButton from "@/components/ui/CalendlyButton";
import useMediaQuery from "@/hooks/useMediaQuery";
import { SERVICES, SERVICES_HEADING, SERVICES_UNSURE } from "@/constants/services";
import ServiceTile from "./ServiceTile";
import CommandNode from "./visuals/CommandNode";
import OrbitStack from "./visuals/OrbitStack";
import Pipeline from "./visuals/Pipeline";
import LaunchTrajectory from "./visuals/LaunchTrajectory";
import "./services.css";

/* Bento (spec 6.5, tightened in iteration 2)
   - Tablet and desktop (>= 768): A full width (text left, CommandNode right), B | C side by side, D full width
     (text left, trajectory right). 4 columns / gap-4 on tablet, 12 columns / gap-6 from 1024.
     A used to span rows 1-2 next to B and C on desktop: its stage then stretched to the height of B + C (~790 px of
     mostly empty diagram above the title). Full width, the diagram is capped at 320 px, centred beside the copy,
     and the title sits ~90 px from the tile's top.
   - Mobile: one column, A to D. */
const TILES = {
  fcto: {
    Visual: CommandNode,
    layout: "feature",
    mode: "loop",
    className: "md:col-span-4 lg:col-span-12",
    // 4:3 visual: 400 px wide = 300 px tall on desktop, inside the 320 px stage.
    visualClassName: "max-w-[560px] lg:max-w-[400px]",
  },
  arch: {
    Visual: OrbitStack,
    layout: "stack",
    className: "md:col-span-2 lg:col-span-6",
    visualClassName: "flex justify-center",
  },
  lead: {
    Visual: Pipeline,
    layout: "stack",
    // The pipeline is a thin row: a shorter stage on mobile (stacked). Side by side with B (tablet, desktop) it
    // keeps B's 232 px so the two titles line up.
    stageClassName: "h-[168px] md:h-[232px]",
    className: "md:col-span-2 lg:col-span-6",
    visualClassName: "max-w-[400px]",
  },
  build: {
    Visual: LaunchTrajectory,
    layout: "wide",
    className: "md:col-span-4 lg:col-span-12",
    visualClassName: "max-w-[520px]",
  },
};

// Tiles that share a row enter together, 100 ms apart (fadeUpScale). Tiles alone in their row start at once.
const DELAYS = {
  md: { fcto: 0, arch: 0, lead: 0.1, build: 0 },
  sm: { fcto: 0, arch: 0, lead: 0, build: 0 },
};

export default function Services() {
  const isMd = useMediaQuery("(min-width: 768px)");
  const delays = isMd ? DELAYS.md : DELAYS.sm;

  return (
    <Section id="services" chapter="02" labelledBy={SERVICES_HEADING.id}>
      <SectionHeading {...SERVICES_HEADING} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-12 lg:gap-6">
        {SERVICES.map((service, i) => {
          const tile = TILES[service.key];
          return (
            <ServiceTile
              key={service.key}
              service={service}
              index={i}
              Visual={tile.Visual}
              layout={tile.layout}
              mode={tile.mode ?? "burst"}
              revealDelay={delays[service.key] ?? 0}
              className={tile.className}
              stageClassName={tile.stageClassName}
              visualClassName={tile.visualClassName}
            />
          );
        })}
      </div>

      <Reveal className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-1 lg:mt-14">
        <p className="text-body text-ink-2">{SERVICES_UNSURE.text}</p>
        <CalendlyButton variant="text" placement={SERVICES_UNSURE.placement} label={SERVICES_UNSURE.cta} />
      </Reveal>
    </Section>
  );
}
