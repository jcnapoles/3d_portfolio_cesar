import { useEffect, useMemo, useState } from "react";
import { ChapterContext } from "@/providers/contexts";
import { CHAPTERS } from "@/constants/site";

const byIndex = (index) => CHAPTERS.find((c) => c.index === index) || CHAPTERS[0];

/**
 * Scroll spy. Observes every [data-chapter-index] against a 1 px line at the viewport's
 * vertical centre; the element crossing that line is the active chapter. Writes
 * body[data-chapter] (drives the atmosphere glows) and provides { index, name, id, label }.
 * Between chapters (e.g. the kinetic strip, the footer) the last chapter above the centre line stays active.
 *
 * Instant jumps (End key, window.scrollTo, a reload mid-page) can skip every crossing while the observer
 * is watching, so the same answer is also computed from geometry: once after mount, whenever the
 * observer reports no hit, and when scrolling settles (scrollend, or a debounced scroll fallback).
 */
export default function ChapterProvider({ children }) {
  const [index, setIndex] = useState("00");

  useEffect(() => {
    document.body.dataset.chapter = index;
  }, [index]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("[data-chapter-index]"));
    if (!nodes.length) return undefined;

    // The last chapter whose top is above the viewport centre (document order = page order).
    const fromGeometry = () => {
      const mid = window.innerHeight / 2;
      let next = null;
      for (const n of nodes) {
        if (!n.isConnected) continue;
        if (n.getBoundingClientRect().top <= mid) next = n.getAttribute("data-chapter-index");
        else break;
      }
      setIndex(next || "00");
    };

    let io;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const hits = entries.filter((e) => e.isIntersecting);
          if (!hits.length) {
            fromGeometry();
            return;
          }
          // If several report at once (fast jumps), the one lowest on the page wins.
          const hit = hits.reduce((a, b) => (b.boundingClientRect.top > a.boundingClientRect.top ? b : a));
          const next = hit.target.getAttribute("data-chapter-index");
          if (next) setIndex(next);
        },
        { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      );
      nodes.forEach((n) => io.observe(n));
    }

    let timer;
    const supportsScrollEnd = "onscrollend" in window;
    const onSettled = () => fromGeometry();
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(fromGeometry, 160);
    };
    if (supportsScrollEnd) window.addEventListener("scrollend", onSettled, { passive: true });
    else window.addEventListener("scroll", onScroll, { passive: true });
    const raf = window.requestAnimationFrame(fromGeometry);

    return () => {
      io?.disconnect();
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("scrollend", onSettled);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const value = useMemo(() => byIndex(index), [index]);
  return <ChapterContext.Provider value={value}>{children}</ChapterContext.Provider>;
}
