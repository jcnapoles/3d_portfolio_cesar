// Lazy GSAP: the only module that imports gsap. Never imported statically by the entry chunk's
// render path; GsapBoot calls loadGsap() after idle / first interaction (never when reduced).
let loadPromise = null;
let resolveReady;
export const gsapReady = new Promise((r) => { resolveReady = r; });

// ScrollTrigger.enable() (run by registerPlugin) starts `_rafBugFix`: `function () { return _enabled &&
// requestAnimationFrame(_rafBugFix) }`, an empty rAF loop for the life of the page ("some browsers (like Firefox)
// repaint inconsistently unless something is queued"). It makes the main thread produce ~60 frames a second while
// nothing moves, and every frame then restyles each running compositor-only loop (orbit satellites, spins, pings)
// on the main thread too. Outside Firefox, that single self-rescheduling callback is dropped while the plugins
// register; every other requestAnimationFrame call passes straight through.
const RAF_LOOP = /^function\s*[\w$]*\s*\(\)\s*\{\s*return\s+[\w$]+\s*&&\s*requestAnimationFrame\(\s*[\w$]+\s*\)\s*;?\s*\}$/;
function registerWithoutIdleLoop(register) {
  if (typeof window === "undefined" || /firefox/i.test(navigator.userAgent || "")) {
    register();
    return;
  }
  const raf = window.requestAnimationFrame;
  let filtering = true;
  // GSAP's ticker may capture this wrapper when it wakes during registration: once registration is over the
  // wrapper is a plain pass-through.
  window.requestAnimationFrame = function requestAnimationFrame(cb) {
    if (filtering && typeof cb === "function" && RAF_LOOP.test(Function.prototype.toString.call(cb))) return 0;
    return raf.call(window, cb);
  };
  try {
    register();
  } finally {
    filtering = false;
    window.requestAnimationFrame = raf;
  }
}

export function loadGsap() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText"),
      import("gsap/DrawSVGPlugin"), import("gsap/MotionPathPlugin"),
    ]).then(([g, st, sp, ds, mp]) => {
      const gsap = g.gsap || g.default;
      const api = { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText, DrawSVGPlugin: ds.DrawSVGPlugin, MotionPathPlugin: mp.MotionPathPlugin };
      registerWithoutIdleLoop(() => gsap.registerPlugin(api.ScrollTrigger, api.SplitText, api.DrawSVGPlugin, api.MotionPathPlugin));
      // syncInterval: ScrollTrigger's safety poll (a full update in a rAF) every 1 s instead of every 250 ms.
      // Scroll events still update every trigger as they happen.
      api.ScrollTrigger.config({ ignoreMobileResize: true, syncInterval: 1000 });
      resolveReady(api);
      return api;
    });
  }
  return loadPromise;
}

let refreshTimer;
export function requestRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => gsapReady.then(({ ScrollTrigger }) => ScrollTrigger.refresh()), 200);
}

export const isBelowFold = (el) => !!el && el.getBoundingClientRect().top > window.innerHeight;

// H2 line-mask tempo: 0.65 s per line, 60 ms apart, starting as the heading's top passes 92 % of the viewport.
const HEADING = { duration: 0.65, stagger: 0.06, start: "top 92%" };

function splitHeading({ gsap, SplitText }, el) {
  if (document.documentElement.dataset.motion === "reduced") return; // switched off before it came near
  if (!isBelowFold(el)) return; // already seen: leave as is
  SplitText.create(el, {
    type: "lines", mask: "lines", autoSplit: true, aria: "auto",
    onSplit(self) {
      if (el.dataset.revealDone) return undefined; // never replay on re-split
      return gsap.from(self.lines, {
        yPercent: 100, duration: HEADING.duration, stagger: HEADING.stagger, ease: "expo.out",
        scrollTrigger: { trigger: el, start: HEADING.start, once: true },
        onComplete: () => { el.dataset.revealDone = "true"; },
      });
    },
  });
}

let headingObserver = null;

/**
 * H2 line-mask reveals for every [data-reveal="lines"] (SectionHeading sets it).
 * Each heading is split lazily, once it comes within one viewport of the screen, instead of splitting every H2
 * in one long task while the hero intro is still playing.
 */
export function initHeadingReveals(api) {
  const els = document.querySelectorAll('[data-reveal="lines"]:not([data-reveal-init])');
  if (!els.length) return;
  if (typeof IntersectionObserver === "undefined") {
    els.forEach((el) => {
      el.setAttribute("data-reveal-init", "");
      splitHeading(api, el);
    });
    return;
  }
  if (!headingObserver) {
    headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          headingObserver.unobserve(entry.target);
          if (entry.target.isConnected) splitHeading(api, entry.target);
        });
      },
      { rootMargin: "0px 0px 100% 0px" }
    );
  }
  els.forEach((el) => {
    el.setAttribute("data-reveal-init", "");
    headingObserver.observe(el);
  });
}
