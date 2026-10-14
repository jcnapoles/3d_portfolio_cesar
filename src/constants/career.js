// Flight log data (spec 6.10). Titles and dates are synced to the CV in public/Cesar_Napoles_CV.pdf.
// Bullets come from the CV or the non-conflicting legacy site data. Closevibe shows "2025" until the
// start month is confirmed (spec 7.6 item 6). `logo` is a key of companyLogos in src/assets/media.js.
// Rows with `earlier: true` sit inside the "Show earlier roles (2012–2021)" disclosure.
// 1234ticket and Cashela: start dates and Cashela's title confirmed by Cesar (Oct 2026); they are separate
// engagements. Public-safe wording only: no audit figures, volumes or provider names, and work still behind
// feature flags is described as built / ready for rollout, not launched.
export const CAREER = [
  { company: "1234ticket", logo: "1234ticket", role: "Fractional CTO / Technical Lead", dates: "Feb 2026 – Present", year: 2026,
    impact: "Hardens an event-ticketing platform's payment path so it can sell an external partner's event catalog through its own checkout.",
    details: ["Audited the platform and turned the findings into a prioritized backlog, a bilingual wiki and a load-test go/no-go gate", "Moved card checkout to PCI SAQ-A hosted payments with server-side reconciliation of orphaned orders", "Leads the ticket-inventory partner integration: catalog sync, signed webhooks, authorize-confirm-capture checkout and refunds behind feature flags"] },
  { company: "Closevibe", logo: "closevibe", role: "Co-founder & CTO", dates: "2025 – Present", year: 2025,
    impact: "Built a multichannel AI sales and support platform (WhatsApp, Instagram, Messenger, Email) from scratch.",
    details: ["Architected a multi-tenant conversational AI platform for e-commerce sales and customer service", "Designed a RAG-based agent system with intent detection and pgvector semantic search", "Built the stack end to end: Python/FastAPI, React, PostgreSQL, Docker on GCP and Railway"] },
  { company: "Cashela", logo: "cashela", role: "Fractional CTO", dates: "Jan 2025 – Present", year: 2025,
    impact: "Leads the technical turnaround of a cross-border B2B payments platform: architecture, roadmap and engineering standards.",
    details: ["Audited the platform and built a bilingual technical wiki (architecture, ADRs, runbooks) as the team's source of truth", "Drives the core's migration to a hexagonal architecture behind feature flags, with a flag + test + doc Definition of Done enforced in CI", "Built Payment Links end to end: hosted Next.js checkout, merchant refunds and card, ACH and wire rails, ready for rollout behind feature flags"] },
  { company: "Sttok", logo: "sttok", role: "Fractional CTO / External Tech Lead", dates: "Nov 2024 – Feb 2025", year: 2024,
    impact: "Re-architected the platform and led its AWS migration to support growth from 50K to 250K+ users.",
    details: ["Directed the AWS migration: infrastructure, CI/CD, Cognito authentication, VPC networking", "Tuned MongoDB Atlas performance: indexing strategies, ESR rules, Atlas Search", "Set up monitoring, alerting and cost-optimization frameworks"] },
  { company: "CaixaBank Tech", logo: "caixabanktech", role: "Senior Technical Lead", dates: "Oct 2024 – Present", year: 2024,
    impact: "Leads banking application development with Java, Spring Boot and Kafka microservices and React interfaces.",
    details: ["Architects Java/Spring Boot microservices in a large event-driven system powered by Kafka", "Leads React interfaces for one of Spain's largest financial institutions", "Runs structured technical interviews for full-stack developer candidates"] },
  { company: "Flyr", logo: "flyr", role: "Lead Engineer & Frontend Architect", dates: "Mar 2023 – Sep 2025", year: 2023,
    impact: "Led the frontend architecture for white-label airline apps across four international carriers.",
    details: ["Defined a modular, component-driven architecture with shared core libraries", "Introduced micro-frontends for independent brand deployments", "Integrated reservation, disruption-management and communication services"] },
  { company: "FIATC Seguros", logo: "fiatc", role: "Fractional CTO / External Tech Lead", dates: "Jan 2023 – Oct 2024", year: 2023,
    impact: "Led the corporate intranet's migration to Liferay and the modernization roadmap.",
    details: ["Directed vendor evaluations, technical audits and roadmap planning", "Mentored teams in agile practices, CI/CD automation and DevOps culture", "Aligned technology objectives with C-level stakeholders"] },
  { company: "Amaris Consulting", logo: "amaris", role: "Full Stack Developer / Project Manager", dates: "May 2021 – Oct 2024", year: 2021, earlier: true,
    impact: "Led cross-functional delivery teams building enterprise React and Angular applications.",
    details: ["Migrated legacy systems to Java, Spring, Angular and React stacks", "Managed planning, budgeting and delivery with Agile/Scrum", "Designed RESTful integrations with third-party services and data platforms"] },
  { company: "Isern Patentes y Marcas", logo: "isern", role: "Software Engineer", dates: "Jul 2018 – May 2021", year: 2018, earlier: true,
    impact: "Moved legacy monoliths to AWS and Azure and built IsernTools for the IP sector.",
    details: ["Rebuilt core applications with Java, Spring Boot, Angular and React", "Built an AI-powered document similarity detector with UPC", "Automated delivery with Jenkins and GitLab CI/CD"] },
  { company: "Indra", logo: "indra", role: "Full Stack Developer", dates: "Jul 2016 – Jun 2018", year: 2016, earlier: true,
    impact: "Built enterprise applications and Hadoop data pipelines for public-sector and financial clients.",
    details: ["Developed the InGRID MDM platform for electrical measurement management in Uruguay", "Implemented big-data pipelines with Hadoop, MapReduce and HBase", "Built REST APIs for data exchange with client systems"] },
  { company: "Universidad de las Ciencias Informáticas", logo: "uci", role: "QA Tester", dates: "Sep 2014 – Jul 2016", year: 2014, earlier: true,
    impact: "Automated regression and performance testing with Selenium and JMeter.",
    details: ["Designed functional test plans and test cases", "Built automated regression suites with Selenium", "Ran performance benchmarks with JMeter"] },
  { company: "Universidad de las Ciencias Informáticas", logo: "uci", role: "Software Developer", dates: "Sep 2012 – Aug 2014", year: 2012, earlier: true,
    impact: "Built internal web applications in PHP used daily by 200+ staff.",
    details: ["Developed component-management tools within a business framework", "Built web interfaces with PHP, JavaScript and ExtJS"] },
];
