// 6.8 Process (#process, chapter 04 FLIGHT PLAN). Copy is exactly as written in the spec.
import { t } from "@/i18n";

export const STEPS = [
  { n: "01", phase: t({ en: "LAUNCH", es: "DESPEGUE" }), title: t({ en: "Intro call (30 min)", es: "Llamada inicial (30 min)" }), body: t({ en: "We talk through your product, your team and the decision that's keeping you up at night. You leave with a clear next step.", es: "Hablamos de tu producto, de tu equipo y de la decisión que te quita el sueño. Sales con un siguiente paso claro." }) },
  { n: "02", phase: t({ en: "PARKING ORBIT", es: "ÓRBITA DE ESPERA" }), title: t({ en: "Technical audit", es: "Auditoría técnica" }), body: t({ en: "I review your architecture, code, cloud setup, delivery process and vendors, and tell you plainly what's working and what isn't.", es: "Reviso tu arquitectura, código, configuración cloud, proceso de entrega y proveedores, y te digo con franqueza qué funciona y qué no." }) },
  { n: "03", phase: t({ en: "TRANSFER BURN", es: "IMPULSO ORBITAL" }), title: t({ en: "Roadmap", es: "Hoja de ruta" }), body: t({ en: "A prioritized plan that ties every technical decision to a business outcome: what to fix now, what to build next, what to leave alone.", es: "Un plan priorizado que vincula cada decisión técnica a un resultado de negocio: qué arreglar ya, qué construir después y qué dejar como está." }) },
  { n: "04", phase: t({ en: "ORBIT INSERTION", es: "INSERCIÓN ORBITAL" }), title: t({ en: "Execute with your team", es: "Ejecución con tu equipo" }), body: t({ en: "I lead architecture, standards and key builds hands-on, alongside your engineers or partners.", es: "Lidero de forma práctica la arquitectura, los estándares y los desarrollos clave, junto a tus ingenieros o partners." }) },
  { n: "05", phase: t({ en: "STATION KEEPING", es: "MANTENER POSICIÓN" }), title: t({ en: "Leave you stronger", es: "Tu equipo, más fuerte" }), body: t({ en: "CI/CD, monitoring, documentation and hiring support, so your team doesn't depend on me.", es: "CI/CD, monitorización, documentación y apoyo en contratación, para que tu equipo no dependa de mí." }) },
];
export const WAYPOINTS = [0, 0.22, 0.48, 0.74, 1];
export const TRANSFER_PATH = "M 80 360 C 260 360, 300 250, 420 230 S 640 170, 760 150 S 1000 90, 1120 80";
