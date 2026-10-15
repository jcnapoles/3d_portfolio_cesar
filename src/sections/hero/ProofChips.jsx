import { useMemo } from "react";
import Chip from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { getProofChips } from "@/constants/hero";

/**
 * Proof chips under the hero CTAs: mono ion value + plain label, each a link to its evidence. Closevibe leads.
 * Desktop: one wrapping row. Mobile: a 2 x 2 grid of stacked chips.
 * Fade up through .hero-in (hero.css). Start and step are CSS custom properties so the hero choreography can
 * retime them from hero.css without touching this file: --hero-chips-d / --hero-chips-dm (start, desktop / below
 * 1024 and repeat visits) and --hero-chips-step. Defaults match hero.css: 420 ms / 240 ms, 50 ms apart.
 */
export default function ProofChips({ className }) {
  const chips = useMemo(() => getProofChips(), []);
  return (
    <ul className={cn("grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2.5", className)}>
      {chips.map((chip, i) => (
        <li
          key={chip.key}
          className="hero-in flex min-w-0"
          style={{
            "--d": `calc(var(--hero-chips-d, 420ms) + ${i} * var(--hero-chips-step, 50ms))`,
            "--dm": `calc(var(--hero-chips-dm, 240ms) + ${i} * var(--hero-chips-step, 50ms))`,
          }}
        >
          <Chip
            href={chip.href}
            aria-label={chip.ariaLabel}
            className="flex w-full min-w-0 flex-col items-start gap-1 px-3 py-2.5 md:inline-flex md:w-auto md:flex-row md:items-center md:gap-2 md:px-3 md:py-1.5"
          >
            <span className="uppercase tracking-[0.04em] text-ion">{chip.value}</span>
            <span aria-hidden="true" className="hidden text-ink-3 md:inline">
              ·
            </span>
            <span className="sr-only">, </span>
            <span className="font-sans text-ink-2">{chip.label}</span>
          </Chip>
        </li>
      ))}
    </ul>
  );
}
