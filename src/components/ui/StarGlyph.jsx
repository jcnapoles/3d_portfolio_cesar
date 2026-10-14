import { cn } from "@/lib/cn";

/** "First Light" 4-point star. Logo mark, bullets, separators, spinner, progress head. aria-hidden unless `title`. */
export default function StarGlyph({ size = 12, className, title, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={cn("shrink-0", className)}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 .5 L13 11 L23.5 12 L13 13 L12 23.5 L11 13 L.5 12 L11 11 Z" />
      <path opacity=".6" d="M9 9 L12 11.3 L15 9 L12.7 12 L15 15 L12 12.7 L9 15 L11.3 12 Z" />
      <circle cx="12" cy="12" r="1.8" />
    </svg>
  );
}
