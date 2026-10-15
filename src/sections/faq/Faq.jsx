import { useMemo } from "react";
import { Plus } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import CalendlyButton from "@/components/ui/CalendlyButton";
import Reveal from "@/components/ui/Reveal";
import useMediaQuery from "@/hooks/useMediaQuery";
import { fadeUp, staggerFor } from "@/lib/motion";
import { FAQ } from "@/constants/faq";

const pad2 = (n) => String(n).padStart(2, "0");

// Rows fade up with a 50 ms stagger (6 rows fit the 300 ms cap).
const ROW_STAGGER = staggerFor(FAQ.length);

/**
 * 6.13 FAQ (#faq, chapter 09). Native exclusive accordion: <details class="disclosure" name="faq">.
 * - No JS state: the browser owns [open]; `name` makes it exclusive where supported.
 * - Height animates through .disclosure::details-content (index.css) where supported, instant elsewhere
 *   and under reduced motion. The Plus icon turns 45 degrees on [open] (240 ms, ease ui).
 * - Motion only animates the row wrappers (fade-up), never the <details> itself (rule M-1).
 * Desktop (>= 1024): 4/8 split with a sticky left column. Below 1024 it stacks: heading, questions, then
 * "Still unsure?" (the left column uses `display: contents` so nothing is duplicated).
 */
export default function Faq() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const desktop = useMediaQuery("(min-width: 1024px)");
  const asideVariants = useMemo(() => fadeUp({ y: isMobile ? 12 : 16, delay: isMobile ? 0 : 0.06 }), [isMobile]);
  // Each row observes itself. On desktop the list enters the viewport in one go, so the per-index delay
  // gives the stagger; on a phone the rows enter one by one as you scroll, so each reveals on arrival.
  const rowVariants = useMemo(
    () => FAQ.map((_, i) => fadeUp({ y: isMobile ? 12 : 16, delay: desktop ? i * ROW_STAGGER : 0 })),
    [isMobile, desktop]
  );

  return (
    <Section id="faq" chapter="09" labelledBy="faq-title">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6">
        <div className="contents lg:sticky lg:top-[120px] lg:col-span-4 lg:block lg:self-start">
          <SectionHeading
            index="09"
            name="PRE-FLIGHT CHECKS"
            eyebrow="FAQ"
            title="Questions founders ask"
            id="faq-title"
            className="order-1 lg:order-none lg:mb-10"
          />
          <Reveal
            variants={asideVariants}
            className="order-3 mt-12 flex flex-wrap items-center gap-x-4 gap-y-1 sm:mt-14 lg:order-none lg:mt-0"
          >
            <p className="text-lead text-ink-1">Still unsure?</p>
            <CalendlyButton placement="faq" variant="text" label="Book a call" />
          </Reveal>
        </div>

        <div className="order-2 border-t border-line lg:order-none lg:col-span-8">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} variants={rowVariants[i]}>
              <details name="faq" className="disclosure group border-b border-line">
                <summary className="group/q grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-sm py-5 sm:grid-cols-[5.5rem_1fr_auto]">
                  <span aria-hidden="true" className="hud-label col-span-2 sm:col-span-1">
                    CHECK {pad2(i + 1)}
                  </span>
                  <span className="text-balance text-h4 text-ink-1">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-pill border border-line-strong text-ink-2 transition-colors duration-ui ease-ui group-open:border-ink-3 group-open:text-ink-1 fine:group-hover/q:border-ink-3 fine:group-hover/q:text-ink-1 motion-off:transition-none"
                  >
                    <Plus
                      size={18}
                      strokeWidth={1.75}
                      className="transition-transform duration-ui ease-ui group-open:rotate-45 motion-off:transition-none"
                    />
                  </span>
                </summary>
                <div className="pb-6 sm:pl-[6.5rem] sm:pr-[3.25rem]">
                  <p className="max-w-prose text-body text-ink-2">{item.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
