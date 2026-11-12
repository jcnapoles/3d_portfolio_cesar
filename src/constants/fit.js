// Section 6.4 Briefing (#fit). Copy is exactly as written in the spec.
// `icon` is a lucide-react export name, mapped to the component in src/sections/fit/Fit.jsx.
import { t } from "@/i18n";

const situation = (n) => t({ en: `SITUATION ${n}`, es: `SITUACIÓN ${n}` });

export const FIT_CARDS = [
  {
    code: situation("01"),
    icon: "Gauge",
    title: t({ en: "Your MVP worked. Now it's creaking.", es: "Tu MVP funcionó. Ahora cruje." }),
    body: t({
      en: "Traffic is growing and your architecture, database or cloud setup won't survive the next jump.",
      es: "El tráfico crece y tu arquitectura, tu base de datos o tu infraestructura cloud no aguantarán el próximo salto.",
    }),
  },
  {
    code: situation("02"),
    icon: "Compass",
    title: t({ en: "Big technical bets, no technical partner.", es: "Grandes apuestas técnicas, sin socio técnico." }),
    body: t({
      en: "Stacks, vendors, build vs. buy: high-stakes calls with no senior engineer on your side of the table.",
      es: "Stacks, proveedores, desarrollar o comprar: decisiones de alto riesgo sin un ingeniero sénior de tu lado de la mesa.",
    }),
  },
  {
    code: situation("03"),
    icon: "GitBranch",
    title: t({ en: "Your team ships, but not predictably.", es: "Tu equipo entrega, pero sin previsibilidad." }),
    body: t({
      en: "Without CI/CD, standards and reviews, every release feels like a gamble.",
      es: "Sin CI/CD, estándares ni revisiones, cada release es una apuesta.",
    }),
  },
  {
    code: situation("04"),
    icon: "UsersRound",
    title: t({
      en: "You need CTO judgment before you need a full-time CTO.",
      es: "Necesitas criterio de CTO antes que un CTO a tiempo completo.",
    }),
    body: t({
      en: "Senior leadership now, at the stage you're actually at.",
      es: "Liderazgo sénior ya, adaptado a la etapa en la que estás de verdad.",
    }),
  },
];
