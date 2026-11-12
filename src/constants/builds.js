// Fleet data (spec 6.11). `key` is a key of projectShots in src/assets/media.js.
// PREVIEW rows become LIVE once Cesar confirms a production URL (spec 7.6 item 4):
// change `status` to "LIVE" and update `href`, nothing else.
// `lead: true` marks platforms Cesar leads as fractional CTO rather than built from scratch
// (rendered as "Platform I lead"); their stack is the platform's, not a claim of sole authorship.
// Relative import (not "@/"): scripts/capture-projects.mjs imports this file from Node.
import { t } from "../i18n/index.js";

export const BUILDS = [
  { key: "closevibe", name: "Closevibe", sector: "SaaS", status: "LIVE", href: "https://www.closevibe.com/", code: "",
    description: t({ en: "Multichannel AI sales and support platform I co-founded.", es: "Plataforma multicanal de ventas y soporte con IA que cofundé." }), stack: ["Python", "FastAPI", "React"] },
  { key: "calendavibe", name: "CalendaVibe", sector: "SaaS", status: "LIVE", href: "https://calendavibe.com/en", code: "",
    description: t({ en: "Free online scheduling: booking links on Google Calendar and Outlook, Meet, Stripe payments and teams.", es: "Agenda online gratuita: enlaces de reserva con Google Calendar y Outlook, Meet, pagos con Stripe y equipos." }), stack: ["React", "Node.js", "PostgreSQL"] },
  { key: "cashela", name: "Cashela", sector: "Fintech", status: "LIVE", href: "https://www.cashela.com/", code: "", lead: true,
    description: t({ en: "Cross-border B2B payments platform: pay-ins, payouts, wallets and payment links.", es: "Plataforma de pagos B2B transfronterizos: cobros, pagos, wallets y enlaces de pago." }), stack: ["Laravel", "Next.js", "AWS"] },
  { key: "1234ticket", name: "1234ticket", sector: t({ en: "Ticketing", es: "Ticketing" }), status: "LIVE", href: "https://1234ticket.com/", code: "", lead: true,
    description: t({ en: "Event-ticketing platform connecting event producers and buyers, from seat maps to QR check-in.", es: "Plataforma de venta de entradas que conecta a productores de eventos con compradores, del mapa de asientos al acceso con QR." }), stack: ["Node.js", "Next.js", "PostgreSQL"] },
  { key: "quinque", name: "Quinque", sector: t({ en: "Productivity", es: "Productividad" }), status: "LIVE", href: "https://quinque.cesarnapoles.com/", code: "",
    description: t({ en: "Decision journal based on the Cynefin framework, with AI assistance from Claude.", es: "Diario de decisiones basado en el marco Cynefin, con asistencia de IA de Claude." }), stack: ["React", "Node.js", "PostgreSQL"] },
  { key: "investanalysis", name: "Invest Analysis", sector: t({ en: "Finance", es: "Finanzas" }), status: "LIVE", href: "https://investanalysis.ai/", code: "",
    description: t({ en: "Banks, investments and net worth on one map, with an AI copilot that explains what to do next.", es: "Bancos, inversiones y patrimonio en un solo mapa, con un copiloto de IA que te explica qué hacer a continuación." }), stack: ["Next.js", "TypeScript", "Node.js"] },
  { key: "fullstackquestions", name: "Fullstack Questions", sector: t({ en: "Education", es: "Educación" }), status: "LIVE", href: "https://fullstack.cesarnapoles.com", code: "https://github.com/jcnapoles/interview-docs",
    description: t({ en: "500+ curated full-stack interview questions with explanations.", es: "Más de 500 preguntas seleccionadas de entrevistas full-stack, con explicaciones." }), stack: ["Nextra", "Next.js", "MDX"] },
  { key: "dretimediacio", name: "Dret i Mediació", sector: t({ en: "Legal", es: "Legal" }), status: "PREVIEW", href: "https://dretimediacio.vercel.app/", code: "",
    description: t({ en: "Website for a Barcelona law firm: appointment booking, multilingual, admin panel.", es: "Web para un despacho de abogados de Barcelona: reserva de citas, multilingüe, panel de administración." }), stack: ["Next.js", "Supabase", "Tailwind"] },
  { key: "vcdetectius", name: "VC Detectius", sector: t({ en: "Services", es: "Servicios" }), status: "PREVIEW", href: "https://vcdetectius.vercel.app/en", code: "",
    description: t({ en: "Private detective agency site built for trust and conversion.", es: "Web para una agencia de detectives privados, pensada para generar confianza y convertir." }), stack: ["React", "i18n", "Tailwind"] },
  { key: "fiatbrav", name: "FiatBrav", sector: t({ en: "Automotive", es: "Automoción" }), status: "PREVIEW", href: "https://fiatbrav.vercel.app/en", code: "",
    description: t({ en: "Corporate site for an auto parts distributor in Venezuela.", es: "Web corporativa para un distribuidor de recambios de automoción en Venezuela." }), stack: ["React", "i18n", "Tailwind"] },
];
