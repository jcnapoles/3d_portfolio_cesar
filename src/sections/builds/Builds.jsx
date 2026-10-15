import { useCallback, useEffect, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import useMediaQuery from "@/hooks/useMediaQuery";
import useMotionPreference from "@/hooks/useMotionPreference";
import useInViewport from "@/hooks/useInViewport";
import useLenisScroll from "@/hooks/useLenisScroll";
import { staggerParent } from "@/lib/motion";
import { BUILDS } from "@/constants/builds";
import BuildRow from "@/sections/builds/BuildRow";
import BuildPreview from "@/sections/builds/BuildPreview";
import "./builds.css";

const ROW_STAGGER = staggerParent({ stagger: 0.04 });
const FIRST_KEY = BUILDS[0].key;

const isHoverPointer = (e) => e.pointerType === "mouse" || e.pointerType === "pen";
const rowKeyAt = (target) => (target instanceof Element ? target.closest("[data-build-key]")?.dataset.buildKey ?? null : null);
const isFocusVisible = (el) => {
  try {
    return el instanceof Element && el.matches(":focus-visible");
  } catch {
    return false;
  }
};

/**
 * 07 FLEET: products and sites.
 * < 1024: a card list with inline screenshots.
 * >= 1024: the typographic index list (7/12) next to a sticky preview (5/12) that always shows a
 * screenshot. Active project = the hovered row, or the keyboard-focused row; otherwise, while
 * scrolling, the row nearest the viewport centre. Default: the first project.
 */
export default function Builds() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { reduced } = useMotionPreference();

  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const pointerInList = useRef(false);
  const focusInList = useRef(false);
  const [activeKey, setActiveKey] = useState(FIRST_KEY);

  const near = useInViewport(sectionRef, { rootMargin: "0px", once: false, attr: false });
  const nearRef = useRef(near);
  nearRef.current = near;

  /** The row whose centre is closest to the viewport centre. */
  const syncToScroll = useCallback(() => {
    const list = listRef.current;
    if (!isDesktop || !list || pointerInList.current || focusInList.current) return;
    const mid = (window.innerHeight || document.documentElement.clientHeight) / 2;
    let best = null;
    let bestDistance = Infinity;
    list.querySelectorAll("[data-build-key]").forEach((row) => {
      const r = row.getBoundingClientRect();
      const distance = Math.abs(r.top + r.height / 2 - mid);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = row.dataset.buildKey;
      }
    });
    if (best) setActiveKey(best);
  }, [isDesktop]);

  // At most every 100 ms while scrolling (it reads every row's rect), not on every scroll frame.
  useLenisScroll(
    () => {
      if (nearRef.current) syncToScroll();
    },
    [syncToScroll],
    { throttle: 100 }
  );

  useEffect(() => {
    if (!isDesktop) {
      pointerInList.current = false;
      focusInList.current = false;
      return undefined;
    }
    if (near) syncToScroll();
    window.addEventListener("resize", syncToScroll, { passive: true });
    return () => window.removeEventListener("resize", syncToScroll);
  }, [isDesktop, near, syncToScroll]);

  const onPointerOver = useCallback((e) => {
    if (!isHoverPointer(e)) return;
    pointerInList.current = true;
    const key = rowKeyAt(e.target);
    if (key) setActiveKey(key);
  }, []);
  // Leaving keeps the hovered project (the pointer may be heading for the preview to click it);
  // the next scroll hands control back to the viewport centre.
  const onPointerLeave = useCallback((e) => {
    if (isHoverPointer(e)) pointerInList.current = false;
  }, []);
  const onFocus = useCallback((e) => {
    if (!isFocusVisible(e.target)) return;
    const key = rowKeyAt(e.target);
    if (!key) return;
    focusInList.current = true;
    setActiveKey(key);
  }, []);
  const onBlur = useCallback((e) => {
    const next = e.relatedTarget;
    if (next instanceof Node && listRef.current?.contains(next)) return;
    focusInList.current = false;
  }, []);

  return (
    <Section ref={sectionRef} id="builds" chapter="07" labelledBy="builds-title">
      <SectionHeading
        index="07"
        name="FLEET"
        eyebrow="Builds"
        title="What I've built and lead"
        lead="My own SaaS, the platforms I lead as fractional CTO, and client websites. Live and clickable."
        id="builds-title"
      />

      <div className="builds-layout">
        <div
          ref={listRef}
          className="builds-list"
          onPointerOver={isDesktop ? onPointerOver : undefined}
          onPointerLeave={isDesktop ? onPointerLeave : undefined}
          onFocus={isDesktop ? onFocus : undefined}
          onBlur={isDesktop ? onBlur : undefined}
        >
          <div aria-hidden="true" className="builds-head hud-label hidden lg:grid">
            <span>Nº</span>
            <span>Project</span>
            <span>Status</span>
            <span />
          </div>
          <Reveal as="ol" variants={ROW_STAGGER} className="grid gap-4 sm:grid-cols-2 lg:block">
            {BUILDS.map((build, i) => (
              <BuildRow key={build.key} build={build} index={i} active={isDesktop && activeKey === build.key} />
            ))}
          </Reveal>
        </div>

        {isDesktop ? <BuildPreview activeKey={activeKey} reduced={reduced} /> : null}
      </div>
    </Section>
  );
}
