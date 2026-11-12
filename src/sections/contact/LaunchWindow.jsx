import { useCallback, useState } from "react";
import Button from "@/components/ui/Button";
import BookingButton from "@/components/ui/BookingButton";
import HudIndex from "@/components/ui/HudIndex";
import Reveal from "@/components/ui/Reveal";
import { ANCHORS } from "@/constants/site";
import { t } from "@/i18n";
import LaunchPortrait from "./LaunchPortrait";

/**
 * 10a Launch window: Cesar's portrait in orbit in front of an eclipse afterglow sits above the headline (its
 * stage reserves room for the corona, so text never crosses the bright inner corona), then the H2, sub, CTAs and
 * microcopy, all centred. Hovering or focusing the primary CTA sets data-cta-active on the eclipse: the corona
 * brightens (eclipse.css).
 */
export default function LaunchWindow({ eclipseRef }) {
  const [ctaActive, setCtaActive] = useState(false);
  const activate = useCallback(() => setCtaActive(true), []);
  const deactivate = useCallback(() => setCtaActive(false), []);

  return (
    <div className="flex flex-col items-center text-center">
      <HudIndex index="10" name={t({ en: "OPEN CHANNEL", es: "CANAL ABIERTO" })}className="mb-6 lg:mb-8" />

      <LaunchPortrait eclipseRef={eclipseRef} active={ctaActive} />

      <h2 id="contact-title" data-reveal="lines" className="mt-4 max-w-[18ch] text-display-l stretch-115 text-ink-1">
        {t({
          en: (
            <>
              Your next technical decision should be the <span className="text-gold">right</span> one.
            </>
          ),
          es: (
            <>
              Tu próxima decisión técnica debería ser la <span className="text-gold">correcta</span>.
            </>
          ),
        })}
      </h2>

      <Reveal as="p" className="mt-7 max-w-[56ch] text-lead text-ink-2">
        {t({
          en: "Book a 30-minute call. Tell me where you are and where you need to be, and we'll work out whether and how I can help.",
          es: "Agenda una llamada de 30 minutos. Cuéntame dónde estás y adónde necesitas llegar, y veremos si puedo ayudarte y cómo.",
        })}
      </Reveal>

      <Reveal
        delay={0.08}
        className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center"
      >
        <BookingButton
          placement="launch"
          label={t({ en: "Book a 30-min call", es: "Agenda una llamada de 30 min" })}
          size="lg"
          magnetic
          cursorLock
          className="w-full sm:w-auto"
          onPointerEnter={activate}
          onPointerLeave={deactivate}
          onFocus={activate}
          onBlur={deactivate}
        />
        <Button variant="ghost" size="lg" href={`#${ANCHORS.contactForm}`} className="w-full sm:w-auto">
          {t({ en: "Or send a message", es: "O envía un mensaje" })}
        </Button>
      </Reveal>

      <p className="mt-5 text-small text-ink-3">
        {t({ en: "30 minutes. Bring your hardest tech question.", es: "30 minutos. Trae tu pregunta técnica más difícil." })}
      </p>
    </div>
  );
}
