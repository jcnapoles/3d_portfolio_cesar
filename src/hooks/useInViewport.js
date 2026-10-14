import { useEffect, useState } from "react";

/**
 * IntersectionObserver visibility.
 *
 * useInViewport(ref, { rootMargin = '0px 0px -15% 0px', threshold = 0, once = true, attr = true, initial = false })
 *
 * - When `attr` is true it writes ref.current.dataset.inview = 'true' | 'false'. Before the effect
 *   runs the attribute is absent, so CSS shows the final state (no flash for content already in view).
 * - The initial value is computed synchronously in the effect: with `once`, anything whose top is
 *   above the bottom of the viewport counts as seen; without `once`, it must actually intersect.
 * - `initial` (extra, optional) is the value returned before the first measurement.
 */
export default function useInViewport(ref, { rootMargin = "0px 0px -15% 0px", threshold = 0, once = true, attr = true, initial = false } = {}) {
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const write = (v) => {
      if (attr) el.dataset.inview = v ? "true" : "false";
      setInView(v);
    };

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const initiallyIn = once ? rect.top < vh : rect.top < vh && rect.bottom > 0;
    write(initiallyIn);

    if (once && initiallyIn) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      write(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            write(true);
            if (once) io.disconnect();
          } else if (!once) {
            write(false);
          }
        }
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once, attr]);

  return inView;
}
