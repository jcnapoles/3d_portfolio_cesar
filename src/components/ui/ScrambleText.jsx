import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import useScramble from "@/hooks/useScramble";
import useInViewport from "@/hooks/useInViewport";
import useMotionPreference from "@/hooks/useMotionPreference";

/**
 * Mono scramble that resolves to `text`. Screen readers get the plain text (sr-only);
 * the animated glyphs are aria-hidden. trigger: 'mount' | 'inview'.
 * The per-frame glyphs are written straight to the aria-hidden span (no React render per frame).
 */
export default function ScrambleText({ text, as: Tag = "span", trigger = "mount", duration = 380, delay = 0, className }) {
  const ref = useRef(null);
  const glyphRef = useRef(null);
  const { reduced } = useMotionPreference();
  const [armed, setArmed] = useState(trigger === "mount");
  const [start, setStart] = useState(false);
  const inView = useInViewport(ref, { attr: false });

  // Arm before first paint when a run is coming, so there is no final -> scrambled flash.
  useLayoutEffect(() => {
    if (reduced || trigger !== "inview" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.94) setArmed(true);
  }, [reduced, trigger]);

  const go = trigger === "mount" ? true : inView;
  useEffect(() => {
    if (reduced || !go || start) return undefined;
    if (!delay) {
      setArmed(true);
      setStart(true);
      return undefined;
    }
    setArmed(true);
    const id = window.setTimeout(() => setStart(true), delay);
    return () => window.clearTimeout(id);
  }, [go, delay, reduced, start]);

  const shown = useScramble(text, { start, duration, armed: armed && !reduced, ref: glyphRef });

  return (
    <Tag ref={ref} className={cn("font-mono", className)}>
      <span className="sr-only">{text}</span>
      <span ref={glyphRef} aria-hidden="true">
        {shown}
      </span>
    </Tag>
  );
}
