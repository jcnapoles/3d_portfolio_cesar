import { useCallback, useRef, useState } from "react";
import Eclipse from "@/components/ui/Eclipse";
import OrbitRing from "@/components/ui/OrbitRing";
import { cn } from "@/lib/cn";
import { LEADER_READOUTS } from "@/constants/hero";
import { BACK_HALF, ringBox, ringPoint, ringProps, useDiscSize } from "./orbit";

const MOON = 1.045; // moon / sun diameter (Eclipse)

// Disc (= the sun's diameter) per variant. Desktop keeps the old portrait disc's visual weight.
// exitAt: where on the hero the scroll exit completes. Desktop: 0 -> 100 % of the hero's height. Tablet and phone
// place the eclipse at the very top of a tall hero, so the exit completes earlier and plays while it is in view.
const DISC = {
  desktop: {
    css: "clamp(300px, 30vw, 440px)",
    guess: () => Math.round(Math.min(440, Math.max(300, (window.innerWidth || 1440) * 0.3))),
    exitAt: "end",
  },
  tablet: { css: "260px", guess: () => 260, exitAt: "40%" },
  compact: {
    css: "clamp(170px, 52vw, 210px)",
    guess: () => Math.round(Math.min(210, Math.max(170, (window.innerWidth || 375) * 0.52))),
    exitAt: "27%",
  },
};

/**
 * Hides the satellite where its orbit passes BEHIND the moon: the back half of the orbit plane, inside the moon's
 * disc (rest position). Outside the disc the back half stays visible, like the back ring's stroke.
 */
function moonMask(d, box) {
  const r = (MOON * d) / 2;
  const cx = d / 2 - box.left;
  const cy = d / 2 - box.top;
  return {
    maskImage: `linear-gradient(#000 0 0), radial-gradient(circle ${r}px at ${cx}px ${cy}px, #000 calc(100% - 0.5px), transparent 100%), ${BACK_HALF}`,
    maskSize: "100% 100%",
    maskRepeat: "no-repeat",
    maskComposite: "exclude, intersect",
  };
}

/** Two leader readouts anchored on the right side of the front ring (>= 1280, aria-hidden). */
function LeaderReadouts({ d }) {
  const rows = LEADER_READOUTS.map((r) => {
    const p = ringPoint(d, r.t);
    const y = r.row * d;
    return { ...r, p, y, textRight: p.x - 14 };
  });
  return (
    <div
      aria-hidden="true"
      className="hero-in-soft pointer-events-none absolute left-0 top-0 z-[3] hidden xl:block"
      style={{ width: d, height: d, "--d": "1100ms", "--dm": "600ms" }}
    >
      <svg className="absolute left-0 top-0 overflow-visible" width={d} height={d} fill="none" focusable="false">
        {rows.map((r) => (
          <g key={r.key}>
            <path d={`M ${r.p.x} ${r.p.y} V ${r.y} H ${r.textRight + 6}`} stroke="var(--hud)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={r.p.x} cy={r.p.y} r="2.5" fill="var(--void)" stroke="var(--ion)" strokeOpacity=".7" strokeWidth="1" />
          </g>
        ))}
      </svg>
      {rows.map((r) => (
        <p
          key={r.key}
          className="hero-readout absolute whitespace-nowrap rounded-xs bg-void/70 px-1.5 py-1 font-mono text-hud-xs uppercase leading-none text-ink-2"
          style={{ left: r.textRight, top: r.y, transform: "translate(-100%, -50%)" }}
        >
          <span className="text-ion">{r.tag}</span> · {r.text}
        </p>
      ))}
    </div>
  );
}

/**
 * The hero's signature: an animated total solar eclipse in orbit (replaces the portrait disc).
 * Static nebula glow -> Eclipse (corona, glare, sun, back orbit ring under the moon, moon, beads, diamond ring)
 * -> front orbit ring with the one gold satellite -> leader readouts (desktop >= 1280).
 *
 * props: variant 'desktop' | 'tablet' | 'compact'; frontRingRef (OrbitRing handle, full-stop launch target);
 * discRef (focal anchor for the Galaxy); launchPending; scrollTarget (the hero section: scroll-linked exit).
 */
export default function OrbitEclipse({ variant = "desktop", frontRingRef, discRef, launchPending = false, scrollTarget, className }) {
  const cfg = DISC[variant] || DISC.desktop;
  const rootRef = useRef(null);
  const setRoot = useCallback(
    (node) => {
      rootRef.current = node;
      if (discRef) discRef.current = node;
    },
    [discRef]
  );
  const d = useDiscSize(rootRef, typeof window === "undefined" ? 320 : cfg.guess());
  // Captured at mount: a ring re-mounted after the launch simply auto-starts.
  const [autoStart] = useState(() => !launchPending);

  const box = ringBox(d);
  const rp = ringProps(d);
  const boxStyle = { left: box.left, top: box.top, width: box.width, height: box.height };

  return (
    <div
      ref={setRoot}
      className={cn(
        "hero-orbit relative aspect-square w-[var(--disc)] shrink-0",
        variant === "desktop" && "hero-out-portrait xl:mb-[calc(var(--disc)*0.2)]",
        className
      )}
      style={{ "--disc": cfg.css }}
    >
      {/* Static nebula glow behind the eclipse. */}
      <div aria-hidden="true" data-glow className="hero-nebula pointer-events-none absolute left-1/2 top-1/2 size-[230%]" />

      <Eclipse
        size="var(--disc)"
        intro
        scrollTarget={scrollTarget}
        exitAt={cfg.exitAt}
        className="absolute inset-0"
        underMoon={
          <div aria-hidden="true" className="pointer-events-none absolute" style={boxStyle}>
            <OrbitRing {...rp} part="back" className="absolute inset-0" />
          </div>
        }
      />

      {/* Front half of the orbit + the satellite (OrbitRing's compositor-only satellite), over the moon. The mask is
          static: only the satellite's own layer moves under it. */}
      <div aria-hidden="true" className="pointer-events-none absolute z-[2]" style={{ ...boxStyle, ...moonMask(d, box) }}>
        <OrbitRing ref={frontRingRef} {...rp} part="front" satellite autoStart={autoStart} className="absolute inset-0" />
      </div>

      {variant === "desktop" ? <LeaderReadouts d={d} /> : null}
    </div>
  );
}
