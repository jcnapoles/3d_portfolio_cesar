import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import SpotlightCard from "@/components/ui/SpotlightCard";
import CalendlyButton from "@/components/ui/CalendlyButton";
import Reveal from "@/components/ui/Reveal";
import useLazyGsap from "@/hooks/useLazyGsap";
import useInViewport from "@/hooks/useInViewport";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { requestRefresh } from "@/lib/gsap";
import { fadeUp, fadeUpScale, STAGGER } from "@/lib/motion";
import { STEPS, WAYPOINTS } from "@/constants/process";
import TransferDiagram from "./TransferDiagram";
import "./process.css";

const LAST = STEPS.length - 1;

/** Vertical centre of `el` inside `ancestor`, from layout offsets (immune to reveal transforms). null if hidden. */
function centerWithin(el, ancestor) {
  if (!el || !ancestor || el.offsetParent === null) return null;
  let y = el.offsetHeight / 2;
  let node = el;
  while (node && node !== ancestor) {
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return node === ancestor ? y : null;
}

/**
 * One step. Desktop/tablet: a SpotlightCard. Phone (< 768): the card chrome is stripped and the step sits
 * to the right of the rail, with its dot on the rail. `reached` = the comet / rail fill has passed this step.
 */
function StepCard({ step, reached, dotRef }) {
  return (
    <SpotlightCard
      as="div"
      padding="md"
      className="flex w-full flex-col max-md:rounded-none max-md:border-0 max-md:p-0 max-md:shadow-none max-md:[background:none] lg:max-xl:p-6"
    >
      {/* Active top edge (tablet + desktop) */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-6 -top-px z-[2] h-px bg-[linear-gradient(90deg,transparent,var(--ion)_22%,var(--ion)_78%,transparent)] transition-opacity duration-panel ease-ui max-md:hidden",
          reached ? "opacity-100" : "opacity-0"
        )}
      />
      {/* "{n} · {phase}". In the card grids (>= 768) the phase always takes its own line (separator hidden), so
          every card's title starts on the same baseline whatever the column width. */}
      <p className="hud-label flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          ref={dotRef}
          aria-hidden="true"
          className={cn(
            "size-[9px] shrink-0 rounded-full border transition-colors duration-panel ease-ui max-md:absolute max-md:-left-8 max-md:top-[2.7px] lg:hidden",
            reached ? "border-ion bg-ion" : "border-line-strong bg-void"
          )}
        />
        <span className={cn("transition-colors duration-panel ease-ui", reached && "text-ion")}>{step.n}</span>
        <span aria-hidden="true" className="md:hidden">
          ·
        </span>
        <span className="whitespace-nowrap md:mt-1 md:basis-full lg:whitespace-normal lg:max-xl:min-h-[2.4em]">{step.phase}</span>
      </p>
      <h3 className={cn("mt-4 text-h4 transition-colors duration-panel ease-ui", reached ? "text-ink-1" : "text-ink-3")}>
        {step.title}
      </h3>
      <p className="mt-3 text-small text-ink-2">{step.body}</p>
    </SpotlightCard>
  );
}

/**
 * 6.8 Process (#process, chapter 04 FLIGHT PLAN).
 * - >= 1024: TransferDiagram (scrubbed path draw + comet) above a 5-column row of step cards.
 * - 768-1023: diagram hidden; cards in a 3 + 2 grid beside the rail (gold fill, scaleY).
 * - < 768: vertical list on a 1 px rail at x = 20 px; each step's dot sits on the rail.
 * The default markup is the final state (path drawn, comet at the end, rail full, every step active). GSAP only
 * runs through useLazyGsap (never under reduced motion) and reverts to that state when motion is switched off.
 */
export default function Process() {
  const sectionRef = useRef(null);
  const diagramRef = useRef(null);
  const basePathRef = useRef(null);
  const progressPathRef = useRef(null);
  const glowPathRef = useRef(null);
  const cometRef = useRef(null);
  const railWrapRef = useRef(null);
  const railRef = useRef(null);
  const railFillRef = useRef(null);
  const dotRefs = useRef([]);
  const ctaRef = useRef(null);

  const diagramRefs = useMemo(
    () => ({ basePath: basePathRef, progressPath: progressPathRef, glowPath: glowPathRef, comet: cometRef }),
    []
  );

  // ---------- Active step (only re-renders when the value changes) ----------
  const [active, setActive] = useState(LAST);
  const activeRef = useRef(LAST);
  const modeRef = useRef("diagram"); // "diagram" (>= 1024, WAYPOINTS) | "rail" (< 1024, measured dots)
  const railThresholdsRef = useRef(WAYPOINTS);
  const glintArmedRef = useRef(false);
  const [glintArmed, setGlintArmed] = useState(false);

  const updateActive = useCallback((progress) => {
    const thresholds = modeRef.current === "rail" ? railThresholdsRef.current : WAYPOINTS;
    const next = Math.max(0, thresholds.filter((w) => progress >= w - 0.001).length - 1);
    const prev = activeRef.current;
    if (next === prev) return;
    activeRef.current = next;
    setActive(next);
    // The comet (or rail) has just reached step 5 from an earlier step: arm the one-shot CTA glint.
    if (next === LAST && prev < LAST && !glintArmedRef.current) {
      glintArmedRef.current = true;
      setGlintArmed(true);
    }
  }, []);

  const resetActive = useCallback(() => {
    modeRef.current = "diagram";
    activeRef.current = LAST;
    setActive(LAST);
  }, []);

  // ---------- Rail geometry (< 1024): from the first step's dot to the last one ----------
  const [railBox, setRailBox] = useState(null);
  useLayoutEffect(() => {
    const wrap = railWrapRef.current;
    if (!wrap) return undefined;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const ys = STEPS.map((_, i) => centerWithin(dotRefs.current[i], wrap));
      if (ys.some((y) => y === null)) return; // dots are hidden at >= 1024
      const top = ys[0];
      const height = Math.max(0, ys[ys.length - 1] - top);
      const increasing = ys.every((y, i) => i === 0 || y > ys[i - 1] + 1);
      // One column: each dot lights exactly as the fill reaches it. 3 + 2 grid (shared rows): WAYPOINTS.
      railThresholdsRef.current = increasing && height > 0 ? ys.map((y) => (y - top) / height) : WAYPOINTS;
      setRailBox((prev) =>
        prev && Math.abs(prev.top - top) < 0.5 && Math.abs(prev.height - height) < 0.5 ? prev : { top, height }
      );
    };
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        measure();
        requestRefresh();
      });
      ro.observe(wrap);
    }
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => {
      alive = false;
      ro?.disconnect();
    };
  }, []);

  // ---------- GSAP scrub ----------
  useLazyGsap(
    sectionRef,
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" }, (ctx) => {
        if (ctx.conditions.desktop) {
          const diagram = diagramRef.current;
          const base = basePathRef.current;
          const comet = cometRef.current;
          const strokes = [progressPathRef.current, glowPathRef.current].filter(Boolean);
          if (!diagram || !base || !comet || !strokes.length) return;
          modeRef.current = "diagram";
          // Trigger = the diagram itself, so the comet's whole flight happens on screen: it leaves the start
          // orbit as that orbit enters the bottom of the viewport and parks in the target orbit before the
          // top of the diagram reaches the navbar.
          const tl = gsap.timeline({
            scrollTrigger: { trigger: diagram, start: "86% 95%", end: "19% 14%", scrub: 0.6 },
            onUpdate() {
              updateActive(this.progress());
            },
          });
          tl.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0).to(
            comet,
            { motionPath: { path: base, align: base, alignOrigin: [0.5, 0.5] }, ease: "none", immediateRender: true },
            0
          );
          updateActive(tl.progress());
        } else {
          const rail = railRef.current;
          const fill = railFillRef.current;
          if (!rail || !fill) return;
          modeRef.current = "rail";
          const tween = gsap.fromTo(
            fill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: rail, start: "top 70%", end: "bottom 70%", scrub: 0.6 },
              onUpdate() {
                updateActive(this.progress());
              },
            }
          );
          updateActive(tween.progress());
        }
      });
      // Page-height changes above this section (disclosures, late layout) are handled globally:
      // GsapBoot refreshes ScrollTrigger (debounced) from a ResizeObserver on <body>.
      return () => {
        mm.revert();
        resetActive();
      };
    },
    []
  );

  // ---------- One-shot CTA glint: once step 5 has been reached AND the CTA is on screen ----------
  const ctaInView = useInViewport(ctaRef, { rootMargin: "0px 0px -8% 0px", once: false, attr: false });
  const [glint, setGlint] = useState(false);
  useEffect(() => {
    if (glintArmed && ctaInView) setGlint(true);
  }, [glintArmed, ctaInView]);

  // ---------- Reveals (cards: 80 ms stagger when side by side; each phone step enters on its own) ----------
  const multiCol = useMediaQuery("(min-width: 768px)");
  const isMobile = !multiCol;
  const cardVariants = useMemo(
    () => STEPS.map((_, i) => fadeUpScale({ y: isMobile ? 16 : 32, delay: multiCol ? i * STAGGER.cards : 0 })),
    [multiCol, isMobile]
  );
  const ctaVariants = useMemo(() => fadeUp({ y: isMobile ? 16 : 24 }), [isMobile]);

  return (
    <Section ref={sectionRef} id="process" chapter="04" labelledBy="process-title">
      <SectionHeading
        index="04"
        name="FLIGHT PLAN"
        eyebrow="Process"
        title="How we'll work together"
        lead="Clear steps. No black box."
        id="process-title"
      />

      <div className="mb-10 hidden lg:block">
        <TransferDiagram ref={diagramRef} refs={diagramRefs} active={active} />
      </div>

      <div ref={railWrapRef} className="relative">
        {/* Rail (< 1024): 1 px line at x = 20 px from the first dot to the last, gold fill grows top-down */}
        <div
          ref={railRef}
          aria-hidden="true"
          className="absolute inset-y-0 left-5 w-px bg-line-strong lg:hidden"
          style={railBox ? { top: railBox.top, height: railBox.height, bottom: "auto" } : undefined}
        >
          <div ref={railFillRef} className="absolute inset-0 origin-top bg-gold" />
        </div>

        <ol role="list" className="grid grid-cols-1 pl-12 md:grid-cols-6 md:gap-4 lg:grid-cols-5 lg:gap-6 lg:pl-0">
          {STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.n}
              variants={cardVariants[i]}
              className={cn("flex max-md:pb-10 max-md:last:pb-0", i < 3 ? "md:col-span-2" : "md:col-span-3", "lg:col-span-1")}
            >
              <StepCard
                step={step}
                reached={i <= active}
                dotRef={(el) => {
                  dotRefs.current[i] = el;
                }}
              />
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal variants={ctaVariants} className="mt-12 flex max-lg:pl-12 lg:mt-14 lg:justify-end">
        <span ref={ctaRef} className="process-cta relative inline-flex rounded-pill" data-glint={glint ? "true" : undefined}>
          <CalendlyButton placement="process" label="Start with a 30-min call" cursorLock />
          <span aria-hidden="true" data-glow="" className="process-glint" />
        </span>
      </Reveal>
    </Section>
  );
}
