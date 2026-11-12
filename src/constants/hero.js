// Hero (spec 6.2) copy and data. Numbers come only from claims.js (FACTS / verified CLAIMS).
import { CLAIMS, FACTS, sttokMetricKey } from "@/constants/claims";
import { ANCHORS } from "@/constants/site";
import { t } from "@/i18n";

export const HERO_COPY = {
  eyebrow: t({ en: "FRACTIONAL CTO FOR STARTUPS & SMES", es: "CTO FRACCIONAL PARA STARTUPS Y PYMES" }),
  subtitle: t({ en: "Without the full-time CTO.", es: "Sin un CTO a tiempo completo." }),
  lead: t({
    en: "I help founders and leadership teams make the right technical calls, scale their platforms and build engineering teams that ship. Hands-on, with 12+ years across banking, fintech, insurance and e-commerce.",
    es: "Ayudo a fundadores y equipos directivos a tomar las decisiones técnicas correctas, escalar sus plataformas y formar equipos de ingeniería que entregan. Con implicación directa y más de 12 años en banca, fintech, seguros y e-commerce.",
  }),
  primaryCta: t({ en: "Book a 30-min call", es: "Agenda una llamada de 30 min" }),
  secondaryCta: t({ en: "See results", es: "Ver resultados" }),
  microcopy: t({ en: "30 minutes. Bring your hardest tech question.", es: "30 minutos. Trae tu pregunta técnica más difícil." }),
  portraitAlt: t({ en: "Cesar Napoles, fractional CTO", es: "Cesar Napoles, CTO fraccional" }),
  stripLabel: t({ en: "Where I've built and led technology", es: "Donde he construido y liderado tecnología" }),
  stripAria: t({ en: "Companies where Cesar has built and led technology", es: "Empresas donde Cesar ha construido y liderado tecnología" }),
};

/**
 * Proof chips (value is uppercased with CSS; the DOM keeps natural case for screen readers).
 * Closevibe leads (Cesar's own company, featured first across the hero and the telemetry band).
 * The last chip is the single Sttok metric: sttokP95 when verified, else sttokInfraSpend (lead addendum),
 * else no chip. Flipping a claim in claims.js is the only edit needed.
 */
const STTOK_METRIC_CHIP = {
  sttokP95: { unit: t({ en: "p95 latency", es: "latencia p95" }), label: "Sttok" },
  sttokInfraSpend: {
    unit: t({ en: "infra spend", es: "gasto en infra" }),
    label: t({ en: "Sttok AWS projection", es: "Proyección AWS de Sttok" }),
    ariaLabel: t({
      en: "Sttok case study: 30% lower projected infrastructure spend",
      es: "Caso de estudio de Sttok: 30% menos de gasto proyectado en infraestructura",
    }),
  },
};

export function getProofChips() {
  const users = FACTS.sttokUsers.display;
  const chips = [
    { key: "closevibe", value: t({ en: "Co-founder & CTO", es: "Cofundador y CTO" }), label: "Closevibe", href: `#${ANCHORS.missions.closevibe}` },
    {
      key: "sttok-users",
      value: t({ en: `${users} users`, es: `${users} usuarios` }),
      label: t({ en: "Architecture at Sttok", es: "Arquitectura en Sttok" }),
      href: `#${ANCHORS.missions.sttok}`,
      ariaLabel: t({ en: `Sttok case study: architecture for ${users} users`, es: `Caso de estudio de Sttok: arquitectura para ${users} usuarios` }),
    },
    { key: "caixabank", value: "Sr. Tech Lead", label: "CaixaBank Tech", href: "#about" },
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
  { key: "caixabank", tag: t({ en: "ORBIT", es: "ÓRBITA" }), text: "CAIXABANK TECH — SR. TECH LEAD", t: 60, row: 1.06 },
  { key: "closevibe", tag: t({ en: "ORBIT", es: "ÓRBITA" }), text: t({ en: "CLOSEVIBE — CO-FOUNDER & CTO", es: "CLOSEVIBE — COFUNDADOR Y CTO" }), t: 40, row: 1.135 },
];

/**
 * Trust strip, in this order (keys of companyLogos in src/assets/media.js). `scale` is the per-logo optical scale
 * (1 = 24 px desktop / 22 px mobile height box). Closevibe leads with its real logo (mark + wordmark lockup).
 * Nine logos: a 3 x 3 grid on phones, rows of 5 + 4 (the last row centred) from 640, one row from 1280.
 * One row: the scale spills past each layout box, so every scaled-up logo (CaixaBank, Isern, Amaris) sits next to
 * a scaled-down one.
 * Never UCI or RIU.
 */
export const TRUST_LOGOS = [
  { key: "closevibeLogo", scale: 1 },
  { key: "sttok", scale: 0.74 },
  { key: "caixabanktech", scale: 1.08 },
  { key: "isern", scale: 1.3 },
  { key: "cashelaLogo", scale: 0.92 },
  { key: "amaris", scale: 1.16 },
  { key: "1234ticketLogo", scale: 0.9 },
  { key: "indra", scale: 0.84 },
  { key: "fiatc", scale: 0.94 },
];

/** Galaxy palette and fallback focal points (GL coordinates: x from the left, y from the bottom). */
export const GALAXY = {
  starColors: ["#FFF6E8", "#FFD08A", "#CFEFFF", "#FFFFFF"],
  focal: { A: [0.72, 0.42], B: [0.5, 0.3] },
};
