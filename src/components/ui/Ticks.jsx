import { useRef } from "react";
import { cn } from "@/lib/cn";
import useInViewport from "@/hooks/useInViewport";

const ticksBackground = (color, count) => ({
  backgroundImage: [
    `repeating-linear-gradient(90deg, ${color} 0 1px, transparent 1px calc(100% / ${Math.max(1, Math.round(count / 5))}))`,
    `repeating-linear-gradient(90deg, ${color} 0 1px, transparent 1px calc(100% / ${Math.max(1, count)}))`,
  ].join(", "),
  backgroundSize: "100% 100%, 100% 50%",
  backgroundPosition: "0 0, 0 100%",
  backgroundRepeat: "no-repeat",
});

/**
 * aria-hidden ruler: `count` ticks (every fifth one taller) in --line-strong, plus an ion overlay that
 * fills left -> right over 900 ms once in view (fillOnView). Reduced motion: shown full.
 */
export default function Ticks({ count = 40, fillOnView = true, className }) {
  const ref = useRef(null);
  useInViewport(ref, { attr: fillOnView });
  return (
    <div ref={ref} aria-hidden="true" className={cn("ticks relative h-2 w-full", className)}>
      <div className="absolute inset-0" style={ticksBackground("var(--line-strong)", count)} />
      {fillOnView ? <div className="ticks-fill absolute inset-0 opacity-70" style={ticksBackground("var(--ion)", count)} /> : null}
    </div>
  );
}
