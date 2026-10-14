import { lazy, Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import useMotionPreference from "@/hooks/useMotionPreference";
import useInViewport from "@/hooks/useInViewport";

// Lazy chunk: only requested when a ticker mounts below the fold with motion on.
const NumberFlow = lazy(() => import("@number-flow/react"));

const TRANSFORM_TIMING = { duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };
const SPIN_TIMING = { duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };
const OPACITY_TIMING = { duration: 450, easing: "ease-out" };

/** Static text through Intl.NumberFormat; a leading ASCII minus becomes a typographic minus (U+2212). */
function formatStatic(value, locales, format) {
  let text;
  try {
    text = new Intl.NumberFormat(locales, format).format(value);
  } catch {
    text = String(value);
  }
  return text.replace(/^-/, "−");
}

/**
 * Odometer number with an honest first paint.
 * - First render is the final value as static text (no CLS; crawlers and no-JS see the number).
 * - If motion is on and the element is below the fold at mount, it lazy-loads @number-flow/react
 *   (Suspense fallback = the same static text), parks at 0, and rolls to `value` once the element
 *   is 85% into the viewport. Otherwise it stays static. Reduced motion: always the static final value.
 */
export default function NumberTicker({ value, format, prefix, suffix, className, locales = "en-US" }) {
  const ref = useRef(null);
  const { reduced } = useMotionPreference();
  const [armed, setArmed] = useState(false);
  const inView = useInViewport(ref, { rootMargin: "0px 0px -15% 0px", once: true, attr: false });

  // Decide once, before paint: animate only if below the fold at mount and motion is on.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (el.getBoundingClientRect().top > window.innerHeight) setArmed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const staticText = useMemo(
    () => `${prefix ?? ""}${formatStatic(value, locales, format)}${suffix ?? ""}`,
    [value, locales, format, prefix, suffix]
  );

  const animate = armed && !reduced;

  return (
    <span ref={ref} className={cn("inline-block tabular", className)}>
      {animate ? (
        <Suspense fallback={staticText}>
          <NumberFlow
            value={inView ? value : 0}
            format={format}
            locales={locales}
            prefix={prefix}
            suffix={suffix}
            respectMotionPreference={false}
            transformTiming={TRANSFORM_TIMING}
            spinTiming={SPIN_TIMING}
            opacityTiming={OPACITY_TIMING}
            willChange
          />
        </Suspense>
      ) : (
        staticText
      )}
    </span>
  );
}
