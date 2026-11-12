// Flight log data (spec 6.10). Titles and dates are synced to the CV in public/Cesar_Napoles_CV.pdf.
// Bullets come from the CV or the non-conflicting legacy site data. Closevibe shows "2025" until the
// start month is confirmed (spec 7.6 item 6). `logo` is a key of companyLogos in src/assets/media.js.
// Rows with `earlier: true` sit inside the "Show earlier roles (2012–2021)" disclosure.
// 1234ticket and Cashela: start dates and Cashela's title confirmed by Cesar (Oct 2026); they are separate
// engagements. Public-safe wording only: no audit figures, volumes or provider names, and work still behind
// feature flags is described as built / ready for rollout, not launched.
import { t } from "@/i18n";

export const CAREER = [
  { company: "1234ticket", logo: "1234ticket", role: t({ en: "Fractional CTO / Technical Lead", es: "CTO fraccional / Líder técnico" }), dates: t({ en: "Feb 2026 – Present", es: "Feb 2026 – Actualidad" }), year: 2026,
    impact: t({ en: "Hardens an event-ticketing platform's payment path so it can sell an external partner's event catalog through its own checkout.", es: "Refuerza el flujo de pago de una plataforma de venta de entradas para que pueda vender el catálogo de eventos de un partner externo desde su propio checkout." }),
    details: t({
      en: ["Audited the platform and turned the findings into a prioritized backlog, a bilingual wiki and a load-test go/no-go gate", "Moved card checkout to PCI SAQ-A hosted payments with server-side reconciliation of orphaned orders", "Leads the ticket-inventory partner integration: catalog sync, signed webhooks, authorize-confirm-capture checkout and refunds behind feature flags"],
      es: ["Auditó la plataforma y convirtió los hallazgos en un backlog priorizado, una wiki bilingüe y un criterio go/no-go basado en pruebas de carga", "Migró el pago con tarjeta a pagos alojados PCI SAQ-A, con conciliación en servidor de los pedidos huérfanos", "Lidera la integración con el partner de inventario de entradas: sincronización del catálogo, webhooks firmados, checkout con autorización-confirmación-captura y reembolsos tras feature flags"],
    }) },
  { company: "Closevibe", logo: "closevibe", role: t({ en: "Co-founder & CTO", es: "Cofundador y CTO" }), dates: t({ en: "2025 – Present", es: "2025 – Actualidad" }), year: 2025,
    impact: t({ en: "Built a multichannel AI sales and support platform (WhatsApp, Instagram, Messenger, Email) from scratch.", es: "Construyó desde cero una plataforma multicanal de ventas y soporte con IA (WhatsApp, Instagram, Messenger, email)." }),
    details: t({
      en: ["Architected a multi-tenant conversational AI platform for e-commerce sales and customer service", "Designed a RAG-based agent system with intent detection and pgvector semantic search", "Built the stack end to end: Python/FastAPI, React, PostgreSQL, Docker on GCP and Railway"],
      es: ["Diseñó la arquitectura de una plataforma multi-tenant de IA conversacional para ventas y atención al cliente en e-commerce", "Diseñó un sistema de agentes basado en RAG con detección de intención y búsqueda semántica con pgvector", "Construyó el stack completo: Python/FastAPI, React, PostgreSQL, Docker en GCP y Railway"],
    }) },
  { company: "Cashela", logo: "cashela", role: t({ en: "Fractional CTO", es: "CTO fraccional" }), dates: t({ en: "Jan 2025 – Present", es: "Ene 2025 – Actualidad" }), year: 2025,
    impact: t({ en: "Leads the technical turnaround of a cross-border B2B payments platform: architecture, roadmap and engineering standards.", es: "Lidera la reconducción técnica de una plataforma de pagos B2B transfronterizos: arquitectura, hoja de ruta y estándares de ingeniería." }),
    details: t({
      en: ["Audited the platform and built a bilingual technical wiki (architecture, ADRs, runbooks) as the team's source of truth", "Drives the core's migration to a hexagonal architecture behind feature flags, with a flag + test + doc Definition of Done enforced in CI", "Built Payment Links end to end: hosted Next.js checkout, merchant refunds and card, ACH and wire rails, ready for rollout behind feature flags"],
      es: ["Auditó la plataforma y creó una wiki técnica bilingüe (arquitectura, ADR, runbooks) como fuente de verdad del equipo", "Impulsa la migración del núcleo a una arquitectura hexagonal tras feature flags, con una Definition of Done de flag + test + documentación aplicada en CI", "Construyó Payment Links de principio a fin: checkout alojado en Next.js, reembolsos para comercios y rieles de tarjeta, ACH y transferencia, listo para su despliegue tras feature flags"],
    }) },
  { company: "Sttok", logo: "sttok", role: t({ en: "Fractional CTO / External Tech Lead", es: "CTO fraccional / Líder técnico externo" }), dates: t({ en: "Nov 2024 – Feb 2025", es: "Nov 2024 – Feb 2025" }), year: 2024,
    impact: t({ en: "Re-architected the platform and led its AWS migration to support growth from 50K to 250K+ users.", es: "Rediseñó la arquitectura de la plataforma y lideró su migración a AWS para soportar el crecimiento de 50K a 250K+ usuarios." }),
    details: t({
      en: ["Directed the AWS migration: infrastructure, CI/CD, Cognito authentication, VPC networking", "Tuned MongoDB Atlas performance: indexing strategies, ESR rules, Atlas Search", "Set up monitoring, alerting and cost-optimization frameworks"],
      es: ["Dirigió la migración a AWS: infraestructura, CI/CD, autenticación con Cognito, redes VPC", "Optimizó el rendimiento de MongoDB Atlas: estrategias de indexación, reglas ESR, Atlas Search", "Implantó marcos de monitorización, alertas y optimización de costes"],
    }) },
  { company: "CaixaBank Tech", logo: "caixabanktech", role: t({ en: "Senior Technical Lead", es: "Líder técnico sénior" }), dates: t({ en: "Oct 2024 – Present", es: "Oct 2024 – Actualidad" }), year: 2024,
    impact: t({ en: "Leads banking application development with Java, Spring Boot and Kafka microservices and React interfaces.", es: "Lidera el desarrollo de aplicaciones bancarias con microservicios Java, Spring Boot y Kafka e interfaces React." }),
    details: t({
      en: ["Architects Java/Spring Boot microservices in a large event-driven system powered by Kafka", "Leads React interfaces for one of Spain's largest financial institutions", "Runs structured technical interviews for full-stack developer candidates"],
      es: ["Diseña microservicios Java/Spring Boot en un gran sistema orientado a eventos basado en Kafka", "Lidera interfaces React para una de las mayores entidades financieras de España", "Realiza entrevistas técnicas estructuradas a candidatos a desarrollador full stack"],
    }) },
  { company: "FIATC Seguros", logo: "fiatc", role: t({ en: "Fractional CTO / External Tech Lead", es: "CTO fraccional / Líder técnico externo" }), dates: t({ en: "Jan 2023 – Oct 2024", es: "Ene 2023 – Oct 2024" }), year: 2023,
    impact: t({ en: "Led the corporate intranet's migration to Liferay and the modernization roadmap.", es: "Lideró la migración de la intranet corporativa a Liferay y la hoja de ruta de modernización." }),
    details: t({
      en: ["Directed vendor evaluations, technical audits and roadmap planning", "Mentored teams in agile practices, CI/CD automation and DevOps culture", "Aligned technology objectives with C-level stakeholders"],
      es: ["Dirigió evaluaciones de proveedores, auditorías técnicas y la planificación de la hoja de ruta", "Mentorizó a equipos en prácticas ágiles, automatización CI/CD y cultura DevOps", "Alineó los objetivos tecnológicos con la alta dirección"],
    }) },
  { company: "Amaris Consulting", logo: "amaris", role: t({ en: "Full Stack Developer / Project Manager", es: "Desarrollador full stack / Jefe de proyecto" }), dates: t({ en: "May 2021 – Oct 2024", es: "May 2021 – Oct 2024" }), year: 2021, earlier: true,
    impact: t({ en: "Led cross-functional delivery teams building enterprise React and Angular applications.", es: "Lideró equipos multidisciplinares de entrega que construían aplicaciones empresariales en React y Angular." }),
    details: t({
      en: ["Migrated legacy systems to Java, Spring, Angular and React stacks", "Managed planning, budgeting and delivery with Agile/Scrum", "Designed RESTful integrations with third-party services and data platforms"],
      es: ["Migró sistemas heredados a stacks de Java, Spring, Angular y React", "Gestionó la planificación, el presupuesto y la entrega con Agile/Scrum", "Diseñó integraciones RESTful con servicios de terceros y plataformas de datos"],
    }) },
  { company: "Isern Patentes y Marcas", logo: "isern", role: t({ en: "Software Engineer", es: "Ingeniero de software" }), dates: t({ en: "Jul 2018 – May 2021", es: "Jul 2018 – May 2021" }), year: 2018, earlier: true,
    impact: t({ en: "Moved legacy monoliths to AWS and Azure and built IsernTools for the IP sector.", es: "Migró monolitos heredados a AWS y Azure y creó IsernTools para el sector de la propiedad intelectual." }),
    details: t({
      en: ["Rebuilt core applications with Java, Spring Boot, Angular and React", "Built an AI-powered document similarity detector with UPC", "Automated delivery with Jenkins and GitLab CI/CD"],
      es: ["Reconstruyó aplicaciones clave con Java, Spring Boot, Angular y React", "Creó con la UPC un detector de similitud de documentos basado en IA", "Automatizó la entrega con CI/CD en Jenkins y GitLab"],
    }) },
  { company: "Indra", logo: "indra", role: t({ en: "Full Stack Developer", es: "Desarrollador full stack" }), dates: t({ en: "Jul 2016 – Jun 2018", es: "Jul 2016 – Jun 2018" }), year: 2016, earlier: true,
    impact: t({ en: "Built enterprise applications and Hadoop data pipelines for public-sector and financial clients.", es: "Desarrolló aplicaciones empresariales y pipelines de datos en Hadoop para clientes del sector público y financiero." }),
    details: t({
      en: ["Developed the InGRID MDM platform for electrical measurement management in Uruguay", "Implemented big-data pipelines with Hadoop, MapReduce and HBase", "Built REST APIs for data exchange with client systems"],
      es: ["Desarrolló la plataforma MDM InGRID para la gestión de medidas eléctricas en Uruguay", "Implementó pipelines de big data con Hadoop, MapReduce y HBase", "Creó APIs REST para el intercambio de datos con los sistemas de los clientes"],
    }) },
  { company: "Universidad de las Ciencias Informáticas", logo: "uci", role: t({ en: "QA Tester", es: "Tester QA" }), dates: t({ en: "Sep 2014 – Jul 2016", es: "Sep 2014 – Jul 2016" }), year: 2014, earlier: true,
    impact: t({ en: "Automated regression and performance testing with Selenium and JMeter.", es: "Automatizó las pruebas de regresión y de rendimiento con Selenium y JMeter." }),
    details: t({
      en: ["Designed functional test plans and test cases", "Built automated regression suites with Selenium", "Ran performance benchmarks with JMeter"],
      es: ["Diseñó planes y casos de prueba funcionales", "Creó suites de regresión automatizadas con Selenium", "Ejecutó benchmarks de rendimiento con JMeter"],
    }) },
  { company: "Universidad de las Ciencias Informáticas", logo: "uci", role: t({ en: "Software Developer", es: "Desarrollador de software" }), dates: t({ en: "Sep 2012 – Aug 2014", es: "Sep 2012 – Ago 2014" }), year: 2012, earlier: true,
    impact: t({ en: "Built internal web applications in PHP used daily by 200+ staff.", es: "Desarrolló aplicaciones web internas en PHP que usaban a diario 200+ empleados." }),
    details: t({
      en: ["Developed component-management tools within a business framework", "Built web interfaces with PHP, JavaScript and ExtJS"],
      es: ["Desarrolló herramientas de gestión de componentes dentro de un framework empresarial", "Construyó interfaces web con PHP, JavaScript y ExtJS"],
    }) },
];
