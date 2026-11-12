// 6.9 Testimonials (#testimonials, chapter 05 TRANSMISSIONS). Quotes are verbatim from the repo
// (legacy src/constants/index.js). `highlight` must be an exact substring of `quote`.
// Spanish: faithful translations; each `highlight` is wrapped too and must stay an exact substring of its locale's quote.
import { t } from "@/i18n";

export const TRANSMISSIONS = [
  { rx: "RX 01", org: "STTOK", featured: true, photo: "erasmo", name: "Erasmo Garcia", role: "CTO", company: "Sttok", linkedin: "https://www.linkedin.com/in/erasmogarciaglez",
    quote: t({ en: "Acting as our fractional CTO, Cesar led our cloud migration and architecture modernization—AWS, security, and performance—enabling faster releases and stability.", es: "Como nuestro CTO fraccional, Cesar lideró nuestra migración a la nube y la modernización de la arquitectura —AWS, seguridad y rendimiento—, lo que permitió lanzamientos más rápidos y estabilidad." }),
    highlight: t({ en: "led our cloud migration and architecture modernization", es: "lideró nuestra migración a la nube y la modernización de la arquitectura" }) },
  { rx: "RX 02", org: "ISERN", photo: "jorge", name: "Jorge Isern", role: t({ en: "Director & Managing Partner", es: "Director y socio gerente" }), company: "Isern Patentes y Marcas", linkedin: "https://www.linkedin.com/in/jorgeisern/",
    quote: t({ en: "Cesar transformed our internal systems — he modernized legacy applications, migrated us to the cloud, and built reliable solutions that our team still depends on every day.", es: "Cesar transformó nuestros sistemas internos: modernizó aplicaciones heredadas, nos migró a la nube y creó soluciones fiables de las que nuestro equipo sigue dependiendo cada día." }),
    highlight: t({ en: "built reliable solutions that our team still depends on every day", es: "creó soluciones fiables de las que nuestro equipo sigue dependiendo cada día" }) },
  { rx: "RX 03", org: "CASHELA", photo: "reynier", name: "Reynier Ortiz Tamayo", role: "COO", company: "Cashela", linkedin: "https://www.linkedin.com/in/reynier-ortiz-tamayo/",
    quote: t({ en: "Cesar guided us as a fractional CTO at a critical stage—clarifying the architecture, prioritizing the roadmap, and establishing standards that helped us scale with confidence.", es: "Cesar nos guio como CTO fraccional en una etapa crítica: aclaró la arquitectura, priorizó la hoja de ruta y estableció estándares que nos ayudaron a escalar con confianza." }),
    highlight: t({ en: "clarifying the architecture, prioritizing the roadmap", es: "aclaró la arquitectura, priorizó la hoja de ruta" }) },
  { rx: "RX 04", org: "AIFI", photo: "lazaro", name: "Lazaro Campoalegre", role: "EP Manager", company: "AiFi Inc", linkedin: "https://www.linkedin.com/in/lazarocampoalegre",
    quote: t({ en: "As a fractional CTO, Cesar aligned our tech strategy with the product vision, unblocked key decisions, and raised engineering quality without slowing delivery.", es: "Como CTO fraccional, Cesar alineó nuestra estrategia tecnológica con la visión de producto, desbloqueó decisiones clave y elevó la calidad de ingeniería sin frenar la entrega." }),
    highlight: t({ en: "unblocked key decisions", es: "desbloqueó decisiones clave" }) },
  // Suneidis Vinent: not rendered (show:false) until Cesar confirms. Never featured next to the Suneidis project.
  { rx: "RX 05", org: "AMARIS", show: false, photo: "suneidis", name: "Suneidis Vinent", role: t({ en: "QA Engineer", es: "Ingeniera de QA" }), company: "Amaris", linkedin: "https://www.linkedin.com/in/svinent",
    quote: t({ en: "Cesar stepped in as a fractional CTO and brought structure to our processes: CI/CD, testing culture, and pragmatic architecture that empowered the team.", es: "Cesar se incorporó como CTO fraccional y aportó estructura a nuestros procesos: CI/CD, cultura de testing y una arquitectura pragmática que dio autonomía al equipo." }), highlight: "" },
];
