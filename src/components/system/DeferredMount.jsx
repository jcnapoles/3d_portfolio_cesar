import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

/**
 * Progressive first mount of the below-the-fold sections.
 *
 * Rendering all 13 sections before the first paint was one task of ~0.5 s on desktop and ~4 s on a 4x-throttled
 * phone, and the hero could not paint until it ended. Now the hero paints first (it fills the first viewport); the
 * rest mounts in `step` order, one group per task with a painted frame between groups, starting right after the
 * first frame. Groups only ever append below everything already on the page, so nothing visible moves (no CLS).
 *
 * Everything mounts at once (no deferral) when the page opens on a #fragment (the target must exist for the jump)
 * or on a reload / back-forward navigation (scroll restoration needs the full page height). Any pointer press, key
 * press or click while groups are still waiting releases them all (a pointer press queues the render; a key press
 * or a click that would otherwise beat it renders synchronously), so an in-page link always finds its target.
 * After the first full mount (e.g. coming back from the 2024 site) nothing is deferred again.
 *
 * Each committed group dispatches DEFERRED_EVENT on window: ChapterProvider re-collects its chapters, GsapBoot
 * arms the new headings and SmoothScrollProvider re-measures the Lenis scroll limit. sectionsMounted() tells the
 * Galaxy's frame-rate guard when the mount tasks are over.
 */
export const DEFERRED_EVENT = "cn:sections";
const LAST_STEP = 6;

let released = 0; // highest step allowed to mount
let started = false;
let lastCommitted = false; // the last group is in the DOM

/** True once every deferred group has committed (frame-rate probes should not sample while they mount). */
export const sectionsMounted = () => lastCommitted;
const waiting = new Set(); // { step, show }

// Runs `fn` in a task right after the next painted frame (rAF runs just before the paint; the task it posts runs
// after it). Hidden tabs paint nothing: a 250 ms timer takes over there, so the page still completes.
const nextFrame = (fn) => {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  const timer = setTimeout(run, 250);
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(() => {
      clearTimeout(timer);
      setTimeout(run, 0);
    });
  }
};

function mountEverythingNow() {
  if (typeof window === "undefined") return true;
  if (window.location.hash.length > 1) return true;
  try {
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    if (nav && (nav.type === "reload" || nav.type === "back_forward")) return true;
  } catch {
    /* no Navigation Timing: defer as usual */
  }
  return false;
}

// Entries stay in `waiting` until their group has committed (the effect cleanup removes them), so a synchronous
// release can re-issue an update that an earlier asynchronous release left queued.
function notify() {
  waiting.forEach((entry) => {
    if (entry.step <= released) entry.show();
  });
}

function removeInputListeners() {
  window.removeEventListener("pointerdown", onPointer, true);
  window.removeEventListener("keydown", onKey, true);
  window.removeEventListener("click", onClick, true);
}

function releaseAll(sync) {
  released = LAST_STEP;
  if (!waiting.size) return;
  if (sync) flushSync(notify);
  else notify();
}

function onPointer() {
  // A pointer press precedes its click by at least one task: the render queued here lands first.
  releaseAll(false);
}
function onKey() {
  // Enter on a link clicks it inside this keydown's task, and scroll keys scroll right after it: mount synchronously.
  releaseAll(true);
}
function onClick() {
  // Window capture runs before every other click handler (Lenis anchors, the chrome links): if a tap's click
  // arrives before the render queued at pointerdown (input outranks it), mount synchronously here.
  releaseAll(true);
}

function advance() {
  if (released >= LAST_STEP) return;
  released += 1;
  notify();
  if (released < LAST_STEP) nextFrame(advance);
}

function start() {
  if (started) return;
  started = true;
  window.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("click", onClick, true);
  nextFrame(advance);
}

if (typeof window !== "undefined" && mountEverythingNow()) released = LAST_STEP;

// A #fragment on first load: the sections are client-rendered, so the browser's own jump finds nothing (this was
// already the case before the deferral). Jump once, instantly, when the last group has mounted.
let pendingHash = typeof window !== "undefined" && window.location.hash.length > 1 ? window.location.hash.slice(1) : null;
function jumpToInitialHash() {
  if (!pendingHash) return;
  let id = pendingHash;
  pendingHash = null;
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep the raw id */
  }
  const target = document.getElementById(id);
  if (target && window.scrollY === 0) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
}

/** Renders `children` once group `step` (1..LAST_STEP) is released; null until then (no wrapper element). */
export default function DeferredMount({ step, children }) {
  const [on, setOn] = useState(() => step <= released);

  useEffect(() => {
    if (on) {
      if (released >= LAST_STEP && waiting.size === 0) {
        lastCommitted = true;
        removeInputListeners();
      }
      window.dispatchEvent(new Event(DEFERRED_EVENT));
      if (step === LAST_STEP) jumpToInitialHash();
      return undefined;
    }
    if (step <= released) {
      setOn(true);
      return undefined;
    }
    const entry = { step, show: () => setOn(true) };
    waiting.add(entry);
    start();
    return () => waiting.delete(entry);
  }, [on, step]);

  return on ? children : null;
}
