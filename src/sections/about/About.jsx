import { FaLinkedin } from "react-icons/fa";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Picture from "@/components/ui/Picture";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import CalendlyButton from "@/components/ui/CalendlyButton";
import ExternalLink from "@/components/ui/ExternalLink";
import { aboutPortrait } from "@/assets/media";
import { CV_LABEL, LINKS } from "@/constants/site";
import FlightLog from "@/sections/about/FlightLog";
import "./about.css";

// Porthole bezel: 72 ticks every 5 degrees, a longer one every 45, around a 300 x 300 box.
const BEZEL = (() => {
  const point = (deg, r) => {
    const a = (deg * Math.PI) / 180;
    return `${(150 + r * Math.sin(a)).toFixed(2)} ${(150 - r * Math.cos(a)).toFixed(2)}`;
  };
  let minor = "";
  let major = "";
  for (let deg = 0; deg < 360; deg += 5) {
    if (deg % 45 === 0) major += `M${point(deg, 138)}L${point(deg, 146)}`;
    else minor += `M${point(deg, 141.5)}L${point(deg, 145)}`;
  }
  return { minor, major };
})();

function Porthole() {
  return (
    <div className="flex flex-col items-center">
      <div className="about-porthole">
        <svg aria-hidden="true" focusable="false" className="about-bezel" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="149.5" fill="none" style={{ stroke: "var(--line)" }} />
          <path d={BEZEL.minor} fill="none" strokeWidth="1" style={{ stroke: "var(--line-strong)" }} />
          <path d={BEZEL.major} fill="none" strokeWidth="1" style={{ stroke: "var(--hud)" }} />
        </svg>
        <span aria-hidden="true" data-glow="" className="about-corona" />
        <div className="relative size-full overflow-clip rounded-full bg-space-900 shadow-glow-ion ring-1 ring-ion/40">
          <Picture
            image={aboutPortrait}
            alt="Cesar Napoles"
            sizes="240px"
            className="block size-full"
            imgClassName="size-full rounded-full object-cover"
          />
        </div>
      </div>
      <p aria-hidden="true" className="mt-12 text-balance text-center font-mono text-hud-xs uppercase text-ink-3">
        FIG 06.1 — CESAR NAPOLES · TARRAGONA, ES
      </p>
    </div>
  );
}

const Em = ({ children }) => <span className="text-ink-1">{children}</span>;

/** 06 TRAJECTORY: About (porthole + bio + links) and the Flight log. */
export default function About() {
  return (
    <Section id="about" chapter="06" labelledBy="about-title">
      <SectionHeading
        index="06"
        name="TRAJECTORY"
        eyebrow="About"
        title="Hands-on tech leader. Co-founder. Shipping software since 2012."
        id="about-title"
      />

      <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-6">
        <Reveal className="lg:col-span-5">
          <Porthole />
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <p className="max-w-prose text-lead text-ink-2">
            I&apos;m Cesar Napoles, a fractional CTO based in Tarragona, Spain, working with teams remotely and on
            site. For 12+ years I&apos;ve shipped production software, from banking systems at <Em>CaixaBank Tech</Em>,
            where I&apos;m a Senior Technical Lead, to the digital transformation of <Em>FIATC Seguros</Em> and the
            re-architecture of <Em>Sttok</Em>&apos;s platform for 250K+ users. Today I&apos;m also the fractional CTO of{" "}
            <Em>Cashela</Em>, a cross-border B2B payments platform. I co-founded <Em>Closevibe</Em>, an
            AI-powered SaaS for multichannel sales and support, so I know the founder&apos;s side of the table. My job:
            align technology with business outcomes and build teams that deliver.
          </p>
          <p className="mt-5 max-w-prose text-small text-ink-2">
            The chat bubble on this page runs on Closevibe, the AI SaaS I co-founded.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <CalendlyButton placement="about" label="Book a call" size="md" cursorLock className="w-full xs:w-auto" />
            <Button variant="ghost" size="md" href={LINKS.cv} download icon="download" className="w-full xs:w-auto">
              {CV_LABEL}
            </Button>
            <ExternalLink href={LINKS.linkedin} className="inline-flex items-center gap-2 text-button coarse:min-h-11">
              <FaLinkedin size={18} aria-hidden="true" className="shrink-0" />
              LinkedIn
            </ExternalLink>
          </div>
        </Reveal>
      </div>

      <FlightLog />
    </Section>
  );
}
