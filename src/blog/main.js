// Blog client: progressive enhancement only. Every /blog page is complete static HTML without this script.
import "@/index.css";
import "@/sections/chrome/chrome.css";
import "./blog.css";

const SCROLLED_AT = 24;
const header = document.querySelector("[data-blog-nav]");
const progress = document.querySelector("[data-read-progress]");
const article = document.querySelector(".prose-blog");

/* Scrolled nav surface + reading progress (post pages), one rAF per scroll burst. */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = window.scrollY;
    if (header) header.dataset.scrolled = y > SCROLLED_AT ? "true" : "false";
    if (progress && article) {
      const start = article.offsetTop - window.innerHeight * 0.3;
      const end = article.offsetTop + article.offsetHeight - window.innerHeight * 0.7;
      const v = Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)));
      progress.style.transform = `scaleX(${v})`;
    }
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
onScroll();

/* Mobile menu: a native modal <dialog> (focus trap, Esc and inert page for free). */
const menu = document.getElementById("blog-menu");
const opener = document.querySelector("[data-menu-open]");
if (menu && opener && typeof menu.showModal === "function") {
  opener.addEventListener("click", () => {
    menu.showModal();
    opener.setAttribute("aria-expanded", "true");
  });
  menu.querySelector("[data-menu-close]")?.addEventListener("click", () => menu.close());
  menu.addEventListener("close", () => {
    opener.setAttribute("aria-expanded", "false");
    opener.focus({ preventScroll: true });
  });
  menu.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", () => menu.close()));
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && menu.open && menu.close());
} else if (opener) {
  opener.hidden = true;
}

/* Copy link. */
document.querySelectorAll("[data-copy-link]").forEach((button) => {
  const label = button.querySelector("[data-copy-label]");
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyLink);
      if (label) label.textContent = "Link copied";
    } catch {
      if (label) label.textContent = "Copy failed";
    }
    setTimeout(() => label && (label.textContent = "Copy link"), 2000);
  });
});
