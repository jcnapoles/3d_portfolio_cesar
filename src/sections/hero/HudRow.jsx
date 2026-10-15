import Container from "@/components/ui/Container";
import MissionElapsed from "@/components/ui/MissionElapsed";
import LocalTime from "@/components/ui/LocalTime";

/**
 * Hero HUD row (aria-hidden), 88 px from the top of the hero.
 * >= 1024: MET (time on page) / Tarragona time / 00 LAUNCH. Below 1024: Tarragona time only.
 * A hairline tick ruler draws once under it.
 */
export default function HudRow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[88px] z-[2]">
      <Container>
        <div className="flex items-center justify-between gap-4 whitespace-nowrap font-mono text-hud-xs uppercase text-ink-3">
          <MissionElapsed className="hidden lg:inline" />
          {/* On phones the eclipse's corona reaches behind the time: hero-scrim keeps it legible. */}
          <LocalTime className="hero-scrim" />
          <span className="hidden lg:inline">
            <span className="text-ion">00</span> / LAUNCH
          </span>
        </div>
        {/* Hairline rhythm: 14 px under the readout on phones (the badge row starts at 132 px), 20 px from 1024. */}
        <div className="hero-ticks reveal-rule mt-3.5 lg:mt-5" />
      </Container>
    </div>
  );
}
