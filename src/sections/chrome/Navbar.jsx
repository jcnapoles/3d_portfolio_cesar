import { useCallback, useEffect, useRef, useState } from "react";
import { m, useScroll, useSpring, useTransform } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/motion";
import { scrollToId, scrollToTop } from "@/lib/scroll";
import { NAV_LINKS } from "@/constants/site";
import Logo from "@/components/ui/Logo";
import StarGlyph from "@/components/ui/StarGlyph";
import CalendlyButton from "@/components/ui/CalendlyButton";
import useLenis from "@/hooks/useLenis";
import useLenisScroll from "@/hooks/useLenisScroll";
import useActiveChapter from "@/hooks/useActiveChapter";
import useMediaQuery from "@/hooks/useMediaQuery";
import useMotionPreference from "@/hooks/useMotionPreference";
import MobileMenu from "@/sections/chrome/MobileMenu";
import "@/sections/chrome/chrome.css";

const SCROLLED_AT = 24;

/** Keyboard activation (Enter on a link): move focus to the target's heading so Tab continues from there. */
function focusSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const target = section.querySelector("h1, h2") || section;
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
}

/**
 * Same-page anchor click: smooth scroll through scrollToId (Lenis when present, native otherwise).
 * preventDefault avoids the native hash jump under Lenis; stopPropagation keeps Lenis' own anchor
 * handler from re-targeting the scroll with its default easing. Modified clicks keep the browser default.
 */
function handleAnchorClick(e, id, lenis) {
  e.stopPropagation();
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (id === "top") scrollToTop(lenis);
  else scrollToId(id, lenis);
  if (e.detail === 0) focusSection(id);
}

/**
 * Navbar (spec 6.1): floating pill (>= 768) / full-width bar (< 768), progress line, mobile menu.
 * Always visible (owner feedback, polish 3: no hide-on-scroll). Past 24 px of scroll the glass surface fades in.
 */
export default function Navbar() {
  const lenis = useLenis();
  const { reduced } = useMotionPreference();
  const { index: chapter } = useActiveChapter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll state: written only when it changes (no re-render per scroll event).
  const readY = () => (typeof window === "undefined" ? 0 : window.scrollY);
  const [scrolled, setScrolled] = useState(() => readY() > SCROLLED_AT);
  const scrolledRef = useRef(scrolled);

  useLenisScroll(({ scroll }) => {
    const s = scroll > SCROLLED_AT;
    if (s !== scrolledRef.current) {
      scrolledRef.current = s;
      setScrolled(s);
    }
  });

  // Scroll restoration on reload can land mid-page before any scroll event.
  useEffect(() => {
    const s = window.scrollY > SCROLLED_AT;
    scrolledRef.current = s;
    setScrolled(s);
  }, []);

  // The menu exists below 1024 only: close it if the viewport grows past that.
  useEffect(() => {
    if (isDesktop && menuOpen) setMenuOpen(false);
  }, [isDesktop, menuOpen]);

  // Progress line: spring-smoothed scaleX; raw (no spring) under reduced motion.
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, SPRING.progress);
  const toHeadX = (v) => `${(Math.min(Math.max(v, 0), 1) - 1) * 100}%`;
  const headXSmooth = useTransform(smoothProgress, toHeadX);
  const headXRaw = useTransform(scrollYProgress, toHeadX);
  const lineScale = reduced ? scrollYProgress : smoothProgress;
  const headX = reduced ? headXRaw : headXSmooth;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled={scrolled ? "true" : "false"}
        className="nav-shell pointer-events-none fixed inset-x-0 top-0 z-nav md:pt-4"
      >
        <div className="nav-frame">
          <span aria-hidden="true" className="nav-surface" />

          <a
            href="#top"
            data-nav-home=""
            aria-label="Cesar Napoles, Fractional CTO: back to top"
            onClick={(e) => handleAnchorClick(e, "top", lenis)}
            className="relative -my-1 shrink-0 rounded-sm py-1"
          >
            <Logo />
          </a>

          <nav aria-label="Primary" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <ul className="flex items-center">
              {NAV_LINKS.map((link) => {
                const active = link.chapter === chapter;
                return (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      aria-current={active ? "true" : undefined}
                      onClick={(e) => handleAnchorClick(e, link.id, lenis)}
                      className={cn(
                        "relative flex h-10 items-center rounded-pill px-3.5 text-small transition-colors duration-ui ease-ui coarse:h-11",
                        active ? "text-ink-1" : "text-ink-2 hover:text-ink-1"
                      )}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className="nav-dot absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_6px_rgba(244,184,96,.8)]"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative flex shrink-0 items-center gap-1 md:gap-1.5">
            <CalendlyButton
              placement="nav"
              size="sm"
              magnetic
              cursorLock
              data-magnet="8"
              className="max-md:px-4 max-md:[&_svg]:hidden"
            >
              <span className="md:hidden">Book</span>
              <span className="hidden md:inline">Book a call</span>
            </CalendlyButton>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex size-11 items-center justify-center rounded-pill text-ink-1 transition-colors duration-ui ease-ui hover:bg-white/[.06] lg:hidden"
            >
              {menuOpen ? (
                <X size={20} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          </div>

          <span aria-hidden="true" className="nav-progress">
            <m.span className="nav-progress-line" style={{ scaleX: lineScale }} />
            <m.span className="nav-progress-head" style={{ x: headX }}>
              <StarGlyph size={4} className="nav-progress-star" />
            </m.span>
          </span>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        toggleRef={toggleRef}
        headerRef={headerRef}
        activeChapter={chapter}
        onFocusSection={focusSection}
      />
    </>
  );
}
