// 6.8 Process (#process, chapter 04 FLIGHT PLAN). Copy is exactly as written in the spec.
export const STEPS = [
  { n: "01", phase: "LAUNCH", title: "Intro call (30 min)", body: "We talk through your product, your team and the decision that's keeping you up at night. You leave with a clear next step." },
  { n: "02", phase: "PARKING ORBIT", title: "Technical audit", body: "I review your architecture, code, cloud setup, delivery process and vendors, and tell you plainly what's working and what isn't." },
  { n: "03", phase: "TRANSFER BURN", title: "Roadmap", body: "A prioritized plan that ties every technical decision to a business outcome: what to fix now, what to build next, what to leave alone." },
  { n: "04", phase: "ORBIT INSERTION", title: "Execute with your team", body: "I lead architecture, standards and key builds hands-on, alongside your engineers or partners." },
  { n: "05", phase: "STATION KEEPING", title: "Leave you stronger", body: "CI/CD, monitoring, documentation and hiring support, so your team doesn't depend on me." },
];
export const WAYPOINTS = [0, 0.22, 0.48, 0.74, 1];
export const TRANSFER_PATH = "M 80 360 C 260 360, 300 250, 420 230 S 640 170, 760 150 S 1000 90, 1120 80";
