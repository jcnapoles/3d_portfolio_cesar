import { useEffect, useRef } from "react";
import { AnimatePresence, m } from "motion/react";
import { FileDown, X } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";
import { scrollToId, scrollToTop } from "@/lib/scroll";
import { CV_LABEL, LINKS, NAV_LINKS } from "@/constants/site";
import Logo from "@/components/ui/Logo";
import StarGlyph from "@/components/ui/StarGlyph";
import CalendlyButton from "@/components/ui/CalendlyButton";
import ExternalLink from "@/components/ui/ExternalLink";
import MotionToggle from "@/components/ui/MotionToggle";
import { VersionSwitchLink } from "@/components/system/VersionSwitch";
import useLenis from "@/hooks/useLenis";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EXT_LINK = "inline-flex min-h-11 items-center text-body text-ink-2 no-underline transition-colors duration-ui ease-ui hover:text-ink-1";

const overlay = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: EASE.inout } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE.in } },
};
const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE.out } },
};

const notify = (open) => {
  try {
    window.dispatchEvent(new CustomEvent("cn:menu", { detail: { open } }));
  } catch {
    /* ignore */
  }
};

/**
 * Full-screen mobile / tablet menu (spec 6.1). A modal dialog: focus moves to the first link and is trapped,
 * Esc closes, #main / footer / the navbar become inert, Lenis stops (and the page cannot scroll behind it).
 * On close focus returns to the toggle (or, after a keyboard link activation, to the target heading).
 * Dispatches window "cn:menu" { detail: { open } } for MobileStickyCta.
 */
export default function MobileMenu({ open, onClose, toggleRef, headerRef, activeChapter, onFocusSection }) {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const dialogRef = useRef(null);
  const firstLinkRef = useRef(null);
  const pendingRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const focusSectionRef = useRef(onFocusSection);
  focusSectionRef.current = onFocusSection;

  // Open / close side effects. Deliberately keyed on `open` only (toggling Motion inside the menu
  // recreates Lenis; that must not run the close path).
  useEffect(() => {
    if (!open) return undefined;
    const html = document.documentElement;
    const inertTargets = [
      document.getElementById("main"),
      document.querySelector("[data-site-footer]") || document.querySelector("body > #root footer"),
      headerRef?.current,
    ].filter(Boolean);
    inertTargets.forEach((el) => {
      el.inert = true;
    });
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    notify(true);
    firstLinkRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      inertTargets.forEach((el) => {
        el.inert = false;
      });
      html.style.overflow = prevOverflow;
      const l = lenisRef.current;
      l?.start();
      notify(false);
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) {
        if (pending.id === "top") scrollToTop(l);
        else scrollToId(pending.id, l);
      }
      if (pending?.keyboard) focusSectionRef.current?.(pending.id);
      else toggleRef?.current?.focus({ preventScroll: true });
    };
  }, [open, headerRef, toggleRef]);

  // Lenis is stopped while the menu is open (also when it is recreated by the Motion toggle).
  useEffect(() => {
    if (!open || !lenis) return undefined;
    lenis.stop();
    return () => lenis.start();
  }, [open, lenis]);

  const go = (e, id) => {
    e.stopPropagation();
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    pendingRef.current = { id, keyboard: e.detail === 0 };
    onClose?.();
  };

  // The overlay has no backdrop blur: under a 96-97 % void fill it was invisible, yet the GPU re-blurred the whole
  // viewport on every frame of the fade.
  return (
    <AnimatePresence>
      {open ? (
        <m.div
          key="mobile-menu"
          ref={dialogRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent=""
          variants={overlay}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-menu bg-void/[.97] lg:hidden"
        >
          <div aria-hidden="true" className="menu-glow" data-glow="" />
          <div aria-hidden="true" className="menu-stars" />

          <div className="relative flex h-full flex-col overflow-y-auto overscroll-contain pb-[max(24px,env(safe-area-inset-bottom))]">
            {/* Header row: mirrors the navbar geometry so the close button sits exactly where the toggle was. */}
            <div className="shrink-0 md:pt-4">
              <div className="nav-frame">
                <a
                  href="#top"
                  aria-label="Cesar Napoles, Fractional CTO: back to top"
                  onClick={(e) => go(e, "top")}
                  className="relative -my-1 shrink-0 rounded-sm py-1"
                >
                  <Logo />
                </a>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => onClose?.()}
                  className="inline-flex size-11 items-center justify-center rounded-pill text-ink-1 transition-colors duration-ui ease-ui hover:bg-white/[.06]"
                >
                  <X size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col px-4 md:px-9">
              <nav aria-label="Menu" className="pt-8 md:pt-14">
                {/* Row hairlines: 18 px padding keeps >= 12 px between each rule and the 36 px label's text box
                    (polish 3 hairline rhythm; 14 px left only 8 px). */}
                <m.ul variants={list} initial="hidden" animate="show" className="border-t border-line">
                  {NAV_LINKS.map((link, i) => {
                    const active = link.chapter === activeChapter;
                    return (
                      <m.li key={link.id} variants={item} className="border-b border-line">
                        <a
                          ref={i === 0 ? firstLinkRef : undefined}
                          href={`#${link.id}`}
                          aria-current={active ? "true" : undefined}
                          onClick={(e) => go(e, link.id)}
                          className="group flex items-center gap-5 py-[18px]"
                        >
                          <span aria-hidden="true" className="hud-label w-6 shrink-0 tabular">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.025em] stretch-110 transition-colors duration-ui ease-ui",
                              active ? "text-ink-1" : "text-ink-1/[.86] group-hover:text-ink-1"
                            )}
                          >
                            {link.label}
                          </span>
                          {active ? <StarGlyph size={12} className="ml-auto text-gold" /> : null}
                        </a>
                      </m.li>
                    );
                  })}
                </m.ul>
              </nav>

              <m.div variants={list} initial="hidden" animate="show" className="mt-auto pt-10">
                <m.div variants={item}>
                  <CalendlyButton placement="menu" size="lg" fullWidth />
                </m.div>
                <m.div variants={item} className="mt-6 flex flex-wrap items-center gap-x-8">
                  <ExternalLink href={LINKS.linkedin} className={EXT_LINK}>
                    <span className="inline-flex items-center gap-2.5">
                      <FaLinkedinIn size={16} aria-hidden="true" />
                      LinkedIn
                    </span>
                  </ExternalLink>
                  <ExternalLink href={LINKS.github} className={EXT_LINK}>
                    <span className="inline-flex items-center gap-2.5">
                      <FaGithub size={16} aria-hidden="true" />
                      GitHub
                    </span>
                  </ExternalLink>
                </m.div>
                <m.div variants={item}>
                  <a
                    href={LINKS.cv}
                    download
                    className="inline-flex min-h-11 items-center gap-2.5 text-body text-ink-2 transition-colors duration-ui ease-ui hover:text-ink-1"
                  >
                    <FileDown size={16} strokeWidth={1.75} aria-hidden="true" />
                    {CV_LABEL}
                  </a>
                </m.div>
                <m.div variants={item}>
                  <VersionSwitchLink className="inline-flex min-h-11 items-center gap-2.5 text-body text-ink-2 transition-colors duration-ui ease-ui hover:text-ink-1" />
                </m.div>
                <m.div variants={item} className="mt-4 border-t border-line pt-3">
                  <MotionToggle />
                </m.div>
              </m.div>
            </div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
