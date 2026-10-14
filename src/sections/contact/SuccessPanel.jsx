import { useEffect, useRef } from "react";
import { m } from "motion/react";
import { Check } from "lucide-react";
import { EASE } from "@/lib/motion";
import Button from "@/components/ui/Button";
import CalendlyButton from "@/components/ui/CalendlyButton";
import useMotionPreference from "@/hooks/useMotionPreference";

// Outer to inner. Each ring converges (scale 1.6 -> 1, opacity 0 -> 1, 600 ms EASE.inout, 60 ms stagger).
const RINGS = [
  { inset: 0, className: "border-line-strong" },
  { inset: 18, className: "border-[color:var(--hud)]" },
  { inset: 36, className: "border-signal/40" },
];

/**
 * Rendered over the form inside the same card (absolute inset-0) after a successful send.
 * Focus moves to its heading so keyboard and screen-reader users land on the confirmation;
 * the visible copy is also announced through the card's polite status region.
 */
export default function SuccessPanel({ onReset }) {
  const { reduced } = useMotionPreference();
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <m.div
      className="absolute inset-0 z-[2] flex flex-col items-center justify-center overflow-y-auto rounded-[inherit] bg-space-800 px-6 py-10 text-center sm:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: EASE.ui }}
    >
      <div aria-hidden="true" className="relative grid size-[120px] shrink-0 place-items-center">
        {RINGS.map((ring, i) => (
          <m.span
            key={ring.inset}
            className={`absolute rounded-full border ${ring.className}`}
            style={{ inset: `${ring.inset}px` }}
            initial={reduced ? false : { scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE.inout, delay: i * 0.06 }}
          />
        ))}
        <span className="relative grid size-12 place-items-center rounded-full bg-[var(--signal-tint)] text-signal">
          <Check size={22} strokeWidth={2.25} />
        </span>
      </div>

      <p aria-hidden="true" className="hud-label mt-7">
        TRANSMISSION RECEIVED
      </p>
      <h3 ref={headingRef} tabIndex={-1} className="mt-3 text-h3 text-ink-1">
        Message received
      </h3>
      <p className="mt-3 max-w-[36ch] text-body text-ink-2">Thanks, your message is in. I'll reply by email.</p>

      <div className="mt-8 flex flex-col items-center gap-5">
        <CalendlyButton
          placement="contact"
          variant="text"
          label="Want a faster answer? Book a 30-min call"
          className="whitespace-normal text-center"
        >
          Want a faster answer? Book a <span className="whitespace-nowrap">30-min call</span>
        </CalendlyButton>
        <Button variant="ghost" size="md" icon="none" onClick={onReset}>
          Send another message
        </Button>
      </div>
    </m.div>
  );
}
