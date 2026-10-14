import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import CalendlyButton from "@/components/ui/CalendlyButton";
import useMotionPreference from "@/hooks/useMotionPreference";
import useMediaQuery from "@/hooks/useMediaQuery";
import useInViewport from "@/hooks/useInViewport";
import useLenisScroll from "@/hooks/useLenisScroll";
import { fadeUpScale } from "@/lib/motion";
import { NAV_OFFSET } from "@/constants/site";
import { MISSIONS, MISSIONS_FOOTER } from "@/constants/missions";
import MissionCard from "./MissionCard";
import "./missions.css";

const STACK_QUERY = "(min-width: 1024px) and (min-height: 800px)";
const STACK_TOP = 96; // sticky top of card 0 (keep in sync with missions.css)
const STACK_STEP = 20; // each later card sticks 20 px lower
const FIT_SLACK = 24; // breathing room under a stuck card's content
const CARD_REVEAL = fadeUpScale();
const MISSION_IDS = new Set(MISSIONS.map((mission) => mission.id));

/**
 * 03 MISSIONS (#results). Five case studies.
 * Desktop >= 1024 x 800 with motion on: a sticky stack (each card scales/dims under the next, driven
 * by the list's scroll progress). The stack is only used when every card fits under the navbar at its
 * sticky offset (measured), so content is never trapped below the fold. Everywhere else, including
 * reduced motion: a plain stack whose cards fade up once.
 */
export default function Missions() {
  const { reduced } = useMotionPreference();
  const tall = useMediaQuery(STACK_QUERY);
  const wantStack = tall && !reduced;
  const [fits, setFits] = useState(true);
  const stacked = wantStack && fits;

  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const [active, setActive] = useState(-1);

  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start start", "end end"] });

  // Fit check: a stuck card must show all of its content between its sticky top and the viewport
  // bottom. Measures the content (never the min-height), so the result does not depend on the mode.
  // The same pass records the tallest card's full height as --mission-stack-h on the list: in stack mode
  // every card gets at least that height (missions.css), so a taller card never peeks out from beneath.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!wantStack) {
      list?.style.removeProperty("--mission-stack-h");
      return undefined;
    }
    const measure = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let ok = true;
      let tallest = 0;
      itemRefs.current.forEach((li, i) => {
        const card = li?.querySelector(".mission-card");
        const body = li?.querySelector(".mission-body");
        if (!card || !body) return;
        const cols = body.querySelectorAll(":scope > [data-col]");
        const quote = body.querySelector(":scope > [data-quote]");
        let content = 0;
        cols.forEach((col) => {
          content = Math.max(content, col.offsetHeight);
        });
        if (quote) content += (parseFloat(getComputedStyle(body).rowGap) || 0) + quote.offsetHeight;
        const cs = getComputedStyle(card);
        const padTop = parseFloat(cs.paddingTop) || 0;
        const frame = padTop + (parseFloat(cs.paddingBottom) || 0) + (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
        tallest = Math.max(tallest, frame + content);
        // The last card is never stuck (it ends the list), so it can be any height.
        if (i >= MISSIONS.length - 1) return;
        if (padTop + content + FIT_SLACK > vh - (STACK_TOP + i * STACK_STEP)) ok = false;
      });
      if (list && tallest > 0) list.style.setProperty("--mission-stack-h", `${Math.ceil(tallest)}px`);
      setFits(ok);
    };
    measure();
    // Observe the content blocks themselves: the body is stretched by the card's min-height in stack
    // mode, so its own size does not change when the content grows (e.g. after the fonts swap in).
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    itemRefs.current.forEach((li) => {
      li?.querySelectorAll(".mission-body > [data-col], .mission-body > [data-quote]").forEach((el) => ro?.observe(el));
    });
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [wantStack, stacked]);

  // In-page links to a mission (hero chips, telemetry captions): a stuck card reports its stuck
  // position, so Lenis / native fragment scrolling would aim at the wrong offset. For one frame around
  // the click, the list drops sticky so the target is measured at its natural position. Capture phase
  // on window runs before Lenis's and React's click handlers; the attribute is removed before paint.
  useEffect(() => {
    const list = listRef.current;
    if (!stacked || !list) return undefined;
    let raf = 0;
    const onClick = (e) => {
      const link = e.target instanceof Element ? e.target.closest("a[href*='#']") : null;
      if (!link || link.pathname !== window.location.pathname) return;
      let hash = "";
      try {
        hash = decodeURIComponent((link.hash || "").slice(1));
      } catch {
        hash = "";
      }
      if (!MISSION_IDS.has(hash)) return;
      list.setAttribute("data-unstick", "");
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => list.removeAttribute("data-unstick"));
    };
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      cancelAnimationFrame(raf);
      list.removeAttribute("data-unstick");
    };
  }, [stacked]);

  // Active card (the one whose satellite runs). Stacked: the front card, i.e. the last one whose top
  // has crossed the middle of the viewport. Plain: the topmost card whose diagram is mostly visible.
  const near = useInViewport(sectionRef, { rootMargin: "0px", once: false, attr: false });
  const nearRef = useRef(near);
  nearRef.current = near;

  const computeActive = useCallback(() => {
    const items = itemRefs.current;
    const list = listRef.current;
    if (!list) return -1;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const listRect = list.getBoundingClientRect();
    if (listRect.bottom < NAV_OFFSET || listRect.top > vh) return -1;

    if (stacked) {
      let front = -1;
      items.forEach((li, i) => {
        if (li && li.getBoundingClientRect().top <= vh * 0.5) front = i;
      });
      // Card 0 entering from below: its diagram is already on screen before it reaches mid-viewport.
      if (front === -1 && items[0] && items[0].getBoundingClientRect().top < vh * 0.7) front = 0;
      // After the stack: once the front card's diagram has left the viewport, nothing runs.
      const panel = front >= 0 ? items[front]?.querySelector(".mission-fig") : null;
      if (panel && panel.getBoundingClientRect().bottom < NAV_OFFSET) return -1;
      return front;
    }

    let first = -1;
    let best = -1;
    let bestRatio = 0;
    items.forEach((li, i) => {
      const panel = li?.querySelector(".mission-fig");
      if (!panel) return;
      const r = panel.getBoundingClientRect();
      if (r.height <= 0) return;
      const ratio = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, NAV_OFFSET)) / r.height;
      if (first === -1 && ratio >= 0.6) first = i;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = i;
      }
    });
    if (first !== -1) return first;
    return bestRatio >= 0.2 ? best : -1;
  }, [stacked]);

  useLenisScroll(() => {
    if (nearRef.current) setActive(computeActive());
  }, [computeActive]);

  useEffect(() => {
    setActive(near ? computeActive() : -1);
    if (!near) return undefined;
    const onResize = () => setActive(computeActive());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [near, computeActive]);

  const setItemRef = useCallback((i) => (el) => {
    itemRefs.current[i] = el;
  }, []);

  const total = MISSIONS.length;

  return (
    <Section ref={sectionRef} id="results" chapter="03" labelledBy="results-title">
      <SectionHeading
        index="03"
        name="MISSIONS"
        eyebrow="Results"
        title="Selected work"
        lead="The problem, what I did, and what changed."
        hudRight="5 MISSION FILES"
        id="results-title"
      />

      <ol ref={listRef} className="missions-stack" data-stacked={stacked ? "true" : "false"}>
        {MISSIONS.map((mission, i) => (
          <li
            key={mission.id}
            id={mission.id}
            ref={setItemRef(i)}
            className="missions-item scroll-mt-2"
            style={{ "--i": i }}
          >
            {stacked ? (
              <MissionCard
                key="stack"
                mission={mission}
                index={i}
                total={total}
                progress={scrollYProgress}
                stacked
                active={active === i}
              />
            ) : (
              <Reveal key="plain" variants={CARD_REVEAL}>
                <MissionCard
                  mission={mission}
                  index={i}
                  total={total}
                  progress={scrollYProgress}
                  stacked={false}
                  active={active === i}
                />
              </Reveal>
            )}
          </li>
        ))}
      </ol>

      <Reveal className="mt-24 flex flex-col items-center text-center">
        <p className="max-w-[60ch] text-lead text-ink-1">{MISSIONS_FOOTER.line}</p>
        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <CalendlyButton placement="results" label="Book a call" size="lg" cursorLock />
          <Button variant="ghost" size="lg" href="#about" icon="down">
            See my full career
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
