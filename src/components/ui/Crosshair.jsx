import { cn } from "@/lib/cn";

/** 9x9 "+" mark, 1 px --hud-dim. Decorative. */
export default function Crosshair({ className }) {
  return (
    <svg aria-hidden="true" focusable="false" width="9" height="9" viewBox="0 0 9 9" className={cn("block shrink-0", className)}>
      <path d="M4.5 0V9M0 4.5H9" stroke="var(--hud-dim)" strokeWidth="1" shapeRendering="crispEdges" fill="none" />
    </svg>
  );
}
