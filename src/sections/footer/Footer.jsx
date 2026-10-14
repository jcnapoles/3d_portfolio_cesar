import { useRef, useState } from "react";
import { ArrowUp, FileDown } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { scrollToId, scrollToTop } from "@/lib/scroll";
import { CV_LABEL, LINKS } from "@/constants/site";
import { AVAILABILITY } from "@/constants/claims";
import Container from "@/components/ui/Container";
import CalendlyButton from "@/components/ui/CalendlyButton";
import ExternalLink from "@/components/ui/ExternalLink";
import LocalTime from "@/components/ui/LocalTime";
import MissionElapsed from "@/components/ui/MissionElapsed";
import LcpReadout from "@/components/ui/LcpReadout";
import MotionToggle from "@/components/ui/MotionToggle";
import OrbitRing from "@/components/ui/OrbitRing";
import StatusDot from "@/components/ui/StatusDot";
import { VersionSwitchLink } from "@/components/system/VersionSwitch";
import useLenis from "@/hooks/useLenis";
import useInViewport from "@/hooks/useInViewport";
import Wordmark from "@/sections/footer/Wordmark";
import "@/sections/footer/footer.css";

const NAVIGATE = [
  { id: "services", label: "Services" },
  { id: "results", label: "Results" },
  { id: "process", label: "Process" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const LINK = "inline-flex min-h-8 items-center gap-2.5 text-base text-ink-2 transition-colors duration-ui ease-ui hover:text-ink-1 coarse:min-h-11";
// External links: the brand icon + label sit in one group so the trailing ArrowUpRight stays close to the label.
const EXT_LINK = "inline-flex min-h-8 items-center text-base text-ink-2 no-underline transition-colors duration-ui ease-ui hover:text-ink-1 coarse:min-h-11";
const LIST = "mt-5 space-y-1.5 coarse:space-y-0";

/** Keyboard activation (Enter on a link): move focus to the target's heading so Tab continues from there. */
function focusSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const target = section.querySelector("h1, h2") || section;
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
}

function ColumnTitle({ id, children }) {
  return (
    <p id={id} className="hud-label">
      {children}
    </p>
  );
}

/** "Return to launch": small orbit whose satellite loops only while the button is hovered or focused. */
function ReturnToLaunch({ lenis }) {
  const [engaged, setEngaged] = useState(false);
  const onClick = (e) => {
    scrollToTop(lenis);
    // Keyboard users: continue from the top of the page (the navbar home link), not from the footer.
    if (e.detail === 0) document.querySelector("[data-nav-home]")?.focus({ preventScroll: true });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      className="group inline-flex h-10 items-center gap-2 rounded-pill border border-line-strong bg-white/[.04] pl-1.5 pr-4 text-small font-medium text-ink-1 transition-[background-color,border-color] duration-ui ease-ui hover:border-ink-3 hover:bg-white/[.07] coarse:h-11"
    >
      <span aria-hidden="true" className="relative inline-flex h-6 w-10 shrink-0 items-center justify-center">
        <OrbitRing
          width={40}
          height={24}
          rx={16}
          ry={6}
          satellite
          satelliteDuration={3.2}
          paused={!engaged}
          className="absolute inset-0"
        />
        <ArrowUp
          size={13}
          strokeWidth={2}
          className="relative text-ink-2 transition-[color,transform] duration-ui ease-ui group-hover:text-ink-1 motion-ok:group-hover:-translate-y-px"
        />
      </span>
      Return to launch
    </button>
  );
}

/** Footer (spec 6.15): END OF TRANSMISSION. */
export default function Footer() {
  const lenis = useLenis();
  const footerRef = useRef(null);
  // Same contract as <Section>: CSS loops inside (the status ping) pause while the footer is offscreen.
  const onScreen = useInViewport(footerRef, { rootMargin: "200px 0px", once: false, attr: false, initial: false });

  const onAnchor = (e, id) => {
    e.stopPropagation();
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    scrollToId(id, lenis);
    if (e.detail === 0) focusSection(id);
  };

  // flow-root: overflow:clip does not create a block formatting context, so without it the wordmark's
  // negative bottom margin would collapse through the footer instead of sinking the letters under its edge.
  return (
    <footer
      ref={footerRef}
      data-site-footer=""
      data-offscreen={onScreen ? "false" : "true"}
      className="relative z-content flow-root overflow-clip border-t border-line pt-20"
    >
      <Container>
        {/* Row 1 */}
        <div className="flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-line-strong" />
          <span className="hud-label">END OF TRANSMISSION</span>
          <span className="h-px flex-1 bg-line-strong" />
        </div>

        {/* Row 2 */}
        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          <nav aria-labelledby="footer-navigate">
            <ColumnTitle id="footer-navigate">Navigate</ColumnTitle>
            <ul className={LIST}>
              {NAVIGATE.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} onClick={(e) => onAnchor(e, l.id)} className={LINK}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColumnTitle id="footer-connect">Connect</ColumnTitle>
            <ul aria-labelledby="footer-connect" className={LIST}>
              <li>
                <ExternalLink href={LINKS.linkedin} className={EXT_LINK}>
                  <span className="inline-flex items-center gap-2.5">
                    <FaLinkedinIn size={15} aria-hidden="true" />
                    LinkedIn
                  </span>
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href={LINKS.github} className={EXT_LINK}>
                  <span className="inline-flex items-center gap-2.5">
                    <FaGithub size={15} aria-hidden="true" />
                    GitHub
                  </span>
                </ExternalLink>
              </li>
              <li className="pt-1 coarse:pt-0">
                <CalendlyButton variant="text" placement="footer" label="Book a call" className="min-h-8" />
              </li>
            </ul>
          </div>

          <div>
            <ColumnTitle id="footer-resources">Resources</ColumnTitle>
            <ul aria-labelledby="footer-resources" className={LIST}>
              <li>
                <a href={LINKS.cv} download className={LINK}>
                  <FileDown size={16} strokeWidth={1.75} aria-hidden="true" />
                  {CV_LABEL}
                </a>
              </li>
              <li>
                <VersionSwitchLink className={LINK} />
              </li>
            </ul>
          </div>

          <div>
            <ColumnTitle id="footer-status">Status</ColumnTitle>
            <ul aria-labelledby="footer-status" className="mt-5 space-y-3.5">
              <li>
                <LocalTime prefix="TARRAGONA" className="text-hud-xs uppercase text-ink-2" />
              </li>
              {AVAILABILITY.show ? (
                <li className="flex items-start gap-2.5 text-small text-ink-1">
                  <StatusDot className="mt-[0.4375rem]" />
                  {AVAILABILITY.text}
                </li>
              ) : null}
              <li aria-hidden="true">
                <MissionElapsed label="MISSION ELAPSED TIME" className="text-hud-xs uppercase text-ink-3" />
              </li>
              <li className="pt-1.5">
                <ReturnToLaunch lenis={lenis} />
              </li>
            </ul>
          </div>
        </div>

        {/* Row 3 */}
        <div className="mt-16 border-t border-line pt-10 lg:mt-20">
          <p className="max-w-[40ch] text-lead font-medium text-ink-1">
            Fractional CTO for startups and SMEs. Strategy, architecture and teams that ship.
          </p>
          <p className="mt-3 text-small text-ink-2">Based in Tarragona, Spain · Remote &amp; hybrid</p>
        </div>

        {/* Row 4: bottom bar */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-hud-xs uppercase text-ink-3">
          <span>© {new Date().getFullYear()} Cesar Napoles</span>
          <span>Chat assistant powered by Closevibe</span>
          <LcpReadout />
          <MotionToggle className="lg:ml-auto" />
        </div>
      </Container>

      {/* Row 5: giant wordmark, clipped by the footer's bottom edge */}
      <Wordmark aria-hidden="true" trackRef={footerRef} className="mb-[-0.16em] mt-12 lg:mt-16" />
    </footer>
  );
}
