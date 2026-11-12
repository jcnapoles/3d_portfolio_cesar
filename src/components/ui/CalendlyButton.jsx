import { forwardRef } from "react";
import Button from "@/components/ui/Button";
import { calendlyUrl, PLACEMENTS } from "@/constants/site";
import { t } from "@/i18n";

const DEFAULT_LABEL = t({ en: "Book a 30-min call", es: "Agenda una llamada de 30 min" });
const SR_HINT = t({ en: "(opens Calendly in a new tab)", es: "(abre Calendly en una pestaña nueva)" });

/**
 * The booking CTA. Always links to calendlyUrl(placement) (UTM-tagged) in a new tab.
 * `placement` must be one of PLACEMENTS. Every other prop is passed to <Button>.
 */
const CalendlyButton = forwardRef(function CalendlyButton({ placement, label = DEFAULT_LABEL, children, ...buttonProps }, ref) {
  if (import.meta.env.DEV && !PLACEMENTS.includes(placement)) {
    // eslint-disable-next-line no-console
    console.warn(`CalendlyButton: unknown placement "${placement}". Use one of PLACEMENTS in src/constants/site.js.`);
  }
  return (
    <Button ref={ref} href={calendlyUrl(placement)} external srHint={SR_HINT} {...buttonProps}>
      {children ?? label}
    </Button>
  );
});

export default CalendlyButton;
