import { cn } from "@/lib/cn";
import HudIndex from "@/components/ui/HudIndex";
import ScrambleText from "@/components/ui/ScrambleText";
import Reveal from "@/components/ui/Reveal";

/**
 * Section header: HUD index row (aria-hidden) -> eyebrow (scramble) -> H2 (GSAP line mask via
 * data-reveal="lines") -> optional lead (Motion fade-up).
 * Rhythm: index->eyebrow 12 px, eyebrow->H2 16 px, H2->lead 24 px, heading->content 40 px mobile / 56 px desktop
 * (bottom margin; override with className, e.g. "mb-0").
 * With srOnly, only an sr-only <h2> is rendered.
 */
export default function SectionHeading({ index, name, eyebrow, title, lead, id, align = "left", hudRight, srOnly = false, className }) {
  if (srOnly) {
    return (
      <h2 id={id} className="sr-only">
        {title}
      </h2>
    );
  }
  const center = align === "center";
  return (
    <div className={cn("mb-10 lg:mb-14", center && "mx-auto flex flex-col items-center text-center", className)}>
      {index || name ? <HudIndex index={index} name={name} right={hudRight} /> : null}
      {eyebrow ? <ScrambleText as="p" className="hud-label mt-3" text={eyebrow} trigger="inview" /> : null}
      <h2 id={id} data-reveal="lines" className={cn("mt-4 text-h2 stretch-110 text-ink-1", center && "mx-auto")}>
        {title}
      </h2>
      {lead ? (
        <Reveal as="p" className={cn("mt-6 max-w-measure text-lead text-ink-2", center && "mx-auto")}>
          {lead}
        </Reveal>
      ) : null}
    </div>
  );
}
