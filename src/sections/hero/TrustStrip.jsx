import Container from "@/components/ui/Container";
import Picture from "@/components/ui/Picture";
import { cn } from "@/lib/cn";
import { companyLogos } from "@/assets/media";
import { HERO_COPY, TRUST_LOGOS } from "@/constants/hero";

// The logos fade in with the hero's first-paint choreography (CSS opacity only, compositor-driven), 40 ms apart,
// whether or not the strip is in view: it sits under the fold edge on most screens, and an in-view trigger left
// it dim until the visitor scrolled. Reduced motion: no animation (final state).
const STRIP_DELAY_MS = 600;
const STRIP_STEP_MS = 40;

/**
 * "Where I've built and led technology": nine monochrome logos sitting on the planet horizon at the bottom of the hero.
 * A wrapping flex row: 3 x 3 on phones, rows of 5 + 4 (the last 4 centred) from 640. From 1280: one static
 * row. No marquee. Never UCI or RIU.
 * Every logo renders as a white silhouette at .55 (.hero-logo + opacity-55), full white on hover.
 */
export default function TrustStrip({ className }) {
  return (
    <div data-no-warp className={cn("hero-strip relative pb-10 pt-12 lg:pt-11", className)}>
      {/* The planet horizon: dark disc + a separate rim-glow layer (hidden in contrast modes through data-glow).
          The wrap clips to what can show: from 240 px above the strip (the rim glow reaches 180 px above the disc,
          whose top sits 48 px above the strip) down to the strip's bottom, the hero's own bottom clip. Same pixels
          as unclipped, but the wrap's composited layer (desktop scroll-out) drops from the whole 160vw disc
          (2705 x 2705 px at 1440) to a band the width of the hero. */}
      <span
        aria-hidden="true"
        className="hero-horizon-wrap pointer-events-none absolute inset-x-0 bottom-0 top-[-240px] overflow-clip"
      >
        <span className="hero-horizon absolute left-1/2 top-[192px] aspect-square w-[220vw] -translate-x-1/2 rounded-full bg-g-horizon md:w-[160vw]" />
        <span
          data-glow
          className="hero-horizon absolute left-1/2 top-[192px] aspect-square w-[220vw] -translate-x-1/2 rounded-full shadow-glow-rim md:w-[160vw]"
        />
      </span>

      <Container className="relative">
        <p className="hud-label text-center lg:text-left">{HERO_COPY.stripLabel}</p>
        <ul
          aria-label={HERO_COPY.stripAria}
          className="mt-6 flex flex-wrap items-center justify-center gap-y-6 xl:flex-nowrap xl:justify-between"
        >
          {TRUST_LOGOS.map((logo, i) => {
            const media = companyLogos[logo.key];
            const image = logo.override ? { ...media, ...logo.override } : media;
            return (
              <li
                key={logo.key}
                className="flex h-8 min-w-0 basis-1/3 items-center justify-center px-1 motion-ok:animate-[fade-in_500ms_cubic-bezier(0.16,1,0.3,1)_both] sm:basis-1/5 sm:px-2 xl:basis-auto xl:justify-start xl:px-0"
                style={{ animationDelay: `${STRIP_DELAY_MS + i * STRIP_STEP_MS}ms` }}
              >
                <Picture
                  image={image}
                  alt={media.alt}
                  className="flex h-full min-w-0 max-w-full items-center justify-center"
                  imgClassName="hero-logo h-[22px] w-auto max-w-full object-contain opacity-55 transition-opacity duration-ui ease-ui hover:opacity-100 lg:h-6"
                  style={{ "--s": logo.scale ?? 1 }}
                />
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
