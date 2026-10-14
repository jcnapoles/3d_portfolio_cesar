import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { scrollToId, scrollToTop } from "@/lib/scroll";
import { CHAPTERS, NAV_OFFSET } from "@/constants/site";
import ScrambleText from "@/components/ui/ScrambleText";
import useLenis from "@/hooks/useLenis";
import useActiveChapter from "@/hooks/useActiveChapter";
import useMediaQuery from "@/hooks/useMediaQuery";
import "@/sections/chrome/chrome.css";

const ROW = 24; // px: each link is a 32 x 24 hit area

/** Keyboard activation (Enter on a link): move focus to the target's heading so Tab continues from there. */
function focusSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const target = section.querySelector("h1, h2") || section;
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
}

/** True while the hero (#top) is visible below the navbar. */
function useHeroInView(enabled) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!enabled) return undefined;
    const hero = document.getElementById("top");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setInView(false);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: `-${NAV_OFFSET}px 0px 0px 0px`,
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [enabled]);
  return inView;
}

// The rail sits at right: 24px, 32 px wide. Below 1360 px it would draw over the right edge of full-width cards
// (the 1200 px container leaves only (vw - 1200) / 2 of margin), so it starts at 1360 (spec 6.16 said 1280).
const RAIL_QUERY = "(min-width: 1360px)";

/**
 * Mission rail (spec 6.16): a fixed chapter index on the right edge, >= 1360 only, hidden while the hero
 * is in view (it still appears when a link inside it receives keyboard focus). 11 ticks, the active one gold,
 * with a scrambled "{index} / {name}" label to its left. Each link has an sr-only "{index} {label}".
 */
export default function MissionRail() {
  const wide = useMediaQuery(RAIL_QUERY);
  const lenis = useLenis();
  const { index } = useActiveChapter();
  const heroInView = useHeroInView(wide);
  if (!wide) return null;

  const activeIdx = Math.max(0, CHAPTERS.findIndex((c) => c.index === index));
  const active = CHAPTERS[activeIdx];

  const onClick = (e, id) => {
    e.stopPropagation();
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (id === "top") scrollToTop(lenis);
    else scrollToId(id, lenis);
    if (e.detail === 0) focusSection(id);
  };

  return (
    <nav aria-label="Chapters" className="fixed right-6 top-1/2 z-rail hidden -translate-y-1/2 min-[1360px]:block">
      <div className="rail-body relative" data-hidden={heroInView ? "true" : "false"}>
        {/* Active label, centred on the active tick (decorative: every link carries its own sr-only label). */}
        <div aria-hidden="true" className="pointer-events-none absolute right-full top-0 mr-1">
          <div className="rail-label-track" style={{ transform: `translate3d(0, ${activeIdx * ROW + ROW / 2}px, 0)` }}>
            <div className="rail-label -translate-y-1/2 whitespace-nowrap">
              <span className="font-mono text-hud-xs uppercase text-ink-2">
                <ScrambleText key={active.index} text={`${active.index} / ${active.name}`} trigger="mount" duration={300} />
              </span>
            </div>
          </div>
        </div>

        <ol className="flex flex-col">
          {CHAPTERS.map((c, i) => {
            const isActive = i === activeIdx;
            return (
              <li key={c.index}>
                <a
                  href={`#${c.id}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={(e) => onClick(e, c.id)}
                  className="group flex h-6 w-8 items-center justify-center rounded-xs"
                >
                  <span className="sr-only">{`${c.index} ${c.label}`}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "rail-tick block h-0.5 w-4 rounded-full",
                      isActive ? "bg-gold shadow-[0_0_8px_rgba(244,184,96,.55)]" : "bg-line-strong group-hover:bg-ink-3"
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
