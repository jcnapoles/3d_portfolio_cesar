import Container from "@/components/ui/Container";
import Picture from "@/components/ui/Picture";
import Reveal from "@/components/ui/Reveal";
import RevealItem from "@/components/ui/RevealItem";
import { cn } from "@/lib/cn";
import { EASE, staggerParent } from "@/lib/motion";
import { companyLogos } from "@/assets/media";
import { HERO_COPY, TRUST_LOGOS } from "@/constants/hero";

// Logos settle from .2 to .55 effective opacity: the <li> (Motion) goes .36 -> 1 over the logo's own .55 (CSS),
// so Motion and the CSS hover never drive the same node.
const LIST = staggerParent({ stagger: 0.06 });
const ITEM = {
  hidden: { opacity: 0.2 / 0.55 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE.out } },
};

/**
 * "Where I've built and led technology": eight monochrome logos sitting on the planet horizon at the bottom of the hero.
 * Desktop: one static row. Mobile: a 4 x 2 grid. No marquee. Never UCI or RIU.
 */
export default function TrustStrip({ className }) {
  return (
    <div data-no-warp className={cn("hero-strip relative pb-10 pt-12 lg:pt-11", className)}>
      {/* The planet horizon: dark disc + a separate rim-glow layer (hidden in contrast modes through data-glow). */}
      <span aria-hidden="true" className="hero-horizon-wrap pointer-events-none absolute inset-x-0 top-0 h-full">
        <span className="hero-horizon absolute left-1/2 top-[-48px] aspect-square w-[220vw] -translate-x-1/2 rounded-full bg-g-horizon md:w-[160vw]" />
        <span
          data-glow
          className="hero-horizon absolute left-1/2 top-[-48px] aspect-square w-[220vw] -translate-x-1/2 rounded-full shadow-glow-rim md:w-[160vw]"
        />
      </span>

      <Container className="relative">
        <p className="hud-label text-center lg:text-left">{HERO_COPY.stripLabel}</p>
        <Reveal
          as="ul"
          variants={LIST}
          aria-label={HERO_COPY.stripAria}
          className="mt-6 grid grid-cols-4 items-center gap-x-2 gap-y-6 sm:gap-x-4 lg:flex lg:justify-between lg:gap-x-6"
        >
          {TRUST_LOGOS.map((logo) => {
            const media = companyLogos[logo.key];
            const image = logo.override ? { ...media, ...logo.override } : media;
            return (
              <RevealItem
                key={logo.key}
                as="li"
                variants={ITEM}
                className="flex h-8 min-w-0 items-center justify-center lg:justify-start"
              >
                {logo.wordmark ? (
                  <span className="whitespace-nowrap text-[15px] font-semibold leading-none text-ink-1/55 transition-colors duration-ui ease-ui hover:text-ink-1 xs:text-[17px] xs:stretch-110 lg:text-[18px]">
                    {logo.wordmark}
                  </span>
                ) : (
                  <Picture
                    image={image}
                    alt={media.alt}
                    className="flex h-full min-w-0 max-w-full items-center justify-center"
                    imgClassName="hero-logo h-[22px] w-auto max-w-full object-contain opacity-55 transition-opacity duration-ui ease-ui hover:opacity-100 lg:h-6"
                    style={{ "--s": logo.scale ?? 1 }}
                  />
                )}
              </RevealItem>
            );
          })}
        </Reveal>
      </Container>
    </div>
  );
}
