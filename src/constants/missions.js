// Missions (spec 6.6). Copy is CV-synced; numbers come only from src/constants/claims.js (verified gating).
import { ANCHORS } from "@/constants/site";
import { CLAIMS, sttokMetricKey } from "@/constants/claims";
import { t } from "@/i18n";

// Lead rule: where a single Sttok metric fits, prefer sttokP95 when verified, else sttokInfraSpend.
// With neither verified, the card falls back to "250K+" (fallbackMetric).
const sttokKey = sttokMetricKey();
const sttokMetric = sttokKey
  ? { claim: sttokKey, label: CLAIMS[sttokKey].label }
  : { claim: "sttokP95", label: t({ en: "p95 query latency", es: "latencia p95 de consultas" }) };

/**
 * Extra fields beyond the spec's data shape (all optional, all presentation-only):
 * - metaLabel: the first HUD-row label ("Client" by default; Closevibe is Cesar's own company).
 * - diagramCaption: the panel caption (FIG 03.n).
 * - diagramAlt: plain-language description of the diagram for assistive tech (no facts beyond the copy).
 */
export const MISSIONS = [
  {
    id: ANCHORS.missions.sttok, code: "MSN-01", years: "2024–2025", company: "Sttok", period: t({ en: "NOV 2024 – FEB 2025", es: "NOV 2024 – FEB 2025" }),
    role: t({ en: "Fractional CTO / External Tech Lead", es: "CTO fraccional / Líder técnico externo" }),
    title: t({ en: "Sttok: re-architecting for 250K+ users", es: "Sttok: nueva arquitectura para 250K+ usuarios" }),
    challenge: t({ en: "Scale the platform from 50K to 250K+ active users.", es: "Escalar la plataforma de 50K a 250K+ usuarios activos." }),
    did: t({
      en: [
        "Led the architecture redesign and the key technology decisions",
        "Directed the full AWS migration: infrastructure, CI/CD pipelines, Cognito authentication and VPC networking",
        "Tuned MongoDB Atlas performance: indexing strategies, ESR rules and Atlas Search",
        "Set up monitoring, alerting and cost-optimization frameworks",
      ],
      es: [
        "Lideré el rediseño de la arquitectura y las decisiones tecnológicas clave",
        "Dirigí la migración completa a AWS: infraestructura, pipelines de CI/CD, autenticación con Cognito y redes VPC",
        "Optimicé el rendimiento de MongoDB Atlas: estrategias de indexación, reglas ESR y Atlas Search",
        "Implanté marcos de monitorización, alertas y optimización de costes",
      ],
    }),
    metric: sttokMetric,
    fallbackMetric: { display: "250K+", label: t({ en: "active users the new architecture was built to support", es: "usuarios activos para los que se diseñó la nueva arquitectura" }) },
    changed: t({ en: "A production-ready AWS environment, built to scale from 50K to 250K+ users.", es: "Un entorno AWS listo para producción, preparado para escalar de 50K a 250K+ usuarios." }),
    quote: { text: t({ en: "…Cesar led our cloud migration and architecture modernization—AWS, security, and performance—enabling faster releases and stability.", es: "…Cesar lideró nuestra migración a la nube y la modernización de la arquitectura —AWS, seguridad y rendimiento—, lo que permitió lanzamientos más rápidos y estabilidad." }), name: "Erasmo Garcia", role: "CTO, Sttok", photo: "erasmo", linkedin: "https://www.linkedin.com/in/erasmogarciaglez" },
    diagram: "sttok",
    diagramCaption: t({ en: "FIG 03.1 — SCALE TRANSFER", es: "FIG 03.1 — SALTO DE ESCALA" }),
    diagramAlt: t({ en: "Diagram: the Sttok platform at the core, moving from an inner 50K orbit to an outer 250K+ orbit, with CI/CD, Cognito, VPC and Atlas Search on the outer ring.", es: "Diagrama: la plataforma Sttok en el centro, pasando de una órbita interior de 50K a una órbita exterior de 250K+, con CI/CD, Cognito, VPC y Atlas Search en el anillo exterior." }),
  },
  {
    id: ANCHORS.missions.fiatc, code: "MSN-02", years: "2023–2024", company: "FIATC Seguros", period: t({ en: "JAN 2023 – OCT 2024", es: "ENE 2023 – OCT 2024" }),
    role: t({ en: "Fractional CTO / External Tech Lead", es: "CTO fraccional / Líder técnico externo" }),
    title: t({ en: "FIATC Seguros: digital transformation at an established insurer", es: "FIATC Seguros: transformación digital en una aseguradora consolidada" }),
    challenge: t({ en: "Modernize internal systems at one of Spain's established insurance companies, starting with a legacy intranet CMS.", es: "Modernizar los sistemas internos de una aseguradora consolidada de España, empezando por el CMS heredado de la intranet." }),
    did: t({
      en: [
        "Led the full redesign and migration of the corporate intranet to Liferay, replacing a legacy CMS",
        "Directed vendor evaluations, technical audits and roadmap planning",
        "Introduced CI/CD automation, agile practices and DevOps culture",
        "Aligned technology objectives with C-level stakeholders",
      ],
      es: [
        "Lideré el rediseño completo y la migración de la intranet corporativa a Liferay, sustituyendo un CMS heredado",
        "Dirigí evaluaciones de proveedores, auditorías técnicas y la planificación de la hoja de ruta",
        "Introduje automatización CI/CD, prácticas ágiles y cultura DevOps",
        "Alineé los objetivos tecnológicos con la alta dirección",
      ],
    }),
    metric: { claim: "fiatcAdoption", label: t({ en: "internal adoption", es: "adopción interna" }) },
    fallbackMetric: null,
    changed: t({ en: "A scalable Liferay intranet replaced the legacy CMS, with a modernization roadmap agreed at C-level.", es: "Una intranet escalable en Liferay sustituyó al CMS heredado, con una hoja de ruta de modernización acordada con la alta dirección." }),
    quote: null, diagram: "fiatc",
    diagramCaption: t({ en: "FIG 03.2 — INTRANET MIGRATION", es: "FIG 03.2 — MIGRACIÓN DE INTRANET" }),
    diagramAlt: t({ en: "Diagram: a legacy intranet CMS transferring to Liferay, above a timeline of audit, roadmap and CI/CD.", es: "Diagrama: un CMS de intranet heredado que se transfiere a Liferay, sobre una línea temporal de auditoría, hoja de ruta y CI/CD." }),
  },
  {
    id: ANCHORS.missions.isern, code: "MSN-03", years: "2018–2021", company: "Isern Patentes y Marcas", period: t({ en: "JUL 2018 – MAY 2021", es: "JUL 2018 – MAY 2021" }),
    role: t({ en: "Software Engineer", es: "Ingeniero de software" }),
    title: t({ en: "Isern Patentes y Marcas: from legacy to cloud", es: "Isern Patentes y Marcas: de lo heredado a la nube" }),
    challenge: t({ en: "Modernize the firm's legacy internal applications and move them to the cloud.", es: "Modernizar las aplicaciones internas heredadas del despacho y llevarlas a la nube." }),
    did: t({
      en: [
        "Migrated legacy monoliths to cloud-native architectures on AWS and Azure",
        "Rebuilt core applications with Java, Spring Boot, Angular and React",
        "Automated delivery with Jenkins and GitLab CI/CD",
        "Built IsernTools, a web platform for the intellectual-property sector, including an AI-powered document similarity detector developed with UPC",
      ],
      es: [
        "Migré monolitos heredados a arquitecturas cloud-native en AWS y Azure",
        "Reconstruí aplicaciones clave con Java, Spring Boot, Angular y React",
        "Automaticé la entrega con CI/CD en Jenkins y GitLab",
        "Creé IsernTools, una plataforma web para el sector de la propiedad intelectual, con un detector de similitud de documentos basado en IA desarrollado con la UPC",
      ],
    }),
    metric: { claim: "isernUptime", label: t({ en: "system uptime", es: "disponibilidad del sistema" }) },
    fallbackMetric: null,
    changed: t({ en: "Legacy monoliths replaced by cloud-native applications on AWS and Azure, shipped through automated pipelines.", es: "Monolitos heredados sustituidos por aplicaciones cloud-native en AWS y Azure, desplegadas mediante pipelines automatizados." }),
    quote: { text: t({ en: "…he modernized legacy applications, migrated us to the cloud, and built reliable solutions that our team still depends on every day.", es: "…modernizó aplicaciones heredadas, nos migró a la nube y creó soluciones fiables de las que nuestro equipo sigue dependiendo cada día." }), name: "Jorge Isern", role: t({ en: "Director & Managing Partner, Isern Patentes y Marcas", es: "Director y socio gerente, Isern Patentes y Marcas" }), photo: "jorge", linkedin: "https://www.linkedin.com/in/jorgeisern/" },
    diagram: "isern",
    diagramCaption: t({ en: "FIG 03.3 — LEGACY TO CLOUD", es: "FIG 03.3 — DEL LEGADO A LA NUBE" }),
    diagramAlt: t({ en: "Diagram: a legacy monolith resolving into AWS and Azure, delivered through Jenkins and GitLab CI pipelines.", es: "Diagrama: un monolito heredado que se transforma en AWS y Azure, entregado mediante pipelines de Jenkins y GitLab CI." }),
  },
  {
    id: ANCHORS.missions.closevibe, code: "MSN-04", years: t({ en: "2025–NOW", es: "2025–HOY" }), company: "Closevibe", period: t({ en: "2025 – NOW", es: "2025 – HOY" }),
    role: t({ en: "Co-founder & CTO", es: "Cofundador y CTO" }),
    metaLabel: t({ en: "Company", es: "Empresa" }),
    title: t({ en: "Closevibe: an AI SaaS, co-founded and built from zero", es: "Closevibe: un SaaS de IA, cofundado y construido desde cero" }),
    challenge: t({ en: "Automate sales and customer-service conversations across messaging channels for e-commerce businesses.", es: "Automatizar las conversaciones de ventas y atención al cliente en canales de mensajería para negocios de e-commerce." }),
    did: t({
      en: [
        "Architected a multi-tenant conversational AI platform from scratch",
        "Designed a RAG-based agent system with intent detection, semantic vector search (pgvector) and real-time conversation orchestration",
        "Built the stack end to end: Python/FastAPI, React, PostgreSQL with pgvector, Docker on GCP and Railway",
        "Integrated Meta Business APIs (WhatsApp, Instagram, Messenger) and email",
      ],
      es: [
        "Diseñé desde cero la arquitectura de una plataforma multi-tenant de IA conversacional",
        "Diseñé un sistema de agentes basado en RAG con detección de intención, búsqueda vectorial semántica (pgvector) y orquestación de conversaciones en tiempo real",
        "Construí el stack completo: Python/FastAPI, React, PostgreSQL con pgvector, Docker en GCP y Railway",
        "Integré las APIs de Meta Business (WhatsApp, Instagram, Messenger) y el email",
      ],
    }),
    metric: null,
    fallbackMetric: { display: t({ en: "Live", es: "Activo" }), label: "closevibe.com", href: "https://www.closevibe.com/" },
    changed: t({ en: "The chat bubble on this page runs on Closevibe. Try it.", es: "El chat de esta página funciona con Closevibe. Pruébalo." }),
    quote: null, diagram: "closevibe",
    diagramCaption: t({ en: "FIG 03.4 — LIVE PRODUCT", es: "FIG 03.4 — PRODUCTO EN VIVO" }),
    diagramAlt: t({ en: "Diagram: the Closevibe product, with WhatsApp, Instagram, Messenger and email channels connected to its AI assistant.", es: "Diagrama: el producto Closevibe, con los canales de WhatsApp, Instagram, Messenger y email conectados a su asistente de IA." }),
  },
];

export const MISSIONS_FOOTER = {
  line: t({ en: "Today I'm a Senior Technical Lead at CaixaBank Tech, building banking applications for one of Spain's largest financial institutions.", es: "Hoy soy líder técnico sénior en CaixaBank Tech y desarrollo aplicaciones bancarias para una de las mayores entidades financieras de España." }),
};
