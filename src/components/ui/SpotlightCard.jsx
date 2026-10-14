import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import HudFrame from "@/components/ui/HudFrame";
import usePrefersFinePointer from "@/hooks/usePrefersFinePointer";

const PADDING = { md: "p-6 lg:p-8", lg: "p-8 lg:p-10" };

/**
 * Card surface (.card-k1) with a pointer-following gold spotlight (.spotlight, fine pointers only).
 * - pointermove writes --mx / --my in px (rect cached: ResizeObserver for size, re-read on enter/scroll; rAF-throttled).
 * - Lifts 2 px on hover (fine pointer, motion on). No tilt.
 * - `featured`: comet ring + border-line-strong + HudFrame corner brackets (Services tile A only).
 * - `cursorLock`: data-cursor="lock" (CursorBrackets target).
 */
const SpotlightCard = forwardRef(function SpotlightCard(
  { as: Tag = "article", featured = false, padding = "md", className, cursorLock = false, children, onPointerEnter, onPointerMove, onPointerLeave, ...rest },
  forwardedRef
) {
  const ref = useRef(null);
  const rectRef = useRef(null);
  const rafRef = useRef(0);
  const posRef = useRef({ x: 0, y: 0 });
  const fine = usePrefersFinePointer();

  const setRef = useCallback(
    (node) => {
      ref.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  // Size changes invalidate the cached rect.
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => {
      rectRef.current = null;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fine]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const invalidate = useCallback(() => {
    rectRef.current = null;
  }, []);

  const handleEnter = useCallback(
    (e) => {
      if (fine && ref.current) {
        rectRef.current = ref.current.getBoundingClientRect();
        window.addEventListener("scroll", invalidate, { passive: true });
      }
      onPointerEnter?.(e);
    },
    [fine, invalidate, onPointerEnter]
  );

  const handleMove = useCallback(
    (e) => {
      if (fine && ref.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0;
            const el = ref.current;
            if (!el) return;
            const r = rectRef.current || (rectRef.current = el.getBoundingClientRect());
            el.style.setProperty("--mx", `${Math.round(posRef.current.x - r.left)}px`);
            el.style.setProperty("--my", `${Math.round(posRef.current.y - r.top)}px`);
          });
        }
      }
      onPointerMove?.(e);
    },
    [fine, onPointerMove]
  );

  const handleLeave = useCallback(
    (e) => {
      window.removeEventListener("scroll", invalidate);
      rectRef.current = null;
      onPointerLeave?.(e);
    },
    [invalidate, onPointerLeave]
  );

  useEffect(() => () => window.removeEventListener("scroll", invalidate), [invalidate]);

  return (
    <Tag
      ref={setRef}
      className={cn(
        "card-k1 spotlight relative",
        PADDING[padding] || PADDING.md,
        "transition-transform duration-ui ease-ui motion-ok:fine:hover:-translate-y-0.5",
        featured && "border-line-strong",
        className
      )}
      data-cursor={cursorLock ? "lock" : undefined}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...rest}
    >
      {featured ? <span className="comet-ring" aria-hidden="true" /> : null}
      {featured ? <HudFrame className="!absolute inset-0 !z-[3]" /> : null}
      {children}
    </Tag>
  );
});

export default SpotlightCard;
