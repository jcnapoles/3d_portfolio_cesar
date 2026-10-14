import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { m } from "motion/react";
import { fadeUp, VIEWPORT } from "@/lib/motion";
import useMotionPreference from "@/hooks/useMotionPreference";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Motion fade-up reveal, once, when the element enters the viewport (VIEWPORT = { once: true, amount: 0.3 }).
 * The amount is capped for elements taller than the viewport so long stacks always reveal.
 * Default variants: fadeUp() rising 24 px (16 px under 768 px). `delay` applies to the default variants.
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
  const resolved = useMemo(() => variants ?? fadeUp({ y: isMobile ? 16 : 24, delay }), [variants, isMobile, delay]);
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
    const rect = el.getBoundingClientRect();
    if (rect.bottom <= 0) {
      setShown(true); // already scrolled past: show the final state
      return undefined;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const amount = Math.min(VIEWPORT.amount, (vh * 0.5) / Math.max(rect.height, 1));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= amount * 0.98) {
          setShown(true);
          if (VIEWPORT.once) io.disconnect();
        }
      },
      { threshold: [0, amount] }
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
