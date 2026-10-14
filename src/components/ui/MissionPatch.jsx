import { useId } from "react";
import { cn } from "@/lib/cn";

const SVG_PROPS = { "aria-hidden": "true", focusable: "false", viewBox: "0 0 88 88", fill: "none" };

/**
 * Circular mission patch: code on the top arc, years on the bottom arc (mono 9 px, --text-3),
 * a mini orbit with a gold dot in the middle, 1 px --line-strong ring.
 * The text ring rotates 60 s linear (motion-ok only). Decorative (aria-hidden).
 *
 * The rotating text ring is its own <svg> inside a spinning HTML <span>, so the spin is a compositor-only transform.
 * Spinning a <g> inside the SVG re-ran SVG layout and paint on the main thread every frame (x5 cards).
 * `size` (px) sizes the root unless className sets a size-* utility; both SVGs fill it.
 * `paused` holds the ring where it is (Missions: only the active card's patch turns, like its satellite).
 */
export default function MissionPatch({ code, years, size = 88, paused = false, className }) {
  const uid = useId().replace(/:/g, "");
  const topId = `patch-top-${uid}`;
  const bottomId = `patch-bottom-${uid}`;
  const C = 44;
  const rTop = 32; // glyphs grow outward from this baseline
  const rBottom = 39; // glyphs grow inward from this baseline
  const rad = (-12 * Math.PI) / 180;
  const dot = { x: C + 18 * Math.cos(Math.PI * 0.15), y: C + 6 * Math.sin(Math.PI * 0.15) };

  return (
    <span aria-hidden="true" className={cn("relative block size-[var(--patch)] shrink-0", className)} style={{ "--patch": `${size}px` }}>
      <svg {...SVG_PROPS} className="absolute inset-0 size-full">
        <circle cx={C} cy={C} r="43.5" stroke="var(--line-strong)" strokeWidth="1" />
        <circle cx={C} cy={C} r="25" stroke="var(--line)" strokeWidth="1" />
        <g transform={`rotate(${(rad * 180) / Math.PI} ${C} ${C})`}>
          <ellipse cx={C} cy={C} rx="18" ry="6" stroke="var(--hud)" strokeWidth="1" />
          <circle cx={dot.x} cy={dot.y} r="2" fill="var(--gold)" />
        </g>
        <circle cx={C} cy={C} r="1.6" fill="var(--text)" opacity=".8" />
      </svg>
      {/* The spin sits on an HTML span: a transform change on an <svg> root still re-runs SVG layout. */}
      <span
        className="absolute inset-0 motion-ok:animate-[spin_60s_linear_infinite]"
        style={paused ? { animationPlayState: "paused" } : undefined}
      >
        <svg
          {...SVG_PROPS}
          className="absolute inset-0 size-full"
          fontFamily="'Geist Mono Variable', 'Geist Mono Fallback', ui-monospace, monospace"
          fontSize="9"
          letterSpacing="1.6"
        >
          <defs>
            <path id={topId} d={`M ${C - rTop} ${C} A ${rTop} ${rTop} 0 0 1 ${C + rTop} ${C}`} />
            <path id={bottomId} d={`M ${C - rBottom} ${C} A ${rBottom} ${rBottom} 0 0 0 ${C + rBottom} ${C}`} />
          </defs>
          <g fill="var(--text-3)">
            <text>
              <textPath href={`#${topId}`} startOffset="50%" textAnchor="middle">
                {code}
              </textPath>
            </text>
            <text>
              <textPath href={`#${bottomId}`} startOffset="50%" textAnchor="middle">
                {years}
              </textPath>
            </text>
          </g>
        </svg>
      </span>
    </span>
  );
}
