import { TrendingDown, TrendingUp } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Picture from "@/components/ui/Picture";
import Reveal from "@/components/ui/Reveal";
import Ticks from "@/components/ui/Ticks";
import useMediaQuery from "@/hooks/useMediaQuery";
import { STAGGER } from "@/lib/motion";
import { companyLogos } from "@/assets/media";
import { DELIVERY_CAPTION, DELIVERY_CLIENTS, DELIVERY_COPY, DELIVERY_OUTCOMES, DELIVERY_STEPS } from "@/constants/delivery";
import "./delivery.css";

const TREND_ICONS = { up: TrendingUp, down: TrendingDown };

/**
 * AI-native delivery (#delivery), a second band right under the telemetry numbers, still chapter 00.
 * Heading, the two client logos, the four-step loop (expert -> AI -> automated QA -> expert), then four outcomes
 * as text stats (no figures: owner's call, src/constants/delivery.js).
 * Steps: stacked on phones, 2 x 2 from 768, one row from 1024. Outcomes: stacked, 2 x 2 from 640, one row from 1024.
 * Per-item fade-up through Reveal, staggered only where items share a row.
 */
export default function Delivery() {
  const twoUp = useMediaQuery("(min-width: 640px)");
  const stepDelay = (i) => (twoUp ? (i % 4) * STAGGER.cards : 0);

  return (
    <Section id="delivery" chapter="00" tone="band" className="border-t-0" labelledBy="delivery-title">
      <SectionHeading
        index="00"
        name={DELIVERY_COPY.name}
        hudRight={DELIVERY_COPY.hudRight}
        eyebrow={DELIVERY_COPY.eyebrow}
        title={DELIVERY_COPY.title}
        lead={DELIVERY_COPY.lead}
        id="delivery-title"
        className="mb-10 lg:mb-12"
      />

      <Reveal as="ul" role="list" aria-label="Companies" className="flex flex-wrap items-center gap-x-12 gap-y-5">
        {DELIVERY_CLIENTS.map((client) => {
          const logo = companyLogos[client.logo];
          return (
            <li key={client.key} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Picture image={logo} alt={logo.alt} className="block shrink-0" imgClassName="dlv-logo block h-6 w-auto" />
              <span className="hud-label">{client.meta}</span>
            </li>
          );
        })}
      </Reveal>

      <ol className="dlv-steps mt-12 lg:mt-14">
        {DELIVERY_STEPS.map((step, i) => (
          <Reveal as="li" key={step.n} delay={stepDelay(i)} className="dlv-step" data-kind={step.kind}>
            <div className="flex items-center justify-between gap-4">
              <span aria-hidden="true" className="font-mono text-hud text-ink-3">
                {step.n}
              </span>
              <span className="dlv-badge">{step.badge}</span>
            </div>
            <h3 className="mt-5 text-h4 text-ink-1">{step.title}</h3>
            <p className="mt-2 text-small text-ink-2">{step.body}</p>
          </Reveal>
        ))}
      </ol>

      <ul role="list" className="dlv-outcomes mt-14 lg:mt-16">
        {DELIVERY_OUTCOMES.map((item, i) => {
          const Icon = TREND_ICONS[item.trend];
          return (
            <Reveal as="li" key={item.key} delay={stepDelay(i)} className="dlv-cell">
              {/* Inline arrow, so a value that wraps (two words in a narrow cell) keeps it on its first line. */}
              <p className="self-end text-h3 stretch-112 text-ink-1">
                <Icon aria-hidden="true" strokeWidth={2} className="dlv-trend mr-2.5 inline-block align-[-0.08em] text-ion" />
                <span aria-hidden="true">{item.value}</span>
                <span className="sr-only">{item.sr}</span>
              </p>
              <p className="mt-3 max-w-[34ch] text-small text-ink-2">{item.label}</p>
              <div className="dlv-foot mt-6 self-start">
                <Ticks count={40} />
                <span className="mt-3 inline-block font-mono text-[12px] leading-5 text-ink-3">{DELIVERY_CAPTION}</span>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
