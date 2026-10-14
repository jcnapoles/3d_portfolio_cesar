import { cn } from "@/lib/cn";
import useMotionPreference from "@/hooks/useMotionPreference";

/**
 * The visible Motion On/Off switch (footer + mobile menu). It is the WCAG 2.2.2 pause control:
 * flipping it rewrites html[data-motion] live and persists localStorage['cn:motion'].
 */
export default function MotionToggle({ className }) {
  const { reduced, setUserReduced } = useMotionPreference();
  const on = !reduced;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setUserReduced(on)}
      className={cn(
        "group relative inline-flex items-center gap-2.5 rounded-pill py-1 font-mono text-hud-xs uppercase text-ink-3",
        "transition-colors duration-ui ease-ui hover:text-ink-1",
        "coarse:min-h-11",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-3 w-[22px] shrink-0 items-center rounded-pill border transition-colors duration-ui ease-ui",
          on ? "border-ink-2/60 bg-white/[.06]" : "border-line-strong bg-transparent"
        )}
      >
        <span
          className={cn(
            "absolute left-[2px] top-[2px] size-1.5 rounded-full transition-[transform,background-color] duration-ui ease-ui",
            on ? "translate-x-[10px] bg-ink-1" : "translate-x-0 bg-ink-3"
          )}
        />
      </span>
      <span>{on ? "Motion: On" : "Motion: Off"}</span>
    </button>
  );
}
