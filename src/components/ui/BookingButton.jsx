import { forwardRef } from "react";
import Button from "@/components/ui/Button";
import { bookingUrl, PLACEMENTS } from "@/constants/site";
import { t } from "@/i18n";

const DEFAULT_LABEL = t({ en: "Book a 30-min call", es: "Agenda una llamada de 30 min" });
const SR_HINT = t({ en: "(opens Closevibe in a new tab)", es: "(abre Closevibe en una pestaña nueva)" });

/**
 * The booking CTA. Always links to bookingUrl(placement) (Closevibe booking page in the page's language,
 * UTM-tagged) in a new tab. `placement` must be one of PLACEMENTS. Every other prop is passed to <Button>.
 */
const BookingButton = forwardRef(function BookingButton({ placement, label = DEFAULT_LABEL, children, ...buttonProps }, ref) {
  if (import.meta.env.DEV && !PLACEMENTS.includes(placement)) {
    // eslint-disable-next-line no-console
    console.warn(`BookingButton: unknown placement "${placement}". Use one of PLACEMENTS in src/constants/site.js.`);
  }
  return (
    <Button ref={ref} href={bookingUrl(placement)} external srHint={SR_HINT} {...buttonProps}>
      {children ?? label}
    </Button>
  );
});

export default BookingButton;
