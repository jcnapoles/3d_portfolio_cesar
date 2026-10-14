import { cn } from "@/lib/cn";
import { originFrom, useVersion } from "@/providers/versionContext";

/** 'loading' while the 2024 chunk is fetched or the warp runs, 'error' after a failed fetch, else 'idle'. */
const stateOf = (status) => (status === "loading" || status === "warping" ? "loading" : status === "error" ? "error" : "idle");

/**
 * Era glyph: a half moon inside a thin orbit with one satellite. Hover / focus turns the moon over; the orbit
 * spins while the target era loads (VersionSwitch.css, motion-ok only). Decorative.
 */
export function EraIcon({ size = 20, tone = "ink", className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 overflow-visible", className)}
    >
      <g className="cn-era-orbit">
        <ellipse
          cx="10"
          cy="10"
          rx="8.6"
          ry="3.3"
          transform="rotate(-24 10 10)"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".45"
          strokeWidth="1"
        />
        <circle cx="17.86" cy="6.5" r="1.25" fill={tone === "gold" ? "var(--gold)" : "currentColor"} />
      </g>
      <g className="cn-era-moon">
        <circle cx="10" cy="10" r="4.4" fill="var(--space-900)" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10 5.6a4.4 4.4 0 0 0 0 8.8z" fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * 2026 site, >= 1024 px: a vertical edge tab on the left, mirroring the chapter rail on the right. It is 36 px wide,
 * inside the container's 40 px gutter, so it never covers content. Hover / keyboard focus slides out a
 * "View the 2024 site" label. Below 1024 the switch lives in the mobile menu and the footer (VersionSwitchLink).
 */
export function VersionPill() {
  const { status, switchTo, preload } = useVersion();
  const state = stateOf(status);
  const text = state === "loading" ? "Loading 2024" : state === "error" ? "Retry 2024" : "2024 version";

  return (
    <div className="pointer-events-none fixed left-0 top-1/2 z-rail hidden -translate-y-1/2 lg:block">
      <button
        type="button"
        data-state={state}
        aria-label={state === "idle" ? "View the 2024 site (2024 version)" : undefined}
        aria-busy={state === "loading" || undefined}
        onPointerDown={preload}
        onClick={(e) => switchTo("legacy", originFrom(e))}
        className={cn(
          "cn-era-tab cn-era-trigger pointer-events-auto relative flex w-9 flex-col items-center gap-3 rounded-r-md",
          "border border-l-0 border-line-strong bg-space-900/[.92] py-4 text-ink-2 shadow-hi-top",
          "transition-colors duration-ui ease-ui hover:border-ink-3 hover:text-ink-1 focus-visible:text-ink-1",
          state === "error" && "text-danger hover:text-danger"
        )}
      >
        <EraIcon size={18} />
        <span className="cn-era-tab-text font-mono text-hud-xs uppercase">{text}</span>
        {state === "idle" ? (
          <span aria-hidden="true" className="cn-era-tip text-small font-medium text-ink-1">
            View the 2024 site
          </span>
        ) : null}
      </button>
    </div>
  );
}

/** Text-style entry for the mobile menu and the footer ("View the 2024 version"). Styling comes from the host. */
export function VersionSwitchLink({ className, iconSize = 16 }) {
  const { status, switchTo, preload } = useVersion();
  const state = stateOf(status);
  return (
    <button
      type="button"
      data-state={state}
      aria-busy={state === "loading" || undefined}
      onPointerDown={preload}
      onClick={(e) => switchTo("legacy", originFrom(e))}
      className={cn("cn-era-trigger text-left", className)}
    >
      <EraIcon size={iconSize} />
      <span>
        {state === "loading"
          ? "Loading the 2024 version…"
          : state === "error"
            ? "Retry the 2024 version"
            : "View the 2024 version"}
      </span>
    </button>
  );
}

/** 2024 site, every width: gold pill bottom-left that warps back to the 2026 site. */
export function LegacyReturnPill() {
  const { status, switchTo } = useVersion();
  const state = stateOf(status);
  return (
    // < 640: compact label ("Back to 2026"; its accessible name "Back to 2026 site" still contains it) and 12 px from
    // the bottom, so it clears the 2024 hero's rocket at 375 px.
    <div className="pointer-events-none fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-4 z-sticky sm:bottom-6 sm:left-6">
      <button
        type="button"
        data-state={state}
        aria-busy={state === "loading" || undefined}
        onClick={(e) => switchTo("new", originFrom(e))}
        className={cn(
          "cn-era-return cn-era-trigger pointer-events-auto inline-flex h-11 items-center gap-2.5 rounded-pill border border-gold/50",
          "bg-space-900/[.9] pl-2.5 pr-4 font-sans text-small font-semibold text-gold-hot",
          "shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_10px_36px_-14px_rgba(244,184,96,.55)]",
          "transition-colors duration-ui ease-ui hover:border-gold hover:bg-space-800"
        )}
      >
        <EraIcon tone="gold" />
        <span>
          Back to <span className="max-sm:hidden">the </span>2026<span className="max-sm:sr-only"> site</span>
        </span>
      </button>
    </div>
  );
}

/**
 * What the 2024 stage shows while its chunk loads on a direct entry (?v=legacy / stored choice), or if it fails.
 * The page is never blank, and the return pill stays available above it.
 */
export function LegacyNotice({ state = "loading", onRetry }) {
  const loading = state === "loading";
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-5 bg-[#121212] px-6 pb-24 text-center">
      {loading ? (
        <div role="status" data-state="loading" className="cn-era-trigger flex flex-col items-center gap-4 text-ink-2">
          <EraIcon size={32} />
          <p className="font-mono text-hud uppercase">Loading the 2024 site</p>
        </div>
      ) : (
        <div role="alert" className="flex max-w-[40ch] flex-col items-center gap-4">
          <p className="text-lead text-ink-1">The 2024 site could not be shown on this device.</p>
          {state === "failed" && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center rounded-pill border border-line-strong px-5 text-small font-medium text-ink-1 hover:border-ink-3"
            >
              Try again
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
