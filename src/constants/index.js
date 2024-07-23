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
  myportfolio,
  investanalysis,
  interviewquestions,
  suneidisportfolio,
  tictactoe,  
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
    title: "Full Stack Dev / Project Manager",
    company_name: "Amaris Consulting",
    icon: amaris,
    iconBg: "#E6DEDD",
    date: "May 2021 - Present",
    points: [
      "Designing and developing responsive user interfaces using HTML, CSS, and JavaScript frameworks such as React.js and Angular.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",      
      "Familiarity with containerization technologies like Docker and orchestration tools like Kubernetes.",
      "Leading a team of developers, QAs and designers to deliver high-quality software solutions on time and within budget.",
      "Planning, executing, and managing projects from start to finish.",
    
    ],
  },    
  
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Cesar proved me wrong.",
    name: "Lazaro Campoalegre",
    designation: "EP Manager",
    company: "AiFi Inc",
    linkedin: "https://www.linkedin.com/in/lazarocampoalegre",
    image: "/testimonials/lazaro.jpeg",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Cesar does.",
    name: "Suneidis Vinent",
    designation: "QA Engineer",
    company: "Amaris",
    linkedin: "https://www.linkedin.com/in/svinent",
    image: "/testimonials/suneidis.jpeg",
  },
  {
    testimonial:
      "After Cesar optimized our website, our traffic increased by 50%. We can't thank him enough!",
    name: "Erasmo Garcia",
    designation: "Software Engineer",
    company: "Glofox",
    linkedin: "https://www.linkedin.com/in/erasmogarciaglez",
    image: "/testimonials/erasmo.jpeg",
  },
];

const projects = [
  {
    name: "My Portfolio",
    description:
      "An 3D online portfolio that showcases my skills and experience as a web developer. It includes a brief introduction, a list of my projects, and a contact form.",
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
      "Web application that allows users to analyze the performance of their investments. It includes features like a stock screener, a portfolio tracker, and a news feed.",
    tags: [
      {
        name: "typescript",
        color: "blue-text-gradient",
      },
      {
        name: "tailwind",
        color: "blue-text-gradientt",
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
      "An online portfolio that showcases her skills and experience as a QA Tester. It includes a brief introduction, a list of projects, and a contact form.",
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
      "A simple tic-tac-toe game that allows two players to play against each other. It includes features like a score tracker and a restart button.",
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
      "A web application that helps users prepare for technical interviews. It includes a list of common interview questions, answers, and explanations.",
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
