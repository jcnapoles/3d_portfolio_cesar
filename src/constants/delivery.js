// AI-native delivery band (#delivery, chapter 00, right under the telemetry numbers): how Cesar runs engineering as
// fractional CTO at Cashela and 1234ticket. Owner's call (Oct 2026): no figures here, text only, and no repository
// volumes (commit counts, workflow counts). Public-safe wording, as in career.js: no provider names.
// `logo` is a key of companyLogos in src/assets/media.js.

import { t } from "@/i18n";

export const DELIVERY_COPY = {
  name: t({ en: "AI-NATIVE DELIVERY", es: "ENTREGA NATIVA EN IA" }),
  // Short enough to share the HUD row with the name at 375 px (the clients are named right below).
  hudRight: t({ en: "2 CLIENTS", es: "2 CLIENTES" }),
  eyebrow: t({ en: "How I run engineering today", es: "Cómo dirijo la ingeniería hoy" }),
  title: t({ en: "AI builds. Experts decide. Every change is tested.", es: "La IA construye. Los expertos deciden. Todo cambio se prueba." }),
  lead: t({
    en: "The delivery model I run as fractional CTO at Cashela and 1234ticket: AI agents do the implementation, senior engineers own every decision, and automated QA guards every release.",
    es: "El modelo de entrega que aplico como CTO fraccional en Cashela y 1234ticket: agentes de IA implementan, ingenieros sénior asumen cada decisión y un QA automatizado protege cada release.",
  }),
};

export const DELIVERY_CLIENTS = [
  { key: "cashela", logo: "cashelaLogo", meta: t({ en: "Fintech · Fractional CTO since 2025", es: "Fintech · CTO fraccional desde 2025" }) },
  { key: "1234ticket", logo: "1234ticketLogo", meta: t({ en: "Ticketing · Fractional CTO since 2026", es: "Ticketing · CTO fraccional desde 2026" }) },
];

/** The loop, in order. `kind` sets the badge colour: expert (gold), ai (ion), qa (signal). */
export const DELIVERY_STEPS = [
  { n: "01", kind: "expert", badge: t({ en: "Expert", es: "Experto" }), title: t({ en: "Scope", es: "Definir" }), body: t({ en: "A senior engineer defines the change, its architecture constraints and the acceptance criteria.", es: "Un ingeniero sénior define el cambio, sus restricciones de arquitectura y los criterios de aceptación." }) },
  { n: "02", kind: "ai", badge: t({ en: "AI", es: "IA" }), title: t({ en: "Implement", es: "Implementar" }), body: t({ en: "AI agents write the code, tests and docs against the team's conventions, one branch per issue.", es: "Los agentes de IA escriben el código, los tests y la documentación según las convenciones del equipo, una rama por issue." }) },
  { n: "03", kind: "qa", badge: t({ en: "Automated", es: "Automático" }), title: t({ en: "Verify", es: "Verificar" }), body: t({ en: "Automated QA runs on every pull request: test suites plus architecture and payment-safety guards in CI.", es: "El QA automatizado se ejecuta en cada pull request: suites de tests y controles de arquitectura y de seguridad de pagos en CI." }) },
  { n: "04", kind: "expert", badge: t({ en: "Expert", es: "Experto" }), title: t({ en: "Review & ship", es: "Revisar y lanzar" }), body: t({ en: "An engineer reviews and owns the merge; new features go out behind feature flags.", es: "Un ingeniero revisa y asume el merge; las nuevas funcionalidades salen tras feature flags." }) },
];

/** Outcomes, without numbers: `trend` draws the arrow, `sr` is what a screen reader hears for the value. */
export const DELIVERY_OUTCOMES = [
  { key: "revenue", trend: "up", value: t({ en: "Revenue", es: "Ingresos" }), sr: t({ en: "More revenue", es: "Más ingresos" }), label: t({ en: "Delivery capacity goes to the revenue path: checkout, payment links and partner sales.", es: "La capacidad de entrega se dedica a lo que genera ingresos: checkout, enlaces de pago y ventas con partners." }) },
  { key: "manual", trend: "down", value: t({ en: "Manual work", es: "Trabajo manual" }), sr: t({ en: "Less manual work", es: "Menos trabajo manual" }), label: t({ en: "Reconciliation, deploys, backups and release checks run automatically instead of by hand.", es: "La conciliación, los despliegues, las copias de seguridad y las comprobaciones de release se ejecutan solos, no a mano." }) },
  { key: "speed", trend: "up", value: t({ en: "Delivery speed", es: "Velocidad de entrega" }), sr: t({ en: "Faster delivery", es: "Entregas más rápidas" }), label: t({ en: "AI carries the implementation load, so engineers spend their time on decisions and review.", es: "La IA asume la carga de implementación, así que los ingenieros dedican su tiempo a decidir y revisar." }) },
  { key: "risk", trend: "down", value: t({ en: "Release risk", es: "Riesgo de release" }), sr: t({ en: "Lower release risk", es: "Menor riesgo de release" }), label: t({ en: "Automated QA and feature flags catch problems before customers do.", es: "El QA automatizado y los feature flags detectan los problemas antes que los clientes." }) },
];

export const DELIVERY_CAPTION = "Cashela · 1234ticket";
