import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { HERO_COPY } from "@/constants/hero";

/** One H1 word inside a CSS mask; `i` drives the rise stagger (hero.css). */
function Word({ i, children }) {
  return (
    <span className="hero-mask">
      <span className="hero-word" style={{ "--i": i }}>
        {children}
      </span>
    </span>
  );
}

/**
 * The single page H1 (spec 6.2). Span 1 rises word by word inside masks (CSS only, never opacity-hidden);
 * the gold full stop is a decorative circle on the baseline (the real "." is sr-only), and it is the launch
 * origin for useFullStopLaunch (`ref`).
 */
const HeroHeadline = forwardRef(function HeroHeadline({ className }, periodRef) {
  return (
    <h1 id="hero-title" className={cn("text-ink-1", className)}>
      <span className="block text-display-xl stretch-112 text-ink-1">
        <Word i={0}>Senior</Word> <Word i={1}>tech</Word>
        <br />
        <span className="whitespace-nowrap">
          <Word i={2}>leadership</Word>
          <span className="sr-only">.</span>
          <span
            ref={periodRef}
            aria-hidden="true"
            className="hero-period ml-[0.05em] inline-block size-[0.16em] rounded-full bg-gold align-baseline shadow-glow-sat"
          />
        </span>
      </span>
      <span className="hero-in mt-4 block text-display-s text-ink-2" style={{ "--d": "240ms", "--dm": "140ms" }}>
        {HERO_COPY.subtitle}
      </span>
    </h1>
  );
});

export default HeroHeadline;
