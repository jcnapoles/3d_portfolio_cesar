import { scrollToId } from "@/lib/scroll";
import useLenis from "@/hooks/useLenis";

/**
 * First focusable element: "Skip to content" -> #main. sr-only until focused, then a gold pill top-left.
 * Moves focus into <main> (tabindex -1 is added on demand) and scrolls there with or without Lenis.
 */
export default function SkipLink() {
  const lenis = useLenis();
  const onClick = (e) => {
    const main = document.getElementById("main");
    if (!main) return;
    e.preventDefault();
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    scrollToId("main", lenis);
  };
  return (
    <a
      href="#main"
      onClick={onClick}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-skip focus:inline-flex focus:h-11 focus:items-center focus:rounded-pill focus:bg-gold focus:px-5 focus:text-button focus:text-void focus:shadow-glow-cta"
    >
      Skip to content
    </a>
  );
}
