import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { closevibeMark } from "@/assets/media";
import useMotionPreference from "@/hooks/useMotionPreference";

// Spec 6.5, tile D. viewBox 320 x 160.
const TRAJECTORY = "M 20 140 C 120 140, 180 30, 300 30";
const APEX = { x: 300, y: 30 };
const CYCLE = 6; // s: 0-4.2 s climb (eased), 4.2-6 s hold at the apex
const SPLINES = "0.65 0 0.35 1;0 0 1 1";
// The satellite fades in on the pad (0-0.18 s); satellite and flown path fade out at the apex (5.58-6 s) so the
// restart never snaps.
const FADE_TIMES = "0;0.03;0.93;1";
// Rest position: in orbit (apex hold), fully visible, path drawn: the same picture as reduced motion (M-2).
// Parking at 4.8 s also makes a 6 s burst end at 10.8 s = 4.8 s into the next cycle, i.e. back in orbit:
// the burst reads "fade out, relaunch from the pad, climb, settle in orbit".
const PARK = 4.8;
const HOLD_FROM = 4.3; // settle window: at the apex and fully visible
const HOLD_TO = 5.5;

/**
 * D. LaunchTrajectory: the Closevibe mark climbs from the pad into the target orbit while the flown trajectory draws
 * behind it (all SMIL, one clock: the svg's). Paused with svg.pauseAnimations(), parked in orbit until activated;
 * when `active` turns false it settles in orbit (apex hold window) before pausing.
 * Reduced motion: no SMIL, satellite parked at the apex and the trajectory fully drawn.
 */
export default function LaunchTrajectory({ active = false }) {
  const { reduced } = useMotionPreference();
  const animated = !reduced;
  const svgRef = useRef(null);
  const uid = useId().replace(/:/g, "");
  const pathId = `svc-traj-${uid}`;
  const glowId = `svc-sat-glow-${uid}`;

  // Park in orbit, paused, whenever the animated tree mounts.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!animated || !svg || typeof svg.pauseAnimations !== "function") return;
    svg.pauseAnimations();
    try {
      svg.setCurrentTime(PARK);
    } catch {
      /* ignore */
    }
  }, [animated]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!animated || !svg || typeof svg.pauseAnimations !== "function") return undefined;
    if (active) {
      svg.unpauseAnimations();
      return undefined;
    }
    if (svg.animationsPaused()) return undefined;
    let timer = 0;
    const settle = () => {
      const t = svg.getCurrentTime() % CYCLE;
      if (t >= HOLD_FROM && t <= HOLD_TO) {
        svg.pauseAnimations();
        return;
      }
      timer = window.setTimeout(settle, (((HOLD_FROM + 0.05 - t + CYCLE) % CYCLE) * 1000) | 0);
    };
    settle();
    return () => window.clearTimeout(timer);
  }, [active, animated]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 160"
      className="svc-vis block h-auto w-full overflow-visible"
      data-active={active ? "true" : "false"}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="var(--ion)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--ion)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground and pad */}
      <path d="M 0 140 H 320" stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path d="M 14 140 H 26 M 20 140 V 134" stroke="var(--hud)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

      {/* Planned trajectory (dotted guide) and the flown trajectory (draws with the satellite) */}
      <path id={pathId} d={TRAJECTORY} stroke="var(--hud-dim)" strokeWidth="1" strokeDasharray="2 4" />
      {/* No vector-effect here: non-scaling-stroke would dash in screen space and break pathLength. */}
      <path
        d={TRAJECTORY}
        pathLength="1"
        stroke="var(--hud)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={animated ? 1 : 0}
      >
        {animated ? (
          <>
            <animate
              attributeName="stroke-dashoffset"
              values="1;0;0"
              keyTimes="0;0.7;1"
              calcMode="spline"
              keySplines={SPLINES}
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
            />
            <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.93;1" dur={`${CYCLE}s`} repeatCount="indefinite" />
          </>
        ) : null}
      </path>

      {/* Target orbit */}
      <ellipse cx={APEX.x} cy={APEX.y} rx="18" ry="6" stroke="var(--hud)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

      {/* Satellite: the Closevibe mark */}
      <g transform={animated ? undefined : `translate(${APEX.x} ${APEX.y})`}>
        {animated ? (
          <>
            <animateMotion
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.7;1"
              calcMode="spline"
              keySplines={SPLINES}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes={FADE_TIMES} dur={`${CYCLE}s`} repeatCount="indefinite" />
          </>
        ) : null}
        <circle r="16" fill={`url(#${glowId})`} data-glow />
        <image href={closevibeMark} x="-10" y="-10" width="20" height="20" />
      </g>
    </svg>
  );
}
