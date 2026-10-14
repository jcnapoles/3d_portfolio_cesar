import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import useInViewport from "@/hooks/useInViewport";
import usePrefersFinePointer from "@/hooks/usePrefersFinePointer";
import { CONSTELLATIONS } from "@/constants/stack";

const W = 1200;
const H = 620;
const pct = (v, total) => `${((v / total) * 100).toFixed(4)}%`;

/**
 * Desktop sky chart (>= 1024, decorative, aria-hidden). StackLegend is the accessible version.
 * - SVG layer: 1 px --hud edges (pathLength=1, dashoffset 1 -> 0 over 900 ms, ease draw).
 * - HTML layer: stars at x/1200, y/620; constellation g starts g x 200 ms after the chart enters view,
 *   star i adds i x 60 ms (scale .9 -> 1, opacity 0 -> 1, 600 ms ease out). CSS only (stack.css),
 *   triggered by data-inview from useInViewport. Reduced motion: everything is pre-drawn.
 * - Fine pointer hover: star name tooltip, its constellation's edges turn gold, the others dim to .5.
 * - `icons` is the lazily loaded brand glyph map (useBrandIcons; null until it arrives): the 40 px disc is drawn either
 *   way, so the glyph only fades in (no layout shift).
 */
export default function SkyChart({ className, icons = null }) {
  const skyRef = useRef(null);
  useInViewport(skyRef);
  const fine = usePrefersFinePointer();
  const [active, setActive] = useState(null);
  const clear = useCallback(() => setActive(null), []);

  const stateOf = (key) => ({
    "data-on": active === key ? "true" : undefined,
    "data-dim": active && active !== key ? "true" : undefined,
  });

  return (
    <div aria-hidden="true" className={cn("panel-blueprint relative p-8 xl:p-10", className)}>
      <div ref={skyRef} className="sky relative aspect-[1200/620] w-full" onPointerLeave={fine ? clear : undefined}>
        <span className="sky-ruler sky-ruler-x" />
        <span className="sky-ruler sky-ruler-y" />

        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} fill="none" focusable="false">
          {CONSTELLATIONS.map((c, g) => (
            <g key={c.key} className="sky-edges" style={{ "--g": g }} {...stateOf(c.key)}>
              {c.edges.map(([a, b]) => (
                <path
                  key={`${a}-${b}`}
                  className="sky-edge"
                  d={`M${c.stars[a].x} ${c.stars[a].y}L${c.stars[b].x} ${c.stars[b].y}`}
                  pathLength="1"
                />
              ))}
            </g>
          ))}
        </svg>

        {CONSTELLATIONS.map((c, g) => (
          <div key={c.key} className="sky-group" style={{ "--g": g }} {...stateOf(c.key)}>
            <span className="sky-name hud-label" style={{ left: pct(c.label[0], W), top: pct(c.label[1], H) }}>
              {c.name}
            </span>
            {c.stars.map((s, i) => {
              const Icon = s.icon && icons ? icons[s.icon] : null;
              return (
                <span
                  key={s.name}
                  className={cn("sky-star", s.icon ? "sky-star--icon" : "sky-star--text")}
                  style={{ left: pct(s.x, W), top: pct(s.y, H), "--i": i }}
                  onPointerEnter={fine ? () => setActive(c.key) : undefined}
                  onPointerLeave={fine ? clear : undefined}
                >
                  {s.icon ? (
                    <>
                      <span className="grid size-10 place-items-center rounded-full border border-line bg-space-800 shadow-glow-ion">
                        {Icon ? (
                          <Icon size={22} className="text-ink-1/85 motion-ok:animate-fade-in" focusable="false" />
                        ) : null}
                      </span>
                      <span className="sky-tip">{s.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="sky-dot" />
                      <span className="sky-star-label">{s.name}</span>
                    </>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
