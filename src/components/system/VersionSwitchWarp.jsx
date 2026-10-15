import "@/components/system/VersionSwitchWarp.css";

/*
 * The "time warp" between the 2026 and 2024 sites. A lazy chunk: VersionProvider imports it together with the
 * 2024 chunk when a switch starts (every switch needs that chunk anyway), so none of this sits in the entry.
 */

const WARP_MS = 850; // keep in sync with the 850 ms VT timeline in VersionSwitchWarp.css
const WARP_EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const COVER_MS = 560;
const REVEAL_MS = 600;
const FADE_MS = 200;

const YEARS = {
  legacy: ["2026", "2025", "2024"],
  new: ["2024", "2025", "2026"],
};

/** Same inputs as the 2026 site's MotionPreferenceProvider: the explicit Motion toggle first, then the OS. */
function prefersReducedMotion() {
  let pref = null;
  try {
    pref = window.localStorage.getItem("cn:motion");
  } catch {
    pref = null;
  }
  if (pref === "reduced") return true;
  if (pref === "full") return false;
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

/**
 * Runs one switch. VersionProvider owns state and passes:
 * - commit({ warp, fadeIn }): swaps the version synchronously (flushSync); idempotent.
 * - showWarp(stateOrUpdater): sets the overlay state (fallback phases).
 * - later(fn, ms): a timer cleared by finish(). finish(): idempotent end (lands on the target if not swapped yet).
 * Paths:
 * - reduced motion: a 200 ms crossfade (View Transition default fade), or an instant swap + 200 ms fade-in;
 * - View Transitions: the new era is revealed by a clip-path circle growing from the click point
 *   (850 ms, cubic-bezier(.76,0,.24,1)) while the old one scales to .96 and dims; the overlay peaks mid-way;
 * - no View Transitions: a void curtain grows from the click point, the swap happens under it, then it irises open.
 * Every path is time-guarded: the overlay can never stay up and the page always lands on the target.
 */
export function runWarp({ target, origin, commit, showWarp, later, finish }) {
  const html = document.documentElement;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = Math.round(Math.min(Math.max(origin?.x ?? vw / 2, 0), vw));
  const y = Math.round(Math.min(Math.max(origin?.y ?? vh / 2, 0), vh));
  const r = Math.ceil(Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y))) + 2;
  const reduced = prefersReducedMotion();
  const canVT = typeof document.startViewTransition === "function" && document.visibilityState !== "hidden";

  const viewTransition = (mode, update, guardMs) => {
    html.dataset.warp = mode;
    const vt = document.startViewTransition(update);
    vt.finished.then(finish, finish);
    later(() => {
      try {
        vt.skipTransition();
      } catch {
        /* ignore */
      }
      finish();
    }, guardMs);
    return vt;
  };

  if (reduced) {
    if (canVT) {
      try {
        viewTransition("fade", () => commit(), FADE_MS + 1500);
        return;
      } catch {
        delete html.dataset.warp;
      }
    }
    commit({ fadeIn: true });
    finish();
    return;
  }

  if (canVT) {
    try {
      // Guard: generous, because capturing a heavy page (the 2024 WebGL scenes) can take a while on slow devices;
      // if it ever fires, the transition is skipped and the page simply lands on the target.
      const vt = viewTransition("vt", () => commit({ warp: { target, x, y, r, phase: "vt" } }), WARP_MS + 4000);
      vt.ready
        .then(() => {
          const timing = { duration: WARP_MS, easing: WARP_EASE };
          const at = `${x}px ${y}px`;
          html.animate(
            { clipPath: [`circle(0px at ${at})`, `circle(${r}px at ${at})`] },
            { ...timing, pseudoElement: "::view-transition-new(root)" }
          );
          html.animate(
            { transform: ["scale(1)", "scale(0.96)"], opacity: [1, 0.35], transformOrigin: [at, at] },
            { ...timing, pseudoElement: "::view-transition-old(root)" }
          );
        })
        .catch(() => undefined);
      return;
    } catch {
      delete html.dataset.warp;
    }
  }

  showWarp({ target, x, y, r, phase: "cover" });
  later(() => {
    commit();
    showWarp((w) => (w ? { ...w, phase: "reveal" } : w));
    later(finish, REVEAL_MS + 40);
  }, COVER_MS + 40);
  later(finish, COVER_MS + REVEAL_MS + 2500);
}

/**
 * The warp overlay (styles in VersionSwitchWarp.css). Decorative (aria-hidden): VersionProvider announces the switch.
 * phase 'vt': rendered into the View Transition's new state with its own view-transition-name, so its live snapshot
 *   (playing the CSS animation) sits above both eras.
 * phase 'cover' / 'reveal': the no-View-Transitions curtain.
 */
export default function VersionSwitchWarp({ target, x, y, r, phase }) {
  const to = target === "legacy" ? "legacy" : "new";
  return (
    <div
      className="cn-warp"
      data-phase={phase}
      data-to={to}
      aria-hidden="true"
      style={{ "--wx": `${x}px`, "--wy": `${y}px`, "--wr": `${r}px` }}
    >
      <div className="cn-warp-curtain" />
      <div className="cn-warp-tunnel" />
      <div className="cn-warp-streaks cn-warp-streaks-a" />
      <div className="cn-warp-streaks cn-warp-streaks-b" />
      <div className="cn-warp-flash" />
      <div className="cn-warp-label">
        <span className="cn-warp-kicker">{to === "legacy" ? "Warping to" : "Returning to"}</span>
        <span className="cn-warp-year">
          <span className="cn-warp-years">
            {YEARS[to].map((year) => (
              <span key={year}>{year}</span>
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
