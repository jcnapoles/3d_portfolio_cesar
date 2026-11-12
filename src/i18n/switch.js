// Language change with a transition: a dark curtain fades in over this page, then fades out on the
// next one. The next page's head boot script reads the session flag and adds `lang-entering` before
// first paint (index.html, scripts/blog/templates.mjs). CSS: `.lang-leaving` / `.lang-entering` in index.css.
// Works the same in every browser (no cross-document View Transitions needed). Skipped under reduced motion.

export const LANG_SWITCH_KEY = "cn:lang-switch";
const LEAVE_MS = 260;

export function switchLanguage(href) {
  const d = document.documentElement;
  if (d.dataset.motion === "reduced") {
    window.location.assign(href);
    return;
  }
  try {
    sessionStorage.setItem(LANG_SWITCH_KEY, "1");
  } catch {
    /* no storage: the next page simply appears without the fade-in */
  }
  d.classList.add("lang-leaving");
  setTimeout(() => window.location.assign(href), LEAVE_MS);
}

// Back/forward cache: a restored page must not stay behind the curtain.
if (typeof window !== "undefined") {
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) document.documentElement.classList.remove("lang-leaving");
  });
}
