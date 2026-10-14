import { cn } from "@/lib/cn";

/** HUD readout: label (hud-xs, ink-3) + mono tabular value. aria-hidden by default (decorative telemetry). */
export default function Readout({ label, children, className, "aria-hidden": ariaHidden = true, ...rest }) {
  return (
    <span aria-hidden={ariaHidden ? "true" : undefined} className={cn("inline-flex items-baseline gap-2", className)} {...rest}>
      {label ? <span className="font-mono text-hud-xs uppercase text-ink-3">{label}</span> : null}
      <span className="font-mono tabular text-ink-1">{children}</span>
    </span>
  );
}
