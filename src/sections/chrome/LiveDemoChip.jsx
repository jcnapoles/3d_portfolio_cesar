import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { EASE } from "@/lib/motion";
import { readSession, writeSession } from "@/lib/storage";
import { ANCHORS } from "@/constants/site";
import useMediaQuery from "@/hooks/useMediaQuery";

const SESSION_KEY = "cn:demochip";
const VISIBLE_MS = 8000;

/** Resolves `find()` now or as soon as it appears in the DOM. Returns a cleanup. */
function whenPresent(find, cb) {
  const now = find();
  if (now) {
    cb(now);
    return () => {};
  }
  const mo = new MutationObserver(() => {
    const el = find();
    if (el) {
      mo.disconnect();
      cb(el);
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  return () => mo.disconnect();
}

/**
 * "LIVE DEMO" chip (spec 6.16): desktop >= 1024 only, once per session (sessionStorage['cn:demochip']).
 * Shown after #mission-closevibe has been 50% visible; sits left of the Closevibe chat bubble.
 * Auto-hides after 8 s (the timer pauses while it is hovered or focused); a Dismiss button closes it.
 */
export default function LiveDemoChip() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  return desktop ? <DemoChip /> : null;
}

function DemoChip() {
  const [show, setShow] = useState(false);
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(VISIBLE_MS);

  useEffect(() => {
    if (readSession(SESSION_KEY) || typeof IntersectionObserver === "undefined") return undefined;
    let io;
    const stop = whenPresent(
      () => document.getElementById(ANCHORS.missions.closevibe),
      (el) => {
        io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const vh = window.innerHeight || document.documentElement.clientHeight;
              const half = entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= vh * 0.5;
              if (entry.isIntersecting && half && !readSession(SESSION_KEY)) {
                writeSession(SESSION_KEY, "1");
                remainingRef.current = VISIBLE_MS;
                setShow(true);
                io.disconnect();
                return;
              }
            }
          },
          { threshold: [0, 0.25, 0.5, 0.75, 1] }
        );
        io.observe(el);
      }
    );
    return () => {
      stop();
      io?.disconnect();
    };
  }, []);

  // Auto-hide, pausable (WCAG 2.2.1): count down only while not hovered / focused.
  useEffect(() => {
    if (!show || paused) return undefined;
    const started = performance.now();
    const id = window.setTimeout(() => setShow(false), remainingRef.current);
    return () => {
      window.clearTimeout(id);
      remainingRef.current = Math.max(1200, remainingRef.current - (performance.now() - started));
    };
  }, [show, paused]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);
  const onBlur = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
  }, []);

  return (
    <div role="status" className="pointer-events-none fixed bottom-6 right-[96px] z-sticky hidden lg:block">
      <AnimatePresence>
        {show ? (
          <m.div
            key="demo-chip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE.out } }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.24, ease: EASE.in } }}
            onPointerEnter={pause}
            onPointerLeave={resume}
            onFocus={pause}
            onBlur={onBlur}
            className="pointer-events-auto flex max-w-[380px] items-start gap-3 rounded-sm border border-line-strong bg-space-800/[.96] py-2.5 pl-3.5 pr-1.5 shadow-hi-top"
          >
            <p className="py-0.5 font-mono text-[13px] leading-[1.45] text-ink-1">
              <span className="text-ion">LIVE DEMO</span>
              <span className="text-ink-3"> · </span>
              This assistant runs on Closevibe, the AI SaaS I co-founded.
            </p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setShow(false)}
              className="-my-1 inline-flex size-8 shrink-0 items-center justify-center rounded-xs text-ink-3 transition-colors duration-ui ease-ui hover:bg-white/[.06] hover:text-ink-1"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
