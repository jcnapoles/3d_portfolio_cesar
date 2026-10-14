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

export const SERVICES_HEADING = {
  index: "02",
  name: "FLIGHT MODES",
  eyebrow: "Services",
  title: "Four ways I can help",
  lead: "Pick the one that matches where you are today.",
  id: "services-title",
};

export const SERVICES = [
  {
    key: "fcto",
    title: "Fractional CTO",
    placement: "svc-fcto",
    cta: "Discuss a fractional engagement",
    featured: true,
    for: "Startups and SMEs that need senior tech leadership without a full-time executive hire.",
    get: [
      "Tech strategy aligned with your product vision",
      "Roadmap planning",
      "Vendor evaluations and technical audits",
      "A senior voice in every technical decision",
    ],
    proof: {
      base: "Led FIATC Seguros' intranet migration to Liferay and Sttok's AWS migration and re-architecture.",
      verifiedVariant: {
        claim: "fiatcAdoption",
        text: "Led FIATC Seguros' intranet migration to Liferay (+45% internal adoption) and Sttok's AWS migration and re-architecture.",
      },
    },
  },
  {
    key: "arch",
    title: "Architecture & Scale",
    placement: "svc-arch",
    cta: "Get an architecture review",
    for: "Products hitting performance, reliability or cloud-cost limits.",
    get: [
      "Architecture review and redesign",
      "Cloud migration (AWS, Azure, GCP)",
      "Database performance tuning",
      "Monitoring, alerting and cost-optimization frameworks",
    ],
    proof: {
      base: "An architecture built to scale Sttok from 50K to 250K+ users.",
      appendIfVerified: [
        {
          // Lead rule: where one Sttok metric fits, prefer sttokP95 when verified, else sttokInfraSpend.
          // sttokInfraSpend wording follows the CV: TCO projections "reducing projected infrastructure spend by 30%".
          sttokMetric: {
            sttokP95: " Query latency at p95 cut by 70%.",
            sttokInfraSpend: " Projected infrastructure spend cut by 30% through AWS TCO analysis.",
          },
        },
        { claim: "isernUptime", text: " 99.5% uptime at Isern." },
      ],
    },
  },
  {
    key: "lead",
    title: "Engineering Leadership",
    placement: "svc-lead",
    cta: "Level up my team",
    for: "Teams that need standards, delivery rhythm and a senior lead.",
    get: [
      "Coding standards, code reviews and architectural decisions",
      "CI/CD and DevOps practices",
      "Agile delivery and stakeholder alignment",
      "Hiring support and technical interviews",
    ],
    proof: {
      base: "Senior Technical Lead across distributed teams at CaixaBank Tech; led cross-functional delivery teams at Amaris Consulting.",
    },
  },
  {
    key: "build",
    title: "0-to-1 Product Build",
    placement: "svc-build",
    cta: "Plan my build",
    for: "Founders who need an MVP or AI-powered product designed and shipped by someone who has done it themselves.",
    get: [
      "Architecture from scratch",
      "Full-stack build (React, Node.js, Python, Java)",
      "AI/LLM integration (assistants, RAG)",
      "A launch-ready cloud setup",
    ],
    proof: {
      base: "Co-founded and built Closevibe, a multichannel AI sales and support SaaS, end to end.",
    },
  },
];

/** Company names highlighted in text-ion inside proof lines (longest first so multi-word names win). */
export const PROOF_COMPANIES = ["Amaris Consulting", "CaixaBank Tech", "FIATC Seguros", "Closevibe", "Sttok", "Isern"];

/** The line under the bento. */
export const SERVICES_UNSURE = {
  text: "Not sure which fits? That's what the 30-min call is for.",
  placement: "svc-unsure",
  cta: "Book a 30-min call",
};
