// Fleet data (spec 6.11). `key` is a key of projectShots in src/assets/media.js.
// PREVIEW rows become LIVE once Cesar confirms a production URL (spec 7.6 item 4):
// change `status` to "LIVE" and update `href`, nothing else.
// `lead: true` marks platforms Cesar leads as fractional CTO rather than built from scratch
// (rendered as "Platform I lead"); their stack is the platform's, not a claim of sole authorship.
export const BUILDS = [
  { key: "closevibe", name: "Closevibe", sector: "SaaS", status: "LIVE", href: "https://www.closevibe.com/", code: "",
    description: "Multichannel AI sales and support platform I co-founded.", stack: ["Python", "FastAPI", "React"] },
  { key: "cashela", name: "Cashela", sector: "Fintech", status: "LIVE", href: "https://www.cashela.com/", code: "", lead: true,
    description: "Cross-border B2B payments platform: pay-ins, payouts, wallets and payment links.", stack: ["Laravel", "Next.js", "AWS"] },
  { key: "1234ticket", name: "1234ticket", sector: "Ticketing", status: "LIVE", href: "https://1234ticket.com/", code: "", lead: true,
    description: "Event-ticketing platform connecting event producers and buyers, from seat maps to QR check-in.", stack: ["Node.js", "Next.js", "PostgreSQL"] },
  { key: "quinque", name: "Quinque", sector: "Productivity", status: "LIVE", href: "https://quinque.cesarnapoles.com/", code: "",
    description: "Decision journal based on the Cynefin framework, with AI assistance from Claude.", stack: ["React", "Node.js", "PostgreSQL"] },
  { key: "investanalysis", name: "Invest Analysis", sector: "Finance", status: "LIVE", href: "https://investanalysis.ai/", code: "",
    description: "Banks, investments and net worth on one map, with an AI copilot that explains what to do next.", stack: ["Next.js", "TypeScript", "Node.js"] },
  { key: "fullstackquestions", name: "Fullstack Questions", sector: "Education", status: "LIVE", href: "https://fullstack.cesarnapoles.com", code: "https://github.com/jcnapoles/interview-docs",
    description: "500+ curated full-stack interview questions with explanations.", stack: ["Nextra", "Next.js", "MDX"] },
  { key: "dretimediacio", name: "Dret i Mediació", sector: "Legal", status: "PREVIEW", href: "https://dretimediacio.vercel.app/", code: "",
    description: "Website for a Barcelona law firm: appointment booking, multilingual, admin panel.", stack: ["Next.js", "Supabase", "Tailwind"] },
  { key: "vcdetectius", name: "VC Detectius", sector: "Services", status: "PREVIEW", href: "https://vcdetectius.vercel.app/en", code: "",
    description: "Private detective agency site built for trust and conversion.", stack: ["React", "i18n", "Tailwind"] },
  { key: "fiatbrav", name: "FiatBrav", sector: "Automotive", status: "PREVIEW", href: "https://fiatbrav.vercel.app/en", code: "",
    description: "Corporate site for an auto parts distributor in Venezuela.", stack: ["React", "i18n", "Tailwind"] },
];
