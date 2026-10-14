import { useEffect, useRef, useState } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { SPRING } from "@/lib/motion";
import useMotionPreference from "@/hooks/useMotionPreference";
import usePrefersFinePointer from "@/hooks/usePrefersFinePointer";

const LOCK_SELECTOR = '[data-cursor="lock"]';
const FIELD_SELECTOR = "input, textarea, select, iframe";
const OFFSET = 6; // brackets sit 6 px outside the target
const SIZE = 10; // 10 px L-brackets

/**
 * Target-lock reticle: four fixed 10 px gold L-brackets that spring (SPRING.lock) onto the closest
 * [data-cursor="lock"] element on hover or keyboard focus (:focus-visible). The native cursor stays.
 * Active only on fine pointers with motion on (tier A or B). Hidden over form fields and iframes.
 */
export default function CursorBrackets() {
  const { reduced, tier } = useMotionPreference();
  const fine = usePrefersFinePointer();
  const active = fine && !reduced && tier !== "C";
  return active ? <Brackets /> : null;
}

function Brackets() {
  const [visible, setVisible] = useState(false);
  const targetRef = useRef(null);
  const visibleRef = useRef(false);
  const rafRef = useRef(0);

  // Targets (instant) and their springs (rendered).
  const tl = useMotionValue(0);
  const tt = useMotionValue(0);
  const tr = useMotionValue(0);
  const tb = useMotionValue(0);
  const left = useSpring(tl, SPRING.lock);
  const top = useSpring(tt, SPRING.lock);
  const right = useSpring(tr, SPRING.lock);
  const bottom = useSpring(tb, SPRING.lock);

  useEffect(() => {
    const measure = (el) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - OFFSET, t: r.top - OFFSET, r: r.right + OFFSET - SIZE, b: r.bottom + OFFSET - SIZE };
    };
    const springTo = (p) => {
      tl.set(p.l);
      tt.set(p.t);
      tr.set(p.r);
      tb.set(p.b);
    };
    const jumpTo = (p) => {
      // Jump the springs first, so the following target change finds them already at rest.
      left.jump(p.l);
      top.jump(p.t);
      right.jump(p.r);
      bottom.jump(p.b);
      springTo(p);
    };
    const show = (v) => {
      if (visibleRef.current === v) return;
      visibleRef.current = v;
      setVisible(v);
    };

    const lock = (el) => {
      const p = measure(el);
      if (!visibleRef.current || !targetRef.current) {
        // Appearing: start from a slightly wider box, then lock in.
        jumpTo({ l: p.l - 8, t: p.t - 8, r: p.r + 8, b: p.b + 8 });
        springTo(p);
      } else if (targetRef.current !== el) {
        springTo(p);
      }
      targetRef.current = el;
      show(true);
    };
    const release = () => {
      targetRef.current = null;
      show(false);
    };

    const onPointerOver = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest(FIELD_SELECTOR)) return release();
      const el = t.closest(LOCK_SELECTOR);
      if (el) lock(el);
    };
    const onPointerOut = (e) => {
      const current = targetRef.current;
      if (!current || !(e.target instanceof Node) || !current.contains(e.target)) return;
      const next = e.relatedTarget;
      if (next instanceof Element && current.contains(next) && !next.closest(FIELD_SELECTOR)) return;
      if (next instanceof Element && next.closest(LOCK_SELECTOR)) return; // pointerover will re-lock
      release();
    };
    const onFocusIn = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      let focusVisible = false;
      try {
        focusVisible = t.matches(":focus-visible");
      } catch {
        focusVisible = false;
      }
      if (!focusVisible) return;
      if (t.closest(FIELD_SELECTOR)) return release();
      const el = t.closest(LOCK_SELECTOR);
      if (el) lock(el);
    };
    const onFocusOut = (e) => {
      const current = targetRef.current;
      if (!current) return;
      const next = e.relatedTarget;
      if (next instanceof Element && current.contains(next)) return;
      release();
    };
    // Re-read the rect while locked: scroll (Lenis drives native scroll), resize, and pointer moves
    // (follows magnetic buttons). rAF-throttled.
    const follow = (instant) => {
      if (!targetRef.current || rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const el = targetRef.current;
        if (!el) return;
        if (!el.isConnected) return release();
        const p = measure(el);
        if (instant) jumpTo(p);
        else springTo(p);
      });
    };
    const onScroll = () => follow(true);
    const onResize = () => follow(true);
    const onPointerMove = () => follow(false);

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [tl, tt, tr, tb, left, top, right, bottom]);

  const corner = "absolute left-0 top-0 block size-2.5 border-gold";
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-cursor"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
    >
      <m.span className={`${corner} border-l-[1.5px] border-t-[1.5px]`} style={{ x: left, y: top }} />
      <m.span className={`${corner} border-r-[1.5px] border-t-[1.5px]`} style={{ x: right, y: top }} />
      <m.span className={`${corner} border-b-[1.5px] border-l-[1.5px]`} style={{ x: left, y: bottom }} />
      <m.span className={`${corner} border-b-[1.5px] border-r-[1.5px]`} style={{ x: right, y: bottom }} />
    </m.div>
  );
}
