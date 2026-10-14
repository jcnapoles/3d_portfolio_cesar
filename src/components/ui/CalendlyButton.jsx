import { forwardRef } from "react";
import Button from "@/components/ui/Button";
import { calendlyUrl, PLACEMENTS } from "@/constants/site";

/**
 * The booking CTA. Always links to calendlyUrl(placement) (UTM-tagged) in a new tab.
 * `placement` must be one of PLACEMENTS. Every other prop is passed to <Button>.
 */
const CalendlyButton = forwardRef(function CalendlyButton({ placement, label = "Book a 30-min call", children, ...buttonProps }, ref) {
  if (import.meta.env.DEV && !PLACEMENTS.includes(placement)) {
    // eslint-disable-next-line no-console
    console.warn(`CalendlyButton: unknown placement "${placement}". Use one of PLACEMENTS in src/constants/site.js.`);
  }
  return (
    <Button ref={ref} href={calendlyUrl(placement)} external srHint="(opens Calendly in a new tab)" {...buttonProps}>
      {children ?? label}
    </Button>
  );
});

export default CalendlyButton;
