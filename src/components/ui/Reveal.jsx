import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { m } from "motion/react";
import { fadeUp, VIEWPORT } from "@/lib/motion";
import useMotionPreference from "@/hooks/useMotionPreference";
import useMediaQuery from "@/hooks/useMediaQuery";

// The trigger line: the element's top 6 % inside the viewport (VIEWPORT.margin in lib/motion.js), or anywhere above.
const DUE_AT = 0.94;
// Same bottom inset, and a root that reaches far above the viewport: an element flung past between two frames
// (below the viewport in one, above it in the next, never "in" it) still flips to intersecting and shows.
const ROOT_MARGIN = "100000px 0px -6% 0px";
// Near the end of the document the top may never rise past the trigger line, even at maximum scroll (the footer's
// last rows on a short viewport): those trigger on their first visible pixel instead.
const ROOT_MARGIN_PAGE_END = "100000px 0px 0px 0px";

/**
 * Motion fade-up reveal, once, as soon as the element's top is 6 % inside the viewport (VIEWPORT.margin).
 * The trigger is positional, so a tall block reveals as early as a short one (no share-of-height threshold).
 * Default variants: fadeUp() rising 16 px (12 px under 768 px). `delay` applies to the default variants.
 * For staggered groups: <Reveal variants={staggerParent()}> with <RevealItem> children.
 * Under reduced motion it renders the final state without animating.
 *
 * The final state is guaranteed (polish 3, the stuck telemetry row): an element already in view or above at mount
 * shows right away (a deferred group mounting while the page sits on it); every entry of a batched observer callback
 * is read (a busy main thread can deliver the stale "not intersecting" entry together with the current one); an
 * element scrolled past fast counts as seen; one the page end keeps below the trigger line triggers on entry.
 */
const Reveal = forwardRef(function Reveal({ as = "div", variants, delay = 0, className, children, ...rest }, forwardedRef) {
  const ref = useRef(null);
  const setRef = useCallback(
    (node) => {
      ref.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );
  const { reduced } = useMotionPreference();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const resolved = useMemo(() => variants ?? fadeUp({ y: isMobile ? 12 : 16, delay }), [variants, isMobile, delay]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (reduced) {
      // Anything rendered while motion is reduced counts as already shown, so switching motion back on
      // at runtime never hides on-screen content and replays it.
      setShown(true);
      return undefined;
    }
    if (!el) return undefined;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const { top } = el.getBoundingClientRect();
    // In view or already scrolled past at mount: due now. Effects run after the first paint, so an element in view
    // still rises from the hidden state, exactly as the observer's first callback used to trigger it. Content of a
    // closed <details> is left to the observer, so it still staggers in when the panel opens.
    const inClosedDetails = !!el.closest("details:not([open])");
    if (typeof IntersectionObserver === "undefined" || (!inClosedDetails && top < vh * DUE_AT)) {
      setShown(true);
      return undefined;
    }
    // Distance from the element's top to the document end: at maximum scroll its top sits at vh - toEnd. Content
    // above the element shifts both equally, so this holds while earlier groups or images still change height.
    const toEnd = document.documentElement.scrollHeight - (top + window.scrollY);
    const pageEnd = toEnd < vh * (1 - DUE_AT) + 8;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShown(true);
        if (VIEWPORT.once) io.disconnect();
      },
      { rootMargin: pageEnd ? ROOT_MARGIN_PAGE_END : ROOT_MARGIN, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const Comp = m[as];
  return (
    <Comp
      ref={setRef}
      className={className}
      variants={resolved}
      initial={reduced ? false : "hidden"}
      animate={reduced || shown ? "show" : "hidden"}
      {...rest}
    >
      {children}
    </Comp>
  );
});

export default Reveal;
