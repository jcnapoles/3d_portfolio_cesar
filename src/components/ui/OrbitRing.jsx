import { forwardRef, useCallback, useId, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import useInViewport from "@/hooks/useInViewport";
import useMotionPreference from "@/hooks/useMotionPreference";
import OrbitSatellite from "@/components/ui/OrbitSatellite";

const STROKES = { hud: "var(--hud)", gold: "var(--gold)" };
const PARK_DEG = 300;
// The 6 px gold satellite and its glow (box-shadows on a static layer: rasterised once, never per frame).
const SAT_BODY = "size-1.5 -ml-[3px] -mt-[3px] rounded-full bg-gold shadow-[0_0_3px_rgba(244,184,96,.95),0_0_8px_rgba(244,184,96,.55)]";

/**
 * The orbit motif: a thin ellipse (centered, rotated) with an optional 6 px gold satellite.
 * `part` clips the stroke to the top half ('back') or bottom half ('front') in local coordinates.
 * The satellite is an OrbitSatellite (two compositor-only transform loops on HTML boxes over the SVG), not SMIL.
 * Reduced motion: the satellite is parked at 300 degrees. Pauses offscreen.
 *
 * ref -> { beginSatellite(), getStartPoint() }
 * Extra props: `paused` (hold the satellite, e.g. footer button not hovered), `strokeClassName`.
 * The visible stroke is a <path pathLength="1" class="orbit-ring-path"> so CSS can draw it in with stroke-dashoffset.
 * The root is a <span> sized width x height (className positions it), holding the SVG and the satellite.
 */
const OrbitRing = forwardRef(function OrbitRing(
  {
    width,
    height,
    rx,
    ry,
    rotate = -12,
    part = "full",
    tone = "hud",
    satellite = false,
    satelliteDuration = 14,
    autoStart = true,
    paused = false,
    className,
    strokeClassName,
  },
  ref
) {
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const [started, setStarted] = useState(autoStart);
  const [runKey, setRunKey] = useState(0);
  const { reduced } = useMotionPreference();
  const onScreen = useInViewport(rootRef, { rootMargin: "100px 0px", once: false, attr: false, initial: true });

  const uid = useId().replace(/:/g, "");
  const clipId = `orbit-clip-${uid}`;

  const cx = width / 2;
  const cy = height / 2;
  const d = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
  const pad = 4;
  const clipRect =
    part === "front"
      ? { x: cx - rx - pad, y: cy, width: rx * 2 + pad * 2, height: ry + pad }
      : part === "back"
        ? { x: cx - rx - pad, y: cy - ry - pad, width: rx * 2 + pad * 2, height: ry + pad }
        : null;

  const animated = satellite && !reduced;

  const startedRef = useRef(autoStart);
  const beginSatellite = useCallback(() => {
    // A second launch restarts the orbit from its start point (SMIL beginElement did the same).
    if (startedRef.current) setRunKey((k) => k + 1);
    startedRef.current = true;
    setStarted(true);
  }, []);

  const getStartPoint = useCallback(() => {
    const path = pathRef.current;
    if (!path) return null;
    const ctm = path.getScreenCTM();
    const p = path.getPointAtLength(0);
    if (!ctm) return { x: p.x, y: p.y };
    const pt = new DOMPoint(p.x, p.y).matrixTransform(ctm);
    return { x: pt.x, y: pt.y };
  }, []);

  useImperativeHandle(ref, () => ({ beginSatellite, getStartPoint }), [beginSatellite, getStartPoint]);

  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      className={cn("pointer-events-none relative block", className)}
      style={{ width, height }}
    >
      <svg
        focusable="false"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute left-0 top-0 overflow-visible"
        fill="none"
      >
        <g transform={`rotate(${rotate} ${cx} ${cy})`}>
          {clipRect ? (
            <defs>
              <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                <rect {...clipRect} />
              </clipPath>
            </defs>
          ) : null}
          {/* Orbit geometry (getStartPoint). */}
          <path ref={pathRef} d={d} stroke="none" fill="none" />
          {/* Visible stroke. */}
          <path
            d={d}
            pathLength="1"
            className={cn("orbit-ring-path", strokeClassName)}
            stroke={STROKES[tone] || STROKES.hud}
            strokeOpacity={tone === "gold" ? 0.7 : 1}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            clipPath={clipRect ? `url(#${clipId})` : undefined}
          />
        </g>
      </svg>
      {satellite ? (
        <OrbitSatellite
          frame={{ left: cx - rx, top: cy - ry, width: rx * 2, height: ry * 2 }}
          rotate={rotate}
          duration={satelliteDuration}
          animated={animated}
          parkDeg={PARK_DEG}
          running={animated && started && onScreen && !paused}
          hidden={animated && !started}
          runKey={runKey}
          bodyClassName={SAT_BODY}
        />
      ) : null}
    </span>
  );
});

export default OrbitRing;
