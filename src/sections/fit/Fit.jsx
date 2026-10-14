import { useMemo } from "react";
import { Compass, Gauge, GitBranch, UsersRound } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import SpotlightCard from "@/components/ui/SpotlightCard";
import CalendlyButton from "@/components/ui/CalendlyButton";
import Reveal from "@/components/ui/Reveal";
import useMediaQuery from "@/hooks/useMediaQuery";
import { fadeUp, fadeUpScale, STAGGER } from "@/lib/motion";
import { FIT_CARDS } from "@/constants/fit";

// FIT_CARDS[].icon -> lucide-react 1.57.0 export (all four exist in that version).
const ICONS = { Gauge, Compass, GitBranch, UsersRound };

/**
 * 6.4 Briefing (#fit, chapter 01).
 * Desktop (>= 1024): 5/7 split. Left column (sticky, top 120 px): heading, closing line, CTA. Right: 2x2 cards.
 * The 5-column heading keeps the standard H2 size and sets in 4 lines from 1024 to 1920 px (a 4-column one
 * needed 6, and the line-mask reveal of the last lines ran long); the cards drop to p-8 to keep their measure.
 * Below 1024 it stacks: heading, cards, then the closing line + CTA (the left column uses `display: contents`
 * so its two blocks can sit either side of the cards without duplicating any markup).
 */
export default function Fit() {
  const twoCol = useMediaQuery("(min-width: 768px)");
  const isMobile = !twoCol;

  // One Motion reveal per card (each enters on its own on a 1-column phone stack); on 2 columns the
  // per-index delay gives the 80 ms stagger (4 cards: 0 / 80 / 160 / 240 ms, inside the 480 ms cap).
  const cardVariants = useMemo(
    () => FIT_CARDS.map((_, i) => fadeUpScale({ delay: twoCol ? i * STAGGER.cards : 0 })),
    [twoCol]
  );
  const closingVariants = useMemo(() => fadeUp({ y: isMobile ? 16 : 24, delay: isMobile ? 0 : 0.12 }), [isMobile]);

  return (
    <Section id="fit" chapter="01" labelledBy="fit-title">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6">
        <div className="contents lg:sticky lg:top-[120px] lg:col-span-5 lg:block lg:self-start">
          <SectionHeading
            index="01"
            name="BRIEFING"
            eyebrow="Is this you?"
            title="Built for founders who can't afford the wrong tech bet"
            id="fit-title"
            className="order-1 lg:order-none lg:mb-10"
          />
          <Reveal variants={closingVariants} className="order-3 mt-12 sm:mt-14 lg:order-none lg:mt-0">
            <p className="max-w-[26ch] text-lead text-ink-1">Sound familiar? Let&apos;s talk it through.</p>
            <CalendlyButton placement="fit" label="Book a call" size="md" cursorLock className="mt-6" />
          </Reveal>
        </div>

        <ul role="list" className="order-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:order-none lg:col-span-7">
          {FIT_CARDS.map((card, i) => {
            const Icon = ICONS[card.icon] ?? Gauge;
            return (
              <Reveal as="li" key={card.code} variants={cardVariants[i]} className="flex">
                {/* Header pinned to the top, title + body to the bottom: cards in a row share one height
                    (the grid stretches them), so the copy settles on a common baseline instead of floating. */}
                <SpotlightCard className="flex w-full flex-col sm:p-8">
                  <div className="flex items-center justify-between gap-4" aria-hidden="true">
                    <span className="hud-label">{card.code}</span>
                    <Icon size={20} strokeWidth={1.5} className="shrink-0 text-ink-3" />
                  </div>
                  <div className="mt-auto">
                    <h3 className="mt-6 text-h4 text-ink-1">{card.title}</h3>
                    <p className="mt-3 text-body text-ink-2">{card.body}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
