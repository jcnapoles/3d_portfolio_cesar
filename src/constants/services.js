// Services (spec 6.5, chapter 02 FLIGHT MODES). Copy is final.
// Proof lines are composed by ServiceTile from claims.js: a verified claim is the only way a number reaches a proof line.
//
// proof shape:
//   base                 always-true sentence (facts only)
//   verifiedVariant      { claim, text }  replaces `base` when CLAIMS[claim].verified
//   appendIfVerified     list of:
//                          { claim, text }      appended when CLAIMS[claim].verified
//                          { sttokMetric: {...} } one Sttok metric, resolved with sttokMetricKey():
//                                               sttokP95 when verified, else sttokInfraSpend, else nothing.
import { t } from "@/i18n";

export const SERVICES_HEADING = {
  index: "02",
  name: t({ en: "FLIGHT MODES", es: "MODOS DE VUELO" }),
  eyebrow: t({ en: "Services", es: "Servicios" }),
  title: t({ en: "Four ways I can help", es: "Cuatro formas de ayudarte" }),
  lead: t({ en: "Pick the one that matches where you are today.", es: "Elige la que encaje con el punto en el que estás hoy." }),
  id: "services-title",
};

export const SERVICES = [
  {
    key: "fcto",
    title: t({ en: "Fractional CTO", es: "CTO fraccional" }),
    placement: "svc-fcto",
    cta: t({ en: "Discuss a fractional engagement", es: "Hablemos de una colaboración fraccional" }),
    featured: true,
    for: t({
      en: "Startups and SMEs that need senior tech leadership without a full-time executive hire.",
      es: "Startups y pymes que necesitan liderazgo técnico sénior sin contratar a un directivo a tiempo completo.",
    }),
    get: [
      t({ en: "Tech strategy aligned with your product vision", es: "Estrategia tecnológica alineada con tu visión de producto" }),
      t({ en: "Roadmap planning", es: "Planificación del roadmap" }),
      t({ en: "Vendor evaluations and technical audits", es: "Evaluación de proveedores y auditorías técnicas" }),
      t({ en: "A senior voice in every technical decision", es: "Una voz sénior en cada decisión técnica" }),
    ],
    proof: {
      base: t({
        en: "Led FIATC Seguros' intranet migration to Liferay and Sttok's AWS migration and re-architecture.",
        es: "Lideré la migración de la intranet de FIATC Seguros a Liferay y la migración a AWS y rediseño de la arquitectura de Sttok.",
      }),
      verifiedVariant: {
        claim: "fiatcAdoption",
        text: t({
          en: "Led FIATC Seguros' intranet migration to Liferay (+45% internal adoption) and Sttok's AWS migration and re-architecture.",
          es: "Lideré la migración de la intranet de FIATC Seguros a Liferay (+45% de adopción interna) y la migración a AWS y rediseño de la arquitectura de Sttok.",
        }),
      },
    },
  },
  {
    key: "arch",
    title: t({ en: "Architecture & Scale", es: "Arquitectura y escalado" }),
    placement: "svc-arch",
    cta: t({ en: "Get an architecture review", es: "Pide una revisión de arquitectura" }),
    for: t({
      en: "Products hitting performance, reliability or cloud-cost limits.",
      es: "Productos que chocan con límites de rendimiento, fiabilidad o coste cloud.",
    }),
    get: [
      t({ en: "Architecture review and redesign", es: "Revisión y rediseño de arquitectura" }),
      t({ en: "Cloud migration (AWS, Azure, GCP)", es: "Migración a la nube (AWS, Azure, GCP)" }),
      t({ en: "Database performance tuning", es: "Optimización del rendimiento de bases de datos" }),
      t({ en: "Monitoring, alerting and cost-optimization frameworks", es: "Marcos de monitorización, alertas y optimización de costes" }),
    ],
    proof: {
      base: t({
        en: "An architecture built to scale Sttok from 50K to 250K+ users.",
        es: "Una arquitectura diseñada para escalar Sttok de 50K a 250K+ usuarios.",
      }),
      appendIfVerified: [
        {
          // Lead rule: where one Sttok metric fits, prefer sttokP95 when verified, else sttokInfraSpend.
          // sttokInfraSpend wording follows the CV: TCO projections "reducing projected infrastructure spend by 30%".
          sttokMetric: {
            sttokP95: t({ en: " Query latency at p95 cut by 70%.", es: " Latencia de consultas en p95 reducida un 70%." }),
            sttokInfraSpend: t({
              en: " Projected infrastructure spend cut by 30% through AWS TCO analysis.",
              es: " Gasto proyectado en infraestructura reducido un 30% mediante análisis de TCO en AWS.",
            }),
          },
        },
        { claim: "isernUptime", text: t({ en: " 99.5% uptime at Isern.", es: " 99.5% de disponibilidad en Isern." }) },
      ],
    },
  },
  {
    key: "lead",
    title: t({ en: "Engineering Leadership", es: "Liderazgo de ingeniería" }),
    placement: "svc-lead",
    cta: t({ en: "Level up my team", es: "Impulsa a mi equipo" }),
    for: t({
      en: "Teams that need standards, delivery rhythm and a senior lead.",
      es: "Equipos que necesitan estándares, ritmo de entrega y un líder sénior.",
    }),
    get: [
      t({ en: "Coding standards, code reviews and architectural decisions", es: "Estándares de código, code reviews y decisiones de arquitectura" }),
      t({ en: "CI/CD and DevOps practices", es: "Prácticas de CI/CD y DevOps" }),
      t({ en: "Agile delivery and stakeholder alignment", es: "Entrega ágil y alineación con stakeholders" }),
      t({ en: "Hiring support and technical interviews", es: "Apoyo en contratación y entrevistas técnicas" }),
    ],
    proof: {
      base: t({
        en: "Senior Technical Lead across distributed teams at CaixaBank Tech; led cross-functional delivery teams at Amaris Consulting.",
        es: "Senior Technical Lead de equipos distribuidos en CaixaBank Tech; lideré equipos multidisciplinares de entrega en Amaris Consulting.",
      }),
    },
  },
  {
    key: "build",
    title: t({ en: "0-to-1 Product Build", es: "Producto de 0 a 1" }),
    placement: "svc-build",
    cta: t({ en: "Plan my build", es: "Planifica mi producto" }),
    for: t({
      en: "Founders who need an MVP or AI-powered product designed and shipped by someone who has done it themselves.",
      es: "Fundadores que necesitan un MVP o un producto con IA diseñado y lanzado por alguien que ya lo ha hecho por sí mismo.",
    }),
    get: [
      t({ en: "Architecture from scratch", es: "Arquitectura desde cero" }),
      t({ en: "Full-stack build (React, Node.js, Python, Java)", es: "Desarrollo full-stack (React, Node.js, Python, Java)" }),
      t({ en: "AI/LLM integration (assistants, RAG)", es: "Integración de IA/LLM (asistentes, RAG)" }),
      t({ en: "A launch-ready cloud setup", es: "Infraestructura cloud lista para el lanzamiento" }),
    ],
    proof: {
      base: t({
        en: "Co-founded and built Closevibe, a multichannel AI sales and support SaaS, end to end.",
        es: "Cofundé y construí de principio a fin Closevibe, un SaaS multicanal de ventas y soporte con IA.",
      }),
    },
  },
];

/** Company names highlighted in text-ion inside proof lines (longest first so multi-word names win). */
export const PROOF_COMPANIES = ["Amaris Consulting", "CaixaBank Tech", "FIATC Seguros", "Closevibe", "Sttok", "Isern"];

/** The line under the bento. */
export const SERVICES_UNSURE = {
  text: t({ en: "Not sure which fits? That's what the 30-min call is for.", es: "¿No sabes cuál encaja? Para eso es la llamada de 30 min." }),
  placement: "svc-unsure",
  cta: t({ en: "Book a 30-min call", es: "Agenda una llamada de 30 min" }),
};
