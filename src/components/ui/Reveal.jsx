import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { m } from "motion/react";
import { fadeUp, VIEWPORT } from "@/lib/motion";
import useMotionPreference from "@/hooks/useMotionPreference";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Motion fade-up reveal, once, as soon as the element's top is 6 % inside the viewport (VIEWPORT.margin).
 * The trigger is positional, so a tall block reveals as early as a short one (no share-of-height threshold).
 * Default variants: fadeUp() rising 16 px (12 px under 768 px). `delay` applies to the default variants.
 * For staggered groups: <Reveal variants={staggerParent()}> with <RevealItem> children.
 * Under reduced motion it renders the final state without animating.
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
    if (el.getBoundingClientRect().bottom <= 0) {
      setShown(true); // already scrolled past: show the final state
      return undefined;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        if (VIEWPORT.once) io.disconnect();
      },
      { rootMargin: VIEWPORT.margin, threshold: 0 }
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
