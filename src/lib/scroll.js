const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

/**
 * Scroll to a section/anchor id, landing under the fixed navbar.
 * The 88 px navbar offset (NAV_OFFSET) is applied through html { scroll-padding-top } in index.css, which both
 * scrollIntoView and Lenis 1.3.26 honour (Lenis also subtracts the target's scroll-margin-top), so no extra
 * offset is passed here.
 */
export function scrollToId(id, lenis) {
  if (!id) return;
  const clean = String(id).replace(/^#/, "");
  if (lenis) {
    lenis.scrollTo(`#${clean}`, { duration: 0.8, easing: easeOutQuart });
    return;
  }
  document.getElementById(clean)?.scrollIntoView({ block: "start" });
}

/** Scroll back to the top of the page. */
export function scrollToTop(lenis) {
  if (lenis) {
    lenis.scrollTo(0, { duration: 0.9, easing: easeOutQuart });
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
