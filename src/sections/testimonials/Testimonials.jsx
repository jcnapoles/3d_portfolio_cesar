import { useMemo } from "react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import CalendlyButton from "@/components/ui/CalendlyButton";
import Reveal from "@/components/ui/Reveal";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { DUR, EASE, fadeUp, STAGGER } from "@/lib/motion";
import { TRANSMISSIONS } from "@/constants/testimonials";
import TransmissionCard from "./TransmissionCard";

const VISIBLE = TRANSMISSIONS.filter((t) => t.show !== false);
const FEATURED = VISIBLE.find((t) => t.featured) ?? VISIBLE[0];
const OTHERS = VISIBLE.filter((t) => t !== FEATURED);

/** Card reveal (rise + .985 -> 1). The card's delay is also handed to its children as `base` (see TransmissionCard). */
const cardVariants = (delay, y) => ({
  hidden: { opacity: 0, y, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.reveal, delay, ease: EASE.out } },
});

/**
 * 6.9 Testimonials (#testimonials, chapter 05 TRANSMISSIONS). No marquee, no carousel.
 * - >= 1024: featured card in columns 1-7 (sticky while the right column scrolls past); columns 8-12 hold
 *   Jorge full width, then Reynier and Lazaro side by side from 1280 px, stacked below that.
 * - < 1024: featured first, then the others stacked.
 * Cards fade up with a 50 ms stagger where they sit side by side; on one column each enters on its own.
 */
export default function Testimonials() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const y = isMobile ? 12 : 20;

  const delays = useMemo(() => VISIBLE.map((_, i) => (isDesktop ? i * STAGGER.cards : 0)), [isDesktop]);
  const variants = useMemo(() => delays.map((d) => cardVariants(d, y)), [delays, y]);
  const ctaVariants = useMemo(() => fadeUp({ y: isMobile ? 12 : 16 }), [isMobile]);

  return (
    <Section id="testimonials" chapter="05" labelledBy="testimonials-title">
      <SectionHeading
        index="05"
        name="TRANSMISSIONS"
        eyebrow="Testimonials"
        title="In their words"
        lead="Leaders and teammates I've worked with. Every name links to LinkedIn."
        id="testimonials-title"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <Reveal variants={variants[0]} className="flex lg:sticky lg:top-28">
            <TransmissionCard transmission={FEATURED} featured base={delays[0]} />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 content-start gap-4 lg:col-span-5 lg:gap-6 xl:grid-cols-2">
          {OTHERS.map((t, i) => (
            <Reveal key={t.rx} variants={variants[i + 1]} className={cn("flex", i === 0 && "xl:col-span-2")}>
              <TransmissionCard transmission={t} compact={i > 0} base={delays[i + 1]} />
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal variants={ctaVariants} className="mt-12 lg:mt-16">
        <CalendlyButton placement="testimonials" label="Book a call" cursorLock />
      </Reveal>
    </Section>
  );
}
