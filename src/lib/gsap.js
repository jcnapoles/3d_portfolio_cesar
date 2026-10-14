// Lazy GSAP: the only module that imports gsap. Never imported statically by the entry chunk's
// render path; GsapBoot calls loadGsap() after idle / first interaction (never when reduced).
let loadPromise = null;
let resolveReady;
export const gsapReady = new Promise((r) => { resolveReady = r; });

export function loadGsap() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText"),
      import("gsap/DrawSVGPlugin"), import("gsap/MotionPathPlugin"),
    ]).then(([g, st, sp, ds, mp]) => {
      const gsap = g.gsap || g.default;
      const api = { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText, DrawSVGPlugin: ds.DrawSVGPlugin, MotionPathPlugin: mp.MotionPathPlugin };
      gsap.registerPlugin(api.ScrollTrigger, api.SplitText, api.DrawSVGPlugin, api.MotionPathPlugin);
      api.ScrollTrigger.config({ ignoreMobileResize: true });
      resolveReady(api);
      return api;
    });
  }
  return loadPromise;
}

let refreshTimer;
export function requestRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => gsapReady.then(({ ScrollTrigger }) => ScrollTrigger.refresh()), 150);
}

export const isBelowFold = (el) => !!el && el.getBoundingClientRect().top > window.innerHeight;

/** H2 line-mask reveals for every [data-reveal="lines"] (SectionHeading sets it). */
export function initHeadingReveals({ gsap, SplitText }) {
  document.querySelectorAll('[data-reveal="lines"]:not([data-reveal-init])').forEach((el) => {
    el.setAttribute("data-reveal-init", "");
    if (!isBelowFold(el)) return; // already seen: leave as is
    SplitText.create(el, {
      type: "lines", mask: "lines", autoSplit: true, aria: "auto",
      onSplit(self) {
        if (el.dataset.revealDone) return undefined; // never replay on re-split
        return gsap.from(self.lines, {
          yPercent: 100, duration: 1, stagger: 0.1, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onComplete: () => { el.dataset.revealDone = "true"; },
        });
      },
    });
  });
}
