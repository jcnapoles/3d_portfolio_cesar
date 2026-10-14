import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { readSession, writeSession } from "@/lib/storage";
import useMotionPreference from "@/hooks/useMotionPreference";
import useIdleMount from "@/hooks/useIdleMount";
import useInViewport from "@/hooks/useInViewport";
import useLenisScroll from "@/hooks/useLenisScroll";
import { GALAXY } from "@/constants/hero";

const Galaxy = lazy(() => import("./galaxy/Galaxy"));

// FPS guard levels: 0 = tier defaults, 1 = dpr 1, 2 = + 3 layers, 3 = + density .5, 4 = off (CSS stars remain).
const OFF = 4;
const LEVEL_KEY = "cn:galaxy-level";
const SAMPLE_FRAMES = 90;
const MIN_FPS = 50;

const readLevel = () => {
  const n = Number.parseInt(readSession(LEVEL_KEY) ?? "", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), OFF) : 0;
};

const configFor = (tierA, level) => {
  const deviceDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const c = { dpr: Math.min(deviceDpr, tierA ? 1.5 : 1), layers: tierA ? 4 : 3, density: tierA ? 0.8 : 0.6 };
  if (level >= 1) c.dpr = 1;
  if (level >= 2) c.layers = Math.min(c.layers, 3);
  if (level >= 3) c.density = Math.min(c.density, 0.5);
  return c;
};
const sameConfig = (a, b) => a.dpr === b.dpr && a.layers === b.layers && a.density === b.density;
/** Next level that actually changes something (tier B already runs at dpr 1 / 3 layers). */
const nextLevel = (tierA, level) => {
  let n = level + 1;
  while (n < OFF && sameConfig(configFor(tierA, n), configFor(tierA, level))) n += 1;
  return Math.min(n, OFF);
};

const sameFocal = (a, b) => a && b && Math.abs(a[0] - b[0]) < 0.002 && Math.abs(a[1] - b[1]) < 0.002;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Hero-only WebGL galaxy behind the content (spec 6.2).
 * - Tier C at mount: renders nothing (the CSS star tiles are already there).
 * - Otherwise mounts on idle after load, lazy-loads the Galaxy chunk and crossfades it in once the first frame is drawn.
 * - Scroll is thrust (tier A, hero in view): Lenis velocity boosts star speed and sets the travel direction.
 * - FPS guard: steps quality down (never up) while the average frame rate stays under 50 fps; finally fades it out.
 * - Motion switched off at runtime: the Galaxy pauses on its current static frame.
 * `anchorRef` (optional): the eclipse disc, so the warp radiates from behind it (tier A).
 */
export default function GalaxyStage({ anchorRef }) {
  const { tier, tierBase, reduced, firstVisit } = useMotionPreference();
  const tierA = tierBase === "A";
  const stageRef = useRef(null);
  const controls = useRef(null);

  const [level, setLevel] = useState(readLevel);
  const [everOn, setEverOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [fading, setFading] = useState(false);
  const [focal, setFocal] = useState(() => GALAXY.focal[tierA ? "A" : "B"]);

  const idle = useIdleMount({ timeout: tier === "A" ? 1200 : 2500 });
  const inView = useInViewport(stageRef, { rootMargin: "0px", once: false, attr: false, initial: true });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  // Tier C (reduced or no WebGL2 / save-data) decides at mount. Once mounted it stays and pauses instead.
  const eligible = tierBase !== "C" && (tier !== "C" || everOn);
  const show = eligible && idle && level < OFF;
  useEffect(() => {
    if (show) setEverOn(true);
  }, [show]);

  const config = useMemo(() => configFor(tierA, level), [tierA, level]);
  const introSeconds = tierA ? 1.6 : 1.0;

  const onReady = useCallback(() => setReady(true), []);

  // Runtime motion switch: freeze on the current frame (no reload, no unmount).
  useEffect(() => {
    if (ready) controls.current?.setPaused(reduced);
  }, [reduced, ready]);

  // Focal point: the eclipse disc center (tier A), else the spec fallbacks.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const compute = () => {
      let next = GALAXY.focal[tierA ? "A" : "B"];
      const anchor = anchorRef?.current;
      if (tierA && anchor && anchor.isConnected) {
        const s = stage.getBoundingClientRect();
        const a = anchor.getBoundingClientRect();
        if (s.width > 0 && s.height > 0 && a.width > 0) {
          next = [
            clamp01((a.left + a.width / 2 - s.left) / s.width),
            clamp01(1 - (a.top + a.height / 2 - s.top) / s.height),
          ];
        }
      }
      setFocal((prev) => (sameFocal(prev, next) ? prev : next));
    };
    compute();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(compute);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [anchorRef, tierA, show]);

  // Scroll is thrust (tier A only, while the hero is in view). Direction relaxes to forward 600 ms after the last event.
  const dirTimer = useRef(0);
  useLenisScroll(({ velocity }) => {
    const c = controls.current;
    if (!c || tier !== "A" || !inViewRef.current) return;
    const v = Number(velocity) || 0;
    c.setBoost(Math.min(Math.abs(v) * 0.015, 0.6));
    c.setDirection(v < 0 ? -1 : 1);
    window.clearTimeout(dirTimer.current);
    dirTimer.current = window.setTimeout(() => controls.current?.setDirection(1), 600);
  });
  useEffect(() => () => window.clearTimeout(dirTimer.current), []);

  // FPS guard (tiers A and B): 500 ms after the intro, average 90 rAF deltas; under 50 fps step down and resample.
  const levelRef = useRef(level);
  levelRef.current = level;
  const sampledOnce = useRef(false);
  const settled = useRef(false);
  const fadeTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  useEffect(() => {
    if (!ready || reduced || fading || level >= OFF || !inView || settled.current) return undefined;
    const delay = (sampledOnce.current || !firstVisit ? 0 : introSeconds * 1000) + 500;
    const deltas = [];
    let raf = 0;
    let last = 0;

    const stepDown = () => {
      const n = nextLevel(tierA, levelRef.current);
      writeSession(LEVEL_KEY, String(n));
      if (n >= OFF) {
        setFading(true);
        fadeTimer.current = window.setTimeout(() => setLevel(OFF), 800);
      } else {
        setLevel(n);
      }
    };

    const tick = (now) => {
      if (last) {
        const d = now - last;
        if (d > 250) deltas.length = 0; // tab switch or a stall: restart the window
        else deltas.push(d);
      }
      last = now;
      if (deltas.length >= SAMPLE_FRAMES) {
        sampledOnce.current = true;
        const avg = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
        if (avg > 1000 / MIN_FPS) stepDown();
        else settled.current = true;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [ready, reduced, fading, level, inView, firstVisit, introSeconds, tierA]);

  return (
    <div ref={stageRef} aria-hidden="true" className="hero-galaxy pointer-events-none absolute inset-0">
      {show ? (
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-[800ms] ease-out",
            ready && !fading && "opacity-100"
          )}
        >
          <Suspense fallback={null}>
            <Galaxy
              controlsRef={controls}
              onReady={onReady}
              transparent
              focal={focal}
              starColors={GALAXY.starColors}
              density={config.density}
              layers={config.layers}
              starSize={1}
              flareIntensity={0.6}
              glowIntensity={0.25}
              twinkleIntensity={0.25}
              starSpeed={0.3}
              speed={0.6}
              rotationSpeed={0.03}
              mouseInteraction={tierA}
              mouseRepulsion={tierA}
              repulsionStrength={1.2}
              autoCenterRepulsion={0}
              clickWarp={tierA}
              intro={firstVisit}
              introSeconds={introSeconds}
              dpr={config.dpr}
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
