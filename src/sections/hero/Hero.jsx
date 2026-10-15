import { useRef } from "react";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import StatusBadge from "@/components/ui/StatusBadge";
import ScrambleText from "@/components/ui/ScrambleText";
import CalendlyButton from "@/components/ui/CalendlyButton";
import Button from "@/components/ui/Button";
import useMediaQuery from "@/hooks/useMediaQuery";
import { AVAILABILITY } from "@/constants/claims";
import { ANCHORS } from "@/constants/site";
import { HERO_COPY } from "@/constants/hero";
import GalaxyStage from "./GalaxyStage";
import HudRow from "./HudRow";
import HeroHeadline from "./HeroHeadline";
import OrbitEclipse from "./OrbitEclipse";
import ProofChips from "./ProofChips";
import TrustStrip from "./TrustStrip";
import useFullStopLaunch from "./useFullStopLaunch";
import "./hero.css";

/**
 * 00 LAUNCH (spec 6.2, iteration 2). Layers, back to front: the hero-only WebGL galaxy, the static nebula glow
 * behind the eclipse, the content, and the trust strip on the planet horizon. The signature visual is an animated
 * total solar eclipse in orbit (totality intro, scroll-linked third contact). The H1 is the LCP on every viewport:
 * no image is preloaded or fetched with high priority here. The hero has no GSAP; its copy choreography is CSS.
 */
export default function Hero() {
  const isMd = useMediaQuery("(min-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const sectionRef = useRef(null);
  const periodRef = useRef(null);
  const frontRingRef = useRef(null);
  const discRef = useRef(null);
  const { launchPending } = useFullStopLaunch({ periodRef, frontRingRef });

  const badge = AVAILABILITY.show ? (
    <StatusBadge
      href="#contact"
      className="hero-in rounded-[1.125rem] md:rounded-pill"
      style={{ "--d": "320ms", "--dm": "180ms" }}
      // Four pings (~10 s), then the dot rests: a forever loop here was restyled on every Galaxy frame.
      pings={4}
    >
      {AVAILABILITY.text}
    </StatusBadge>
  ) : null;
  const eyebrow = (
    <ScrambleText
      as="p"
      className="hud-label hero-scrim"
      text={HERO_COPY.eyebrow}
      trigger="mount"
      delay={120}
      duration={420}
    />
  );

  return (
    <Section
      ref={sectionRef}
      id="top"
      chapter="00"
      tone="bare"
      rails={false}
      container={false}
      labelledBy="hero-title"
      className="flex min-h-[max(720px,min(100svh,980px))] flex-col overflow-clip pt-[120px]"
    >
      <GalaxyStage anchorRef={discRef} />
      <HudRow />

      <Container className="relative grid grid-cols-4 gap-x-4 pb-12 lg:grid-cols-12 lg:gap-x-6 lg:pb-10">
        {/* Content column (cols 1-7). Clicks and text selection here never warp the stars. */}
        <div data-no-warp className="hero-out-content relative z-[2] col-span-4 min-w-0 pt-3 lg:col-span-7 lg:pt-8">
          <div className="hero-toprow relative flex items-center justify-between gap-4 md:items-end">
            <div className="flex min-w-0 flex-col items-start max-md:max-w-[64%]">
              {badge}
              {isMd ? <div className={badge ? "mt-7" : undefined}>{eyebrow}</div> : null}
            </div>
            {isDesktop ? null : isMd ? (
              <OrbitEclipse variant="tablet" discRef={discRef} scrollTarget={sectionRef} className="-mr-2" />
            ) : null}
          </div>
          {isMd ? null : <div className="mt-7 max-w-[64%]">{eyebrow}</div>}

          <HeroHeadline ref={periodRef} className="mt-5" />

          <p className="mt-6 max-w-[56ch] text-lead text-ink-2">{HERO_COPY.lead}</p>

          <div className="mt-10 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-3">
            <CalendlyButton
              id={ANCHORS.heroCta}
              placement="hero"
              label={HERO_COPY.primaryCta}
              size="lg"
              magnetic
              cursorLock
              fullWidth={!isMd}
            />
            {isMd ? (
              <Button variant="ghost" size="lg" href="#results" icon="down">
                {HERO_COPY.secondaryCta}
              </Button>
            ) : (
              <Button variant="text" href="#results" icon="down" className="self-center">
                {HERO_COPY.secondaryCta}
              </Button>
            )}
          </div>
          <p className="mt-4 text-center text-small text-ink-3 md:text-left">{HERO_COPY.microcopy}</p>

          <ProofChips className="mt-8" />
        </div>

        {/* Mobile (< 768): the eclipse sits behind the top of the column (badge row), above the headline. */}
        {isMd ? null : (
          <div aria-hidden="true" className="hero-eclipse-compact pointer-events-none absolute z-[1]">
            <OrbitEclipse variant="compact" discRef={discRef} scrollTarget={sectionRef} />
          </div>
        )}

        {/* Eclipse column (cols 8-12), desktop only. */}
        {isDesktop ? (
          <div className="relative z-[1] col-span-5 flex items-center justify-center">
            <OrbitEclipse
              variant="desktop"
              frontRingRef={frontRingRef}
              discRef={discRef}
              launchPending={launchPending}
              scrollTarget={sectionRef}
            />
          </div>
        ) : null}
      </Container>

      <TrustStrip className="mt-auto" />
    </Section>
  );
}
