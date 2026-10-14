import { useEffect, useMemo, useRef, useState } from "react";
import useMotionPreference from "@/hooks/useMotionPreference";

const PER_CHAR_MS = 18;
const GLYPH_REFRESH_MS = 40;

const randomGlyph = (glyphs) => glyphs[Math.floor(Math.random() * glyphs.length)];
const scrambleAll = (text, glyphs) =>
  Array.from(text, (ch) => (ch === " " ? " " : randomGlyph(glyphs))).join("");

/**
 * useScramble(text, { start, duration = 500, glyphs = '01/\\_<>·', armed = false }) => string
 *
 * rAF scramble that resolves left to right, 18 ms per character (compressed so the whole run fits
 * `duration` for long strings). Spaces are kept so word shapes stay stable.
 * - Before `start`: returns the final text, or a stable scrambled string when `armed` (extra option,
 *   used by ScrambleText to avoid a final -> scrambled flash when it knows a run is coming).
 * - Under reduced motion: always returns the final text.
 */
export default function useScramble(text, { start = false, duration = 500, glyphs = "01/\\_<>·", armed = false } = {}) {
  const { reduced } = useMotionPreference();
  const safeText = text == null ? "" : String(text);
  const armedText = useMemo(() => scrambleAll(safeText, glyphs), [safeText, glyphs]);
  const [output, setOutput] = useState(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (reduced || !start) return undefined;
    doneRef.current = false;
    const chars = Array.from(safeText);
    const len = chars.length || 1;
    const step = Math.min(PER_CHAR_MS, duration / len);
    const lead = Math.max(0, duration - len * step);
    let raf = 0;
    let t0 = 0;
    let lastGlyph = -Infinity;
    let current = armedText;

    const tick = (now) => {
      if (!t0) t0 = now;
      const elapsed = now - t0;
      const resolved = elapsed < lead ? 0 : Math.floor((elapsed - lead) / step) + 1;
      const refresh = now - lastGlyph >= GLYPH_REFRESH_MS;
      if (refresh) lastGlyph = now;
      const prev = Array.from(current);
      current = chars
        .map((ch, i) => {
          if (i < resolved || ch === " ") return ch;
          return refresh ? randomGlyph(glyphs) : prev[i] ?? randomGlyph(glyphs);
        })
        .join("");
      setOutput(current);
      if (resolved >= chars.length) {
        doneRef.current = true;
        setOutput(null);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, reduced, safeText, duration, glyphs, armedText]);

  if (reduced) return safeText;
  if (output !== null) return output;
  if (armed && !doneRef.current) return armedText;
  return safeText;
}
