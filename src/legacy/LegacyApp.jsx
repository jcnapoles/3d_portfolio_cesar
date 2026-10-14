import { useEffect, useLayoutEffect, useState } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
// Poppins, self-hosted (was a Google Fonts @import). Latin only, the weights the 2024 site used.
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-800.css";
import "@fontsource/poppins/latin-900.css";
import "./legacy.css";
import { About, Contact, Experience, Feedbacks, Hero, Navbar, Tech, Works, StarsCanvas } from "./components";
import { LegacyReducedContext, readReducedMotion } from "./motionPref";

/**
 * Called by VersionProvider before it warps here: fetch the Poppins weights the hero uses (capped at 700 ms) so the
 * revealed page already shows its real type. The @font-face rules arrive with this chunk's CSS.
 */
export function prepare() {
  if (typeof document === "undefined" || !document.fonts?.load) return Promise.resolve();
  const fonts = Promise.all(["400 16px Poppins", "700 16px Poppins", "900 16px Poppins"].map((f) => document.fonts.load(f))).catch(
    () => undefined
  );
  return Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 700))]);
}

/** The 2024 site switched its favicon with the colour scheme. Restores the 2026 icon on unmount. */
function useFavicon() {
  useEffect(() => {
    const link = document.querySelector("link[rel='icon']");
    if (!link) return undefined;
    const previous = link.getAttribute("href");
    const dark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    link.setAttribute("href", dark ? "/favicon-white.svg" : "/favicon-black.svg");
    return () => {
      if (previous) link.setAttribute("href", previous);
    };
  }, []);
}

/**
 * The 2024 site (restored from `main`), rendered by VersionProvider when version === "legacy".
 * It is the root of a lazy chunk: three / r3f / drei / Tilt / timeline / confetti / Poppins all load with it.
 * It renders outside the 2026 app's providers (no LazyMotion strict, no Lenis).
 *
 * framer-motion -> motion/react: the 2024 components keep writing `motion.div` etc., bound to Motion's `m`
 * (`import { m as motion }`) under this non-strict LazyMotion with `domAnimation`. That covers everything the
 * 2024 site uses (variants, whileInView, whileHover / whileTap, keyframes, springs; no drag, no layout) and reuses
 * the Motion code already in the entry chunk. Importing the full `motion` component instead drags Motion's drag +
 * layout-projection code (~25 KB gzip) into the ENTRY chunk, because Rollup assigns it through the
 * `motion/react` barrel the 2026 site imports.
 *
 * Everything visual is scoped under `.legacy-root` (see legacy.css).
 */
export default function LegacyApp() {
  useFavicon();
  const [reduced] = useState(readReducedMotion);

  useLayoutEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);

  // react-vertical-timeline-component writes --line-color inline on <html>; take it with us when the 2024 site leaves.
  useEffect(() => () => document.documentElement.style.removeProperty("--line-color"), []);

  return (
    <LegacyReducedContext.Provider value={reduced}>
      <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        <div className="legacy-root">
          <div className='relative z-0'>
            <Navbar />
            <Hero />
            <About />
            <Experience />
            <Tech />
            <Works />
            <Feedbacks />
            <Contact />
            <StarsCanvas />
          </div>
        </div>
      </MotionConfig>
      </LazyMotion>
    </LegacyReducedContext.Provider>
  );
}
