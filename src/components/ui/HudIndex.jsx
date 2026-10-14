import { useRef } from "react";
import { cn } from "@/lib/cn";
import useInViewport from "@/hooks/useInViewport";

/** aria-hidden HUD row: "02 / FLIGHT MODES" + a hairline rule that draws once in view + optional right label. */
export default function HudIndex({ index, name, right, className }) {
  const ref = useRef(null);
  useInViewport(ref);
  return (
    <div ref={ref} aria-hidden="true" className={cn("flex w-full items-center gap-4", className)}>
      <span className="flex shrink-0 items-baseline whitespace-nowrap">
        <span className="font-mono text-hud text-ion">{index}</span>
        {name ? <span className="hud-label">&nbsp;/ {name}</span> : null}
      </span>
      <span className="reveal-rule h-px min-w-6 flex-1 bg-line-strong" />
      {right ? <span className="hud-label shrink-0 whitespace-nowrap">{right}</span> : null}
    </div>
  );
}
