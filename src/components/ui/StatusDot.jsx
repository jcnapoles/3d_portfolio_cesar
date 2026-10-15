import { cn } from "@/lib/cn";

/**
 * 8 px --signal "available" dot with a ping ring (motion-ok). Under reduced motion: a static 1 px ring.
 * `pings`: how many times the ring pings before it rests behind the dot (default: forever). A running loop is
 * restyled on every main-thread frame, so where frames keep coming (the hero, under the Galaxy) it is capped.
 */
export default function StatusDot({ className, pings }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex size-2 shrink-0", className)}>
      <span
        className="absolute inset-0 rounded-full bg-signal opacity-60 motion-ok:animate-ping-signal motion-off:hidden"
        style={pings ? { animationIterationCount: pings } : undefined}
      />
      <span className="absolute -inset-[3px] hidden rounded-full border border-signal/50 motion-off:block" />
      <span className="relative inline-flex size-2 rounded-full bg-signal" />
    </span>
  );
}
