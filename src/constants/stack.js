// Stack sky chart data (spec 6.12). Icons are react-icons/si export names; null means a text-only star.
// Coordinates live in the chart's viewBox="0 0 1200 620".
export const CONSTELLATIONS = [
  { key: "backend", name: "BACKEND", label: [220, 305], stars: [
    { name: "Java", icon: "SiOpenjdk", x: 100, y: 120 }, { name: "Spring", icon: "SiSpring", x: 190, y: 80 },
    { name: "Node.js", icon: "SiNodedotjs", x: 280, y: 130 }, { name: "Python", icon: "SiPython", x: 350, y: 210 },
    { name: "FastAPI", icon: "SiFastapi", x: 250, y: 240 }, { name: "Kafka", icon: "SiApachekafka", x: 140, y: 220 } ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,4]] },
  { key: "frontend", name: "FRONTEND", label: [595, 270], stars: [
    { name: "React", icon: "SiReact", x: 500, y: 110 }, { name: "Next.js", icon: "SiNextdotjs", x: 600, y: 70 },
    { name: "Angular", icon: "SiAngular", x: 690, y: 140 }, { name: "TypeScript", icon: "SiTypescript", x: 590, y: 200 } ],
    edges: [[0,1],[1,2],[2,3],[3,0]] },
  { key: "cloud", name: "CLOUD & DEVOPS", label: [975, 365], stars: [
    { name: "AWS", icon: "SiAmazonaws", x: 860, y: 100 }, { name: "GCP", icon: "SiGooglecloud", x: 960, y: 70 },
    { name: "Azure", icon: "SiMicrosoftazure", x: 1070, y: 110 }, { name: "Docker", icon: "SiDocker", x: 1110, y: 210 },
    { name: "Kubernetes", icon: "SiKubernetes", x: 1010, y: 250 }, { name: "GitHub Actions", icon: "SiGithubactions", x: 900, y: 300 },
    { name: "Jenkins", icon: "SiJenkins", x: 840, y: 200 } ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]] },
  { key: "data", name: "DATA", label: [240, 590], stars: [
    { name: "PostgreSQL", icon: "SiPostgresql", x: 120, y: 430 }, { name: "MongoDB", icon: "SiMongodb", x: 230, y: 400 },
    { name: "Redis", icon: "SiRedis", x: 340, y: 450 }, { name: "Oracle", icon: "SiOracle", x: 240, y: 520 } ],
    edges: [[0,1],[1,2],[2,3],[3,0]] },
  { key: "ai", name: "AI", label: [720, 590], stars: [
    { name: "RAG", icon: null, x: 600, y: 460 }, { name: "LLM integration", icon: null, x: 730, y: 430 }, { name: "pgvector", icon: null, x: 820, y: 510 } ],
    edges: [[0,1],[1,2]] },
];
export const ALSO_IN_THE_LOG = "Also in the log: Liferay, Hibernate, Maven, GraphQL, Cypress, Jest, JUnit, Selenium, JMeter";
