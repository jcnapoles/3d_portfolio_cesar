import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import StatusDot from "@/components/ui/StatusDot";

/**
 * "Available" pill with the signal dot. Renders <a> when `href`, otherwise <span>. No backdrop blur.
 * As a link, an invisible hit area reaches 44 px on coarse pointers without changing the visual size.
 */
const StatusBadge = forwardRef(function StatusBadge({ href, children, className, ...rest }, ref) {
  const Tag = href ? "a" : "span";
  return (
    <Tag
      ref={ref}
      href={href}
      className={cn(
        "relative inline-flex items-center gap-2.5 rounded-pill border border-line-strong bg-space-800/80 px-3 py-1.5 text-small text-ink-1",
        href &&
          "transition-colors duration-ui ease-ui hover:border-ink-3 coarse:before:absolute coarse:before:inset-x-0 coarse:before:-inset-y-1.5 coarse:before:content-['']",
        className
      )}
      {...rest}
    >
      <StatusDot />
      <span>{children}</span>
    </Tag>
  );
});

export default StatusBadge;
