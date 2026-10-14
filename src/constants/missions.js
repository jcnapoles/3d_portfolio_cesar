// Missions (spec 6.6). Copy is CV-synced; numbers come only from src/constants/claims.js (verified gating).
import { ANCHORS } from "@/constants/site";
import { CLAIMS, sttokMetricKey } from "@/constants/claims";

// Lead rule: where a single Sttok metric fits, prefer sttokP95 when verified, else sttokInfraSpend.
// With neither verified, the card falls back to "250K+" (fallbackMetric).
const sttokKey = sttokMetricKey();
const sttokMetric = sttokKey
  ? { claim: sttokKey, label: CLAIMS[sttokKey].label }
  : { claim: "sttokP95", label: "p95 query latency" };

/**
 * Extra fields beyond the spec's data shape (all optional, all presentation-only):
 * - metaLabel: the first HUD-row label ("Client" by default; Closevibe is Cesar's own company).
 * - diagramCaption: the panel caption (FIG 03.n).
 * - diagramAlt: plain-language description of the diagram for assistive tech (no facts beyond the copy).
 */
export const MISSIONS = [
  {
    id: ANCHORS.missions.sttok, code: "MSN-01", years: "2024–2025", company: "Sttok", period: "NOV 2024 – FEB 2025",
    role: "Fractional CTO / External Tech Lead",
    title: "Sttok: re-architecting for 250K+ users",
    challenge: "Scale the platform from 50K to 250K+ active users.",
    did: [
      "Led the architecture redesign and the key technology decisions",
      "Directed the full AWS migration: infrastructure, CI/CD pipelines, Cognito authentication and VPC networking",
      "Tuned MongoDB Atlas performance: indexing strategies, ESR rules and Atlas Search",
      "Set up monitoring, alerting and cost-optimization frameworks",
    ],
    metric: sttokMetric,
    fallbackMetric: { display: "250K+", label: "active users the new architecture was built to support" },
    changed: "A production-ready AWS environment, built to scale from 50K to 250K+ users.",
    quote: { text: "…Cesar led our cloud migration and architecture modernization—AWS, security, and performance—enabling faster releases and stability.", name: "Erasmo Garcia", role: "CTO, Sttok", photo: "erasmo", linkedin: "https://www.linkedin.com/in/erasmogarciaglez" },
    diagram: "sttok",
    diagramCaption: "FIG 03.1 — SCALE TRANSFER",
    diagramAlt: "Diagram: the Sttok platform at the core, moving from an inner 50K orbit to an outer 250K+ orbit, with CI/CD, Cognito, VPC and Atlas Search on the outer ring.",
  },
  {
    id: ANCHORS.missions.fiatc, code: "MSN-02", years: "2023–2024", company: "FIATC Seguros", period: "JAN 2023 – OCT 2024",
    role: "Fractional CTO / External Tech Lead",
    title: "FIATC Seguros: digital transformation at an established insurer",
    challenge: "Modernize internal systems at one of Spain's established insurance companies, starting with a legacy intranet CMS.",
    did: [
      "Led the full redesign and migration of the corporate intranet to Liferay, replacing a legacy CMS",
      "Directed vendor evaluations, technical audits and roadmap planning",
      "Introduced CI/CD automation, agile practices and DevOps culture",
      "Aligned technology objectives with C-level stakeholders",
    ],
    metric: { claim: "fiatcAdoption", label: "internal adoption" },
    fallbackMetric: null,
    changed: "A scalable Liferay intranet replaced the legacy CMS, with a modernization roadmap agreed at C-level.",
    quote: null, diagram: "fiatc",
    diagramCaption: "FIG 03.2 — INTRANET MIGRATION",
    diagramAlt: "Diagram: a legacy intranet CMS transferring to Liferay, above a timeline of audit, roadmap and CI/CD.",
  },
  {
    id: ANCHORS.missions.flyr, code: "MSN-03", years: "2023–2025", company: "Flyr", period: "MAR 2023 – SEP 2025",
    role: "Lead Engineer & Frontend Architect",
    title: "Flyr: one codebase, many airline brands",
    challenge: "Launch white-label airline apps for new carriers without rebuilding the frontend each time.",
    did: [
      "Led the frontend architecture for white-label airline web apps across four international carriers",
      "Defined a modular, component-driven architecture with shared core libraries",
      "Introduced micro-frontends so brand-specific UIs deploy independently",
      "Integrated reservation, disruption-management and multi-channel communication services",
    ],
    metric: { claim: "flyrTimeToMarket", label: "faster time-to-market for new airline clients" },
    fallbackMetric: null,
    changed: "New airline brands launch from one shared core instead of a rebuilt frontend.",
    quote: null, diagram: "flyr",
    diagramCaption: "FIG 03.3 — WHITE-LABEL ARCHITECTURE",
    diagramAlt: "Diagram: a shared core connected through a micro-frontends ring to four carrier brands, A to D.",
  },
  {
    id: ANCHORS.missions.isern, code: "MSN-04", years: "2018–2021", company: "Isern Patentes y Marcas", period: "JUL 2018 – MAY 2021",
    role: "Software Engineer",
    title: "Isern Patentes y Marcas: from legacy to cloud",
    challenge: "Modernize the firm's legacy internal applications and move them to the cloud.",
    did: [
      "Migrated legacy monoliths to cloud-native architectures on AWS and Azure",
      "Rebuilt core applications with Java, Spring Boot, Angular and React",
      "Automated delivery with Jenkins and GitLab CI/CD",
      "Built IsernTools, a web platform for the intellectual-property sector, including an AI-powered document similarity detector developed with UPC",
    ],
    metric: { claim: "isernUptime", label: "system uptime" },
    fallbackMetric: null,
    changed: "Legacy monoliths replaced by cloud-native applications on AWS and Azure, shipped through automated pipelines.",
    quote: { text: "…he modernized legacy applications, migrated us to the cloud, and built reliable solutions that our team still depends on every day.", name: "Jorge Isern", role: "Director & Managing Partner, Isern Patentes y Marcas", photo: "jorge", linkedin: "https://www.linkedin.com/in/jorgeisern/" },
    diagram: "isern",
    diagramCaption: "FIG 03.4 — LEGACY TO CLOUD",
    diagramAlt: "Diagram: a legacy monolith resolving into AWS and Azure, delivered through Jenkins and GitLab CI pipelines.",
  },
  {
    id: ANCHORS.missions.closevibe, code: "MSN-05", years: "2025–NOW", company: "Closevibe", period: "2025 – NOW",
    role: "Co-founder & CTO",
    metaLabel: "Company",
    title: "Closevibe: an AI SaaS, co-founded and built from zero",
    challenge: "Automate sales and customer-service conversations across messaging channels for e-commerce businesses.",
    did: [
      "Architected a multi-tenant conversational AI platform from scratch",
      "Designed a RAG-based agent system with intent detection, semantic vector search (pgvector) and real-time conversation orchestration",
      "Built the stack end to end: Python/FastAPI, React, PostgreSQL with pgvector, Docker on GCP and Railway",
      "Integrated Meta Business APIs (WhatsApp, Instagram, Messenger) and email",
    ],
    metric: null,
    fallbackMetric: { display: "Live", label: "closevibe.com", href: "https://www.closevibe.com/" },
    changed: "The chat bubble on this page runs on Closevibe. Try it.",
    quote: null, diagram: "closevibe",
    diagramCaption: "FIG 03.5 — LIVE PRODUCT",
    diagramAlt: "Diagram: the Closevibe product, with WhatsApp, Instagram, Messenger and email channels connected to its AI assistant.",
  },
];

export const MISSIONS_FOOTER = {
  line: "Today I'm a Senior Technical Lead at CaixaBank Tech, building banking applications for one of Spain's largest financial institutions.",
};
