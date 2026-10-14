import { cn } from "@/lib/cn";

/**
 * A satellite on an elliptical orbit, moved by the compositor only.
 *
 * The orbit is the `frame` box (the ellipse's bounding box: 2rx x 2ry, rotated `rotate` degrees about its centre).
 * Two nested movers translate the body by +-50 % of the frame: X with a cosine, Y with a sine (the same eased
 * half-cycle, a quarter period apart; cubic-bezier(.37, 0, .63, 1) is the easeInOutSine curve). That is uniform
 * circular motion seen at an angle, like the orbit motif itself, and it is two plain transform animations on
 * HTML boxes: no SMIL, no per-frame style / layout / paint, no main-thread frames at all (an SMIL animateMotion
 * forced a style + layout + repaint of the whole masked SVG every frame).
 *
 * Start point: the left end of the ellipse (local 180 deg), travelling the bottom (front) half first, the same
 * as the SMIL paths it replaces.
 *
 * props
 * - frame: { left, top, width, height } (px numbers or CSS lengths / percentages) in the parent's box.
 * - rotate: degrees. duration: seconds per orbit. running: play state (false holds the current position).
 * - animated: false renders the body parked at `parkDeg` (reduced motion; local ellipse angle, 0 = right, 90 = bottom).
 * - hidden: keep the body invisible (e.g. before a launch hands over to it).
 * - bodyClassName / bodyStyle: the moving body, centred on the path (size it and centre it with negative margins).
 * - runKey: change it to restart the orbit from its start point.
 */
export default function OrbitSatellite({
  frame,
  rotate = 0,
  duration = 14,
  running = true,
  animated = true,
  parkDeg = 300,
  hidden = false,
  className,
  bodyClassName,
  bodyStyle,
  runKey = 0,
}) {
  const style = {
    left: frame.left,
    top: frame.top,
    width: frame.width,
    height: frame.height,
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
    "--orbit-dur": `${duration}s`,
  };

  if (!animated) {
    const a = (parkDeg * Math.PI) / 180;
    const parked = { left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%` };
    return (
      <span aria-hidden="true" className={cn("orbit-sat", className)} style={style}>
        <span className={cn("orbit-sat-body", bodyClassName)} style={{ ...bodyStyle, ...parked, opacity: hidden ? 0 : undefined }} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("orbit-sat", className)}
      style={style}
      data-orbit="run"
      data-run={running ? "true" : "false"}
    >
      <span key={runKey} className="orbit-sat-x">
        <span className="orbit-sat-y">
          <span className={cn("orbit-sat-body", bodyClassName)} style={{ ...bodyStyle, opacity: hidden ? 0 : undefined }} />
        </span>
      </span>
    </span>
  );
}
