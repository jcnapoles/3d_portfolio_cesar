import { MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import CalendlyButton from "@/components/ui/CalendlyButton";
import ExternalLink from "@/components/ui/ExternalLink";
import LocalTime from "@/components/ui/LocalTime";
import Reveal from "@/components/ui/Reveal";
import useMediaQuery from "@/hooks/useMediaQuery";
import useMotionPreference from "@/hooks/useMotionPreference";
import { LINKS, PERSON } from "@/constants/site";
import Globe from "./Globe";

const ROWS = [
  {
    dt: "CALENDLY · 30 MIN",
    dd: (
      <CalendlyButton
        variant="text"
        placement="contact"
        label="Book a call (Calendly)"
        icon="external"
        className="text-body"
      />
    ),
  },
  { dt: "LINKEDIN", dd: <ExternalLink href={LINKS.linkedin}>linkedin.com/in/jcnapoles</ExternalLink> },
  { dt: "GITHUB", dd: <ExternalLink href={LINKS.github}>github.com/jcnapoles</ExternalLink> },
  {
    dt: "BASE",
    dd: (
      <span className="inline-flex items-start gap-2">
        <MapPin size={16} strokeWidth={1.75} aria-hidden="true" className="mt-[5px] shrink-0 text-ink-3" />
        <span>
          {PERSON.location} · {PERSON.workMode}
        </span>
      </span>
    ),
  },
  { dt: "LOCAL TIME", dd: <LocalTime prefix="TARRAGONA" className="text-[15px] tracking-[.02em]" /> },
  { dt: "LANGUAGES", dd: "English · Spanish" },
];

/**
 * 10b side panel: a <dl> of HUD rows (Calendly, LinkedIn, GitHub, base, local time, languages).
 * Desktop (>= 1024) on a tier-A device also gets the cobe globe above the list.
 */
export default function ChannelPanel({ className }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { tierBase } = useMotionPreference();
  const showGlobe = isDesktop && tierBase === "A";

  return (
    <Reveal delay={0.08} className={cn("card-k1 p-6", className)}>
      {showGlobe ? <Globe className="mb-4" /> : null}
      {/* One column on phones and in the desktop side panel; two columns on tablets, where the panel is full width. */}
      <dl className="flex flex-col sm:max-lg:grid sm:max-lg:grid-cols-2 sm:max-lg:gap-x-10">
        {ROWS.map((row) => (
          <div
            key={row.dt}
            className={
              "flex min-w-0 flex-col gap-2 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0 " +
              "sm:max-lg:[&:nth-child(2)]:pt-0 sm:max-lg:[&:nth-last-child(2)]:border-b-0 sm:max-lg:[&:nth-last-child(2)]:pb-0"
            }
          >
            <dt className="hud-label">{row.dt}</dt>
            <dd className="min-w-0 break-words text-body text-ink-1">{row.dd}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
