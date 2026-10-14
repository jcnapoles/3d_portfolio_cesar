import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import Picture from "@/components/ui/Picture";
import Reveal from "@/components/ui/Reveal";
import RevealItem from "@/components/ui/RevealItem";
import StarGlyph from "@/components/ui/StarGlyph";
import useLazyGsap from "@/hooks/useLazyGsap";
import useMediaQuery from "@/hooks/useMediaQuery";
import useMotionPreference from "@/hooks/useMotionPreference";
import { cn } from "@/lib/cn";
import { requestRefresh } from "@/lib/gsap";
import { staggerParent } from "@/lib/motion";
import { companyLogos } from "@/assets/media";
import { CAREER } from "@/constants/career";

// Lazy chunk (spec 7.2): only requested when the desktop rail mounts below the fold with motion on.
const NumberFlow = lazy(() => import("@number-flow/react"));

const YEAR_FORMAT = { useGrouping: false };
const TRANSFORM_TIMING = { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };
const SPIN_TIMING = { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };
const OPACITY_TIMING = { duration: 350, easing: "ease-out" };

const TOTAL = CAREER.length;
const pad2 = (n) => String(n).padStart(2, "0");
const ROWS = CAREER.map((row, index) => ({ ...row, index }));
const RECENT = ROWS.filter((row) => !row.earlier);
const EARLIER = ROWS.filter((row) => row.earlier);
const ROW_STAGGER = staggerParent({ stagger: 0.06 });

/** Desktop year rail (decorative, aria-hidden: every date is also in the rows as plain text). */
function YearRail({ index, animate }) {
  const year = CAREER[index].year;
  const text = String(year);
  return (
    <div aria-hidden="true" className="sticky top-[120px]">
      <div className="text-stat stretch-125 font-light tabular text-ink-3">
        <span className="text-ink-1">
          {animate ? (
            <Suspense fallback={text}>
              <NumberFlow
                value={year}
                format={YEAR_FORMAT}
                locales="en-US"
                respectMotionPreference={false}
                transformTiming={TRANSFORM_TIMING}
                spinTiming={SPIN_TIMING}
                opacityTiming={OPACITY_TIMING}
                willChange
              />
            </Suspense>
          ) : (
            text
          )}
        </span>
      </div>
      <p className="hud-label mt-5 tabular">
        LOG {pad2(index + 1)} / {pad2(TOTAL)}
      </p>
    </div>
  );
}

function LogRow({ row, onToggle }) {
  const logo = companyLogos[row.logo];
  return (
    <RevealItem as="li" data-fl-row="" data-fl-index={row.index} className="relative pl-8 lg:pl-12">
      <span data-fl-node="" aria-hidden="true" className="fl-node" />
      <div className={cn("fl-body flex gap-4 lg:gap-6", row.index > 0 && "border-t border-line")}>
        <div className="grid size-14 shrink-0 place-items-center rounded-md border border-line bg-space-800">
          {logo ? <Picture image={logo} alt="" className="grid place-items-center" imgClassName="fl-logo-img" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-baseline lg:gap-x-3 lg:gap-y-0.5 lg:pr-32">
            <h4 className="text-h4 text-ink-1">{row.role}</h4>
            <p className="text-small text-ink-2">{row.company}</p>
            <p className="font-mono text-[13px] leading-[1.4] tabular text-ink-3 lg:ml-auto">{row.dates}</p>
          </div>
          <p className="mt-2 text-body text-ink-1">{row.impact}</p>
          <details className="disclosure group/fd" onToggle={onToggle}>
            <summary className="fl-details-summary mt-3 inline-flex items-center gap-2 rounded-sm text-small text-ink-2 transition-colors duration-ui ease-ui hover:text-ink-1 coarse:min-h-11 lg:mt-0">
              <span>
                Details<span className="sr-only">: {row.role}, {row.company}</span>
              </span>
              <span
                aria-hidden="true"
                className="grid size-5 place-items-center rounded-full border border-line-strong group-open/fd:rotate-45 motion-ok:transition-transform motion-ok:duration-ui motion-ok:ease-ui"
              >
                <Plus size={12} strokeWidth={2} />
              </span>
            </summary>
            <ul className="space-y-2 pb-1 pt-3">
              {row.details.map((item) => (
                <li key={item} className="flex gap-3 text-small text-ink-2">
                  <StarGlyph size={10} className="mt-[5px] text-ink-3" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </RevealItem>
  );
}

/**
 * 6b Flight log. Rows are plain markup (final state). With GSAP (lazy, never under reduced motion):
 * the gold fill scrubs down the line with a comet head, nodes light as the head passes them, and
 * each row's trigger drives the desktop year rail and LOG counter.
 */
export default function FlightLog() {
  const logRef = useRef(null);
  const { reduced } = useMotionPreference();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [belowFold, setBelowFold] = useState(false);

  // Decide once, before paint: the odometer year is only worth loading if the log starts below the fold.
  useLayoutEffect(() => {
    const el = logRef.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight) setBelowFold(true);
  }, []);

  const activate = useCallback((i) => {
    if (activeRef.current === i) return;
    activeRef.current = i;
    setActive(i);
  }, []);

  // Disclosures change the log height: re-measure every ScrollTrigger (debounced in lib/gsap).
  const onToggle = useCallback(() => requestRefresh(), []);

  useLazyGsap(logRef, ({ gsap, ScrollTrigger }) => {
    const root = logRef.current;
    const track = root.querySelector("[data-fl-track]");
    const fill = root.querySelector("[data-fl-fill]");
    const head = root.querySelector("[data-fl-head]");
    const rows = Array.from(root.querySelectorAll("[data-fl-row]"));
    if (!track || !fill || !head || rows.length === 0) return undefined;

    const isHidden = (row) => !!row.closest("details:not([open])");
    // Layout offset inside the log (offsetTop ignores the Motion reveal transforms).
    const offsetWithin = (el) => {
      let y = 0;
      let node = el;
      while (node && node !== root) {
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return node ? y : Number.NaN;
    };

    let height = 0;
    let nodes = [];
    const measure = () => {
      height = track.offsetHeight;
      nodes = rows.map((row) => {
        const el = row.querySelector("[data-fl-node]");
        const y = isHidden(row) || !el ? Number.POSITIVE_INFINITY : offsetWithin(el) + el.offsetHeight / 2;
        return { el, y };
      });
    };
    const setHeadY = gsap.quickSetter(head, "y", "px");
    const paint = (progress) => {
      const y = progress * height;
      setHeadY(y);
      for (const n of nodes) if (n.el) n.el.classList.toggle("is-lit", y >= n.y - 0.5);
    };

    root.classList.add("is-armed");
    measure();
    gsap.set(head, { autoAlpha: 1 });
    gsap.fromTo(
      fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.6,
          onRefresh: (self) => {
            measure();
            if (self.animation) paint(self.animation.progress());
          },
        },
        onUpdate() {
          paint(this.progress());
        },
      }
    );

    rows.forEach((row) => {
      const index = Number(row.dataset.flIndex);
      const enter = () => {
        if (!isHidden(row)) activate(index);
      };
      ScrollTrigger.create({ trigger: row, start: "top 55%", end: "bottom 55%", onEnter: enter, onEnterBack: enter });
    });

    return () => {
      root.classList.remove("is-armed");
      for (const n of nodes) if (n.el) n.el.classList.remove("is-lit");
      activate(0);
    };
  }, []);

  return (
    <div className="mt-24 lg:mt-36">
      <h3 className="text-h3 text-ink-1">Where I&apos;ve led and built</h3>
      <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="hidden lg:col-span-3 lg:block">
          <YearRail index={active} animate={belowFold && isDesktop && !reduced} />
        </div>
        <div ref={logRef} className="fl-log lg:col-span-9">
          <div data-fl-track="" aria-hidden="true" className="fl-track">
            <div data-fl-fill="" className="fl-fill" />
            <div data-fl-head="" className="fl-head" />
          </div>
          <Reveal as="ol" variants={ROW_STAGGER}>
            {RECENT.map((row) => (
              <LogRow key={row.index} row={row} onToggle={onToggle} />
            ))}
          </Reveal>
          <details className="disclosure group/early" onToggle={onToggle}>
            <summary className="ml-8 mt-6 inline-flex h-11 items-center gap-3 rounded-pill border border-line-strong bg-white/[.04] px-5 text-button stretch-105 text-ink-1 transition-colors duration-ui ease-ui hover:border-ink-3 hover:bg-white/[.07] lg:ml-12">
              <span>Show earlier roles (2012–2021)</span>
              <Plus
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="shrink-0 group-open/early:rotate-45 motion-ok:transition-transform motion-ok:duration-ui motion-ok:ease-ui"
              />
            </summary>
            <Reveal as="ol" variants={ROW_STAGGER} className="pt-4">
              {EARLIER.map((row) => (
                <LogRow key={row.index} row={row} onToggle={onToggle} />
              ))}
            </Reveal>
          </details>
        </div>
      </div>
    </div>
  );
}
