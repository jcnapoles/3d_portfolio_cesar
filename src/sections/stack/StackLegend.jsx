import { cn } from "@/lib/cn";
import { staggerFor, staggerParent } from "@/lib/motion";
import Chip from "@/components/ui/Chip";
import Reveal from "@/components/ui/Reveal";
import RevealItem from "@/components/ui/RevealItem";
import { CONSTELLATIONS } from "@/constants/stack";

/**
 * The accessible stack: five groups, each an <h3 class="hud-label"> + a <ul> of chips (16 px icon + name).
 * Shown at every size; under 1024 px it is the only stack layout (2 columns).
 * `icons` is the lazily loaded brand glyph map (useBrandIcons; null until it arrives); the 16 px slot is reserved either way.
 */
export default function StackLegend({ className, icons = null }) {
  return (
    <Reveal
      variants={staggerParent({ stagger: staggerFor(CONSTELLATIONS.length) })}
      className={cn("grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-5 lg:gap-6", className)}
    >
      {CONSTELLATIONS.map((c) => (
        <RevealItem key={c.key} className="min-w-0">
          <h3 className="hud-label flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ion" />
            {c.name}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {c.stars.map((s) => {
              const Icon = s.icon && icons ? icons[s.icon] : null;
              return (
                <li key={s.name} className="max-w-full">
                  <Chip className="max-w-full text-ink-2">
                    {Icon ? (
                      <Icon
                        size={16}
                        aria-hidden="true"
                        focusable="false"
                        className="shrink-0 text-ink-1/85 motion-ok:animate-fade-in"
                      />
                    ) : s.icon ? (
                      <span aria-hidden="true" className="size-4 shrink-0" />
                    ) : (
                      <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center">
                        <span className="size-1.5 rounded-full bg-ion" />
                      </span>
                    )}
                    <span className="min-w-0">{s.name}</span>
                  </Chip>
                </li>
              );
            })}
          </ul>
        </RevealItem>
      ))}
    </Reveal>
  );
}
