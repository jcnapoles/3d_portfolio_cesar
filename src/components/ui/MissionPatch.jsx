import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Circular mission patch: code on the top arc, years on the bottom arc (mono 9 px, --text-3),
 * a mini orbit with a gold dot in the middle, 1 px --line-strong ring.
 * The text ring rotates 60 s linear (motion-ok only). Decorative (aria-hidden).
 */
export default function MissionPatch({ code, years, size = 88, className }) {
  const uid = useId().replace(/:/g, "");
  const topId = `patch-top-${uid}`;
  const bottomId = `patch-bottom-${uid}`;
  const C = 44;
  const rTop = 32; // glyphs grow outward from this baseline
  const rBottom = 39; // glyphs grow inward from this baseline
  const rad = (-12 * Math.PI) / 180;
  const dot = { x: C + 18 * Math.cos(Math.PI * 0.15), y: C + 6 * Math.sin(Math.PI * 0.15) };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 88 88"
      className={cn("shrink-0", className)}
      fill="none"
    >
      <defs>
        <path id={topId} d={`M ${C - rTop} ${C} A ${rTop} ${rTop} 0 0 1 ${C + rTop} ${C}`} />
        <path id={bottomId} d={`M ${C - rBottom} ${C} A ${rBottom} ${rBottom} 0 0 0 ${C + rBottom} ${C}`} />
      </defs>
      <circle cx={C} cy={C} r="43.5" stroke="var(--line-strong)" strokeWidth="1" />
      <circle cx={C} cy={C} r="25" stroke="var(--line)" strokeWidth="1" />
      <g
        className="motion-ok:animate-[spin_60s_linear_infinite]"
        style={{ transformOrigin: `${C}px ${C}px`, transformBox: "view-box" }}
        fontFamily="'Geist Mono Variable', 'Geist Mono Fallback', ui-monospace, monospace"
        fontSize="9"
        letterSpacing="1.6"
        fill="var(--text-3)"
      >
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
      <g transform={`rotate(${(rad * 180) / Math.PI} ${C} ${C})`}>
        <ellipse cx={C} cy={C} rx="18" ry="6" stroke="var(--hud)" strokeWidth="1" />
        <circle cx={dot.x} cy={dot.y} r="2" fill="var(--gold)" />
      </g>
      <circle cx={C} cy={C} r="1.6" fill="var(--text)" opacity=".8" />
    </svg>
  );
}
