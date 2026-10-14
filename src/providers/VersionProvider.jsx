import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { readLocal, readSession, writeLocal } from "@/lib/storage";
import { gsapReady } from "@/lib/gsap";
import { VersionContext } from "@/providers/versionContext";
import { LegacyNotice, LegacyReturnPill } from "@/components/system/VersionSwitch";
import "@/components/system/VersionSwitch.css";

const STORAGE_KEY = "cn:version";
const PARAM = "v";
const ANNOUNCE = {
  legacy: "Now showing the 2024 version of the site.",
  new: "Now showing the 2026 version of the site.",
  failed: "The 2024 version could not be loaded. Check your connection and try again.",
};

const isVersion = (v) => v === "new" || v === "legacy";

/* ---------- Lazy chunks ---------- */
// The 2024 site (src/legacy: three / r3f / drei …) and the warp engine load only when a switch starts (or on a
// direct ?v=legacy entry). Both promises are cached; a failed load is forgotten so the next attempt retries.
// This is React.lazy without Suspense: the switch awaits the module first, so the View Transition never
// captures a fallback as its "new" state.
let legacyModule = null;
let legacyPromise = null;
let warpModule = null;
let warpPromise = null;

export function loadLegacy() {
  if (legacyModule) return Promise.resolve(legacyModule);
  legacyPromise ||= import("@/legacy/LegacyApp").then(
    (mod) => (legacyModule = mod),
    (error) => {
      legacyPromise = null;
      throw error;
    }
  );
  return legacyPromise;
}

function loadWarp() {
  if (warpModule) return Promise.resolve(warpModule);
  warpPromise ||= import("@/components/system/VersionSwitchWarp").then(
    (mod) => (warpModule = mod),
    (error) => {
      warpPromise = null;
      throw error;
    }
  );
  return warpPromise;
}

/* ---------- State <-> URL / storage ---------- */
function readUrlVersion() {
  try {
    const v = new URLSearchParams(window.location.search).get(PARAM);
    return isVersion(v) ? v : null;
  } catch {
    return null;
  }
}

const initialVersion = () => readUrlVersion() || (isVersion(readLocal(STORAGE_KEY)) ? readLocal(STORAGE_KEY) : "new");

/** ?v=legacy while the 2024 site is shown; the 2026 site keeps the clean URL. */
function syncUrl(version, stripHash) {
  try {
    const url = new URL(window.location.href);
    if (version === "legacy") url.searchParams.set(PARAM, "legacy");
    else url.searchParams.delete(PARAM);
    if (stripHash) url.hash = "";
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url.href);
  } catch {
    /* ignore */
  }
}

function resetScroll() {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.style.scrollBehavior = previous;
}

/* ---------- 2024 stage ---------- */
class LegacyBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  render() {
    return this.state.crashed ? <LegacyNotice state="crashed" /> : this.props.children;
  }
}

function LegacyStage() {
  const [mod, setMod] = useState(() => legacyModule);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Direct entry on the 2024 site (?v=legacy or a stored choice): load the chunk behind a notice, never a blank page.
  useEffect(() => {
    if (mod) return undefined;
    let alive = true;
    setFailed(false);
    loadLegacy().then(
      (m) => alive && setMod(m),
      () => alive && setFailed(true)
    );
    return () => {
      alive = false;
    };
  }, [mod, attempt]);

  if (!mod) return <LegacyNotice state={failed ? "failed" : "loading"} onRetry={() => setAttempt((n) => n + 1)} />;
  const Legacy = mod.default;
  return (
    <LegacyBoundary>
      <Legacy />
    </LegacyBoundary>
  );
}

/**
 * Owns which era is on screen ('new' 2026 | 'legacy' 2024) and the switch between them.
 * - Initial version: ?v= (legacy | new) beats localStorage['cn:version'], default 'new'. Kept in sync with
 *   history.replaceState (?v=legacy while the 2024 site is shown) and persisted on every switch.
 * - The 2026 app (`NewSite` with its providers: Lenis, chapters, GSAP, Galaxy) is unmounted while the 2024 site is
 *   shown and mounts fresh on the way back. Scroll goes to the top on every switch; focus moves to the new
 *   version's root and a polite live region announces it.
 * - The transition itself (View Transitions warp, curtain fallback, reduced-motion crossfade) is runWarp() in the
 *   lazy VersionSwitchWarp chunk. If that chunk cannot load, the switch still happens, instantly.
 */
export default function VersionProvider({ NewSite }) {
  const [version, setVersion] = useState(initialVersion);
  const [status, setStatus] = useState("idle");
  const [warp, setWarp] = useState(null);
  const [fade, setFade] = useState(false);
  const [message, setMessage] = useState("");

  const versionRef = useRef(version);
  versionRef.current = version;
  const runRef = useRef(0);
  const rootRef = useRef(null);
  const timersRef = useRef(new Set());

  const later = useCallback((fn, ms) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
  }, []);
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.clear();
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // The reduced-motion fade-in class is dropped once it has played.
  useEffect(() => {
    if (!fade) return undefined;
    const id = window.setTimeout(() => setFade(false), 260);
    return () => window.clearTimeout(id);
  }, [fade]);

  // Re-set (not just set) the live region text so a repeated message is announced again.
  const announceTimer = useRef(0);
  const announce = useCallback((text) => {
    setMessage("");
    window.clearTimeout(announceTimer.current);
    announceTimer.current = window.setTimeout(() => setMessage(text), 80);
  }, []);
  useEffect(() => () => window.clearTimeout(announceTimer.current), []);

  // html[data-version] scopes the 2024 CSS (legacy.css) to the time the 2024 site is mounted.
  useLayoutEffect(() => {
    document.documentElement.dataset.version = version;
  }, [version]);

  // First load: reflect the resolved version in the URL; an explicit ?v= is remembered.
  useEffect(() => {
    if (readUrlVersion()) writeLocal(STORAGE_KEY, versionRef.current);
    syncUrl(versionRef.current, false);
  }, []);

  const preload = useCallback(() => {
    loadLegacy().catch(() => undefined);
    loadWarp().catch(() => undefined);
  }, []);

  const run = useCallback(
    (id, target, origin) => {
      const html = document.documentElement;
      let swapped = false;

      // Swaps the version synchronously (inside the View Transition callback, or under the curtain).
      const commit = ({ warp: overlay = null, fadeIn = false } = {}) => {
        if (swapped) return;
        swapped = true;
        resetScroll();
        html.dataset.version = target;
        // Mirrors a reload: once the first-visit launch played in this session, the 2026 site returns as a repeat visit.
        if (target === "new" && readSession("cn:launched")) html.dataset.visit = "repeat";
        flushSync(() => {
          setVersion(target);
          if (overlay) setWarp(overlay);
          if (fadeIn) setFade(true);
        });
        resetScroll();
        writeLocal(STORAGE_KEY, target);
        syncUrl(target, true);
        if (target === "legacy") {
          // What the unmounted 2026 app may leave behind. Lenis.destroy() removes its classes; belt and braces.
          Array.from(html.classList).forEach((c) => (c === "lenis" || c.startsWith("lenis-")) && html.classList.remove(c));
          html.style.removeProperty("overflow");
          delete document.body.dataset.chapter;
          // H2 reveals (initHeadingReveals) live outside any gsap.context: drop the ones whose node is gone.
          gsapReady
            .then(({ ScrollTrigger }) => ScrollTrigger.getAll().forEach((st) => st.trigger?.isConnected === false && st.kill()))
            .catch(() => undefined);
        }
      };

      const finish = () => {
        if (runRef.current !== id) return;
        runRef.current = 0;
        clearTimers();
        if (!swapped) commit(); // a stalled or skipped transition still lands on the target
        delete html.dataset.warp;
        setWarp(null);
        setStatus("idle");
        window.requestAnimationFrame(() => rootRef.current?.focus({ preventScroll: true }));
        announce(ANNOUNCE[target]);
      };

      try {
        if (!warpModule) throw new Error("no warp");
        warpModule.runWarp({ target, origin, commit, showWarp: setWarp, later, finish });
      } catch {
        finish();
      }
    },
    [announce, clearTimers, later]
  );

  const switchTo = useCallback(
    async (target, origin) => {
      if (!isVersion(target) || runRef.current || target === versionRef.current) return;
      const id = (runRef.current = performance.now() + 1);
      setStatus("loading");
      try {
        await Promise.all([
          target === "legacy" ? loadLegacy().then((m) => m.prepare?.()) : null,
          loadWarp().catch(() => null), // optional: without it the switch is instant
        ]);
      } catch {
        if (runRef.current === id) runRef.current = 0;
        setStatus("error");
        announce(ANNOUNCE.failed);
        return;
      }
      if (runRef.current !== id) return;
      setStatus("warping");
      run(id, target, origin);
    },
    [announce, run]
  );

  const value = useMemo(() => ({ version, status, switchTo, preload }), [version, status, switchTo, preload]);
  const Warp = warpModule?.default;

  return (
    <VersionContext.Provider value={value}>
      <div key={version} ref={rootRef} tabIndex={-1} data-version-root={version} className={fade ? "cn-version-fade" : undefined}>
        {version === "legacy" ? <LegacyStage /> : <NewSite />}
      </div>
      {version === "legacy" ? <LegacyReturnPill /> : null}
      {warp && Warp ? <Warp {...warp} /> : null}
      <p role="status" data-version-live="" className="sr-only">
        {message}
      </p>
    </VersionContext.Provider>
  );
}
