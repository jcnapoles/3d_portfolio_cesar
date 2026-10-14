// Hero (spec 6.2) copy and data. Numbers come only from claims.js (FACTS / verified CLAIMS).
import { CLAIMS, FACTS, sttokMetricKey } from "@/constants/claims";
import { ANCHORS } from "@/constants/site";

export const HERO_COPY = {
  eyebrow: "FRACTIONAL CTO FOR STARTUPS & SMES",
  subtitle: "Without the full-time CTO.",
  lead:
    "I help founders and leadership teams make the right technical calls, scale their platforms and build engineering teams that ship. Hands-on, with 12+ years across banking, fintech, insurance, aviation and e-commerce.",
  primaryCta: "Book a 30-min call",
  secondaryCta: "See results",
  microcopy: "30 minutes. Bring your hardest tech question.",
  portraitAlt: "Cesar Napoles, fractional CTO",
  stripLabel: "Where I've built and led technology",
  stripAria: "Companies where Cesar has built and led technology",
};

/**
 * Proof chips (value is uppercased with CSS; the DOM keeps natural case for screen readers).
 * Chip 4 is the single Sttok metric: sttokP95 when verified, else sttokInfraSpend (lead addendum),
 * else no chip. Flipping a claim in claims.js is the only edit needed.
 */
const STTOK_METRIC_CHIP = {
  sttokP95: { unit: "p95 latency", label: "Sttok" },
  sttokInfraSpend: {
    unit: "infra spend",
    label: "Sttok AWS projection",
    ariaLabel: "Sttok case study: 30% lower projected infrastructure spend",
  },
};

export function getProofChips() {
  const users = FACTS.sttokUsers.display;
  const chips = [
    {
      key: "sttok-users",
      value: `${users} users`,
      label: "Architecture at Sttok",
      href: `#${ANCHORS.missions.sttok}`,
      ariaLabel: `Sttok case study: architecture for ${users} users`,
    },
    { key: "caixabank", value: "Sr. Tech Lead", label: "CaixaBank Tech", href: "#about" },
    { key: "closevibe", value: "Co-founder & CTO", label: "Closevibe", href: `#${ANCHORS.missions.closevibe}` },
  ];
  const metric = sttokMetricKey();
  if (metric && STTOK_METRIC_CHIP[metric]) {
    const claim = CLAIMS[metric];
    const chip = STTOK_METRIC_CHIP[metric];
    chips.push({
      key: metric,
      value: `${claim.display} ${chip.unit}`,
      label: chip.label,
      href: claim.href || `#${ANCHORS.missions.sttok}`,
      ariaLabel: chip.ariaLabel,
    });
  }
  return chips;
}

/** Leader readouts (>= 1280, aria-hidden). `t` is the anchor angle on the front ring, in degrees. */
export const LEADER_READOUTS = [
  { key: "caixabank", tag: "ORBIT", text: "CAIXABANK TECH — SR. TECH LEAD", t: 60, row: 1.06 },
  { key: "closevibe", tag: "ORBIT", text: "CLOSEVIBE — CO-FOUNDER & CTO", t: 40, row: 1.135 },
];

/**
 * Trust strip, in this order. `scale` is the per-logo optical scale (1 = 24 px desktop / 22 px mobile cap height box).
 * Closevibe is a typeset wordmark (the raster logo has a baked glow). Never UCI or RIU.
 */
export const TRUST_LOGOS = [
  { key: "caixabanktech", scale: 1.08 },
  { key: "closevibe", wordmark: "Closevibe" },
  { key: "fiatc", scale: 0.94 },
  { key: "sttok", scale: 0.74 },
  { key: "flyr", scale: 0.8 },
  { key: "indra", scale: 0.84 },
  { key: "isern", scale: 1.3 },
  { key: "amaris", scale: 1.16 },
];

/** Galaxy palette and fallback focal points (GL coordinates: x from the left, y from the bottom). */
export const GALAXY = {
  starColors: ["#FFF6E8", "#FFD08A", "#CFEFFF", "#FFFFFF"],
  focal: { A: [0.72, 0.42], B: [0.5, 0.3] },
};
