import { forwardRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";

const NEW_TAB = t({ en: "(opens in a new tab)", es: "(se abre en una pestaña nueva)" });

/**
 * External link: new tab, rel="noopener noreferrer", ArrowUpRight (14 px) and an sr-only hint.
 * Default look is `.link-ion`; override colours with utilities in `className`.
 */
const ExternalLink = forwardRef(function ExternalLink(
  { href, children, srHint = NEW_TAB, className, showIcon = true, ...rest },
  ref
) {
  return (
    <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" className={cn("link-ion", className)} {...rest}>
      {children}
      <span className="sr-only"> {srHint}</span>
      {showIcon ? (
        <ArrowUpRight
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className="ml-1 inline-block align-[-0.125em]"
        />
      ) : null}
    </a>
  );
});

export default ExternalLink;
