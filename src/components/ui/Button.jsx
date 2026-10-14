import { forwardRef, useCallback, useRef } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, FileDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { SPRING } from "@/lib/motion";
import useMotionPreference from "@/hooks/useMotionPreference";
import usePrefersFinePointer from "@/hooks/usePrefersFinePointer";

const ICONS = { arrow: ArrowRight, external: ArrowUpRight, down: ArrowDown, download: FileDown };
const ICON_SHIFT = {
  arrow: "motion-ok:group-hover:translate-x-1 motion-ok:group-focus-visible:translate-x-1",
  external: "motion-ok:group-hover:translate-x-0.5 motion-ok:group-hover:-translate-y-0.5",
  down: "motion-ok:group-hover:translate-y-0.5",
  download: "motion-ok:group-hover:translate-y-0.5",
};

const BASE =
  "group relative isolate inline-flex select-none items-center justify-center whitespace-nowrap " +
  "[transition:background-color_240ms_var(--ease-ui),border-color_240ms_var(--ease-ui),color_240ms_var(--ease-ui),scale_100ms_var(--ease-ui)] " +
  "active:[scale:.97] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS = {
  primary: "btn-glow rounded-pill bg-gold text-void text-button stretch-105 shadow-glow-cta hover:bg-gold-hot",
  ghost: "rounded-pill border border-line-strong bg-white/[.04] text-ink-1 text-button stretch-105 hover:border-ink-3 hover:bg-white/[.07]",
  text: "link-ion text-button coarse:min-h-11",
};
const SIZES = { sm: "h-10 px-6", md: "h-13 px-6", lg: "h-14 px-6" };

const clamp = (v, cap) => Math.max(-cap, Math.min(cap, v));

/**
 * Button / link-button. Renders <a> when `href`, otherwise <button>.
 * variant: 'primary' | 'ghost' | 'text'; size: 'sm' (40) | 'md' (52) | 'lg' (56).
 * icon: 'arrow' (default) | 'external' | 'down' | 'download' | 'none'.
 * external: target=_blank + rel + sr-only hint (srHint ?? '(opens in a new tab)').
 * magnetic (fine pointer, motion on): translate x .35 capped 12 px (data-magnet="8" caps it at 8), label x .2 capped 7 px.
 * cursorLock: data-cursor="lock" (CursorBrackets target).
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    href,
    external = false,
    srHint,
    icon = "arrow",
    magnetic = false,
    fullWidth = false,
    cursorLock = false,
    type = "button",
    onClick,
    className,
    children,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...rest
  },
  ref
) {
  const { reduced } = useMotionPreference();
  const fine = usePrefersFinePointer();
  const magnetOn = magnetic && fine && !reduced;
  const cap = Number(rest["data-magnet"]) > 0 ? Number(rest["data-magnet"]) : 12;
  const labelCap = Math.min(7, cap * (7 / 12));

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const sx = useSpring(x, SPRING.magnet);
  const sy = useSpring(y, SPRING.magnet);
  const slx = useSpring(lx, SPRING.magnet);
  const sly = useSpring(ly, SPRING.magnet);
  const rectRef = useRef(null);

  const handleEnter = useCallback(
    (e) => {
      if (magnetOn) rectRef.current = e.currentTarget.getBoundingClientRect();
      onPointerEnter?.(e);
    },
    [magnetOn, onPointerEnter]
  );
  const handleMove = useCallback(
    (e) => {
      if (magnetOn) {
        const r = rectRef.current || e.currentTarget.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        x.set(clamp(dx * 0.35, cap));
        y.set(clamp(dy * 0.35, cap));
        lx.set(clamp(dx * 0.2, labelCap));
        ly.set(clamp(dy * 0.2, labelCap));
      }
      onPointerMove?.(e);
    },
    [magnetOn, cap, labelCap, x, y, lx, ly, onPointerMove]
  );
  const handleLeave = useCallback(
    (e) => {
      rectRef.current = null;
      x.set(0);
      y.set(0);
      lx.set(0);
      ly.set(0);
      onPointerLeave?.(e);
    },
    [x, y, lx, ly, onPointerLeave]
  );

  const Icon = icon && icon !== "none" ? ICONS[icon] : null;
  const isText = variant === "text";
  const classes = cn(
    BASE,
    VARIANTS[variant] || VARIANTS.primary,
    isText ? "gap-1.5" : cn("gap-2", SIZES[size] || SIZES.md),
    fullWidth && "w-full",
    className
  );

  const Label = magnetOn ? m.span : "span";
  const content = (
    <Label className="relative z-[1] inline-flex items-center gap-[inherit]" style={magnetOn ? { x: slx, y: sly } : undefined}>
      <span>{children}</span>
      {external ? <span className="sr-only"> {srHint ?? "(opens in a new tab)"}</span> : null}
      {Icon ? (
        <Icon
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={cn("shrink-0 transition-transform duration-ui ease-ui", ICON_SHIFT[icon])}
        />
      ) : null}
    </Label>
  );

  const shared = {
    ref,
    className: classes,
    onClick,
    onPointerEnter: handleEnter,
    onPointerMove: handleMove,
    onPointerLeave: handleLeave,
    "data-cursor": cursorLock ? "lock" : undefined,
    style: magnetOn ? { x: sx, y: sy } : undefined,
    ...rest,
  };

  if (href) {
    const Tag = magnetOn ? m.a : "a";
    return (
      <Tag href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...shared}>
        {content}
      </Tag>
    );
  }
  const Tag = magnetOn ? m.button : "button";
  return (
    <Tag type={type} {...shared}>
      {content}
    </Tag>
  );
});

export default Button;
