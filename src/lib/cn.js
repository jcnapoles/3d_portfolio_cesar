import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's default scale. Without this, custom tokens are misclassified:
// `text-h2` / `text-button` would be read as text colours (and dropped next to `text-ink-1` / `text-void`),
// `shadow-glow-cta` as a shadow colour, `bg-g-corona` as a background colour, etc.
// Keep these lists in sync with tailwind.config.cjs.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ["section"],
      borderRadius: ["pill"],
    },
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl", "display-l", "display-s", "h2", "h3", "h4", "stat", "stat-text", "quote",
            "lead", "body", "small", "button", "hud", "hud-xs", "wordmark",
          ],
        },
      ],
      "font-stretch": [{ stretch: ["100", "105", "110", "112", "115", "118", "125"] }],
      shadow: [{ shadow: ["glow-cta", "glow-cta-h", "glow-rim", "glow-sat", "glow-ion", "hi-top", "float"] }],
      "bg-image": [{ bg: ["g-hairline", "g-horizon", "g-corona", "g-wordmark", "g-gold-tint"] }],
      "max-w": [{ "max-w": ["container", "wide", "measure"] }],
      z: [{ z: ["bg", "grain", "content", "rail", "nav", "sticky", "menu", "cursor", "skip"] }],
      duration: [{ duration: ["press", "micro", "ui", "panel", "reveal"] }],
      ease: [{ ease: ["inout", "ui", "draw"] }],
      animate: [
        {
          animate: [
            "rise", "rise-fast", "fade-up", "fade-in", "ping-signal", "comet-border", "corona",
            "spin-40", "spin-64-rev", "draw-x", "twinkle",
          ],
        },
      ],
    },
  },
});

export const cn = (...inputs) => twMerge(clsx(inputs));
