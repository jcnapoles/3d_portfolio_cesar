import {
  mobile,
  backend,
  creator,
  web,
  javascript,  
  uci,  
  isern,
  indra, 
  spring,
  angular,
  java,
  reactjs, 
  amaris,
  closevibe,
  flyr,
  sttok,
  fiatc,
  caixabanktech,
  myportfolio,
  investanalysis,
  interviewquestions,
  suneidisportfolio,
  tictactoe,
  closevibeweb,  
} from "../assets";


export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "experience",
    title: "Experience",
  },
  {
    id: "skills",
    title: "Skils",
  },
  {
    id: "projects",
    title: "Projects",
  },    
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Software Engineer",
    icon: web,
  },
  {
    title: "Full Stack Developer",
    icon: backend,
  },
  {
    title: "QA Tester",
    icon: mobile,
  },
  {
    title: "Software Analyst",
    icon: creator,
  },  
];

const technologies = [
  {
    name: "JAVA",
    icon: java,
  },  
  {
    name: "JavaScript",
    icon: javascript,
  },
  
  {
    name: "Spring",
    icon: spring,
  }, 
  {
    name: "React JS",
    icon: reactjs,
  }, 
  {
    name: "Angular",
    icon: angular,
  }, 
];

const experiences = [
  {
    title: "Software Developer",
    company_name: "Universidad de las Ciencias Informaticas",
    icon: uci,    
    iconBg: "#E6DEDD",
    date: "Aug 2012 - Sep 2014",
    points: [
      "Developing and maintaining web applications using PHP and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",      
      "Development of tools to manage components (services and dependencies).",
      "Creating database schemas and managing relational databases like MySQL, PostgreSQL.",
    ],
  },
  {
    title: "QA Tester",
    company_name: "Universidad de las Ciencias Informaticas",
    icon: uci,    
    iconBg: "#E6DEDD",
    date: "Sep 2014 - Aug 2016",
    points: [
      "Performing manual testing activities such as functional testing, regression testing, and exploratory testing.",
      "Writing automated test scripts using tools like Selenium WebDriver.",
      "Validating API functionality through techniques like endpoint testing, request and response validation, and data manipulation testing.",
      "Designing and executing performance testing scenarios using tools like JMeter.",
    ],
  },
  {
    title: "Full Stack Developer",
    company_name: "Indra",
    icon: indra,
    iconBg: "#E6DEDD",
    date: "Aug 2016 - Jun 2018",
    points: [
      "Analysis, design, and development of business applications.",
      "Technical and functional consulting.",
      "Writing complex SQL queries to extract insights from structured databases.",
      "Developing data pipelines to ingest, process, and analyze large volumes of data using technologies like Hadoop MapReduce.",
    ],
  }, 
  {
    title: "Software Engineer",
    company_name: "Isern Patentes y Marcas",
    icon: isern,
    iconBg: "#E6DEDD",
    date: "Aug 2018 - May 2021",
    points: [     
      "Experience with cloud platforms like AWS, Azure, and Google Cloud Platform.",
      "Development, maintenance and migration of legacy applications, JAVA, Angular, Spring, React.js",
      "Strong problem-solving abilities and the ability to troubleshoot complex data processing issues.",
      "Experience with continuous integration and continuous deployment (CI/CD) tools like Jenkins and GitLab CI/CD.",
    ],
  },
  {
    title: "Full Stack Dev | Project Manager",
    company_name: "Amaris Consulting",
    icon: amaris,
    iconBg: "#272774",
    date: "May 2021 - Oct 2024",
    points: [
      "Designing and developing responsive user interfaces using HTML, CSS, and JavaScript frameworks such as React.js and Angular.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",      
      "Familiarity with containerization technologies like Docker and orchestration tools like Kubernetes.",
      "Leading a team of developers, QAs and designers to deliver high-quality software solutions on time and within budget.",
      "Planning, executing, and managing projects from start to finish.",
    
    ],
  },
  {
  title: "Fractional CTO / External Tech Lead & Strategic Consultant",
  company_name: "FIATC Seguros",
  icon: fiatc,
  iconBg: "#E6DEDD",
  date: "Jan 2023 - Oct 2024",
  points: [
    "Acted as a fractional CTO for internal digital transformation projects within the insurance sector.",
    "Led the complete redesign and migration of the internal intranet platform to Liferay, replacing a legacy CMS with a scalable and maintainable solution.",
    "Collaborated directly with technical and business stakeholders to align strategic objectives.",
    "Led vendor evaluations, technical audits, and roadmap planning for legacy system evolution.",
    "Mentored internal teams in agile development practices, CI/CD automation, and DevOps culture implementation.",
  ],
},
{
  title: "Lead Engineer & Frontend Architect",
  company_name: "Flyr",
  icon: flyr, 
  iconBg: "#E6DEDD",
  date: "Mar 2023 - Sep 2024",
  points: [
    "Led the frontend architecture for white-label airline applications deployed for FlyArystan, HKExpress, JSX, and PlusUltra.",
    "Defined a modular architecture enabling rapid deployment of new airline apps with shared core components.",
    "Managed integrations with airline reservation systems, disruption management platforms, and multi-channel communication services.",
    "Implemented micro-frontend strategies to decouple deployments across brand-specific UIs.",
    "Achieved a 60% reduction in time-to-market for onboarding new airlines by streamlining development and deployment processes.",
  ],
},
{
  title: "Fractional CTO / External Tech Lead & Strategic Consultant",
  company_name: "Sttok",
  icon: sttok,
  iconBg: "#E6DEDD",
  date: "Nov 2024 - Feb 2025",
  points: [
    "Led strategic technological decisions and architecture redesign for scaling to 250,000+ users.",
    "Directed the complete migration of the infrastructure to AWS, including CI/CD setup, Cognito integration, and secure networking.",
    "Supervised cost estimation and optimization using AWS tools with production-ready budgets and TCO analysis.",
    "Consulted on MongoDB performance tuning: indexing strategies, ESR rule application, and advanced Atlas Search usage.",
    "Defined alerting and monitoring metrics in MongoDB Atlas for performance reliability and predictive diagnostics.",
    "Provided technical leadership and mentoring across cross-functional development teams during migration and scaling phases.",
  ],
},
  
  {
    title: "Senior Technical Lead",
    company_name: "CaixaBank Tech",
    icon: caixabanktech,
    iconBg: "#000000",
    date: "Oct 2024 - Present",
    points: [
      "Designing and developing responsive user interfaces, components and pages using HTML, CSS, and JavaScript frameworks like React.js.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.", 
      "Developing microservices using Java, Spring Boot, and other related technologies.",
      "Creating and maintaining large-scale distributed systems using technologies like Kafka.",    
    
    ],
  },
  
  {
    title: "Founder & CTO",
    company_name: "Closevibe",
    icon: closevibe,
    iconBg: "#E6DEDD",
    date: "Jul 2025 - Present",
    points: [
      "Founder and CTO of Closevibe, a SaaS platform for AI-powered sales and customer support automation across WhatsApp, Instagram, Messenger, and Email.",
      "Led the design and development of the multichannel architecture, integrating trainable conversational assistants and automated lead follow-up.",
      "Implemented custom AI solutions, channel integrations, and cloud deployment to scale to thousands of users.",
      "Responsible for technical vision, product strategy, and building multidisciplinary teams."
    ]
  },
  
];

const testimonials = [
  {
    testimonial:
      "As a fractional CTO, Cesar aligned our tech strategy with the product vision, unblocked key decisions, and raised engineering quality without slowing delivery.",
    name: "Lazaro Campoalegre",
    designation: "EP Manager",
    company: "AiFi Inc",
    linkedin: "https://www.linkedin.com/in/lazarocampoalegre",
    image: "/testimonials/lazaro.jpeg",
  },
  {
    testimonial:
      "Cesar stepped in as a fractional CTO and brought structure to our processes: CI/CD, testing culture, and pragmatic architecture that empowered the team.",
    name: "Suneidis Vinent",
    designation: "QA Engineer",
    company: "Amaris",
    linkedin: "https://www.linkedin.com/in/svinent",
    image: "/testimonials/suneidis.jpeg",
  },
  {
    testimonial:
      "Acting as our fractional CTO, Cesar led our cloud migration and architecture modernization—AWS, security, and performance—enabling faster releases and stability.",
    name: "Erasmo Garcia",
    designation: "CTO",
    company: "Sttok",
    linkedin: "https://www.linkedin.com/in/erasmogarciaglez",
    image: "/testimonials/erasmo.jpeg",
  },
  {
    testimonial:
      "Cesar guided us as a fractional CTO at a critical stage—clarifying the architecture, prioritizing the roadmap, and establishing standards that helped us scale with confidence.",
    name: "Reynier Ortiz Tamayo",
    designation: "COO",
    company: "Cashela",
    linkedin: "https://www.linkedin.com/in/reynier-ortiz-tamayo/",
    image: "/testimonials/reynier.jpeg",
  },
];

const projects = [
  {
    name: "Closevibe",
    description:
  "AI-powered sales and support platform that orchestrates multichannel assistants across WhatsApp, Instagram, Messenger, and Email. Enables training with documents and voice notes, automates follow‑ups, and delivers context‑aware responses to increase conversion at scale.",
    tags: [
      {
        name: "reactjs",
        color: "blue-text-gradient",
      },
      {
        name: "nodejs",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "blue-text-gradient",
      },
      {
        name: "openai",
        color: "pink-text-gradient",
      },
      {
        name: "cloud",
        color: "gray-text-gradient",
      },
    ],
    image: closevibeweb,
    link: "https://www.closevibe.com/",
    source_code_link: "",
  },
  {
    name: "My Portfolio",
    description:
  "Interactive 3D portfolio showcasing selected projects, technical expertise, and experience. Built with performant Three.js/React patterns, responsive UI, and smooth micro‑interactions.",
    tags: [
      {
        name: "three.js",
        color: "black-text-gradient",
      },
      {
        name: "javascript",
        color: "yellow-text-gradient",
      },
      {
        name: "tailwind",
        color: "blue-text-gradient",
      },
    ],
    image: myportfolio,
    link: "https://cesarnapoles.com",
    source_code_link: "https://github.com/jcnapoles/3d_portfolio_cesar",
  },
  {
    name: "Invest Analysis",
    description:
  "Investment analytics web app featuring a stock screener, portfolio tracking, and curated news. Provides data‑driven dashboards, custom filters, and actionable signals for better decisions.",
    tags: [
      {
        name: "typescript",
        color: "blue-text-gradient",
      },
      {
        name: "nodejs",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
  color: "blue-text-gradient",
      },
      {
        name: "nextjs",
        color: "blue-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: investanalysis,
    link: "https://www.investanalysis.site",
    source_code_link: "",
  },
  {
    name: "Suneidis' Portfolio",
    description:
  "Clean, responsive portfolio for a QA Engineer highlighting experience, selected work, and contact. Optimized for performance, accessibility, and maintainability.",
    tags: [
      {
        name: "astro",
        color: "orange-text-gradient",
      },
      {
        name: "javascript",
        color: "yellow-text-gradient",
      },
      {
        name: "tailwind",
        color: "blue-text-gradient",
      },
    ],
    image: suneidisportfolio,
    link: "https://suneidis.com",
    source_code_link: "https://github.com/jcnapoles/suneidis",
  },
  {
    name: "Tic Tac Toe Game",
    description:
  "Lightweight React game demonstrating component composition and state management. Includes score tracking and restart controls with concise, testable logic.",
    tags: [
      {
        name: "css",
        color: "pink-text-gradient",
      },
      {
        name: "javascript",
        color: "yellow-text-gradient",
      },
      {
        name: "react",
        color: "blue-text-gradient",
      },
    ],
    image: tictactoe,
    link: "https://tic-tac-toe.cesarnapoles.com/",
    source_code_link: "https://github.com/jcnapoles/Tic-Tac-Toe",
  },
  {
    name: "Fullstack Questions",
    description:
  "Interview preparation app with curated full‑stack questions, detailed explanations, and references. Designed for efficient study with tagging, filtering, and practical examples.",
    tags: [
      {
        name: "nextjs",
        color: "black-text-gradient",
      },
      {
        name: "typescript",
        color: "blue-text-gradient",
      },
      {
        name: "nodejs",
        color: "green-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: interviewquestions,
    link: "https://fullstack.cesarnapoles.com",
    source_code_link: "https://github.com/jcnapoles/interview-docs",
  },
];

export { services, technologies, experiences, testimonials, projects };
