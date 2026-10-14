import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import useInViewport from "@/hooks/useInViewport";
import useMotionPreference from "@/hooks/useMotionPreference";

const STROKES = { hud: "var(--hud)", gold: "var(--gold)" };
const PARK_DEG = 300;

/**
 * The orbit motif: a thin ellipse (centered, rotated in a <g>) with an optional 6 px gold satellite on SMIL
 * <animateMotion>. `part` clips the stroke to the top half ('back') or bottom half ('front') in local coordinates.
 * Reduced motion: no animateMotion, the satellite is parked at 300 degrees. Pauses offscreen (pauseAnimations).
 *
 * ref -> { beginSatellite(), getStartPoint() }
 * Extra props: `paused` (pause the SMIL clock, e.g. footer button not hovered), `strokeClassName`.
 * The visible stroke is a <path pathLength="1" class="orbit-ring-path"> so CSS can draw it in with stroke-dashoffset.
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
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const motionRef = useRef(null);
  const [started, setStarted] = useState(autoStart);
  const { reduced } = useMotionPreference();
  const onScreen = useInViewport(svgRef, { rootMargin: "100px 0px", once: false, attr: false, initial: true });

  const uid = useId().replace(/:/g, "");
  const pathId = `orbit-path-${uid}`;
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

  const rad = (PARK_DEG * Math.PI) / 180;
  const parked = { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
  const animated = satellite && !reduced;

  // Pause/resume the SMIL clock: offscreen, explicitly paused, or reduced.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    if (!animated || !onScreen || paused) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }, [animated, onScreen, paused]);

  // Motion switched reduced -> full re-creates the <animateMotion begin="indefinite">: if the satellite was
  // already launched, start the new element too (otherwise it would sit at the SVG origin).
  useEffect(() => {
    if (!animated || autoStart || !started) return;
    const el = motionRef.current;
    if (el && typeof el.beginElement === "function") {
      try {
        el.beginElement();
      } catch {
        /* ignore */
      }
    }
    // Only on (re)creation; beginSatellite() starts it on the first launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  const beginSatellite = useCallback(() => {
    setStarted(true);
    const el = motionRef.current;
    if (el && typeof el.beginElement === "function") {
      try {
        el.beginElement();
      } catch {
        /* ignore */
      }
    }
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
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("pointer-events-none overflow-visible", className)}
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
        {/* Motion path (geometry only). */}
        <path ref={pathRef} id={pathId} d={d} stroke="none" fill="none" />
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
        {satellite ? (
          <circle
            className="orbit-satellite"
            r="3"
            cx={animated ? 0 : parked.x}
            cy={animated ? 0 : parked.y}
            fill="var(--gold)"
            opacity={animated && !started ? 0 : 1}
            style={{ filter: "drop-shadow(0 0 3px rgba(244,184,96,.95)) drop-shadow(0 0 8px rgba(244,184,96,.55))" }}
          >
            {animated ? (
              <animateMotion
                ref={motionRef}
                dur={`${satelliteDuration}s`}
                repeatCount="indefinite"
                begin={autoStart ? "0s" : "indefinite"}
                rotate="0"
              >
                <mpath href={`#${pathId}`} />
              </animateMotion>
            ) : null}
          </circle>
        ) : null}
      </g>
    </svg>
  );
});

export default OrbitRing;
