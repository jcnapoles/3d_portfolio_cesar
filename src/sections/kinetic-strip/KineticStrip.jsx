import { Fragment, useRef } from "react";
import StarGlyph from "@/components/ui/StarGlyph";
import useInViewport from "@/hooks/useInViewport";
import { cn } from "@/lib/cn";
import "./kinetic-strip.css";

const WORDS = ["STRATEGY", "ARCHITECTURE", "TEAMS", "CLOUD", "AI", "PRODUCT"];
const REPEATS = 3; // each row is repeated three times for width

function Row({ className }) {
  return (
    <div className={cn("kinetic-row flex w-max items-center", className)}>
      {Array.from({ length: REPEATS }, (_, r) =>
        WORDS.map((word) => (
          <Fragment key={`${r}-${word}`}>
            <span>{word}</span>
            <StarGlyph size={40} className="mx-6 inline text-gold/60" />
          </Fragment>
        ))
      )}
    </div>
  );
}

/**
 * 6.7 Kinetic word strip, between Missions and Process. Decorative (aria-hidden), not a Section:
 * no chapter, no heading. Motion is CSS scroll-driven only (kinetic-strip.css, @supports-gated and
 * motion-gated); it clips itself so it can never cause horizontal page scroll.
 * data-offscreen follows the Section contract (200 px margin) so nothing inside runs while offscreen.
 */
export default function KineticStrip() {
  const ref = useRef(null);
  const onScreen = useInViewport(ref, { rootMargin: "200px 0px", once: false, attr: false, initial: true });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-offscreen={onScreen ? "false" : "true"}
      className="relative z-content select-none overflow-clip py-16 font-bold leading-[.9] stretch-125 whitespace-nowrap text-[clamp(4rem,1.3rem+11.8vw,12rem)]"
    >
      <Row className="kinetic-row--1 text-ink-1/10" />
      <Row className="kinetic-row--2 text-ion/[.08]" />
    </div>
  );
}
