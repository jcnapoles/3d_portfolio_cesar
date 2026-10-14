import { useMemo } from "react";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import NumberTicker from "@/components/ui/NumberTicker";
import Picture from "@/components/ui/Picture";
import ScrambleText from "@/components/ui/ScrambleText";
import Ticks from "@/components/ui/Ticks";
import Reveal from "@/components/ui/Reveal";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { DUR, fadeUp, STAGGER } from "@/lib/motion";
import { companyLogos } from "@/assets/media";
import { FACTS, verifiedClaims } from "@/constants/claims";
import { ANCHORS } from "@/constants/site";
import "./telemetry.css";

/**
 * TLM-01, the featured cell: Closevibe, Cesar's own company, leads the band (owner's call, Oct 2026).
 * Copy from the CV: co-founder and CTO since 2025; the multichannel AI sales and support SaaS he built end to end.
 */
const FEATURED = {
  hud: "Closevibe · 2025–now",
  status: "Live",
  label: "Closevibe, the AI sales & support SaaS I co-founded: WhatsApp, Instagram, Messenger and email on autopilot.",
  caseStudy: { text: "Read the case study", ariaLabel: "Read the Closevibe case study", href: `#${ANCHORS.missions.closevibe}` },
  chat: "It runs the chat on this page",
};

/** "12+", "250K+", "−30%": the plain-text value read by screen readers (the animated one is aria-hidden). */
const displayOf = ({ display, value, prefix = "", suffix = "" }) =>
  display ?? `${prefix}${String(value).replace(/^-/, "−")}${suffix}`;

const numberCell = (key, item, caption = item.source) => ({
  key,
  kind: "number",
  value: item.value,
  format: item.format,
  prefix: item.prefix,
  suffix: item.suffix,
  display: displayOf(item),
  label: item.label,
  caption,
  href: item.href,
});

// Text stats that stand in, in order, when fewer than two claims are verified.
const TEXT_FALLBACKS = [
  { key: "caixabank", kind: "text", text: "Sr. Tech Lead", label: "CaixaBank Tech", caption: "Now" },
  { key: "cashela", kind: "text", text: "Fractional CTO", label: "Cashela, cross-border B2B payments", caption: "Now" },
];

/**
 * The four number cells are deterministic (spec 6.3): two facts, then two claim slots filled from verifiedClaims()
 * in CLAIM_PRIORITY order, each falling back to a text stat. Flipping `verified` in claims.js is the only edit needed.
 */
function buildCells() {
  const claims = verifiedClaims().slice(0, 2).map((c) => numberCell(c.key, c));
  const fallbacks = TEXT_FALLBACKS.slice(0, 2 - claims.length);
  return [numberCell("yearsShipping", FACTS.yearsShipping), numberCell("sttokUsers", FACTS.sttokUsers), ...claims, ...fallbacks];
}

// Hairlines: a 2x2 cross below 1024, vertical dividers between 4 cells from 1024 (divide-x look).
const CELL_EDGES = [
  "border-r pb-8 pr-4 sm:pr-6 lg:border-r-0 lg:pb-0 lg:pl-0 lg:pr-8",
  "pb-8 pl-4 sm:pl-6 lg:border-l lg:pb-0 lg:px-8",
  "border-r border-t pt-8 pr-4 sm:pr-6 lg:border-l lg:border-r-0 lg:border-t-0 lg:pt-0 lg:px-8",
  "border-t pt-8 pl-4 sm:pl-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-8 lg:pr-0",
];

const hudIndex = (i) => `TLM-${String(i).padStart(2, "0")}`;

function StatValue({ cell }) {
  if (cell.kind === "text") {
    return (
      <p className="mt-5 self-end text-ink-1">
        <ScrambleText trigger="inview" text={cell.text} className="tlm-value-text block text-stat-text stretch-112" />
      </p>
    );
  }
  const negative = cell.value < 0;
  const sign = negative ? "−" : cell.prefix;
  return (
    <p className="tlm-value mt-5 self-end whitespace-nowrap text-stat stretch-112 tabular text-ink-1">
      <span className="sr-only">{cell.display}</span>
      <span aria-hidden="true">
        {sign ? <span className="text-ion">{sign}</span> : null}
        <NumberTicker value={Math.abs(cell.value)} format={cell.format} />
        {cell.suffix ? <span className="text-ion">{cell.suffix}</span> : null}
      </span>
    </p>
  );
}

/** Caption text with the icon glued to the last word, so a wrapped caption never strands its arrow. */
function CaptionText({ text, Icon, iconClassName }) {
  if (!Icon) return text;
  const cut = text.lastIndexOf(" ");
  return (
    <>
      {cut >= 0 ? text.slice(0, cut + 1) : null}
      <span className="whitespace-nowrap">
        {cut >= 0 ? text.slice(cut + 1) : text}
        <Icon size={12} strokeWidth={2} aria-hidden="true" className={cn("ml-1.5 inline-block align-[-1px]", iconClassName)} />
      </span>
    </>
  );
}

// Same box for links and plain captions (44 px tall on coarse pointers), so footers line up across cells.
const CAPTION_BASE = "inline-block font-mono text-[12px] leading-5 text-ink-3 coarse:py-3";
const CAPTION_LINK =
  "group/cap rounded-xs transition-colors duration-ui ease-ui hover:text-ink-1 focus-visible:text-ink-1 motion-off:transition-none";
const CAPTION_ARROW =
  "transition-transform duration-ui ease-ui motion-ok:group-hover/cap:translate-x-0.5 motion-ok:group-focus-visible/cap:translate-x-0.5";

function Caption({ cell }) {
  if (cell.href) {
    return (
      <a href={cell.href} className={cn(CAPTION_BASE, CAPTION_LINK)}>
        <CaptionText text={cell.caption} Icon={ArrowRight} iconClassName={CAPTION_ARROW} />
      </a>
    );
  }
  return (
    <span className={CAPTION_BASE}>
      <CaptionText text={cell.caption} Icon={cell.captionIcon === "chat" ? ArrowDownRight : null} />
    </span>
  );
}

/**
 * TLM-01: the featured Closevibe cell, a full row on top of the band (the numbers keep their full size below).
 * A lit panel (ion hairline border, static gold spark on the top edge, soft ion glow): no loops.
 * Phone: stacked (HUD, logo, role, line, ruler, captions). From 768: logo | role + line, side by side.
 */
function FeaturedCell({ variants }) {
  return (
    <Reveal as="li" variants={variants} className="tlm-feature">
      <div className="flex items-start justify-between gap-4">
        {/* Decorative HUD label, two stacked lines like the number cells; the content below says it in full. */}
        <p aria-hidden="true" className="hud-label">
          <span className="block">{hudIndex(1)}</span>
          <span className="mt-1.5 block">{FEATURED.hud}</span>
        </p>
        <p aria-hidden="true" className="hud-label inline-flex items-center gap-2 text-signal">
          <span className="size-1.5 rounded-full bg-signal" />
          {FEATURED.status}
        </p>
      </div>

      <div className="tlm-feature-body mt-6 md:mt-7">
        <Picture
          image={companyLogos.closevibeLogo}
          alt="Closevibe"
          className="block shrink-0"
          imgClassName="tlm-feature-logo block h-8 w-auto md:h-10 lg:h-11"
        />
        <div className="tlm-feature-copy mt-5 md:mt-0">
          <p className="tlm-feature-stat text-stat-text stretch-112 text-ink-1">
            Co-founder <span className="text-ion">&amp;</span> CTO
          </p>
          <p className="mt-3 max-w-[56ch] text-small text-ink-2">{FEATURED.label}</p>
        </div>
      </div>

      <div className="mt-6 lg:mt-7">
        <Ticks count={80} />
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6">
          <a href={FEATURED.caseStudy.href} aria-label={FEATURED.caseStudy.ariaLabel} className={cn(CAPTION_BASE, CAPTION_LINK)}>
            <CaptionText text={FEATURED.caseStudy.text} Icon={ArrowRight} iconClassName={CAPTION_ARROW} />
          </a>
          {/* Plain note (not a control), so no 44 px touch box: it would only add height on phones. */}
          <span className="inline-block font-mono text-[12px] leading-5 text-ink-3">
            <CaptionText text={FEATURED.chat} Icon={ArrowDownRight} />
          </span>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * 6.3 Telemetry band (#telemetry, chapter 00). Closevibe first (featured), then four honest numbers.
 * Each number cell: HUD label (aria-hidden, repeats the caption) / value / label / ruler / source caption.
 */
export default function Telemetry() {
  const cells = buildCells();
  const fourUp = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Snappy reveals (<= 500 ms, STAGGER.stats = 60 ms between cells). Each cell observes itself, so on the 2x2
  // phone/tablet grid a row reveals as soon as it enters; across the 4-up desktop row the per-index delay gives
  // the staggerParent({ stagger: STAGGER.stats }) timing. The featured cell observes itself too.
  const variants = useMemo(() => {
    const y = isMobile ? 12 : 16;
    const duration = Math.min(DUR.reveal, 0.5);
    return {
      featured: fadeUp({ y, duration }),
      cells: cells.map((_, i) => fadeUp({ y, duration, delay: (fourUp ? i : i % 2) * STAGGER.stats })),
    };
    // cells.length is constant (4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fourUp, isMobile]);

  return (
    <Section id="telemetry" chapter="00" tone="band" labelledBy="telemetry-title">
      <SectionHeading srOnly id="telemetry-title" title="Track record in numbers" />
      <ul role="list" className="tlm-grid">
        <FeaturedCell variants={variants.featured} />
        {cells.map((cell, i) => (
          <Reveal as="li" key={cell.key} variants={variants.cells[i]} className={cn("tlm-cell border-line", CELL_EDGES[i])}>
            {/* HUD label "TLM-0n · CAPTION" set as two stacked lines (the line break is the separator), so a
                long caption never breaks mid-label in a narrow cell. Decorative: the caption is repeated below. */}
            <p aria-hidden="true" className="hud-label self-start">
              <span className="block">{hudIndex(i + 2)}</span>
              <span className="mt-1.5 block">{cell.caption}</span>
            </p>
            <StatValue cell={cell} />
            <p className="mt-3 max-w-[28ch] text-small text-ink-2">{cell.label}</p>
            <div className="tlm-foot mt-6 self-start">
              <Ticks count={40} />
              <div className="mt-3">
                <Caption cell={cell} />
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
