import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { EASE } from "@/lib/motion";
import { ANCHORS } from "@/constants/site";
import CalendlyButton from "@/components/ui/CalendlyButton";
import useMediaQuery from "@/hooks/useMediaQuery";

/** Resolves `find()` now or as soon as it appears in the DOM. Returns a cleanup. */
function whenPresent(find, cb) {
  const now = find();
  if (now) {
    cb(now);
    return () => {};
  }
  const mo = new MutationObserver(() => {
    const el = find();
    if (el) {
      mo.disconnect();
      cb(el);
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  return () => mo.disconnect();
}

/**
 * Mobile sticky booking CTA (spec 6.16), < 768 only. It appears once the hero CTA (#hero-cta) has scrolled
 * out of view above, and hides again from the contact section to the end of the page (#contact and the footer)
 * and while the mobile menu is open ("cn:menu" event). Keeps 96 px clear on the right for the chat bubble.
 */
export default function MobileStickyCta() {
  const mobile = useMediaQuery("(max-width: 767px)");
  return mobile ? <StickyCta /> : null;
}

function StickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Past the hero CTA: it is out of view AND above the viewport (never shown while it is still below the fold).
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    let io;
    const stop = whenPresent(
      () => document.getElementById(ANCHORS.heroCta) || document.getElementById("top"),
      (el) => {
        io = new IntersectionObserver(([entry]) => {
          setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
        io.observe(el);
      }
    );
    return () => {
      stop();
      io?.disconnect();
    };
  }, []);

  // End zone: #contact or the footer intersecting the viewport.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => seen.set(entry.target, entry.isIntersecting));
      setAtEnd(Array.from(seen.values()).some(Boolean));
    });
    const stops = [
      whenPresent(() => document.getElementById("contact"), (el) => io.observe(el)),
      whenPresent(() => document.querySelector("[data-site-footer]"), (el) => io.observe(el)),
    ];
    return () => {
      stops.forEach((s) => s());
      io.disconnect();
    };
  }, []);

  // Mobile menu state (dispatched by MobileMenu).
  useEffect(() => {
    const onMenu = (e) => setMenuOpen(!!e.detail?.open);
    window.addEventListener("cn:menu", onMenu);
    return () => window.removeEventListener("cn:menu", onMenu);
  }, []);

  const visible = pastHero && !atEnd && !menuOpen;

  return (
    <AnimatePresence>
      {visible ? (
        <m.div
          key="sticky-cta"
          initial={{ opacity: 0, y: 96 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE.out } }}
          exit={{ opacity: 0, y: 96, transition: { duration: 0.24, ease: EASE.in } }}
          className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-4 right-[96px] z-sticky md:hidden"
        >
          <div className="h-16 rounded-pill border-t border-line bg-space-800/[.92] p-1 shadow-hi-top">
            <CalendlyButton placement="sticky" label="Book a 30-min call" size="lg" fullWidth />
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
