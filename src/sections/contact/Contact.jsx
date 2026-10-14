import Section from "@/components/ui/Section";
import LaunchWindow from "./LaunchWindow";
import ContactForm from "./ContactForm";
import ChannelPanel from "./ChannelPanel";
import useEclipse from "./useEclipse";
import "./contact.css";

/**
 * 10 OPEN CHANNEL (spec 6.14).
 * 10a LaunchWindow (eclipse + H2 + CTAs), 10b form card (#contact-form) + ChannelPanel, 7/5 on desktop,
 * stacked on mobile with the form first. A successful send fires the eclipse's diamond-ring flare.
 */
export default function Contact() {
  const { eclipseRef, flare } = useEclipse();

  return (
    // overflow-x-clip: the launch afterglow / ambient corona are wider than a phone (up to ~500 px at 375); clip them at
    // the section (full-bleed, so the visible result is unchanged) instead of relying on html's overflow-x alone.
    // clip, not hidden: no scroll container, so the sticky form card keeps working and the corona can still rise
    // above the section vertically.
    <Section id="contact" chapter="10" labelledBy="contact-title" rails={false} className="overflow-x-clip">
      <LaunchWindow eclipseRef={eclipseRef} />
      <div className="mt-20 grid grid-cols-1 gap-6 sm:mt-24 lg:mt-32 lg:grid-cols-12 lg:items-start">
        {/* On tall-enough desktops the form card rides along while the (taller) channel panel scrolls past. */}
        <ContactForm
          className="lg:col-span-7 [@media(min-width:1024px)_and_(min-height:760px)]:sticky [@media(min-width:1024px)_and_(min-height:760px)]:top-28"
          onSuccess={flare}
        />
        <ChannelPanel className="lg:col-span-5" />
      </div>
    </Section>
  );
}
