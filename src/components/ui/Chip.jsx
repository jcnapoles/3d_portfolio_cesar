import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  default: "text-ink-2",
  ion: "text-ion bg-[var(--ion-tint)]",
  gold: "text-gold-hot border-gold/30 bg-[var(--gold-tint)]",
};

/**
 * Mono chip. `as` defaults to "span" ("a" automatically when `href` is given).
 * As a link: hover border ion/40, and an invisible hit area that reaches 44 px on coarse pointers
 * without changing the visual size.
 */
const Chip = forwardRef(function Chip({ as, href, tone = "default", className, children, ...rest }, ref) {
  const Tag = as || (href ? "a" : "span");
  const isLink = Tag === "a" || !!href;
  return (
    <Tag
      ref={ref}
      href={href}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-sm border border-line bg-space-600/60 px-2.5 py-1 font-mono text-[13px] leading-[1.4]",
        TONES[tone] || TONES.default,
        isLink &&
          "transition-[border-color,background-color,color] duration-ui ease-ui hover:border-ion/40 coarse:before:absolute coarse:before:inset-x-0 coarse:before:-inset-y-2 coarse:before:content-['']",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Chip;
